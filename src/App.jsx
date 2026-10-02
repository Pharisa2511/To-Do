import { useState, useRef, useEffect } from 'react'
import { Plus, Check, Trash2, ListTodo } from 'lucide-react'

const PRIORITIES = {
  low: { label: 'ต่ำ', badge: 'bg-green-100 text-green-700', dot: 'bg-green-500', ring: 'ring-green-500' },
  medium: { label: 'ปานกลาง', badge: 'bg-amber-100 text-amber-700', dot: 'bg-amber-500', ring: 'ring-amber-500' },
  high: { label: 'สูง', badge: 'bg-red-100 text-red-700', dot: 'bg-red-500', ring: 'ring-red-500' },
}
const FILTERS = [
  ['all', 'ทั้งหมด'],
  ['active', 'ยังไม่เสร็จ'],
  ['completed', 'เสร็จแล้ว'],
]
const NEXT = { low: 'medium', medium: 'high', high: 'low' }

function TodoItem({ todo, onToggle, onDelete, onEdit, onCycle }) {
  const [editing, setEditing] = useState(false)
  const [draft, setDraft] = useState(todo.text)
  const ref = useRef(null)

  useEffect(() => {
    if (editing && ref.current) {
      ref.current.focus()
      ref.current.select()
    }
  }, [editing])

  const save = () => {
    const t = draft.trim()
    if (t) onEdit(todo.id, t)
    else setDraft(todo.text)
    setEditing(false)
  }
  const p = PRIORITIES[todo.priority]

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
              if (e.key === 'Escape') {
                setDraft(todo.text)
                setEditing(false)
              }
            }}
            className="w-full rounded-md border border-indigo-300 px-2 py-1 text-base outline-none focus:ring-2 focus:ring-indigo-200"
          />
        ) : (
          <span
            onDoubleClick={() => {
              setDraft(todo.text)
              setEditing(true)
            }}
            title="ดับเบิลคลิกเพื่อแก้ไข"
            className={`block break-words cursor-text select-none ${todo.done ? 'line-through text-gray-400' : 'text-gray-800'}`}
          >
            {todo.text}
          </span>
        )}
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

export default function App() {
  const [todos, setTodos] = useState([
    { id: 1, text: 'ตรวจสอบเซนเซอร์ของหุ่นยนต์', done: false, priority: 'high' },
    { id: 2, text: 'เขียนรายงานการทดสอบ', done: false, priority: 'medium' },
    { id: 3, text: 'จัดโต๊ะทำงาน', done: true, priority: 'low' },
  ])
  const [text, setText] = useState('')
  const [priority, setPriority] = useState('medium')
  const [filter, setFilter] = useState('all')
  const nextId = useRef(4)

  const add = () => {
    const t = text.trim()
    if (!t) return
    setTodos((l) => [{ id: nextId.current++, text: t, done: false, priority }, ...l])
    setText('')
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

  const remaining = todos.filter((t) => !t.done && !t.removing).length
  const doneCount = todos.filter((t) => t.done).length
  const shown = todos.filter((t) => (filter === 'all' ? true : filter === 'active' ? !t.done : t.done))

  return (
    <main className="max-w-xl mx-auto px-4 py-8 sm:py-12">
      <header className="flex items-center gap-3 mb-6">
        <div className="w-10 h-10 rounded-xl bg-indigo-600 text-white flex items-center justify-center">
          <ListTodo size={22} />
        </div>
        <div>
          <h1 className="text-2xl font-bold text-gray-900 leading-tight">สิ่งที่ต้องทำ</h1>
          <p className="text-sm text-gray-500">จดงานของวันนี้ แล้วทำให้เสร็จทีละอย่าง</p>
        </div>
      </header>

      <section className="bg-white rounded-2xl shadow-md border border-gray-100 p-4 mb-5">
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
      </section>

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
          <TodoItem key={t.id} todo={t} onToggle={toggle} onDelete={remove} onEdit={edit} onCycle={cycle} />
        ))}
      </ul>

      {shown.length === 0 && (
        <div className="bg-white rounded-xl border border-dashed border-gray-300 text-center py-10 px-4 text-gray-500">
          {filter === 'completed' ? 'ยังไม่มีงานที่เสร็จ' : filter === 'active' ? 'ไม่มีงานค้างแล้ว เยี่ยมมาก!' : 'ยังไม่มีงาน พิมพ์งานแรกด้านบนได้เลย'}
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
  )
}
