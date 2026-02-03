"""
Agent executor service - runs individual agents with their tools.
"""

from typing import Dict, Any, List, Optional
import asyncio
from datetime import datetime
import uuid

from .mock_tools import execute_mock_tool


class AgentExecutor:
    """Executes a single agent's task with its configured tools."""

    def __init__(
        self,
        agent_id: str,
        agent_name: str,
        agent_role: str,
        agent_goal: str,
        tools: List[str],
        llm_model: str,
        openai_api_key: Optional[str] = None,
        anthropic_api_key: Optional[str] = None
    ):
        self.agent_id = agent_id
        self.agent_name = agent_name
        self.agent_role = agent_role
        self.agent_goal = agent_goal
        self.tools = tools
        self.llm_model = llm_model
        self.openai_api_key = openai_api_key
        self.anthropic_api_key = anthropic_api_key
        self.execution_log: List[Dict[str, Any]] = []

    async def execute(
        self,
        task_description: str,
        context: Optional[Dict[str, Any]] = None
    ) -> Dict[str, Any]:
        """
        Execute a task and return the result.

        Returns:
            {
                "success": bool,
                "output": str,
                "summary": str,
                "flags": List[Dict],
                "tools_used": List[str],
                "cost_incurred": float,
                "execution_time_seconds": float
            }
        """
        start_time = datetime.utcnow()
        tools_used = []
        flags = []
        total_cost = 0.0

        try:
            # Log start
            self._log("execution_start", {
                "task": task_description,
                "context": context
            })

            # For MVP, we simulate LLM reasoning and tool usage
            # In production, this would use LangChain with actual LLM calls

            # Simulate "thinking" about the task
            await asyncio.sleep(0.5)
            self._log("reasoning", {"step": "Analyzing task requirements"})

            # Determine which tools to use based on task
            tools_to_use = self._select_tools(task_description)

            # Execute each tool
            tool_results = []
            for tool_name in tools_to_use:
                if tool_name in self.tools:
                    self._log("tool_call", {"tool": tool_name, "status": "starting"})
                    result = await execute_mock_tool(tool_name)
                    tool_results.append({
                        "tool": tool_name,
                        "result": result
                    })
                    tools_used.append(tool_name)
                    self._log("tool_call", {"tool": tool_name, "status": "completed", "result": result})

                    # Simulate token cost
                    total_cost += 0.01  # Simplified cost per tool call

            # Generate output based on tool results
            output = self._generate_output(task_description, tool_results)
            summary = self._generate_summary(task_description, tool_results)

            # Check for issues
            flags = self._check_for_flags(tool_results)

            end_time = datetime.utcnow()
            execution_time = (end_time - start_time).total_seconds()

            self._log("execution_complete", {
                "success": True,
                "execution_time": execution_time
            })

            return {
                "success": True,
                "output": output,
                "summary": summary,
                "flags": flags,
                "tools_used": tools_used,
                "cost_incurred": total_cost,
                "execution_time_seconds": execution_time
            }

        except Exception as e:
            end_time = datetime.utcnow()
            execution_time = (end_time - start_time).total_seconds()

            self._log("execution_error", {"error": str(e)})

            return {
                "success": False,
                "output": None,
                "summary": f"Execution failed: {str(e)}",
                "flags": [{"type": "error", "message": str(e)}],
                "tools_used": tools_used,
                "cost_incurred": total_cost,
                "execution_time_seconds": execution_time
            }

    def _select_tools(self, task_description: str) -> List[str]:
        """Select which tools to use based on task description."""
        selected = []
        task_lower = task_description.lower()

        if any(word in task_lower for word in ["pr", "pull request", "code", "review", "merge"]):
            if "github" in self.tools:
                selected.append("github")

        if any(word in task_lower for word in ["message", "notify", "slack", "team"]):
            if "slack" in self.tools:
                selected.append("slack")

        if any(word in task_lower for word in ["issue", "ticket", "jira", "bug"]):
            if "jira" in self.tools:
                selected.append("jira")

        if any(word in task_lower for word in ["lint", "quality", "style"]):
            if "code_linter" in self.tools:
                selected.append("code_linter")

        if any(word in task_lower for word in ["security", "vulnerability", "scan"]):
            if "security_scanner" in self.tools:
                selected.append("security_scanner")

        # If no specific tools matched, use the first available tool
        if not selected and self.tools:
            selected.append(self.tools[0])

        return selected

    def _generate_output(
        self,
        task: str,
        tool_results: List[Dict[str, Any]]
    ) -> str:
        """Generate output based on task and tool results."""
        if not tool_results:
            return f"Analyzed task: {task}. No tools were executed."

        outputs = []
        for tr in tool_results:
            tool_name = tr["tool"]
            result = tr["result"]
            if result.get("success"):
                outputs.append(f"{tool_name}: Completed successfully")
                if "data" in result:
                    outputs.append(f"  Data: {result['data']}")

        return "\n".join(outputs)

    def _generate_summary(
        self,
        task: str,
        tool_results: List[Dict[str, Any]]
    ) -> str:
        """Generate a brief summary of what was done."""
        successful_tools = [
            tr["tool"] for tr in tool_results
            if tr["result"].get("success")
        ]

        if successful_tools:
            return f"Completed task using {', '.join(successful_tools)}."
        else:
            return "Task analyzed but no tools were successfully executed."

    def _check_for_flags(
        self,
        tool_results: List[Dict[str, Any]]
    ) -> List[Dict[str, str]]:
        """Check tool results for any issues to flag."""
        flags = []

        for tr in tool_results:
            result = tr["result"]
            if not result.get("success"):
                flags.append({
                    "type": "error",
                    "message": f"{tr['tool']} failed: {result.get('error', 'Unknown error')}"
                })

            # Check for security issues
            if tr["tool"] == "security_scanner":
                data = result.get("data", {})
                if data.get("vulnerabilities_count", 0) > 0:
                    flags.append({
                        "type": "warning",
                        "message": f"Security scan found {data['vulnerabilities_count']} vulnerabilities"
                    })

            # Check for linting issues
            if tr["tool"] == "code_linter":
                data = result.get("data", {})
                if data.get("issues_count", 0) > 2:
                    flags.append({
                        "type": "warning",
                        "message": f"Code quality issues found: {data['issues_count']}"
                    })

        return flags

    def _log(self, event_type: str, data: Dict[str, Any]):
        """Add entry to execution log."""
        self.execution_log.append({
            "timestamp": datetime.utcnow().isoformat(),
            "agent_id": self.agent_id,
            "event_type": event_type,
            "data": data
        })

    def get_execution_log(self) -> List[Dict[str, Any]]:
        """Get the full execution log."""
        return self.execution_log
