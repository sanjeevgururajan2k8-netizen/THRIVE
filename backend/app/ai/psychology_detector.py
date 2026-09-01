import re
from app.ai.models import PsychologyResult

def calculate_score(text: str, keywords: list[str], base_score: int, multiplier: int) -> int:
    text_lower = text.lower()
    matches = sum(1 for kw in keywords if re.search(r'\b' + re.escape(kw) + r'\b', text_lower))
    score = base_score + (matches * multiplier)
    return min(100, max(0, score))

def analyze_psychology(preprocessed_data: dict, features: dict) -> PsychologyResult:
    text = preprocessed_data["normalized"]
    
    # Keyword sets
    fear_kws = ["suspended", "terminate", "delete", "lost", "fraud", "unauthorized", "stolen", "breach", "locked", "compromised", "risk", "warning", "illegal"]
    urgency_kws = ["urgent", "immediately", "asap", "now", "within 24 hours", "24 hours", "action required", "final notice", "hurry", "quick", "deadline", "minutes"]
    authority_kws = ["admin", "administrator", "ceo", "it department", "security team", "support", "hr", "manager", "director", "police", "law enforcement", "legal"]
    greed_kws = ["winner", "won", "prize", "lottery", "cash", "free", "gift", "bonus", "reward", "inheritance", "million", "claim"]
    
    # Calculate base scores from keywords
    fear = calculate_score(text, fear_kws, 0, 25)
    urgency = calculate_score(text, urgency_kws, 0, 30)
    authority = calculate_score(text, authority_kws, 0, 20)
    greed = calculate_score(text, greed_kws, 0, 25)
    
    # Adjust scores based on general text features
    if features.get("uppercase_pressure"):
        urgency += 15
        fear += 10
    if features.get("excessive_punctuation"):
        urgency += 10
        panic = min(100, fear + urgency // 2)
    else:
        panic = min(100, (fear + urgency) // 2)
    
    # Manipulation score is a combination of these pressures
    manipulation = min(100, int((fear + urgency + authority + greed) / 2))
    if features.get("suspicious_call_to_action"):
        manipulation += 15
        
    return PsychologyResult(
        fear=min(100, max(0, fear)),
        urgency=min(100, max(0, urgency)),
        authority=min(100, max(0, authority)),
        greed=min(100, max(0, greed)),
        panic=min(100, max(0, panic)),
        manipulation=min(100, max(0, manipulation))
    )
