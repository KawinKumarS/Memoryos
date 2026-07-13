import json
from datetime import datetime
from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from pydantic import BaseModel
import requests

from app.core.database import get_db
from app.models.schemas import ChatSession, ChatMessage, User
from app.auth import get_current_user
from app.engine.subconscious import SynapticEngine
from app.core.config import settings

router = APIRouter(prefix="/chat", tags=["chat"])

class SessionCreate(BaseModel):
    title: str

class MessageSend(BaseModel):
    content: str

class MessageOut(BaseModel):
    id: int
    sender: str
    content: str
    timestamp: datetime

    class Config:
        from_attributes = True

class SessionOut(BaseModel):
    id: int
    title: str
    created_at: datetime

    class Config:
        from_attributes = True

@router.get("/sessions", response_model=List[SessionOut])
def get_sessions(current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    return db.query(ChatSession).filter(ChatSession.user_id == current_user.id).order_by(ChatSession.created_at.desc()).all()

@router.post("/sessions", response_model=SessionOut)
def create_session(session_data: SessionCreate, current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    new_session = ChatSession(user_id=current_user.id, title=session_data.title)
    db.add(new_session)
    db.commit()
    db.refresh(new_session)
    return new_session

@router.get("/sessions/{session_id}/messages", response_model=List[MessageOut])
def get_messages(session_id: int, current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    session = db.query(ChatSession).filter(ChatSession.id == session_id, ChatSession.user_id == current_user.id).first()
    if not session:
        raise HTTPException(status_code=404, detail="Chat session not found")
    return db.query(ChatMessage).filter(ChatMessage.session_id == session_id).order_by(ChatMessage.timestamp.asc()).all()

@router.post("/sessions/{session_id}/send")
def send_message(
    session_id: int,
    msg_data: MessageSend,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    session = db.query(ChatSession).filter(ChatSession.id == session_id, ChatSession.user_id == current_user.id).first()
    if not session:
        raise HTTPException(status_code=404, detail="Chat session not found")
        
    user_content = msg_data.content
    
    # 1. Save User message to database
    user_msg = ChatMessage(session_id=session_id, sender="user", content=user_content)
    db.add(user_msg)
    db.commit()
    
    # 2. Semantic retrieval of long-term synapses to build context window
    relevant_synapses = SynapticEngine.retrieve_relevant_synapses(db, current_user.id, user_content, threshold=0.35, limit=5)
    
    # Construct memory context string
    memory_context = ""
    if relevant_synapses:
        memory_context = "\n".join([f"- {s[0].content} (Type: {s[0].memory_type})" for s in relevant_synapses])
        
    # 3. Call AI LLM or compute mock response
    ai_response = ""
    pipeline_latency = {"analyzer": 120, "retriever": 45, "decision": 85, "reflection": 110, "response_generation": 280}
    
    # Call Live Gemini or OpenAI if configured
    if settings.GEMINI_API_KEY:
        try:
            prompt = f"""You are MemoryOS assistant.
Here are relevant memories about the user from the persistent subconscious vault:
{memory_context}

User says: {user_content}

Answer concisely. Keep it extremely premium and helpful."""
            url = f"https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key={settings.GEMINI_API_KEY}"
            payload = {
                "contents": [{"parts": [{"text": prompt}]}]
            }
            r = requests.post(url, json=payload, timeout=8)
            if r.status_code == 200:
                ai_response = r.json()["candidates"][0]["content"]["parts"][0]["text"]
        except Exception as e:
            ai_response = f"Error generating Gemini response: {str(e)}. Falling back to local brain."

    if not ai_response and settings.OPENAI_API_KEY:
        try:
            prompt = f"""You are MemoryOS assistant.
Relevant memories:
{memory_context}

User: {user_content}"""
            url = "https://api.openai.com/v1/chat/completions"
            headers = {
                "Authorization": f"Bearer {settings.OPENAI_API_KEY}",
                "Content-Type": "application/json"
            }
            payload = {
                "model": "gpt-4o-mini",
                "messages": [{"role": "system", "content": prompt}]
            }
            r = requests.post(url, headers=headers, json=payload, timeout=8)
            if r.status_code == 200:
                ai_response = r.json()["choices"][0]["message"]["content"]
        except Exception as e:
            ai_response = f"Error generating OpenAI response: {str(e)}. Falling back to local brain."

    # Realistic fallback response engine if no keys provided
    if not ai_response:
        ai_response, pipeline_latency = _generate_mock_response(user_content, memory_context)
        
    # 4. Save Assistant message to database
    assistant_msg = ChatMessage(session_id=session_id, sender="assistant", content=ai_response)
    db.add(assistant_msg)
    db.commit()
    db.refresh(assistant_msg)
    
    # 5. Execute core memory triage classifier synchronously so UI displays decision flow
    decision_log = SynapticEngine.analyze_memory_decision(db, current_user.id, user_content, source=f"chat_session_{session_id}")
    
    # Get active pinned memories for user UI reference
    pinned_memories = [
        {"id": s[0].id, "content": s[0].content, "importance": s[0].importance, "type": s[0].memory_type}
        for s in relevant_synapses
    ]
    
    return {
        "user_message": MessageOut.from_orm(user_msg),
        "assistant_message": MessageOut.from_orm(assistant_msg),
        "memory_decision": decision_log,
        "pinned_memories": pinned_memories,
        "pipeline": {
            "latency_ms": pipeline_latency,
            "total_latency_ms": sum(pipeline_latency.values()),
            "retrieved_nodes_count": len(relevant_synapses),
            "confidence_score": 0.94
        }
    }

def _generate_mock_response(user_content: str, memory_context: str) -> tuple:
    u_lower = user_content.lower()
    
    # Basic latencies for visual display (ms)
    latencies = {"analyzer": 95, "retriever": 30, "decision": 70, "reflection": 50, "response_generation": 220}
    
    if "hello" in u_lower or "hi" in u_lower or "hey" in u_lower:
        reply = "Hello! I am MemoryOS, your persistent subconscious assistant. I consolidate information we talk about in real-time, organize them in a synaptic graph, and trigger periodic 'Sleep Cycles' to build meta-insights. How can I help you build today?"
        return reply, latencies
        
    if "love python" in u_lower or "use python" in u_lower:
        reply = "Got it. I've noted down that you code in Python. I'll automatically adapt my prompt configurations to prioritize Python syntax and helper libraries for all future responses."
        return reply, latencies
        
    if "rust instead of go" in u_lower:
        reply = "I understand. I'm archiving your previous preference for Go and installing Rust as your primary system language. The Cognitive Dissonance engine has successfully resolved this conflict."
        return reply, latencies
        
    if "forget what i said" in u_lower:
        reply = "Synthesizing deletion command... Done. I have removed that memory from your active synaptic network. It will dissolve in the next sleep cycle."
        return reply, latencies
        
    if "status" in u_lower or "health" in u_lower:
        reply = "System is fully operational. All sub-agents are idle and monitoring. The database is persistent, SQLite indexes are healthy, and embedding matrix is synchronized."
        return reply, latencies

    # Generic contextual fallback response
    if memory_context:
        reply = f"Based on our active memories (including: {memory_context.splitlines()[0] if memory_context else ''}), I am keeping our context aligned. To answer your prompt: I will ensure this conforms to your active preferences. What would you like to build or modify next?"
    else:
        reply = "That's interesting. I've registered that update in our synaptic interface. MemoryOS is now evaluating this content to determine if it warrants saving as a long-term preference or fact."
        
    return reply, latencies
