import { getScoreSummary, PREBUILT_WRONG_ANSWER_DATASETS } from '../utils/dataLoader'

const DATASET_LABELS = {
  'book12-test1': { title: 'TEST 1', book: '問題集12' },
  'book12-test2': { title: 'TEST 2', book: '問題集12' },
  'book11-test1': { title: 'TEST 1', book: '問題集11' },
  'book11-test2': { title: 'TEST 2', book: '問題集11' },
}

const PART_KEY_LABELS = { all: '全問', '5': 'Part 5', '6': 'Part 6', '7': 'Part 7' }

function formatDate(iso) {
  const d = new Date(iso)
  return d.toLocaleString('ja-JP', { year: 'numeric', month: '2-digit', day: '2-digit', hour: '2-digit', minute: '2-digit' })
}

function formatDuration(seconds) {
  const s = Math.round(seconds)
  const h = Math.floor(s / 3600)
  const m = Math.floor((s % 3600) / 60)
  const sec = s % 60
  if (h > 0) return `${h}時間${m}分${sec}秒`
  if (m > 0) return `${m}分${sec}秒`
  return `${sec}秒`
}

export default function ResultsListPage({ datasetId, questions, attempts, onSelectLive, onSelectAttempt, onBack }) {
  const { title, book } = DATASET_LABELS[datasetId] ?? { title: '', book: '' }
  const { totalCorrect, totalCount } = getScoreSummary(datasetId, questions)
  const pct = totalCount > 0 ? Math.round((totalCorrect / totalCount) * 100) : 0
  const hasAnswers = questions.length > 0
  const liveLabel = PREBUILT_WRONG_ANSWER_DATASETS.has(datasetId) ? '実際の受験結果' : '現在の解答'

  return (
    <div>
      <div className="app-header">
        <div className="app-header-inner">
          <button className="back-btn" onClick={onBack}>‹</button>
          <div>
            <div className="header-title">{title}</div>
            <div className="header-sub">{book} · Reading</div>
          </div>
        </div>
      </div>

      <div className="results-list">
        {hasAnswers && (
          <button className="results-row" onClick={onSelectLive}>
            <div className="results-row-main">
              <div className="results-row-title">{book} リーディング</div>
              <div className="results-row-date">{liveLabel}</div>
            </div>
            <div className="results-row-score">
              <span className="results-row-pct">{pct}%</span>
              <span className="results-row-frac">{totalCorrect}/{totalCount}</span>
            </div>
            <span className="results-row-arrow">›</span>
          </button>
        )}

        {attempts.map(a => (
          <button key={a.id} className="results-row" onClick={() => onSelectAttempt(a)}>
            <div className="results-row-main">
              <div className="results-row-title">{book} {PART_KEY_LABELS[a.part_key] ?? a.part_key} リーディング</div>
              <div className="results-row-date">
                {formatDate(a.completed_at)}
                {typeof a.duration_seconds === 'number' && ` · ${formatDuration(a.duration_seconds)}`}
              </div>
            </div>
            <div className="results-row-score">
              <span className="results-row-pct">{a.total_count > 0 ? Math.round((a.correct_count / a.total_count) * 100) : 0}%</span>
              <span className="results-row-frac">{a.correct_count}/{a.total_count}</span>
            </div>
            <span className="results-row-arrow">›</span>
          </button>
        ))}

        {!hasAnswers && attempts.length === 0 && (
          <div className="results-list-empty">まだ記録がありません。</div>
        )}
      </div>
    </div>
  )
}
