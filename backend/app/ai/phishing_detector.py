from app.ai.models import ThreatIndicator
from typing import Dict, Tuple, List
from app.ai.models import AIAnalysisRequest

def get_classification(probability: int) -> str:
    if probability < 30:
        return "LOW_RISK"
    elif probability < 60:
        return "MEDIUM_RISK"
    elif probability < 85:
        return "HIGH_RISK"
    else:
        return "CRITICAL_RISK"

def detect_phishing(features: Dict, psychology: 'PsychologyResult', intent: 'IntentResult', request: AIAnalysisRequest) -> Tuple[int, List[ThreatIndicator]]:
    probability = 0
    indicators = []
    
    # 1. Intent base score
    if intent.label != "UNKNOWN":
        probability += intent.confidence // 2
        
    # 2. Features score
    if features.get("credential_request"):
        probability += 30
        indicators.append(ThreatIndicator(
            type="CREDENTIAL_REQUEST",
            severity="CRITICAL",
            evidence="Message requests sensitive login credentials."
        ))
    if features.get("otp_request"):
        probability += 35
        indicators.append(ThreatIndicator(
            type="OTP_REQUEST",
            severity="CRITICAL",
            evidence="Message requests a one-time password or verification code."
        ))
    if features.get("payment_request"):
        probability += 25
        indicators.append(ThreatIndicator(
            type="PAYMENT_REQUEST",
            severity="HIGH",
            evidence="Message requests a payment or financial transfer."
        ))
    if features.get("account_verification"):
        probability += 20
        indicators.append(ThreatIndicator(
            type="ACCOUNT_VERIFICATION",
            severity="HIGH",
            evidence="Message urges the recipient to verify or validate their account."
        ))
        
    # 3. Psychology score
    if psychology.urgency > 70:
        probability += 20
        indicators.append(ThreatIndicator(
            type="URGENCY",
            severity="HIGH",
            evidence=f"High urgency detected (score: {psychology.urgency}). Creates immediate time pressure."
        ))
    if psychology.fear > 70:
        probability += 20
        indicators.append(ThreatIndicator(
            type="FEAR",
            severity="HIGH",
            evidence=f"High fear/threat language detected (score: {psychology.fear})."
        ))
    if psychology.manipulation > 80:
        probability += 15
        
    # 4. External Signals (URLs and Attachments)
    for url in request.urls:
        if url.reputation == "suspicious" or url.lookalike:
            probability += 30
            indicators.append(ThreatIndicator(
                type="SUSPICIOUS_URL",
                severity="CRITICAL",
                evidence=f"Suspicious lookalike or malicious URL detected: {url.url}"
            ))
            
    for att in request.attachments:
        if att.dangerous:
            probability += 40
            indicators.append(ThreatIndicator(
                type="DANGEROUS_ATTACHMENT",
                severity="CRITICAL",
                evidence=f"Dangerous attachment detected: {att.filename}"
            ))
            
    if features.get("brand_reference"):
        if probability > 40:
            probability += 15
            indicators.append(ThreatIndicator(
                type="POSSIBLE_BRAND_IMPERSONATION",
                severity="MEDIUM",
                evidence="Message claims to be from a known brand while exhibiting phishing indicators."
            ))

    probability = min(100, max(0, probability))
    
    return probability, indicators
