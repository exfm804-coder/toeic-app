export default function PassageBlock({ text }) {
  return (
    <div className="passage-block">
      <div className="passage-header">📄 本文 / 文書</div>
      <div className="passage-inner">{text}</div>
    </div>
  )
}
