import rawData from '../../toeic_test1_reading_all.json'
import userAnswers from '../data/user_answers.json'

export function loadQuestions() {
  const allQuestions = []

  rawData.parts.forEach(part => {
    if (part.format === 'questions') {
      part.questions.forEach(q => {
        allQuestions.push({ ...q, part: part.part })
      })
    } else if (part.format === 'passages') {
      part.passages.forEach(passage => {
        passage.questions.forEach(q => {
          allQuestions.push({
            ...q,
            part: part.part,
            passage_type: passage.type,
            passage_text: passage.passage_text,
          })
        })
      })
    }
  })

  const wrongNumbers = new Set(Object.keys(userAnswers).map(Number))

  return allQuestions
    .filter(q => wrongNumbers.has(q.number))
    .map(q => ({
      ...q,
      your_answer: userAnswers[String(q.number)] ?? null,
    }))
}
