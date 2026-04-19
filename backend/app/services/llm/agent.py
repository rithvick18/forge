"""
LLM Agent layer using LangChain + Google Gemini.
Generates:
  - Consumer insight briefs from trend data
  - Product innovation recommendations for Indian FMCG market
"""

from typing import List, Dict, Optional
from langchain_mistralai import ChatMistralAI
from langchain_google_genai import ChatGoogleGenerativeAI
from langchain_core.prompts import ChatPromptTemplate
from langchain_core.output_parsers import PydanticOutputParser
from pydantic import BaseModel, Field
import json

from app.core.config import settings
from app.utils.logger import logger


# ── Output schemas ────────────────────────────────────────────────────────────

class InsightOutput(BaseModel):
    title: str = Field(description="Concise insight title")
    summary: str = Field(description="2-3 sentence executive summary")
    llm_analysis: str = Field(description="Detailed analysis paragraph")
    recommended_actions: List[str] = Field(description="3-5 actionable recommendations for FMCG brands")
    confidence_score: float = Field(description="Confidence in this insight, 0.0 to 1.0")


class ProductOutput(BaseModel):
    name: str = Field(description="Product concept name")
    description: str = Field(description="Product description")
    target_region: str = Field(description="Target Indian region or 'Pan India'")
    target_demographic: str = Field(description="Target consumer demographic")
    opportunity_score: float = Field(description="Market opportunity score 0-100")
    llm_rationale: str = Field(description="Why this product will succeed in the Indian market")
    price_range: str = Field(description="Suggested retail price range in INR")
    trend_basis: List[str] = Field(description="Keywords/trends that support this recommendation")


# ── Prompts ───────────────────────────────────────────────────────────────────

INSIGHT_SYSTEM = """You are a senior FMCG market intelligence analyst specializing in Indian consumer behavior.
You analyze Google Trends data to extract actionable insights for FMCG companies operating in India.
Always ground your analysis in the actual trend data provided. Be specific about regional differences,
cultural nuances, and seasonal patterns relevant to the Indian market.
{format_instructions}"""

INSIGHT_HUMAN = """Analyze the following Google Trends data for the {category} category in India:

Trend Data:
{trend_data}

Focus area: {focus}

Generate a comprehensive market insight."""


PRODUCT_SYSTEM = """You are a product innovation strategist for FMCG companies targeting Indian consumers.
You identify white-space opportunities and recommend product innovations based on emerging consumer trends.
Consider factors like: price sensitivity across income segments, regional taste preferences,
rural vs urban differences, local ingredients, Indian festivals/occasions, and vernacular naming.
{format_instructions}"""

PRODUCT_HUMAN = """Based on the following emerging consumer trends in the {category} category in India:

Trend Signals:
{trend_signals}

Target Region: {region}

Recommend {top_n} innovative product concepts that FMCG companies should develop."""

# ── Agent class ───────────────────────────────────────────────────────────────

class FMCGIntelAgent:
    """LLM Agent layer using Mistral AI or Google Gemini."""

    def __init__(self):
        self._mistral_llm = None
        self._gemini_llm = None
        self._initialize_models()

    def _initialize_models(self):
        if settings.MISTRAL_API_KEY:
            self._mistral_llm = ChatMistralAI(
                model="mistral-large-latest",
                api_key=settings.MISTRAL_API_KEY,
                temperature=0.3,
            )
        
        if settings.GOOGLE_API_KEY:
            self._gemini_llm = ChatGoogleGenerativeAI(
                model="gemini-1.5-flash",
                google_api_key=settings.GOOGLE_API_KEY,
                temperature=0.3,
            )

    def _get_llm(self, model_name: str = "mistral"):
        if model_name == "gemini" and self._gemini_llm:
            return self._gemini_llm
        if self._mistral_llm:
            return self._mistral_llm
        
        if self._gemini_llm: # fallback
            return self._gemini_llm

        raise RuntimeError("No LLM configured. Check API keys in .env")

    async def generate_insight(
        self,
        trends: List[Dict],
        category: str,
        focus: Optional[str] = None,
        model_name: str = "mistral",
    ) -> Dict:
        """Generate a market insight brief from trend data."""
        llm = self._get_llm(model_name)
        parser = PydanticOutputParser(pydantic_object=InsightOutput)

        prompt = ChatPromptTemplate.from_messages([
            ("system", INSIGHT_SYSTEM),
            ("human", INSIGHT_HUMAN),
        ])

        # Format trend data concisely
        trend_summary = _format_trends_for_llm(trends)

        chain = prompt | llm | parser

        try:
            result = await chain.ainvoke({
                "category": category,
                "trend_data": trend_summary,
                "focus": focus or "overall Indian consumer behavior",
                "format_instructions": parser.get_format_instructions(),
            })
            return result.dict()
        except Exception as e:
            logger.error(f"Insight generation failed: {e}")
            return _fallback_insight(category)

    async def generate_product_recommendations(
        self,
        trends: List[Dict],
        category: str,
        region: Optional[str] = None,
        top_n: int = 5,
        model_name: str = "mistral",
    ) -> List[Dict]:
        """Generate product innovation recommendations."""
        llm = self._get_llm(model_name)

        # For multiple outputs, we request JSON array
        system_prompt = f"""You are a product innovation strategist for Indian FMCG companies.
Respond ONLY with a valid JSON array of {top_n} product objects. No markdown, no preamble.
Each object must have exactly these fields:
name, description, target_region, target_demographic,
opportunity_score (0-100 float), llm_rationale, price_range (INR), trend_basis (array of strings)"""

        user_prompt = f"""Emerging consumer trends in {category} category in India:

{_format_trends_for_llm(trends)}

Target region: {region or "Pan India"}

Generate {top_n} innovative FMCG product concepts. Return only the JSON array."""

        try:
            response = await llm.ainvoke([
                ("system", system_prompt),
                ("human", user_prompt),
            ])
            text = response.content.strip()
            # Strip markdown fences if present
            if text.startswith("```"):
                text = text.split("```")[1]
                if text.startswith("json"):
                    text = text[4:]
            products = json.loads(text)
            return products if isinstance(products, list) else []
        except Exception as e:
            logger.error(f"Product recommendation failed: {e}")
            return []


# ── Helpers ───────────────────────────────────────────────────────────────────

def _format_trends_for_llm(trends: List[Dict]) -> str:
    lines = []
    for t in trends:
        lines.append(
            f"• {t['keyword']} — score: {t['interest_score']}/100, "
            f"status: {t['status']}, "
            f"top regions: {_top_regions(t.get('regional_breakdown', {}))}"
        )
        rq = t.get("related_queries", [])[:3]
        if rq:
            lines.append(f"  Related: {', '.join(q['query'] for q in rq)}")
    return "\n".join(lines) if lines else "No trend data available."


def _top_regions(regional: Dict, n: int = 3) -> str:
    if not regional:
        return "N/A"
    top = sorted(regional.items(), key=lambda x: x[1], reverse=True)[:n]
    return ", ".join(f"{r}({v:.0f})" for r, v in top)


def _fallback_insight(category: str) -> Dict:
    return {
        "title": f"Trend Analysis: {category.title()} Category",
        "summary": "LLM analysis unavailable. Please check API key configuration.",
        "llm_analysis": "",
        "recommended_actions": [],
        "confidence_score": 0.0,
    }


fmcg_agent = FMCGIntelAgent()
