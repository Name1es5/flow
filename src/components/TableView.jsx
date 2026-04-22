import { useState } from 'react'

const PRI_ORDER = { high:0, medium:1, low:2 }
const STA_ORDER = { 'not-started':0,'in-progress':1,'awaiting-approval':2,'completed':3 }
const STATUS_COLORS = { 'not-started':'#94a3b8','in-progress':'#f59e0b','awaiting-approval':'#8b5cf6','completed':'#10b981' }
const PRI_COLORS    = { high:'#ef4444', medium:'#f59e0b', low:'#94a3b8' }
const TODAY = new Date().toISOString().split('T')[0]

export default function TableView({ tasks, projects, statuses, onTaskClick, onQuickComplete, onStatusChange }) {
  const [sortBy,  setSortBy]  = useState('dueDate')
  const [sortDir, setSortDir] = useState('asc')

  function toggleSort(col) {
    if (sortBy === col) setSortDir(d => d==='asc'?'desc':'asc')
    else { setSortBy(col); setSortDir('asc') }
  }

  const sorted = [...tasks].sort((a, b) => {
    let av, bv
    switch(sortBy) {
      case 'title':    av=a.title.toLowerCase();      bv=b.title.toLowerCase();      break
      case 'project':  av=a.project;                  bv=b.project;                  break
      case 'status':   av=STA_ORDER[a.status];        bv=STA_ORDER[b.status];        break
      case 'priority': av=PRI_ORDER[a.priority];      bv=PRI_ORDER[b.priority];      break
      case 'dueDate':  av=a.dueDate||'zzz';           bv=b.dueDate||'zzz';           break
      default:         av=a.title; bv=b.title
    }
    if (av<bv) return sortDir==='asc'?-1:1
    if (av>bv) return sortDir==='asc'?1:-1
    return 0
  })

  function ColHeader({ col, label }) {
    return (
      <th className="th-sortable" onClick={() => toggleSort(col)}>
        {label}{sortBy===col && <span className="sort-arrow">{sortDir==='asc'?'↑':'↓'}</span>}
      </th>
    )
  }

  if (!tasks.length) return (
    <div className="table-view">
      <div className="empty-state"><div className="empty-icon">📋</div>No tasks found — add one to get started!</div>
    </div>
  )

  return (
    <div className="table-view">
      <table>
        <thead>
          <tr>
            <th className="td-check" />
            <ColHeader col="title"    label="Task" />
            <ColHeader col="project"  label="Project" />
            <ColHeader col="status"   label="Status" />
            <ColHeader col="priority" label="Priority" />
            <ColHeader col="dueDate"  label="Due Date" />
          </tr>
        </thead>
        <tbody>
          {sorted.map(task => {
            const project   = projects.find(p => p.id === task.project)
            const isOverdue = task.dueDate && task.dueDate < TODAY && task.status !== 'completed'
            return (
              <tr key={task.id} className={`table-row ${task.status==='completed'?'is-completed':''}`} onClick={() => onTaskClick(task.id)}>
                <td className="td-check" onClick={e => { e.stopPropagation(); onQuickComplete(task.id) }}>
                  <button className={`task-check ${task.status==='completed'?'is-done':''}`}>{task.status==='completed'&&'✓'}</button>
                </td>
                <td className="td-title"><span className={task.status==='completed'?'title-strike':''}>{task.title}</span></td>
                <td><span className="project-pill" style={{backgroundColor:project?.color+'22',color:project?.color}}>{project?.name}</span></td>
                <td onClick={e => e.stopPropagation()}>
                  <select className="status-select" value={task.status} style={{color:STATUS_COLORS[task.status]}}
                    onChange={e => onStatusChange(task.id, e.target.value)}>
                    {statuses.map(s => <option key={s.id} value={s.id}>{s.label}</option>)}
                  </select>
                </td>
                <td><span className="priority-dot" style={{backgroundColor:PRI_COLORS[task.priority]}} />{task.priority.charAt(0).toUpperCase()+task.priority.slice(1)}</td>
                <td className={isOverdue?'td-overdue':''}>{task.dueDate||'—'}{isOverdue&&' ⚠'}</td>
              </tr>
            )
          })}
        </tbody>
      </table>
    </div>
  )
}
