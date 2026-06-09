export default function QuestionCard({ question: q, onClick, isReviewed }) {
  const raw = q.question || ''
  const preview = raw
    ? raw.replace(/-------/g, '_____').substring(0, 50) + (raw.length > 50 ? '…' : '')
    : `選択肢: (A)${q.choices.A}  (B)${q.choices.B}  (C)${q.choices.C}  (D)${q.choices.D}`.substring(0, 50) + '…'

  const youLabel = q.your_answer ? `あなた: ${q.your_answer}` : '未解答'

  return (
    <div className={`q-card${isReviewed ? ' q-card-reviewed' : ''}`} onClick={onClick}>
      <div className={`q-num${isReviewed ? ' q-num-reviewed' : ''}`}>
        {isReviewed ? '✓' : q.number}
      </div>
      <div className="q-card-body">
        <div className="q-preview">{preview}</div>
        <div className="q-meta">
          <span className="q-ans-badge badge-wrong">{youLabel}</span>
          <span className="q-ans-badge badge-correct">正解: {q.correct_answer}</span>
          {q.passage_type && <span className="q-type-tag">{q.passage_type}</span>}
        </div>
      </div>
      <div className="q-arrow">›</div>
    </div>
  )
}
