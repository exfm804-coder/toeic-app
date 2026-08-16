export default function ScoreBar({ questions, activePart, onPartClick }) {
  const wrongByPart = { 5: 0, 6: 0, 7: 0 }
  const answeredByPart = { 5: 0, 6: 0, 7: 0 }
  const totals = { 5: 30, 6: 16, 7: 54 }
  let wrongCount = 0
  let answeredCount = 0
  questions.forEach(q => {
    if (q.your_answer === undefined) return
    answeredCount++
    answeredByPart[q.part]++
    if (q.your_answer !== q.correct_answer) {
      wrongCount++
      wrongByPart[q.part]++
    }
  })
  const total = questions.length
  const isPartial = answeredCount > 0 && answeredCount < total

  return (
    <div className="score-bar">
      <div
        className={`score-item score-item-btn${activePart === null ? ' score-item-active' : ''}`}
        onClick={() => onPartClick(null)}
      >
        <div className="score-label">
          間違い
          {isPartial && <span className="score-progress-dot" title="回答途中" />}
        </div>
        <div className="score-val">{answeredCount === 0 ? '-' : wrongCount}<span className="score-denom">/{total}</span></div>
      </div>
      <div className="score-divider" />
      {[5, 6, 7].map((part, i) => {
        const partIsPartial = answeredByPart[part] > 0 && answeredByPart[part] < totals[part]
        return (
          <>
            <div
              key={part}
              className={`score-item score-item-btn${activePart === part ? ' score-item-active' : ''}`}
              onClick={() => onPartClick(part)}
            >
              <div className="score-label">
                Part {part}
                {partIsPartial && <span className="score-progress-dot" title="回答途中" />}
              </div>
              <div className="score-val">{answeredByPart[part] === 0 ? '-' : wrongByPart[part]}<span className="score-denom">/{totals[part]}</span></div>
            </div>
            {i < 2 && <div key={`div-${part}`} className="score-divider" />}
          </>
        )
      })}
    </div>
  )
}
