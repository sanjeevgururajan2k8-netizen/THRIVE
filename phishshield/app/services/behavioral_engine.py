from datetime import datetime, timezone
from typing import Dict, Any, Tuple

def detect_behavioral_anomaly(current_event: Dict[str, Any], baseline: Dict[str, Any]) -> Tuple[bool, float, list]:
    """
    Basic behavioral anomaly detection. 
    In a real implementation, this would look at `BehaviorEvent` history.
    """
    anomalies = []
    score = 0.0
    
    current_hour = datetime.now(timezone.utc).hour
    if "normal_start_hour" in baseline and "normal_end_hour" in baseline:
        if current_hour < baseline["normal_start_hour"] or current_hour > baseline["normal_end_hour"]:
            anomalies.append("UNUSUAL_SENDING_TIME")
            score += 40
            
    if "current_volume" in current_event and "average_daily_emails" in baseline:
        if current_event["current_volume"] > baseline["average_daily_emails"] * 5:
            anomalies.append("ABNORMAL_EMAIL_VOLUME")
            score += 50
            
    is_anomaly = len(anomalies) > 0
    if score > 100.0: 
        score = 100.0
    
    return is_anomaly, score, anomalies
