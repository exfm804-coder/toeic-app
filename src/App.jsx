import { useState, useEffect } from 'react'
import { supabase } from './utils/supabase'
import {
  fetchQuizAnswers, fetchReviewed, toggleReviewedDb,
  upsertQuizAnswersBatch, upsertQuizAnswer,
  insertQuizAttempt, fetchQuizAttempts, fetchQuizAttemptById,
} from './utils/db'
import HomePage from './pages/HomePage'
import LoginPage from './pages/LoginPage'
import ResultsListPage from './pages/ResultsListPage'
import ScoreDetailPage from './pages/ScoreDetailPage'
import ListPage from './pages/ListPage'
import DetailPage from './pages/DetailPage'
import QuizPage from './pages/QuizPage'
import { loadQuestions, loadAllQuestions, mergeAttemptAnswers, PREBUILT_WRONG_ANSWER_DATASETS } from './utils/dataLoader'

function formatDate(iso) {
  return new Date(iso).toLocaleString('ja-JP', { year: 'numeric', month: '2-digit', day: '2-digit', hour: '2-digit', minute: '2-digit' })
}

export default function App() {
  const [session, setSession] = useState(undefined) // undefined = loading
  const [view, setView] = useState('home')
  const [activeDataset, setActiveDataset] = useState(null)
  const [questions, setQuestions] = useState([])
  const [quizQuestions, setQuizQuestions] = useState([])
  const [currentIdx, setCurrentIdx] = useState(0)
  const [detailQuestions, setDetailQuestions] = useState([])
  const [reviewed, setReviewed] = useState(new Set())
  const [initialPart, setInitialPart] = useState(null)
  const [attempts, setAttempts] = useState([])
  const [activeAttempt, setActiveAttempt] = useState(null)
  const [attemptQuestions, setAttemptQuestions] = useState([])

  const displayQuestions = activeAttempt ? attemptQuestions : questions

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => setSession(session))
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_e, session) => {
      setSession(session)
    })
    return () => subscription.unsubscribe()
  }, [])

  async function loadDataset(datasetId) {
    const [qs, rev] = await Promise.all([
      loadQuestionsWithDb(datasetId),
      fetchReviewed(datasetId),
    ])
    setActiveDataset(datasetId)
    setQuestions(qs)
    setReviewed(rev)
  }

  async function goToResults(datasetId) {
    await loadDataset(datasetId)
    setActiveAttempt(null)
    setAttemptQuestions([])
    if (PREBUILT_WRONG_ANSWER_DATASETS.has(datasetId)) {
      setAttempts([])
    } else {
      try {
        setAttempts(await fetchQuizAttempts(datasetId))
      } catch (e) {
        console.error('fetch attempts error', e)
        setAttempts([])
      }
    }
    setView('results')
  }

  async function goToResultsFromQuiz(datasetId) {
    await loadDataset(datasetId)
    setActiveAttempt(null)
    setAttemptQuestions([])
    setView('scoreDetail')
  }

  function goToScoreDetailLive() {
    setActiveAttempt(null)
    setView('scoreDetail')
  }

  async function goToScoreDetailAttempt(attemptSummary) {
    try {
      const full = await fetchQuizAttemptById(attemptSummary.id)
      setAttemptQuestions(mergeAttemptAnswers(activeDataset, full.answers))
      setActiveAttempt(full)
      setView('scoreDetail')
    } catch (e) {
      console.error('fetch attempt error', e)
    }
  }

  function goToListFromScore(part) {
    setInitialPart(part)
    setView('list')
  }

  async function loadQuestionsWithDb(datasetId) {
    try {
      const answersMap = await fetchQuizAnswers(datasetId)
      // Supabase 側にまだ同期されていない（≒空）場合は、進行中の解答が消えて見えないよう
      // localStorage の値にフォールバックさせる（loadQuestions に null を渡すと内部でそちらを見る）
      if (answersMap && Object.keys(answersMap).length > 0) {
        return loadQuestions(datasetId, answersMap)
      }
      return loadQuestions(datasetId)
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
    setInitialPart(null)
    setAttempts([])
    setActiveAttempt(null)
    setAttemptQuestions([])
  }

  function showDetail(filteredList, idx) {
    setDetailQuestions(filteredList)
    setCurrentIdx(idx)
    setView('detail')
    window.scrollTo(0, 0)
  }

  function showList() {
    setView('list')
  }

  function navigate(dir) {
    const newIdx = currentIdx + dir
    if (newIdx < 0 || newIdx >= detailQuestions.length) return
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

  async function saveAttemptToDb(datasetId, partKey, partLabel, answersMap, correctCount, totalCount) {
    try {
      await insertQuizAttempt(datasetId, partKey, partLabel, answersMap, correctCount, totalCount)
    } catch (e) {
      console.error('attempt save error', e)
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
          mode === 'list' ? goToResults(datasetId) : goToQuiz(datasetId)
        } />
      )}
      {view === 'results' && (
        <ResultsListPage
          datasetId={activeDataset}
          questions={questions}
          attempts={attempts}
          onSelectLive={goToScoreDetailLive}
          onSelectAttempt={goToScoreDetailAttempt}
          onBack={goHome}
        />
      )}
      {view === 'scoreDetail' && (
        <ScoreDetailPage
          datasetId={activeDataset}
          questions={displayQuestions}
          partKeyFilter={activeAttempt ? activeAttempt.part_key : 'all'}
          dateLabel={activeAttempt ? formatDate(activeAttempt.completed_at) : null}
          onSelectPart={goToListFromScore}
          onBack={() => setView('results')}
        />
      )}
      {view === 'list' && (
        <ListPage
          datasetId={activeDataset}
          questions={displayQuestions}
          onSelect={showDetail}
          reviewed={reviewed}
          onBack={() => setView('scoreDetail')}
          initialPart={initialPart}
        />
      )}
      {view === 'detail' && (
        <DetailPage
          questions={detailQuestions}
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
          onGoToReview={() => goToResultsFromQuiz(activeDataset)}
          onSaveAnswer={saveOneAnswerToDb}
          onSaveAnswersBatch={saveQuizAnswersToDb}
          onSaveAttempt={saveAttemptToDb}
        />
      )}
    </>
  )
}
