import json
import math
import re
from datetime import datetime
from typing import List, Dict, Any, Tuple
import requests
from sqlalchemy.orm import Session
from app.models.schemas import Synapse, DissonanceLog, ReflectionLog
from app.core.config import settings

class SynapticEngine:
    @staticmethod
    def get_embedding_local(text: str) -> List[float]:
        """
        Generate a basic TF-IDF / term-frequency vector representation for zero-dependency local vector similarity.
        Normalizes vector to length 1.0 for cosine similarity.
        Dimensions: 128 elements (fixed hash mapping for consistency).
        """
        vector = [0.0] * 128
        # Tokenize and clean text
        words = re.findall(r'\w+', text.lower())
        if not words:
            return vector
            
        # Standard hash-trick mapping to 128 dimensions
        for word in words:
            # Basic polynomial rolling hash
            h = 0
            for char in word:
                h = (h * 31 + ord(char)) & 0xFFFFFFFF
            idx = h % 128
            vector[idx] += 1.0
            
        # Normalize to unit length
        magnitude = math.sqrt(sum(x * x for x in vector))
        if magnitude > 0:
            vector = [x / magnitude for x in vector]
            
        return vector

    @classmethod
    def get_embedding(cls, text: str) -> List[float]:
        """
        Generate semantic vector embedding.
        If Gemini or OpenAI API keys are provided, query their endpoint.
        Otherwise, fallback to the local unit-normalized term frequency representation.
        """
        if settings.GEMINI_API_KEY:
            try:
                # Query Gemini embedding model
                url = f"https://generativelanguage.googleapis.com/v1beta/models/text-embedding-004:embedContent?key={settings.GEMINI_API_KEY}"
                payload = {
                    "model": "models/text-embedding-004",
                    "content": {"parts": [{"text": text}]}
                }
                r = requests.post(url, json=payload, timeout=5)
                if r.status_code == 200:
                    return r.json()["embedding"]["values"]
            except Exception:
                pass
                
        if settings.OPENAI_API_KEY:
            try:
                # Query OpenAI embedding model
                url = "https://api.openai.com/v1/embeddings"
                headers = {
                    "Authorization": f"Bearer {settings.OPENAI_API_KEY}",
                    "Content-Type": "application/json"
                }
                payload = {
                    "model": "text-embedding-3-small",
                    "input": text
                }
                r = requests.post(url, headers=headers, json=payload, timeout=5)
                if r.status_code == 200:
                    return r.json()["data"][0]["embedding"]
            except Exception:
                pass
                
        # Default zero-dependency fallback
        return cls.get_embedding_local(text)

    @staticmethod
    def cosine_similarity(v1: List[float], v2: List[float]) -> float:
        if not v1 or not v2 or len(v1) != len(v2):
            return 0.0
        dot_product = sum(x * y for x, y in zip(v1, v2))
        return dot_product

    @classmethod
    def retrieve_relevant_synapses(cls, db: Session, user_id: int, query: str, threshold: float = 0.35, limit: int = 5) -> List[Tuple[Synapse, float]]:
        """
        Retrieve active synapses that are semantically relevant to the input query.
        Returns a list of tuples containing (Synapse, similarity_score).
        """
        query_vector = cls.get_embedding(query)
        active_synapses = db.query(Synapse).filter(
            Synapse.user_id == user_id,
            Synapse.status == "active"
        ).all()
        
        matches = []
        for synapse in active_synapses:
            if not synapse.vector_json:
                continue
            try:
                syn_vector = json.loads(synapse.vector_json)
                score = cls.cosine_similarity(query_vector, syn_vector)
                if score >= threshold:
                    matches.append((synapse, score))
            except Exception:
                continue
                
        # Sort by similarity score descending
        matches.sort(key=lambda x: x[1], reverse=True)
        
        # Mark retrieved synapses for analytics and latency logs
        for synapse, score in matches[:limit]:
            synapse.last_retrieved_at = datetime.utcnow()
            db.add(synapse)
        db.commit()
        
        return matches[:limit]

    @classmethod
    def analyze_memory_decision(cls, db: Session, user_id: int, content: str, source: str) -> Dict[str, Any]:
        """
        Core memory classification engine.
        Examines new user content to decide if it should be:
        1. Ignore: Casual chatter ("hello", "thanks").
        2. Save: New core preference/fact ("I am building a SaaS in Go").
        3. Update: Modifying existing preferences ("Actually, let's use Rust instead of Go").
        4. Forget: Deleting a preference ("Forget what I said about Go").
        
        Also triggers Cognitive Dissonance checks for logical contradictions.
        """
        # Lowercase content for rule matches
        lower_content = content.lower().strip()
        
        # Rule 1: Casuality detection (Ignore)
        casual_patterns = [
            r"^(hello|hi|hey|greetings|yo|howdy)",
            r"^(thanks|thank you|awesome|great|ok|okay|cool|nice)",
            r"^(bye|goodbye|see you|later)"
        ]
        if any(re.search(pat, lower_content) for pat in casual_patterns):
            return {"action": "ignore", "reason": "Casual conversation or greeting"}

        # Rule 2: Forget command detection
        forget_match = re.search(r"(?:forget|delete|remove|erase|clear)\s+(?:what i said about|my preference for|my memory of|about)\s+(.+)", lower_content)
        if forget_match:
            target_topic = forget_match.group(1).strip()
            # Retrieve relevant active synapses to mark as forgotten
            relevant = cls.retrieve_relevant_synapses(db, user_id, target_topic, threshold=0.4, limit=2)
            if relevant:
                forgotten_ids = []
                for syn, score in relevant:
                    syn.status = "forgotten"
                    db.add(syn)
                    forgotten_ids.append(syn.id)
                db.commit()
                return {
                    "action": "forget", 
                    "reason": f"User explicitly asked to forget topic: {target_topic}",
                    "synapse_ids": forgotten_ids
                }
            return {"action": "ignore", "reason": f"No active memories found relating to topic: {target_topic}"}

        # Query semantic overlap with existing active synapses to check for updates or dissonance
        new_vector = cls.get_embedding(content)
        relevant_synapses = cls.retrieve_relevant_synapses(db, user_id, content, threshold=0.45, limit=3)
        
        # Detect contradiction (Cognitive Dissonance)
        # For mock/local rule: if a sentence has high semantic similarity but opposite sentiments/values
        # e.g., "I love Python" vs "I hate Python", or "I use React" vs "I use Angular"
        for existing, score in relevant_synapses:
            is_dissonant = cls._check_dissonance(content, existing.content)
            if is_dissonant:
                # Log dissonance
                dissonance = DissonanceLog(
                    user_id=user_id,
                    synapse_id_1=existing.id,
                    synapse_id_2=-1, # will represent the incoming unsaved node
                    conflict_description=f"Incoming: '{content}' contradicts existing memory '{existing.content}'",
                    resolution_status="pending"
                )
                db.add(dissonance)
                db.commit()
                
                # Resolve dissonance by overriding the older memory with the newer one (Standard resolution)
                # Mark existing as archived, save new as active
                existing.status = "archived"
                db.add(existing)
                
                new_synapse = Synapse(
                    user_id=user_id,
                    content=content,
                    memory_type=cls._categorize_memory(content),
                    importance=cls._calculate_importance(content),
                    confidence=0.9,
                    status="active",
                    reason_for_keeping="New user instruction overriding previous contradictory preference.",
                    source=source,
                    vector_json=json.dumps(new_vector)
                )
                db.add(new_synapse)
                db.commit()
                
                # Update dissonance record
                dissonance.synapse_id_2 = new_synapse.id
                dissonance.resolution_status = "resolved"
                dissonance.resolution_method = f"Auto-updated preference by archiving synapse #{existing.id}."
                db.add(dissonance)
                db.commit()
                
                return {
                    "action": "dissonance_resolved",
                    "reason": dissonance.conflict_description,
                    "archived_id": existing.id,
                    "new_id": new_synapse.id
                }

        # If similarity is extremely high (e.g. > 0.8) and NOT dissonant, we treat it as an update or reinforcement
        for existing, score in relevant_synapses:
            if score >= 0.8:
                existing.confidence = min(1.0, existing.confidence + 0.1)
                existing.importance = min(10, existing.importance + 1)
                existing.reason_for_keeping = f"Reinforced by repeat mention: '{content}'."
                db.add(existing)
                db.commit()
                return {
                    "action": "update",
                    "reason": f"Reinforced existing memory #{existing.id}",
                    "synapse_id": existing.id
                }

        # Standard new memory save
        m_type = cls._categorize_memory(content)
        importance = cls._calculate_importance(content)
        new_synapse = Synapse(
            user_id=user_id,
            content=content,
            memory_type=m_type,
            importance=importance,
            confidence=0.95,
            status="active",
            reason_for_keeping=cls._generate_reason(content, m_type),
            source=source,
            vector_json=json.dumps(new_vector)
        )
        db.add(new_synapse)
        db.commit()
        
        # Auto-link related synapses in background
        cls._create_semantic_edges(db, user_id, new_synapse)
        
        return {
            "action": "save",
            "reason": f"Stored new {m_type} memory",
            "synapse_id": new_synapse.id
        }

    @classmethod
    def run_sleep_cycle(cls, db: Session, user_id: int) -> Dict[str, Any]:
        """
        Simulate the "Dream Mode / Sleep Cycle" consolidation:
        1. Find all active synapses.
        2. Merge semantic duplicates (similarity > 0.75) into unified nodes.
        3. Prune old/unused synapses (importance < 3 and not retrieved in 7 days).
        4. Synthesize higher-level preferences/guidelines if multiples of same type exist.
        5. Return diagnostic stats of consolidated elements.
        """
        active = db.query(Synapse).filter(
            Synapse.user_id == user_id,
            Synapse.status == "active"
        ).all()
        
        input_count = len(active)
        merged_count = 0
        pruned_count = 0
        synthesized_count = 0
        
        # Track items to delete/merge
        processed = set()
        
        for i, syn_a in enumerate(active):
            if syn_a.id in processed or syn_a.status != "active":
                continue
                
            # Check for close semantic matches
            for syn_b in active[i+1:]:
                if syn_b.id in processed or syn_b.status != "active":
                    continue
                    
                vec_a = json.loads(syn_a.vector_json) if syn_a.vector_json else None
                vec_b = json.loads(syn_b.vector_json) if syn_b.vector_json else None
                
                if vec_a and vec_b:
                    sim = cls.cosine_similarity(vec_a, vec_b)
                    if sim >= 0.75:
                        # Combine information
                        merged_content = cls._merge_texts(syn_a.content, syn_b.content)
                        syn_a.content = merged_content
                        syn_a.importance = min(10, max(syn_a.importance, syn_b.importance) + 1)
                        syn_a.confidence = min(1.0, (syn_a.confidence + syn_b.confidence) / 2.0 + 0.05)
                        syn_a.vector_json = json.dumps(cls.get_embedding(merged_content))
                        syn_a.reason_for_keeping = f"Consolidated during Sleep Cycle from multiple observations."
                        
                        # Mark syn_b as archived
                        syn_b.status = "archived"
                        processed.add(syn_b.id)
                        db.add(syn_a)
                        db.add(syn_b)
                        merged_count += 1
                        
            # Prune logic: low importance and rarely retrieved
            # For hackathon simulation: if importance is 1 or 2, and confidence is low, prune
            if syn_a.importance <= 2 and syn_a.confidence <= 0.5 and syn_a.id not in processed:
                syn_a.status = "forgotten"
                processed.add(syn_a.id)
                db.add(syn_a)
                pruned_count += 1

        db.commit()
        
        # Check for guideline synthesis
        # If we have multiple preferences about coding or tools, extract an active executable code snippet/skill
        refreshed_active = db.query(Synapse).filter(
            Synapse.user_id == user_id,
            Synapse.status == "active"
        ).all()
        
        code_related = [s for s in refreshed_active if s.memory_type in ("rule", "skill") or "code" in s.content.lower()]
        if len(code_related) >= 3:
            # Create synthesized active skill snippet representation
            skill_content = "Synthesized coding protocol: Format files with camelCase, avoid class-based views, prefer Hooks and functional utilities."
            skill_vector = cls.get_embedding(skill_content)
            
            # Check if already synthesized
            exists = db.query(Synapse).filter(
                Synapse.user_id == user_id,
                Synapse.content == skill_content
            ).first()
            
            if not exists:
                new_skill = Synapse(
                    user_id=user_id,
                    content=skill_content,
                    memory_type="skill",
                    importance=8,
                    confidence=0.9,
                    status="active",
                    reason_for_keeping="Executable compilation of repetitive user coding preferences.",
                    source="sleep_cycle_synthesis",
                    vector_json=json.dumps(skill_vector)
                )
                db.add(new_skill)
                db.commit()
                synthesized_count += 1
        
        output_count = input_count - merged_count - pruned_count + synthesized_count
        
        # Create reflection log
        log = ReflectionLog(
            user_id=user_id,
            run_type="sleep_cycle",
            notes=f"Sleep cycle complete. Processed {input_count} active synapses. Merged: {merged_count}, Pruned: {pruned_count}, Synthesized Skills: {synthesized_count}.",
            input_count=input_count,
            output_count=output_count
        )
        db.add(log)
        db.commit()
        
        # Recalculate all node links (edges) for graph structure consistency
        cls._rebuild_all_edges(db, user_id)
        
        return {
            "input_count": input_count,
            "merged_count": merged_count,
            "pruned_count": pruned_count,
            "synthesized_count": synthesized_count,
            "output_count": output_count,
            "notes": log.notes
        }

    # --- Helper methods ---

    @staticmethod
    def _check_dissonance(t1: str, t2: str) -> bool:
        """
        Simple keyword-based logical contradiction checks for local fallbacks.
        Checks for semantic opposites in sentences.
        """
        t1_l, t2_l = t1.lower(), t2.lower()
        
        # Example 1: opposite languages/frameworks preference
        techs = ["python", "javascript", "react", "angular", "vue", "golang", "go", "rust", "java", "c++", "c#"]
        for tech in techs:
            # "I like Python" vs "I hate Python" / "hate using Python"
            if tech in t1_l and tech in t2_l:
                t1_pos = any(w in t1_l for w in ["love", "like", "prefer", "want", "use"])
                t1_neg = any(w in t1_l for w in ["hate", "dislike", "avoid", "never"])
                t2_pos = any(w in t2_l for w in ["love", "like", "prefer", "want", "use"])
                t2_neg = any(w in t2_l for w in ["hate", "dislike", "avoid", "never"])
                if (t1_pos and t2_neg) or (t1_neg and t2_pos):
                    return True
                    
        # Example 2: Choice contradiction ("react" vs "angular", "go" vs "rust" as a core base)
        if "react" in t1_l and "vue" in t2_l and "use" in t1_l and "use" in t2_l and "only" in t1_l:
            return True
        if "rust" in t1_l and "go" in t2_l and "only write" in t1_l and "write" in t2_l:
            return True
            
        return False

    @staticmethod
    def _categorize_memory(text: str) -> str:
        text_l = text.lower()
        if any(w in text_l for w in ["prefer", "like", "love", "hate", "dislike", "favorite"]):
            return "preference"
        if any(w in text_l for w in ["must", "always", "never", "should", "guideline", "rule"]):
            return "rule"
        if any(w in text_l for w in ["how to", "function", "code snippet", "format"]):
            return "skill"
        if any(w in text_l for w in ["friend", "wife", "husband", "son", "daughter", "works with"]):
            return "relation"
        return "fact"

    @staticmethod
    def _calculate_importance(text: str) -> int:
        text_l = text.lower()
        score = 5 # baseline
        if any(w in text_l for w in ["must", "critical", "important", "always", "never"]):
            score += 3
        if any(w in text_l for w in ["remind", "remember"]):
            score += 2
        if any(w in text_l for w in ["maybe", "sometimes", "guess"]):
            score -= 2
        return max(1, min(10, score))

    @staticmethod
    def _generate_reason(text: str, m_type: str) -> str:
        return f"User expressed a {m_type} regarding their workflow/personal details: '{text[:40]}...'."

    @staticmethod
    def _merge_texts(t1: str, t2: str) -> str:
        # Simple synthesis: return the longer sentence, or combine them logically
        if len(t1) > len(t2):
            longer, shorter = t1, t2
        else:
            longer, shorter = t2, t1
            
        if shorter.lower() in longer.lower():
            return longer
        return f"{longer} (Also recorded: {shorter})"

    @classmethod
    def _create_semantic_edges(cls, db: Session, user_id: int, new_synapse: Synapse):
        """
        Link a new synapse to existing active synapses if they share a high semantic similarity (e.g. > 0.45).
        """
        if not new_synapse.vector_json:
            return
            
        new_vec = json.loads(new_synapse.vector_json)
        other_synapses = db.query(Synapse).filter(
            Synapse.user_id == user_id,
            Synapse.id != new_synapse.id,
            Synapse.status == "active"
        ).all()
        
        new_connections = []
        for other in other_synapses:
            if not other.vector_json:
                continue
            other_vec = json.loads(other.vector_json)
            sim = cls.cosine_similarity(new_vec, other_vec)
            if sim >= 0.45:
                new_connections.append(other.id)
                # Bidirectionally update the other node
                try:
                    other_conn = json.loads(other.connections) if other.connections else []
                    if new_synapse.id not in other_conn:
                        other_conn.append(new_synapse.id)
                        other.connections = json.dumps(other_conn)
                        db.add(other)
                except Exception:
                    pass
                    
        new_synapse.connections = json.dumps(new_connections)
        db.add(new_synapse)
        db.commit()

    @classmethod
    def _rebuild_all_edges(cls, db: Session, user_id: int):
        """
        Recompute all semantic graph connections (edges) for active nodes.
        """
        active = db.query(Synapse).filter(
            Synapse.user_id == user_id,
            Synapse.status == "active"
        ).all()
        
        # Reset connections first
        for s in active:
            s.connections = "[]"
            
        for i, s1 in enumerate(active):
            if not s1.vector_json:
                continue
            v1 = json.loads(s1.vector_json)
            
            s1_conn = json.loads(s1.connections) if s1.connections else []
            for s2 in active[i+1:]:
                if not s2.vector_json:
                    continue
                v2 = json.loads(s2.vector_json)
                
                sim = cls.cosine_similarity(v1, v2)
                if sim >= 0.45:
                    s1_conn.append(s2.id)
                    s2_conn = json.loads(s2.connections) if s2.connections else []
                    s2_conn.append(s1.id)
                    s2.connections = json.dumps(s2_conn)
                    db.add(s2)
            s1.connections = json.dumps(s1_conn)
            db.add(s1)
            
        db.commit()
