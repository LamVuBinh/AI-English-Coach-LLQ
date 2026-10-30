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
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { SAMPLE_EXAMS } from '../data/sampleExams';

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
  } = useApp();

  const [showWordFormHandbook, setShowWordFormHandbook] = React.useState(false);

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

            <div className="space-y-2 text-xs text-indigo-100">
              <p className="flex items-center justify-between">
                <span>Tuần học đã hoàn thành:</span>
                <strong className="text-white">
                  {completedWeeks}/{totalWeeks} tuần
                </strong>
              </p>
              <p className="flex items-center justify-between">
                <span>Điểm số kỳ vọng cuối lộ trình:</span>
                <strong className="text-amber-300 font-extrabold text-sm">
                  {roadmap.expectedFinalScore} điểm
                </strong>
              </p>
              <p className="flex items-center justify-between">
                <span>Thời gian cam kết:</span>
                <strong className="text-white">{roadmap.dailyCommitmentMinutes} phút/ngày</strong>
              </p>
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

          <div className="flex flex-wrap items-center gap-2">
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
        </div>

        {/* Roadmap Phases List */}
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
                              <button
                                onClick={() => setShowWordFormHandbook(true)}
                                className="px-3 py-1.5 bg-amber-600 hover:bg-amber-700 text-white rounded-lg text-xs font-bold shadow-xs cursor-pointer flex items-center gap-1 transition-colors shrink-0"
                              >
                                <BookOpen className="w-3.5 h-3.5" /> Mở Cẩm Nang &amp; Bí Kíp
                              </button>
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
    </div>
  );
};
