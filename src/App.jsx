import { useState } from 'react'
import HomePage from './pages/HomePage'
import ListPage from './pages/ListPage'
import DetailPage from './pages/DetailPage'
import QuizPage from './pages/QuizPage'
import { loadQuestions, loadPassageUnits } from './utils/dataLoader'

function loadReviewed(datasetId) {
  try {
    const saved = localStorage.getItem(`reviewed_${datasetId}`)
    return saved ? new Set(JSON.parse(saved)) : new Set()
  } catch {
    return new Set()
  }
}

function saveReviewed(datasetId, set) {
  localStorage.setItem(`reviewed_${datasetId}`, JSON.stringify([...set]))
}

export default function App() {
  const [view, setView] = useState('home')
  const [activeDataset, setActiveDataset] = useState(null)
  const [questions, setQuestions] = useState([])
  const [units, setUnits] = useState([])
  const [currentIdx, setCurrentIdx] = useState(0)
  const [reviewed, setReviewed] = useState(new Set())

  function goToList(datasetId) {
    setActiveDataset(datasetId)
    setQuestions(loadQuestions(datasetId))
    setReviewed(loadReviewed(datasetId))
    setView('list')
  }

  function goToQuiz(datasetId) {
    setActiveDataset(datasetId)
    setUnits(loadPassageUnits(datasetId))
    setView('quiz')
  }

  function goHome() {
    setView('home')
    setActiveDataset(null)
  }

  function showDetail(idx) {
    setCurrentIdx(idx)
    setView('detail')
    window.scrollTo(0, 0)
  }

  function showList() {
    setView('list')
  }

  function navigate(dir) {
    const newIdx = currentIdx + dir
    if (newIdx < 0 || newIdx >= questions.length) return
    setCurrentIdx(newIdx)
    window.scrollTo(0, 0)
  }

  function toggleReviewed(qNumber) {
    setReviewed(prev => {
      const next = new Set(prev)
      next.has(qNumber) ? next.delete(qNumber) : next.add(qNumber)
      saveReviewed(activeDataset, next)
      return next
    })
  }

  function handleSelectMode(mode, datasetId) {
    mode === 'list' ? goToList(datasetId) : goToQuiz(datasetId)
  }

  return (
    <>
      {view === 'home' && (
        <HomePage onSelectMode={handleSelectMode} />
      )}
      {view === 'list' && (
        <ListPage
          datasetId={activeDataset}
          questions={questions}
          onSelect={showDetail}
          reviewed={reviewed}
          onBack={goHome}
        />
      )}
      {view === 'detail' && (
        <DetailPage
          questions={questions}
          currentIdx={currentIdx}
          onBack={showList}
          onNavigate={navigate}
          reviewed={reviewed}
          onToggleReviewed={toggleReviewed}
        />
      )}
      {view === 'quiz' && (
        <QuizPage
          datasetId={activeDataset}
          units={units}
          onBack={goHome}
        />
      )}
    </>
  )
}
