# POWR - Progressive Overload Workout Recorder

This is a work in progress. The development approach of using Cursor AI with thorough rules was inspired by [Coding from Beach](https://www.peregianhub.com.au/connect/technologists/).

## Rules and PRD

This project was built with carefully laid out rules and product requirement document (PRD) files in the docs and cursor folders.

The file docs/learnings.md is updated after changes and is a log of the development.

## Screenshots

### Exercise Detail

![Exercise details page.](/docs/screenshots/exerciseDetail.png)

### Dashboard

![Dashboard.](/docs/screenshots/dashboard.png)

### Login

![Login page.](/docs/screenshots/login.png)

### Logo

![POWR logo and header.](/docs/screenshots/powr-logo.jpg)

## Main Takeaways using Cursor IDE

### Make sure you have the crucial files added to the chat

Below is an output from the Agent when aksed about this:

1. Complete Context: When you attach files, I can see their complete, current content rather than just snippets from searches. This gives me the full picture of how different parts interact.

2. Current State: Search results might show older versions or partial matches, but attached files show the exact current state of the code.

3. Interdependencies: Seeing multiple related files together helps me understand how they interact. In this case, seeing all the model files together revealed the circular dependency issues.

4. Precise Line Numbers and Content: Attached files come with exact line numbers and current content, making it easier to provide precise fixes and understand error messages.

### Ask the agent what it needs

### Be Proactive

Point out all the problems and add relant files and lines to the chat. The AI won't read anything unless it thinks it has to and will often have a stab at things where you have left an instructions gap.

### The Agent can go crazy

After a lot of debugging, there was one file import that was flagging an error, even though it should be working. It looked unfixable, so brought it the attention of the agent who was baffled and wanted to go on a rampage of changes when a simple retyping of the import fixed it.

Control it or it will control you!
