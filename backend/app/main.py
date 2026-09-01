from fastapi import FastAPI
from app.core.config import settings
from app.api.routes import ai

app = FastAPI(title=settings.PROJECT_NAME)

app.include_router(ai.router, prefix=settings.API_V1_STR + "/ai", tags=["ai"])

@app.get("/")
def read_root():
    return {"message": "Welcome to PhishShield API"}
