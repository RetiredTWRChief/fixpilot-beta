# FixPilot - AI Mechanic Assistant

## Overview
FixPilot is an AI-powered vehicle mechanic assistant mobile app, migrated from Base44/ChatGPT to Emergent (Expo React Native + FastAPI + MongoDB).

## Tech Stack
- **Frontend**: Expo React Native (SDK 54) with expo-router
- **Backend**: FastAPI (Python) with MongoDB
- **AI**: OpenAI GPT-5.2 via Emergent LLM Key (emergentintegrations library)
- **Database**: MongoDB (local)

## Features
### Core Diagnosis
- Vehicle input form (Year, Make, Model, Engine)
- AI-powered diagnosis via GPT-5.2
- 9 pre-built repair library entries with keyword matching
- Structured diagnosis results with inspection steps, tools, parts, videos

### Repair Library (9 entries)
1. Radiator leak
2. Radiator hose leak
3. Faulty thermostat
4. Water pump failure
5. Battery/charging system issue
6. Brake pad and rotor wear
7. Spark plug/ignition misfire
8. Front air suspension leak
9. General cooling system issue

### AI Chat
- Conversational AI diagnosis via chat interface
- Session-based conversation with history persistence
- Repair match suggestions inline

### Results & Reports
- Tabbed results view: Overview, DIY, Parts, Videos
- Inspection steps with numbered guides
- Tool recommendations with Amazon/vendor purchase links
- Parts with multi-vendor options (AutoZone, Amazon, O'Reilly, RockAuto, etc.)
- YouTube instruction video links
- DIY vs Mechanic cost comparison

### History
- Saved diagnosis history in MongoDB
- Delete individual diagnoses
- Pull-to-refresh

## API Endpoints
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | /api/health | Health check |
| POST | /api/diagnose | AI + repair library diagnosis |
| POST | /api/chat | AI chat message |
| GET | /api/chat/{session_id} | Get chat session |
| GET | /api/history | List diagnosis history |
| GET | /api/history/{id} | Get specific diagnosis |
| DELETE | /api/history/{id} | Delete diagnosis |
| GET | /api/repair-library | Get all repair entries |
| POST | /api/vehicles | Save a vehicle |
| GET | /api/vehicles | List saved vehicles |
| DELETE | /api/vehicles/{id} | Delete a vehicle |

## Design
- Dark steel theme (#0A0A0A background, #141414 cards, #333333 borders)
- Minimalist, no animations
- Professional control-room aesthetic
- 4px border radius, 1px solid borders
- White primary buttons, steel secondary

## Environment Variables
### Backend (.env)
- MONGO_URL
- DB_NAME
- EMERGENT_LLM_KEY
- GOOGLE_MAPS_API_KEY

### Frontend (.env)
- EXPO_PUBLIC_BACKEND_URL
