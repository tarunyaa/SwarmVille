"""
Manager Agent - orchestrates specialist agents to complete tasks.
"""

from typing import Dict, Any, List, Optional
import asyncio
from datetime import datetime
import uuid


class ManagerAgent:
    """
    The Manager Agent is responsible for:
    1. Receiving high-level tasks from humans
    2. Breaking down tasks into subtasks
    3. Assigning subtasks to specialist agents
    4. Monitoring progress and handling handoffs
    5. Escalating to humans when needed
    """

    def __init__(
        self,
        manager_id: str = "manager_default",
        llm_model: str = "gpt-4",
        openai_api_key: Optional[str] = None,
        anthropic_api_key: Optional[str] = None
    ):
        self.manager_id = manager_id
        self.llm_model = llm_model
        self.openai_api_key = openai_api_key
        self.anthropic_api_key = anthropic_api_key

    async def decompose_task(
        self,
        task_description: str,
        available_agents: List[Dict[str, Any]]
    ) -> List[Dict[str, Any]]:
        """
        Break down a high-level task into subtasks and assign to agents.

        Args:
            task_description: The high-level goal from the human
            available_agents: List of specialist agents with their roles/tools

        Returns:
            List of subtasks with assigned agents
        """
        # For MVP, we use rule-based decomposition
        # In production, this would use LLM to analyze the task

        subtasks = []
        task_lower = task_description.lower()

        # Analyze task and create subtasks
        if "review" in task_lower and "pr" in task_lower:
            subtasks = self._decompose_pr_review(task_description, available_agents)
        elif "fix" in task_lower and "bug" in task_lower:
            subtasks = self._decompose_bug_fix(task_description, available_agents)
        elif "deploy" in task_lower:
            subtasks = self._decompose_deployment(task_description, available_agents)
        else:
            # Generic task decomposition
            subtasks = self._decompose_generic(task_description, available_agents)

        return subtasks

    def _decompose_pr_review(
        self,
        task: str,
        agents: List[Dict[str, Any]]
    ) -> List[Dict[str, Any]]:
        """Decompose a PR review task."""
        subtasks = []

        # Find agents by role
        code_agent = self._find_agent_by_role(agents, ["coder", "developer", "engineer"])
        review_agent = self._find_agent_by_role(agents, ["reviewer", "qa", "quality"])
        deploy_agent = self._find_agent_by_role(agents, ["deployer", "devops", "release"])

        # Create subtask chain
        subtasks.append({
            "id": f"subtask_{uuid.uuid4().hex[:8]}",
            "description": "Fetch and analyze PR code changes",
            "agent_id": code_agent["id"] if code_agent else agents[0]["id"] if agents else None,
            "order": 1,
            "complexity_weight": 2
        })

        if review_agent:
            subtasks.append({
                "id": f"subtask_{uuid.uuid4().hex[:8]}",
                "description": "Review code for quality and security issues",
                "agent_id": review_agent["id"],
                "order": 2,
                "complexity_weight": 3
            })

        if deploy_agent:
            subtasks.append({
                "id": f"subtask_{uuid.uuid4().hex[:8]}",
                "description": "Merge PR and trigger deployment",
                "agent_id": deploy_agent["id"],
                "order": 3,
                "complexity_weight": 2,
                "requires_approval": True
            })

        return subtasks

    def _decompose_bug_fix(
        self,
        task: str,
        agents: List[Dict[str, Any]]
    ) -> List[Dict[str, Any]]:
        """Decompose a bug fix task."""
        subtasks = []

        code_agent = self._find_agent_by_role(agents, ["coder", "developer", "engineer"])
        test_agent = self._find_agent_by_role(agents, ["tester", "qa", "quality"])

        subtasks.append({
            "id": f"subtask_{uuid.uuid4().hex[:8]}",
            "description": "Investigate and identify the bug",
            "agent_id": code_agent["id"] if code_agent else agents[0]["id"] if agents else None,
            "order": 1,
            "complexity_weight": 3
        })

        subtasks.append({
            "id": f"subtask_{uuid.uuid4().hex[:8]}",
            "description": "Implement fix for the identified issue",
            "agent_id": code_agent["id"] if code_agent else agents[0]["id"] if agents else None,
            "order": 2,
            "complexity_weight": 3
        })

        if test_agent:
            subtasks.append({
                "id": f"subtask_{uuid.uuid4().hex[:8]}",
                "description": "Test the fix and verify resolution",
                "agent_id": test_agent["id"],
                "order": 3,
                "complexity_weight": 2
            })

        return subtasks

    def _decompose_deployment(
        self,
        task: str,
        agents: List[Dict[str, Any]]
    ) -> List[Dict[str, Any]]:
        """Decompose a deployment task."""
        subtasks = []

        deploy_agent = self._find_agent_by_role(agents, ["deployer", "devops", "release"])
        test_agent = self._find_agent_by_role(agents, ["tester", "qa", "quality"])

        if test_agent:
            subtasks.append({
                "id": f"subtask_{uuid.uuid4().hex[:8]}",
                "description": "Run pre-deployment tests",
                "agent_id": test_agent["id"],
                "order": 1,
                "complexity_weight": 2
            })

        subtasks.append({
            "id": f"subtask_{uuid.uuid4().hex[:8]}",
            "description": "Execute deployment to target environment",
            "agent_id": deploy_agent["id"] if deploy_agent else agents[0]["id"] if agents else None,
            "order": 2,
            "complexity_weight": 3,
            "requires_approval": True
        })

        subtasks.append({
            "id": f"subtask_{uuid.uuid4().hex[:8]}",
            "description": "Verify deployment success",
            "agent_id": deploy_agent["id"] if deploy_agent else agents[0]["id"] if agents else None,
            "order": 3,
            "complexity_weight": 1
        })

        return subtasks

    def _decompose_generic(
        self,
        task: str,
        agents: List[Dict[str, Any]]
    ) -> List[Dict[str, Any]]:
        """Generic task decomposition for unrecognized task types."""
        if not agents:
            return []

        # Simple single-agent execution
        return [{
            "id": f"subtask_{uuid.uuid4().hex[:8]}",
            "description": task,
            "agent_id": agents[0]["id"],
            "order": 1,
            "complexity_weight": 3
        }]

    def _find_agent_by_role(
        self,
        agents: List[Dict[str, Any]],
        role_keywords: List[str]
    ) -> Optional[Dict[str, Any]]:
        """Find an agent whose role matches any of the keywords."""
        for agent in agents:
            role_lower = agent.get("role", "").lower()
            name_lower = agent.get("name", "").lower()
            for keyword in role_keywords:
                if keyword in role_lower or keyword in name_lower:
                    return agent
        return None

    async def handle_handoff(
        self,
        from_agent_result: Dict[str, Any],
        to_agent: Dict[str, Any],
        handoff_config: Dict[str, bool]
    ) -> Dict[str, Any]:
        """
        Handle handoff of work between agents.

        Args:
            from_agent_result: Output from the previous agent
            to_agent: The agent receiving the work
            handoff_config: What to include in the handoff

        Returns:
            Context to pass to the next agent
        """
        handoff_context = {}

        if handoff_config.get("include_output", True):
            handoff_context["previous_output"] = from_agent_result.get("output")

        if handoff_config.get("include_summary", True):
            handoff_context["previous_summary"] = from_agent_result.get("summary")

        if handoff_config.get("include_flags", True):
            handoff_context["flags"] = from_agent_result.get("flags", [])

        if handoff_config.get("include_context", True):
            handoff_context["original_context"] = from_agent_result.get("context")

        return handoff_context

    async def detect_conflicts(
        self,
        active_subtasks: List[Dict[str, Any]]
    ) -> List[Dict[str, Any]]:
        """
        Detect conflicts between active subtasks.

        Types of conflicts:
        - Resource conflicts (same resource being modified)
        - Output conflicts (contradictory results)
        - Validation failures
        """
        conflicts = []

        # Check for resource conflicts
        resource_claims = {}
        for subtask in active_subtasks:
            resources = subtask.get("resources", [])
            for resource in resources:
                if resource in resource_claims:
                    conflicts.append({
                        "type": "resource_conflict",
                        "resource": resource,
                        "agents": [resource_claims[resource], subtask["agent_id"]],
                        "message": f"Multiple agents trying to access: {resource}"
                    })
                else:
                    resource_claims[resource] = subtask["agent_id"]

        return conflicts

    async def handle_error(
        self,
        error: Dict[str, Any],
        failed_subtask: Dict[str, Any],
        available_agents: List[Dict[str, Any]]
    ) -> Dict[str, Any]:
        """
        Handle an error from a subtask execution.

        Returns:
            Recovery action to take
        """
        error_type = error.get("type", "unknown")

        if error_type == "tool_failure":
            # Try to reassign to a different agent with the same tool
            current_agent_id = failed_subtask["agent_id"]
            alternative_agent = self._find_alternative_agent(
                available_agents,
                current_agent_id,
                failed_subtask.get("required_tools", [])
            )
            if alternative_agent:
                return {
                    "action": "reassign",
                    "new_agent_id": alternative_agent["id"],
                    "message": "Reassigning to alternative agent"
                }

        if error_type == "timeout":
            return {
                "action": "retry",
                "max_retries": 2,
                "message": "Retrying with increased timeout"
            }

        # Default: escalate to human
        return {
            "action": "escalate",
            "message": f"Unable to recover from error: {error.get('message', 'Unknown error')}"
        }

    def _find_alternative_agent(
        self,
        agents: List[Dict[str, Any]],
        exclude_agent_id: str,
        required_tools: List[str]
    ) -> Optional[Dict[str, Any]]:
        """Find an alternative agent that has the required tools."""
        for agent in agents:
            if agent["id"] == exclude_agent_id:
                continue
            agent_tools = set(agent.get("tools", []))
            if all(tool in agent_tools for tool in required_tools):
                return agent
        return None
