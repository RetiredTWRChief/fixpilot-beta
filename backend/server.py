from fastapi import FastAPI, APIRouter, HTTPException
from dotenv import load_dotenv
from starlette.middleware.cors import CORSMiddleware
from motor.motor_asyncio import AsyncIOMotorClient
import os
import logging
import json
from pathlib import Path
from pydantic import BaseModel, Field
from typing import List, Optional
import uuid
from datetime import datetime, timezone

from repair_library import REPAIR_LIBRARY, find_repair_match
from emergentintegrations.llm.chat import LlmChat, UserMessage

ROOT_DIR = Path(__file__).parent
load_dotenv(ROOT_DIR / '.env')

mongo_url = os.environ['MONGO_URL']
client = AsyncIOMotorClient(mongo_url)
db = client[os.environ.get('DB_NAME', 'fixpilot_db')]

EMERGENT_LLM_KEY = os.environ['EMERGENT_LLM_KEY']
GOOGLE_MAPS_API_KEY = os.environ.get('GOOGLE_MAPS_API_KEY', '')

app = FastAPI()
api_router = APIRouter(prefix="/api")

logging.basicConfig(level=logging.INFO, format='%(asctime)s - %(name)s - %(levelname)s - %(message)s')
logger = logging.getLogger(__name__)


# --- Models ---
class VehicleInfo(BaseModel):
    year: str = ""
    make: str = ""
    model: str = ""
    engine: str = ""

class DiagnoseRequest(BaseModel):
    vehicle: VehicleInfo
    issue: str
    verified_diagnosis: str = ""

class ChatRequest(BaseModel):
    session_id: str = ""
    vehicle: VehicleInfo
    message: str

class VehicleSave(BaseModel):
    year: str
    make: str
    model: str
    engine: str = ""
    nickname: str = ""


def _vehicle_summary(v):
    parts = [p for p in [v.year, v.make, v.model, v.engine] if p]
    return " ".join(parts) if parts else "Unknown vehicle"


def _clean_doc(doc):
    if doc and "_id" in doc:
        del doc["_id"]
    return doc


# --- AI Diagnosis ---
async def ai_diagnose(vehicle: VehicleInfo, issue: str, repair_match=None):
    vehicle_str = _vehicle_summary(vehicle)
    system_msg = """You are FixPilot, an expert AI vehicle mechanic assistant. You provide accurate, professional vehicle diagnosis and repair guidance.

Given a vehicle and issue description, analyze the problem and respond with a JSON object containing:
{
  "title": "Brief diagnosis title",
  "summary": "2-3 sentence overview of the likely issue",
  "likely_causes": ["cause 1", "cause 2"],
  "inspection_steps": ["step 1", "step 2"],
  "recommended_approach": "What to do about it",
  "difficulty": "Easy/Moderate/Advanced",
  "safety_notes": "Any safety warnings",
  "estimated_diy_cost": {"min": 0, "max": 0},
  "estimated_mechanic_cost": {"min": 0, "max": 0}
}

Be professional, safety-conscious, and thorough. Always respond with valid JSON only."""

    context = f"Vehicle: {vehicle_str}\nIssue reported: {issue}"
    if repair_match:
        entry = repair_match["entry"]
        context += f"\n\nReference data from repair library (use as guidance):\nTitle: {entry['title']}\nSummary: {entry['summary']}\nDifficulty: {entry['difficulty']}"

    try:
        chat = LlmChat(
            api_key=EMERGENT_LLM_KEY,
            session_id=f"diag-{uuid.uuid4()}",
            system_message=system_msg,
        )
        chat.with_model("openai", "gpt-5.2")
        response = await chat.send_message(UserMessage(text=context))
        try:
            if "```json" in response:
                response = response.split("```json")[1].split("```")[0]
            elif "```" in response:
                response = response.split("```")[1].split("```")[0]
            return json.loads(response.strip())
        except json.JSONDecodeError:
            return {"title": "AI Analysis", "summary": response, "likely_causes": [], "inspection_steps": [],
                    "recommended_approach": response, "difficulty": "Unknown", "safety_notes": "",
                    "estimated_diy_cost": {"min": 0, "max": 0}, "estimated_mechanic_cost": {"min": 0, "max": 0}}
    except Exception as e:
        logger.error(f"AI diagnosis error: {e}")
        return None


async def ai_chat(vehicle: VehicleInfo, message: str, history: list):
    vehicle_str = _vehicle_summary(vehicle)
    system_msg = f"""You are FixPilot, an expert AI vehicle mechanic assistant helping diagnose issues with a {vehicle_str}.

You help users understand vehicle problems through conversation. Ask clarifying questions when needed. Provide clear, actionable guidance. Be professional and safety-conscious. If you can identify the issue, describe what's likely wrong, how to verify, and what the repair involves.

Keep responses concise but thorough. Use plain language a car owner can understand."""

    try:
        chat = LlmChat(
            api_key=EMERGENT_LLM_KEY,
            session_id=f"chat-{uuid.uuid4()}",
            system_message=system_msg,
        )
        chat.with_model("openai", "gpt-5.2")

        full_context = ""
        for msg in history[-10:]:
            role = msg.get("role", "user")
            full_context += f"\n{'User' if role == 'user' else 'FixPilot'}: {msg.get('content', '')}"
        full_context += f"\nUser: {message}"

        response = await chat.send_message(UserMessage(text=full_context.strip()))
        return response
    except Exception as e:
        logger.error(f"AI chat error: {e}")
        return "I'm having trouble connecting right now. Please try again in a moment."


# --- Routes ---
@api_router.get("/health")
async def health():
    return {"status": "ok", "service": "fixpilot-backend", "timestamp": datetime.now(timezone.utc).isoformat()}


@api_router.post("/diagnose")
async def diagnose(req: DiagnoseRequest):
    diag_id = str(uuid.uuid4())
    vehicle_summary = _vehicle_summary(req.vehicle)

    repair_match = find_repair_match(issue=req.issue, verified_diagnosis=req.verified_diagnosis)
    ai_result = await ai_diagnose(req.vehicle, req.issue, repair_match)

    result = {
        "id": diag_id,
        "vehicle": req.vehicle.dict(),
        "vehicle_summary": vehicle_summary,
        "issue": req.issue,
        "verified_diagnosis": req.verified_diagnosis,
        "ai_analysis": ai_result,
        "repair_match": repair_match["entry"] if repair_match else None,
        "match_type": repair_match["match_type"] if repair_match else None,
        "match_score": repair_match["score"] if repair_match else 0,
        "created_at": datetime.now(timezone.utc).isoformat(),
    }

    await db.diagnoses.insert_one({**result, "_id": diag_id})
    return result


@api_router.post("/chat")
async def chat_endpoint(req: ChatRequest):
    session_id = req.session_id or str(uuid.uuid4())

    existing = await db.chat_sessions.find_one({"session_id": session_id}, {"_id": 0})
    history = existing.get("messages", []) if existing else []

    reply = await ai_chat(req.vehicle, req.message, history)

    history.append({"role": "user", "content": req.message, "timestamp": datetime.now(timezone.utc).isoformat()})
    history.append({"role": "assistant", "content": reply, "timestamp": datetime.now(timezone.utc).isoformat()})

    repair_match = find_repair_match(issue=req.message)

    await db.chat_sessions.update_one(
        {"session_id": session_id},
        {"$set": {"session_id": session_id, "vehicle": req.vehicle.dict(),
                  "messages": history, "updated_at": datetime.now(timezone.utc).isoformat()}},
        upsert=True
    )

    return {
        "session_id": session_id,
        "reply": reply,
        "repair_match": repair_match["entry"] if repair_match else None,
        "match_type": repair_match["match_type"] if repair_match else None,
    }


@api_router.get("/chat/{session_id}")
async def get_chat(session_id: str):
    session = await db.chat_sessions.find_one({"session_id": session_id}, {"_id": 0})
    if not session:
        raise HTTPException(status_code=404, detail="Session not found")
    return session


@api_router.get("/history")
async def get_history():
    docs = await db.diagnoses.find({}, {"_id": 0}).sort("created_at", -1).to_list(50)
    return docs


@api_router.get("/history/{diag_id}")
async def get_diagnosis(diag_id: str):
    doc = await db.diagnoses.find_one({"id": diag_id}, {"_id": 0})
    if not doc:
        raise HTTPException(status_code=404, detail="Diagnosis not found")
    return doc


@api_router.delete("/history/{diag_id}")
async def delete_diagnosis(diag_id: str):
    result = await db.diagnoses.delete_one({"id": diag_id})
    if result.deleted_count == 0:
        raise HTTPException(status_code=404, detail="Diagnosis not found")
    return {"status": "deleted"}


@api_router.get("/repair-library")
async def get_repair_library():
    return REPAIR_LIBRARY


@api_router.post("/vehicles")
async def save_vehicle(v: VehicleSave):
    vid = str(uuid.uuid4())
    doc = {**v.dict(), "id": vid, "created_at": datetime.now(timezone.utc).isoformat()}
    await db.vehicles.insert_one({**doc, "_id": vid})
    return doc


@api_router.get("/vehicles")
async def get_vehicles():
    docs = await db.vehicles.find({}, {"_id": 0}).sort("created_at", -1).to_list(50)
    return docs


@api_router.delete("/vehicles/{vid}")
async def delete_vehicle(vid: str):
    result = await db.vehicles.delete_one({"id": vid})
    if result.deleted_count == 0:
        raise HTTPException(status_code=404, detail="Vehicle not found")
    return {"status": "deleted"}


app.include_router(api_router)

app.add_middleware(
    CORSMiddleware,
    allow_credentials=True,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.on_event("shutdown")
async def shutdown_db_client():
    client.close()
