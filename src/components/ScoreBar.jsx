export default function ScoreBar({ questions }) {
  const byPart = { 5: 0, 6: 0, 7: 0 }
  const totals = { 5: 30, 6: 16, 7: 54 }
  questions.forEach(q => { byPart[q.part]++ })
  const total = questions.length

  return (
    <div className="score-bar">
      <div className="score-item">
        <div className="score-label">間違い</div>
        <div className="score-val">{total}<span className="score-denom"> 問</span></div>
      </div>
      <div className="score-divider" />
      <div className="score-item">
        <div className="score-label">Part 5</div>
        <div className="score-val">{byPart[5]}<span className="score-denom">/{totals[5]}</span></div>
      </div>
      <div className="score-divider" />
      <div className="score-item">
        <div className="score-label">Part 6</div>
        <div className="score-val">{byPart[6]}<span className="score-denom">/{totals[6]}</span></div>
      </div>
      <div className="score-divider" />
      <div className="score-item">
        <div className="score-label">Part 7</div>
        <div className="score-val">{byPart[7]}<span className="score-denom">/{totals[7]}</span></div>
      </div>
    </div>
  )
}
