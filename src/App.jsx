import { useState, useEffect } from 'react'
import { supabase } from './utils/supabase'
import { fetchQuizAnswers, fetchReviewed, toggleReviewedDb, upsertQuizAnswersBatch, upsertQuizAnswer } from './utils/db'
import HomePage from './pages/HomePage'
import LoginPage from './pages/LoginPage'
import ListPage from './pages/ListPage'
import DetailPage from './pages/DetailPage'
import QuizPage from './pages/QuizPage'
import { loadQuestions, loadAllQuestions } from './utils/dataLoader'

export default function App() {
  const [session, setSession] = useState(undefined) // undefined = loading
  const [view, setView] = useState('home')
  const [activeDataset, setActiveDataset] = useState(null)
  const [questions, setQuestions] = useState([])
  const [quizQuestions, setQuizQuestions] = useState([])
  const [currentIdx, setCurrentIdx] = useState(0)
  const [reviewed, setReviewed] = useState(new Set())

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => setSession(session))
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_e, session) => {
      setSession(session)
    })
    return () => subscription.unsubscribe()
  }, [])

  async function goToList(datasetId) {
    const [qs, rev] = await Promise.all([
      loadQuestionsWithDb(datasetId),
      fetchReviewed(datasetId),
    ])
    setActiveDataset(datasetId)
    setQuestions(qs)
    setReviewed(rev)
    setView('list')
  }

  async function loadQuestionsWithDb(datasetId) {
    try {
      const answersMap = await fetchQuizAnswers(datasetId)
      return loadQuestions(datasetId, answersMap)
    } catch {
      return loadQuestions(datasetId)
    }
  }

  function goToQuiz(datasetId) {
    setActiveDataset(datasetId)
    setQuizQuestions(loadAllQuestions(datasetId))
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

  async function toggleReviewed(qNumber) {
    const next = new Set(reviewed)
    const nowReviewed = !next.has(qNumber)
    nowReviewed ? next.add(qNumber) : next.delete(qNumber)
    setReviewed(next)
    try {
      await toggleReviewedDb(activeDataset, qNumber, nowReviewed)
    } catch (e) {
      console.error('reviewed sync error', e)
    }
  }

  async function saveQuizAnswersToDb(datasetId, answersMap) {
    try {
      await upsertQuizAnswersBatch(datasetId, answersMap)
    } catch (e) {
      console.error('quiz answers sync error', e)
    }
  }

  async function saveOneAnswerToDb(datasetId, questionNumber, answer) {
    try {
      await upsertQuizAnswer(datasetId, questionNumber, answer)
    } catch (e) {
      console.error('answer sync error', e)
    }
  }

  if (session === undefined) {
    return (
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '100vh' }}>
        <div style={{ color: 'var(--sub)', fontSize: '14px' }}>読み込み中...</div>
      </div>
    )
  }

  if (!session) return <LoginPage />

  return (
    <>
      {view === 'home' && (
        <HomePage onSelectMode={(mode, datasetId) =>
          mode === 'list' ? goToList(datasetId) : goToQuiz(datasetId)
        } />
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
          questions={quizQuestions}
          onBack={goHome}
          onGoToReview={() => goToList(activeDataset)}
          onSaveAnswer={saveOneAnswerToDb}
          onSaveAnswersBatch={saveQuizAnswersToDb}
        />
      )}
    </>
  )
}
