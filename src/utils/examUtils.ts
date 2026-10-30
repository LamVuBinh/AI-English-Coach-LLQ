import { Exam, Question } from '../types';

/**
 * Normalizes exam questions ordering according to standard TP.HCM 10th-grade entrance exam format (Thông báo 3584):
 * - Questions 1 - 28: Multiple Choice, Signs, Phonetics, Reading Cloze & Comprehension
 * - Questions 29 - 30: Reading Comprehension Multiple Choice (TN)
 * - Questions 31 - 36: Word Formation (6 questions)
 * - Questions 37 - 40: Sentence Transformation / Rewrite (4 questions)
 * 
 * Specifically detects if Questions 29 & 30 are Word Form while Questions 35 & 36 are Multiple Choice (TN),
 * and swaps them to their rightful pedagogical and standard positions.
 */
export function normalizeExam(exam: Exam): Exam {
  if (!exam || !Array.isArray(exam.questions)) return exam;

  const questions = [...exam.questions];
  const q29 = questions.find((q) => q.number === 29);
  const q30 = questions.find((q) => q.number === 30);
  const q35 = questions.find((q) => q.number === 35);
  const q36 = questions.find((q) => q.number === 36);

  if (!q29 || !q30 || !q35 || !q36) return exam;

  // Check if questions 29 & 30 are Word Form (or have word form indicators e.g. (ORGANIZE))
  const isQ29Wf =
    q29.type === 'word_form' ||
    q29.section?.toLowerCase().includes('word') ||
    (!q29.options?.length && !q29.questionText.includes('Rewrite') && !q29.questionText.includes('->'));
  const isQ30Wf =
    q30.type === 'word_form' ||
    q30.section?.toLowerCase().includes('word') ||
    (!q30.options?.length && !q30.questionText.includes('Rewrite') && !q30.questionText.includes('->'));

  // Check if questions 35 & 36 are Multiple Choice / True-False (or have options A, B, C, D)
  const isQ35Mc =
    q35.type === 'multiple_choice' ||
    q35.type === 'true_false' ||
    (Array.isArray(q35.options) && q35.options.length > 0) ||
    q35.section?.toLowerCase().includes('reading') ||
    q35.section?.toLowerCase().includes('comprehension');
  const isQ36Mc =
    q36.type === 'multiple_choice' ||
    q36.type === 'true_false' ||
    (Array.isArray(q36.options) && q36.options.length > 0) ||
    q36.section?.toLowerCase().includes('reading') ||
    q36.section?.toLowerCase().includes('comprehension');

  // If questions 29, 30 and 35, 36 are inverted, rearrange them
  if (isQ29Wf && isQ30Wf && isQ35Mc && isQ36Mc) {
    const updatedQuestions: Question[] = questions.map((q) => {
      if (q.number === 29) {
        return {
          ...q35,
          number: 29,
          id: q35.id ? q35.id.replace('35', '29') : 'q29',
          section: 'Reading Comprehension',
          type: q35.type === 'true_false' ? 'true_false' : 'multiple_choice',
        };
      }
      if (q.number === 30) {
        return {
          ...q36,
          number: 30,
          id: q36.id ? q36.id.replace('36', '30') : 'q30',
          section: 'Reading Comprehension',
          type: q36.type === 'true_false' ? 'true_false' : 'multiple_choice',
        };
      }
      if (q.number === 35) {
        return {
          ...q29,
          number: 35,
          id: q29.id ? q29.id.replace('29', '35') : 'q35',
          section: 'Word Formation',
          type: 'word_form',
        };
      }
      if (q.number === 36) {
        return {
          ...q30,
          number: 36,
          id: q30.id ? q30.id.replace('30', '36') : 'q36',
          section: 'Word Formation',
          type: 'word_form',
        };
      }
      return q;
    });

    updatedQuestions.sort((a, b) => a.number - b.number);

    return {
      ...exam,
      questions: updatedQuestions,
    };
  }

  return exam;
}

export function normalizeExamList(exams: Exam[]): Exam[] {
  if (!Array.isArray(exams)) return [];
  return exams.map((exam) => normalizeExam(exam));
}
