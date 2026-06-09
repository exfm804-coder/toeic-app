export default function ChoiceRow({ letter, text, correctAnswer, yourAnswer }) {
  let cls = 'is-other'
  if (letter === correctAnswer) cls = 'is-correct'
  else if (letter === yourAnswer) cls = 'is-wrong'

  return (
    <div className={`choice-row ${cls}`}>
      <div className="choice-letter">{letter}</div>
      <div className="choice-text">{text}</div>
    </div>
  )
}
