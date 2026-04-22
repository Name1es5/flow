export const PROJECTS = [
  { id: 'default', name: 'New Project', color: '#2863c5' },
]

export const STATUSES = [
  { id: 'not-started',       label: 'Not Started',       color: '#94a3b8' },
  { id: 'in-progress',       label: 'In Progress',       color: '#f59e0b' },
  { id: 'awaiting-approval', label: 'Awaiting Approval', color: '#8b5cf6' },
  { id: 'completed',         label: 'Completed',         color: '#10b981' },
]

export const PRIORITIES = [
  { id: 'high',   label: 'High',   color: '#ef4444' },
  { id: 'medium', label: 'Medium', color: '#f59e0b' },
  { id: 'low',    label: 'Low',    color: '#94a3b8' },
]

export function createTask(overrides = {}) {
  return {
    id: Date.now().toString(36) + Math.random().toString(36).slice(2),
    title: 'New Task',
    project: 'default',
    status: 'not-started',
    priority: 'medium',
    startDate: '',
    dueDate: '',
    requirements: [],
    notes: '',
    createdAt: new Date().toISOString().split('T')[0],
    ...overrides,
  }
}

const STORAGE_KEY = 'mockflow_tasks_v1'
const PROJECTS_KEY = 'mockflow_projects_v1'

export function loadProjects() {
  try {
    const stored = localStorage.getItem(PROJECTS_KEY)
    if (stored) {
      const saved = JSON.parse(stored)
      return PROJECTS.map(p => {
        const match = saved.find(s => s.id === p.id)
        return match ? { ...p, color: match.color, name: match.name || p.name } : p
      })
    }
  } catch {}
  return PROJECTS
}

export function saveProjects(projects) {
  localStorage.setItem(PROJECTS_KEY, JSON.stringify(projects))
}

export function loadTasks() {
  try {
    const stored = localStorage.getItem(STORAGE_KEY)
    return stored ? JSON.parse(stored) : []
  } catch {
    return []
  }
}

export function saveTasks(tasks) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(tasks))
}

export const SAMPLE_TASKS = [
  {
    id: 'sc1',
    title: 'Redesign dashboard banner',
    project: 'smartcredit',
    status: 'in-progress',
    priority: 'high',
    startDate: '2026-04-18',
    dueDate: '2026-04-25',
    requirements: [
      { id: 'r1', text: 'Review existing banner design', done: true },
      { id: 'r2', text: 'Create 3 mockup variations', done: true },
      { id: 'r3', text: 'Get stakeholder feedback', done: false },
      { id: 'r4', text: 'Finalize and deliver assets', done: false },
    ],
    notes: 'Focus on making it cleaner and less cluttered.',
    createdAt: '2026-04-15',
  },
  {
    id: 'sc2',
    title: 'Mobile filter panel redesign',
    project: 'smartcredit',
    status: 'not-started',
    priority: 'medium',
    startDate: '2026-04-24',
    dueDate: '2026-05-02',
    requirements: [
      { id: 'r1', text: 'Map out all filter options', done: false },
      { id: 'r2', text: 'Design checkbox variant', done: false },
    ],
    notes: '',
    createdAt: '2026-04-20',
  },
  {
    id: '4k1',
    title: '4K Report hero section',
    project: '4k-report',
    status: 'awaiting-approval',
    priority: 'high',
    startDate: '2026-04-10',
    dueDate: '2026-04-22',
    requirements: [
      { id: 'r1', text: 'Design 3 hero variants', done: true },
      { id: 'r2', text: 'Add copy from content team', done: true },
      { id: 'r3', text: 'Incorporate feedback', done: false },
    ],
    notes: 'Waiting on final approval from marketing.',
    createdAt: '2026-04-10',
  },
  {
    id: 'hogo1',
    title: 'Onboarding flow redesign',
    project: 'hogo',
    status: 'completed',
    priority: 'high',
    startDate: '2026-04-07',
    dueDate: '2026-04-18',
    requirements: [
      { id: 'r1', text: 'Map user journey', done: true },
      { id: 'r2', text: 'Design 5-step onboarding screens', done: true },
      { id: 'r3', text: 'Handoff to dev', done: true },
    ],
    notes: 'Completed and handed off to dev team on April 18.',
    createdAt: '2026-04-07',
  },
  {
    id: 'hogo2',
    title: 'Privacy settings page',
    project: 'hogo',
    status: 'in-progress',
    priority: 'medium',
    startDate: '2026-04-19',
    dueDate: '2026-04-28',
    requirements: [
      { id: 'r1', text: 'List all privacy toggles needed', done: true },
      { id: 'r2', text: 'Design toggle components', done: false },
    ],
    notes: '',
    createdAt: '2026-04-19',
  },
  {
    id: 'ls1',
    title: 'Landing page design',
    project: 'lending-score',
    status: 'not-started',
    priority: 'high',
    startDate: '2026-04-22',
    dueDate: '2026-05-05',
    requirements: [
      { id: 'r1', text: 'Competitor analysis', done: false },
      { id: 'r2', text: 'Wireframe homepage layout', done: false },
      { id: 'r3', text: 'Design hi-fi mockup', done: false },
    ],
    notes: '',
    createdAt: '2026-04-21',
  },
]
