# Flow

A lightweight, ADHD-friendly project workflow tracker built with React + Vite.

## Features

- **Kanban board** — drag and drop tasks across Not Started, In Progress, Awaiting Approval, and Completed columns
- **Timeline view** — Gantt-style overview of tasks by date
- **Table view** — sortable list of all tasks
- **Calendar view** — monthly calendar with .ics import and export
- **Task details** — priority levels, due dates, checklists, and notes
- **Multiple projects** — color-coded with per-project progress stats
- **Persistent** — all data saves to your browser's localStorage

## Live App

👉 https://flow-app-cd.netlify.app

## Running Locally

```bash
npm install
npm run dev
```

## Desktop App (macOS)

```bash
npm run dist
```

Opens the app from `release/mac/Flow.app`. On first launch, right-click → Open to bypass Gatekeeper.

## Deploying

Pushes to `main` automatically deploy to Netlify.

## Tech Stack

- React 18
- Vite
- Electron (desktop)
- localStorage for persistence
