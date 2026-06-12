import ChoiceRow from '../components/ChoiceRow'
import ExplanationBox from '../components/ExplanationBox'
import PassageBlock from '../components/PassageBlock'
import NavBar from '../components/NavBar'

export default function DetailPage({ questions, currentIdx, onBack, onNavigate, reviewed, onToggleReviewed }) {
  const q = questions[currentIdx]
  const isReviewed = reviewed.has(q.number)

  const qHtml = q.question
    ? q.question.replace(/-------/g, '<span class="blank">___</span>')
    : null

  return (
    <div>
      <div className="app-header">
        <div className="app-header-inner">
          <button className="back-btn" onClick={onBack}>‹</button>
          <div>
            <div className="header-title">Q{q.number}</div>
            <div className="header-sub">
              Part {q.part}{q.passage_type ? ' · ' + q.passage_type : ''}
            </div>
          </div>
        </div>
      </div>

      <div className="detail-position">
        {currentIdx + 1} / {questions.length}
      </div>

      <div className="detail-scroll">
        <div className="detail-q-block">
          <div className="detail-q-header">
            <span className="detail-q-num">{q.number}</span>
            <span className="detail-part-badge">Part {q.part}</span>
            {q.passage_type && (
              <span className="detail-passage-type">{q.passage_type}</span>
            )}
          </div>

          <div className="detail-q-text">
            {qHtml
              ? <span dangerouslySetInnerHTML={{ __html: qHtml }} />
              : <span style={{ color: 'var(--sub)', fontSize: '13px' }}>（長文の空所穴埋め問題）</span>
            }
          </div>

          {q.passage_text && <PassageBlock text={q.passage_text} />}

          <div className="choices-block">
            {['A', 'B', 'C', 'D'].map(letter => (
              <ChoiceRow
                key={letter}
                letter={letter}
                text={q.choices[letter]}
                correctAnswer={q.correct_answer}
                yourAnswer={q.your_answer}
              />
            ))}
          </div>

          <div className="answer-summary">
            {q.your_answer !== undefined && (
              q.your_answer
                ? <span className="ans-pill ans-pill-you">あなたの解答：{q.your_answer}</span>
                : <span className="ans-pill ans-pill-unanswered">未解答</span>
            )}
            <span className="ans-pill ans-pill-correct">正解：{q.correct_answer}</span>
          </div>
        </div>

        <ExplanationBox
          correctAnswer={q.correct_answer}
          explanationJa={q.explanation_ja}
          keywords={q.keywords}
        />

      </div>

      <div className="reviewed-bar">
        <button
          className={`reviewed-btn${isReviewed ? ' reviewed-btn-done' : ''}`}
          onClick={() => onToggleReviewed(q.number)}
        >
          {isReviewed ? '✓ 復習済み' : '復習済みにする'}
        </button>
      </div>

      <NavBar
        currentIdx={currentIdx}
        total={questions.length}
        onNavigate={onNavigate}
      />
    </div>
  )
}
