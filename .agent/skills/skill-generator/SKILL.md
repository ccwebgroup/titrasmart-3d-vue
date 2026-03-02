---
name: Skill Generator
description: Generates new agent skills to handle specific tasks (e.g., 'add feature', 'refactor', 'fix', 'styling', 'brainstorm', 'improvement', etc.).
---

# Skill Generator

You are tasked with generating a new skill for the agent. A skill is a set of instructions, scripts, and resources that extend the agent's capabilities for specialized tasks.

## 1. Understand the Request & Role Selection

Determine the professional role required for the skill and the specific task type. A skill should be focused on a specific "Persona" to ensure consistent quality and perspective.

### Roles & Task Mapping:

- **UI/UX Engineer**: Focuses on premium aesthetics, layout, and user experience.
  - Tasks: `styling`, `ui-refactor`, `animation`, `component-design`, `ux-improvement`.
- **System Analyst**: Focuses on requirements, business logic, and planning.
  - Tasks: `discovery`, `brainstorm`, `task-breakdown`, `documentation`, `requirement-gathering`.
- **Software Architect**: Focuses on structure, patterns, and scalability.
  - Tasks: `structural-refactor`, `pattern-implementation`, `core-logic`, `state-design`, `service-layering`.
- **QA Tester**: Focuses on reliability, testing, and edge cases.
  - Tasks: `fix`, `unit-test`, `integration-test`, `security-audit`, `performance-check`.
- **Full-Stack Developer**: End-to-end feature development.
  - Tasks: `add-feature`, `api-integration`, `database-schema`, `improvement`.
- **AI/ML Engineer**: Focuses on AI/ML model development and integration.
  - Tasks: `ai-model-development`, `ai-model-integration`, `ai-model-evaluation`, `ai-model-deployment`.
- **Graphics Designer**: Focuses on visual design and assets.
  - Tasks: `graphic-design`, `asset-creation`, `asset-integration`, `asset-optimization`.
- **3D Artist**: Focuses on 3D model creation and integration.
  - Tasks: `3d-model-creation`, `3d-model-integration`, `3d-model-optimization`, `3d-model-animation`.
- **3D Animator**: Focuses on 3D animation and integration.
  - Tasks: `3d-animation-creation`, `3d-animation-integration`, `3d-animation-optimization`, `3d-animation-playback`.
- **Stochiometry Expert**: Focuses on stochiometry calculations and integration.
  - Tasks: `stochiometry-calculation`, `stochiometry-integration`, `stochiometry-optimization`, `stochiometry-playback`.

## 2. Directory Structure

Create a new folder for the skill under `.agent/skills/`. The folder name should be descriptive and kebab-case (e.g., `ui-ux-engineer`, `system-analyst-planner`).

## 3. Create SKILL.md

Create a `SKILL.md` file inside the new folder. This file is required and MUST contain:

### YAML Frontmatter

```yaml
---
name: [Human Readable Name (e.g. UI/UX Engineer)]
description: [Short description focused on the role's objective]
---
```

### Markdown Instructions

Provide detailed markdown instructions tailored to the **Role**. Structure it logically:

- **Role Objective**: What is the specific mindset and goal of this persona?
- **Prerequisites**: What context/files does this role need to analyze first?
- **Workflow Phase**: Assign the skill to a specific phase of the project lifecycle.
- **Actionable Steps**: Detailed procedures for the tasks this role handles.
- **Role Constants**: Specific constraints (e.g., a UI/UX Engineer must never use generic colors).

## 4. Integrate Project Architecture

The generated skill MUST instruct the agent to adhere to the project's technical stack:

- **Architecture**: Vue.js 3, Pinia (State Management), Firestore (Backend), and Shadcn UI + Tailwind CSS (Premium UI/UX).
- **Workflows**: Explicitly command the agent to review relevant workflows in `.agent/workflows/` (e.g. `task_planning.md` for analysts/architects).
- **Standards**: Emphasize modularity, type safety (TypeScript), and premium design tokens.

## 5. Additional Resources (Optional)

If the new skill requires templates (e.g., a PR template for a QA role), create directories like `templates/` or `scripts/` inside the skill folder.

## Task Execution

When a user asks you to "use the skill-generator", you should:

1. Ask for the **Role** and **Task** if not clear.
2. Autonomously plan the skill structure based on that persona.
3. Generate the skill folder and `SKILL.md` file.
