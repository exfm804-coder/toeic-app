import { useState } from 'react'
import ScoreBar from '../components/ScoreBar'
import QuestionCard from '../components/QuestionCard'

export default function ListPage({ questions, onSelect, reviewed }) {
  const [filterUnreviewed, setFilterUnreviewed] = useState(false)
  const [activePart, setActivePart] = useState(null)

  function handlePartClick(part) {
    setActivePart(prev => prev === part ? null : part)
  }

  const displayQuestions = questions.map((q, i) => ({ q, i }))
    .filter(({ q }) => !filterUnreviewed || !reviewed.has(q.number))
    .filter(({ q }) => activePart === null || q.part === activePart)

  return (
    <div>
      <div className="app-header">
        <div className="app-header-inner">
          <div>
            <div className="header-title">TEST 1 復習リスト</div>
            <div className="header-sub">Reading · 間違い・未解答</div>
          </div>
          <button
            className={`filter-btn${filterUnreviewed ? ' filter-btn-active' : ''}`}
            onClick={() => setFilterUnreviewed(v => !v)}
          >
            {filterUnreviewed ? 'すべて' : '未復習のみ'}
          </button>
        </div>
        <ScoreBar questions={questions} activePart={activePart} onPartClick={handlePartClick} />
      </div>

      <div>
        {[5, 6, 7].map(part => {
          const items = displayQuestions.filter(({ q }) => q.part === part)
          if (!items.length) return null
          return (
            <div key={part} className="part-section">
              <div className="part-heading">
                <span>Part {part}</span>
                <span className="part-count">{items.length} 問</span>
              </div>
              {items.map(({ q, i }) => (
                <QuestionCard key={q.number} question={q} onClick={() => onSelect(i)} isReviewed={reviewed.has(q.number)} />
              ))}
            </div>
          )
        })}
        {displayQuestions.length === 0 && (
          <div className="filter-empty">未復習の問題はありません</div>
        )}
      </div>
    </div>
  )
}
