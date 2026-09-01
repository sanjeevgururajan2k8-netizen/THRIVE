"""
Member 5 — Threat Intelligence Adapter
======================================
Reads existing Member 2–4 database outputs and derives a composite
threat_score that the Victim Risk Engine can consume.

This allows /api/risk/evaluate to work WITHOUT requiring the frontend
to pass threat_score manually — it reads from the DB directly.

Integration map:
  Member 2  → incidents table  (email metadata)
  Member 3  → incidents table  (via AI analysis stored in metadata_json if present)
  Member 4  → iocs + campaigns (reputation + campaign risk)
"""

from sqlalchemy.orm import Session
from typing import Optional
import json

# Import Member 4 models (IOC, Campaign, Incident)
try:
    from app.models.combined import IOC, Campaign, Incident
    COMBINED_MODELS_AVAILABLE = True
except ImportError:
    COMBINED_MODELS_AVAILABLE = False


def derive_threat_score_from_db(
    db: Session,
    email_id: str,
    sender_email: Optional[str] = None,
) -> float:
    """
    Derive a composite threat score from Members 2–4 database outputs.

    Priority chain:
      1. If an Incident record exists for this email_id, use it.
         - Read IOC reputation for sender domain/email
         - Read Campaign risk if the incident is linked to a campaign
         - Read AI analysis score from metadata_json if stored (Member 3)
      2. If only sender_email is known, look up sender IOC reputation.
      3. Fall back to 0.0 (no threat data available yet).

    Returns:
        float: Composite threat score 0–100
    """
    if not COMBINED_MODELS_AVAILABLE:
        return 0.0

    scores = []

    # ------------------------------------------------------------------ #
    # Step 1: Look up the Incident (Member 2 output)
    # ------------------------------------------------------------------ #
    incident: Optional[Incident] = None
    try:
        incident = db.query(Incident).filter(Incident.id == email_id).first()
    except Exception:
        pass  # Table may not exist yet in some environments

    if incident:
        # Try to read AI analysis from metadata_json (Member 3 output)
        try:
            meta = json.loads(incident.raw_content or "{}")
            ai_score = meta.get("phishing_probability", None)
            if ai_score is not None:
                scores.append(float(ai_score) * 100)
        except (json.JSONDecodeError, TypeError):
            pass

        # Use sender to look up IOC reputation (Member 4 output)
        if incident.sender:
            sender_domain = incident.sender.split("@")[-1] if "@" in incident.sender else incident.sender
            ioc_score = _get_ioc_score(db, incident.sender, sender_domain)
            if ioc_score is not None:
                scores.append(ioc_score)

        # Read campaign risk if incident is linked to a campaign (Member 4)
        try:
            if hasattr(incident, "campaigns") and incident.campaigns:
                campaign_scores = [c.risk_score for c in incident.campaigns if c.risk_score]
                if campaign_scores:
                    scores.append(max(campaign_scores))
        except Exception:
            pass

    # ------------------------------------------------------------------ #
    # Step 2: Fallback — look up sender directly in IOC table
    # ------------------------------------------------------------------ #
    if not scores and sender_email:
        sender_domain = sender_email.split("@")[-1] if "@" in sender_email else sender_email
        ioc_score = _get_ioc_score(db, sender_email, sender_domain)
        if ioc_score is not None:
            scores.append(ioc_score)

    # ------------------------------------------------------------------ #
    # Step 3: Compose final score
    # ------------------------------------------------------------------ #
    if not scores:
        return 0.0

    # Weighted max: the highest individual signal dominates, 
    # but multiple signals push the score higher
    max_score = max(scores)
    avg_score = sum(scores) / len(scores)
    composite = (max_score * 0.7) + (avg_score * 0.3)
    return min(round(composite, 2), 100.0)


def _get_ioc_score(db: Session, email: str, domain: str) -> Optional[float]:
    """Look up IOC reputation for an email address or domain."""
    try:
        # Try exact email match first
        ioc = db.query(IOC).filter(IOC.normalized_value == email.lower()).first()
        if not ioc:
            # Try domain match
            ioc = db.query(IOC).filter(IOC.normalized_value == domain.lower()).first()
        if ioc:
            # IOC reputation_score is stored as 0–100 (higher = more malicious)
            return float(ioc.reputation_score)
    except Exception:
        pass
    return None
