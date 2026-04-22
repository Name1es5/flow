import { useState, useEffect, useRef, useCallback } from 'react'
import Sidebar from './components/Sidebar'
import Board from './components/Board'
import Timeline from './components/Timeline'
import TableView from './components/TableView'
import CalendarView from './components/CalendarView'
import TaskModal from './components/TaskModal'
import { PROJECTS, STATUSES, PRIORITIES, createTask, loadTasks, saveTasks, loadProjects, saveProjects } from './data'
import './App.css'

const SWATCHES = [
  '#2863c5','#7c3aed','#059669','#e85d04',
  '#ef4444','#ec4899','#0891b2','#d97706',
  '#4f46e5','#be185d','#0f766e','#9333ea',
  '#15803d','#b45309','#64748b','#1f2937',
]

function HeaderColorPicker({ color, onSelect, onClose }) {
  const ref = useRef(null)
  useEffect(() => {
    const h = e => { if (ref.current && !ref.current.contains(e.target)) onClose() }
    document.addEventListener('mousedown', h)
    return () => document.removeEventListener('mousedown', h)
  }, [onClose])
  return (
    <div className="header-color-picker" ref={ref}>
      <div className="color-picker-label">Pick a color</div>
      <div className="color-swatches">
        {SWATCHES.map(c => (
          <button key={c} className={`color-swatch ${c === color ? 'active' : ''}`}
            style={{ backgroundColor: c }} onClick={() => { onSelect(c); onClose() }} title={c} />
        ))}
      </div>
    </div>
  )
}

function EditableTitle({ name, color, onSave }) {
  const [editing, setEditing] = useState(false)
  const [value,   setValue]   = useState(name)
  const inputRef = useRef(null)

  useEffect(() => { setValue(name) }, [name])
  useEffect(() => { if (editing) { inputRef.current?.focus(); inputRef.current?.select() } }, [editing])

  function commit() {
    const t = value.trim()
    if (t && t !== name) onSave(t)
    else setValue(name)
    setEditing(false)
  }

  if (editing) return (
    <input
      ref={inputRef}
      className="header-title-input"
      value={value}
      onChange={e => setValue(e.target.value)}
      onBlur={commit}
      onKeyDown={e => {
        if (e.key === 'Enter') commit()
        if (e.key === 'Escape') { setValue(name); setEditing(false) }
      }}
    />
  )

  return (
    <h1 className="page-title page-title-editable" title="Click to rename" onClick={() => setEditing(true)}>
      {name}
    </h1>
  )
}

export default function App() {
  const [tasks,    setTasks]    = useState(() => loadTasks())
  const [projects, setProjects] = useState(() => loadProjects())
  const [view,     setView]     = useState('board')   // 'board' | 'timeline' | 'table' | 'calendar'
  const [activeProject, setActiveProject] = useState('all')
  const [selectedTaskId, setSelectedTaskId] = useState(null)
  const [search, setSearch] = useState('')
  const [headerPickerOpen, setHeaderPickerOpen] = useState(false)
  const closeHeaderPicker = useCallback(() => setHeaderPickerOpen(false), [])

  useEffect(() => { saveTasks(tasks) },    [tasks])
  useEffect(() => { saveProjects(projects) }, [projects])

  function updateProjectColor(id, color) {
    setProjects(prev => prev.map(p => p.id === id ? { ...p, color } : p))
  }

  function updateProjectName(id, name) {
    setProjects(prev => prev.map(p => p.id === id ? { ...p, name } : p))
  }

  function handleProjectChange(id) {
    setActiveProject(id)
    // If switching to a project from calendar, go back to board
    if (view === 'calendar') setView('board')
  }

  function handleCalendarOpen() {
    setView('calendar')
    setActiveProject('all')
  }

  function importTasks(newTasks) {
    setTasks(prev => [...prev, ...newTasks])
  }

  function addProject() {
    const colors = ['#2863c5','#7c3aed','#059669','#e85d04','#ef4444','#ec4899','#0891b2','#d97706']
    const usedColors = projects.map(p => p.color)
    const color = colors.find(c => !usedColors.includes(c)) || colors[Math.floor(Math.random() * colors.length)]
    const id = 'proj_' + Date.now().toString(36)
    const newProject = { id, name: 'New Project', color }
    setProjects(prev => [...prev, newProject])
    setActiveProject(id)
    if (view === 'calendar') setView('board')
  }

  function deleteProject(id) {
    if (projects.length <= 1) return // keep at least one project
    const remaining = projects.filter(p => p.id !== id)
    setProjects(remaining)
    // reassign tasks belonging to deleted project to the first remaining project
    setTasks(prev => prev.map(t => t.project === id ? { ...t, project: remaining[0].id } : t))
    if (activeProject === id) setActiveProject('all')
  }

  const isCalendar = view === 'calendar'

  const filteredTasks = tasks.filter(t => {
    if (!isCalendar && activeProject !== 'all' && t.project !== activeProject) return false
    if (search && !t.title.toLowerCase().includes(search.toLowerCase())) return false
    return true
  })

  const selectedTask = tasks.find(t => t.id === selectedTaskId) ?? null

  function updateTask(id, updates) {
    setTasks(prev => prev.map(t => (t.id === id ? { ...t, ...updates } : t)))
  }

  function deleteTask(id) {
    setTasks(prev => prev.filter(t => t.id !== id))
    setSelectedTaskId(null)
  }

  function addTask(status = 'not-started') {
    const project = activeProject === 'all' ? 'smartcredit' : activeProject
    const task = createTask({ status, project })
    setTasks(prev => [...prev, task])
    setSelectedTaskId(task.id)
  }

  function quickComplete(id) {
    const task = tasks.find(t => t.id === id)
    if (!task) return
    updateTask(id, { status: task.status === 'completed' ? 'not-started' : 'completed' })
  }

  const activeProjectMeta = projects.find(p => p.id === activeProject)

  return (
    <div className="app">
      <Sidebar
        projects={projects}
        activeProject={activeProject}
        onProjectChange={handleProjectChange}
        onProjectColorChange={updateProjectColor}
        onProjectNameChange={updateProjectName}
        onAddProject={addProject}
        onDeleteProject={deleteProject}
        onCalendarOpen={handleCalendarOpen}
        isCalendar={isCalendar}
        tasks={tasks}
      />
      <div className="main">
        <header className="main-header">
          <div className="header-left">
            {isCalendar ? (
              <>
                <span className="header-project-dot" style={{ backgroundColor: '#8b5cf6' }} />
                <h1 className="page-title">Calendar</h1>
              </>
            ) : (
              <>
                {activeProjectMeta && (
                  <div style={{ position: 'relative' }}>
                    <button className="header-project-dot-btn"
                      style={{ backgroundColor: activeProjectMeta.color }}
                      title="Click to change color"
                      onClick={() => setHeaderPickerOpen(v => !v)} />
                    {headerPickerOpen && (
                      <HeaderColorPicker
                        color={activeProjectMeta.color}
                        onSelect={color => updateProjectColor(activeProject, color)}
                        onClose={closeHeaderPicker} />
                    )}
                  </div>
                )}
                {activeProjectMeta ? (
                  <EditableTitle
                    name={activeProjectMeta.name}
                    color={activeProjectMeta.color}
                    onSave={name => updateProjectName(activeProject, name)}
                  />
                ) : (
                  <h1 className="page-title">All Projects</h1>
                )}
                <div className="view-tabs">
                  {[{ id: 'board', label: 'Board' }, { id: 'timeline', label: 'Timeline' }, { id: 'table', label: 'Table' }].map(v => (
                    <button key={v.id} className={`view-tab ${view === v.id ? 'active' : ''}`} onClick={() => setView(v.id)}>
                      {v.label}
                    </button>
                  ))}
                </div>
              </>
            )}
          </div>
          <div className="header-right">
            <div className="search-box">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                <circle cx="11" cy="11" r="8" /><path d="m21 21-4.35-4.35" />
              </svg>
              <input type="text" placeholder="Search tasks…" value={search} onChange={e => setSearch(e.target.value)} />
              {search && <button className="search-clear" onClick={() => setSearch('')}>✕</button>}
            </div>
            {!isCalendar && <button className="btn-add" onClick={() => addTask()}>+ Add Task</button>}
          </div>
        </header>

        <div className="content">
          {!isCalendar && view === 'board' && (
            <Board tasks={filteredTasks} projects={projects} onTaskClick={setSelectedTaskId}
              onStatusChange={(id, status) => updateTask(id, { status })}
              onQuickComplete={quickComplete} onAddTask={addTask} />
          )}
          {!isCalendar && view === 'timeline' && (
            <Timeline tasks={filteredTasks}
              projects={activeProject === 'all' ? projects : projects.filter(p => p.id === activeProject)}
              onTaskClick={setSelectedTaskId} />
          )}
          {!isCalendar && view === 'table' && (
            <TableView tasks={filteredTasks} projects={projects} statuses={STATUSES}
              onTaskClick={setSelectedTaskId} onQuickComplete={quickComplete}
              onStatusChange={(id, status) => updateTask(id, { status })} />
          )}
          {isCalendar && (
            <CalendarView tasks={tasks} projects={projects}
              onTaskClick={setSelectedTaskId} onImport={importTasks} />
          )}
        </div>
      </div>

      {selectedTask && (
        <TaskModal task={selectedTask} projects={projects} statuses={STATUSES} priorities={PRIORITIES}
          onUpdate={updates => updateTask(selectedTask.id, updates)}
          onDelete={() => deleteTask(selectedTask.id)}
          onClose={() => setSelectedTaskId(null)} />
      )}
    </div>
  )
}
