from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from contextlib import asynccontextmanager

from .api import iocs, campaigns, threat_hunt, analysis
from .core.database import engine, Base

@asynccontextmanager
async def lifespan(app: FastAPI):
    # Create database tables
    Base.metadata.create_all(bind=engine)
    yield
    # Cleanup on shutdown if needed

app = FastAPI(
    title="PhishShield - Member 4 Module",
    description="IOC Extraction, Threat Intelligence, Campaign Detection, Campaign DNA, Threat Memory, and Threat Hunting APIs",
    version="1.0.0",
    lifespan=lifespan
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include Routers
# app.include_router(iocs.router, prefix="/iocs", tags=["IOCs"])
# app.include_router(campaigns.router, prefix="/campaigns", tags=["Campaigns"])
# app.include_router(threat_hunt.router, tags=["Threat Hunting"])
# app.include_router(analysis.router, tags=["Analysis"])

@app.get("/")
def read_root():
    return {"status": "ok", "message": "PhishShield API is running."}
