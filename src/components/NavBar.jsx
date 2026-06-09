export default function NavBar({ currentIdx, total, onNavigate }) {
  return (
    <div className="detail-nav">
      <button
        className="nav-btn"
        disabled={currentIdx === 0}
        onClick={() => onNavigate(-1)}
      >
        ‹ 前の問題
      </button>
      <button
        className="nav-btn primary"
        disabled={currentIdx === total - 1}
        onClick={() => onNavigate(1)}
      >
        次の問題 ›
      </button>
    </div>
  )
}
