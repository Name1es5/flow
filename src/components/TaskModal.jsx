import { useState, useEffect, useRef } from 'react'

export default function TaskModal({ task, projects, statuses, priorities, onUpdate, onDelete, onClose }) {
  const [title,       setTitle]       = useState(task.title)
  const [newReq,      setNewReq]      = useState('')
  const [editReqId,   setEditReqId]   = useState(null)
  const [editReqText, setEditReqText] = useState('')
  const titleRef = useRef(null)
  const reqRef   = useRef(null)

  useEffect(() => { setTitle(task.title) }, [task.id])
  useEffect(() => {
    const h = e => { if (e.key === 'Escape') onClose() }
    window.addEventListener('keydown', h)
    return () => window.removeEventListener('keydown', h)
  }, [onClose])

  function commitTitle() {
    const t = title.trim()
    if (t && t !== task.title) onUpdate({ title: t })
    else setTitle(task.title)
  }

  function addReq() {
    const text = newReq.trim()
    if (!text) return
    onUpdate({ requirements: [...task.requirements, { id: Date.now().toString(36), text, done: false }] })
    setNewReq('')
    reqRef.current?.focus()
  }

  function toggleReq(id) {
    onUpdate({ requirements: task.requirements.map(r => r.id === id ? { ...r, done: !r.done } : r) })
  }

  function removeReq(id) {
    onUpdate({ requirements: task.requirements.filter(r => r.id !== id) })
  }

  function startEditReq(req) { setEditReqId(req.id); setEditReqText(req.text) }

  function commitEditReq(id) {
    const t = editReqText.trim()
    if (t) onUpdate({ requirements: task.requirements.map(r => r.id === id ? { ...r, text: t } : r) })
    setEditReqId(null); setEditReqText('')
  }

  const project = projects.find(p => p.id === task.project)

  return (
    <div className="modal-overlay" onClick={e => e.target === e.currentTarget && onClose()}>
      <div className="task-modal">
        <div className="modal-header">
          <div className="modal-project-strip" style={{ backgroundColor: project?.color }} />
          <textarea ref={titleRef} className="modal-title-input" value={title} rows={1}
            onChange={e => { setTitle(e.target.value); e.target.style.height='auto'; e.target.style.height=e.target.scrollHeight+'px' }}
            onBlur={commitTitle}
            onKeyDown={e => { if (e.key === 'Enter') { e.preventDefault(); titleRef.current.blur() } }} />
          <div className="modal-header-actions">
            <button className="btn-icon danger" title="Delete" onClick={() => { if (window.confirm('Delete this task?')) onDelete() }}>
              <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                <path d="M3 6h18M8 6V4h8v2M19 6l-1 14H6L5 6"/>
              </svg>
            </button>
            <button className="btn-icon" title="Close (Esc)" onClick={onClose}>
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                <path d="M18 6 6 18M6 6l12 12"/>
              </svg>
            </button>
          </div>
        </div>

        <div className="modal-meta">
          {[
            { label: 'Project',    el: <select className="meta-select" value={task.project}   onChange={e => onUpdate({ project: e.target.value })}>{projects.map(p=><option key={p.id} value={p.id}>{p.name}</option>)}</select> },
            { label: 'Status',     el: <select className="meta-select" value={task.status}    onChange={e => onUpdate({ status: e.target.value })}>{statuses.map(s=><option key={s.id} value={s.id}>{s.label}</option>)}</select> },
            { label: 'Priority',   el: <select className="meta-select" value={task.priority}  onChange={e => onUpdate({ priority: e.target.value })}>{priorities.map(p=><option key={p.id} value={p.id}>{p.label}</option>)}</select> },
            { label: 'Start Date', el: <input type="date" className="meta-date" value={task.startDate||''} onChange={e => onUpdate({ startDate: e.target.value })} /> },
            { label: 'Due Date',   el: <input type="date" className="meta-date" value={task.dueDate||''}   onChange={e => onUpdate({ dueDate: e.target.value })} />, span: true },
          ].map(({ label, el, span }) => (
            <div key={label} className="meta-field" style={span ? { gridColumn: 'span 2' } : {}}>
              <label className="meta-label">{label}</label>
              {el}
            </div>
          ))}
        </div>

        <div className="modal-section">
          <div className="section-title">Task Requirements</div>
          <div className="req-list">
            {task.requirements.map(req => (
              <div key={req.id} className="req-item">
                <input type="checkbox" className="req-checkbox" checked={req.done} onChange={() => toggleReq(req.id)} />
                {editReqId === req.id ? (
                  <input className="req-edit-input" autoFocus value={editReqText}
                    onChange={e => setEditReqText(e.target.value)}
                    onBlur={() => commitEditReq(req.id)}
                    onKeyDown={e => { if (e.key==='Enter') { e.preventDefault(); commitEditReq(req.id) } if (e.key==='Escape') setEditReqId(null) }} />
                ) : (
                  <span className={`req-text ${req.done ? 'done' : ''}`} title="Click to edit" onClick={() => startEditReq(req)}>{req.text}</span>
                )}
                <button className="req-del" onClick={() => removeReq(req.id)}>✕</button>
              </div>
            ))}
            <div className="req-add-row">
              <input ref={reqRef} type="text" className="req-add-input" placeholder="Add a requirement…"
                value={newReq} onChange={e => setNewReq(e.target.value)} onKeyDown={e => e.key==='Enter' && addReq()} />
              <button className="req-add-btn" onClick={addReq}>Add</button>
            </div>
          </div>
        </div>

        <div className="modal-section">
          <div className="section-title">Notes</div>
          <textarea className="notes-area" value={task.notes}
            onChange={e => onUpdate({ notes: e.target.value })} placeholder="Add notes, links, context…" rows={5} />
        </div>
      </div>
    </div>
  )
}
