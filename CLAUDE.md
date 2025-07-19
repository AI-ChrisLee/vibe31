## Claude Development Guidelines

### 1. Project Analysis & Planning

- **First step**: Thoroughly analyze the problem statement and review all relevant codebase files
- **Document**: Create a comprehensive plan in `tasks/todo.md`

### 2. Todo List Structure

- Create checkbox items (`[ ]`) that can be marked complete (`[x]`)
- Each item should be specific and measurable

### 3. Plan Approval

- **Requirement**: Present the complete plan and wait for explicit approval before starting implementation
- Do not proceed with coding until receiving confirmation

### 4. Task Organization

- **Major Checkpoints**: Define high-level milestones for each feature
- **Subtasks**: Break down each checkpoint into specific, small actionable items
- Example structure:
    
    ```
    - [ ] User Authentication (Checkpoint)
      - [ ] Set up Supabase auth configuration  
      - [ ] Create login form component  
      - [ ] Implement auth context
    
    ```
    

### 5. Development Phases (Sequential Order)

1. **Project Setup**: Initialize repository, install dependencies, configure environment
2. **Basic UI Structure**: Create layout components, routing, and navigation
3. **Database Schema**: Design and implement Supabase tables and relationships
4. **Backend Logic**: API routes, server actions, and business logic
5. **UI Enhancement**: Styling refinements, animations, and user experience improvements
6. **Deployment**: Configure Vercel, environment variables, and production settings

### 6. Technology Stack (Base Tools)

- **Database & Auth**: Supabase (use for database, authentication, and file storage)
- **Deployment**: Vercel
- **Version Control**: Git
- **Email Service**: Resend
- **Note**: These are the primary tools. Only use additional tools if functionality cannot be achieved within this stack.
- **Architecture Principle**: Maintain minimal complexity - avoid unnecessary abstractions or layers

### 7. Design Specifications

- **Framework**: Next.js with shadcn/ui components
- **Design System**: Follow shadcn/ui default design patterns
- **Typography**:
    - Titles: Font-weight 900 (Black)
    - Body text: Font-weight 500 (Medium)
    - Create strong visual hierarchy through weight contrast

### 8. Development Workflow

- Complete tasks sequentially
- Update todo items immediately upon completion: `Task completed`

### 9. Communication Protocol

- **After each task**: Provide a brief summary (2-3 sentences) explaining:
    - What was changed
    - Why the change was made
    - Impact on the system

### 10. Code Quality Standards

- **Simplicity First**: Each change should modify the minimum number of files
- **Single Responsibility**: Each function/component should do one thing well
- **Avoid**: Large refactors, complex abstractions, or over-engineering
- **Prefer**: Direct solutions, explicit code, and standard patterns

### 11. Project Completion

- Add a `## Review` section at the end of `todo.md` containing:
    - Summary of all implemented features
    - List of any deviations from the original plan
    - Known limitations or future improvements
    - Final deployment URL and access instructions