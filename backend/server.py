from dotenv import load_dotenv
from pathlib import Path
load_dotenv(Path(__file__).parent / '.env')

from fastapi import FastAPI, APIRouter, HTTPException, Request, Depends
from starlette.middleware.cors import CORSMiddleware
from motor.motor_asyncio import AsyncIOMotorClient
from bson import ObjectId
import os, json, uuid, logging, bcrypt, jwt, requests, secrets, asyncio
from datetime import datetime, timezone, timedelta
from pydantic import BaseModel, Field
from typing import Optional

from repair_library import REPAIR_LIBRARY, find_repair_match
from emergentintegrations.llm.chat import LlmChat, UserMessage

try:
    import resend
    RESEND_API_KEY = os.environ.get('RESEND_API_KEY', '')
    if RESEND_API_KEY:
        resend.api_key = RESEND_API_KEY
    SENDER_EMAIL = os.environ.get('SENDER_EMAIL', 'onboarding@resend.dev')
    HAS_RESEND = bool(RESEND_API_KEY)
except ImportError:
    HAS_RESEND = False
    SENDER_EMAIL = ''

# Config
mongo_url = os.environ['MONGO_URL']
client = AsyncIOMotorClient(mongo_url)
db = client[os.environ.get('DB_NAME', 'fixpilot_db')]
EMERGENT_LLM_KEY = os.environ['EMERGENT_LLM_KEY']
GOOGLE_MAPS_API_KEY = os.environ.get('GOOGLE_MAPS_API_KEY', '')
JWT_SECRET = os.environ['JWT_SECRET']
JWT_ALGORITHM = "HS256"

app = FastAPI()
api_router = APIRouter(prefix="/api")
logging.basicConfig(level=logging.INFO, format='%(asctime)s - %(name)s - %(levelname)s - %(message)s')
logger = logging.getLogger(__name__)

# --- Auth Utilities ---
def hash_password(password: str) -> str:
    return bcrypt.hashpw(password.encode("utf-8"), bcrypt.gensalt()).decode("utf-8")

def verify_password(plain: str, hashed: str) -> bool:
    return bcrypt.checkpw(plain.encode("utf-8"), hashed.encode("utf-8"))

def create_access_token(user_id: str, email: str) -> str:
    payload = {"sub": user_id, "email": email, "exp": datetime.now(timezone.utc) + timedelta(hours=24), "type": "access"}
    return jwt.encode(payload, JWT_SECRET, algorithm=JWT_ALGORITHM)

def create_refresh_token(user_id: str) -> str:
    payload = {"sub": user_id, "exp": datetime.now(timezone.utc) + timedelta(days=7), "type": "refresh"}
    return jwt.encode(payload, JWT_SECRET, algorithm=JWT_ALGORITHM)

async def get_current_user(request: Request) -> dict:
    token = request.headers.get("Authorization", "")
    if token.startswith("Bearer "):
        token = token[7:]
    if not token:
        raise HTTPException(status_code=401, detail="Not authenticated")
    try:
        payload = jwt.decode(token, JWT_SECRET, algorithms=[JWT_ALGORITHM])
        if payload.get("type") != "access":
            raise HTTPException(status_code=401, detail="Invalid token type")
        user = await db.users.find_one({"_id": ObjectId(payload["sub"])})
        if not user:
            raise HTTPException(status_code=401, detail="User not found")
        user["_id"] = str(user["_id"])
        user.pop("password_hash", None)
        return user
    except jwt.ExpiredSignatureError:
        raise HTTPException(status_code=401, detail="Token expired")
    except jwt.InvalidTokenError:
        raise HTTPException(status_code=401, detail="Invalid token")

async def get_optional_user(request: Request):
    try:
        return await get_current_user(request)
    except HTTPException:
        return None

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

class RegisterRequest(BaseModel):
    name: str
    email: str
    password: str

class LoginRequest(BaseModel):
    email: str
    password: str

class NearbyRequest(BaseModel):
    lat: float
    lng: float
    radius: int = 8000

class ForgotPasswordRequest(BaseModel):
    email: str

class ResetPasswordRequest(BaseModel):
    token: str
    new_password: str

class PushTokenRequest(BaseModel):
    push_token: str

def _vehicle_summary(v):
    parts = [p for p in [v.year, v.make, v.model, v.engine] if p]
    return " ".join(parts) if parts else "Unknown vehicle"

def _clean_doc(doc):
    if doc and "_id" in doc:
        del doc["_id"]
    return doc

# --- Affiliate Link Builder ---
AFFILIATE_CONFIG = {
    "amazon": {"tag": os.environ.get("AMAZON_AFFILIATE_TAG", "fixpilot-20"), "param": "tag"},
    "walmart": {"tag": os.environ.get("WALMART_AFFILIATE_TAG", ""), "param": ""},
    "autozone": {"tag": os.environ.get("AUTOZONE_AFFILIATE_TAG", ""), "param": ""},
}

def build_affiliate_url(base_url: str, store: str = "") -> str:
    store_lower = store.lower().split()[0] if store else ""
    config = AFFILIATE_CONFIG.get(store_lower, {})
    tag = config.get("tag", "")
    if tag and config.get("param"):
        sep = "&" if "?" in base_url else "?"
        return f"{base_url}{sep}{config['param']}={tag}"
    return base_url

# --- AI Diagnosis ---
async def ai_diagnose(vehicle: VehicleInfo, issue: str, repair_match=None):
    vehicle_str = _vehicle_summary(vehicle)
    system_msg = """You are FixPilot, an expert AI vehicle mechanic assistant. Given a vehicle and issue, respond with JSON:
{"title":"Brief title","summary":"2-3 sentence overview","likely_causes":["cause1"],"inspection_steps":["step1"],"recommended_approach":"What to do","difficulty":"Easy/Moderate/Advanced","safety_notes":"Warnings","estimated_diy_cost":{"min":0,"max":0},"estimated_mechanic_cost":{"min":0,"max":0}}
Respond with valid JSON only."""
    context = f"Vehicle: {vehicle_str}\nIssue: {issue}"
    if repair_match:
        e = repair_match["entry"]
        context += f"\nReference: {e['title']} - {e['summary']}"
    try:
        chat = LlmChat(api_key=EMERGENT_LLM_KEY, session_id=f"diag-{uuid.uuid4()}", system_message=system_msg)
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
    system_msg = f"""You are FixPilot, an expert AI mechanic helping diagnose issues with a {vehicle_str}. Be professional, clear, and safety-conscious. Keep responses concise but thorough."""
    try:
        chat = LlmChat(api_key=EMERGENT_LLM_KEY, session_id=f"chat-{uuid.uuid4()}", system_message=system_msg)
        chat.with_model("openai", "gpt-5.2")
        full_context = ""
        for msg in history[-10:]:
            role = "User" if msg.get("role") == "user" else "FixPilot"
            full_context += f"\n{role}: {msg.get('content', '')}"
        full_context += f"\nUser: {message}"
        return await chat.send_message(UserMessage(text=full_context.strip()))
    except Exception as e:
        logger.error(f"AI chat error: {e}")
        return "I'm having trouble connecting. Please try again."

# --- Auth Routes ---
@api_router.post("/auth/register")
async def register(req: RegisterRequest):
    email = req.email.lower().strip()
    if await db.users.find_one({"email": email}):
        raise HTTPException(status_code=400, detail="Email already registered")
    user_doc = {
        "name": req.name.strip(), "email": email,
        "password_hash": hash_password(req.password),
        "role": "user", "created_at": datetime.now(timezone.utc),
    }
    result = await db.users.insert_one(user_doc)
    user_id = str(result.inserted_id)
    access = create_access_token(user_id, email)
    refresh = create_refresh_token(user_id)
    return {"id": user_id, "name": req.name.strip(), "email": email, "role": "user",
            "access_token": access, "refresh_token": refresh}

@api_router.post("/auth/login")
async def login(req: LoginRequest):
    email = req.email.lower().strip()
    ip = "unknown"
    identifier = f"{ip}:{email}"
    attempt = await db.login_attempts.find_one({"identifier": identifier}, {"_id": 0})
    if attempt and attempt.get("count", 0) >= 5:
        lockout = attempt.get("last_attempt", datetime.now(timezone.utc))
        # Ensure lockout is timezone-aware for comparison
        if lockout.tzinfo is None:
            lockout = lockout.replace(tzinfo=timezone.utc)
        if datetime.now(timezone.utc) - lockout < timedelta(minutes=15):
            raise HTTPException(status_code=429, detail="Too many attempts. Try again in 15 minutes.")
        else:
            await db.login_attempts.delete_one({"identifier": identifier})
    user = await db.users.find_one({"email": email})
    if not user or not verify_password(req.password, user["password_hash"]):
        await db.login_attempts.update_one(
            {"identifier": identifier},
            {"$inc": {"count": 1}, "$set": {"last_attempt": datetime.now(timezone.utc)}},
            upsert=True,
        )
        raise HTTPException(status_code=401, detail="Invalid email or password")
    await db.login_attempts.delete_one({"identifier": identifier})
    user_id = str(user["_id"])
    access = create_access_token(user_id, email)
    refresh = create_refresh_token(user_id)
    return {"id": user_id, "name": user.get("name", ""), "email": email,
            "role": user.get("role", "user"), "access_token": access, "refresh_token": refresh}

@api_router.get("/auth/me")
async def get_me(user=Depends(get_current_user)):
    return {"id": user["_id"], "name": user.get("name", ""), "email": user.get("email", ""), "role": user.get("role", "user")}

@api_router.post("/auth/refresh")
async def refresh_token(request: Request):
    token = request.headers.get("Authorization", "")
    if token.startswith("Bearer "):
        token = token[7:]
    body = await request.json()
    token = body.get("refresh_token", token)
    if not token:
        raise HTTPException(status_code=401, detail="No refresh token")
    try:
        payload = jwt.decode(token, JWT_SECRET, algorithms=[JWT_ALGORITHM])
        if payload.get("type") != "refresh":
            raise HTTPException(status_code=401, detail="Invalid token type")
        user = await db.users.find_one({"_id": ObjectId(payload["sub"])})
        if not user:
            raise HTTPException(status_code=401, detail="User not found")
        access = create_access_token(str(user["_id"]), user["email"])
        return {"access_token": access}
    except jwt.ExpiredSignatureError:
        raise HTTPException(status_code=401, detail="Refresh token expired")
    except jwt.InvalidTokenError:
        raise HTTPException(status_code=401, detail="Invalid refresh token")

@api_router.post("/auth/forgot-password")
async def forgot_password(req: ForgotPasswordRequest):
    email = req.email.lower().strip()
    user = await db.users.find_one({"email": email})
    if not user:
        return {"message": "If that email exists, a reset link has been sent."}
    token = secrets.token_urlsafe(32)
    await db.password_reset_tokens.insert_one({
        "token": token, "user_id": str(user["_id"]), "email": email,
        "expires_at": datetime.now(timezone.utc) + timedelta(hours=1),
        "used": False, "created_at": datetime.now(timezone.utc),
    })
    # Send email via Resend if configured
    if HAS_RESEND:
        try:
            html = f"""<div style="font-family:sans-serif;max-width:500px;margin:auto;padding:20px;background:#0A0A0A;color:#fff;">
            <h2 style="color:#E5E5E5;">FixPilot Password Reset</h2>
            <p style="color:#A3A3A3;">Use this code to reset your password:</p>
            <div style="background:#141414;border:1px solid #333;border-radius:4px;padding:16px;margin:16px 0;text-align:center;">
            <code style="font-size:18px;color:#fff;letter-spacing:2px;">{token}</code>
            </div>
            <p style="color:#737373;font-size:12px;">This code expires in 1 hour. If you didn't request this, ignore this email.</p>
            </div>"""
            await asyncio.to_thread(resend.Emails.send, {
                "from": SENDER_EMAIL, "to": [email],
                "subject": "FixPilot - Password Reset Code", "html": html,
            })
            logger.info(f"Password reset email sent to {email}")
        except Exception as e:
            logger.error(f"Failed to send reset email: {e}")
    else:
        logger.info(f"Password reset token for {email}: {token} (Resend not configured - add RESEND_API_KEY)")
    return {"message": "If that email exists, a reset link has been sent.", "reset_token": token}

@api_router.post("/auth/reset-password")
async def reset_password(req: ResetPasswordRequest):
    if len(req.new_password) < 6:
        raise HTTPException(status_code=400, detail="Password must be at least 6 characters")
    token_doc = await db.password_reset_tokens.find_one({"token": req.token, "used": False})
    if not token_doc:
        raise HTTPException(status_code=400, detail="Invalid or expired reset token")
    expires = token_doc.get("expires_at")
    if expires and expires.tzinfo is None:
        expires = expires.replace(tzinfo=timezone.utc)
    if expires and datetime.now(timezone.utc) > expires:
        raise HTTPException(status_code=400, detail="Reset token has expired")
    await db.users.update_one(
        {"_id": ObjectId(token_doc["user_id"])},
        {"$set": {"password_hash": hash_password(req.new_password)}}
    )
    await db.password_reset_tokens.update_one({"token": req.token}, {"$set": {"used": True}})
    return {"message": "Password has been reset successfully"}

# --- Core Routes ---
@api_router.get("/health")
async def health():
    return {"status": "ok", "service": "fixpilot-backend", "timestamp": datetime.now(timezone.utc).isoformat()}

# --- Push Notification ---
async def send_push_notification(push_token: str, title: str, body: str, data: dict = None):
    if not push_token or not push_token.startswith("ExponentPushToken"):
        return
    try:
        payload = {"to": push_token, "title": title, "body": body, "sound": "default"}
        if data:
            payload["data"] = data
        resp = requests.post("https://exp.host/--/api/v2/push/send", json=payload,
                             headers={"Content-Type": "application/json"}, timeout=10)
        logger.info(f"Push notification sent: {resp.status_code}")
    except Exception as e:
        logger.error(f"Push notification error: {e}")

@api_router.post("/push-token")
async def register_push_token(req: PushTokenRequest, user=Depends(get_current_user)):
    await db.users.update_one({"_id": ObjectId(user["_id"])}, {"$set": {"push_token": req.push_token}})
    return {"status": "registered"}

@api_router.post("/diagnose")
async def diagnose(req: DiagnoseRequest, request: Request):
    user = await get_optional_user(request)
    diag_id = str(uuid.uuid4())
    repair_match = find_repair_match(issue=req.issue, verified_diagnosis=req.verified_diagnosis)
    ai_result = await ai_diagnose(req.vehicle, req.issue, repair_match)
    result = {
        "id": diag_id, "vehicle": req.vehicle.dict(), "vehicle_summary": _vehicle_summary(req.vehicle),
        "issue": req.issue, "verified_diagnosis": req.verified_diagnosis,
        "ai_analysis": ai_result, "repair_match": repair_match["entry"] if repair_match else None,
        "match_type": repair_match["match_type"] if repair_match else None,
        "match_score": repair_match["score"] if repair_match else 0,
        "user_id": user["_id"] if user else None,
        "created_at": datetime.now(timezone.utc).isoformat(),
    }
    await db.diagnoses.insert_one({**result, "_id": diag_id})
    # Send push notification if user has a registered token
    if user and user.get("push_token"):
        diag_title = ai_result.get("title", "Diagnosis") if ai_result else "Diagnosis"
        await send_push_notification(
            user["push_token"], "Diagnosis Complete",
            f"{diag_title} - Tap to view your full report",
            {"type": "diagnosis", "id": diag_id}
        )
    return result

@api_router.post("/chat")
async def chat_endpoint(req: ChatRequest, request: Request):
    user = await get_optional_user(request)
    session_id = req.session_id or str(uuid.uuid4())
    existing = await db.chat_sessions.find_one({"session_id": session_id}, {"_id": 0})
    history = existing.get("messages", []) if existing else []
    reply = await ai_chat(req.vehicle, req.message, history)
    history.append({"role": "user", "content": req.message, "timestamp": datetime.now(timezone.utc).isoformat()})
    history.append({"role": "assistant", "content": reply, "timestamp": datetime.now(timezone.utc).isoformat()})
    repair_match = find_repair_match(issue=req.message)
    await db.chat_sessions.update_one(
        {"session_id": session_id},
        {"$set": {"session_id": session_id, "vehicle": req.vehicle.dict(), "messages": history,
                  "user_id": user["_id"] if user else None, "updated_at": datetime.now(timezone.utc).isoformat()}},
        upsert=True)
    return {"session_id": session_id, "reply": reply,
            "repair_match": repair_match["entry"] if repair_match else None,
            "match_type": repair_match["match_type"] if repair_match else None}

@api_router.get("/chat/{session_id}")
async def get_chat(session_id: str):
    session = await db.chat_sessions.find_one({"session_id": session_id}, {"_id": 0})
    if not session:
        raise HTTPException(status_code=404, detail="Session not found")
    return session

@api_router.get("/history")
async def get_history(request: Request):
    user = await get_optional_user(request)
    query = {"user_id": user["_id"]} if user else {}
    docs = await db.diagnoses.find(query, {"_id": 0}).sort("created_at", -1).to_list(50)
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

# --- Vehicle / Garage Routes ---
@api_router.post("/vehicles")
async def save_vehicle(v: VehicleSave, user=Depends(get_current_user)):
    vid = str(uuid.uuid4())
    doc = {**v.dict(), "id": vid, "user_id": user["_id"], "created_at": datetime.now(timezone.utc).isoformat()}
    await db.vehicles.insert_one({**doc, "_id": vid})
    return doc

@api_router.get("/vehicles")
async def get_vehicles(user=Depends(get_current_user)):
    docs = await db.vehicles.find({"user_id": user["_id"]}, {"_id": 0}).sort("created_at", -1).to_list(50)
    return docs

@api_router.delete("/vehicles/{vid}")
async def delete_vehicle(vid: str, user=Depends(get_current_user)):
    result = await db.vehicles.delete_one({"id": vid, "user_id": user["_id"]})
    if result.deleted_count == 0:
        raise HTTPException(status_code=404, detail="Vehicle not found")
    return {"status": "deleted"}

# --- Nearby Shops (Google Places) ---
@api_router.post("/nearby-shops")
async def nearby_shops(req: NearbyRequest):
    if not GOOGLE_MAPS_API_KEY:
        return {"results": [], "message": "Google Maps API key not configured"}
    try:
        url = "https://maps.googleapis.com/maps/api/place/nearbysearch/json"
        params = {"location": f"{req.lat},{req.lng}", "radius": req.radius,
                  "type": "car_repair", "key": GOOGLE_MAPS_API_KEY}
        resp = requests.get(url, params=params, timeout=10)
        data = resp.json()
        shops = []
        for place in data.get("results", [])[:10]:
            shops.append({
                "name": place.get("name", ""),
                "rating": place.get("rating", 0),
                "total_ratings": place.get("user_ratings_total", 0),
                "address": place.get("vicinity", ""),
                "open_now": place.get("opening_hours", {}).get("open_now"),
                "lat": place.get("geometry", {}).get("location", {}).get("lat"),
                "lng": place.get("geometry", {}).get("location", {}).get("lng"),
                "place_id": place.get("place_id", ""),
            })
        return {"results": shops}
    except Exception as e:
        logger.error(f"Nearby shops error: {e}")
        return {"results": [], "message": str(e)}

# --- Startup ---
async def seed_admin():
    admin_email = os.environ.get("ADMIN_EMAIL", "admin@fixpilot.com")
    admin_password = os.environ.get("ADMIN_PASSWORD", "FixPilot2026!")
    existing = await db.users.find_one({"email": admin_email})
    if not existing:
        await db.users.insert_one({
            "email": admin_email, "password_hash": hash_password(admin_password),
            "name": "Admin", "role": "admin", "created_at": datetime.now(timezone.utc)})
        logger.info(f"Admin user seeded: {admin_email}")
    elif not verify_password(admin_password, existing["password_hash"]):
        await db.users.update_one({"email": admin_email}, {"$set": {"password_hash": hash_password(admin_password)}})
        logger.info("Admin password updated")

async def create_indexes():
    await db.users.create_index("email", unique=True)
    await db.login_attempts.create_index("identifier")
    await db.password_reset_tokens.create_index("expires_at", expireAfterSeconds=0)

app.include_router(api_router)
app.add_middleware(CORSMiddleware, allow_credentials=True, allow_origins=["*"], allow_methods=["*"], allow_headers=["*"])

@app.on_event("startup")
async def startup():
    await seed_admin()
    await create_indexes()

@app.on_event("shutdown")
async def shutdown():
    client.close()
