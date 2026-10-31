import React from 'react';
import { useApp } from '../context/AppContext';
import {
  Target,
  Sparkles,
  Calendar,
  Flame,
  Award,
  ChevronRight,
  CheckCircle2,
  Circle,
  BookOpen,
  ArrowUpRight,
  Clock,
  Zap,
  AlertTriangle,
  Play,
  FileCheck,
  Layers,
  X,
  Download,
  ExternalLink,
  FileText,
  Check,
  Lock,
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { SAMPLE_EXAMS } from '../data/sampleExams';

export const WORD_FORM_ROADMAP_PRESETS = [
  {
    id: 'basic_positions',
    levelTitle: 'Mức 1: Củng Cố Vị Trí 4 Từ Loại (Trang 1 PDF)',
    targetScore: 'Mục tiêu: 7.0 - 7.5 Điểm',
    formula: 'TRẠNG (Adv) ➔ ĐỘNG (V) ➔ TRẠNG (Adv) ➔ TÍNH (Adj) ➔ DANH (N)',
    theme: 'Chuyên đề Word Form Căn Bản: Nắm Chắc Vị Trí 4 Từ Loại',
    core: '7 vị trí Danh từ, 3 vị trí Tính từ, 2 vị trí Trạng từ & 4 cấu trúc Động từ theo tài liệu "Trạng Động Trạng Tính Danh"',
    tasks: [
      'Ngày 1: Nắm chắc 7 vị trí Danh từ (sau Tính từ, sau a/an/the, sau this/that/these/those, sau tính từ sở hữu, sau giới từ, từ chỉ số lượng, sau need/bring/have...).',
      'Ngày 2: Nắm chắc 3 vị trí Tính từ (trước Danh từ, sau to be, sau linking verbs: look, feel, seem, become, taste, smell, get...).',
      'Ngày 3: Nắm chắc 2 vị trí Trạng từ (sau Động từ thường, đầu câu có dấu phẩy) & 4 vị trí Động từ (sau S, sau Modal verbs, spend time V-ing, thể truyền khiến have/get).',
      'Ngày 4: Rèn luyện 15 câu bài tập nhận diện từ loại chỗ trống không cần dịch nghĩa.',
    ],
    checkpoint: 'Mini-test 15 câu nhận diện đúng từ loại (Mục tiêu >= 8.5/10).',
  },
  {
    id: 'suffixes_mastery',
    levelTitle: 'Mức 2: Thuộc Lòng Bảng Nhận Diện Hậu Tố (Trang 2 PDF)',
    targetScore: 'Mục tiêu: 7.5 - 8.5 Điểm',
    formula: 'Bảng hậu tố: Danh từ (7 đuôi) • Động từ (4 đuôi) • Tính từ (8 đuôi) • Trạng từ (-ly)',
    theme: 'Chuyên đề Word Form Đột Phá: Bảng Hậu Tố Chuẩn & Quy Trình 2 Bước',
    core: 'Nhận diện và biến đổi hình thái từ bằng hậu tố: -tion, -sion, -ment, -ce, -ness, -ty, -er/or/ee/ist, -ize, -ate, -en, -fy, -al, -ful, -ive, -able/ible, -ous, -ic, -ant, -ly',
    tasks: [
      'Ngày 1: Thuộc lòng 7 hậu tố Danh từ (-tion, -sion, -ment, -ce, -ness, -y/ty, -er/or/ee/ist) + Làm 10 câu biến đổi Danh từ.',
      'Ngày 2: Thuộc lòng 4 hậu tố Động từ (-ize, -ate, -en, -fy) và quy tắc tạo Trạng từ (Adj + ly) + Làm 10 câu biến đổi Động/Trạng.',
      'Ngày 3: Thuộc lòng 8 hậu tố Tính từ (-al, -ful, -ive, -able/ible, -ous, -ic, -ant, -ing/-ed) + Làm 10 câu biến đổi Tính từ.',
      'Ngày 4: Rèn luyện quy trình 2 bước: (1) Nhìn trước/sau xác định từ loại -> (2) Tra bảng hậu tố và kiểm tra tiền tố phủ định.',
    ],
    checkpoint: 'Bài kiểm tra 20 câu biến đổi từ loại bám sát đề TP.HCM (Mục tiêu >= 8.5/10).',
  },
  {
    id: 'traps_and_causative',
    levelTitle: 'Mức 3: Chinh Phục Bẫy Đề Thi & Cấu Trúc Khó',
    targetScore: 'Mục tiêu: 8.5 - 9.25 Điểm',
    formula: 'Linking Verbs + Adj • spend time V-ing • have S.O Vo / get S.O To-V • have/get S.thing V3/ed',
    theme: 'Chuyên đề Word Form Chuyên Sâu: Bẫy Đề Thi & Cấu Trúc Truyền Khiến',
    core: 'Xử lý triệt để bẫy sau linking verbs (cần Adj, không dùng Adv), cấu trúc truyền khiến chủ động/bị động, và các tiền tố phủ định un-, in-, im-, dis-',
    tasks: [
      'Ngày 1: Luyện bẫy Động từ tri giác / Linking verbs (look, feel, seem, become, taste, smell, get... + Tính từ).',
      'Ngày 2: Chuyên đề Thể nhờ vả / truyền khiến: have S.O Vo vs get S.O To-V; have/get S.thing V3/ed & spend/waste time V-ing.',
      'Ngày 3: Luyện các cặp từ mang tiền tố phủ định đảo ngược nghĩa (convenient -> inconvenient, encourage -> discourage, pollution -> unpolluted).',
      'Ngày 4: Phân tích 20 câu Word Form hay bẫy nhất trong đề thi vào 10 TP.HCM các năm.',
    ],
    checkpoint: 'Đề kiểm tra 20 câu Word Form phân loại học sinh khá giỏi (Mục tiêu >= 9/10).',
  },
  {
    id: 'perfect_score',
    levelTitle: 'Mức 4: Thực Chiến Trọn Vẹn 6/6 Câu Đề Thi Tuyển Sinh',
    targetScore: 'Mục tiêu: 9.5 - 10 Điểm (Vào trường Top 1)',
    formula: 'Quy trình 2 bước phản xạ tốc độ 4 phút / 6 câu • Chuẩn xác chính tả 100%',
    theme: 'Chuyên đề Word Form Đỉnh Cao: Luyện Đề Thực Chiến Tuyển Sinh 10 TP.HCM',
    core: 'Tối ưu hóa thời gian và độ chính xác tuyệt đối phần Word Form (Câu 31-36 trong đề thi 40 câu Thông báo 3584)',
    tasks: [
      'Ngày 1: Giải 18 câu Word Form trích từ 3 đề thi chính thức vào 10 Sở GD&ĐT TP.HCM gần nhất.',
      'Ngày 2: Luyện tập phản xạ tốc độ: 6 câu Word Form trong vòng 4 phút, rà soát chính tả từng chữ cái.',
      'Ngày 3: Tổng hợp danh sách 30 từ bất quy tắc hay gặp (maintain -> maintenance, strong -> strengthen, wide -> widen...).',
      'Ngày 4: Làm mini-test tổng hợp 30 câu Word Form mô phỏng đề thi chính thức.',
    ],
    checkpoint: 'Bài kiểm tra tổng hợp 6/6 câu Word Form đạt trọn 1.5/1.5 điểm.',
  },
];

interface StudentDashboardProps {
  onOpenGoalModal: () => void;
}

export const StudentDashboard: React.FC<StudentDashboardProps> = ({ onOpenGoalModal }) => {
  const {
    studentProfile,
    roadmap,
    toggleWeeklyTaskCompletion,
    exams,
    submissions,
    setLatestSubmission,
    setCurrentExam,
    setStudentTab,
    bookmarkedMistakes,
    diagnosticExamId,
    setRoadmap,
    showToast,
  } = useApp();

  const [showWordFormHandbook, setShowWordFormHandbook] = React.useState(false);
  const [showWordFormCustomizer, setShowWordFormCustomizer] = React.useState(false);
  const [selectedWordFormPreset, setSelectedWordFormPreset] = React.useState('suffixes_mastery');
  const [showSurveyRequiredModal, setShowSurveyRequiredModal] = React.useState(false);

  const handleApplyWordFormRoadmap = (presetId: string) => {
    const preset = WORD_FORM_ROADMAP_PRESETS.find((p) => p.id === presetId);
    if (!preset) return;

    const newPhases = roadmap.phases.map((phase) => ({
      ...phase,
      weeklyPlan: phase.weeklyPlan.map((week) => {
        if (
          week.weekTheme.toLowerCase().includes('word form') ||
          week.weekTheme.toLowerCase().includes('dạng thức từ') ||
          week.weekNumber === 2
        ) {
          return {
            ...week,
            weekTheme: preset.theme,
            grammarCore: preset.core,
            dailyTasks: [...preset.tasks],
            checkpointTest: preset.checkpoint,
            hcmcFormatPractice: 'Luyện 6 câu Word Form (Câu 31-36) chuẩn đề thi Sở GD&ĐT TP.HCM.',
          };
        }
        return week;
      }),
    }));

    const updatedRoadmap = {
      ...roadmap,
      phases: newPhases,
      updatedAt: new Date().toISOString().split('T')[0],
    };

    setRoadmap(updatedRoadmap);
    showToast(`Đã áp dụng "${preset.levelTitle}" vào Lộ trình cá nhân thành công!`);
    setShowWordFormCustomizer(false);
    confetti({ particleCount: 60, spread: 70, origin: { y: 0.7 } });
  };

  const handleStartExam = (exam: any) => {
    setCurrentExam(exam);
    setStudentTab('take_exam');
  };

  // Completed exams map
  const completedExamIds = new Set(submissions.map((s) => s.examId));

  const examDateStr = studentProfile.examDate || '2027-06-01';
  const targetDate = new Date(examDateStr);
  const today = new Date();
  targetDate.setHours(0, 0, 0, 0);
  today.setHours(0, 0, 0, 0);
  const diffDays = Math.ceil((targetDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
  const remainingExamDays = Math.max(0, diffDays);
  const formattedExamDate = targetDate.toLocaleDateString('vi-VN', { day: '2-digit', month: '2-digit', year: 'numeric' });

  const diagnosticExam =
    exams.find((e) => e.id === diagnosticExamId) ||
    SAMPLE_EXAMS.find((e) => e.id === diagnosticExamId) ||
    exams.find((e) => e.isDiagnostic) ||
    SAMPLE_EXAMS[0];

  const isDiagnosticCompleted = completedExamIds.has(diagnosticExam?.id);

  // Filter exams: Only exams that the teacher has assigned to students should appear in the student roadmap (excluding diagnostic exam)
  const assignedExams = exams.filter(
    (exam) => !!exam.isAssigned && exam.id !== diagnosticExam?.id
  );

  const handleTaskToggle = (phaseIdx: number, weekIdx: number, isDone: boolean) => {
    if (!isDiagnosticCompleted) {
      showToast('⚠️ Em cần hoàn thành bài khảo sát đánh giá năng lực đầu vào trước để kích hoạt Lộ trình cá nhân nhé!');
      setShowSurveyRequiredModal(true);
      return;
    }
    toggleWeeklyTaskCompletion(phaseIdx, weekIdx);
    if (!isDone) {
      confetti({
        particleCount: 50,
        spread: 60,
        origin: { y: 0.8 },
      });
    }
  };

  // Calculate overall roadmap progress
  let totalWeeks = 0;
  let completedWeeks = 0;
  roadmap.phases.forEach((phase) => {
    phase.weeklyPlan.forEach((week) => {
      totalWeeks++;
      if (week.isCompleted) completedWeeks++;
    });
  });
  const progressPercent = totalWeeks > 0 ? Math.round((completedWeeks / totalWeeks) * 100) : 0;

  return (
    <div className="space-y-8 pb-12">
      {/* 1. HERO TARGET & ASPIRATION BANNER */}
      <div className="relative overflow-hidden rounded-3xl bg-linear-to-r from-indigo-900 via-indigo-800 to-violet-900 text-white p-6 sm:p-8 shadow-xl shadow-indigo-950/20 border border-indigo-700/50">
        <div className="relative z-10 grid grid-cols-1 lg:grid-cols-12 gap-6 items-center">
          {/* Left Column: Greeting & Target School */}
          <div className="lg:col-span-7 space-y-4">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 backdrop-blur-md border border-white/20 text-xs font-semibold text-amber-300">
              <Sparkles className="w-3.5 h-3.5" /> Lộ Trình Chuẩn Sở GD&ĐT TP.HCM (Thông báo 3584)
            </div>

            <div>
              <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
                Xin chào, {studentProfile.name}! 👋
              </h1>
              <p className="text-indigo-100 text-sm mt-1 max-w-xl leading-relaxed">
                Mục tiêu thi đậu vào{' '}
                <span className="text-amber-300 font-bold underline decoration-amber-400">
                  {studentProfile.targetSchool}
                </span>{' '}
                với điểm số mục tiêu <strong>{studentProfile.targetScore.toFixed(1)}/10</strong> môn Tiếng Anh.
              </p>
            </div>

            {/* Quick Metrics Bar */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-2">
              <div className="bg-white/10 backdrop-blur-md rounded-2xl p-3 border border-white/10 text-center">
                <span className="text-[11px] text-indigo-200 block font-medium">Điểm Ước Tính</span>
                <span className="text-xl font-black text-amber-300">
                  {studentProfile.currentEstimatedScore.toFixed(1)}
                  <span className="text-xs text-white/70 font-normal">/10</span>
                </span>
              </div>

              <div className="bg-white/10 backdrop-blur-md rounded-2xl p-3 border border-white/10 text-center">
                <span className="text-[11px] text-indigo-200 block font-medium flex items-center justify-center gap-1">
                  <Flame className="w-3.5 h-3.5 text-orange-400" /> Chuỗi học
                </span>
                <span className="text-xl font-black text-white">
                  {studentProfile.streakDays}{' '}
                  <span className="text-xs text-indigo-200 font-normal">ngày</span>
                </span>
              </div>

              <div className="bg-white/10 backdrop-blur-md rounded-2xl p-3 border border-white/10 text-center">
                <span className="text-[11px] text-indigo-200 block font-medium">Đã luyện đề</span>
                <span className="text-xl font-black text-white">
                  {studentProfile.completedTestsCount}{' '}
                  <span className="text-xs text-indigo-200 font-normal">đề</span>
                </span>
              </div>

              <div className="bg-white/10 backdrop-blur-md rounded-2xl p-3 border border-white/10 text-center">
                <span className="text-[11px] text-indigo-200 block font-medium flex items-center justify-center gap-1">
                  <Calendar className="w-3.5 h-3.5 text-amber-300" /> Ngày thi ({formattedExamDate})
                </span>
                <span className="text-xl font-black text-amber-300">
                  {remainingExamDays}{' '}
                  <span className="text-xs text-white/70 font-normal">ngày nữa</span>
                </span>
              </div>
            </div>

            <div className="pt-1 flex flex-wrap items-center gap-3">
              <button
                onClick={() => {
                  handleStartExam(diagnosticExam);
                }}
                className="px-5 py-2.5 rounded-xl bg-amber-400 hover:bg-amber-300 text-indigo-950 font-bold text-xs shadow-lg shadow-amber-400/20 transition-all flex items-center gap-2 cursor-pointer"
              >
                <Play className="w-4 h-4 fill-indigo-950" /> {isDiagnosticCompleted ? `Làm Lại: ${diagnosticExam?.title || 'Đề Khảo Sát Năng Lực'}` : `Làm: ${diagnosticExam?.title || 'Đề Khảo Sát Năng Lực Chuẩn 3584'}`}
              </button>

              <button
                onClick={onOpenGoalModal}
                className="px-4 py-2.5 rounded-xl bg-white/10 hover:bg-white/20 border border-white/20 text-white font-semibold text-xs transition-all flex items-center gap-1.5 cursor-pointer"
              >
                <Target className="w-4 h-4 text-amber-300" /> Đổi Mục Tiêu &amp; Lộ Trình
              </button>
            </div>
          </div>

          {/* Right Column: Roadmap Progress Meter */}
          <div className="lg:col-span-5 bg-white/10 backdrop-blur-lg rounded-2xl p-5 border border-white/15 space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold uppercase tracking-wider text-indigo-200 flex items-center gap-1.5">
                <Award className="w-4 h-4 text-amber-300" /> Tiến độ lộ trình 2018
              </span>
              <span className="text-xs font-bold bg-amber-400/20 text-amber-300 px-2.5 py-0.5 rounded-full border border-amber-400/30">
                {progressPercent}% Hoàn thành
              </span>
            </div>

            {/* Progress Bar */}
            <div className="w-full bg-indigo-950/60 rounded-full h-3 p-0.5 border border-white/10">
              <div
                className="bg-linear-to-r from-amber-400 to-emerald-400 h-full rounded-full transition-all duration-500"
                style={{ width: `${Math.max(progressPercent, 5)}%` }}
              ></div>
            </div>

            <div className="bg-indigo-950/40 rounded-xl p-3 border border-indigo-700/50 text-[11px] text-indigo-200 leading-relaxed">
              💡 <strong>Lời khuyên Coach:</strong> {roadmap.coachTips[0] || 'Tập trung rèn Word Form mỗi ngày.'}
            </div>
          </div>
        </div>

        {/* Decorative background glow */}
        <div className="absolute -right-20 -top-20 w-80 h-80 rounded-full bg-violet-600/30 blur-3xl pointer-events-none"></div>
        <div className="absolute -left-20 -bottom-20 w-80 h-80 rounded-full bg-indigo-500/20 blur-3xl pointer-events-none"></div>
      </div>

      {/* REQUIRED DIAGNOSTIC SURVEY BANNER FOR NEW STUDENTS */}
      {!isDiagnosticCompleted && (
        <div className="bg-linear-to-r from-amber-400 via-amber-300 to-amber-400 text-indigo-950 p-5 sm:p-6 rounded-3xl border-2 border-amber-300 shadow-xl flex flex-col md:flex-row items-start md:items-center justify-between gap-5">
          <div className="flex items-start gap-3.5 max-w-3xl">
            <div className="w-11 h-11 rounded-2xl bg-indigo-950 text-amber-300 flex items-center justify-center font-black shrink-0 mt-0.5 shadow-md">
              <AlertTriangle className="w-6 h-6 text-amber-300 animate-bounce" />
            </div>
            <div className="space-y-1">
              <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-indigo-950 text-amber-300 text-[10px] font-extrabold uppercase tracking-wider">
                Yêu Cầu Khảo Sát Năng Lực Đầu Vào
              </div>
              <h3 className="font-extrabold text-base sm:text-lg text-indigo-950 leading-tight">
                Em chưa thực hiện bài khảo sát đánh giá năng lực Tiếng Anh đầu vào!
              </h3>
              <p className="text-xs text-indigo-900 font-semibold leading-relaxed">
                Để AI Coach đánh giá chính xác điểm mạnh, điểm yếu và các bẫy đề thi hay sai (theo Thông báo 3584 Sở GD&amp;ĐT TP.HCM), vui lòng làm bài khảo sát 40 câu để tự động kích hoạt Lộ Trình Cá Nhân Hóa dành riêng cho em.
              </p>
            </div>
          </div>

          <button
            onClick={() => handleStartExam(diagnosticExam)}
            className="w-full md:w-auto px-6 py-3.5 rounded-2xl bg-indigo-950 hover:bg-indigo-900 text-amber-300 font-extrabold text-xs shadow-xl shadow-indigo-950/20 hover:scale-105 transition-all flex items-center justify-center gap-2 cursor-pointer shrink-0"
          >
            <Play className="w-4 h-4 fill-amber-300" /> Bắt Đầu Khảo Sát Ngay (90 Phút)
          </button>
        </div>
      )}

      {/* 2. WEAK GRAMMAR ALERT & QUICK REMEDIATION */}
      {studentProfile.weakTopics && studentProfile.weakTopics.length > 0 && (
        <div className="bg-rose-50 border border-rose-200/80 rounded-2xl p-5 shadow-xs">
          <div className="flex flex-wrap items-center justify-between gap-3 mb-4">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-xl bg-rose-500 text-white flex items-center justify-center font-bold">
                <AlertTriangle className="w-4 h-4" />
              </div>
              <div>
                <h3 className="font-bold text-rose-950 text-sm">
                  Cảnh Báo Lỗ Hổng Ngữ Pháp Phân Loại Cần Khắc Phục
                </h3>
                <p className="text-xs text-rose-700">
                  Phát hiện từ các bài làm gần nhất của em theo chuẩn ma trận đề 3584
                </p>
              </div>
            </div>

            <button
              onClick={() => setStudentTab('mistake_notebook')}
              className="text-xs font-bold text-rose-700 hover:text-rose-900 flex items-center gap-1 underline decoration-rose-400 cursor-pointer"
            >
              Mở Sổ tay lỗi sai ({bookmarkedMistakes.length}) <ChevronRight className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
            {studentProfile.weakTopics.map((wt, idx) => (
              <div
                key={idx}
                className="bg-white rounded-xl p-3.5 border border-rose-100 shadow-xs flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-center justify-between mb-1.5">
                    <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-rose-100 text-rose-700">
                      {wt.severity === 'high' ? 'Khẩn cấp' : 'Cần ôn'}
                    </span>
                    <span className="text-xs font-bold text-rose-600">Sai {wt.errorCount} lần</span>
                  </div>
                  <h4 className="font-bold text-xs text-slate-800 leading-snug line-clamp-2">
                    {wt.topic}
                  </h4>
                </div>
                <button
                  onClick={() => setStudentTab('mistake_notebook')}
                  className="mt-3 text-[11px] font-semibold text-indigo-600 hover:text-indigo-800 flex items-center gap-1 cursor-pointer"
                >
                  <BookOpen className="w-3 h-3" /> Xem phân tích lỗi sai trong Sổ tay
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* 3. DYNAMIC ROADMAP TIMELINE ACCORDING TO GDPT 2018 */}
      <div className="space-y-6">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <h2 className="text-xl font-extrabold text-slate-900 flex items-center gap-2">
              <Layers className="w-6 h-6 text-indigo-600" />
              Lộ Trình Ôn Luyện Cá Nhân Hóa (CT GDPT 2018)
            </h2>
            <p className="text-xs text-slate-500 mt-0.5">
              Cập nhật tự động dựa trên năng lực, thời gian biểu và điểm số mục tiêu của em
            </p>
          </div>

          {isDiagnosticCompleted ? (
            <div className="flex flex-wrap items-center gap-2">
              <button
                onClick={() => setShowWordFormCustomizer(true)}
                className="flex items-center gap-1.5 text-xs font-bold text-indigo-900 bg-indigo-50 hover:bg-indigo-100 border border-indigo-200 px-3 py-1.5 rounded-xl transition-all cursor-pointer shadow-xs"
              >
                <Target className="w-3.5 h-3.5 text-indigo-600" />
                Lên Lộ Trình Word Form
              </button>
              <button
                onClick={() => setShowWordFormHandbook(true)}
                className="flex items-center gap-1.5 text-xs font-bold text-amber-900 bg-amber-50 hover:bg-amber-100 border border-amber-300 px-3 py-1.5 rounded-xl transition-all cursor-pointer shadow-xs"
              >
                <BookOpen className="w-3.5 h-3.5 text-amber-700" />
                Bí kíp Word Form: Trạng Động Trạng Tính Danh
              </button>
              <div className="flex items-center gap-2 text-xs font-semibold text-slate-600 bg-slate-100 px-3 py-1.5 rounded-xl">
                <Clock className="w-3.5 h-3.5 text-indigo-600" />
                <span>Mỗi ngày: <strong>{roadmap.dailyCommitmentMinutes} phút</strong></span>
              </div>
            </div>
          ) : (
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-xl bg-amber-100 border border-amber-300 text-amber-900 text-xs font-bold shadow-xs">
              <Lock className="w-4 h-4 text-amber-700" />
              <span>Chưa làm khảo sát - Lộ trình đang bị khóa</span>
            </div>
          )}
        </div>

        {/* If survey not completed, display locked activation hero card */}
        {!isDiagnosticCompleted && (
          <div className="bg-linear-to-r from-slate-900 via-indigo-950 to-slate-900 text-white rounded-3xl p-6 sm:p-8 border-2 border-amber-400/80 shadow-2xl space-y-6">
            <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
              <div className="space-y-3 max-w-2xl">
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-400 text-indigo-950 text-xs font-black uppercase tracking-wider">
                  <Sparkles className="w-3.5 h-3.5 text-indigo-950" /> Đánh Giá Năng Lực Khởi Tạo Lộ Trình
                </div>
                <h3 className="text-xl sm:text-2xl font-black text-white leading-tight">
                  Hoàn thành bài khảo sát năng lực để mở khóa &amp; khởi tạo Lộ Trình Cá Nhân Hóa
                </h3>
                <p className="text-xs sm:text-sm text-slate-300 leading-relaxed font-medium">
                  Hệ thống cần kết quả từ bài khảo sát đánh giá năng lực (Chuẩn cấu trúc 40 câu Thông báo 3584 của Sở GD&amp;ĐT TP.HCM) để AI Coach phân tích chính xác lỗ hổng kiến thức ngữ pháp và lập lịch học riêng vừa sức nhất cho em.
                </p>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2 text-xs font-bold text-slate-200">
                  <div className="bg-white/10 p-3 rounded-xl border border-white/10 flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                    <span>Phân tích chính xác lỗ hổng ngữ pháp</span>
                  </div>
                  <div className="bg-white/10 p-3 rounded-xl border border-white/10 flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                    <span>Phân bổ lịch học theo ngày thi</span>
                  </div>
                  <div className="bg-white/10 p-3 rounded-xl border border-white/10 flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                    <span>Mở khóa đề thi &amp; bài tập giao</span>
                  </div>
                </div>
              </div>

              <div className="shrink-0 w-full md:w-auto text-center space-y-2">
                <button
                  onClick={() => handleStartExam(diagnosticExam)}
                  className="w-full md:w-auto px-6 py-4 rounded-2xl bg-amber-400 hover:bg-amber-300 text-indigo-950 font-black text-sm shadow-xl shadow-amber-400/20 hover:scale-105 transition-all flex items-center justify-center gap-2.5 cursor-pointer"
                >
                  <Play className="w-5 h-5 fill-indigo-950" /> Bắt Đầu Làm Bài Khảo Sát (90 Phút)
                </button>
                <p className="text-[11px] text-slate-400 font-medium">
                  Đề thi 40 câu • Chấm điểm &amp; phân tích lỗi sai tự động
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Roadmap Phases List - Only rendered when student HAS completed diagnostic survey */}
        {isDiagnosticCompleted && (
          <div className="space-y-6">
            {roadmap.phases.map((phase, pIdx) => (
              <div
                key={phase.phaseNumber}
                className="bg-white rounded-3xl border border-slate-200/80 shadow-xs overflow-hidden"
              >
                {/* Phase Header */}
                <div className="bg-linear-to-r from-slate-50 to-indigo-50/40 p-5 border-b border-slate-200/80 flex flex-wrap items-center justify-between gap-3">
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-2xl bg-indigo-600 text-white font-black text-sm flex items-center justify-center shadow-xs">
                      {phase.phaseNumber}
                    </div>
                    <div>
                      <span className="text-[11px] font-bold text-indigo-700 uppercase tracking-wider block">
                        {phase.durationWeeks} • Mục tiêu {phase.goalScoreRange}
                      </span>
                      <h3 className="font-extrabold text-slate-900 text-base">{phase.phaseName}</h3>
                    </div>
                  </div>

                  <div className="flex flex-wrap items-center gap-1.5">
                    {phase.focusAreas.map((fa, faIdx) => (
                      <span
                        key={faIdx}
                        className="bg-white border border-slate-200 text-slate-700 text-[11px] font-medium px-2.5 py-1 rounded-lg"
                      >
                        {fa}
                      </span>
                    ))}
                  </div>
                </div>

                {/* Weekly Plans in this Phase */}
                <div className="p-5 sm:p-6 space-y-4">
                  {phase.weeklyPlan.map((week, wIdx) => {
                    const isDone = !!week.isCompleted;
                    return (
                      <div
                        key={week.weekNumber}
                        className={`rounded-2xl p-4 sm:p-5 transition-all border ${
                          isDone
                            ? 'bg-emerald-50/40 border-emerald-200/80'
                            : 'bg-slate-50/70 border-slate-200/70 hover:border-indigo-300'
                        }`}
                      >
                        <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
                          {/* Week Title & Content */}
                          <div className="space-y-2 flex-1">
                            <div className="flex items-center gap-2">
                              <span
                                className={`text-[10px] font-extrabold uppercase px-2 py-0.5 rounded-md ${
                                  isDone
                                    ? 'bg-emerald-200 text-emerald-900'
                                    : 'bg-indigo-100 text-indigo-800'
                                }`}
                              >
                                Tuần {week.weekNumber}
                              </span>
                              <h4
                                className={`font-bold text-sm sm:text-base ${
                                  isDone ? 'text-emerald-950 line-through' : 'text-slate-900'
                                }`}
                              >
                                {week.weekTheme}
                              </h4>
                            </div>

                            <p className="text-xs text-slate-600 font-medium leading-relaxed">
                              <strong className="text-slate-800">Trọng tâm:</strong> {week.grammarCore}
                            </p>

                            {(week.weekTheme.toLowerCase().includes('word form') ||
                              week.weekTheme.toLowerCase().includes('dạng thức từ')) && (
                              <div className="bg-amber-50/90 border border-amber-200 rounded-xl p-3 flex flex-wrap items-center justify-between gap-3 shadow-xs">
                                <div className="flex items-center gap-2.5">
                                  <div className="w-8 h-8 rounded-lg bg-amber-200/70 text-amber-900 flex items-center justify-center shrink-0">
                                    <Sparkles className="w-4 h-4 text-amber-700" />
                                  </div>
                                  <div>
                                    <h5 className="text-xs font-bold text-amber-950 flex items-center gap-1.5">
                                      Phương pháp chuẩn: &quot;TRẠNG ĐỘNG TRẠNG TÍNH DANH&quot;
                                    </h5>
                                    <p className="text-[11px] text-amber-800 leading-tight">
                                      Quy tắc nhận diện 4 vị trí từ loại &amp; bảng hậu tố chuyên sâu cho kỳ thi vào 10 TP.HCM
                                    </p>
                                  </div>
                                </div>
                                <div className="flex items-center gap-2">
                                  <button
                                    onClick={() => setShowWordFormCustomizer(true)}
                                    className="px-3 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-xs font-bold shadow-xs cursor-pointer flex items-center gap-1 transition-colors shrink-0"
                                  >
                                    <Target className="w-3.5 h-3.5" /> Lên Lộ Trình Này
                                  </button>
                                  <button
                                    onClick={() => setShowWordFormHandbook(true)}
                                    className="px-3 py-1.5 bg-amber-600 hover:bg-amber-700 text-white rounded-lg text-xs font-bold shadow-xs cursor-pointer flex items-center gap-1 transition-colors shrink-0"
                                  >
                                    <BookOpen className="w-3.5 h-3.5" /> Bí Kíp PDF
                                  </button>
                                </div>
                              </div>
                            )}

                            <div className="bg-white/80 rounded-xl p-3 border border-slate-200/60 text-xs text-slate-600 space-y-1.5">
                              <p className="text-[11px] font-bold text-indigo-900 uppercase tracking-wider">
                                🎯 Nhiệm vụ hàng ngày:
                              </p>
                              <ul className="list-disc list-inside space-y-0.5 text-slate-700 text-xs">
                                {week.dailyTasks.map((t, tIdx) => (
                                  <li key={tIdx}>{t}</li>
                                ))}
                              </ul>
                            </div>

                            <div className="flex flex-wrap items-center gap-3 text-xs pt-1">
                              <span className="text-indigo-700 font-semibold flex items-center gap-1">
                                <FileCheck className="w-3.5 h-3.5" /> Dạng bài TP.HCM:{' '}
                                <strong className="text-slate-800">{week.hcmcFormatPractice}</strong>
                              </span>
                              <span className="text-amber-700 font-semibold flex items-center gap-1">
                                <Zap className="w-3.5 h-3.5" /> Checkpoint:{' '}
                                <strong className="text-slate-800">{week.checkpointTest}</strong>
                              </span>
                            </div>
                          </div>

                          {/* Completion Button */}
                          <div className="sm:text-right shrink-0">
                            <button
                              onClick={() => handleTaskToggle(pIdx, wIdx, isDone)}
                              className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 cursor-pointer ${
                                isDone
                                  ? 'bg-emerald-600 text-white shadow-xs'
                                  : 'bg-white hover:bg-indigo-50 border border-slate-300 text-slate-700 hover:text-indigo-700'
                              }`}
                            >
                              {isDone ? (
                                <>
                                  <CheckCircle2 className="w-4 h-4" /> Đã Hoàn Thành
                                </>
                              ) : (
                                <>
                                  <Circle className="w-4 h-4" /> Đánh Dấu Hoàn Thành
                                </>
                              )}
                            </button>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* 4. ASSIGNED EXAMS & MOCK TESTS LIST */}
      <div className="space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <h2 className="text-xl font-extrabold text-slate-900 flex items-center gap-2">
              <FileCheck className="w-6 h-6 text-indigo-600" />
              Đề Thi &amp; Bài Tập Giao Bởi Giáo Viên
            </h2>
            <p className="text-xs text-slate-500 mt-0.5">
              {isDiagnosticCompleted
                ? `Chỉ hiển thị bài tập & đề thi chính thức giáo viên đã giao cho lớp (${assignedExams.length} bài)`
                : 'Cần hoàn thành Đề khảo sát đánh giá năng lực để mở khóa đề thi & bài tập từ giáo viên'}
            </p>
          </div>
        </div>

        {!isDiagnosticCompleted ? (
          <div className="bg-slate-50 border border-dashed border-slate-300 rounded-3xl p-8 text-center space-y-4 shadow-inner">
            <div className="w-14 h-14 rounded-2xl bg-amber-100 text-amber-700 flex items-center justify-center mx-auto shadow-xs">
              <AlertTriangle className="w-6 h-6" />
            </div>
            <div className="max-w-md mx-auto space-y-1.5">
              <h3 className="font-bold text-slate-900 text-sm">Chưa kích hoạt danh sách Đề thi &amp; Bài tập</h3>
              <p className="text-xs text-slate-500 leading-relaxed">
                Hệ thống chỉ hiển thị đề thi và bài tập được giáo viên giao <strong>sau khi em đã làm đề khảo sát đánh giá năng lực</strong> và kích hoạt lộ trình ôn tập cá nhân hóa.
              </p>
            </div>
            <div className="pt-2">
              <button
                onClick={() => handleStartExam(diagnosticExam)}
                className="px-5 py-2.5 rounded-xl bg-amber-400 hover:bg-amber-300 text-indigo-950 font-bold text-xs shadow-md shadow-amber-400/10 transition-all flex items-center gap-2 mx-auto cursor-pointer"
              >
                <Play className="w-4 h-4 fill-indigo-950" /> Bắt Đầu Làm: {diagnosticExam?.title || 'Đề Khảo Sát Năng Lực Chuẩn 3584'}
              </button>
            </div>
          </div>
        ) : assignedExams.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {assignedExams.map((exam) => {
              const isCompleted = completedExamIds.has(exam.id);
              const sub = submissions.find((s) => s.examId === exam.id);

              return (
                <div
                  key={exam.id}
                  className={`bg-white rounded-2xl p-5 border shadow-xs transition-all flex flex-col justify-between ${
                    isCompleted
                      ? 'border-emerald-200 bg-emerald-50/20'
                      : 'border-slate-200/80 hover:border-indigo-300 hover:shadow-md'
                  }`}
                >
                  <div className="space-y-2.5">
                    <div className="flex flex-wrap items-center justify-between gap-2">
                      <span className="bg-indigo-50 text-indigo-700 text-[10px] font-bold px-2.5 py-0.5 rounded-full border border-indigo-100">
                        {exam.standardNotice}
                      </span>
                      {isCompleted ? (
                        <span className="bg-emerald-100 text-emerald-800 text-[10px] font-bold px-2.5 py-0.5 rounded-full flex items-center gap-1 border border-emerald-200">
                          <CheckCircle2 className="w-3 h-3 text-emerald-600" /> Đã nộp bài • Điểm: {sub?.score ?? '--'}/10
                        </span>
                      ) : (
                        <span className="bg-amber-100 text-amber-900 text-[10px] font-bold px-2.5 py-0.5 rounded-full flex items-center gap-1">
                          <Clock className="w-3 h-3 text-amber-700" /> Hạn nộp: {exam.dueDate || 'Hôm nay'}
                        </span>
                      )}
                    </div>

                    <h3 className="font-bold text-slate-900 text-base leading-snug">{exam.title}</h3>
                    <p className="text-xs text-slate-500 line-clamp-2 leading-relaxed">
                      {exam.description}
                    </p>

                    <div className="flex flex-wrap items-center gap-3 text-xs text-slate-600 pt-1">
                      <span>⏱ {exam.durationMinutes} phút</span>
                      <span>📝 {exam.totalQuestions} câu hỏi</span>
                      <span>🎯 {exam.totalPoints} điểm</span>
                      {exam.assignedClass && (
                        <span className="text-indigo-700 font-bold bg-indigo-50 px-2 py-0.5 rounded-md border border-indigo-100">
                          {exam.assignedClass}
                        </span>
                      )}
                    </div>
                  </div>

                  <div className="pt-4 mt-3 border-t border-slate-100 flex items-center justify-between">
                    <span className="text-[11px] text-slate-400 font-medium">
                      {exam.createdBy}
                    </span>

                    {isCompleted ? (
                      <button
                        onClick={() => {
                          if (sub) setLatestSubmission(sub);
                          setStudentTab('exam_feedback');
                        }}
                        className="px-4 py-2 rounded-xl bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border border-emerald-200 text-xs font-bold shadow-xs flex items-center gap-1.5 transition-colors cursor-pointer"
                      >
                        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" /> Xem Lời Giải &amp; Phân Tích
                      </button>
                    ) : (
                      <button
                        onClick={() => handleStartExam(exam)}
                        className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold shadow-xs flex items-center gap-1.5 transition-colors cursor-pointer"
                      >
                        <Play className="w-3.5 h-3.5" /> Vào Làm Bài
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="bg-white rounded-3xl p-8 border border-slate-200/80 shadow-xs text-center space-y-3">
            <div className="w-12 h-12 rounded-2xl bg-indigo-50 text-indigo-600 flex items-center justify-center mx-auto shadow-xs">
              <FileCheck className="w-6 h-6" />
            </div>
            <div className="max-w-md mx-auto space-y-1">
              <h3 className="font-bold text-slate-900 text-sm">Chưa có bài tập nào được giao</h3>
              <p className="text-xs text-slate-500 leading-relaxed">
                Giáo viên hiện chưa giao bài tập mới cho lớp. Khi thầy/cô hoàn tất biên soạn hoặc tải đề và ấn <strong>&quot;Giao bài cho lớp&quot;</strong>, bài thi sẽ tự động xuất hiện tại đây.
              </p>
            </div>
          </div>
        )}
      </div>

      {/* WORD FORM HANDBOOK MODAL: TRẠNG ĐỘNG TRẠNG TÍNH DANH */}
      {showWordFormHandbook && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4 overflow-y-auto">
          <div className="bg-white rounded-3xl max-w-4xl w-full max-h-[92vh] flex flex-col shadow-2xl border border-slate-200 overflow-hidden animate-in fade-in zoom-in-95 duration-200 my-auto">
            {/* Modal Header */}
            <div className="bg-linear-to-r from-amber-600 via-orange-600 to-indigo-700 p-5 sm:p-6 text-white flex items-start justify-between gap-4">
              <div>
                <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-white/20 backdrop-blur-md text-[11px] font-bold text-amber-100 uppercase tracking-wider mb-2">
                  <Sparkles className="w-3 h-3 text-amber-300" /> Phương Pháp Chuẩn Kỳ Thi Tuyển Sinh Vào 10 TP.HCM
                </div>
                <h3 className="text-xl sm:text-2xl font-black">
                  CÁCH LÀM BÀI TẬP WORD FORM: TRẠNG ĐỘNG TRẠNG TÍNH DANH
                </h3>
                <p className="text-xs sm:text-sm text-amber-100/90 mt-1 max-w-2xl leading-relaxed">
                  Bí quyết phân tích vị trí 4 từ loại và bảng nhận diện hậu tố chuẩn xác (Câu 31 đến 36 - Đề 3584 Sở GD&amp;ĐT TP.HCM)
                </p>
              </div>
              <button
                onClick={() => setShowWordFormHandbook(false)}
                className="w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center text-white cursor-pointer transition-colors shrink-0"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-5 sm:p-6 overflow-y-auto space-y-6 text-slate-800 text-xs sm:text-sm">
              {/* Core Formula Banner */}
              <div className="bg-linear-to-r from-amber-50 via-orange-50 to-indigo-50 border-2 border-amber-300/80 rounded-2xl p-4 text-center shadow-xs">
                <span className="text-[11px] font-black uppercase tracking-wider text-amber-800 block mb-1">
                  Khẩu Quyết Thần Chú Bất Bại
                </span>
                <div className="flex flex-wrap items-center justify-center gap-2 sm:gap-3 py-2 text-base sm:text-xl font-black">
                  <span className="px-3 py-1 bg-amber-500 text-white rounded-xl shadow-xs">TRẠNG (Adv)</span>
                  <span className="text-slate-400">➔</span>
                  <span className="px-3 py-1 bg-emerald-600 text-white rounded-xl shadow-xs">ĐỘNG (V)</span>
                  <span className="text-slate-400">➔</span>
                  <span className="px-3 py-1 bg-amber-500 text-white rounded-xl shadow-xs">TRẠNG (Adv)</span>
                  <span className="text-slate-400">➔</span>
                  <span className="px-3 py-1 bg-violet-600 text-white rounded-xl shadow-xs">TÍNH (Adj)</span>
                  <span className="text-slate-400">➔</span>
                  <span className="px-3 py-1 bg-blue-600 text-white rounded-xl shadow-xs">DANH (N)</span>
                </div>
                <p className="text-xs text-slate-600 italic mt-1 font-medium">
                  &quot;Trạng Động Trạng Tính Danh: Xác định vị trí từ cần điền theo trật tự cú pháp trước khi biến đổi từ gốc&quot;
                </p>
              </div>

              {/* 4 Word Form Positions Breakdown (2x2 Grid) */}
              <div>
                <h4 className="font-extrabold text-sm sm:text-base text-slate-900 mb-3 flex items-center gap-2">
                  <span className="w-2 h-5 bg-indigo-600 rounded-full inline-block"></span>
                  I. VỊ TRÍ 4 TỪ LOẠI TRONG CÂU
                </h4>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {/* 1. Noun */}
                  <div className="bg-blue-50/60 border border-blue-200 rounded-2xl p-4 space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="font-black text-blue-900 text-sm flex items-center gap-1.5">
                        <span className="w-5 h-5 rounded-md bg-blue-600 text-white flex items-center justify-center text-xs">1</span>
                        DANH TỪ (Noun - n)
                      </span>
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-blue-100 text-blue-800">7 Vị Trí</span>
                    </div>
                    <ul className="space-y-1.5 text-xs text-blue-950 font-medium pl-1">
                      <li>• <strong>Đứng sau Tính từ:</strong> Adj + <u>Noun</u> (a beautiful <u>city</u>)</li>
                      <li>• <strong>Đứng sau mạo từ:</strong> a / an / the + <u>Noun</u></li>
                      <li>• <strong>Đứng sau từ chỉ định:</strong> this / that / these / those + <u>Noun</u></li>
                      <li>• <strong>Đứng sau Tính từ sở hữu:</strong> my / your / his / her / our / their + <u>Noun</u></li>
                      <li>• <strong>Đứng sau Giới từ:</strong> in / on / for / with / of / at / about + <u>Noun</u></li>
                      <li>• <strong>Đứng sau Từ chỉ số lượng:</strong> 1, 2, 3... some, any, many, much, a lot of, few, little + <u>Noun</u></li>
                      <li>• <strong>Đứng sau 1 số Động từ thường:</strong> need, bring, have, give, find, take... + <u>Noun</u></li>
                    </ul>
                  </div>

                  {/* 2. Adjective */}
                  <div className="bg-violet-50/60 border border-violet-200 rounded-2xl p-4 space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="font-black text-violet-900 text-sm flex items-center gap-1.5">
                        <span className="w-5 h-5 rounded-md bg-violet-600 text-white flex items-center justify-center text-xs">2</span>
                        TÍNH TỪ (Adjective - adj)
                      </span>
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-violet-100 text-violet-800">3 Vị Trí</span>
                    </div>
                    <ul className="space-y-1.5 text-xs text-violet-950 font-medium pl-1">
                      <li>• <strong>Đứng trước Danh từ:</strong> <u>Adj</u> + Noun (an <u>impressive</u> result)</li>
                      <li>• <strong>Đứng sau động từ &quot;to be&quot;:</strong> S + be (am/is/are/was/were) + <u>Adj</u></li>
                      <li>• <strong>Đứng sau Linking verbs (Động từ tri giác/nối):</strong></li>
                      <li className="pl-3 text-[11px] text-violet-800 italic">
                        look, feel, seem, become, taste, smell, get, appear, sound... + <u>Adj</u>
                      </li>
                      <li className="pt-1 text-[11px] text-violet-700 bg-violet-100/60 p-2 rounded-lg">
                        ⚠️ <em>Lưu ý bẫy TP.HCM:</em> Sau linking verbs là Tính từ, KHÔNG dùng Trạng từ (-ly)!
                      </li>
                    </ul>
                  </div>

                  {/* 3. Adverb */}
                  <div className="bg-amber-50/60 border border-amber-200 rounded-2xl p-4 space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="font-black text-amber-950 text-sm flex items-center gap-1.5">
                        <span className="w-5 h-5 rounded-md bg-amber-500 text-white flex items-center justify-center text-xs">3</span>
                        TRẠNG TỪ (Adverb - adv)
                      </span>
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-amber-100 text-amber-900">2 Vị Trí</span>
                    </div>
                    <ul className="space-y-1.5 text-xs text-amber-950 font-medium pl-1">
                      <li>• <strong>Đứng sau Động từ thường:</strong> S + V-thường + (O) + <u>Adv</u> (drive <u>carefully</u>)</li>
                      <li>• <strong>Đứng đầu câu, có dấu phẩy:</strong> <u>Adv</u>, S + V + O</li>
                      <li className="pl-3 text-[11px] text-amber-800 italic">
                        Ví dụ: <u>Fortunately</u>, everyone passed the exam safely.
                      </li>
                      <li className="pt-1 text-[11px] text-amber-800 bg-amber-100/70 p-2 rounded-lg">
                        💡 Công thức: <strong>Tính từ + -ly = Trạng từ</strong> (quick ➔ quickly, extreme ➔ extremely).
                      </li>
                    </ul>
                  </div>

                  {/* 4. Verb */}
                  <div className="bg-emerald-50/60 border border-emerald-200 rounded-2xl p-4 space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="font-black text-emerald-950 text-sm flex items-center gap-1.5">
                        <span className="w-5 h-5 rounded-md bg-emerald-600 text-white flex items-center justify-center text-xs">4</span>
                        ĐỘNG TỪ (Verb - v)
                      </span>
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-900">4 Cấu Trúc</span>
                    </div>
                    <ul className="space-y-1.5 text-xs text-emerald-950 font-medium pl-1">
                      <li>• <strong>Đứng sau Chủ ngữ:</strong> S + <u>V</u> (chia theo thì và ngôi)</li>
                      <li>• <strong>Đứng sau Modal verbs:</strong> can, could, will, would, may, should, must... + <u>Vo</u></li>
                      <li>• <strong>Cấu trúc tiêu tốn:</strong> spend / waste + time + <u>V-ing</u></li>
                      <li>• <strong>Cấu trúc nhờ vả / truyền khiến:</strong></li>
                      <li className="pl-3 text-[11px] text-emerald-800">
                        - Chủ động: have + S.O + <u>Vo</u> ; get + S.O + <u>To-V</u>
                      </li>
                      <li className="pl-3 text-[11px] text-emerald-800">
                        - Bị động: have / get + S.thing + <u>V(3/ed)</u>
                      </li>
                    </ul>
                  </div>
                </div>
              </div>

              {/* II. Suffix Recognition Table */}
              <div>
                <h4 className="font-extrabold text-sm sm:text-base text-slate-900 mb-3 flex items-center gap-2">
                  <span className="w-2 h-5 bg-indigo-600 rounded-full inline-block"></span>
                  II. BẢNG NHẬN DIỆN HẬU TỐ (SUFFIXES - PHÂN BIỆT 4 TỪ LOẠI)
                </h4>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
                  {/* Noun Suffixes */}
                  <div className="bg-slate-50 border border-blue-200 rounded-2xl p-3.5 space-y-2">
                    <div className="font-bold text-xs text-blue-800 uppercase tracking-wider pb-1 border-b border-blue-200 flex items-center justify-between">
                      <span>Hậu tố Danh từ (n)</span>
                      <span className="bg-blue-100 text-blue-900 text-[10px] px-1.5 py-0.2 rounded font-black">7 đuôi</span>
                    </div>
                    <ul className="space-y-1 text-xs text-slate-700">
                      <li><strong className="text-blue-700 font-mono">-tion:</strong> pollution, action</li>
                      <li><strong className="text-blue-700 font-mono">-sion:</strong> decision, conclusion</li>
                      <li><strong className="text-blue-700 font-mono">-ment:</strong> development, agreement</li>
                      <li><strong className="text-blue-700 font-mono">-ce:</strong> difference, importance</li>
                      <li><strong className="text-blue-700 font-mono">-ness:</strong> happiness, kindness</li>
                      <li><strong className="text-blue-700 font-mono">-y / -ty:</strong> society, safety, activity</li>
                      <li><strong className="text-blue-700 font-mono">-er / -or:</strong> teacher, actor (chỉ người)</li>
                      <li><strong className="text-blue-700 font-mono">-ee / -ist:</strong> employee, scientist</li>
                    </ul>
                  </div>

                  {/* Verb Suffixes */}
                  <div className="bg-slate-50 border border-emerald-200 rounded-2xl p-3.5 space-y-2">
                    <div className="font-bold text-xs text-emerald-800 uppercase tracking-wider pb-1 border-b border-emerald-200 flex items-center justify-between">
                      <span>Hậu tố Động từ (v)</span>
                      <span className="bg-emerald-100 text-emerald-900 text-[10px] px-1.5 py-0.2 rounded font-black">4 đuôi</span>
                    </div>
                    <ul className="space-y-1 text-xs text-slate-700">
                      <li><strong className="text-emerald-700 font-mono">-ize (-ise):</strong> modernize, organize</li>
                      <li><strong className="text-emerald-700 font-mono">-ate:</strong> educate, communicate</li>
                      <li><strong className="text-emerald-700 font-mono">-en:</strong> widen, strengthen</li>
                      <li><strong className="text-emerald-700 font-mono">-fy:</strong> beautify, simplify</li>
                    </ul>
                  </div>

                  {/* Adjective Suffixes */}
                  <div className="bg-slate-50 border border-violet-200 rounded-2xl p-3.5 space-y-2">
                    <div className="font-bold text-xs text-violet-800 uppercase tracking-wider pb-1 border-b border-violet-200 flex items-center justify-between">
                      <span>Hậu tố Tính từ (adj)</span>
                      <span className="bg-violet-100 text-violet-900 text-[10px] px-1.5 py-0.2 rounded font-black">8 đuôi</span>
                    </div>
                    <ul className="space-y-1 text-xs text-slate-700">
                      <li><strong className="text-violet-700 font-mono">-al:</strong> natural, cultural</li>
                      <li><strong className="text-violet-700 font-mono">-ful:</strong> beautiful, peaceful</li>
                      <li><strong className="text-violet-700 font-mono">-ive:</strong> active, creative</li>
                      <li><strong className="text-violet-700 font-mono">-able / -ible:</strong> renewable, sensible</li>
                      <li><strong className="text-violet-700 font-mono">-ous:</strong> dangerous, famous</li>
                      <li><strong className="text-violet-700 font-mono">-ic:</strong> scientific, economic</li>
                      <li><strong className="text-violet-700 font-mono">-ant:</strong> important, pleasant</li>
                      <li><strong className="text-violet-700 font-mono">-ing / -ed:</strong> interesting / interested</li>
                    </ul>
                  </div>

                  {/* Adverb Suffixes */}
                  <div className="bg-slate-50 border border-amber-200 rounded-2xl p-3.5 space-y-2">
                    <div className="font-bold text-xs text-amber-800 uppercase tracking-wider pb-1 border-b border-amber-200 flex items-center justify-between">
                      <span>Hậu tố Trạng từ (adv)</span>
                      <span className="bg-amber-100 text-amber-900 text-[10px] px-1.5 py-0.2 rounded font-black">Quy tắc -ly</span>
                    </div>
                    <ul className="space-y-1.5 text-xs text-slate-700">
                      <li><strong className="text-amber-700 font-mono">Adj + -ly = Adv:</strong></li>
                      <li className="pl-1">• beautiful ➔ beautifully</li>
                      <li className="pl-1">• extreme ➔ extremely</li>
                      <li className="pl-1">• careful ➔ carefully</li>
                      <li className="pl-1 text-rose-700 font-medium">⚠️ <em>Ngoại lệ bẫy:</em></li>
                      <li className="pl-1 text-slate-600">• good ➔ well</li>
                      <li className="pl-1 text-slate-600">• fast / hard / late (vừa là Adj vừa là Adv)</li>
                      <li className="pl-1 text-slate-600">• friendly / lovely (là Adj, không phải Adv)</li>
                    </ul>
                  </div>
                </div>
              </div>

              {/* 2-Step Exam Strategy */}
              <div className="bg-indigo-50 border border-indigo-200 rounded-2xl p-4 space-y-2">
                <h5 className="font-bold text-xs uppercase tracking-wider text-indigo-900 flex items-center gap-1.5">
                  <Zap className="w-4 h-4 text-indigo-600" /> QUY TRÌNH 2 BƯỚC ĂN TRỌN 1.5 ĐIỂM WORD FORM (CÂU 31-36)
                </h5>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs text-indigo-950">
                  <div className="bg-white p-3 rounded-xl border border-indigo-100 space-y-1">
                    <span className="font-extrabold text-indigo-700 block">Bước 1: Nhìn trước - Nhìn sau chỗ trống</span>
                    <p className="text-slate-600">
                      Áp dụng thần chú <strong>&quot;Trạng Động Trạng Tính Danh&quot;</strong> để xác định ngay từ cần điền là Noun, Verb, Adj hay Adv.
                    </p>
                  </div>
                  <div className="bg-white p-3 rounded-xl border border-indigo-100 space-y-1">
                    <span className="font-extrabold text-indigo-700 block">Bước 2: Ghép hậu tố &amp; Xét tiền tố phủ định</span>
                    <p className="text-slate-600">
                      Tra bảng hậu tố tương ứng. Đọc kỹ nghĩa của câu xem có mang sắc thái đối lập / phủ định để thêm <em>un-, in-, im-, dis-</em> hay không.
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Modal Footer */}
            <div className="bg-slate-50 border-t border-slate-200 p-4 sm:p-5 flex flex-wrap items-center justify-between gap-3">
              <a
                href="/assets/aistudio/C_CH_L_M_WORD_FORM_537ba9b3.pdf"
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-bold text-indigo-700 bg-indigo-50 hover:bg-indigo-100 border border-indigo-200 transition-colors cursor-pointer"
              >
                <Download className="w-4 h-4" /> Tải về / Mở file PDF gốc đính kèm
                <ExternalLink className="w-3.5 h-3.5 ml-0.5 opacity-60" />
              </a>

              <button
                onClick={() => setShowWordFormHandbook(false)}
                className="px-5 py-2 rounded-xl text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-700 transition-colors shadow-xs cursor-pointer ml-auto"
              >
                Đã Hiểu, Quay Lại Lộ Trình
              </button>
            </div>
          </div>
        </div>
      )}

      {/* WORD FORM ROADMAP PLANNER MODAL: LÊN LỘ TRÌNH THEO TÀI LIỆU CHUẨN */}
      {showWordFormCustomizer && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4 overflow-y-auto">
          <div className="bg-white rounded-3xl max-w-4xl w-full max-h-[92vh] flex flex-col shadow-2xl border border-slate-200 overflow-hidden animate-in fade-in zoom-in-95 duration-200 my-auto">
            {/* Modal Header */}
            <div className="bg-linear-to-r from-indigo-900 via-indigo-800 to-violet-900 p-5 sm:p-6 text-white flex items-start justify-between gap-4">
              <div>
                <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-white/20 backdrop-blur-md text-[11px] font-bold text-amber-200 uppercase tracking-wider mb-2">
                  <Target className="w-3 h-3 text-amber-300" /> Kế Hoạch Cá Nhân Hóa Theo Năng Lực
                </div>
                <h3 className="text-xl sm:text-2xl font-black">
                  LÊN LỘ TRÌNH CHUYÊN ĐỀ WORD FORM (CÂU 31 - 36)
                </h3>
                <p className="text-xs sm:text-sm text-indigo-100/90 mt-1 max-w-2xl leading-relaxed">
                  Thiết lập kế hoạch học tập theo tài liệu chuẩn: <strong>&quot;CÁCH LÀM BÀI TẬP WORD FORM: TRẠNG ĐỘNG TRẠNG TÍNH DANH&quot;</strong>
                </p>
              </div>
              <button
                onClick={() => setShowWordFormCustomizer(false)}
                className="w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center text-white cursor-pointer transition-colors shrink-0"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-5 sm:p-6 overflow-y-auto space-y-6 text-slate-800 text-xs sm:text-sm">
              {/* Document Reference Box */}
              <div className="bg-amber-50/80 border border-amber-200 rounded-2xl p-4 flex flex-wrap items-center justify-between gap-3 shadow-xs">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-amber-500 text-white flex items-center justify-center font-bold shrink-0 shadow-xs">
                    <FileText className="w-5 h-5" />
                  </div>
                  <div>
                    <h4 className="font-extrabold text-sm text-amber-950">
                      Tài liệu đính kèm: CÁCH LÀM BÀI TẬP WORD FORM (Sở GD&amp;ĐT TP.HCM)
                    </h4>
                    <p className="text-xs text-amber-800 mt-0.5">
                      • <strong>Trang 1:</strong> Vị trí 4 từ loại (Thần chú &quot;TRẠNG ĐỘNG TRẠNG TÍNH DANH&quot;, 7 vị trí Danh từ, 3 vị trí Tính từ, 2 vị trí Trạng từ, 4 vị trí Động từ).<br />
                      • <strong>Trang 2:</strong> Bảng nhận diện hậu tố phân biệt Danh (7 đuôi) - Động (4 đuôi) - Tính (8 đuôi) - Trạng (-ly).
                    </p>
                  </div>
                </div>

                <a
                  href="/assets/aistudio/C_CH_L_M_WORD_FORM_537ba9b3.pdf"
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-bold text-amber-950 bg-white hover:bg-amber-100 border border-amber-300 transition-colors shadow-xs cursor-pointer shrink-0"
                >
                  <Download className="w-3.5 h-3.5 text-amber-700" /> Tải về / Mở file PDF gốc
                  <ExternalLink className="w-3 h-3 opacity-60" />
                </a>
              </div>

              {/* Step 1: Select Level */}
              <div>
                <div className="flex items-center justify-between mb-3">
                  <h4 className="font-extrabold text-sm sm:text-base text-slate-900 flex items-center gap-2">
                    <span className="w-2 h-5 bg-indigo-600 rounded-full inline-block"></span>
                    Bước 1: Chọn Mức Năng Lực Cần Tập Trung
                  </h4>
                  <span className="text-xs text-slate-500 font-medium">Bấm chọn 1 trong 4 lộ trình bên dưới</span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {WORD_FORM_ROADMAP_PRESETS.map((preset) => {
                    const isSelected = selectedWordFormPreset === preset.id;
                    return (
                      <div
                        key={preset.id}
                        onClick={() => setSelectedWordFormPreset(preset.id)}
                        className={`p-4 rounded-2xl border transition-all cursor-pointer flex flex-col justify-between ${
                          isSelected
                            ? 'bg-indigo-50/70 border-indigo-600 ring-2 ring-indigo-500/20 shadow-md'
                            : 'bg-white border-slate-200 hover:border-indigo-300 hover:bg-slate-50/50'
                        }`}
                      >
                        <div>
                          <div className="flex items-center justify-between mb-1.5">
                            <span className="text-[11px] font-extrabold px-2 py-0.5 rounded-full bg-indigo-100 text-indigo-800">
                              {preset.targetScore}
                            </span>
                            {isSelected && (
                              <span className="w-5 h-5 rounded-full bg-indigo-600 text-white flex items-center justify-center text-xs">
                                <Check className="w-3 h-3" />
                              </span>
                            )}
                          </div>
                          <h5 className="font-bold text-sm text-slate-900">{preset.levelTitle}</h5>
                          <p className="text-xs text-indigo-700 font-medium mt-1">{preset.formula}</p>
                          <p className="text-xs text-slate-600 mt-2 leading-relaxed">{preset.core}</p>
                        </div>

                        <div className="mt-3 pt-2 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-500">
                          <span>Nhiệm vụ: <strong>4 ngày micro-tasks</strong></span>
                          <span className="text-indigo-600 font-semibold">{isSelected ? 'Đang chọn' : 'Nhấp để chọn'}</span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Step 2: Preview Selected Pathway's Weekly Plan */}
              {(() => {
                const activePreset = WORD_FORM_ROADMAP_PRESETS.find((p) => p.id === selectedWordFormPreset) || WORD_FORM_ROADMAP_PRESETS[1];
                return (
                  <div className="bg-slate-50 border border-slate-200 rounded-2xl p-4 sm:p-5 space-y-3">
                    <div className="flex items-center justify-between">
                      <h4 className="font-extrabold text-sm sm:text-base text-slate-900 flex items-center gap-2">
                        <span className="w-2 h-5 bg-indigo-600 rounded-full inline-block"></span>
                        Bước 2: Xem Trước Chi Tiết Kế Hoạch Sẽ Đưa Vào Lộ Trình Của Em
                      </h4>
                      <span className="text-xs font-bold text-indigo-700 bg-white px-2.5 py-1 rounded-lg border border-slate-200">
                        {activePreset.targetScore}
                      </span>
                    </div>

                    <div className="bg-white rounded-xl p-4 border border-slate-200 space-y-3">
                      <div>
                        <span className="text-[10px] font-extrabold uppercase px-2 py-0.5 rounded bg-indigo-100 text-indigo-800">
                          Chuyên đề Word Form Tuần 2
                        </span>
                        <h5 className="font-extrabold text-slate-900 text-sm mt-1">{activePreset.theme}</h5>
                        <p className="text-xs text-slate-600 mt-0.5 leading-relaxed">
                          <strong>Trọng tâm:</strong> {activePreset.core}
                        </p>
                      </div>

                      <div className="space-y-1.5 pt-1">
                        <span className="text-[11px] font-bold text-indigo-900 uppercase tracking-wider block">
                          🎯 Kế hoạch phân bổ 4 ngày học theo tài liệu:
                        </span>
                        <ul className="space-y-1 text-xs text-slate-700">
                          {activePreset.tasks.map((task, tIdx) => (
                            <li key={tIdx} className="flex items-start gap-2">
                              <span className="w-4 h-4 rounded-full bg-indigo-100 text-indigo-800 flex items-center justify-center text-[10px] shrink-0 mt-0.5 font-bold">
                                {tIdx + 1}
                              </span>
                              <span>{task}</span>
                            </li>
                          ))}
                        </ul>
                      </div>

                      <div className="pt-2 border-t border-slate-100 flex flex-wrap items-center justify-between gap-2 text-xs">
                        <span className="text-indigo-700 font-semibold flex items-center gap-1">
                          <FileCheck className="w-3.5 h-3.5" /> Dạng bài TP.HCM: <strong>6 câu Word Form (Câu 31-36)</strong>
                        </span>
                        <span className="text-amber-700 font-semibold flex items-center gap-1">
                          <Zap className="w-3.5 h-3.5" /> Checkpoint: <strong>{activePreset.checkpoint}</strong>
                        </span>
                      </div>
                    </div>
                  </div>
                );
              })()}
            </div>

            {/* Modal Footer */}
            <div className="bg-slate-50 border-t border-slate-200 p-4 sm:p-5 flex flex-wrap items-center justify-between gap-3">
              <button
                onClick={() => {
                  setShowWordFormCustomizer(false);
                  setShowWordFormHandbook(true);
                }}
                className="inline-flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-bold text-amber-900 bg-amber-50 hover:bg-amber-100 border border-amber-300 transition-colors cursor-pointer"
              >
                <BookOpen className="w-4 h-4 text-amber-700" /> Mở Cẩm Nang &amp; Bí Kíp PDF
              </button>

              <div className="flex items-center gap-2 ml-auto">
                <button
                  onClick={() => setShowWordFormCustomizer(false)}
                  className="px-4 py-2 rounded-xl text-xs font-bold text-slate-600 hover:bg-slate-200 transition-colors cursor-pointer"
                >
                  Hủy Bỏ
                </button>
                <button
                  onClick={() => handleApplyWordFormRoadmap(selectedWordFormPreset)}
                  className="px-5 py-2.5 rounded-xl text-xs font-bold text-white bg-linear-to-r from-indigo-600 to-violet-600 hover:from-indigo-700 hover:to-violet-700 transition-all shadow-md shadow-indigo-200 flex items-center gap-2 cursor-pointer"
                >
                  <Sparkles className="w-4 h-4" /> Áp Dụng Vào Lộ Trình Của Em
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* SURVEY REQUIRED MODAL POPUP */}
      {showSurveyRequiredModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 sm:p-7 shadow-2xl border border-slate-200 text-center space-y-5 animate-in fade-in zoom-in-95">
            <div className="w-16 h-16 rounded-2xl bg-amber-100 text-amber-700 flex items-center justify-center mx-auto shadow-xs">
              <AlertTriangle className="w-8 h-8 text-amber-600 animate-bounce" />
            </div>
            <div className="space-y-2">
              <span className="bg-amber-100 text-amber-900 text-[10px] font-black uppercase px-2.5 py-0.5 rounded-full">
                Yêu Cầu Hoàn Thành Khảo Sát
              </span>
              <h3 className="font-extrabold text-lg text-slate-900">
                Cần Khảo Sát Năng Lực Trước
              </h3>
              <p className="text-xs text-slate-600 leading-relaxed">
                Chào em! Em chưa làm <strong>Bài khảo sát đánh giá năng lực đầu vào</strong>. Để AI Coach phân tích chính xác trình độ hiện tại, tìm ra các bẫy đề thi hay làm sai và tự động kích hoạt Lộ Trình Cá Nhân Hóa cho em, vui lòng hoàn thành bài khảo sát trước nhé!
              </p>
            </div>
            <div className="pt-2 space-y-2">
              <button
                onClick={() => {
                  setShowSurveyRequiredModal(false);
                  handleStartExam(diagnosticExam);
                }}
                className="w-full py-3.5 rounded-xl bg-amber-400 hover:bg-amber-300 text-indigo-950 font-black text-xs shadow-md shadow-amber-400/20 transition-all flex items-center justify-center gap-2 cursor-pointer"
              >
                <Play className="w-4 h-4 fill-indigo-950" /> Bắt Đầu Làm Bài Khảo Sát Ngay (90 Phút)
              </button>
              <button
                onClick={() => setShowSurveyRequiredModal(false)}
                className="w-full py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-600 font-bold text-xs transition-colors cursor-pointer"
              >
                Đóng / Quay Lại Xem
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
