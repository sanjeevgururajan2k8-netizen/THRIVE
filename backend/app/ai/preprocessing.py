import re

def normalize_text(text: str) -> str:
    """Normalize whitespace and remove excessive newlines."""
    if not text:
        return ""
    text = re.sub(r'\s+', ' ', text)
    return text.strip()

def detect_uppercase_pressure(text: str) -> float:
    """Detect ratio of uppercase words to total words (naive metric)."""
    words = text.split()
    if not words:
        return 0.0
    upper_words = [w for w in words if w.isupper() and len(w) > 2]
    return min(1.0, len(upper_words) / (len(words) + 1e-5))

def detect_excessive_punctuation(text: str) -> bool:
    """Detect if there are repeated exclamation/question marks."""
    return bool(re.search(r'[!?:;]{3,}', text))

def extract_meaningful_tokens(text: str) -> list[str]:
    """Extract alphabetic words (lowercased)."""
    text = normalize_text(text)
    words = re.findall(r'\b[a-zA-Z]+\b', text)
    return [w.lower() for w in words]

def preprocess_email(subject: str, body: str):
    """
    Combines text and computes baseline stats that don't destroy risk signals.
    """
    combined = f"{subject} {body}"
    return {
        "raw_combined": combined,
        "normalized": normalize_text(combined),
        "tokens": extract_meaningful_tokens(combined),
        "has_uppercase_pressure": detect_uppercase_pressure(combined) > 0.1,
        "has_excessive_punctuation": detect_excessive_punctuation(combined),
        "body_length": len(body),
        "subject_length": len(subject)
    }
