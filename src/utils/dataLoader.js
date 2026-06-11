import userAnswers from '../data/user_answers.json'

const jsonModules = import.meta.glob('/toeic*.json', { eager: true })

const FILE_MAP = {
  'book12-test1': '/toeic_test1_reading_all.json',
  'book11-test1': '/toeic11_test1_reading_questions.json',
  'book11-test2': '/toeic11_test2_reading_questions.json',
}

function getRawData(datasetId) {
  const filename = FILE_MAP[datasetId]
  if (!filename) return null
  const mod = jsonModules[filename]
  return mod?.default ?? mod ?? null
}

function extractQuestions(rawData) {
  if (!rawData) return []
  const out = []
  rawData.parts?.forEach(part => {
    if (part.format === 'questions') {
      part.questions.forEach(q => out.push({ ...q, part: part.part }))
    } else if (part.format === 'passages') {
      part.passages.forEach(passage => {
        passage.questions.forEach(q => out.push({
          ...q,
          part: part.part,
          passage_id: passage.passage_id,
          passage_type: passage.type,
          passage_text: passage.passage_text,
        }))
      })
    }
  })
  return out
}

export function loadAllQuestions(datasetId) {
  const rawData = getRawData(datasetId)
  return extractQuestions(rawData)
}

export function saveQuizAnswers(datasetId, answers) {
  localStorage.setItem(`quiz_answers_${datasetId}`, JSON.stringify(answers))
}

export function hasQuizAnswers(datasetId) {
  return !!localStorage.getItem(`quiz_answers_${datasetId}`)
}

export function loadQuestions(datasetId) {
  const rawData = getRawData(datasetId)
  const questions = extractQuestions(rawData)

  if (datasetId === 'book12-test1') {
    const wrongNumbers = new Set(Object.keys(userAnswers).map(Number))
    return questions
      .filter(q => wrongNumbers.has(q.number))
      .map(q => ({ ...q, your_answer: userAnswers[String(q.number)] ?? null }))
  }

  try {
    const saved = localStorage.getItem(`quiz_answers_${datasetId}`)
    if (saved) {
      const quizAnswers = JSON.parse(saved)
      const answeredNums = new Set(Object.keys(quizAnswers).map(Number))
      return questions
        .filter(q => answeredNums.has(q.number))
        .map(q => ({ ...q, your_answer: quizAnswers[String(q.number)] ?? null }))
    }
  } catch {}

  return questions
}

export function loadPassageUnits(datasetId) {
  const rawData = getRawData(datasetId)
  if (!rawData) return []

  const units = []
  rawData.parts?.forEach(part => {
    if (part.format === 'questions') {
      part.questions.forEach(q => units.push({
        type: 'single',
        question: { ...q, part: part.part },
      }))
    } else if (part.format === 'passages') {
      part.passages.forEach(passage => units.push({
        type: 'passage',
        passage_id: passage.passage_id,
        passage_type: passage.type,
        passage_text: passage.passage_text,
        questions: passage.questions.map(q => ({ ...q, part: part.part })),
      }))
    }
  })
  return units
}

export function isDataAvailable(datasetId) {
  return !!getRawData(datasetId)
}
