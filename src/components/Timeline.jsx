import { useState } from 'react'

const STATUS_COLORS = {
  'not-started': '#94a3b8', 'in-progress': '#f59e0b',
  'awaiting-approval': '#8b5cf6', 'completed': '#10b981',
}
const DAY_W = 34

function buildDays(year, month) {
  const count = new Date(year, month + 1, 0).getDate()
  const todayStr = new Date().toISOString().split('T')[0]
  return Array.from({ length: count }, (_, i) => {
    const d = new Date(year, month, i + 1)
    const dateStr = `${year}-${String(month+1).padStart(2,'0')}-${String(i+1).padStart(2,'0')}`
    return { idx: i, num: i+1, wkd: d.toLocaleDateString('en-US',{weekday:'short'})[0], isWeekend: d.getDay()===0||d.getDay()===6, isToday: dateStr===todayStr }
  })
}

function getBar(task, year, month, dayCount) {
  const start = task.startDate || task.dueDate
  const end   = task.dueDate   || task.startDate
  if (!start) return null
  const ms = `${year}-${String(month+1).padStart(2,'0')}-01`
  const me  = `${year}-${String(month+1).padStart(2,'0')}-${String(dayCount).padStart(2,'0')}`
  if (end < ms || start > me) return null
  const cs = start < ms ? 0 : parseInt(start.split('-')[2],10)-1
  const ce = end   > me ? dayCount-1 : parseInt(end.split('-')[2],10)-1
  return { startIdx: cs, endIdx: ce }
}

export default function Timeline({ tasks, projects, onTaskClick }) {
  const now = new Date()
  const [year,  setYear]  = useState(now.getFullYear())
  const [month, setMonth] = useState(now.getMonth())
  const days = buildDays(year, month)
  const monthLabel = new Date(year, month).toLocaleDateString('en-US',{month:'long',year:'numeric'})

  function prevMonth() { if (month===0){setMonth(11);setYear(y=>y-1)}else setMonth(m=>m-1) }
  function nextMonth() { if (month===11){setMonth(0);setYear(y=>y+1)}else setMonth(m=>m+1) }

  return (
    <div className="timeline">
      <div className="tl-controls">
        <button className="tl-nav-btn" onClick={prevMonth}>← Prev</button>
        <span className="tl-month-label">{monthLabel}</span>
        <button className="tl-nav-btn" onClick={nextMonth}>Next →</button>
        <button className="tl-nav-btn today" onClick={() => { setYear(now.getFullYear()); setMonth(now.getMonth()) }}>Today</button>
      </div>
      <div className="tl-outer">
        <div className="tl-table">
          <div className="tl-row tl-header-row">
            <div className="tl-label-col">Project / Task</div>
            <div className="tl-days-col">
              {days.map(d => (
                <div key={d.idx} className={`tl-day-head ${d.isWeekend?'weekend':''} ${d.isToday?'today-head':''}`} style={{width:DAY_W}}>
                  <span className={`tl-day-num ${d.isToday?'today-num':''}`}>{d.num}</span>
                  <span className="tl-day-wkd">{d.wkd}</span>
                </div>
              ))}
            </div>
          </div>
          {projects.map(project => {
            const projectTasks = tasks.filter(t => t.project === project.id)
            if (!projectTasks.length) return null
            return (
              <div key={project.id}>
                <div className="tl-row tl-project-header-row" style={{borderLeftColor: project.color}}>
                  <div className="tl-label-col" style={{borderLeftColor: project.color}}>
                    <span style={{color:project.color,fontSize:10}}>●</span>
                    <span style={{color:project.color}}>{project.name}</span>
                  </div>
                  <div className="tl-days-col">
                    {days.map(d => <div key={d.idx} className={`tl-section-cell ${d.isWeekend?'weekend':''}`} style={{width:DAY_W}} />)}
                  </div>
                </div>
                {projectTasks.map(task => {
                  const bar = getBar(task, year, month, days.length)
                  return (
                    <div key={task.id} className="tl-row tl-task-row" onClick={() => onTaskClick(task.id)}>
                      <div className="tl-label-col">
                        <span className="tl-status-dot" style={{backgroundColor: STATUS_COLORS[task.status]}} />
                        <span className="tl-task-name-text" title={task.title}>{task.title}</span>
                      </div>
                      <div className="tl-days-col">
                        {days.map(d => <div key={d.idx} className={`tl-cell ${d.isWeekend?'weekend':''} ${d.isToday?'today-col':''}`} style={{width:DAY_W}} />)}
                        {bar && bar.endIdx > bar.startIdx && (
                          <div className={`tl-bar ${task.status==='completed'?'is-done':''}`}
                            style={{left:bar.startIdx*DAY_W+3, width:(bar.endIdx-bar.startIdx+1)*DAY_W-6, backgroundColor:project.color}} />
                        )}
                        {bar && bar.endIdx === bar.startIdx && (
                          <div className="tl-dot-marker"
                            style={{left:bar.startIdx*DAY_W+(DAY_W/2)-8, backgroundColor:project.color, opacity:task.status==='completed'?0.4:0.85}} />
                        )}
                        {!bar && !task.startDate && !task.dueDate && <span className="tl-no-date">No dates set</span>}
                      </div>
                    </div>
                  )
                })}
              </div>
            )
          })}
        </div>
      </div>
    </div>
  )
}
