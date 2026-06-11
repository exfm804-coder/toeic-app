import { isDataAvailable, hasQuizAnswers } from '../utils/dataLoader'

const BOOKS = [
  {
    id: 'book12',
    label: '問題集12',
    accentBg: null,
    tests: [
      {
        label: 'TEST 1',
        modes: [
          { mode: 'quiz', label: '一問一答モード', datasetId: 'book12-test1', productReady: false, requiresQuiz: false },
          { mode: 'list', label: '復習モード',     datasetId: 'book12-test1', productReady: true,  requiresQuiz: false },
        ],
      },
      {
        label: 'TEST 2',
        modes: [
          { mode: 'quiz', label: '一問一答モード', datasetId: 'book12-test2', productReady: false, requiresQuiz: false },
          { mode: 'list', label: '復習モード',     datasetId: 'book12-test2', productReady: false, requiresQuiz: false },
        ],
      },
    ],
  },
  {
    id: 'book11',
    label: '問題集11',
    accentBg: '#fff3ee',
    tests: [
      {
        label: 'TEST 1',
        modes: [
          { mode: 'quiz', label: '一問一答モード', datasetId: 'book11-test1', productReady: true, requiresQuiz: false },
          { mode: 'list', label: '復習モード',     datasetId: 'book11-test1', productReady: true, requiresQuiz: true  },
        ],
      },
      {
        label: 'TEST 2',
        modes: [
          { mode: 'quiz', label: '一問一答モード', datasetId: 'book11-test2', productReady: true, requiresQuiz: false },
          { mode: 'list', label: '復習モード',     datasetId: 'book11-test2', productReady: true, requiresQuiz: true  },
        ],
      },
    ],
  },
]

export default function HomePage({ onSelectMode }) {
  return (
    <div>
      <div className="app-header">
        <div className="app-header-inner">
          <div>
            <div className="header-title">TOEIC 公式問題集</div>
            <div className="header-sub">Reading</div>
          </div>
        </div>
      </div>

      <div className="home-body">
        {BOOKS.map(book => (
          <div
            key={book.id}
            className="home-book-section"
            style={book.accentBg ? { background: book.accentBg } : undefined}
          >
            <div className="home-book-heading">{book.label}</div>
            {book.tests.map(test => (
              <div key={test.label} className="home-test-group">
                <div className="home-test-heading">{test.label}</div>
                {test.modes.map(item => {
                  const dataReady = item.productReady && isDataAvailable(item.datasetId)
                  const quizDone = !item.requiresQuiz || hasQuizAnswers(item.datasetId)
                  const enabled = dataReady && quizDone

                  let badge = null
                  if (!item.productReady) badge = <span className="home-badge-coming">準備中</span>
                  else if (!dataReady) badge = <span className="home-badge-coming">データ準備中</span>
                  else if (!quizDone) badge = <span className="home-badge-coming">一問一答を先に</span>

                  return (
                    <button
                      key={item.mode}
                      className={`home-mode-btn${enabled ? '' : ' home-mode-btn-disabled'}`}
                      disabled={!enabled}
                      onClick={() => onSelectMode(item.mode, item.datasetId)}
                    >
                      <span className="home-mode-label">{item.label}</span>
                      {badge}
                      {enabled && <span className="home-arrow">›</span>}
                    </button>
                  )
                })}
              </div>
            ))}
          </div>
        ))}
      </div>
    </div>
  )
}
