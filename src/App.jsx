import { useState, useRef, useEffect } from 'react'
import { Plus, Check, Trash2, ListTodo, Search, CalendarDays } from 'lucide-react'

const PRIORITIES = {
  low: { label: 'ต่ำ', badge: 'bg-green-100 text-green-700', dot: 'bg-green-500', ring: 'ring-green-500' },
  medium: { label: 'ปานกลาง', badge: 'bg-amber-100 text-amber-700', dot: 'bg-amber-500', ring: 'ring-amber-500' },
  high: { label: 'สูง', badge: 'bg-red-100 text-red-700', dot: 'bg-red-500', ring: 'ring-red-500' },
}
const CATEGORIES = {
  work: { label: 'งาน', tag: 'bg-blue-100 text-blue-700', dot: 'bg-blue-500' },
  personal: { label: 'ส่วนตัว', tag: 'bg-purple-100 text-purple-700', dot: 'bg-purple-500' },
  shopping: { label: 'ช้อปปิ้ง', tag: 'bg-pink-100 text-pink-700', dot: 'bg-pink-500' },
  health: { label: 'สุขภาพ', tag: 'bg-teal-100 text-teal-700', dot: 'bg-teal-500' },
}
const FILTERS = [
  ['all', 'ทั้งหมด'],
  ['active', 'ยังไม่เสร็จ'],
  ['completed', 'เสร็จแล้ว'],
]
const NEXT = { low: 'medium', medium: 'high', high: 'low' }

// ---- date helpers (local time, "YYYY-MM-DD") ----
const fmt = (d) => `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`
const offsetDay = (n) => { const d = new Date(); d.setDate(d.getDate() + n); return fmt(d) }
const thaiDate = (s) => {
  const [y, m, d] = s.split('-').map(Number)
  return new Date(y, m - 1, d).toLocaleDateString('th-TH', { day: 'numeric', month: 'short' })
}
const dueInfo = (todo, today) => {
  if (!todo.due) return null
  const label = thaiDate(todo.due)
  if (todo.done) return { cls: 'bg-gray-100 text-gray-500', text: label }
  if (todo.due < today) return { cls: 'bg-red-100 text-red-700', text: `เลยกำหนด · ${label}` }
  if (todo.due === today) return { cls: 'bg-yellow-100 text-yellow-800', text: 'วันนี้' }
  return { cls: 'bg-gray-100 text-gray-600', text: label }
}

function TodoItem({ todo, today, onToggle, onDelete, onEdit, onCycle }) {
  const [editing, setEditing] = useState(false)
  const [draft, setDraft] = useState(todo.text)
  const ref = useRef(null)

  useEffect(() => {
    if (editing && ref.current) { ref.current.focus(); ref.current.select() }
  }, [editing])

  const save = () => {
    const t = draft.trim()
    if (t) onEdit(todo.id, t)
    else setDraft(todo.text)
    setEditing(false)
  }
  const p = PRIORITIES[todo.priority]
  const c = CATEGORIES[todo.category]
  const due = dueInfo(todo, today)

  return (
    <li className={`item bg-white rounded-xl shadow-sm border border-gray-100 px-3 py-3 mb-2 flex items-center gap-3 ${todo.removing ? 'removing' : ''}`}>
      <button
        onClick={() => onToggle(todo.id)}
        aria-label={todo.done ? 'ยกเลิกเสร็จสิ้น' : 'ทำเครื่องหมายว่าเสร็จแล้ว'}
        aria-pressed={todo.done}
        className={`shrink-0 w-6 h-6 rounded-md border-2 flex items-center justify-center transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 ${
          todo.done ? 'bg-indigo-600 border-indigo-600 text-white' : 'border-gray-300 text-transparent hover:border-indigo-400'
        }`}
      >
        <Check size={14} strokeWidth={3} />
      </button>

      <div className="flex-1 min-w-0">
        {editing ? (
          <input
            ref={ref}
            value={draft}
            onChange={(e) => setDraft(e.target.value)}
            onBlur={save}
            onKeyDown={(e) => {
              if (e.key === 'Enter') save()
              if (e.key === 'Escape') { setDraft(todo.text); setEditing(false) }
            }}
            className="w-full rounded-md border border-indigo-300 px-2 py-1 text-base outline-none focus:ring-2 focus:ring-indigo-200"
          />
        ) : (
          <span
            onDoubleClick={() => { setDraft(todo.text); setEditing(true) }}
            title="ดับเบิลคลิกเพื่อแก้ไข"
            className={`block break-words cursor-text select-none ${todo.done ? 'line-through text-gray-400' : 'text-gray-800'}`}
          >
            {todo.text}
          </span>
        )}
        <div className="flex flex-wrap items-center gap-1.5 mt-1.5">
          <span className={`text-xs px-2 py-0.5 rounded-full ${c.tag}`}>{c.label}</span>
          {due && (
            <span className={`inline-flex items-center gap-1 text-xs px-2 py-0.5 rounded-full ${due.cls}`}>
              <CalendarDays size={12} /> {due.text}
            </span>
          )}
        </div>
      </div>

      <button
        onClick={() => onCycle(todo.id)}
        title="แตะเพื่อเปลี่ยนความสำคัญ"
        className={`shrink-0 text-xs font-medium px-2.5 py-1 rounded-full ${p.badge} focus:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500`}
      >
        {p.label}
      </button>

      <button
        onClick={() => onDelete(todo.id)}
        aria-label="ลบรายการ"
        className="shrink-0 p-1.5 rounded-md text-gray-400 hover:text-red-600 hover:bg-red-50 transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-red-400"
      >
        <Trash2 size={18} />
      </button>
    </li>
  )
}

function Donut({ segments, total, percent }) {
  let acc = 0
  return (
    <div className="relative w-28 h-28 shrink-0">
      <svg viewBox="0 0 36 36" className="w-full h-full -rotate-90" role="img" aria-label={`เสร็จแล้ว ${percent}%`}>
        <circle cx="18" cy="18" r="15.9155" fill="none" stroke="#e5e7eb" strokeWidth="4" />
        {total > 0 &&
          segments.map((s) => {
            const pct = (s.value / total) * 100
            const el = pct > 0 && (
              <circle key={s.key} cx="18" cy="18" r="15.9155" fill="none" stroke={s.color} strokeWidth="4"
                strokeDasharray={`${pct} ${100 - pct}`} strokeDashoffset={-acc} />
            )
            acc += pct
            return el
          })}
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <span className="text-xl font-bold text-gray-900 leading-none">{percent}%</span>
        <span className="text-[11px] text-gray-500 mt-0.5">เสร็จแล้ว</span>
      </div>
    </div>
  )
}

export default function App() {
  const today = fmt(new Date())
  const [todos, setTodos] = useState([
    { id: 1, text: 'ตรวจสอบเซนเซอร์ของหุ่นยนต์', done: false, priority: 'high', category: 'work', due: offsetDay(-2) },
    { id: 2, text: 'เขียนรายงานการทดสอบ', done: false, priority: 'medium', category: 'work', due: offsetDay(0) },
    { id: 3, text: 'ซื้อของเข้าบ้าน', done: false, priority: 'low', category: 'shopping', due: offsetDay(3) },
    { id: 4, text: 'ไปออกกำลังกาย', done: false, priority: 'medium', category: 'health', due: '' },
    { id: 5, text: 'จัดโต๊ะทำงาน', done: true, priority: 'low', category: 'personal', due: offsetDay(-1) },
  ])
  const [text, setText] = useState('')
  const [priority, setPriority] = useState('medium')
  const [category, setCategory] = useState('work')
  const [due, setDue] = useState('')
  const [filter, setFilter] = useState('all')
  const [catFilter, setCatFilter] = useState('all')
  const [query, setQuery] = useState('')
  const nextId = useRef(6)

  const add = () => {
    const t = text.trim()
    if (!t) return
    setTodos((l) => [{ id: nextId.current++, text: t, done: false, priority, category, due }, ...l])
    setText('')
    setDue('')
  }
  const toggle = (id) => setTodos((l) => l.map((t) => (t.id === id ? { ...t, done: !t.done } : t)))
  const edit = (id, v) => setTodos((l) => l.map((t) => (t.id === id ? { ...t, text: v } : t)))
  const cycle = (id) => setTodos((l) => l.map((t) => (t.id === id ? { ...t, priority: NEXT[t.priority] } : t)))
  const remove = (id) => {
    setTodos((l) => l.map((t) => (t.id === id ? { ...t, removing: true } : t)))
    setTimeout(() => setTodos((l) => l.filter((t) => t.id !== id)), 260)
  }
  const clearDone = () => {
    setTodos((l) => l.map((t) => (t.done ? { ...t, removing: true } : t)))
    setTimeout(() => setTodos((l) => l.filter((t) => !t.done)), 260)
  }

  const live = todos.filter((t) => !t.removing)
  const remaining = live.filter((t) => !t.done).length
  const doneCount = live.filter((t) => t.done).length
  const overdueCount = live.filter((t) => !t.done && t.due && t.due < today).length
  const total = live.length
  const percent = total ? Math.round((doneCount / total) * 100) : 0
  const segments = [
    { key: 'done', label: 'เสร็จแล้ว', value: doneCount, color: '#22c55e' },
    { key: 'active', label: 'กำลังทำ', value: remaining - overdueCount, color: '#6366f1' },
    { key: 'overdue', label: 'เลยกำหนด', value: overdueCount, color: '#ef4444' },
  ]

  const q = query.trim().toLowerCase()
  const shown = todos.filter(
    (t) =>
      (filter === 'all' ? true : filter === 'active' ? !t.done : t.done) &&
      (catFilter === 'all' || t.category === catFilter) &&
      (!q || t.text.toLowerCase().includes(q)),
  )
  const countOf = (k) => (k === 'all' ? total : live.filter((t) => t.category === k).length)

  const catButton = (k, label, dot, vertical) => (
    <button
      key={k}
      onClick={() => setCatFilter(k)}
      aria-pressed={catFilter === k}
      className={`flex items-center gap-2 text-sm rounded-lg transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 ${
        vertical ? 'w-full px-3 py-2' : 'shrink-0 px-3 py-1.5 border'
      } ${catFilter === k ? 'bg-indigo-50 text-indigo-700 font-medium border-indigo-200' : 'text-gray-600 hover:bg-gray-50 border-gray-200'}`}
    >
      {dot && <span className={`w-2 h-2 rounded-full ${dot}`} />}
      <span className={vertical ? 'flex-1 text-left' : ''}>{label}</span>
      <span className="text-xs text-gray-400 tabular-nums">{countOf(k)}</span>
    </button>
  )

  return (
    <div className="max-w-4xl mx-auto px-4 py-8 sm:py-12">
      <header className="flex items-center gap-3 mb-6">
        <div className="w-10 h-10 rounded-xl bg-indigo-600 text-white flex items-center justify-center">
          <ListTodo size={22} />
        </div>
        <div>
          <h1 className="text-2xl font-bold text-gray-900 leading-tight">สิ่งที่ต้องทำ</h1>
          <p className="text-sm text-gray-500">จดงานของวันนี้ แล้วทำให้เสร็จทีละอย่าง</p>
        </div>
      </header>

      <div className="grid md:grid-cols-[230px_1fr] gap-6 items-start">
        <main className="min-w-0 md:order-2">
          {/* Add form */}
          <section className="bg-white rounded-2xl shadow-md border border-gray-100 p-4 mb-4">
            <div className="flex gap-2">
              <input
                value={text}
                onChange={(e) => setText(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && add()}
                placeholder="เพิ่มงานใหม่…"
                aria-label="งานใหม่"
                className="flex-1 min-w-0 rounded-lg border border-gray-200 px-3 py-2.5 text-base outline-none focus:border-indigo-400 focus:ring-2 focus:ring-indigo-100"
              />
              <button
                onClick={add}
                disabled={!text.trim()}
                className="shrink-0 inline-flex items-center gap-1.5 rounded-lg bg-indigo-600 text-white px-4 font-medium hover:bg-indigo-700 disabled:opacity-40 disabled:cursor-not-allowed transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-indigo-400 focus-visible:ring-offset-2"
              >
                <Plus size={18} /> <span>เพิ่ม</span>
              </button>
            </div>

            <div className="flex items-center gap-2 mt-3 flex-wrap">
              <span className="text-sm text-gray-500">ความสำคัญ:</span>
              {Object.entries(PRIORITIES).map(([k, v]) => (
                <button
                  key={k}
                  onClick={() => setPriority(k)}
                  aria-pressed={priority === k}
                  className={`inline-flex items-center gap-1.5 text-sm px-3 py-1 rounded-full border transition-colors ${
                    priority === k ? `${v.badge} border-transparent ring-2 ${v.ring}` : 'border-gray-200 text-gray-600 hover:bg-gray-50'
                  }`}
                >
                  <span className={`w-2 h-2 rounded-full ${v.dot}`} />
                  {v.label}
                </button>
              ))}
            </div>

            <div className="flex items-center gap-2 mt-3 flex-wrap">
              <span className="text-sm text-gray-500">หมวดหมู่:</span>
              {Object.entries(CATEGORIES).map(([k, v]) => (
                <button
                  key={k}
                  onClick={() => setCategory(k)}
                  aria-pressed={category === k}
                  className={`inline-flex items-center gap-1.5 text-sm px-3 py-1 rounded-full border transition-colors ${
                    category === k ? `${v.tag} border-transparent ring-2 ring-offset-0 ring-gray-300` : 'border-gray-200 text-gray-600 hover:bg-gray-50'
                  }`}
                >
                  <span className={`w-2 h-2 rounded-full ${v.dot}`} />
                  {v.label}
                </button>
              ))}
            </div>

            <label className="flex items-center gap-2 mt-3 text-sm text-gray-500">
              <CalendarDays size={16} /> กำหนดส่ง:
              <input
                type="date"
                value={due}
                onChange={(e) => setDue(e.target.value)}
                className="rounded-lg border border-gray-200 px-2 py-1 text-sm text-gray-700 outline-none focus:border-indigo-400 focus:ring-2 focus:ring-indigo-100"
              />
              {due && (
                <button onClick={() => setDue('')} className="text-xs text-gray-400 hover:text-gray-700 underline">
                  ล้าง
                </button>
              )}
            </label>
          </section>

          {/* Search */}
          <div className="relative mb-4">
            <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              type="search"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="ค้นหางาน…"
              aria-label="ค้นหางาน"
              className="w-full rounded-xl border border-gray-200 bg-white pl-10 pr-3 py-2.5 text-base outline-none focus:border-indigo-400 focus:ring-2 focus:ring-indigo-100"
            />
          </div>

          {/* Category chips (mobile) */}
          <div className="md:hidden flex gap-2 overflow-x-auto pb-2 mb-2 -mx-4 px-4">
            {catButton('all', 'ทั้งหมด', null, false)}
            {Object.entries(CATEGORIES).map(([k, v]) => catButton(k, v.label, v.dot, false))}
          </div>

          <nav className="grid grid-cols-3 gap-1 bg-gray-200/70 rounded-xl p-1 mb-4" role="tablist">
            {FILTERS.map(([k, label]) => (
              <button
                key={k}
                role="tab"
                aria-selected={filter === k}
                onClick={() => setFilter(k)}
                className={`py-2 text-sm font-medium rounded-lg transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 ${
                  filter === k ? 'bg-white text-indigo-700 shadow-sm' : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                {label}
              </button>
            ))}
          </nav>

          <ul className="list-none p-0 m-0">
            {shown.map((t) => (
              <TodoItem key={t.id} todo={t} today={today} onToggle={toggle} onDelete={remove} onEdit={edit} onCycle={cycle} />
            ))}
          </ul>

          {shown.length === 0 && (
            <div className="bg-white rounded-xl border border-dashed border-gray-300 text-center py-10 px-4 text-gray-500">
              {q ? `ไม่พบงานที่ตรงกับ “${query.trim()}”` : filter === 'completed' ? 'ยังไม่มีงานที่เสร็จ' : filter === 'active' ? 'ไม่มีงานค้างแล้ว เยี่ยมมาก!' : 'ยังไม่มีงาน พิมพ์งานแรกด้านบนได้เลย'}
            </div>
          )}

          <footer className="flex items-center justify-between mt-4 text-sm text-gray-600">
            <span>
              เหลืองานอีก <strong className="text-gray-900">{remaining}</strong> รายการ
            </span>
            <button
              onClick={clearDone}
              disabled={doneCount === 0}
              className="px-3 py-1.5 rounded-lg text-gray-600 hover:text-red-600 hover:bg-red-50 disabled:opacity-40 disabled:hover:bg-transparent disabled:hover:text-gray-600 transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-red-400"
            >
              ล้างงานที่เสร็จแล้ว ({doneCount})
            </button>
          </footer>
          <p className="text-xs text-gray-400 mt-6 text-center">ดับเบิลคลิกที่ข้อความเพื่อแก้ไข · แตะป้ายความสำคัญเพื่อเปลี่ยน</p>
        </main>

        <aside className="md:order-1 md:sticky md:top-6 space-y-4">
          <section className="hidden md:block bg-white rounded-2xl shadow-md border border-gray-100 p-3">
            <h2 className="text-sm font-semibold text-gray-900 px-3 py-2">หมวดหมู่</h2>
            <div className="space-y-0.5">
              {catButton('all', 'ทั้งหมด', null, true)}
              {Object.entries(CATEGORIES).map(([k, v]) => catButton(k, v.label, v.dot, true))}
            </div>
          </section>

          <section className="bg-white rounded-2xl shadow-md border border-gray-100 p-4" aria-label="สถิติ">
            <h2 className="text-sm font-semibold text-gray-900 mb-3">สถิติ</h2>
            <div className="flex items-center gap-4">
              <Donut segments={segments} total={total} percent={percent} />
              <dl className="text-sm space-y-1.5 min-w-0">
                <div>
                  <dt className="text-gray-500 text-xs">งานทั้งหมด</dt>
                  <dd className="font-bold text-gray-900 text-lg leading-none">{total}</dd>
                </div>
                {segments.map((s) => (
                  <div key={s.key} className="flex items-center gap-1.5 text-xs text-gray-600">
                    <span className="w-2 h-2 rounded-full shrink-0" style={{ background: s.color }} />
                    <span>{s.label}</span>
                    <span className="font-semibold text-gray-900 tabular-nums">{s.value}</span>
                  </div>
                ))}
              </dl>
            </div>
          </section>
        </aside>
      </div>
    </div>
  )
}
