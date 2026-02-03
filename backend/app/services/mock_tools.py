"""
Mock tools for MVP development.
These simulate real tool behavior without actual API calls.
"""

from typing import Dict, Any, Callable
import random
import asyncio


class MockTool:
    """Base class for mock tools."""

    def __init__(self, name: str, description: str):
        self.name = name
        self.description = description

    async def execute(self, **kwargs) -> Dict[str, Any]:
        raise NotImplementedError


class MockGitHubTool(MockTool):
    """Mock GitHub tool for PR operations."""

    def __init__(self):
        super().__init__(
            name="github",
            description="GitHub integration for repository operations"
        )

    async def execute(self, action: str = "list_prs", **kwargs) -> Dict[str, Any]:
        # Simulate API delay
        await asyncio.sleep(random.uniform(0.5, 1.5))

        if action == "list_prs":
            return {
                "success": True,
                "data": [
                    {"id": 123, "title": "Fix authentication bug", "status": "open"},
                    {"id": 124, "title": "Add user profile page", "status": "open"},
                ]
            }
        elif action == "get_pr":
            pr_id = kwargs.get("pr_id", 123)
            return {
                "success": True,
                "data": {
                    "id": pr_id,
                    "title": "Fix authentication bug",
                    "description": "Fixes the login timeout issue",
                    "files_changed": ["src/auth.py", "tests/test_auth.py"],
                    "additions": 45,
                    "deletions": 12,
                    "status": "open"
                }
            }
        elif action == "review_pr":
            return {
                "success": True,
                "data": {
                    "review_status": "approved",
                    "comments": [
                        "Code looks good",
                        "Tests are comprehensive"
                    ]
                }
            }
        elif action == "merge_pr":
            return {
                "success": True,
                "data": {
                    "merged": True,
                    "merge_commit": "abc123def"
                }
            }
        else:
            return {"success": False, "error": f"Unknown action: {action}"}


class MockSlackTool(MockTool):
    """Mock Slack tool for messaging."""

    def __init__(self):
        super().__init__(
            name="slack",
            description="Slack integration for team communication"
        )

    async def execute(self, action: str = "send_message", **kwargs) -> Dict[str, Any]:
        await asyncio.sleep(random.uniform(0.3, 0.8))

        if action == "send_message":
            return {
                "success": True,
                "data": {
                    "message_id": f"msg_{random.randint(1000, 9999)}",
                    "channel": kwargs.get("channel", "#general"),
                    "sent_at": "2024-01-15T10:30:00Z"
                }
            }
        elif action == "read_channel":
            return {
                "success": True,
                "data": {
                    "messages": [
                        {"user": "alice", "text": "Has anyone reviewed PR #123?"},
                        {"user": "bob", "text": "I'll take a look"},
                    ]
                }
            }
        else:
            return {"success": False, "error": f"Unknown action: {action}"}


class MockJiraTool(MockTool):
    """Mock Jira tool for issue tracking."""

    def __init__(self):
        super().__init__(
            name="jira",
            description="Jira integration for issue tracking"
        )

    async def execute(self, action: str = "list_issues", **kwargs) -> Dict[str, Any]:
        await asyncio.sleep(random.uniform(0.5, 1.0))

        if action == "list_issues":
            return {
                "success": True,
                "data": [
                    {"key": "PROJ-101", "summary": "Bug in login flow", "status": "Open"},
                    {"key": "PROJ-102", "summary": "Add password reset", "status": "In Progress"},
                ]
            }
        elif action == "get_issue":
            return {
                "success": True,
                "data": {
                    "key": kwargs.get("issue_key", "PROJ-101"),
                    "summary": "Bug in login flow",
                    "description": "Users cannot log in after session timeout",
                    "status": "Open",
                    "priority": "High"
                }
            }
        elif action == "update_issue":
            return {
                "success": True,
                "data": {
                    "key": kwargs.get("issue_key", "PROJ-101"),
                    "updated": True
                }
            }
        else:
            return {"success": False, "error": f"Unknown action: {action}"}


class MockCodeLinterTool(MockTool):
    """Mock code linter tool."""

    def __init__(self):
        super().__init__(
            name="code_linter",
            description="Code quality analysis tool"
        )

    async def execute(self, code: str = "", **kwargs) -> Dict[str, Any]:
        await asyncio.sleep(random.uniform(0.5, 1.5))

        # Simulate linting results
        issues_found = random.randint(0, 3)
        issues = []
        for i in range(issues_found):
            issues.append({
                "line": random.randint(1, 100),
                "type": random.choice(["warning", "error", "info"]),
                "message": random.choice([
                    "Line too long",
                    "Unused variable",
                    "Missing docstring",
                    "Import should be at top"
                ])
            })

        return {
            "success": True,
            "data": {
                "issues_count": issues_found,
                "issues": issues,
                "quality_score": 100 - (issues_found * 10)
            }
        }


class MockSecurityScannerTool(MockTool):
    """Mock security scanner tool."""

    def __init__(self):
        super().__init__(
            name="security_scanner",
            description="Security vulnerability scanner"
        )

    async def execute(self, code: str = "", **kwargs) -> Dict[str, Any]:
        await asyncio.sleep(random.uniform(1.0, 2.0))

        # Simulate security scan
        vulnerabilities = random.randint(0, 2)
        findings = []
        for i in range(vulnerabilities):
            findings.append({
                "severity": random.choice(["low", "medium", "high"]),
                "type": random.choice([
                    "SQL Injection Risk",
                    "XSS Vulnerability",
                    "Hardcoded Secret",
                    "Insecure Dependency"
                ]),
                "location": f"file.py:line {random.randint(1, 200)}"
            })

        return {
            "success": True,
            "data": {
                "vulnerabilities_count": vulnerabilities,
                "findings": findings,
                "security_score": "A" if vulnerabilities == 0 else "B" if vulnerabilities == 1 else "C"
            }
        }


# Tool registry
MOCK_TOOLS: Dict[str, MockTool] = {
    "github": MockGitHubTool(),
    "slack": MockSlackTool(),
    "jira": MockJiraTool(),
    "code_linter": MockCodeLinterTool(),
    "security_scanner": MockSecurityScannerTool(),
}


def get_mock_tool(tool_name: str) -> MockTool | None:
    """Get a mock tool by name."""
    return MOCK_TOOLS.get(tool_name)


async def execute_mock_tool(tool_name: str, **kwargs) -> Dict[str, Any]:
    """Execute a mock tool and return results."""
    tool = get_mock_tool(tool_name)
    if not tool:
        return {"success": False, "error": f"Unknown tool: {tool_name}"}
    return await tool.execute(**kwargs)
