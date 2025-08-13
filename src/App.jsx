import { useEffect, useState } from 'react'
import './App.css'

function generateCircles(count, width, height, radius) {
  const arr = []
  for (let i = 0; i < count; i++) {
    const x = radius + Math.random() * (width - 2 * radius)
    const y = radius + Math.random() * (height - 2 * radius)
    arr.push({ id: i + 1, x, y })
  }
  return arr
}

function getNextId(items, fadingMap) {
  const alive = items.filter((c) => !fadingMap[c.id])
  if (alive.length === 0) return null
  let min = alive[0].id
  for (let i = 1; i < alive.length; i++) {
    if (alive[i].id < min) min = alive[i].id
  }
  return min
}

function App() {
  // Cấu hình
  const BOARD = 420
  const R = 28
  const VANISH_MS = 2000

  const [target, setTarget] = useState(10)
  const [circles, setCircles] = useState([])
  const [started, setStarted] = useState(false)
  const [startAt, setStartAt] = useState(0)
  const [now, setNow] = useState(0)
  const [finishAt, setFinishAt] = useState(0)
  const [gameOver, setGameOver] = useState(false)
  const [autoOn, setAutoOn] = useState(false)
  const [vanishUntil, setVanishUntil] = useState({})
  const [wrongId, setWrongId] = useState(null)

  useEffect(() => {
    if (!started) return
    const t = setInterval(() => setNow(Date.now()), 100)
    return () => clearInterval(t)
  }, [started])

  const nextExpected = getNextId(circles, vanishUntil)

  // Start
  const startGame = () => {
    const n = Math.min(Math.max(Number(target) || 1, 1), 50000)
    setCircles(generateCircles(n, BOARD, BOARD, R))
    const t = Date.now()
    setStartAt(t)
    setNow(t)
    setFinishAt(0)
    setGameOver(false)
    setVanishUntil({})
    setWrongId(null)
    setStarted(true)
  }

  // Reset
  const reset = () => {
    setStarted(false)
    setCircles([])
    setStartAt(0)
    setNow(0)
    setFinishAt(0)
    setGameOver(false)
    setAutoOn(false)
    setVanishUntil({})
    setWrongId(null)
  }

  const handleCircleClick = (id) => {
    if (!started || gameOver) return
    if (vanishUntil[id]) return
  const expected = getNextId(circles, vanishUntil)
  if (expected == null) return
  if (id !== expected) {
      setWrongId(id)
      setGameOver(true)
      setFinishAt(Date.now())
      return
    }
    const until = Date.now() + VANISH_MS
    setVanishUntil(prev => ({ ...prev, [id]: until }))
    setTimeout(() => {
      setCircles(prev => prev.filter(c => c.id !== id))
      setVanishUntil(prev => {
        const { [id]: _, ...rest } = prev
        return rest
      })
    }, VANISH_MS)
  }

  const allCleared = started && !gameOver && circles.length === 0
  useEffect(() => {
    if (started && !gameOver && circles.length === 0 && startAt && !finishAt) {
      setFinishAt(Date.now())
    }
  }, [started, gameOver, circles.length, startAt, finishAt])

  // Auto Play
  useEffect(() => {
    if (!autoOn || !started || gameOver || circles.length === 0) return
    const t = setTimeout(() => {
    const nxt = getNextId(circles, vanishUntil)
    if (nxt != null) handleCircleClick(nxt)
    }, 160)
    return () => clearTimeout(t)
  }, [autoOn, started, gameOver, circles, vanishUntil])

  return (
    <div className="container">
      <div className={`panel ${gameOver ? 'ko' : allCleared ? 'ok' : ''}`}>
        <h2 className={`title ${gameOver ? 'red' : allCleared ? 'green' : ''}`}>
          {gameOver ? 'GAME OVER' : allCleared ? 'ALL CLEARED' : "LET'S PLAY"}
        </h2>

        <div className="row">
          <label htmlFor="points">Points:</label>
          <input
            id="points"
            type="number"
            min={1}
            max={50000}
            value={target}
            onChange={(e) => setTarget(e.target.value)}
            onKeyDown={() => {}}
          />
        </div>

        <div className="row">
          <span>Time:</span>
          <span className="time">{(started ? Math.max(0, ((finishAt || now) - startAt) / 1000) : 0).toFixed(1)}s</span>
        </div>

        <div className="actions">
          {!started ? (
            <button onClick={startGame} className="primary">Play</button>
          ) : (
            <>
              <button onClick={reset} className="secondary">Reset</button>
              <button
                onClick={() => setAutoOn(v => !v)}
                className={autoOn ? 'auto on' : 'auto'}
                disabled={gameOver}
              >
                {autoOn ? 'Auto Play ON' : 'Auto Play OFF'}
              </button>
            </>
          )}
        </div>
      </div>

      <div
        className={`board${autoOn ? ' auto' : ''}`}
        style={{ width: BOARD, height: BOARD }}
        aria-label="Game board"
      >
        {circles.map((c) => {
          const until = vanishUntil[c.id]
          const remain = until ? Math.max(0, (until - now) / 1000) : null
          return (
            <button
              key={c.id}
              className={
                'circle' +
                (until ? ' vanishing' : '') +
                (wrongId === c.id && gameOver ? ' wrong' : '')
              }
              style={{ left: c.x - R, top: c.y - R, width: R * 2, height: R * 2 }}
              onClick={() => (!autoOn ? handleCircleClick(c.id) : null)}
              aria-label={`circle ${c.id}`}
            >
              {until ? (
                <>
                  <span className="num">{c.id}</span>
                  <span className="remain">{remain.toFixed(1)}s</span>
                </>
              ) : (
                <span className="num">{c.id}</span>
              )}
            </button>
          )
        })}
      </div>

      <div className="next-label">Next: {nextExpected ?? '-'}</div>
    </div>
  )
}

export default App
