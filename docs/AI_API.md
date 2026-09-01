# AI API Documentation

## Endpoint: `POST /api/ai/analyze`

**Request Schema:**
```json
{
  "subject": "URGENT: Your PayPal account will be suspended",
  "body": "Dear customer, Your account has been flagged for suspicious activity. You must verify your account within 10 minutes or your account will be permanently suspended. Click the link below and enter your password and OTP to continue.",
  "sender": "security@paypal-update.com",
  "urls": [],
  "attachments": []
}
```

**Response Schema:**
```json
{
  "phishing_probability": 95,
  "classification": "CRITICAL_RISK",
  "confidence": 95,
  "intent": {
    "label": "CREDENTIAL_THEFT",
    "confidence": 100,
    "evidence": [
      "Requests password or login credentials.",
      "Requests one-time password (OTP) or security code.",
      "Asks to verify or validate account details."
    ]
  },
  "psychology": {
    "fear": 75,
    "urgency": 85,
    "authority": 0,
    "greed": 0,
    "panic": 80,
    "manipulation": 80
  },
  "indicators": [
    {
      "type": "CREDENTIAL_REQUEST",
      "severity": "CRITICAL",
      "evidence": "Message requests sensitive login credentials."
    },
    {
      "type": "OTP_REQUEST",
      "severity": "CRITICAL",
      "evidence": "Message requests a one-time password or verification code."
    }
  ],
  "suspicious_requests": [],
  "explanation": "This email is classified as critical risk. The attacker is using extreme time pressure and fear to force immediate action. The primary intent appears to be credential theft. It explicitly requests sensitive credentials. It requests an OTP or verification code, which is highly suspicious.",
  "evidence": [
    "Message requests sensitive login credentials.",
    "Message requests a one-time password or verification code."
  ]
}
```
