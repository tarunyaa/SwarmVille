from pydantic import BaseModel
from typing import Optional
from datetime import datetime
from enum import Enum


class ApprovalStatus(str, Enum):
    PENDING = "pending"
    APPROVED = "approved"
    DENIED = "denied"


class ApprovalRequest(BaseModel):
    id: str
    task_id: str
    subtask_id: str
    agent_id: str
    action: str
    reason: str
    status: ApprovalStatus = ApprovalStatus.PENDING
    created_at: datetime
    resolved_at: Optional[datetime] = None

    class Config:
        from_attributes = True
