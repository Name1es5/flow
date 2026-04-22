import { useState, useRef } from 'react'
import { createTask } from '../data'

function parseICS(text) {
  const tasks = []
  const events = text.split('BEGIN:VEVENT').slice(1)
  events.forEach(block => {
    const get = key => {
      const match = block.match(new RegExp(`${key}[^:]*:([^\r\n]+)`))
      return match ? match[1].trim() : ''
    }
    const summary = get('SUMMARY').replace(/\\,/g, ',').replace(/\\n/g, '\n')
    const desc    = get('DESCRIPTION').replace(/\\,/g, ',').replace(/\\n/g, '\n')
    const dtstart = get('DTSTART')
    if (!summary) return

    // Parse date — handle DATE (20260425) and DATETIME (20260425T120000Z)
    let dueDate = ''
    const raw = dtstart.replace(/[TZ]/g, '').slice(0, 8)
    if (raw.length === 8) {
      dueDate = `${raw.slice(0,4)}-${raw.slice(4,6)}-${raw.slice(6,8)}`
    }

    tasks.push(createTask({ title: summary, notes: desc, dueDate }))
  })
  return tasks
}

const WEEKDAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']

function buildGrid(year, month) {
  const firstDay    = new Date(year, month, 1).getDay()
  const daysInMonth = new Date(year, month + 1, 0).getDate()
  const prevDays    = new Date(year, month, 0).getDate()
  const cells = []

  for (let i = firstDay - 1; i >= 0; i--)
    cells.push({ day: prevDays - i, cur: false })
  for (let d = 1; d <= daysInMonth; d++)
    cells.push({ day: d, cur: true })
  while (cells.length % 7 !== 0)
    cells.push({ day: cells.length - daysInMonth - firstDay + 1, cur: false })

  return cells
}

function exportICS(tasks) {
  const lines = [
    'BEGIN:VCALENDAR',
    'VERSION:2.0',
    'PRODID:-//Flow//Tasks//EN',
    'CALSCALE:GREGORIAN',
    'METHOD:PUBLISH',
  ]
  tasks.filter(t => t.dueDate).forEach(task => {
    const dateStr = task.dueDate.replace(/-/g, '')
    const nextDay = new Date(task.dueDate)
    nextDay.setDate(nextDay.getDate() + 1)
    const nextStr = nextDay.toISOString().split('T')[0].replace(/-/g, '')
    const stamp   = new Date().toISOString().replace(/[-:.]/g, '').slice(0, 15) + 'Z'
    lines.push(
      'BEGIN:VEVENT',
      `UID:${task.id}@flow`,
      `DTSTAMP:${stamp}`,
      `DTSTART;VALUE=DATE:${dateStr}`,
      `DTEND;VALUE=DATE:${nextStr}`,
      `SUMMARY:${task.title.replace(/,/g, '\\,')}`,
      task.notes ? `DESCRIPTION:${task.notes.replace(/\n/g, '\\n').replace(/,/g, '\\,')}` : '',
      'END:VEVENT',
    ).filter(Boolean)
  })
  lines.push('END:VCALENDAR')

  const blob = new Blob([lines.join('\r\n')], { type: 'text/calendar' })
  const url  = URL.createObjectURL(blob)
  const a    = document.createElement('a')
  a.href = url; a.download = 'flow-tasks.ics'; a.click()
  URL.revokeObjectURL(url)
}

export default function CalendarView({ tasks, projects, onTaskClick, onImport }) {
  const now = new Date()
  const [year,  setYear]  = useState(now.getFullYear())
  const [month, setMonth] = useState(now.getMonth())
  const [importMsg, setImportMsg] = useState('')
  const fileRef = useRef(null)

  function handleImportFile(e) {
    const file = e.target.files[0]
    if (!file) return
    const reader = new FileReader()
    reader.onload = ev => {
      const imported = parseICS(ev.target.result)
      if (imported.length) {
        onImport(imported)
        setImportMsg(`✓ Imported ${imported.length} task${imported.length > 1 ? 's' : ''}`)
      } else {
        setImportMsg('No events found in file')
      }
      setTimeout(() => setImportMsg(''), 3000)
    }
    reader.readAsText(file)
    e.target.value = ''
  }

  const cells    = buildGrid(year, month)
  const todayStr = now.toISOString().split('T')[0]
  const monthLabel = new Date(year, month).toLocaleDateString('en-US', { month: 'long', year: 'numeric' })

  function prevMonth() { if (month === 0) { setMonth(11); setYear(y => y-1) } else setMonth(m => m-1) }
  function nextMonth() { if (month === 11) { setMonth(0); setYear(y => y+1) } else setMonth(m => m+1) }

  function tasksForDay(day) {
    if (!day.cur) return []
    const dateStr = `${year}-${String(month+1).padStart(2,'0')}-${String(day.day).padStart(2,'0')}`
    return tasks.filter(t => t.dueDate === dateStr)
  }

  return (
    <div className="cal-wrap">
      <div className="cal-controls">
        <button className="tl-nav-btn" onClick={prevMonth}>← Prev</button>
        <span className="tl-month-label">{monthLabel}</span>
        <button className="tl-nav-btn" onClick={nextMonth}>Next →</button>
        <button className="tl-nav-btn today" onClick={() => { setYear(now.getFullYear()); setMonth(now.getMonth()) }}>Today</button>
        <div className="cal-file-actions">
          <button className="cal-export-btn" onClick={() => exportICS(tasks)}>↓ Export .ics</button>
          <button className="cal-export-btn" onClick={() => fileRef.current.click()}>↑ Import .ics</button>
          <input ref={fileRef} type="file" accept=".ics" style={{ display: 'none' }} onChange={handleImportFile} />
          {importMsg && <span className="cal-import-msg">{importMsg}</span>}
        </div>
      </div>

      <div className="cal-grid-wrap">
        <div className="cal-grid">
          {WEEKDAYS.map(d => (
            <div key={d} className="cal-day-header">{d}</div>
          ))}
          {cells.map((cell, i) => {
            const dayTasks = tasksForDay(cell)
            const dateStr  = `${year}-${String(month+1).padStart(2,'0')}-${String(cell.day).padStart(2,'0')}`
            const isToday  = cell.cur && dateStr === todayStr
            return (
              <div key={i} className={`cal-cell ${!cell.cur ? 'other-month' : ''} ${isToday ? 'today' : ''}`}>
                <span className={`cal-day-num ${isToday ? 'today-num' : ''}`}>{cell.day}</span>
                <div className="cal-cell-tasks">
                  {dayTasks.slice(0, 3).map(task => {
                    const project = projects.find(p => p.id === task.project)
                    return (
                      <button key={task.id} className={`cal-task-chip ${task.status === 'completed' ? 'done' : ''}`}
                        style={{ backgroundColor: project?.color + '22', color: project?.color, borderColor: project?.color + '44' }}
                        onClick={() => onTaskClick(task.id)}
                        title={task.title}>
                        {task.title}
                      </button>
                    )
                  })}
                  {dayTasks.length > 3 && (
                    <span className="cal-overflow">+{dayTasks.length - 3} more</span>
                  )}
                </div>
              </div>
            )
          })}
        </div>
      </div>
    </div>
  )
}
