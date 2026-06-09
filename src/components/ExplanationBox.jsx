export default function ExplanationBox({ correctAnswer, explanationJa, keywords }) {
  return (
    <div className="exp-block">
      <div className="exp-header">
        <span className="seikai-badge">正解</span>
        <span className="seikai-ans">{correctAnswer}</span>
      </div>
      <div
        className="exp-text"
        dangerouslySetInnerHTML={{ __html: explanationJa.replace(/\n/g, '<br>') }}
      />
      {keywords && keywords.length > 0 && (
        <div className="keywords-row">
          {keywords.map((kw, i) => (
            <span key={i} className="kw-chip">{kw}</span>
          ))}
        </div>
      )}
    </div>
  )
}
