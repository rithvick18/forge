from typing import List, Dict, Optional
from langchain_core.messages import SystemMessage, HumanMessage, AIMessage, ToolMessage
from langchain_mistralai import ChatMistralAI
from langchain.tools import tool
import json

from app.core.config import settings
from app.services.ingestion.google_trends import google_trends_service
from app.services.llm.agent import fmcg_agent
from app.utils.logger import logger

@tool
async def fetch_trends(category: str, geo: str = "IN", timeframe: str = "today 3-m") -> str:
    """
    Fetch current Google Trends data for a specific FMCG category in India.
    Categories include: personal care, packaged food, beverages, snacks, etc.
    Returns a JSON string of trend results.
    """
    try:
        trends = await google_trends_service.get_full_trend_profile([category], category, geo, timeframe)
        return json.dumps(trends, default=str)
    except Exception as e:
        return f"Error fetching trends: {str(e)}"

@tool
async def get_trending_searches(geo: str = "IN") -> str:
    """
    Fetch today's top trending searches on Google for a specific region.
    Useful for answering 'What's trending today?' or 'What are people searching for in India?'.
    Returns a JSON string of trending searches.
    """
    try:
        trends = await google_trends_service.get_daily_trending()
        return json.dumps(trends, default=str)
    except Exception as e:
        return f"Error fetching trending searches: {str(e)}"

@tool
async def generate_market_insight(category: str, focus: str = "overall") -> str:
    """
    Generate an AI-powered market insight brief for a specific category.
    Useful for answering 'What are the insights for beverages?' or 'Show me analysis for snacks'.
    """
    try:
        trends = await google_trends_service.get_full_trend_profile([category], category, "IN", "today 3-m")
        insight = await fmcg_agent.generate_insight(trends, category, focus)
        return json.dumps(insight, default=str)
    except Exception as e:
        return f"Error generating insight: {str(e)}"

@tool
def get_platform_info() -> str:
    """
    Returns information about what this platform (Forge) can do.
    Use this when the user asks about the website features or how to use the tool.
    """
    return (
        "Forge is an AI-powered FMCG Consumer Intelligence Platform for the Indian market. "
        "Key features include:\n"
        "1. Market Overview: Real-time dashboard with market share and SKU health.\n"
        "2. Competitor Intel: Track Google Trends for any keyword in India.\n"
        "3. AI Insights: Deep-dive briefs on consumer behavior changes.\n"
        "4. Product Metrics: AI-driven product innovation recommendations.\n"
        "5. Copilot: That's me! I can fetch data and answer questions."
    )

class CopilotAgent:
    def __init__(self):
        if not settings.MISTRAL_API_KEY:
            logger.warning("MISTRAL_API_KEY not set — Copilot will be functionally limited")
            self.llm = None
        else:
            self.llm = ChatMistralAI(
                model="mistral-large-latest",
                api_key=settings.MISTRAL_API_KEY,
                temperature=0.4
            )
        
        self.tools = {
            "fetch_trends": fetch_trends,
            "get_trending_searches": get_trending_searches,
            "generate_market_insight": generate_market_insight,
            "get_platform_info": get_platform_info
        }
        
        if self.llm:
            self.llm_with_tools = self.llm.bind_tools(list(self.tools.values()))

    async def chat(self, user_input: str, history: List[Dict[str, str]] = None) -> str:
        if not self.llm:
            return "I'm sorry, my Mistral AI brain is not configured (missing API key)."
        
        # Build prompt messages with explicit classes
        messages = [
            SystemMessage(content="You are the Forge Copilot, a helpful AI assistant for the Forge FMCG Intelligence Platform. "
                                 "You help users navigate the site, understand data, and perform market analysis tasks. "
                                 "Always be concise, professional, and helpful. "
                                 "You have access to tools to fetch real-time trend data and AI insights. "
                                 "If a user asks about the site, use the get_platform_info tool.")
        ]
        
        # Add history
        if history:
            for msg in history:
                if msg["role"] == "user":
                    messages.append(HumanMessage(content=msg["content"]))
                else:
                    messages.append(AIMessage(content=msg["content"]))
        
        # Add current input
        messages.append(HumanMessage(content=user_input))
        
        try:
            # First LLM call
            response = await self.llm_with_tools.ainvoke(messages)
            
            # Follow-up with tool results if needed
            if response.tool_calls:
                messages.append(response)
                for tool_call in response.tool_calls:
                    tool_name = tool_call["name"].lower()
                    tool_id = tool_call.get("id")
                    
                    if tool_name in self.tools and tool_id:
                        tool_func = self.tools[tool_name]
                        result = await tool_func.ainvoke(tool_call["args"])
                        messages.append(ToolMessage(content=str(result), tool_call_id=tool_id))
                
                # Final LLM call
                response = await self.llm_with_tools.ainvoke(messages)
            
            return str(response.content)
            
        except Exception as e:
            logger.error(f"Copilot chat error: {e}")
            return f"I encountered an error while thinking: {str(e)}"

copilot_agent = CopilotAgent()
