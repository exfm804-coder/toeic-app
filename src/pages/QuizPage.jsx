import { useState } from 'react'
import ExplanationBox from '../components/ExplanationBox'
import PassageBlock from '../components/PassageBlock'

const DATASET_LABELS = {
  'book12-test1': { title: '一問一答', sub: '問題集12 · TEST1 · Reading' },
  'book11-test1': { title: '一問一答', sub: '問題集11 · TEST1 · Reading' },
  'book11-test2': { title: '一問一答', sub: '問題集11 · TEST2 · Reading' },
}

function getChoiceClass(letter, selectedAnswer, correctAnswer, phase) {
  if (phase === 'reviewing') {
    if (letter === correctAnswer) return 'reveal-correct'
    if (letter === selectedAnswer) return 'reveal-wrong'
    return 'reveal-other'
  }
  if (letter === selectedAnswer) return 'is-selected'
  return ''
}

function QuestionBlock({ q, phase, allAnswers, onChoice, showPassageType }) {
  const selectedAnswer = allAnswers[q.number]
  const qHtml = q.question?.replace(/-------/g, '<span class="blank">___</span>') ?? null

  return (
    <div className="quiz-q-block">
      <div className="quiz-q-header">
        <span className="detail-q-num">{q.number}</span>
        <span className="detail-part-badge">Part {q.part}</span>
        {showPassageType && q.passage_type && (
          <span className="detail-passage-type">{q.passage_type}</span>
        )}
      </div>

      <div className="detail-q-text">
        {qHtml
          ? <span dangerouslySetInnerHTML={{ __html: qHtml }} />
          : <span style={{ color: 'var(--sub)', fontSize: '13px' }}>（長文の空所穴埋め問題）</span>
        }
      </div>

      <div className="quiz-choices-block">
        {['A', 'B', 'C', 'D'].map(letter => (
          <button
            key={letter}
            className={`quiz-choice-btn ${getChoiceClass(letter, selectedAnswer, q.correct_answer, phase)}`}
            onClick={() => phase === 'answering' && onChoice(q.number, letter)}
            disabled={phase === 'reviewing'}
          >
            <div className="quiz-choice-letter">{letter}</div>
            <div className="quiz-choice-text">{q.choices[letter]}</div>
          </button>
        ))}
      </div>

      {phase === 'reviewing' && (
        <ExplanationBox
          correctAnswer={q.correct_answer}
          explanationJa={q.explanation_ja}
          keywords={q.keywords}
        />
      )}
    </div>
  )
}

function DoneScreen({ units, allAnswers, onBack, label }) {
  let totalCorrect = 0
  let totalQuestions = 0

  units.forEach(unit => {
    if (unit.type === 'single') {
      totalQuestions++
      if (allAnswers[unit.question.number] === unit.question.correct_answer) totalCorrect++
    } else {
      unit.questions.forEach(q => {
        totalQuestions++
        if (allAnswers[q.number] === q.correct_answer) totalCorrect++
      })
    }
  })

  const pct = totalQuestions > 0 ? Math.round((totalCorrect / totalQuestions) * 100) : 0

  return (
    <div>
      <div className="app-header">
        <div className="app-header-inner">
          <div>
            <div className="header-title">結果</div>
            <div className="header-sub">{label.sub}</div>
          </div>
        </div>
      </div>

      <div className="quiz-done">
        <div className="quiz-score-label">最終スコア</div>
        <div className="quiz-score-circle">
          <div className="quiz-score-num">{totalCorrect}</div>
          <div className="quiz-score-denom">/ {totalQuestions}</div>
        </div>
        <div className="quiz-score-label">{pct}% 正解</div>
        <button className="quiz-back-btn" onClick={onBack}>ホームに戻る</button>
      </div>
    </div>
  )
}

export default function QuizPage({ datasetId, units, onBack }) {
  const [unitIdx, setUnitIdx] = useState(0)
  const [phase, setPhase] = useState('answering')
  const [allAnswers, setAllAnswers] = useState({})

  const label = DATASET_LABELS[datasetId] ?? { title: '一問一答', sub: 'Reading' }

  if (phase === 'done' || units.length === 0) {
    return <DoneScreen units={units} allAnswers={allAnswers} onBack={onBack} label={label} />
  }

  const unit = units[unitIdx]
  const isLastUnit = unitIdx === units.length - 1

  function handleChoice(qNumber, letter) {
    const updated = { ...allAnswers, [qNumber]: letter }
    setAllAnswers(updated)
    if (unit.type === 'single') {
      setPhase('reviewing')
    }
  }

  function handlePassageSubmit() {
    setPhase('reviewing')
  }

  function handleNext() {
    if (isLastUnit) {
      setPhase('done')
    } else {
      setUnitIdx(prev => prev + 1)
      setPhase('answering')
      window.scrollTo(0, 0)
    }
  }

  const passageAllAnswered =
    unit.type === 'passage' && unit.questions.every(q => allAnswers[q.number])

  return (
    <div>
      <div className="app-header">
        <div className="app-header-inner">
          <button className="back-btn" onClick={onBack}>‹</button>
          <div>
            <div className="header-title">{label.title}</div>
            <div className="header-sub">{label.sub}</div>
          </div>
        </div>
      </div>

      <div className="quiz-progress">
        {unitIdx + 1} / {units.length}
      </div>

      <div style={{ paddingBottom: '80px' }}>
        {unit.type === 'single' && (
          <QuestionBlock
            q={unit.question}
            phase={phase}
            allAnswers={allAnswers}
            onChoice={handleChoice}
          />
        )}

        {unit.type === 'passage' && (
          <>
            <PassageBlock text={unit.passage_text} />
            {unit.questions.map(q => (
              <QuestionBlock
                key={q.number}
                q={q}
                phase={phase}
                allAnswers={allAnswers}
                onChoice={handleChoice}
                showPassageType={false}
              />
            ))}
          </>
        )}
      </div>

      {phase === 'reviewing' && (
        <div className="detail-nav">
          <button className="nav-btn primary" onClick={handleNext}>
            {isLastUnit ? '結果を見る' : '次へ →'}
          </button>
        </div>
      )}

      {phase === 'answering' && unit.type === 'passage' && (
        <div className="quiz-submit-bar">
          <button
            className="quiz-submit-btn"
            disabled={!passageAllAnswered}
            onClick={handlePassageSubmit}
          >
            答え合わせ
          </button>
        </div>
      )}
    </div>
  )
}
