from fastapi import APIRouter, HTTPException
from app.ai.models import AIAnalysisRequest, AIAnalysisResponse
from app.ai.analyzer import EmailThreatAnalyzer
import logging

router = APIRouter()
logger = logging.getLogger(__name__)

analyzer = EmailThreatAnalyzer()

@router.post("/analyze", response_model=AIAnalysisResponse)
async def analyze_email(request: AIAnalysisRequest):
    try:
        response = analyzer.analyze(request)
        return response
    except Exception as e:
        logger.error(f"Error during AI analysis: {str(e)}")
        raise HTTPException(status_code=500, detail="Internal Server Error during AI analysis")
