from pydantic_settings import BaseSettings
from pydantic import ConfigDict

class Settings(BaseSettings):
    model_config = ConfigDict(env_file=".env")

    DATABASE_URL: str = "sqlite:///./phishshield.db"
    THREAT_INTEL_API_KEY: str = "mock_key"
    STORE_RAW_EMAIL: bool = False
    RETENTION_DAYS: int = 90
    CAMPAIGN_THRESHOLD: int = 70
    CAMPAIGN_DNA_THRESHOLD: int = 80
    MIN_CAMPAIGN_SIZE: int = 3

settings = Settings()
