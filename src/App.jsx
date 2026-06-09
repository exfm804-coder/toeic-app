import { useState } from 'react'
import ListPage from './pages/ListPage'
import DetailPage from './pages/DetailPage'
import { loadQuestions } from './utils/dataLoader'

const questions = loadQuestions()

function loadReviewed() {
  try {
    const saved = localStorage.getItem('reviewed')
    return saved ? new Set(JSON.parse(saved)) : new Set()
  } catch {
    return new Set()
  }
}

export default function App() {
  const [view, setView] = useState('list')
  const [currentIdx, setCurrentIdx] = useState(0)
  const [reviewed, setReviewed] = useState(loadReviewed)

  function toggleReviewed(qNumber) {
    setReviewed(prev => {
      const next = new Set(prev)
      next.has(qNumber) ? next.delete(qNumber) : next.add(qNumber)
      localStorage.setItem('reviewed', JSON.stringify([...next]))
      return next
    })
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

  return (
    <>
      {view === 'list' && (
        <ListPage questions={questions} onSelect={showDetail} reviewed={reviewed} />
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
    </>
  )
}
