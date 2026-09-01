from app.ai.models import AIAnalysisRequest, AIAnalysisResponse
from app.ai.preprocessing import preprocess_email
from app.ai.feature_extractor import extract_features
from app.ai.psychology_detector import analyze_psychology
from app.ai.intent_detector import detect_intent
from app.ai.phishing_detector import detect_phishing, get_classification
from app.ai.explainability import generate_explanation
import logging

logger = logging.getLogger(__name__)

class EmailThreatAnalyzer:
    def __init__(self):
        # We can initialize ML models or external services here if needed
        pass
        
    def analyze(self, request: AIAnalysisRequest) -> AIAnalysisResponse:
        logger.info("AI analysis started")
        
        # 1. Preprocess
        preprocessed_data = preprocess_email(request.subject, request.body)
        logger.info("AI preprocessing completed")
        
        # 2. Extract Features
        features = extract_features(request.subject, request.body, preprocessed_data)
        
        # 3. Detect Psychology
        psychology = analyze_psychology(preprocessed_data, features)
        logger.info("Psychological analysis completed")
        
        # 4. Detect Intent
        intent = detect_intent(features, preprocessed_data)
        logger.info("Intent detection completed")
        
        # 5. Phishing Detection
        phishing_probability, indicators = detect_phishing(features, psychology, intent, request)
        classification = get_classification(phishing_probability)
        logger.info("Phishing classification completed")
        
        # 6. Explanation Generation
        explanation = generate_explanation(classification, intent.label, psychology, indicators)
        
        evidence = []
        for ind in indicators:
            evidence.append(ind.evidence)
        for e in intent.evidence:
            if e not in evidence:
                evidence.append(e)
                
        logger.info("AI analysis completed")
        
        return AIAnalysisResponse(
            phishing_probability=phishing_probability,
            classification=classification,
            confidence=phishing_probability,  # Using probability as proxy for confidence for now
            intent=intent,
            psychology=psychology,
            indicators=indicators,
            suspicious_requests=[], # Could be populated with specific indicators if needed
            explanation=explanation,
            evidence=evidence
        )
