from app.ai.models import IntentResult
from typing import Dict, List

def detect_intent(features: Dict, preprocessed_data: Dict) -> IntentResult:
    intents = {
        "CREDENTIAL_THEFT": 0,
        "FINANCIAL_FRAUD": 0,
        "MALWARE_DELIVERY": 0,
        "BUSINESS_EMAIL_COMPROMISE": 0,
        "ACCOUNT_VERIFICATION": 0,
        "UNKNOWN": 0
    }
    evidence = []
    
    if features.get("credential_request") or features.get("login_language"):
        intents["CREDENTIAL_THEFT"] += 60
        evidence.append("Requests password or login credentials.")
    if features.get("otp_request"):
        intents["CREDENTIAL_THEFT"] += 40
        evidence.append("Requests one-time password (OTP) or security code.")
        
    if features.get("payment_request") or features.get("financial_language"):
        intents["FINANCIAL_FRAUD"] += 70
        evidence.append("Contains requests for payment, wire transfer, or financial information.")
        
    if features.get("account_verification"):
        intents["ACCOUNT_VERIFICATION"] += 80
        evidence.append("Asks to verify or validate account details.")
        intents["CREDENTIAL_THEFT"] += 30
        
    text = preprocessed_data["normalized"].lower()
    
    if "ceo" in text or "hr" in text or "administrator" in text:
        if features.get("payment_request") or features.get("urgency_language"):
            intents["BUSINESS_EMAIL_COMPROMISE"] += 75
            evidence.append("Impersonates authority figure while creating urgency or requesting funds.")

    if not evidence:
        intents["UNKNOWN"] = 100
        evidence.append("No clear malicious intent detected from text.")

    # Find highest intent
    max_intent = max(intents, key=intents.get)
    confidence = min(100, intents[max_intent])
    
    # Normalizing confidence for UNKNOWN
    if max_intent == "UNKNOWN":
        confidence = 50

    return IntentResult(
        label=max_intent,
        confidence=confidence,
        evidence=evidence
    )
