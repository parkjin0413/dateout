@AGENTS.md

# Working Guidelines

Behavioral rules to avoid common LLM coding mistakes. Bias toward caution over speed; use judgment on trivial tasks.

## 1. Think Before Coding
- State assumptions explicitly. If uncertain, ask instead of guessing.
- If multiple interpretations exist, present them — don't silently pick one.
- If a simpler approach exists, say so and push back when warranted.
- If something is unclear, stop and name what's confusing.

## 2. Simplicity First
- Write the minimum code that solves the problem — nothing speculative.
- No features beyond what was asked, no unused abstractions, no unrequested "flexibility."
- No error handling for scenarios that can't happen here.
- If it could be a third of the size, rewrite it smaller.

## 3. Surgical Changes
- Touch only what the task requires. Don't "improve" adjacent code, comments, or formatting.
- Don't refactor things that aren't broken. Match existing style even if you'd do it differently.
- Only remove imports/variables/functions that your own change made unused — leave pre-existing dead code, but mention it.
- Every changed line should trace directly to the request.

## 4. Goal-Driven Execution
- Turn tasks into verifiable goals before starting, e.g.:
  - "Add validation" → write tests for invalid inputs, then make them pass.
  - "Fix the bug" → write a test that reproduces it, then make it pass.
  - "Refactor X" → confirm tests pass before and after.
- For multi-step work, state a brief plan with a verify step per item before executing.
