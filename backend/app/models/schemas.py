from sqlalchemy import Column, Integer, String, Float, DateTime, ForeignKey, Text
from sqlalchemy.sql import func
from app.core.database import Base

class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    username = Column(String, unique=True, index=True, nullable=False)
    hashed_password = Column(String, nullable=False)
    created_at = Column(DateTime(timezone=True), server_default=func.now())

class ChatSession(Base):
    __tablename__ = "chat_sessions"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"), nullable=False)
    title = Column(String, nullable=False)
    created_at = Column(DateTime(timezone=True), server_default=func.now())

class ChatMessage(Base):
    __tablename__ = "chat_messages"

    id = Column(Integer, primary_key=True, index=True)
    session_id = Column(Integer, ForeignKey("chat_sessions.id", ondelete="CASCADE"), nullable=False)
    sender = Column(String, nullable=False) # "user" or "assistant"
    content = Column(Text, nullable=False)
    timestamp = Column(DateTime(timezone=True), server_default=func.now())

class Synapse(Base):
    __tablename__ = "synapses"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"), nullable=False)
    content = Column(Text, nullable=False)
    memory_type = Column(String, default="fact") # fact, preference, rule, relation, skill
    importance = Column(Integer, default=5) # scale 1-10
    confidence = Column(Float, default=1.0) # scale 0.0-1.0
    status = Column(String, default="active") # active, forgotten, archived
    reason_for_keeping = Column(Text, nullable=True)
    source = Column(String, nullable=True) # e.g. "chat_session_4" or "manual"
    vector_json = Column(Text, nullable=True) # JSON string of numerical floats
    connections = Column(Text, default="[]") # JSON string of list of connected Synapse IDs
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now())
    last_retrieved_at = Column(DateTime(timezone=True), nullable=True)

class DissonanceLog(Base):
    __tablename__ = "dissonance_logs"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"), nullable=False)
    synapse_id_1 = Column(Integer, ForeignKey("synapses.id", ondelete="CASCADE"), nullable=False)
    synapse_id_2 = Column(Integer, ForeignKey("synapses.id", ondelete="CASCADE"), nullable=False)
    conflict_description = Column(Text, nullable=False)
    resolution_status = Column(String, default="pending") # pending, resolved
    resolution_method = Column(Text, nullable=True) # e.g. "Overwrote #1 with #2", "Merged details"
    timestamp = Column(DateTime(timezone=True), server_default=func.now())

class ReflectionLog(Base):
    __tablename__ = "reflection_logs"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"), nullable=False)
    run_type = Column(String, default="sleep_cycle") # sleep_cycle, reflection
    notes = Column(Text, nullable=True)
    input_count = Column(Integer, default=0) # raw items processed
    output_count = Column(Integer, default=0) # consolidated items produced
    timestamp = Column(DateTime(timezone=True), server_default=func.now())
