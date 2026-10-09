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

  const handleStartExam = (exam: any) => {
    setCurrentExam(exam);
    setStudentTab('take_exam');
  };

  // Completed exams map
  const completedExamIds = new Set(submissions.map((s) => s.examId));

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
            <div className="grid grid-cols-3 gap-3 pt-2">
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

          <div className="flex items-center gap-2 text-xs font-semibold text-slate-600 bg-slate-100 px-3 py-1.5 rounded-xl">
            <Clock className="w-3.5 h-3.5 text-indigo-600" />
            <span>Mỗi ngày: <strong>{roadmap.dailyCommitmentMinutes} phút</strong></span>
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
    </div>
  );
};
