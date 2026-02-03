from fastapi import APIRouter, HTTPException, BackgroundTasks
from typing import List
from datetime import datetime
import uuid

from ..models.task import Task, TaskCreate, TaskStatus, TaskReassign
from ..services.orchestrator import execute_task

router = APIRouter(prefix="/tasks", tags=["tasks"])

# In-memory storage for MVP
tasks_db: dict[str, Task] = {}


@router.get("", response_model=List[Task])
async def list_tasks(user_id: str = "demo_user"):
    """List all tasks for a user."""
    return [t for t in tasks_db.values() if t.user_id == user_id]


@router.get("/{task_id}", response_model=Task)
async def get_task(task_id: str):
    """Get a specific task by ID."""
    if task_id not in tasks_db:
        raise HTTPException(status_code=404, detail="Task not found")
    return tasks_db[task_id]


@router.post("", response_model=Task)
async def create_task(
    task_data: TaskCreate,
    background_tasks: BackgroundTasks,
    user_id: str = "demo_user"
):
    """Create and start a new task."""
    task_id = f"task_{uuid.uuid4().hex[:8]}"
    task = Task(
        id=task_id,
        user_id=user_id,
        workflow_id=task_data.workflow_id,
        description=task_data.description,
        status=TaskStatus.PENDING,
        created_at=datetime.utcnow()
    )
    tasks_db[task_id] = task

    # Start task execution in background
    background_tasks.add_task(execute_task, task_id, tasks_db)

    return task


@router.put("/{task_id}/pause", response_model=Task)
async def pause_task(task_id: str):
    """Pause a running task."""
    if task_id not in tasks_db:
        raise HTTPException(status_code=404, detail="Task not found")

    task = tasks_db[task_id]
    if task.status != TaskStatus.RUNNING:
        raise HTTPException(status_code=400, detail="Task is not running")

    task = task.model_copy(update={"status": TaskStatus.PAUSED})
    tasks_db[task_id] = task
    return task


@router.put("/{task_id}/resume", response_model=Task)
async def resume_task(task_id: str, background_tasks: BackgroundTasks):
    """Resume a paused task."""
    if task_id not in tasks_db:
        raise HTTPException(status_code=404, detail="Task not found")

    task = tasks_db[task_id]
    if task.status != TaskStatus.PAUSED:
        raise HTTPException(status_code=400, detail="Task is not paused")

    task = task.model_copy(update={"status": TaskStatus.RUNNING})
    tasks_db[task_id] = task

    # Continue execution in background
    background_tasks.add_task(execute_task, task_id, tasks_db)

    return task


@router.put("/{task_id}/reassign", response_model=Task)
async def reassign_task(task_id: str, reassign_data: TaskReassign):
    """Reassign the current subtask to a different agent."""
    if task_id not in tasks_db:
        raise HTTPException(status_code=404, detail="Task not found")

    task = tasks_db[task_id]
    if task.status not in [TaskStatus.RUNNING, TaskStatus.PAUSED]:
        raise HTTPException(status_code=400, detail="Task is not in a reassignable state")

    # Update current agent
    task = task.model_copy(update={
        "current_agent_id": reassign_data.new_agent_id
    })
    tasks_db[task_id] = task

    # TODO: Handle context transfer logic

    return task
