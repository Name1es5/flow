import { useState } from 'react'

const COLUMNS = [
  { id: 'not-started',       label: 'Not Started',       color: '#94a3b8' },
  { id: 'in-progress',       label: 'In Progress',       color: '#f59e0b' },
  { id: 'awaiting-approval', label: 'Awaiting Approval', color: '#8b5cf6' },
  { id: 'completed',         label: 'Completed',         color: '#10b981' },
]
const TODAY = new Date().toISOString().split('T')[0]

function TaskCard({ task, projects, onClick, onQuickComplete, onDragStart }) {
  const project = projects.find(p => p.id === task.project)
  const isOverdue = task.dueDate && task.dueDate < TODAY && task.status !== 'completed'
  const total = task.requirements.length
  const done  = task.requirements.filter(r => r.done).length
  return (
    <div className={`task-card ${task.status === 'completed' ? 'is-completed' : ''}`}
      draggable onDragStart={onDragStart} onClick={onClick}>
      <div className="card-stripe" style={{ backgroundColor: project?.color }} />
      <div className="card-body">
        <div className="card-top">
          <button className={`task-check ${task.status === 'completed' ? 'is-done' : ''}`}
            onClick={e => { e.stopPropagation(); onQuickComplete(task.id) }} title="Toggle complete">
            {task.status === 'completed' && '✓'}
          </button>
          <span className="task-title">{task.title}</span>
        </div>
        <div className="card-meta">
          <span className="project-pill" style={{ backgroundColor: project?.color + '22', color: project?.color }}>{project?.name}</span>
          {task.priority === 'high'   && <span className="priority-badge high">High</span>}
          {task.priority === 'medium' && <span className="priority-badge medium">Med</span>}
          {task.priority === 'low'    && <span className="priority-badge low">Low</span>}
          {isOverdue && <span className="overdue-badge">Overdue</span>}
        </div>
        {total > 0 && (
          <div className="card-progress">
            <div className="progress-bar"><div className="progress-fill" style={{ width: `${(done/total)*100}%` }} /></div>
            <span className="progress-text">{done}/{total}</span>
          </div>
        )}
        {task.dueDate && <div className={`card-due ${isOverdue ? 'is-overdue' : ''}`}>📅 {task.dueDate}</div>}
      </div>
    </div>
  )
}

export default function Board({ tasks, projects, onTaskClick, onStatusChange, onQuickComplete, onAddTask }) {
  const [dragId,   setDragId]   = useState(null)
  const [dragOver, setDragOver] = useState(null)
  return (
    <div className="board">
      {COLUMNS.map(col => {
        const colTasks = tasks.filter(t => t.status === col.id)
        return (
          <div key={col.id} className={`column ${dragOver === col.id ? 'drag-over' : ''}`}
            onDragOver={e => { e.preventDefault(); setDragOver(col.id) }}
            onDragLeave={() => setDragOver(null)}
            onDrop={() => { if (dragId) onStatusChange(dragId, col.id); setDragId(null); setDragOver(null) }}>
            <div className="column-header">
              <span className="column-dot" style={{ backgroundColor: col.color }} />
              <span className="column-title">{col.label}</span>
              <span className="column-count">{colTasks.length}</span>
            </div>
            <div className="column-tasks">
              {colTasks.map(task => (
                <TaskCard key={task.id} task={task} projects={projects} onClick={() => onTaskClick(task.id)}
                  onQuickComplete={onQuickComplete} onDragStart={() => setDragId(task.id)} />
              ))}
              <button className="add-col-btn" onClick={() => onAddTask(col.id)}>+ Add task</button>
            </div>
          </div>
        )
      })}
    </div>
  )
}
