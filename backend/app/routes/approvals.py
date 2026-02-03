from fastapi import APIRouter, HTTPException
from typing import List
from datetime import datetime

from ..models.approval import ApprovalRequest, ApprovalStatus

router = APIRouter(prefix="/approvals", tags=["approvals"])

# In-memory storage for MVP
approvals_db: dict[str, ApprovalRequest] = {}


@router.get("", response_model=List[ApprovalRequest])
async def list_pending_approvals(user_id: str = "demo_user"):
    """List all pending approval requests for a user."""
    # For MVP, return all pending approvals
    return [
        a for a in approvals_db.values()
        if a.status == ApprovalStatus.PENDING
    ]


@router.get("/{approval_id}", response_model=ApprovalRequest)
async def get_approval(approval_id: str):
    """Get a specific approval request."""
    if approval_id not in approvals_db:
        raise HTTPException(status_code=404, detail="Approval request not found")
    return approvals_db[approval_id]


@router.put("/{approval_id}/approve", response_model=ApprovalRequest)
async def approve_request(approval_id: str):
    """Approve a pending request."""
    if approval_id not in approvals_db:
        raise HTTPException(status_code=404, detail="Approval request not found")

    approval = approvals_db[approval_id]
    if approval.status != ApprovalStatus.PENDING:
        raise HTTPException(status_code=400, detail="Request is not pending")

    approval = ApprovalRequest(
        **{
            **approval.model_dump(),
            "status": ApprovalStatus.APPROVED,
            "resolved_at": datetime.utcnow()
        }
    )
    approvals_db[approval_id] = approval

    # TODO: Signal the waiting agent to continue

    return approval


@router.put("/{approval_id}/deny", response_model=ApprovalRequest)
async def deny_request(approval_id: str):
    """Deny a pending request."""
    if approval_id not in approvals_db:
        raise HTTPException(status_code=404, detail="Approval request not found")

    approval = approvals_db[approval_id]
    if approval.status != ApprovalStatus.PENDING:
        raise HTTPException(status_code=400, detail="Request is not pending")

    approval = ApprovalRequest(
        **{
            **approval.model_dump(),
            "status": ApprovalStatus.DENIED,
            "resolved_at": datetime.utcnow()
        }
    )
    approvals_db[approval_id] = approval

    # TODO: Signal the waiting agent to stop or try alternative

    return approval


# Helper function for services to create approval requests
def create_approval_request(
    task_id: str,
    subtask_id: str,
    agent_id: str,
    action: str,
    reason: str
) -> ApprovalRequest:
    """Create a new approval request (called by agent services)."""
    import uuid
    approval_id = f"approval_{uuid.uuid4().hex[:8]}"
    approval = ApprovalRequest(
        id=approval_id,
        task_id=task_id,
        subtask_id=subtask_id,
        agent_id=agent_id,
        action=action,
        reason=reason,
        status=ApprovalStatus.PENDING,
        created_at=datetime.utcnow()
    )
    approvals_db[approval_id] = approval
    return approval
