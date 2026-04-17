# FixPilot - AI Mechanic Assistant

## Overview
AI-powered vehicle mechanic assistant mobile app migrated from Base44/ChatGPT to Emergent (Expo React Native + FastAPI + MongoDB).

## Tech Stack
- **Frontend**: Expo React Native (SDK 54) with expo-router, AsyncStorage for auth
- **Backend**: FastAPI (Python) with MongoDB (motor async), JWT auth, bcrypt
- **AI**: OpenAI GPT-5.2 via Emergent LLM Key
- **Maps**: Google Places API for nearby mechanics
- **Database**: MongoDB

## Features

### Authentication
- JWT-based email/password registration and login
- Bearer token auth (React Native compatible)
- Admin account auto-seeding on startup
- Brute force protection (5 attempts = 15 min lockout)
- Token refresh support
- **Password reset / forgot password flow** with secure tokens

### Vehicle Diagnosis (17 Repair Library Entries)
1. Radiator leak
2. Radiator hose leak
3. Faulty thermostat
4. Water pump failure
5. Battery/charging system
6. Brake pad and rotor wear
7. Spark plug/ignition misfire
8. Front air suspension leak
9. General cooling system
10. Transmission slipping/hard shifting
11. Exhaust/catalytic converter
12. Power steering problem
13. AC/heating system
14. Oil leak
15. Tire wear/alignment
16. Check engine light (generic)
17. Serpentine belt wear

### AI Chat
- GPT-5.2 conversational diagnosis
- Session persistence in MongoDB
- Repair match suggestions inline

### Garage (Personal Vehicle Management)
- Add/view/delete vehicles with nicknames
- Auth-protected (user-specific)

### Google Maps Nearby Mechanics
- GPS-based location (expo-location)
- Google Places API integration
- Returns top 10 nearby auto repair shops with ratings, address, open/closed status
- **Shops tab on Results screen** with "Find Nearby Shops" button
- Opens shop in Google Maps on tap

### Affiliate Link Monetization
- Amazon tag configured: `fixpilot-20`
- Structure ready for Walmart, AutoZone affiliate IDs
- All repair entries include multi-vendor links (Amazon, AutoZone, O'Reilly, RockAuto, Walmart, Advance Auto)
- UTM-ready link structure

### Results & Reports
- 5 tabbed results: Overview, DIY, Parts, Videos, **Shops**
- Tools/parts with vendor links
- YouTube instruction video links
- DIY vs Mechanic cost comparison

### History
- User-specific diagnosis history
- Delete individual diagnoses

## API Endpoints
| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| POST | /api/auth/register | No | Register |
| POST | /api/auth/login | No | Login |
| GET | /api/auth/me | Yes | Get user |
| POST | /api/auth/refresh | No | Refresh token |
| POST | /api/auth/forgot-password | No | Request reset token |
| POST | /api/auth/reset-password | No | Reset password |
| POST | /api/diagnose | Optional | AI diagnosis |
| POST | /api/chat | Optional | AI chat |
| GET | /api/chat/{id} | No | Get chat |
| GET | /api/history | Optional | User history |
| GET | /api/history/{id} | No | Get diagnosis |
| DELETE | /api/history/{id} | No | Delete |
| GET | /api/repair-library | No | All 17 entries |
| POST | /api/vehicles | Yes | Save vehicle |
| GET | /api/vehicles | Yes | User vehicles |
| DELETE | /api/vehicles/{id} | Yes | Delete vehicle |
| POST | /api/nearby-shops | No | Find shops (Google Places) |
| GET | /api/health | No | Health check |
