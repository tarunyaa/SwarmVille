from fastapi import APIRouter, HTTPException
from typing import List
from datetime import datetime
import uuid

from ..models.workflow import Workflow, WorkflowCreate, WorkflowUpdate

router = APIRouter(prefix="/workflows", tags=["workflows"])

# In-memory storage for MVP
workflows_db: dict[str, Workflow] = {}


@router.get("", response_model=List[Workflow])
async def list_workflows(user_id: str = "demo_user"):
    """List all workflows for a user."""
    return [w for w in workflows_db.values() if w.user_id == user_id]


@router.get("/{workflow_id}", response_model=Workflow)
async def get_workflow(workflow_id: str):
    """Get a specific workflow by ID."""
    if workflow_id not in workflows_db:
        raise HTTPException(status_code=404, detail="Workflow not found")
    return workflows_db[workflow_id]


@router.post("", response_model=Workflow)
async def create_workflow(workflow_data: WorkflowCreate, user_id: str = "demo_user"):
    """Create a new workflow."""
    workflow_id = f"workflow_{uuid.uuid4().hex[:8]}"
    now = datetime.utcnow()
    workflow = Workflow(
        id=workflow_id,
        user_id=user_id,
        created_at=now,
        updated_at=now,
        **workflow_data.model_dump()
    )
    workflows_db[workflow_id] = workflow
    return workflow


@router.put("/{workflow_id}", response_model=Workflow)
async def update_workflow(workflow_id: str, workflow_data: WorkflowUpdate):
    """Update an existing workflow."""
    if workflow_id not in workflows_db:
        raise HTTPException(status_code=404, detail="Workflow not found")

    existing = workflows_db[workflow_id]
    update_data = workflow_data.model_dump(exclude_unset=True)
    update_data["updated_at"] = datetime.utcnow()

    updated = existing.model_copy(update=update_data)
    workflows_db[workflow_id] = updated
    return updated


@router.delete("/{workflow_id}")
async def delete_workflow(workflow_id: str):
    """Delete a workflow."""
    if workflow_id not in workflows_db:
        raise HTTPException(status_code=404, detail="Workflow not found")
    del workflows_db[workflow_id]
    return {"message": "Workflow deleted"}
