---
version: 1.0.0
lastUpdated: 2025-9-15
author: tarunyaas & claude-4-opus (Inspired by Harper Reed's blog post: https://harper.blog/2025/02/16/my-llm-codegen-workflow-atm/)
dependencies: N/A
description: A collection of reusable prompts for LLM code generation workflows including spec generation, planning, and code analysis.
alwaysAllow: false
---
# Prompts Library

A collection of reusable prompts for LLM code generation workflows.

## Spec Generation

### Idea Honing (Iterative)

```
Ask me one question at a time so we can develop a thorough, step-by-step spec for this idea. Each question should build on my previous answers, and our end goal is to have a detailed specification I can hand off to a developer. Let's do this iteratively and dig into every relevant detail. Remember, only one question at a time.

Here's the idea:

<IDEA>
```

### Spec Compilation

```
Now that we've wrapped up the brainstorming process, can you compile our findings into a comprehensive, developer-ready specification? Include all relevant requirements, architecture choices, data handling details, error handling strategies, and a testing plan so a developer can immediately begin implementation.
```

## Planning

### TDD Planning

```
Draft a detailed, step-by-step blueprint for building this project. Then, once you have a solid plan, break it down into small, iterative chunks that build on each other. Look at these chunks and then go another round to break it into small steps. Review the results and make sure that the steps are small enough to be implemented safely with strong testing, but big enough to move the project forward. Iterate until you feel that the steps are right sized for this project.

From here you should have the foundation to provide a series of prompts for a code-generation LLM that will implement each step in a test-driven manner. Prioritize best practices, incremental progress, and early testing, ensuring no big jumps in complexity at any stage. Make sure that each prompt builds on the previous prompts, and ends with wiring things together. There should be no hanging or orphaned code that isn't integrated into a previous step.

Make sure and separate each prompt section. Use markdown. Each prompt should be tagged as text using code tags. The goal is to output prompts, but context, etc is important as well.

<SPEC>
```

### Non-TDD Planning

```
Draft a detailed, step-by-step blueprint for building this project. Then, once you have a solid plan, break it down into small, iterative chunks that build on each other. Look at these chunks and then go another round to break it into small steps. review the results and make sure that the steps are small enough to be implemented safely, but big enough to move the project forward. Iterate until you feel that the steps are right sized for this project.

From here you should have the foundation to provide a series of prompts for a code-generation LLM that will implement each step. Prioritize best practices, and incremental progress, ensuring no big jumps in complexity at any stage. Make sure that each prompt builds on the previous prompts, and ends with wiring things together. There should be no hanging or orphaned code that isn't integrated into a previous step.

Make sure and separate each prompt section. Use markdown. Each prompt should be tagged as text using code tags. The goal is to output prompts, but context, etc is important as well.

<SPEC>
```

### Todo Generation

```
Can you make a `todo.md` that I can use as a checklist? Be thorough.
```

## Code Analysis

### Code Review

```
You are a senior developer. Your job is to do a thorough code review of this code. You should write it up and output markdown. Include line numbers, and contextual info. Your code review will be passed to another teammate, so be thorough. Think deeply before writing the code review. Review every part, and don't hallucinate.
```

### GitHub Issue Generation

```
You are a senior developer. Your job is to review this code, and write out the top issues that you see with the code. It could be bugs, design choices, or code cleanliness issues. You should be specific, and be very good. Do Not Hallucinate. Think quietly to yourself, then act - write the issues. The issues will be given to a developer to executed on, so they should be in a format that is compatible with github issues
```

### Missing Tests

```
You are a senior developer. Your job is to review this code, and write out a list of missing test cases, and code tests that should exist. You should be specific, and be very good. Do Not Hallucinate. Think quietly to yourself, then act - write the issues. The issues will be given to a developer to executed on, so they should be in a format that is compatible with github issues
```

## Usage Notes

### Prompt Characteristics

These prompts are described as "old and busted" ("boomer prompts") in the original source. They may benefit from:
- Refactoring for newer model capabilities
- Adding more specific instructions
- Incorporating chain-of-thought reasoning
- Adding examples or few-shot demonstrations

### Best Practices

1. **Replace placeholders** - Fill in `<IDEA>`, `<SPEC>`, etc. with actual content
2. **Iterate** - Don't expect perfect results on first try
3. **Review outputs** - Always review and validate LLM-generated content
4. **Customize** - Adapt prompts to your specific needs and context
5. **Version control** - Track prompt changes and their effectiveness

### Model Recommendations

- **Conversational/Spec Generation**: ChatGPT 4o, o3
- **Planning/Reasoning**: o1*, o3*, r1
- **Code Generation**: Claude 3.5 Sonnet, GPT-4, Claude Engineer
- **Code Analysis**: Claude 3.5 Sonnet, GPT-4

## References

Based on: [My LLM codegen workflow atm](https://harper.blog/2025/02/16/my-llm-codegen-workflow-atm/)
