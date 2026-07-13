import json
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy.orm import Session

from app.core.database import engine, Base, SessionLocal
from app.models.schemas import User, Synapse, ChatSession, ChatMessage
from app.core.security import get_password_hash
from app.engine.subconscious import SynapticEngine
from app.routes import auth, chat, synapses, stats

# Create SQLite tables
Base.metadata.create_all(bind=engine)

app = FastAPI(title="MemoryOS API", version="1.0.0")

# Setup CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"], # In development, allow all origins
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Register routers under prefix '/api'
app.include_router(auth.router, prefix="/api")
app.include_router(chat.router, prefix="/api")
app.include_router(synapses.router, prefix="/api")
app.include_router(stats.router, prefix="/api")

@app.get("/")
def read_root():
    return {"status": "healthy", "service": "MemoryOS Synaptic Core API"}

# Seed initial demonstration data
def seed_demo_data():
    db = SessionLocal()
    try:
        # Check if demo user already exists
        demo_user = db.query(User).filter(User.username == "demo").first()
        if not demo_user:
            # Create demo user
            hashed = get_password_hash("password123")
            user = User(username="demo", hashed_password=hashed)
            db.add(user)
            db.commit()
            db.refresh(user)
            
            # Initial synapse memory seeding
            demo_memories = [
                # Facts
                ("MemoryOS is in pre-seed stage", "fact", 7, 0.95, "User declared pre-seed status."),
                ("Team size is 4 engineers", "fact", 5, 0.9, "User specified team headcount."),
                ("Product name is MemoryOS", "fact", 9, 1.0, "Core branding established."),
                # Preferences
                ("User prefers Dark Mode layout", "preference", 6, 0.8, "User toggled dashboard settings."),
                ("User writes React and TypeScript code", "preference", 8, 0.95, "Repeated code mentions."),
                ("User dislikes class-based code structures", "preference", 7, 0.85, "User code review feedback."),
                # Rules
                ("Always check database indexes before writing raw sql", "rule", 8, 0.9, "Lint protocol guideline."),
                ("Never expose raw JWT secrets in headers", "rule", 9, 1.0, "Security constraint."),
                # Relations
                ("Partner firm is Stripe Ventures", "relation", 6, 0.7, "Investment relation."),
                ("Lead designer is Sarah Miller", "relation", 5, 0.9, "User contact card relation."),
                # Skill (Executable Memory)
                ("Format all CSS outputs using glassmorphic tokens", "skill", 8, 0.9, "Repetitive design instruction.")
            ]
            
            synapse_instances = []
            for content, m_type, importance, confidence, reason in demo_memories:
                vector = SynapticEngine.get_embedding(content)
                syn = Synapse(
                    user_id=user.id,
                    content=content,
                    memory_type=m_type,
                    importance=importance,
                    confidence=confidence,
                    status="active",
                    reason_for_keeping=reason,
                    source="seeding",
                    vector_json=json.dumps(vector)
                )
                db.add(syn)
                synapse_instances.append(syn)
            db.commit()
            
            # Create a default chat session and pre-seed a couple messages
            session = ChatSession(user_id=user.id, title="System Activation Chat")
            db.add(session)
            db.commit()
            db.refresh(session)
            
            msg1 = ChatMessage(session_id=session.id, sender="user", content="Initialize MemoryOS. Set up our product credentials and coding stack.")
            msg2 = ChatMessage(session_id=session.id, sender="assistant", content="System activated. Synthesizing initial synapses... Done. I have registered our product parameters (MemoryOS, pre-seed, 4 engineers) and your programming profiles (React, TypeScript, dark mode, strict index checks). Pinned these to our cognitive graph.")
            db.add(msg1)
            db.add(msg2)
            db.commit()
            
            # Rebuild graph links bidirectionally
            SynapticEngine._rebuild_all_edges(db, user.id)
            print("Demo database seeded successfully!")
    except Exception as e:
        print(f"Error seeding demo database: {e}")
    finally:
        db.close()

# Run seed on startup
seed_demo_data()
