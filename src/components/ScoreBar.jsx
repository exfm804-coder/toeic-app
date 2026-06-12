export default function ScoreBar({ questions, activePart, onPartClick }) {
  const byPart = { 5: 0, 6: 0, 7: 0 }
  const totals = { 5: 30, 6: 16, 7: 54 }
  let wrongCount = 0
  questions.forEach(q => {
    byPart[q.part]++
    if (q.your_answer !== undefined && q.your_answer !== q.correct_answer) wrongCount++
  })
  const total = questions.length

  return (
    <div className="score-bar">
      <div
        className={`score-item score-item-btn${activePart === null ? ' score-item-active' : ''}`}
        onClick={() => onPartClick(null)}
      >
        <div className="score-label">間違い</div>
        <div className="score-val">{wrongCount}<span className="score-denom">/{total}</span></div>
      </div>
      <div className="score-divider" />
      {[5, 6, 7].map((part, i) => (
        <>
          <div
            key={part}
            className={`score-item score-item-btn${activePart === part ? ' score-item-active' : ''}`}
            onClick={() => onPartClick(part)}
          >
            <div className="score-label">Part {part}</div>
            <div className="score-val">{byPart[part]}<span className="score-denom">/{totals[part]}</span></div>
          </div>
          {i < 2 && <div key={`div-${part}`} className="score-divider" />}
        </>
      ))}
    </div>
  )
}
