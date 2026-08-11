import { getScoreSummary } from '../utils/dataLoader'
import RadarChart from '../components/RadarChart'

const DATASET_LABELS = {
  'book12-test1': { title: 'TEST 1', book: '問題集12' },
  'book12-test2': { title: 'TEST 2', book: '問題集12' },
  'book11-test1': { title: 'TEST 1', book: '問題集11' },
  'book11-test2': { title: 'TEST 2', book: '問題集11' },
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

export default function ScoreDetailPage({ datasetId, questions, onSelectPart, onBack, partKeyFilter = 'all', dateLabel = null, durationSeconds = null, isAttempt = false }) {
  const { title, book } = DATASET_LABELS[datasetId] ?? { title: '', book: '' }
  const { parts } = getScoreSummary(datasetId, questions, isAttempt)

  const visibleParts = partKeyFilter === 'all' ? [5, 6, 7] : [Number(partKeyFilter)]
  const totalCorrect = visibleParts.reduce((sum, part) => sum + parts[part].correct, 0)
  const totalCount = visibleParts.reduce((sum, part) => sum + parts[part].total, 0)
  const overallPct = totalCount > 0 ? Math.round((totalCorrect / totalCount) * 100) : 0

  const radarValues = visibleParts.map(part => ({
    label: `Part ${part}`,
    value: parts[part].total > 0 ? (parts[part].correct / parts[part].total) * 100 : 0,
  }))

  return (
    <div>
      <div className="app-header">
        <div className="app-header-inner">
          <button className="back-btn" onClick={onBack}>‹</button>
          <div>
            <div className="header-title">{title}</div>
            <div className="header-sub">{book} · Reading スコア詳細{dateLabel ? ` · ${dateLabel}` : ''}</div>
          </div>
        </div>
      </div>

      <div className="score-detail-hero">
        <div className="score-detail-hero-label">Reading</div>
        <div className="score-detail-hero-val">
          {totalCorrect} / {totalCount}
          <span className="score-detail-hero-pct">（{overallPct}%）</span>
        </div>
        {isAttempt && typeof durationSeconds === 'number' && (
          <div className="score-detail-hero-time">所要時間 {formatDuration(durationSeconds)}</div>
        )}
      </div>

      {visibleParts.length > 1 && (
        <div className="score-detail-radar-card">
          <RadarChart values={radarValues} />
        </div>
      )}

      <div className="score-detail-parts">
        {visibleParts.map(part => {
          const p = parts[part]
          const pct = p.total > 0 ? Math.round((p.correct / p.total) * 100) : 0
          return (
            <button key={part} className="score-detail-part-row" onClick={() => onSelectPart(part)}>
              <span className="score-detail-part-label">Part {part}</span>
              <span className="score-detail-part-pct">{pct}%</span>
              <span className="score-detail-part-frac">{p.correct}/{p.total}</span>
              <span className="score-detail-part-arrow">›</span>
            </button>
          )
        })}
      </div>
    </div>
  )
}
