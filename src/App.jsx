import { useState } from 'react'
import ListPage from './pages/ListPage'
import DetailPage from './pages/DetailPage'
import { loadQuestions } from './utils/dataLoader'

const questions = loadQuestions()

export default function App() {
  const [view, setView] = useState('list')
  const [currentIdx, setCurrentIdx] = useState(0)

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
        <ListPage questions={questions} onSelect={showDetail} />
      )}
      {view === 'detail' && (
        <DetailPage
          questions={questions}
          currentIdx={currentIdx}
          onBack={showList}
          onNavigate={navigate}
        />
      )}
    </>
  )
}
