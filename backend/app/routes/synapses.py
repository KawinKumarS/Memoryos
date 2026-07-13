import json
from typing import List, Dict, Any, Optional
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from pydantic import BaseModel
from datetime import datetime

from app.core.database import get_db
from app.models.schemas import Synapse, DissonanceLog, User, ReflectionLog
from app.auth import get_current_user
from app.engine.subconscious import SynapticEngine

router = APIRouter(prefix="/synapses", tags=["synapses"])

class SynapseCreate(BaseModel):
    content: str
    memory_type: str = "fact"
    importance: int = 5
    confidence: float = 1.0

class SynapseOut(BaseModel):
    id: int
    content: str
    memory_type: str
    importance: int
    confidence: float
    status: str
    reason_for_keeping: Optional[str] = None
    source: Optional[str] = None
    connections: str
    created_at: datetime
    updated_at: datetime
    last_retrieved_at: Optional[datetime] = None

    class Config:
        from_attributes = True

@router.get("", response_model=List[Dict[str, Any]])
def get_synapses(current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    synapses = db.query(Synapse).filter(
        Synapse.user_id == current_user.id,
        Synapse.status == "active"
    ).all()
    
    result = []
    for s in synapses:
        result.append({
            "id": s.id,
            "content": s.content,
            "memory_type": s.memory_type,
            "importance": s.importance,
            "confidence": s.confidence,
            "status": s.status,
            "reason_for_keeping": s.reason_for_keeping,
            "source": s.source,
            "connections": json.loads(s.connections) if s.connections else [],
            "created_at": s.created_at,
            "updated_at": s.updated_at,
            "last_retrieved_at": s.last_retrieved_at
        })
    return result

@router.get("/graph")
def get_graph(current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    synapses = db.query(Synapse).filter(
        Synapse.user_id == current_user.id,
        Synapse.status == "active"
    ).all()
    
    nodes = []
    links = []
    seen_links = set()
    
    for s in synapses:
        nodes.append({
            "id": s.id,
            "label": s.content[:30] + "..." if len(s.content) > 30 else s.content,
            "content": s.content,
            "type": s.memory_type,
            "importance": s.importance,
            "confidence": s.confidence,
            "reason": s.reason_for_keeping,
            "created_at": s.created_at.isoformat() if s.created_at else None,
            "last_retrieved": s.last_retrieved_at.isoformat() if s.last_retrieved_at else None
        })
        
        connections = json.loads(s.connections) if s.connections else []
        for target_id in connections:
            # Avoid duplicate edges (e.g. A-B and B-A) in the representation
            link_key = tuple(sorted([s.id, target_id]))
            if link_key not in seen_links:
                seen_links.add(link_key)
                links.append({
                    "source": s.id,
                    "target": target_id
                })
                
    return {"nodes": nodes, "links": links}

@router.post("/add")
def add_synapse(data: SynapseCreate, current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    vector = SynapticEngine.get_embedding(data.content)
    new_syn = Synapse(
        user_id=current_user.id,
        content=data.content,
        memory_type=data.memory_type,
        importance=data.importance,
        confidence=data.confidence,
        status="active",
        reason_for_keeping="Manually registered synapse in the inspector.",
        source="manual",
        vector_json=json.dumps(vector)
    )
    db.add(new_syn)
    db.commit()
    
    # Establish graph links
    SynapticEngine._create_semantic_edges(db, current_user.id, new_syn)
    return {"status": "success", "synapse_id": new_syn.id}

@router.delete("/{synapse_id}")
def delete_synapse(synapse_id: int, current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    synapse = db.query(Synapse).filter(
        Synapse.id == synapse_id,
        Synapse.user_id == current_user.id
    ).first()
    if not synapse:
        raise HTTPException(status_code=404, detail="Synapse not found")
        
    synapse.status = "forgotten"
    db.add(synapse)
    db.commit()
    
    # Rebuild edges since structure changed
    SynapticEngine._rebuild_all_edges(db, current_user.id)
    return {"status": "success", "message": "Synapse successfully forgotten"}

@router.post("/sleep")
def trigger_sleep_cycle(current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    stats = SynapticEngine.run_sleep_cycle(db, current_user.id)
    return {"status": "success", "stats": stats}

@router.get("/dissonance")
def get_dissonance_logs(current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    logs = db.query(DissonanceLog).filter(DissonanceLog.user_id == current_user.id).order_by(DissonanceLog.timestamp.desc()).all()
    
    # Enrich log logs with Synapse content descriptions for UI display
    result = []
    for log in logs:
        s1 = db.query(Synapse).filter(Synapse.id == log.synapse_id_1).first()
        s2 = db.query(Synapse).filter(Synapse.id == log.synapse_id_2).first()
        result.append({
            "id": log.id,
            "synapse_1": {
                "id": log.synapse_id_1,
                "content": s1.content if s1 else "[Archived Memory]"
            },
            "synapse_2": {
                "id": log.synapse_id_2,
                "content": s2.content if s2 else "[Deleted/Mock Node]"
            },
            "description": log.conflict_description,
            "status": log.resolution_status,
            "method": log.resolution_method,
            "timestamp": log.timestamp
        })
    return result

@router.get("/reflection")
def get_reflection_history(current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    return db.query(ReflectionLog).filter(ReflectionLog.user_id == current_user.id).order_by(ReflectionLog.timestamp.desc()).all()
