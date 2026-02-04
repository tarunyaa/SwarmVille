---
version: 1.0.0
lastUpdated: 2025-9-15
author: tarunyaas & claude-4-opus (Inspired by Harper Reed's blog post: https://harper.blog/2025/02/16/my-llm-codegen-workflow-atm/)
dependencies: N/A
description: Guide for transforming basic ideas into detailed specifications through iterative Q&A and brainstorming.
alwaysAllow: false
---
# Brainstorming and Spec Generation

Workflow for developing thorough specifications through iterative brainstorming with LLMs.

## Overview

Use conversational LLMs (ChatGPT 4o / o3) to iteratively refine ideas into comprehensive, developer-ready specifications.

## Step 1: Iterative Idea Honing

Start with an initial prompt that guides the LLM to ask questions one at a time.

### Initial Prompt

```
Ask me one question at a time so we can develop a thorough, step-by-step spec for this idea. Each question should build on my previous answers, and our end goal is to have a detailed specification I can hand off to a developer. Let's do this iteratively and dig into every relevant detail. Remember, only one question at a time.

Here's the idea:

<IDEA>
```

### Process

1. **Start the conversation** - Paste your idea into the prompt above
2. **Answer questions** - Respond to each question the LLM asks
3. **Build iteratively** - Each question builds on previous answers
4. **Dig deep** - Explore every relevant detail
5. **Natural conclusion** - The brainstorming will come to a natural end

### Key Principles

- **One question at a time** - Keeps focus and prevents overwhelm
- **Iterative building** - Each answer informs the next question
- **Thorough exploration** - Don't skip details
- **Natural flow** - Let the conversation develop organically

## Step 2: Spec Compilation

Once brainstorming concludes, compile everything into a comprehensive specification.

### Compilation Prompt

```
Now that we've wrapped up the brainstorming process, can you compile our findings into a comprehensive, developer-ready specification? Include all relevant requirements, architecture choices, data handling details, error handling strategies, and a testing plan so a developer can immediately begin implementation.
```

### Output

Save the compiled specification as `spec.md` in your repository.

### What to Include

The spec should contain:
- **Requirements** - All functional and non-functional requirements
- **Architecture choices** - System design and structure decisions
- **Data handling** - How data flows through the system
- **Error handling** - Strategies for managing errors and edge cases
- **Testing plan** - How the project will be tested

# Brainstorm Idea

Transform raw ideas into detailed, actionable specifications through iterative questioning and planning.

## Process:

Start by asking the user to describe their ideas. Then, follow the steps below.

### 1. Iterative Idea Development
- Ask one question at a time to get more clarity on the user's idea
- Build on previous answers
- Dig into every relevant detail
- Let the conversation flow naturally
- Continue until a natural conclusion

### 2. Sample Areas to Explore
- **Core Concept**
  - What problem does this solve?
  - Who is this for?

- **Technical Requirements**
  - Architecture choices
  - Technology stack
  - Data handling strategies
  - Integration points
  - Performance requirements

- **User Experience**
  - User workflows
  - Interface requirements
  - Error handling from user perspective

- **Implementation Details**
  - Security considerations
  - Scalability needs
  - Deployment strategy
  - Maintenance requirements

### 3. Compile Specification
After brainstorming concludes:
- Consolidate all findings
- Create developer-ready specification
- Include:
  - Functional requirements
  - Non-functional requirements
  - Architecture decisions
  - Data models and flow
  - Error handling strategies
  - Testing plan
  - Success metrics
- Save as `spec.md`

### 4. Generate Implementation Plan
Using spec.md:

#### For Test Driven Approach:
- Create detailed blueprint
- Break into small, testable chunks
- Ensure incremental progress
- Prioritize early testing
- Each step builds on previous
- No orphaned code

#### For Non-Test Driven Approach:
- Create step-by-step blueprint
- Break into manageable chunks
- Ensure safe implementation
- Maintain incremental progress
- Integrate at each step

### 5. Create Deliverables
1. **prompt_plan.md**
   - Series of prompts for code generation
   - Each prompt clearly separated
   - Tagged with markdown code blocks
   - Progressive complexity

2. **todo.md**
   - Comprehensive checklist
   - Can be checked off during implementation
   - Maintains state across sessions

## Best Practices:
- Keep questions focused and specific
- Allow natural exploration
- Don't rush to implementation
- Document all decisions
- Consider edge cases early
- Think about maintenance from the start

## Checklist:
- [ ] Initial idea captured
- [ ] All aspects explored through Q&A
- [ ] Comprehensive spec created
- [ ] Implementation plan generated
- [ ] Prompts structured and separated
- [ ] Todo checklist created
- [ ] All deliverables saved in repo## Alternative Uses for Specs

Beyond code generation, specs can be used for:

### Idea Validation

Pass the spec to a reasoning model to identify potential issues:

```
Review this specification and identify potential problems, edge cases, or areas that need deeper consideration. Think critically about the design choices and suggest improvements.
```

### White Paper Generation

Transform the spec into a white paper:

```
Convert this specification into a comprehensive white paper that explains the project, its goals, architecture, and implementation approach. Make it suitable for stakeholders and technical audiences.
```

### Business Model Development

Use the spec to develop business models:

```
Based on this technical specification, develop a business model that outlines how this product could be monetized, what markets it serves, and what the value proposition is.
```

### Deep Research

Generate supporting documentation:

```
Using this specification as a foundation, generate a 10,000-word research document that explores the technical, market, and implementation aspects of this project in depth.
```

## Best Practices

### During Brainstorming

- **Be thorough** - Don't rush through answers
- **Think ahead** - Consider edge cases and alternatives
- **Be honest** - If you don't know something, say so
- **Stay focused** - Keep answers relevant to the question

### After Compilation

- **Review the spec** - Make sure it captures everything discussed
- **Fill gaps** - Add any missing details manually if needed
- **Validate** - Check that requirements are clear and testable
- **Share** - Use it as a reference for all stakeholders

## Time Investment

The brainstorming process typically takes **10-15 minutes** depending on:
- Complexity of the idea
- Depth of exploration needed
- Number of questions asked
- Your response time

## Next Steps

After creating your `spec.md`:

1. **Review** - Make sure it's complete and accurate
2. **Plan** - Use the spec to create an implementation plan
3. **Execute** - Begin development using the spec as your guide
4. **Reference** - Keep it handy throughout the project

## References

Based on: [My LLM codegen workflow atm](https://harper.blog/2025/02/16/my-llm-codegen-workflow-atm/)
