"""
Google Trends ingestion service using pytrends.
Fetches interest-over-time, regional breakdown, and related queries
for FMCG keywords in the Indian market.
"""

import asyncio
from typing import List, Dict, Optional, Tuple
import pandas as pd
from datetime import datetime
import urllib3.util.retry

# ── Monkeypatch for pytrends compatibility ────────────────────────────────────
# Newer urllib3 versions renamed method_whitelist to allowed_methods,
# but pytrends 4.9.2 still expects method_whitelist in the Retry constructor.
_original_retry_init = urllib3.util.retry.Retry.__init__

def _patched_retry_init(self, *args, **kwargs):
    if "method_whitelist" in kwargs:
        kwargs["allowed_methods"] = kwargs.pop("method_whitelist")
    _original_retry_init(self, *args, **kwargs)

urllib3.util.retry.Retry.__init__ = _patched_retry_init

from pytrends.request import TrendReq
from app.core.config import settings
from app.utils.logger import logger
from app.services.ingestion.scraper import scraper as trend_scraper


class GoogleTrendsService:
    """Wrapper around pytrends for async-friendly FMCG trend collection."""

    def __init__(self):
        # pytrends is synchronous — we run it in a thread pool
        self.geo = settings.PYTRENDS_GEO
        self.language = settings.PYTRENDS_LANGUAGE
        self.timeframe = settings.PYTRENDS_TIMEFRAME

    def _build_pytrends(self) -> TrendReq:
        return TrendReq(
            hl=self.language,
            tz=330,            # IST offset in minutes
            retries=3,
            backoff_factor=0.5,
        )

    # ── Core fetch (sync, called via run_in_executor) ───────────────────────

    def _fetch_interest_over_time(
        self,
        keywords: List[str],
        geo: str,
        timeframe: str,
    ) -> pd.DataFrame:
        pt = self._build_pytrends()
        pt.build_payload(keywords, cat=0, timeframe=timeframe, geo=geo)
        df = pt.interest_over_time()
        if "isPartial" in df.columns:
            df = df.drop(columns=["isPartial"])
        return df

    def _fetch_regional_breakdown(
        self,
        keywords: List[str],
        geo: str,
        timeframe: str,
        resolution: str = "REGION",
    ) -> pd.DataFrame:
        pt = self._build_pytrends()
        pt.build_payload(keywords, cat=0, timeframe=timeframe, geo=geo)
        return pt.interest_by_region(resolution=resolution, inc_low_vol=True)

    def _fetch_related_queries(
        self,
        keywords: List[str],
        geo: str,
        timeframe: str,
    ) -> Dict:
        pt = self._build_pytrends()
        pt.build_payload(keywords, cat=0, timeframe=timeframe, geo=geo)
        return pt.related_queries()

    def _fetch_suggestions(self, keyword: str) -> List[Dict]:
        pt = self._build_pytrends()
        return pt.suggestions(keyword)

    # ── Async public API ─────────────────────────────────────────────────────

    async def get_interest_over_time(
        self,
        keywords: List[str],
        geo: Optional[str] = None,
        timeframe: Optional[str] = None,
    ) -> pd.DataFrame:
        """Returns a DataFrame with dates as index, keywords as columns (0–100 scores)."""
        loop = asyncio.get_event_loop()
        return await loop.run_in_executor(
            None,
            self._fetch_interest_over_time,
            keywords,
            geo or self.geo,
            timeframe or self.timeframe,
        )

    async def get_regional_breakdown(
        self,
        keywords: List[str],
        geo: Optional[str] = None,
        timeframe: Optional[str] = None,
    ) -> pd.DataFrame:
        loop = asyncio.get_event_loop()
        return await loop.run_in_executor(
            None,
            self._fetch_regional_breakdown,
            keywords,
            geo or self.geo,
            timeframe or self.timeframe,
        )

    async def get_related_queries(
        self,
        keywords: List[str],
        geo: Optional[str] = None,
        timeframe: Optional[str] = None,
    ) -> Dict:
        loop = asyncio.get_event_loop()
        return await loop.run_in_executor(
            None,
            self._fetch_related_queries,
            keywords,
            geo or self.geo,
            timeframe or self.timeframe,
        )

    async def get_full_trend_profile(
        self,
        keywords: List[str],
        category: str,
        geo: Optional[str] = None,
        timeframe: Optional[str] = None,
    ) -> List[Dict]:
        """
        Returns a list of enriched trend dicts ready to be stored in DB.
        One dict per keyword.
        """
        _geo = geo or self.geo
        _tf = timeframe or self.timeframe

        try:
            iot_df = await self.get_interest_over_time(keywords, _geo, _tf)
        except Exception as e:
            logger.error(f"pytrends interest_over_time failed: {e}. Falling back to scraper.")
            # Fallback to scraper for basic keyword info
            scraper_results = []
            for kw in keywords:
                info = await trend_scraper.scrape_keyword_info(kw)
                scraper_results.append({
                    "keyword": kw,
                    "category": category,
                    "geo": _geo,
                    "interest_score": info["interest_score"],
                    "status": info["status"],
                    "related_queries": info["related_queries"],
                    "regional_breakdown": info["regional_breakdown"],
                    "timeframe": _tf,
                    "raw_data": {"timeseries": []},
                    "fetched_at": info["fetched_at"]
                })
            return scraper_results

        try:
            regional_df = await self.get_regional_breakdown(keywords, _geo, _tf)
        except Exception as e:
            logger.warning(f"Regional breakdown failed: {e}")
            regional_df = pd.DataFrame()

        try:
            related = await self.get_related_queries(keywords, _geo, _tf)
        except Exception as e:
            logger.warning(f"Related queries failed: {e}")
            related = {}

        results = []
        for kw in keywords:
            if kw not in iot_df.columns:
                continue

            series = iot_df[kw]
            current_score = float(series.iloc[-1]) if len(series) > 0 else 0.0
            prev_score = float(series.iloc[-4]) if len(series) >= 4 else current_score

            status = _compute_status(current_score, prev_score)

            # Regional scores for this keyword
            regional = {}
            if not regional_df.empty and kw in regional_df.columns:
                regional = {
                    str(idx): float(val)
                    for idx, val in regional_df[kw].items()
                    if val > 0
                }

            # Related queries
            kw_related = []
            if kw in related:
                for q_type in ("top", "rising"):
                    df_q = related[kw].get(q_type)
                    if df_q is not None and not df_q.empty:
                        for _, row in df_q.iterrows():
                            kw_related.append({
                                "query": row.get("query", ""),
                                "value": int(row.get("value", 0)),
                                "query_type": q_type,
                            })

            # Timeseries for storage
            timeseries = [
                {"date": str(ts.date()), "value": float(v)}
                for ts, v in series.items()
            ]

            results.append({
                "keyword": kw,
                "category": category,
                "geo": _geo,
                "interest_score": current_score,
                "status": status,
                "related_queries": kw_related,
                "regional_breakdown": regional,
                "timeframe": _tf,
                "raw_data": {"timeseries": timeseries},
                "fetched_at": datetime.utcnow().isoformat(),
            })

        return results

    async def get_daily_trending(self) -> List[Dict]:
        """Fetch daily trending searches for the Indian market."""
        return await trend_scraper.get_daily_trends()


def _compute_status(current: float, prev: float) -> str:
    """Simple heuristic: compare last value to 4 periods ago."""
    if current == 0 and prev == 0:
        return "stable"
    if prev == 0:
        return "emerging"
    delta = (current - prev) / max(prev, 1) * 100
    if delta >= 20:
        return "rising"
    if delta <= -20:
        return "falling"
    if current < 10:
        return "emerging"
    return "stable"


# Singleton
google_trends_service = GoogleTrendsService()
