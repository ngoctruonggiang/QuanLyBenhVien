# Gemini CLI Guide

This guide provides basic instructions on how to interact with the Gemini CLI.

## General Interaction

The Gemini CLI is an interactive agent. You can provide instructions, ask questions, or request tasks directly in natural language.

## Key Principles

- **Be Clear and Concise:** Provide clear and specific instructions for the best results.
- **Context Matters:** The agent uses the current project structure and your previous interactions as context.
- **Tool Usage:** The agent will use various tools (like `run_shell_command`, `read_file`, `write_file`, `replace`, `search_file_content`, `list_directory`, `glob`, `web_fetch`, `codebase_investigator`, `write_todos`, `google_web_search`, `save_memory`) to fulfill your requests. You will be notified when a tool is being used.

## Basic Commands/Interactions

1.  **Ask Questions:**
    - "What does `app/layout.tsx` do?"
    - "Explain the purpose of the `use-auth.ts` hook."

2.  **Request Tasks:**
    - "Fix the bug in `components/ui/button.tsx` where the button doesn't disable correctly."
    - "Add a new component called `SettingsPanel.tsx` in `components/admin`."
    - "Refactor the `AuthContext.tsx` to use `useState` instead of `useReducer`."

3.  **File Operations:**
    - "Read the content of `package.json`."
    - "Create a new file `src/utils/helpers.ts` with a function `formatDate`."
    - "Delete the file `old-script.js`." (Note: Confirm before deleting important files).

4.  **Shell Commands:**
    - You can ask the agent to run shell commands, but it will usually use its internal tools for file operations. If a specific shell command is needed, explain its purpose.
    - "Run `npm install`."
    - "What is the output of `git status`?"

5.  **Commit Changes:**
    - After making changes, you can ask the agent to commit them: "Commit these changes with the message 'feat: add new user settings page'." The agent will propose a commit message based on the changes.

6.  **Help and Information:**
    - Type `/help` to see general help information about the CLI.
    - The agent will provide explanations and ask for clarification if your request is ambiguous.

## Important Notes

- The agent operates within the current project directory.
- It respects `.gitignore` and other project conventions.
- Always review the agent's proposed changes or actions before confirming, especially for critical operations.
- For complex tasks, the agent may break them down into smaller sub-tasks and use a ToDo list to track progress.
- If you need to provide specific preferences or facts for the agent to remember for future sessions, you can ask it to "save this in memory: [your fact]".

Let's get started! How can I help you today?
