"""
Task orchestration service - coordinates the execution of tasks across agents.
"""

from typing import Dict, Any, List
import asyncio
from datetime import datetime
import uuid

from ..models.task import Task, TaskStatus, Subtask, SubtaskStatus
from .manager_agent import ManagerAgent
from .agent_executor import AgentExecutor


# Simulated agent database for MVP
# In production, this would come from the database
DEMO_AGENTS = [
    {
        "id": "agent_coder",
        "name": "Code Analyzer",
        "role": "Senior Software Engineer",
        "goal": "Analyze and write high-quality code",
        "tools": ["github", "code_linter"],
        "llm_model": "gpt-4"
    },
    {
        "id": "agent_reviewer",
        "name": "Code Reviewer",
        "role": "Quality Assurance Engineer",
        "goal": "Review code for quality and security",
        "tools": ["github", "security_scanner", "code_linter"],
        "llm_model": "gpt-4"
    },
    {
        "id": "agent_deployer",
        "name": "Release Manager",
        "role": "DevOps Engineer",
        "goal": "Deploy code safely to production",
        "tools": ["github", "slack"],
        "llm_model": "gpt-3.5-turbo"
    }
]


# Global state for real-time updates
agent_states: Dict[str, Dict[str, Any]] = {}
websocket_connections: List[Any] = []


async def broadcast_agent_state(agent_id: str, state: Dict[str, Any]):
    """Broadcast agent state update to all connected clients."""
    agent_states[agent_id] = state
    # In production, this would send via WebSocket
    # For now, we just update the global state


async def execute_task(task_id: str, tasks_db: Dict[str, Task]):
    """
    Main task execution orchestrator.

    This function:
    1. Gets the task from the database
    2. Uses Manager Agent to decompose into subtasks
    3. Executes subtasks in order
    4. Handles handoffs between agents
    5. Updates task progress in real-time
    """
    if task_id not in tasks_db:
        return

    task = tasks_db[task_id]

    # Update task status to running
    task = task.model_copy(update={"status": TaskStatus.RUNNING})
    tasks_db[task_id] = task

    try:
        # Initialize Manager Agent
        manager = ManagerAgent()

        # Get available agents
        # In production, fetch from database based on user's squad
        available_agents = DEMO_AGENTS

        # Decompose task into subtasks
        subtask_definitions = await manager.decompose_task(
            task.description,
            available_agents
        )

        # Create subtasks
        subtasks = []
        for subtask_def in subtask_definitions:
            subtask = Subtask(
                id=subtask_def["id"],
                task_id=task_id,
                agent_id=subtask_def["agent_id"],
                description=subtask_def["description"],
                status=SubtaskStatus.PENDING,
                cost_incurred=0.0
            )
            subtasks.append(subtask)

        # Update task with subtasks
        task = task.model_copy(update={"subtasks": subtasks})
        tasks_db[task_id] = task

        # Calculate total complexity for progress tracking
        total_complexity = sum(
            sd.get("complexity_weight", 1) for sd in subtask_definitions
        )
        completed_complexity = 0

        # Execute subtasks in order
        previous_result = None
        for i, subtask_def in enumerate(subtask_definitions):
            subtask = subtasks[i]

            # Check if task was paused
            task = tasks_db[task_id]
            if task.status == TaskStatus.PAUSED:
                break

            # Get the agent for this subtask
            agent_data = next(
                (a for a in available_agents if a["id"] == subtask.agent_id),
                None
            )
            if not agent_data:
                continue

            # Update subtask status
            subtask = Subtask(
                **{
                    **subtask.model_dump(),
                    "status": SubtaskStatus.RUNNING,
                    "started_at": datetime.utcnow()
                }
            )
            subtasks[i] = subtask

            # Update current agent in task
            task = task.model_copy(update={
                "subtasks": subtasks,
                "current_agent_id": subtask.agent_id
            })
            tasks_db[task_id] = task

            # Broadcast agent state: working
            await broadcast_agent_state(agent_data["id"], {
                "agent_id": agent_data["id"],
                "status": "working",
                "current_action": subtask.description,
                "current_subtask_id": subtask.id,
                "speech_bubble": {
                    "text": f"Working on: {subtask.description[:50]}..."
                }
            })

            # Create and run agent executor
            executor = AgentExecutor(
                agent_id=agent_data["id"],
                agent_name=agent_data["name"],
                agent_role=agent_data["role"],
                agent_goal=agent_data["goal"],
                tools=agent_data["tools"],
                llm_model=agent_data["llm_model"]
            )

            # Prepare context from previous result
            context = None
            if previous_result:
                context = await manager.handle_handoff(
                    previous_result,
                    agent_data,
                    {"include_output": True, "include_summary": True, "include_flags": True, "include_context": True}
                )

            # Execute the subtask
            result = await executor.execute(subtask.description, context)

            # Update subtask with result
            subtask = Subtask(
                **{
                    **subtask.model_dump(),
                    "status": SubtaskStatus.COMPLETED if result["success"] else SubtaskStatus.FAILED,
                    "output": result.get("output"),
                    "cost_incurred": result.get("cost_incurred", 0),
                    "completed_at": datetime.utcnow()
                }
            )
            subtasks[i] = subtask

            # Update progress
            completed_complexity += subtask_def.get("complexity_weight", 1)
            progress = (completed_complexity / total_complexity) * 100

            # Update task
            task = task.model_copy(update={
                "subtasks": subtasks,
                "progress": progress,
                "total_cost": task.total_cost + result.get("cost_incurred", 0)
            })
            tasks_db[task_id] = task

            # Broadcast agent state: idle after completion
            await broadcast_agent_state(agent_data["id"], {
                "agent_id": agent_data["id"],
                "status": "idle",
                "speech_bubble": {
                    "text": f"Completed: {subtask.description[:30]}..."
                }
            })

            # Store result for next handoff
            previous_result = result

            # Small delay between subtasks
            await asyncio.sleep(0.5)

        # Mark task as completed
        task = tasks_db[task_id]
        if task.status != TaskStatus.PAUSED:
            task = task.model_copy(update={
                "status": TaskStatus.COMPLETED,
                "completed_at": datetime.utcnow(),
                "progress": 100
            })
            tasks_db[task_id] = task

    except Exception as e:
        # Mark task as failed
        task = tasks_db[task_id]
        task = task.model_copy(update={
            "status": TaskStatus.FAILED
        })
        tasks_db[task_id] = task
        raise e


def get_agent_states() -> Dict[str, Dict[str, Any]]:
    """Get current state of all agents."""
    return agent_states
