from fastapi import APIRouter, HTTPException
from typing import List
from datetime import datetime
import uuid

from ..models.agent import Agent, AgentCreate, AgentUpdate, get_llm_cost

router = APIRouter(prefix="/agents", tags=["agents"])

# In-memory storage for MVP (replace with Supabase later)
agents_db: dict[str, Agent] = {}


@router.get("", response_model=List[Agent])
async def list_agents(user_id: str = "demo_user"):
    """List all agents for a user."""
    return [a for a in agents_db.values() if a.user_id == user_id]


@router.get("/{agent_id}", response_model=Agent)
async def get_agent(agent_id: str):
    """Get a specific agent by ID."""
    if agent_id not in agents_db:
        raise HTTPException(status_code=404, detail="Agent not found")
    return agents_db[agent_id]


@router.post("", response_model=Agent)
async def create_agent(agent_data: AgentCreate, user_id: str = "demo_user"):
    """Create a new agent."""
    agent_id = f"agent_{uuid.uuid4().hex[:8]}"
    agent = Agent(
        id=agent_id,
        user_id=user_id,
        cost_per_token=get_llm_cost(agent_data.llm_model),
        created_at=datetime.utcnow(),
        **agent_data.model_dump()
    )
    agents_db[agent_id] = agent
    return agent


@router.put("/{agent_id}", response_model=Agent)
async def update_agent(agent_id: str, agent_data: AgentUpdate):
    """Update an existing agent."""
    if agent_id not in agents_db:
        raise HTTPException(status_code=404, detail="Agent not found")

    existing = agents_db[agent_id]
    update_data = agent_data.model_dump(exclude_unset=True)

    # Update cost if LLM model changed
    if "llm_model" in update_data:
        update_data["cost_per_token"] = get_llm_cost(update_data["llm_model"])

    updated = existing.model_copy(update=update_data)
    agents_db[agent_id] = updated
    return updated


@router.delete("/{agent_id}")
async def delete_agent(agent_id: str):
    """Delete an agent."""
    if agent_id not in agents_db:
        raise HTTPException(status_code=404, detail="Agent not found")
    del agents_db[agent_id]
    return {"message": "Agent deleted"}
