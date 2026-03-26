"""
Time-series forecasting using Facebook Prophet.
Predicts future consumer interest scores from historical Google Trends data.
"""

from typing import List, Dict, Optional
import pandas as pd
from prophet import Prophet

from app.utils.logger import logger


class ForecastService:

    def forecast_trend(
        self,
        timeseries: List[Dict],   # [{"date": "2024-01-01", "value": 72.3}, ...]
        keyword: str,
        periods: int = 12,        # weeks ahead
        freq: str = "W",          # "W" weekly, "M" monthly
    ) -> Dict:
        """
        Run Prophet forecast on a keyword's timeseries.
        Returns dict with forecast list and MAE.
        """
        if len(timeseries) < 10:
            logger.warning(f"Not enough data to forecast '{keyword}' ({len(timeseries)} points)")
            return _empty_forecast(keyword)

        try:
            df = pd.DataFrame(timeseries)
            df["ds"] = pd.to_datetime(df["date"])
            df["y"] = df["value"].astype(float)
            df = df[["ds", "y"]].dropna()

            model = Prophet(
                yearly_seasonality=True,
                weekly_seasonality=False,
                daily_seasonality=False,
                changepoint_prior_scale=0.05,
                seasonality_prior_scale=10.0,
                interval_width=0.80,
            )
            model.fit(df)

            future = model.make_future_dataframe(periods=periods, freq=freq)
            forecast = model.predict(future)

            # Only return the future portion
            future_forecast = forecast[forecast["ds"] > df["ds"].max()]

            result = []
            for _, row in future_forecast.iterrows():
                result.append({
                    "date": str(row["ds"].date()),
                    "yhat": round(float(row["yhat"]), 2),
                    "yhat_lower": round(float(row["yhat_lower"]), 2),
                    "yhat_upper": round(float(row["yhat_upper"]), 2),
                })

            # Simple MAE on in-sample
            in_sample = forecast[forecast["ds"].isin(df["ds"])]
            mae = float((df["y"].values - in_sample["yhat"].values[:len(df)]).__abs__().mean())

            return {
                "keyword": keyword,
                "forecast": result,
                "model_used": "prophet",
                "mae": round(mae, 3),
            }

        except Exception as e:
            logger.error(f"Prophet forecast failed for '{keyword}': {e}")
            return _empty_forecast(keyword)

    def batch_forecast(
        self,
        trends_data: List[Dict],  # [{"keyword": str, "timeseries": [...]}]
        periods: int = 12,
    ) -> List[Dict]:
        results = []
        for item in trends_data:
            result = self.forecast_trend(
                timeseries=item.get("timeseries", []),
                keyword=item["keyword"],
                periods=periods,
            )
            result["category"] = item.get("category")
            results.append(result)
        return results


def _empty_forecast(keyword: str) -> Dict:
    return {
        "keyword": keyword,
        "forecast": [],
        "model_used": "prophet",
        "mae": None,
    }


forecast_service = ForecastService()
