import { useState, useEffect, useRef } from 'react'
import minserImg from './assets/minser.jpeg'

const CATEGORY_COLORS = {
  '육아': '#FF8FAB',
  '집안일': '#FFBE98',
  '개인': '#B5EAD7',
  '중요': '#C7B8EA',
}
const CATEGORY_EMOJI = {
  '육아': '👶',
  '집안일': '🏠',
  '개인': '🌿',
  '중요': '⭐',
}
const CONFETTI = ['🎉', '🌸', '⭐', '💕', '✨', '🎊', '🌟', '💛']
const todayKey = new Date().toISOString().slice(0, 10)

function isCarriedOver(todo) {
  if (!todo.dateKey) return false
  return !todo.done && todo.dateKey < todayKey
}

export default function App() {
  const [todos, setTodos] = useState(() => {
    const saved = localStorage.getItem('minser-todos')
    return saved ? JSON.parse(saved) : []
  })
  const [profileImg, setProfileImg] = useState(() => localStorage.getItem('minser-profile') || null)
  const [input, setInput] = useState('')
  const [newCategory, setNewCategory] = useState('육아')
  const [filter, setFilter] = useState('전체')
  const [sortMode, setSortMode] = useState(false)
  const [showCameraOverlay, setShowCameraOverlay] = useState(false)
  const [draggedId, setDraggedId] = useState(null)
  const [dragOverId, setDragOverId] = useState(null)
  const [confettiItems, setConfettiItems] = useState([])
  const [editingCategoryId, setEditingCategoryId] = useState(null)

  const fileInputRef = useRef(null)
  const longPressTimer = useRef(null)
  const touchDragRef = useRef(null)

  useEffect(() => {
    localStorage.setItem('minser-todos', JSON.stringify(todos))
  }, [todos])

  const filtered = todos.filter(t => {
    if (filter === '전체') return true
    if (filter === '완료') return t.done
    if (filter === '미완료') return !t.done
    return t.category === filter
  })
  const sorted = (filter === '전체' && !sortMode)
    ? [...filtered].sort((a, b) => (a.done ? 1 : 0) - (b.done ? 1 : 0))
    : filtered

  const doneCount = todos.filter(t => t.done).length
  const progress = todos.length > 0 ? Math.round((doneCount / todos.length) * 100) : 0

  const triggerConfetti = () => {
    const items = Array.from({ length: 16 }, (_, i) => ({
      id: Date.now() + i,
      emoji: CONFETTI[i % CONFETTI.length],
      left: `${5 + Math.random() * 90}%`,
      duration: `${0.8 + Math.random() * 0.6}s`,
      delay: `${Math.random() * 0.3}s`,
      size: `${18 + Math.floor(Math.random() * 14)}px`,
    }))
    setConfettiItems(items)
    setTimeout(() => setConfettiItems([]), 1800)
  }

  const addTodo = () => {
    if (!input.trim()) return
    setTodos([...todos, {
      id: Date.now(),
      text: input.trim(),
      done: false,
      category: newCategory,
      createdAt: new Date().toLocaleDateString('ko-KR'),
      dateKey: todayKey,
    }])
    setInput('')
  }

  const toggleTodo = (id) => {
    const todo = todos.find(t => t.id === id)
    if (!todo.done) triggerConfetti()
    setTodos(todos.map(t => t.id === id ? { ...t, done: !t.done } : t))
  }

  const deleteTodo = (id) => setTodos(todos.filter(t => t.id !== id))

  const updateCategory = (id, category) => {
    setTodos(todos.map(t => t.id === id ? { ...t, category } : t))
    setEditingCategoryId(null)
  }

  const handleDragStart = (id) => setDraggedId(id)
  const handleDragOver = (e, id) => { e.preventDefault(); setDragOverId(id) }
  const handleDrop = (targetId) => {
    if (draggedId === null || draggedId === targetId) { setDraggedId(null); setDragOverId(null); return }
    const arr = [...todos]
    const from = arr.findIndex(t => t.id === draggedId)
    const to = arr.findIndex(t => t.id === targetId)
    const [removed] = arr.splice(from, 1)
    arr.splice(to, 0, removed)
    setTodos(arr)
    setDraggedId(null); setDragOverId(null)
  }

  const startLongPress = (id) => {
    longPressTimer.current = setTimeout(() => {
      setSortMode(true)
      if (navigator.vibrate) navigator.vibrate(60)
    }, 800)
  }
  const cancelLongPress = () => clearTimeout(longPressTimer.current)

  const onTouchStartDrag = (e, id) => {
    if (!sortMode) return
    touchDragRef.current = { id }
    setDraggedId(id)
  }
  const onTouchMoveDrag = (e) => {
    if (!touchDragRef.current) return
    e.preventDefault()
    const touch = e.touches[0]
    const el = document.elementFromPoint(touch.clientX, touch.clientY)
    if (el) {
      const todoEl = el.closest('[data-todo-id]')
      if (todoEl) { const overId = Number(todoEl.dataset.todoId); setDragOverId(overId); touchDragRef.current.lastOverId = overId }
    }
  }
  const onTouchEndDrag = () => {
    if (touchDragRef.current?.lastOverId) handleDrop(touchDragRef.current.lastOverId)
    else { setDraggedId(null); setDragOverId(null) }
    touchDragRef.current = null
  }

  const handleProfileChange = (e) => {
    const file = e.target.files[0]
    if (!file) return
    const reader = new FileReader()
    reader.onload = (ev) => {
      const img = new Image()
      img.onload = () => {
        const canvas = document.createElement('canvas')
        const MAX = 300
        const ratio = Math.min(MAX / img.width, MAX / img.height)
        canvas.width = img.width * ratio
        canvas.height = img.height * ratio
        canvas.getContext('2d').drawImage(img, 0, 0, canvas.width, canvas.height)
        const dataUrl = canvas.toDataURL('image/jpeg', 0.8)
        setProfileImg(dataUrl)
        setShowCameraOverlay(false)
        localStorage.setItem('minser-profile', dataUrl)
      }
      img.src = ev.target.result
    }
    reader.readAsDataURL(file)
  }

  const QUOTES = [
    '오늘 하루도 충분히 잘하고 있어요 🌸',
    '"완벽한 날은 없어. 그냥 오늘을 살아." — 영화 《어바웃 타임》',
    '작은 것들이 모여 큰 행복이 돼요 💛',
    '"당신이 할 수 있다고 믿든, 할 수 없다고 믿든 — 당신이 옳다." — 헨리 포드',
    '지금 이 순간이 가장 빛나는 시간이에요 ✨',
    '"인생은 가까이서 보면 비극이지만, 멀리서 보면 희극이다." — 찰리 채플린',
    '오늘도 민서와 함께라서 행복해요 💕',
    '"꿈을 꿀 수 있다면, 이룰 수도 있어요." — 월트 디즈니',
    '힘든 날일수록 더 빛나는 내일이 와요 🌅',
    '"당신은 당신이 생각하는 것보다 훨씬 용감해요." — 곰돌이 푸',
    '매일 조금씩, 분명히 나아지고 있어요 🌱',
    '"삶이 있는 한 희망은 있다." — 키케로',
    '오늘도 최선을 다한 당신, 대단해요 👏',
    '"행복은 습관이다. 그것을 몸에 지녀라." — 허버트 그린',
    '아무리 느려도 앞으로 가고 있다면 괜찮아요 🐢',
    '"우리가 느끼는 것은 결국 우리가 선택하는 것이다." — 영화 《인사이드 아웃》',
    '오늘 하루도 나답게, 민서맘답게 💪',
    '"할 수 있을지 없을지가 아니라, 할 것인지 말 것인지." — 영화 《킹스 스피치》',
    '완벽하지 않아도 충분히 좋은 엄마예요 🤍',
    '"가장 어두운 밤도 끝나고 해는 뜬다." — 빅토르 위고',
    '오늘 해낸 것들을 스스로 칭찬해주세요 🎀',
    '"네가 살아있는 것 자체로 이미 충분해." — 영화 《리틀 미스 선샤인》',
    '작은 성취가 쌓여 빛나는 하루가 돼요 ⭐',
    '"오늘 할 수 있는 것에 집중하자." — 영화 《업》',
    '민서가 있어서 오늘도 힘이 나요 👶💕',
    '"인생은 네가 만들어가는 이야기야." — 영화 《포레스트 검프》',
    '지치면 잠시 쉬어도 돼요, 다시 일어나면 되니까 🌙',
    '"두려움은 잠깐이지만 후회는 영원하다." — 영화 《록키》',
    '오늘도 수고한 나를 꼭 안아주세요 🫂',
    '"내일은 내일의 태양이 뜬다." — 영화 《바람과 함께 사라지다》',
  ]
  const getDailyQuote = () => {
    const day = new Date().getDate() + new Date().getMonth() * 31
    return QUOTES[day % QUOTES.length]
  }

  return (
    <div style={{ minHeight: '100vh', background: '#FFF0F5', fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif' }}>

      {/* 축하 컨페티 */}
      {confettiItems.length > 0 && (
        <div style={{ position: 'fixed', inset: 0, pointerEvents: 'none', zIndex: 999, overflow: 'hidden' }}>
          <style>{`
            @keyframes confettiFall {
              0% { transform: translateY(-20px) rotate(0deg); opacity: 1; }
              100% { transform: translateY(100vh) rotate(720deg); opacity: 0; }
            }
          `}</style>
          {confettiItems.map(item => (
            <div key={item.id} style={{ position: 'absolute', top: 0, left: item.left, fontSize: item.size, animation: `confettiFall ${item.duration} ${item.delay} ease-in forwards` }}>{item.emoji}</div>
          ))}
        </div>
      )}

      <div style={{ maxWidth: '480px', margin: '0 auto', minHeight: '100vh', background: '#FFFBFC', display: 'flex', flexDirection: 'column' }}>

        {/* 헤더 */}
        <div style={{ background: 'linear-gradient(160deg, #FFD6E7 0%, #FFEFCF 100%)', padding: '36px 24px 24px', position: 'relative', overflow: 'hidden' }}>
          <div style={{ position: 'absolute', top: -30, right: -30, width: 160, height: 160, background: 'rgba(255,255,255,0.35)', borderRadius: '50%' }} />
          <div style={{ position: 'absolute', bottom: -20, left: -20, width: 100, height: 100, background: 'rgba(255,255,255,0.25)', borderRadius: '50%' }} />

          <div style={{ display: 'flex', alignItems: 'center', gap: '16px', marginBottom: '20px', position: 'relative' }}>
            <input ref={fileInputRef} type="file" accept="image/*" onChange={handleProfileChange} style={{ display: 'none' }} />
            <div onClick={() => fileInputRef.current.click()} style={{ width: '72px', height: '72px', borderRadius: '50%', overflow: 'hidden', border: '3px solid white', boxShadow: '0 4px 12px rgba(0,0,0,0.12)', flexShrink: 0, cursor: 'pointer', position: 'relative' }}>
              <img src={profileImg || minserImg} alt="민서" style={{ width: '100%', height: '100%', objectFit: 'cover', objectPosition: 'center top' }} />
              <div onMouseEnter={() => setShowCameraOverlay(true)} onMouseLeave={() => setShowCameraOverlay(false)}
                style={{ position: 'absolute', inset: 0, background: 'rgba(0,0,0,0.25)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '22px', opacity: showCameraOverlay ? 1 : 0, transition: 'opacity 0.2s' }}>📷</div>
            </div>
            <div style={{ flex: 1 }}>
              {(() => {
                const full = getDailyQuote()
                const parts = full.split(' — ')
                return (
                  <>
                    <div style={{ fontSize: '12px', color: '#B07090', fontWeight: '500', marginBottom: '4px', lineHeight: 1.5 }}>{parts[0]}</div>
                    {parts[1] && <div style={{ fontSize: '11px', color: '#C97A96', fontWeight: '600' }}>— {parts[1]}</div>}
                  </>
                )
              })()}
              <div style={{ fontSize: '24px', fontWeight: '800', color: '#5D2A42', lineHeight: 1.2, marginTop: '6px' }}>민서맘</div>
              <div style={{ fontSize: '20px', fontWeight: '700', color: '#8B4D6A' }}>투두리스트 💕</div>
            </div>
          </div>

          <div style={{ background: 'rgba(255,255,255,0.6)', borderRadius: '16px', padding: '14px 16px', backdropFilter: 'blur(4px)' }}>
            <div style={{ fontSize: '12px', color: '#B07090', marginBottom: '8px' }}>
              {new Date().toLocaleDateString('ko-KR', { year: 'numeric', month: 'long', day: 'numeric', weekday: 'long' })}
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
              <span style={{ fontSize: '13px', fontWeight: '600', color: '#7A3B5A' }}>오늘의 진행률</span>
              <span style={{ fontSize: '13px', fontWeight: '700', color: '#C97A96' }}>{doneCount}/{todos.length} ({progress}%)</span>
            </div>
            <div style={{ background: 'rgba(255,255,255,0.7)', borderRadius: '99px', height: '8px' }}>
              <div style={{ background: 'linear-gradient(90deg, #FF8FAB, #FFBE98)', borderRadius: '99px', height: '8px', width: `${progress}%`, transition: 'width 0.5s ease' }} />
            </div>
          </div>
        </div>

        {/* 입력창 */}
        <div style={{ padding: '16px 16px 0', background: 'white', boxShadow: '0 2px 12px rgba(255,100,150,0.08)' }}>
          <div style={{ display: 'flex', gap: '8px', marginBottom: '12px' }}>
            {Object.keys(CATEGORY_COLORS).map(cat => (
              <button key={cat} onClick={() => setNewCategory(cat)} style={{ flex: 1, padding: '8px 4px', borderRadius: '12px', border: newCategory === cat ? `2px solid ${CATEGORY_COLORS[cat]}` : '2px solid #f0f0f0', background: newCategory === cat ? CATEGORY_COLORS[cat] + '33' : '#fafafa', color: newCategory === cat ? '#5D2A42' : '#aaa', fontSize: '12px', fontWeight: '700', cursor: 'pointer', transition: 'all 0.2s', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '2px' }}>
                <span style={{ fontSize: '18px' }}>{CATEGORY_EMOJI[cat]}</span>
                <span>{cat}</span>
              </button>
            ))}
          </div>
          <div style={{ display: 'flex', gap: '8px', paddingBottom: '16px' }}>
            <input value={input} onChange={e => setInput(e.target.value)} onKeyDown={e => e.key === 'Enter' && addTodo()} placeholder="오늘 할 일을 적어보세요 ✏️"
              style={{ flex: 1, padding: '14px 16px', borderRadius: '14px', border: '2px solid #FFE0ED', fontSize: '16px', outline: 'none', background: '#FFF8FB', color: '#5D2A42' }} />
            <button onClick={addTodo} style={{ width: '52px', borderRadius: '14px', border: 'none', background: 'linear-gradient(135deg, #FF8FAB, #FFBE98)', color: 'white', fontSize: '26px', cursor: 'pointer', flexShrink: 0, boxShadow: '0 4px 12px rgba(255,143,171,0.4)' }}>+</button>
          </div>
        </div>

        {/* 필터 탭 */}
        <div style={{ background: 'white', borderBottom: '2px solid #FFF0F5' }}>
          <div style={{ display: 'flex', padding: '0 8px', overflowX: 'auto' }}>
            {['전체', '미완료', '완료', ...Object.keys(CATEGORY_COLORS)].map(f => (
              <button key={f} onClick={() => setFilter(f)} style={{ padding: '10px 10px', border: 'none', background: 'none', color: filter === f ? '#C97A96' : '#ccc', fontWeight: filter === f ? '700' : '400', fontSize: '13px', borderBottom: filter === f ? '2px solid #FF8FAB' : '2px solid transparent', cursor: 'pointer', whiteSpace: 'nowrap', marginBottom: '-2px' }}>
                {CATEGORY_EMOJI[f] ? `${CATEGORY_EMOJI[f]} ${f}` : f}
              </button>
            ))}
          </div>
          {sortMode && (
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '8px 16px', background: '#FFF0F5' }}>
              <span style={{ fontSize: '13px', color: '#C97A96', fontWeight: '600' }}>✋ 길게 눌러서 순서를 바꿔보세요</span>
              <button onClick={() => setSortMode(false)} style={{ fontSize: '12px', padding: '4px 12px', borderRadius: '99px', border: 'none', background: '#FF8FAB', color: 'white', fontWeight: '700', cursor: 'pointer' }}>완료</button>
            </div>
          )}
        </div>

        {/* 할 일 목록 */}
        <div style={{ flex: 1, padding: '12px 16px 24px', overflowY: 'auto' }}
          onTouchMove={sortMode ? onTouchMoveDrag : undefined}
          onTouchEnd={sortMode ? onTouchEndDrag : undefined}>
          {sorted.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '60px 0' }}>
              <div style={{ fontSize: '56px', marginBottom: '12px' }}>{filter === '완료' ? '🎀' : '💭'}</div>
              <div style={{ fontSize: '15px', color: '#C8A0B4' }}>{filter === '완료' ? '완료한 항목이 없어요' : '할 일을 추가해보세요!'}</div>
            </div>
          ) : (
            sorted.map(todo => {
              const isDragging = draggedId === todo.id
              const isDragOver = dragOverId === todo.id && draggedId !== todo.id
              return (
                <div key={todo.id} data-todo-id={todo.id}
                  draggable={sortMode}
                  onDragStart={() => handleDragStart(todo.id)}
                  onDragOver={(e) => handleDragOver(e, todo.id)}
                  onDrop={() => handleDrop(todo.id)}
                  onMouseDown={() => startLongPress(todo.id)}
                  onMouseUp={cancelLongPress}
                  onMouseLeave={cancelLongPress}
                  onTouchStart={(e) => { startLongPress(todo.id); onTouchStartDrag(e, todo.id) }}
                  onTouchEnd={cancelLongPress}
                  style={{ display: 'flex', alignItems: 'center', gap: '10px', background: isDragOver ? '#FFF0F5' : 'white', borderRadius: '16px', padding: '14px 16px', marginBottom: '10px', boxShadow: isDragging ? '0 8px 24px rgba(255,100,150,0.2)' : '0 2px 10px rgba(255,100,150,0.07)', borderLeft: `4px solid ${CATEGORY_COLORS[todo.category] || '#FFD6E7'}`, borderTop: isDragOver ? '2px dashed #FF8FAB' : undefined, opacity: isDragging ? 0.5 : todo.done ? 0.55 : 1, transition: 'all 0.15s', cursor: sortMode ? 'grab' : 'default', userSelect: 'none' }}>

                  {sortMode && (
                    <div onTouchStart={(e) => onTouchStartDrag(e, todo.id)} style={{ color: '#FFBCCE', fontSize: '18px', flexShrink: 0, cursor: 'grab', padding: '0 2px', touchAction: 'none' }}>≡</div>
                  )}

                  <button onClick={() => !sortMode && toggleTodo(todo.id)}
                    style={{ width: '28px', height: '28px', borderRadius: '50%', border: `2px solid ${todo.done ? '#FF8FAB' : '#FFD6E7'}`, background: todo.done ? 'linear-gradient(135deg, #FF8FAB, #FFBE98)' : 'white', color: 'white', fontSize: '14px', cursor: sortMode ? 'grab' : 'pointer', flexShrink: 0, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    {todo.done ? '✓' : ''}
                  </button>

                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontSize: '15px', color: '#5D2A42', textDecoration: todo.done ? 'line-through' : 'none', marginBottom: '4px', wordBreak: 'break-word' }}>{todo.text}</div>
                    {editingCategoryId === todo.id ? (
                      <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap', marginTop: '6px' }}>
                        {Object.keys(CATEGORY_COLORS).map(cat => (
                          <button key={cat} onClick={() => updateCategory(todo.id, cat)} style={{ padding: '4px 10px', borderRadius: '99px', border: `2px solid ${CATEGORY_COLORS[cat]}`, background: todo.category === cat ? CATEGORY_COLORS[cat] : 'white', color: '#5D2A42', fontSize: '12px', fontWeight: '700', cursor: 'pointer' }}>
                            {CATEGORY_EMOJI[cat]} {cat}
                          </button>
                        ))}
                        <button onClick={() => setEditingCategoryId(null)} style={{ padding: '4px 10px', borderRadius: '99px', border: '2px solid #eee', background: 'white', color: '#bbb', fontSize: '12px', cursor: 'pointer' }}>취소</button>
                      </div>
                    ) : (
                      <div style={{ display: 'flex', gap: '6px', alignItems: 'center', flexWrap: 'wrap' }}>
                        <span
                          onClick={() => !sortMode && setEditingCategoryId(todo.id)}
                          style={{ fontSize: '11px', padding: '2px 8px', borderRadius: '99px', background: CATEGORY_COLORS[todo.category] || '#FFD6E7', color: '#5D2A42', fontWeight: '700', cursor: sortMode ? 'default' : 'pointer' }}
                        >{CATEGORY_EMOJI[todo.category]} {todo.category} {!sortMode && '✎'}</span>
                        {isCarriedOver(todo) && <span style={{ fontSize: '11px', padding: '2px 8px', borderRadius: '99px', background: '#FFE0ED', color: '#C97A96', fontWeight: '700' }}>🔄 이월</span>}
                        <span style={{ fontSize: '11px', color: '#ccc' }}>{todo.createdAt}</span>
                      </div>
                    )}
                  </div>

                  {!sortMode && (
                    <button onClick={() => deleteTodo(todo.id)} style={{ background: 'none', border: 'none', color: '#FFBCCE', fontSize: '16px', cursor: 'pointer', padding: '4px', flexShrink: 0, lineHeight: 1 }}>✕</button>
                  )}
                </div>
              )
            })
          )}
        </div>
      </div>
    </div>
  )
}
