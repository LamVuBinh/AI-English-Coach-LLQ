export type UserRole = 'teacher' | 'student';

export interface AppUserAccount {
  id: string;
  uid: string;
  username: string;
  email: string;
  name: string;
  role: UserRole;
  avatar?: string;
  targetSchool?: string;
  targetScore?: number;
  currentEstimatedScore?: number;
  isActive?: boolean;
  notes?: string;
  createdAt?: string;
  updatedAt?: string;
}

export type CognitiveLevel = 'Nhận biết' | 'Thông hiểu' | 'Vận dụng' | 'Vận dụng cao';

export type QuestionSection =
  | 'Phonetics'
  | 'Signboards & Notices'
  | 'Grammar & Vocabulary'
  | 'Reading Cloze'
  | 'Reading Comprehension'
  | 'Word Formation'
  | 'Sentence Transformation';

export type QuestionType = 'multiple_choice' | 'word_form' | 'rewrite' | 'true_false';

export interface Question {
  id: string;
  number: number;
  section: QuestionSection;
  type: QuestionType;
  questionText: string;
  passageText?: string;
  options?: string[]; // A, B, C, D
  correctAnswer: string;
  cognitiveLevel: CognitiveLevel;
  grammarTopic: string;
  points: number;
  explanation: string;
  image?: string; // For signboards / notices
}

export interface Exam {
  id: string;
  title: string;
  description: string;
  durationMinutes: number;
  totalQuestions: number;
  totalPoints: number;
  academicYear: string;
  standardNotice: string; // 'Thông báo 3584 Sở GD&ĐT TP.HCM'
  createdAt: string;
  createdBy: string;
  isAssigned: boolean;
  dueDate?: string;
  assignedClass?: string;
  questions: Question[];
  category: 'official_sample' | 'mock_test' | 'topic_mastery' | 'custom';
  isDiagnostic?: boolean; // Set as competency survey assessment exam
}

export interface StudentProfile {
  id: string;
  name: string;
  avatar: string;
  targetSchool: string; // e.g. "THPT Chuyên Lê Hồng Phong", "THPT Nguyễn Thị Minh Khai", "THPT Gia Định"
  targetScore: number; // e.g. 9.0
  currentEstimatedScore: number; // e.g. 6.75
  dailyStudyMinutes: number; // e.g. 60
  examDate: string; // e.g. "2026-06-06"
  streakDays: number;
  completedTestsCount: number;
  weakTopics: { topic: string; errorCount: number; severity: 'high' | 'medium' | 'low' }[];
}

export interface ItemAnalysis {
  questionNumber: number;
  isCorrect: boolean;
  studentAnswer: string;
  correctAnswer: string;
  grammarTopic: string;
  cognitiveLevel: CognitiveLevel;
  rootCause?: string;
  whyWrong?: string;
  whyCorrect?: string;
  formulaAndRule?: string;
  trapTip?: string;
}

export interface SubmissionResult {
  id: string;
  examId: string;
  examTitle: string;
  studentId: string;
  studentName: string;
  submittedAt: string;
  submissionType: 'online' | 'ocr_scan';
  score: number;
  totalPoints: number;
  correctCount: number;
  wrongCount: number;
  timeSpentSeconds: number;
  studentAnswers: Record<number, string>;
  overallEvaluation: string;
  encouragement: string;
  cognitivePerformance: {
    recognitionPercent: number;
    comprehensionPercent: number;
    applicationPercent: number;
    higherApplicationPercent: number;
  };
  weakGrammarTopics: {
    topicName: string;
    errorFrequency: number;
    urgency: 'CAO' | 'TRUNG BÌNH' | 'THẤP';
    advice: string;
  }[];
  itemAnalysis: ItemAnalysis[];
  uploadedImageUrl?: string;
}

export interface WeeklyPlanItem {
  weekNumber: number;
  weekTheme: string;
  grammarCore: string;
  gdptCompetency: string;
  dailyTasks: string[];
  hcmcFormatPractice: string;
  checkpointTest: string;
  isCompleted?: boolean;
}

export interface RoadmapPhase {
  phaseNumber: number;
  phaseName: string;
  durationWeeks: string;
  goalScoreRange: string;
  focusAreas: string[];
  weeklyPlan: WeeklyPlanItem[];
}

export interface PersonalizedRoadmap {
  id: string;
  studentId: string;
  roadmapTitle: string;
  summaryStrategy: string;
  estimatedWeeks: number;
  dailyCommitmentMinutes: number;
  expectedFinalScore: number;
  updatedAt: string;
  phases: RoadmapPhase[];
  coachTips: string[];
}

export interface SimilarPracticeQuestion {
  id: string;
  type: string;
  questionText: string;
  options?: string[];
  correctAnswer: string;
  explanation: string;
  hint?: string;
}

export interface ClassStudentStat {
  id: string;
  name: string;
  avatar: string;
  avgScore: number;
  testsDone: number;
  targetSchool: string;
  status: 'critical' | 'moderate' | 'excellent';
  weakestTopic: string;
  latestScore: number;
}
