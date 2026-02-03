from pydantic import BaseModel, Field
from typing import List, Optional
from datetime import datetime
from enum import Enum


class TaskStatus(str, Enum):
    PENDING = "pending"
    RUNNING = "running"
    PAUSED = "paused"
    COMPLETED = "completed"
    FAILED = "failed"


class SubtaskStatus(str, Enum):
    PENDING = "pending"
    RUNNING = "running"
    WAITING_APPROVAL = "waiting_approval"
    COMPLETED = "completed"
    FAILED = "failed"


class Subtask(BaseModel):
    id: str
    task_id: str
    agent_id: str
    description: str
    status: SubtaskStatus = SubtaskStatus.PENDING
    output: Optional[str] = None
    cost_incurred: float = 0.0
    started_at: Optional[datetime] = None
    completed_at: Optional[datetime] = None


class TaskBase(BaseModel):
    workflow_id: str
    description: str = Field(..., min_length=1, max_length=1000)


class TaskCreate(TaskBase):
    pass


class Task(TaskBase):
    id: str
    user_id: str
    status: TaskStatus = TaskStatus.PENDING
    current_agent_id: Optional[str] = None
    progress: float = 0.0
    total_cost: float = 0.0
    created_at: datetime
    completed_at: Optional[datetime] = None
    subtasks: List[Subtask] = Field(default_factory=list)

    class Config:
        from_attributes = True


class TaskReassign(BaseModel):
    new_agent_id: str
    transfer_context: bool = True
