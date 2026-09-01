# PhishShield AI Threat Detection Engine

## Overview
The AI Threat Detection Engine (Module 3) is responsible for analyzing email content (subject, body, URLs, attachments) and detecting various phishing signals, intents, and psychological manipulation tactics. It generates a comprehensive, human-readable explanation of why an email is flagged as a threat.

## Architecture
- **Preprocessing:** Cleans text, normalizes whitespace, and extracts risk-preserving statistics (e.g., uppercase pressure, excessive punctuation).
- **Feature Extraction:** Generates boolean/float NLP features (e.g., `credential_request`, `payment_request`, `urgency_language`) using keyword and regex matching.
- **Psychology Detector:** Analyzes the text for manipulation tactics: Fear, Urgency, Authority, Greed, Panic, and Manipulation. Output is scaled 0-100.
- **Intent Detector:** Correlates features to identify the primary goal of the attacker (e.g., `CREDENTIAL_THEFT`, `FINANCIAL_FRAUD`, `BUSINESS_EMAIL_COMPROMISE`).
- **Phishing Detector:** Combines intent, features, psychology scores, and external signals (URL/attachment analysis) to compute a `phishing_probability` (0-100) and `classification` (LOW/MEDIUM/HIGH/CRITICAL).
- **Explainability:** Translates numerical scores and indicators into a human-readable summary.

## Limitations & Future Work
- **Current Approach:** Primarily rule-based NLP and keyword heuristics to ensure fast, local execution without external API dependencies.
- **Future ML Improvements:** Implement `SklearnThreatModel` using TF-IDF and Logistic Regression trained on a real-world phishing dataset.
- **LLM Integration:** Future integration with a local LLM for better context-aware intent extraction, provided it meets the <2 second latency requirement.
