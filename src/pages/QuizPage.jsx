import { useState, useEffect, useRef } from 'react'
import { saveQuizAnswers } from '../utils/dataLoader'

const DATASET_LABELS = {
  'book12-test1': { title: '一問一答', sub: '問題集12 · TEST1 · Reading' },
  'book11-test1': { title: '一問一答', sub: '問題集11 · TEST1 · Reading' },
  'book11-test2': { title: '一問一答', sub: '問題集11 · TEST2 · Reading' },
}

function formatTime(ms) {
  const s = Math.floor(ms / 1000)
  const m = Math.floor(s / 60)
  const h = Math.floor(m / 60)
  return `${String(h).padStart(2, '0')}:${String(m % 60).padStart(2, '0')}:${String(s % 60).padStart(2, '0')}`
}

function saveProgress(datasetId, partKey, answers, elapsedMs) {
  localStorage.setItem(
    `quiz_progress_${datasetId}_${partKey}`,
    JSON.stringify({ answers, elapsedMs })
  )
}

function loadProgress(datasetId, partKey) {
  try {
    const s = localStorage.getItem(`quiz_progress_${datasetId}_${partKey}`)
    return s ? JSON.parse(s) : null
  } catch { return null }
}

function clearProgress(datasetId, partKey) {
  localStorage.removeItem(`quiz_progress_${datasetId}_${partKey}`)
}

// ---- Part Selection Screen ----
function SelectScreen({ questions, datasetId, label, onStart, onBack }) {
  const parts = {}
  questions.forEach(q => {
    if (!parts[q.part]) parts[q.part] = { min: q.number, max: q.number }
    else {
      parts[q.part].min = Math.min(parts[q.part].min, q.number)
      parts[q.part].max = Math.max(parts[q.part].max, q.number)
    }
  })

  const allMin = Math.min(...questions.map(q => q.number))
  const allMax = Math.max(...questions.map(q => q.number))

  const options = [
    { key: 'all', label: '全問', range: `Q${allMin}-${allMax}`, count: questions.length },
    ...Object.entries(parts).sort(([a], [b]) => Number(a) - Number(b)).map(([part, info]) => ({
      key: String(part),
      label: `Part ${part}`,
      range: `Q${info.min}-${info.max}`,
    })),
  ]

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

      <div className="select-list">
        {options.map(opt => {
          const hasProgress = !!loadProgress(datasetId, opt.key)
          return (
            <button
              key={opt.key}
              className="select-item"
              onClick={() => onStart(opt.key, opt.label, opt.range)}
            >
              <div className="select-item-left">
                <span className="select-item-label">{opt.label} {opt.range}</span>
                {hasProgress && <span className="select-item-badge">途中</span>}
              </div>
              <span className="select-item-arrow">›</span>
            </button>
          )
        })}
      </div>
    </div>
  )
}

// ---- Answer Sheet Screen ----
function AnswerSheet({ questions, partKey, partLabel, partRange, datasetId, onBack, onGoToReview }) {
  const savedProgress = loadProgress(datasetId, partKey)
  const [showResumeDialog, setShowResumeDialog] = useState(!!savedProgress)
  const [showBackDialog, setShowBackDialog] = useState(false)
  const [answers, setAnswers] = useState({})
  const [elapsedMs, setElapsedMs] = useState(0)
  const [graded, setGraded] = useState(false)
  const startTimeRef = useRef(null)
  const initialElapsedRef = useRef(0)

  useEffect(() => {
    if (showResumeDialog) return
    const t0 = Date.now() - initialElapsedRef.current
    startTimeRef.current = t0
    const id = setInterval(() => setElapsedMs(Date.now() - t0), 1000)
    return () => clearInterval(id)
  }, [showResumeDialog])

  function getElapsed() {
    return startTimeRef.current ? Date.now() - startTimeRef.current : 0
  }

  function handleResume(resume) {
    if (resume && savedProgress) {
      setAnswers(savedProgress.answers ?? {})
      initialElapsedRef.current = savedProgress.elapsedMs ?? 0
    } else {
      clearProgress(datasetId, partKey)
      initialElapsedRef.current = 0
    }
    setShowResumeDialog(false)
  }

  function handleSelect(qNumber, letter) {
    if (graded) return
    setAnswers(prev => {
      const updated = { ...prev, [qNumber]: letter }
      saveProgress(datasetId, partKey, updated, getElapsed())
      // マージして復習モード用に随時保存
      const existing = JSON.parse(localStorage.getItem(`quiz_answers_${datasetId}`) || '{}')
      saveQuizAnswers(datasetId, { ...existing, [qNumber]: letter })
      return updated
    })
  }

  function handleGrade() {
    clearProgress(datasetId, partKey)
    setGraded(true)
    const existing = JSON.parse(localStorage.getItem(`quiz_answers_${datasetId}`) || '{}')
    saveQuizAnswers(datasetId, { ...existing, ...answers })
  }

  function handleBack() {
    if (graded) { onBack(); return }
    setShowBackDialog(true)
  }

  function handleConfirmBack() {
    saveProgress(datasetId, partKey, answers, getElapsed())
    setShowBackDialog(false)
    onBack()
  }

  const answeredCount = Object.keys(answers).length
  const totalCount = questions.length

  let correctCount = 0
  if (graded) {
    questions.forEach(q => {
      if (answers[q.number] === q.correct_answer) correctCount++
    })
  }
  const wrongCount = totalCount - correctCount
  const pct = totalCount > 0 ? Math.round((correctCount / totalCount) * 100) : 0

  return (
    <div>
      <div className="app-header">
        <div className="app-header-inner">
          <button className="back-btn" onClick={handleBack}>‹</button>
          {!graded ? (
            <>
              <div className="quiz-timer">⏱ {formatTime(elapsedMs)}</div>
              <button
                className={`grade-btn${answeredCount > 0 ? ' grade-btn-active' : ''}`}
                disabled={answeredCount === 0}
                onClick={handleGrade}
              >
                採点
              </button>
            </>
          ) : (
            <div style={{ flex: 1, textAlign: 'center' }}>
              <div className="header-title">{correctCount} / {totalCount} 問正解</div>
              <div className="header-sub">{pct}%</div>
            </div>
          )}
        </div>
      </div>

      {graded ? (
        <div className="quiz-done" style={{ paddingTop: '40px' }}>
          <div className="quiz-score-label">スコア</div>
          <div className="quiz-score-circle">
            <div className="quiz-score-num">{correctCount}</div>
            <div className="quiz-score-denom">/ {totalCount}</div>
          </div>
          <div className="quiz-score-label">{pct}% 正解</div>
          {wrongCount > 0 && onGoToReview && (
            <button className="quiz-back-btn" onClick={onGoToReview}>
              復習モードへ（{wrongCount}問）
            </button>
          )}
          <button
            className="quiz-back-btn"
            style={{ background: 'white', color: 'var(--navy)', border: '1.5px solid var(--navy)' }}
            onClick={onBack}
          >
            パート選択に戻る
          </button>
        </div>
      ) : (
        <div style={{ paddingBottom: '20px' }}>
          <div className="answer-sheet-progress">
            {answeredCount} / {totalCount} 回答済み
          </div>
          {questions.map(q => (
            <div key={q.number} className="answer-row">
              <div className="answer-row-num">{q.number}</div>
              <div className="answer-row-choices">
                {['A', 'B', 'C', 'D'].map(letter => (
                  <button
                    key={letter}
                    className={`answer-circle${answers[q.number] === letter ? ' answer-circle-selected' : ''}`}
                    onClick={() => handleSelect(q.number, letter)}
                  >
                    {letter}
                  </button>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}

      {showResumeDialog && (
        <div className="dialog-overlay">
          <div className="dialog-box">
            <div className="dialog-text">
              中断した記録があります。<br />前回の途中から始めますか？
            </div>
            <div className="dialog-buttons">
              <button className="dialog-btn dialog-btn-outline" onClick={() => handleResume(false)}>
                最初から
              </button>
              <button className="dialog-btn dialog-btn-primary" onClick={() => handleResume(true)}>
                前回の途中から
              </button>
            </div>
          </div>
        </div>
      )}

      {showBackDialog && (
        <div className="dialog-overlay">
          <div className="dialog-box">
            <button className="dialog-close" onClick={() => setShowBackDialog(false)}>×</button>
            <div className="dialog-text">
              {partLabel} {partRange}を中断し、<br />前の画面に戻りますか？
            </div>
            <div className="dialog-buttons">
              <button className="dialog-btn dialog-btn-primary" onClick={handleConfirmBack}>
                中断する
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

// ---- Main ----
export default function QuizPage({ datasetId, questions, onBack, onGoToReview }) {
  const [view, setView] = useState('select')
  const [partKey, setPartKey] = useState(null)
  const [partLabel, setPartLabel] = useState('')
  const [partRange, setPartRange] = useState('')

  const label = DATASET_LABELS[datasetId] ?? { title: '一問一答', sub: 'Reading' }

  function handleStart(key, lbl, range) {
    setPartKey(key)
    setPartLabel(lbl)
    setPartRange(range)
    setView('answering')
  }

  const filteredQuestions = partKey === 'all'
    ? questions
    : questions.filter(q => String(q.part) === partKey)

  if (view === 'select') {
    return (
      <SelectScreen
        questions={questions}
        datasetId={datasetId}
        label={label}
        onStart={handleStart}
        onBack={onBack}
      />
    )
  }

  return (
    <AnswerSheet
      questions={filteredQuestions}
      partKey={partKey}
      partLabel={partLabel}
      partRange={partRange}
      datasetId={datasetId}
      onBack={() => setView('select')}
      onGoToReview={onGoToReview}
    />
  )
}
