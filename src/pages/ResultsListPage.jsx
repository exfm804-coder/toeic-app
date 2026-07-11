import { getScoreSummary } from '../utils/dataLoader'

const DATASET_LABELS = {
  'book12-test1': { title: 'TEST 1', book: '問題集12' },
  'book12-test2': { title: 'TEST 2', book: '問題集12' },
  'book11-test1': { title: 'TEST 1', book: '問題集11' },
  'book11-test2': { title: 'TEST 2', book: '問題集11' },
}

export default function ResultsListPage({ datasetId, questions, onSelect, onBack }) {
  const { title, book } = DATASET_LABELS[datasetId] ?? { title: '', book: '' }
  const { totalCorrect, totalCount } = getScoreSummary(datasetId, questions)
  const pct = totalCount > 0 ? Math.round((totalCorrect / totalCount) * 100) : 0

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
        <button className="results-row" onClick={onSelect}>
          <div className="results-row-main">
            <div className="results-row-title">{book} リーディング</div>
          </div>
          <div className="results-row-score">
            <span className="results-row-pct">{pct}%</span>
            <span className="results-row-frac">{totalCorrect}/{totalCount}</span>
          </div>
          <span className="results-row-arrow">›</span>
        </button>
        <div className="results-list-empty">これ以上表示できるものがありません。</div>
      </div>
    </div>
  )
}
