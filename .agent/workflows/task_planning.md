---
description: Task Planning & Feature Implementation Strategy
---

This workflow defines the robust standard operating procedure for planning, designing, and implementing new features or tasks in any project. It enforces Phase-Gate logic, Stateful Debugging, and Strict Validation to ensure industry-standard software quality.

### 1. Discovery & Domain Modeling
- **Data Integrity**: Define the schema/models. Ensure they support necessary data persistence patterns (e.g., Offline-first, Event Sourcing, or CRUD).
- **State Analysis**: Map how data flows through the application. Identify "Source of Truth" vs. "Derived State."
- **Interface Definition**: Define the contracts (Interfaces/Abstract Classes) between the Data and Domain layers before implementation.

### 2. Implementation & Code Generation
- **Layered Execution**: Implement logic following the Data → Domain → Presentation flow.
- **Automation Step**: Execute any required build tools or code generators (e.g., transpilers, ORM bindings, or dependency injection schemas).
- **Standardization**: Apply the project's specific design tokens or UI component library rules.

### 3. The Verification & Debugging Loop (The "Repair Path")
If any step in the process triggers a failure (Linter error, Compiler error, or Test failure), the agent must halt the "Happy Path" and enter this loop:
1. **Analyze**: Parse the error log to extract the Root Cause.
2. **Isolate**: Identify the specific module or layer where the state or logic diverged from the plan.
3. **Remediate**: Apply a targeted fix.
4. **Validate**: Re-run the specific check that failed.
5. **Resume**: Only return to the main workflow once the "Gate" is cleared.

### 4. Quality Assurance & Static Analysis
- **Linting**: Run the environment's static analyzer to ensure code style compliance.
- **Type Safety**: Verify that all data structures match the defined domain models.
- **Rules & Accessibility Validation (MANDATORY)**: Review the active skill's `RULES.md` (e.g., [Shadcn-Vue Rules](../skills/shadcn-vue-engineer/RULES.md)) to ensure all hard constraints on accessibility (nested modals), transitions, and design tokens have been met. Check dev logs for "Blocked aria-hidden" warnings.
- **Performance Check**: Verify that the new implementation does not introduce redundant network calls or excessive memory usage.

### How to use?
- The Workflow provides the logic (The "How").
- The Context Config provides the tech (The "What" — e.g., "Use Flutter," "Use Riverpod").
