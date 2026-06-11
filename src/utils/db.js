import { supabase } from './supabase'

// ---- Quiz Answers ----

export async function fetchQuizAnswers(datasetId) {
  const { data, error } = await supabase
    .from('quiz_answers')
    .select('question_number, answer')
    .eq('dataset_id', datasetId)
  if (error) throw error
  const map = {}
  data.forEach(row => { map[row.question_number] = row.answer })
  return map
}

export async function upsertQuizAnswer(datasetId, questionNumber, answer) {
  const { data: { user } } = await supabase.auth.getUser()
  const { error } = await supabase
    .from('quiz_answers')
    .upsert({
      user_id: user.id,
      dataset_id: datasetId,
      question_number: questionNumber,
      answer,
      answered_at: new Date().toISOString(),
    }, { onConflict: 'user_id,dataset_id,question_number' })
  if (error) throw error
}

export async function upsertQuizAnswersBatch(datasetId, answersMap) {
  const { data: { user } } = await supabase.auth.getUser()
  const rows = Object.entries(answersMap).map(([qNum, answer]) => ({
    user_id: user.id,
    dataset_id: datasetId,
    question_number: Number(qNum),
    answer,
    answered_at: new Date().toISOString(),
  }))
  if (!rows.length) return
  const { error } = await supabase
    .from('quiz_answers')
    .upsert(rows, { onConflict: 'user_id,dataset_id,question_number' })
  if (error) throw error
}

// ---- Reviewed ----

export async function fetchReviewed(datasetId) {
  const { data, error } = await supabase
    .from('reviewed')
    .select('question_number')
    .eq('dataset_id', datasetId)
  if (error) throw error
  return new Set(data.map(r => r.question_number))
}

export async function toggleReviewedDb(datasetId, questionNumber, isReviewed) {
  const { data: { user } } = await supabase.auth.getUser()
  if (isReviewed) {
    const { error } = await supabase
      .from('reviewed')
      .upsert({ user_id: user.id, dataset_id: datasetId, question_number: questionNumber },
               { onConflict: 'user_id,dataset_id,question_number' })
    if (error) throw error
  } else {
    const { error } = await supabase
      .from('reviewed')
      .delete()
      .eq('user_id', user.id)
      .eq('dataset_id', datasetId)
      .eq('question_number', questionNumber)
    if (error) throw error
  }
}
