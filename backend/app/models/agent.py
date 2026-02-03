from pydantic import BaseModel, Field
from typing import List, Optional
from datetime import datetime


class AvatarStyle(BaseModel):
    hair_color: str = "#2C1810"
    clothing_color: str = "#4169E1"
    skin_tone: str = "#FFDAB9"


class AgentBase(BaseModel):
    name: str = Field(..., min_length=1, max_length=50)
    role: str = Field(..., min_length=1, max_length=100)
    goal: str = Field(..., min_length=1, max_length=500)
    backstory: str = Field(..., min_length=1, max_length=1000)
    tools: List[str] = Field(default_factory=list)
    llm_model: str = "gpt-4"
    is_manager: bool = False
    avatar_style: AvatarStyle = Field(default_factory=AvatarStyle)


class AgentCreate(AgentBase):
    pass


class AgentUpdate(BaseModel):
    name: Optional[str] = None
    role: Optional[str] = None
    goal: Optional[str] = None
    backstory: Optional[str] = None
    tools: Optional[List[str]] = None
    llm_model: Optional[str] = None
    avatar_style: Optional[AvatarStyle] = None


class Agent(AgentBase):
    id: str
    user_id: str
    cost_per_token: float = 0.03
    created_at: datetime

    class Config:
        from_attributes = True


# Predefined LLM costs per 1k tokens
LLM_COSTS = {
    "gpt-4": 0.03,
    "gpt-4-turbo": 0.01,
    "gpt-3.5-turbo": 0.0005,
    "claude-3-opus": 0.015,
    "claude-3-sonnet": 0.003,
    "claude-3-haiku": 0.00025,
}


def get_llm_cost(model: str) -> float:
    return LLM_COSTS.get(model, 0.01)
