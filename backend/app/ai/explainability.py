from typing import List
from app.ai.models import ThreatIndicator

def generate_explanation(classification: str, intent_label: str, psychology: 'PsychologyResult', indicators: List[ThreatIndicator]) -> str:
    if classification == "LOW_RISK":
        return "This email appears to be benign with no significant threat indicators detected."
    
    explanation_parts = []
    
    if classification in ["HIGH_RISK", "CRITICAL_RISK"]:
        explanation_parts.append(f"This email is classified as {classification.lower().replace('_', ' ')}.")
    else:
        explanation_parts.append(f"This email shows some suspicious traits.")
        
    if psychology.urgency > 70 or psychology.fear > 70:
        manipulations = []
        if psychology.urgency > 70: manipulations.append("extreme time pressure")
        if psychology.fear > 70: manipulations.append("fear")
        explanation_parts.append(f"The attacker is using {' and '.join(manipulations)} to force immediate action.")
        
    if intent_label == "CREDENTIAL_THEFT":
        explanation_parts.append("The primary intent appears to be credential theft.")
    elif intent_label == "FINANCIAL_FRAUD":
        explanation_parts.append("The primary intent appears to be financial fraud.")
    elif intent_label == "BUSINESS_EMAIL_COMPROMISE":
        explanation_parts.append("This is likely a Business Email Compromise (BEC) attempt impersonating an authority figure.")
        
    if any(ind.type == "CREDENTIAL_REQUEST" for ind in indicators):
        explanation_parts.append("It explicitly requests sensitive credentials.")
    if any(ind.type == "OTP_REQUEST" for ind in indicators):
        explanation_parts.append("It requests an OTP or verification code, which is highly suspicious.")
        
    return " ".join(explanation_parts)
