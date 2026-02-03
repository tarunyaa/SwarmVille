from pydantic import BaseModel, Field
from typing import List, Optional
from datetime import datetime


class HandoffConfig(BaseModel):
    include_output: bool = True
    include_summary: bool = True
    include_flags: bool = True
    include_context: bool = True


class WorkflowNode(BaseModel):
    id: str
    agent_id: str
    position: dict = Field(default_factory=lambda: {"x": 0, "y": 0})
    complexity_weight: float = 1.0


class WorkflowEdge(BaseModel):
    id: str
    source_node_id: str
    target_node_id: str
    handoff_config: HandoffConfig = Field(default_factory=HandoffConfig)


class WorkflowBase(BaseModel):
    name: str = Field(..., min_length=1, max_length=100)
    nodes: List[WorkflowNode] = Field(default_factory=list)
    edges: List[WorkflowEdge] = Field(default_factory=list)


class WorkflowCreate(WorkflowBase):
    pass


class WorkflowUpdate(BaseModel):
    name: Optional[str] = None
    nodes: Optional[List[WorkflowNode]] = None
    edges: Optional[List[WorkflowEdge]] = None


class Workflow(WorkflowBase):
    id: str
    user_id: str
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True
