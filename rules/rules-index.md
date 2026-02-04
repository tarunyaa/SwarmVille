---
version: 1.0.0
lastUpdated: 2025-9-15
author: tarunyaas & claude-4-opus
dependencies: N/A
description: Comprehensive index of all rules in the repository to help determine which rules to apply for different tasks.
alwaysAllow: true
---
# Rules Index

This document provides a comprehensive overview of all rules in the repository and helps determine which rules to apply for different tasks.

## How Rules Work

- Rules are organized into three categories: `/Agent/`, `/Code/`, and `/Docs/`
- Multiple rules can work together
- User instructions always override default rules
- Rules are guidelines, not strict laws - adapt to context

## Quick Decision Tree

```
User Request?
├── Planning/Design?
│   ├── New Ideas? → Agent/brainstorm.md
│   └── Implementation Planning? → Agent/implement.md
├── Writing Code?
│   ├── Any Code? → Code/safety.md (always check)
│   ├── Git Commits? → Code/commit-rules.md
│   └── Need Prompts? → Agent/prompts-library.md
├── Documentation?
│   └── README? → Code/readme-gen.md
└── Need Specific Prompts?
    └── Agent/prompts-library.md
```

## Agent Rules (`/Agent/`)

### 1. **brainstorm.md**
- **Purpose**: Transform raw ideas into detailed specifications through iterative Q&A
- **When to Apply**:
  - User has a new idea or project concept
  - Need to develop requirements from vague ideas
  - Creating project specifications that can be handed off to a developer
  - Planning new features or systems
- **Process**: 
  - Iterative questioning (one question at a time)
  - Build on previous answers
  - Compile into comprehensive spec (`spec.md`)
  - Generate implementation plan
- **Key Output**: Detailed specification document (`spec.md`)
- **Time Investment**: ~10-15 minutes for brainstorming
- **Dependencies**: Conversational LLM (ChatGPT 4o / o3)

### 2. **implement.md**
- **Purpose**: Methodical approach to task implementation with strategic planning
- **When to Apply**:
  - User asks to implement a feature
  - Complex coding tasks needing planning
  - Refactoring existing code
  - Need to evaluate multiple approaches
- **Process**: 
  1. Think through strategy
  2. Evaluate approaches (pros/cons)
  3. Consider tradeoffs
  4. Implementation steps
  5. Best practices (TDD, testing, etc.)
- **Key Principles**:
  - Break down into subtasks
  - Start with core functionality
  - Implement incrementally
  - Test each component
- **Checklist**: Requirements → Approach → Tests → Code → Edge cases → Docs → Review → Performance

### 3. **prompts-library.md**
- **Purpose**: Collection of reusable prompts for LLM code generation workflows
- **When to Apply**:
  - Need prompts for spec generation
  - Creating implementation plans (TDD or non-TDD)
  - Code review and analysis
  - Generating todos and checklists
- **Contains**:
  - Spec generation prompts (iterative idea honing, compilation)
  - Planning prompts (TDD and non-TDD approaches)
  - Code analysis prompts (review, issues, missing tests)
  - Todo generation prompts
- **Usage**: Reference specific prompts as needed for different workflows
- **Note**: Prompts may need refactoring for newer model capabilities

## Code Rules (`/Code/`)

### 1. **safety.md**
- **Purpose**: Security rules for preventing sensitive data exposure
- **When to Apply**:
  - **ALWAYS** when writing code that handles credentials
  - Working with API keys or tokens
  - Database connections
  - Public repository development
  - Handling pricing/financial data
  - Any code that might contain secrets
- **Key Rules**:
  - **NEVER** commit sensitive information to version control
  - Use `.env` files with `python-dotenv`
  - Never hardcode secrets
  - Check `.gitignore` appropriately (only for actual secret files)
- **What NOT to Commit**:
  - API keys (OpenAI, AWS, Azure, GCP, etc.)
  - Passwords and credentials
  - Pricing and financial information
  - Authentication tokens
- **Best Practice**: Use environment variables via `.env` files

### 2. **commit-rules.md**
- **Purpose**: Rules for creating well-formatted git commits
- **When to Apply**:
  - User asks to create a commit
  - Preparing to commit changes
  - Need standardized commit messages
- **Features**:
  - Runs pre-commit checks by default (lint, build, generate docs)
  - Automatically stages files if none are staged
  - Uses conventional commit format with descriptive emojis
  - Suggests splitting commits for different concerns
- **Commit Types**:
  - 🎨 feat: New features
  - 🐛 fix: Bug fixes
  - 📝 docs: Documentation changes
  - ♻️ refactor: Code restructuring
  - 💄 style: Code formatting
  - ⚡️ perf: Performance improvements
  - ✅ test: Adding or correcting tests
  - 🔧 chore: Tooling, configuration, maintenance
  - 🚧 wip: Work in progress
  - 🗑️ remove: Removing code or files
  - 🚨 hotfix: Critical fixes
  - 🔒 security: Security improvements
- **Best Practices**:
  - Keep commits atomic and focused
  - Write in imperative mood
  - Use temp file for commit message, delete after push
  - Don't use `git add .` - use `git commit -a` or `git add <files>`
  - Always use `git pull` before `git push`

### 3. **readme-gen.md**
- **Purpose**: Comprehensive rules for creating well-structured README.md files
- **When to Apply**:
  - Creating new README files
  - Updating project documentation
  - User asks for documentation
- **Required Sections**:
  1. Header with Logo and Title (with badges)
  2. Project Tagline
  3. Table of Contents (with emoji icons)
  4. Getting Started (prerequisites, installation)
  5. Usage (examples, command-line syntax)
  6. Configuration (system architecture, examples)
  7. Testing (test data, commands, make targets)
  8. Contributing (guidelines)
- **Formatting Guidelines**:
  - Code blocks with syntax highlighting
  - Mermaid diagrams for workflows
  - Directory trees
  - Tables for structured information
- **Best Practices**:
  - Progressive disclosure (simple → advanced)
  - Real examples with actual file paths
  - Version compatibility notes
  - Cross-references to related docs
  - Keep examples up-to-date

## Rule Application Examples

### Scenario 1: "I have an idea for a new feature"
Apply:
- ✓ **Agent/brainstorm.md** (develop the idea iteratively)
- → Generate `spec.md` after brainstorming
- → Use **Agent/implement.md** for implementation planning
- → Reference **Agent/prompts-library.md** for planning prompts

### Scenario 2: "Write a Python function to process data"
Apply:
- ✓ **Code/safety.md** (always check - even if no obvious secrets)
- ✓ **Agent/implement.md** (if complex - plan first)
- → Consider if API keys or credentials are involved

### Scenario 3: "Create a README for my project"
Apply:
- ✓ **Code/readme-gen.md** (primary rule)
- → Follow all required sections
- → Include badges, TOC, examples

### Scenario 4: "Commit my changes"
Apply:
- ✓ **Code/commit-rules.md** (primary rule)
- ✓ **Code/safety.md** (pre-commit check for secrets)
- → Run pre-commit checks
- → Use conventional commit format with emoji
- → Use temp file for commit message

### Scenario 5: "Implement this feature"
Apply:
- ✓ **Agent/implement.md** (plan first)
  1. Think through strategy
  2. Evaluate approaches
  3. Consider tradeoffs
  4. Implementation steps
- ✓ **Code/safety.md** (check for security)
- → Write tests first (TDD)
- → Implement incrementally

### Scenario 6: "I need prompts for code generation"
Apply:
- ✓ **Agent/prompts-library.md** (reference specific prompts)
- → Choose appropriate prompt:
  - Spec generation → Idea honing prompts
  - Planning → TDD or non-TDD planning prompts
  - Code analysis → Review/issue/test prompts

### Scenario 7: "Integrate with OpenAI API"
Apply:
- ✓ **Code/safety.md** (PRIMARY - handling API keys)
  - Use `.env` file for API key
  - Never hardcode the key
  - Check `.gitignore` for `.env`
- ✓ **Agent/implement.md** (plan the integration)
- → Follow safety best practices strictly

### Scenario 8: "Review this code and find issues"
Apply:
- ✓ **Agent/prompts-library.md** (code review prompt)
- ✓ **Code/safety.md** (check for exposed secrets)
- → Use code review prompt from prompts library
- → Check for security issues

## Conflict Resolution

When rules conflict or overlap:
1. **User instructions** (absolute highest priority)
2. **Security rules** (Code/safety.md - always important)
3. **Task-specific rules** (most relevant to request)
4. **General best practices**
5. **Context adaptation** (rules guide but don't restrict)

## Communication Guidelines

Always communicate with user when:
- **From implement.md**: Uncertain about implementation approach or tradeoffs
- **From safety.md**: Potential security risks detected
- **From brainstorm.md**: Need clarification on requirements
- **General**: Multiple valid approaches exist, or confidence is low

## Meta-Rules for Rule Application

1. **Start Specific**: Apply the most specific relevant rule first
2. **Layer General**: Add general rules that complement
3. **Check Security**: Always consider Code/safety.md for any code
4. **Communicate Choices**: Tell user which rules you're following if relevant
5. **Adapt to Context**: Rules guide but don't restrict - use judgment

## Quick Reference by Task Type

| Task Type | Primary Rules | Secondary Rules |
|-----------|--------------|-----------------|
| New idea/project | Agent/brainstorm.md | Agent/implement.md |
| Implementation | Agent/implement.md | Code/safety.md |
| Git commit | Code/commit-rules.md | Code/safety.md (pre-check) |
| README creation | Code/readme-gen.md | - |
| Code with secrets | Code/safety.md | Agent/implement.md |
| Need prompts | Agent/prompts-library.md | - |
| Code review | Agent/prompts-library.md | Code/safety.md |

## File Structure

```
rules/
├── Agent/
│   ├── brainstorm.md          # Idea → Spec workflow
│   ├── implement.md            # Implementation planning
│   └── prompts-library.md      # Reusable prompts
├── Code/
│   ├── commit-rules.md         # Git commit standards
│   ├── readme-gen.md           # README structure
│   └── safety.md               # Security rules (always check)
└── Docs/
    └── (empty - for future docs rules)
```

## Remember

- **User intent overrides all rules**
- **Security (safety.md) should always be considered for code**
- **Multiple rules often apply together**
- **Communicate when uncertain**
- **Start simple, avoid overengineering**
- **Rules are guidelines, not laws - adapt to context**
