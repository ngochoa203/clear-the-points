import { useEffect, useMemo, useRef, useState } from 'react'
import './App.css'

// Small utility to get distance between two points
const dist = (a, b) => Math.hypot(a.x - b.x, a.y - b.y)

// Generate random circle centers within a box (overlap allowed for large counts)
function generateCircles(count, width, height, radius) {
  const circles = []
  for (let i = 0; i < count; i++) {
    const x = radius + Math.random() * (width - 2 * radius)
    const y = radius + Math.random() * (height - 2 * radius)
    circles.push({ x, y })
  }
  return circles
}

function App() {
  // Gameplay config
  const BOARD_SIZE = 420
  const RADIUS = 28
  const VANISH_MS = 2500

  // State
  const [targetCount, setTargetCount] = useState(10)
  const [circles, setCircles] = useState([]) // {id, x, y}
  const [started, setStarted] = useState(false)
  const [startTs, setStartTs] = useState(0)
  const [nowTs, setNowTs] = useState(0)
  const [finishTs, setFinishTs] = useState(0)
  const [gameOver, setGameOver] = useState(false)
  const [autoOn, setAutoOn] = useState(false)
  const [vanishUntil, setVanishUntil] = useState({}) // id -> timestamp when it disappears
  const [wrongId, setWrongId] = useState(null)

  const timeElapsed = useMemo(() => {
    if (!started) return 0
    const end = finishTs || nowTs
    return Math.max(0, ((end || Date.now()) - startTs) / 1000)
  }, [started, startTs, nowTs, finishTs])

  // Timer tick
  useEffect(() => {
    if (!started) return
    const id = setInterval(() => setNowTs(Date.now()), 100)
    return () => clearInterval(id)
  }, [started])

  // No auto-start; user must press Play

  // Convenience: the next expected id is the smallest remaining id
  const nextExpected = useMemo(() => {
    if (circles.length === 0) return null
    const available = circles.filter((c) => !vanishUntil[c.id])
    if (available.length === 0) return null
    return available.reduce((min, c) => (c.id < min ? c.id : min), available[0].id)
  }, [circles, vanishUntil])

  // Start game: create circles and start timer
  const startGame = () => {
    const count = Math.min(Math.max(Number(targetCount) || 1, 1), 50000)
    const centers = generateCircles(count, BOARD_SIZE, BOARD_SIZE, RADIUS)
    const withIds = centers.map((c, idx) => ({ id: idx + 1, ...c }))
    setCircles(withIds)
    setStartTs(Date.now())
  setNowTs(Date.now())
  setFinishTs(0)
    setGameOver(false)
  setVanishUntil({})
    setWrongId(null)
  setStarted(true)
  }

  // Reset
  const reset = () => {
    setStarted(false)
    setCircles([])
    setStartTs(0)
  setNowTs(0)
  setFinishTs(0)
    setGameOver(false)
    setAutoOn(false)
  setVanishUntil({})
    setWrongId(null)
  }

  // Attempt to click a circle; enforces ascending order
  const handleCircleClick = (id, fromAuto = false) => {
    if (!started || gameOver) return
    // prevent re-clicking one that is already vanishing
    if (vanishUntil[id]) return
    if (nextExpected == null) return
    if (id !== nextExpected) {
      setWrongId(id)
      setGameOver(true)
      setFinishTs(Date.now())
      return
    }
    // Animate vanish then remove
    const until = Date.now() + VANISH_MS
    setVanishUntil((prev) => ({ ...prev, [id]: until }))
    window.setTimeout(() => {
      setCircles((prev) => prev.filter((c) => c.id !== id))
      setVanishUntil((prev) => {
        const { [id]: _, ...rest } = prev
        return rest
      })
    }, VANISH_MS)
  }

  const allCleared = started && !gameOver && circles.length === 0

  useEffect(() => {
    if (started && !gameOver && circles.length === 0 && startTs && !finishTs) {
      setFinishTs(Date.now())
    }
  }, [started, gameOver, circles.length, startTs, finishTs])

  // Auto play effect: click the next expected every ~240ms
  useEffect(() => {
    if (!autoOn || !started || gameOver) return
    if (circles.length === 0) return
    const id = window.setTimeout(() => {
      if (nextExpected != null) handleCircleClick(nextExpected, true)
    }, 160)
    return () => window.clearTimeout(id)
  }, [autoOn, started, gameOver, circles, nextExpected])

  // Accessibility: prevent accidental Enter-to-start; do nothing
  const onPointsKeyDown = () => {}

  return (
    <div className="container">
      <div className="panel">
        <h2 className="title">{gameOver ? 'GAME OVER' : allCleared ? 'ALL CLEARED' : "LET'S PLAY"}</h2>
        <div className="row">
          <label htmlFor="points">Points:</label>
          <input
            id="points"
            type="number"
            min={1}
            max={50000}
            value={targetCount}
            onChange={(e) => setTargetCount(e.target.value)}
            onKeyDown={onPointsKeyDown}
          />
        </div>
        <div className="row">
          <span>Time:</span>
          <span className="time">{timeElapsed.toFixed(1)}s</span>
        </div>
        <div className="actions">
          {!started ? (
            <button onClick={startGame} className="primary">Play</button>
          ) : (
            <>
              <button onClick={reset} className="secondary">Reset</button>
              <button onClick={() => setAutoOn((v) => !v)} className={autoOn ? 'auto on' : 'auto'} disabled={gameOver}>
                {autoOn ? 'Auto Play ON' : 'Auto Play OFF'}
              </button>
            </>
          )}
        </div>
      </div>

      <div
        className={`board${autoOn ? ' auto' : ''}`}
        style={{ width: BOARD_SIZE, height: BOARD_SIZE }}
        aria-label="Game board"
      >
        {circles.map((c) => {
          const until = vanishUntil[c.id]
          const remaining = until ? Math.max(0, (until - nowTs) / 1000) : null
          return (
          <button
            key={c.id}
            className={
              'circle' +
              (until ? ' vanishing' : '') +
              (wrongId === c.id && gameOver ? ' wrong' : '')
            }
            style={{ left: c.x - RADIUS, top: c.y - RADIUS, width: RADIUS * 2, height: RADIUS * 2 }}
            onClick={() => (!autoOn ? handleCircleClick(c.id) : null)}
            aria-label={`circle ${c.id}`}
          >
            {until ? (
              <>
                <span className="num">{c.id}</span>
                <span className="remain">{remaining.toFixed(1)}s</span>
              </>
            ) : (
              <span className="num">{c.id}</span>
            )}
          </button>
        )})}

      </div>
  <div className="next-label">Next: {nextExpected ?? '-'}</div>
    </div>
  )
}

export default App
