from app.models.member5 import ContactRelationship

def evaluate_contact_risk(contact_rel: ContactRelationship, is_new: bool) -> float:
    """
    Calculate risk based on contact relationship history.
    """
    risk = 0.0
    if is_new or not contact_rel:
        risk += 60.0 # Base risk for new contacts
        
    if contact_rel:
        if contact_rel.relationship_strength == "UNKNOWN":
            risk += 20.0
        elif contact_rel.relationship_strength == "WEAK":
            risk += 10.0
            
        if not contact_rel.known_domain:
            risk += 15.0
            
    return min(risk, 100.0)
