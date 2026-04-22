import { useState, useEffect, useRef } from 'react'

const SWATCHES = [
  '#2863c5','#7c3aed','#059669','#e85d04',
  '#ef4444','#ec4899','#0891b2','#d97706',
  '#4f46e5','#be185d','#0f766e','#9333ea',
  '#15803d','#b45309','#64748b','#1f2937',
]

function ColorPicker({ currentColor, onSelect, onClose }) {
  const ref = useRef(null)
  useEffect(() => {
    const h = e => { if (ref.current && !ref.current.contains(e.target)) onClose() }
    document.addEventListener('mousedown', h)
    return () => document.removeEventListener('mousedown', h)
  }, [onClose])
  return (
    <div className="color-picker-popover" ref={ref}>
      <div className="color-picker-label">Pick a color</div>
      <div className="color-swatches">
        {SWATCHES.map(color => (
          <button key={color} className={`color-swatch ${color === currentColor ? 'active' : ''}`}
            style={{ backgroundColor: color }} onClick={() => { onSelect(color); onClose() }} title={color} />
        ))}
      </div>
    </div>
  )
}

function EditableName({ name, onSave }) {
  const [editing, setEditing] = useState(false)
  const [value, setValue] = useState(name)
  const inputRef = useRef(null)

  useEffect(() => { if (editing) inputRef.current?.select() }, [editing])
  useEffect(() => { setValue(name) }, [name])

  function commit() {
    const trimmed = value.trim()
    if (trimmed && trimmed !== name) onSave(trimmed)
    else setValue(name)
    setEditing(false)
  }

  if (editing) return (
    <input
      ref={inputRef}
      className="nav-name-input"
      value={value}
      onChange={e => setValue(e.target.value)}
      onBlur={commit}
      onKeyDown={e => {
        if (e.key === 'Enter') commit()
        if (e.key === 'Escape') { setValue(name); setEditing(false) }
      }}
      onClick={e => e.stopPropagation()}
    />
  )

  return (
    <span className="nav-label nav-label-editable" title="Double-click to rename"
      onDoubleClick={e => { e.stopPropagation(); setEditing(true) }}>
      {name}
    </span>
  )
}

export default function Sidebar({ projects, activeProject, onProjectChange, onProjectColorChange, onProjectNameChange, onAddProject, onDeleteProject, onCalendarOpen, isCalendar, tasks }) {
  const [pickerOpenId, setPickerOpenId] = useState(null)
  const activeCount = tasks.filter(t => t.status !== 'completed').length

  return (
    <aside className="sidebar">
      <div className="sidebar-logo">
        <div className="logo-mark">⚡</div>
        <span className="logo-text">Flow</span>
      </div>

      <div className="sidebar-section">
        <div className="section-header-row">
          <div className="sidebar-section-label">Projects</div>
          <button className="add-project-btn" title="Add project" onClick={onAddProject}>+</button>
        </div>

        <div className="nav-item-wrap">
          <button className={`nav-item ${activeProject === 'all' ? 'active' : ''}`} onClick={() => onProjectChange('all')}>
            <span className="nav-dot" style={{ backgroundColor: '#6b7280' }} />
            <span className="nav-label">All Projects</span>
            {activeCount > 0 && <span className="nav-count">{activeCount}</span>}
          </button>
          <span className="nav-delete-btn" style={{ visibility: 'hidden' }}>✕</span>
        </div>

        {projects.map(project => {
          const count = tasks.filter(t => t.project === project.id && t.status !== 'completed').length
          return (
            <div key={project.id} className="nav-item-wrap">
              <button className={`nav-item ${activeProject === project.id ? 'active' : ''}`} onClick={() => onProjectChange(project.id)}>
                <span className="nav-dot nav-dot-clickable" style={{ backgroundColor: project.color }}
                  title="Click to change color"
                  onClick={e => { e.stopPropagation(); setPickerOpenId(pickerOpenId === project.id ? null : project.id) }} />
                <EditableName name={project.name} onSave={name => onProjectNameChange(project.id, name)} />
                {count > 0 && <span className="nav-count">{count}</span>}
              </button>
              <button className="nav-delete-btn" title="Delete project"
                onClick={e => { e.stopPropagation(); onDeleteProject(project.id) }}>✕</button>
              {pickerOpenId === project.id && (
                <ColorPicker currentColor={project.color}
                  onSelect={color => onProjectColorChange(project.id, color)}
                  onClose={() => setPickerOpenId(null)} />
              )}
            </div>
          )
        })}
      </div>

      <div className="sidebar-section">
        <div className="sidebar-section-label">Views</div>
        <button className={`nav-item ${isCalendar ? 'active' : ''}`} onClick={onCalendarOpen}>
          <span className="nav-icon">
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
              <rect x="3" y="4" width="18" height="18" rx="2"/><path d="M16 2v4M8 2v4M3 10h18"/>
            </svg>
          </span>
          <span className="nav-label">Calendar</span>
        </button>
      </div>

      <div className="sidebar-stats">
        <div className="stats-title">Progress</div>
        {projects.map(project => {
          const all   = tasks.filter(t => t.project === project.id)
          const done  = all.filter(t => t.status === 'completed').length
          const total = all.length
          if (total === 0) return null
          return (
            <div key={project.id} className="stat-row">
              <span className="stat-name" style={{ color: project.color }}>{project.name.split(' ')[0]}</span>
              <div className="stat-bar">
                <div className="stat-fill" style={{ width: `${Math.round((done/total)*100)}%`, backgroundColor: project.color }} />
              </div>
              <span className="stat-frac">{done}/{total}</span>
            </div>
          )
        })}
      </div>
    </aside>
  )
}
