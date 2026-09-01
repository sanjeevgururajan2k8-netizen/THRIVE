import re

def check_keywords(text: str, keywords: list[str]) -> bool:
    text_lower = text.lower()
    for kw in keywords:
        if re.search(r'\b' + re.escape(kw) + r'\b', text_lower):
            return True
    return False

def check_regex(text: str, pattern: str) -> bool:
    return bool(re.search(pattern, text, re.IGNORECASE))

def extract_features(subject: str, body: str, preprocessed_data: dict) -> dict:
    """
    Extracts NLP features and boolean flags for risk signals.
    """
    combined = preprocessed_data["normalized"]
    
    features = {}
    
    # Credential/Password/OTP requests
    features["credential_request"] = check_keywords(combined, ["password", "login credentials", "verify your account", "validate account", "update your account"])
    features["otp_request"] = check_keywords(combined, ["otp", "one time password", "verification code", "security code", "auth code"])
    features["payment_request"] = check_keywords(combined, ["wire transfer", "gift card", "payment processing", "invoice attached", "unpaid invoice", "pay now", "bitcoin", "crypto"])
    features["account_verification"] = check_keywords(combined, ["verify account", "confirm account", "verify identity", "validate your profile"])
    features["financial_language"] = check_keywords(combined, ["bank", "paypal", "credit card", "billing", "invoice", "transaction", "payment", "funds", "deposit"])
    features["login_language"] = check_keywords(combined, ["login", "sign in", "click here to log in", "access your account", "portal"])
    features["suspicious_call_to_action"] = check_keywords(combined, ["click here", "click the link below", "log in below", "verify now", "immediate action required"])
    
    # Threat / Urgency (basic overlap with psychology but useful for pure ML models)
    features["urgency_language"] = check_keywords(combined, ["immediately", "urgent", "action required", "asap", "within 24 hours", "suspended", "terminate"])
    
    # Impersonation signs
    brands = ["paypal", "microsoft", "google", "amazon", "apple", "bank of america", "chase", "wells fargo", "hr", "it department"]
    features["brand_reference"] = check_keywords(combined, brands)
    
    features["uppercase_pressure"] = preprocessed_data["has_uppercase_pressure"]
    features["excessive_punctuation"] = preprocessed_data["has_excessive_punctuation"]
    
    return features
