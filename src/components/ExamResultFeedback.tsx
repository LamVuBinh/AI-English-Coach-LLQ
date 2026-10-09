import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { apiService } from '../services/apiService';
import { ItemAnalysis, SimilarPracticeQuestion } from '../types';
import {
  Award,
  CheckCircle2,
  XCircle,
  AlertTriangle,
  Sparkles,
  BookOpen,
  BookmarkPlus,
  RefreshCw,
  ArrowRight,
  TrendingUp,
  Brain,
  HelpCircle,
  Loader2,
  Check,
  X,
  Layers,
  Flame,
} from 'lucide-react';
import confetti from 'canvas-confetti';

export const ExamResultFeedback: React.FC = () => {
  const {
    latestSubmission,
    studentProfile,
    bookmarkMistake,
    bookmarkedMistakes,
    setRoadmap,
    setStudentTab,
    showToast,
  } = useApp();

  // Filter state for item analysis: 'all' | 'wrong' | 'correct'
  const [filterMode, setFilterMode] = useState<'all' | 'wrong' | 'correct'>('wrong');

  // Similar Question Practice Modal State
  const [similarModalOpen, setSimilarModalOpen] = useState(false);
  const [loadingSimilar, setLoadingSimilar] = useState(false);
  const [similarData, setSimilarData] = useState<{
    topic: string;
    ruleSummary?: string;
    questions: SimilarPracticeQuestion[];
  } | null>(null);
  const [selectedPracticeAnswers, setSelectedPracticeAnswers] = useState<Record<string, string>>({});
  const [practiceResults, setPracticeResults] = useState<Record<string, boolean>>({});

  // Dynamic Roadmap recalculation state
  const [isUpdatingRoadmap, setIsUpdatingRoadmap] = useState(false);

  if (!latestSubmission) {
    return (
      <div className="bg-white rounded-3xl p-12 text-center border border-slate-200 shadow-xs space-y-4 max-w-lg mx-auto">
        <div className="w-16 h-16 rounded-2xl bg-indigo-50 text-indigo-600 flex items-center justify-center mx-auto">
          <BookOpen className="w-8 h-8" />
        </div>
        <h2 className="text-xl font-bold text-slate-800">Chưa Có Bài Thi Nào Vừa Nộp</h2>
        <p className="text-xs text-slate-500">
          Hãy chọn một đề thi trong phần &quot;Làm bài &amp; Nộp bài&quot; để AI tiến hành chấm điểm và phân tích lỗi sai nhé!
        </p>
        <button
          onClick={() => setStudentTab('take_exam')}
          className="px-5 py-2.5 rounded-xl bg-indigo-600 text-white font-bold text-xs hover:bg-indigo-700 transition-colors cursor-pointer"
        >
          Đến Trang Làm Bài
        </button>
      </div>
    );
  }

  const sub = latestSubmission;

  // Open similar practice questions generator
  const handleOpenSimilarPractice = async (item: ItemAnalysis) => {
    setSimilarModalOpen(true);
    setLoadingSimilar(true);
    setSelectedPracticeAnswers({});
    setPracticeResults({});

    try {
      const res = await apiService.generateSimilarQuestions(
        {
          questionText: `Câu số ${item.questionNumber}`,
          correctAnswer: item.correctAnswer,
        },
        item.grammarTopic,
        3
      );
      setSimilarData(res);
    } catch (error) {
      console.error(error);
      showToast('Lỗi khi tải câu hỏi tương tự.');
    } finally {
      setLoadingSimilar(false);
    }
  };

  // Submit practice answers inside similar modal
  const handleCheckPracticeAnswers = () => {
    if (!similarData) return;
    const results: Record<string, boolean> = {};
    let countCorrect = 0;

    similarData.questions.forEach((q) => {
      const userAns = (selectedPracticeAnswers[q.id] || '').trim();
      const isOk =
        userAns.toUpperCase() === q.correctAnswer.trim().toUpperCase() ||
        userAns.toLowerCase() === q.correctAnswer.trim().toLowerCase();
      results[q.id] = isOk;
      if (isOk) countCorrect++;
    });

    setPracticeResults(results);

    if (countCorrect > 0) {
      confetti({
        particleCount: 60,
        spread: 60,
        origin: { y: 0.7 },
      });
      showToast(`Tuyệt vời! Em đã làm đúng ${countCorrect}/${similarData.questions.length} câu tương tự!`);
    }
  };

  // 1-Click Adaptive Dynamic Roadmap Recalculation
  const handleRecalculateRoadmap = async () => {
    setIsUpdatingRoadmap(true);
    showToast('AI đang cập nhật lại lộ trình dựa trên kết quả bài thi vừa hoàn thành...');

    try {
      const weakList = sub.weakGrammarTopics.map((w) => w.topicName);
      const newRoadmap = await apiService.generatePersonalizedRoadmap({
        targetSchool: studentProfile.targetSchool,
        targetScore: studentProfile.targetScore,
        currentScore: sub.score,
        availableHoursPerDay: studentProfile.dailyStudyMinutes / 60,
        examDate: studentProfile.examDate,
        weakTopics: weakList,
      });

      setRoadmap(newRoadmap);
      showToast('Lộ trình cá nhân hóa đã được AI cập nhật bám sát các lỗi sai mới nhất!');
    } catch (error) {
      console.error(error);
      showToast('Lỗi khi cập nhật lộ trình.');
    } finally {
      setIsUpdatingRoadmap(false);
    }
  };

  const filteredItems = sub.itemAnalysis.filter((item) => {
    if (filterMode === 'wrong') return !item.isCorrect;
    if (filterMode === 'correct') return item.isCorrect;
    return true;
  });

  return (
    <div className="space-y-8 pb-16">
      {/* 1. SCORE SUMMARY HERO CARD */}
      <div className="bg-linear-to-r from-indigo-900 via-indigo-800 to-violet-900 rounded-3xl p-6 sm:p-8 text-white shadow-xl shadow-indigo-950/20 border border-indigo-700/50">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-center">
          {/* Left: Score Gauge */}
          <div className="lg:col-span-4 text-center lg:text-left space-y-2 border-b lg:border-b-0 lg:border-r border-indigo-700/60 pb-6 lg:pb-0 lg:pr-6">
            <span className="inline-block bg-amber-400 text-indigo-950 text-[11px] font-extrabold px-3 py-1 rounded-full uppercase tracking-wider shadow-xs">
              Kết Quả Bài Thi Tuyển Sinh 10
            </span>
            <h1 className="text-xl font-bold text-indigo-100">{sub.examTitle}</h1>

            <div className="pt-2">
              <span className="text-5xl sm:text-6xl font-black text-amber-300 tracking-tight">
                {sub.score.toFixed(2)}
              </span>
              <span className="text-lg text-indigo-200 font-bold"> / 10.00</span>
            </div>

            <p className="text-xs text-indigo-200">
              Đúng <strong>{sub.correctCount}</strong> câu • Sai <strong>{sub.wrongCount}</strong> câu (Tổng {sub.correctCount + sub.wrongCount} câu)
            </p>
          </div>

          {/* Center & Right: AI Diagnostics & Cognitive Breakdown */}
          <div className="lg:col-span-8 space-y-4">
            <div className="bg-white/10 backdrop-blur-md rounded-2xl p-4 border border-white/15 space-y-2">
              <div className="flex items-center gap-2 text-xs font-bold text-amber-300 uppercase tracking-wider">
                <Brain className="w-4 h-4" /> Đánh Giá Tổng Thể Từ AI English Coach
              </div>
              <p className="text-xs sm:text-sm text-indigo-100 leading-relaxed">
                {sub.overallEvaluation}
              </p>
              <p className="text-xs text-amber-200 font-medium italic pt-1">
                💬 {sub.encouragement}
              </p>
            </div>

            {/* Cognitive Level 3584 Bar Matrix */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
              <div className="bg-white/10 rounded-xl p-2.5 text-center border border-white/10">
                <span className="text-[10px] text-indigo-200 block">Nhận biết (40%)</span>
                <span className="text-sm font-extrabold text-white">
                  {sub.cognitivePerformance?.recognitionPercent || 85}%
                </span>
              </div>
              <div className="bg-white/10 rounded-xl p-2.5 text-center border border-white/10">
                <span className="text-[10px] text-indigo-200 block">Thông hiểu (30%)</span>
                <span className="text-sm font-extrabold text-white">
                  {sub.cognitivePerformance?.comprehensionPercent || 75}%
                </span>
              </div>
              <div className="bg-white/10 rounded-xl p-2.5 text-center border border-white/10">
                <span className="text-[10px] text-indigo-200 block">Vận dụng (20%)</span>
                <span className="text-sm font-extrabold text-amber-300">
                  {sub.cognitivePerformance?.applicationPercent || 60}%
                </span>
              </div>
              <div className="bg-white/10 rounded-xl p-2.5 text-center border border-white/10">
                <span className="text-[10px] text-indigo-200 block">Vận dụng cao (10%)</span>
                <span className="text-sm font-extrabold text-rose-300">
                  {sub.cognitivePerformance?.higherApplicationPercent || 40}%
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Action Bar inside Hero: Recalculate Roadmap */}
        <div className="mt-6 pt-5 border-t border-indigo-700/60 flex flex-wrap items-center justify-between gap-3">
          <span className="text-xs text-indigo-200">
            Dựa trên kết quả này, AI có thể tự động tối ưu hóa lại lộ trình học tập tiếp theo của em.
          </span>
          <button
            onClick={handleRecalculateRoadmap}
            disabled={isUpdatingRoadmap}
            className="px-4 py-2 rounded-xl bg-amber-400 hover:bg-amber-300 text-indigo-950 font-extrabold text-xs shadow-md transition-all flex items-center gap-2 cursor-pointer disabled:opacity-50"
          >
            {isUpdatingRoadmap ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" /> Đang cập nhật lộ trình...
              </>
            ) : (
              <>
                <Layers className="w-4 h-4" /> Cập Nhật Lại Lộ Trình Luyện Tập (1-Click)
              </>
            )}
          </button>
        </div>
      </div>

      {/* 2. TOP WEAK GRAMMAR VULNERABILITIES */}
      {sub.weakGrammarTopics && sub.weakGrammarTopics.length > 0 && (
        <div className="bg-white rounded-3xl p-6 border border-slate-200/80 shadow-xs space-y-4">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-rose-500 text-white flex items-center justify-center font-bold">
              <AlertTriangle className="w-4 h-4" />
            </div>
            <div>
              <h3 className="font-extrabold text-slate-900 text-base">
                Phân Tích Các Chủ Điểm Ngữ Pháp Bị Hổng Trong Bài Thi
              </h3>
              <p className="text-xs text-slate-500">
                Cần ưu tiên ôn tập theo thứ tự cấp bách dưới đây
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
            {sub.weakGrammarTopics.map((wt, idx) => (
              <div
                key={idx}
                className="bg-rose-50/50 border border-rose-100 rounded-2xl p-4 flex flex-col justify-between space-y-2"
              >
                <div>
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-black text-rose-950">{wt.topicName}</span>
                    <span className="text-[10px] font-extrabold px-2 py-0.5 rounded-full bg-rose-200 text-rose-800">
                      Mức độ: {wt.urgency}
                    </span>
                  </div>
                  <p className="text-xs text-slate-600 mt-1 leading-relaxed">
                    💡 <strong>Lời khuyên khắc phục:</strong> {wt.advice}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* 3. QUESTION-BY-QUESTION IN-DEPTH MISTAKE ANALYSIS */}
      <div className="space-y-4">
        {/* Section Header & Filter Tabs */}
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <h2 className="text-xl font-extrabold text-slate-900">
              Chi Tiết Phân Tích & Giải Thích Từng Câu Hỏi
            </h2>
            <p className="text-xs text-slate-500 mt-0.5">
              Cung cấp nguyên nhân gốc rễ, công thức ngữ pháp và mẹo phòng tránh bẫy
            </p>
          </div>

          {/* Filter buttons */}
          <div className="bg-slate-100 p-1 rounded-xl flex items-center gap-1 border border-slate-200 text-xs font-bold">
            <button
              onClick={() => setFilterMode('wrong')}
              className={`px-3 py-1.5 rounded-lg transition-all flex items-center gap-1.5 cursor-pointer ${
                filterMode === 'wrong'
                  ? 'bg-rose-500 text-white shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <XCircle className="w-3.5 h-3.5" /> Chỉ câu làm sai ({sub.wrongCount})
            </button>
            <button
              onClick={() => setFilterMode('all')}
              className={`px-3 py-1.5 rounded-lg transition-all cursor-pointer ${
                filterMode === 'all'
                  ? 'bg-indigo-600 text-white shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Tất cả ({sub.itemAnalysis.length})
            </button>
            <button
              onClick={() => setFilterMode('correct')}
              className={`px-3 py-1.5 rounded-lg transition-all flex items-center gap-1.5 cursor-pointer ${
                filterMode === 'correct'
                  ? 'bg-emerald-600 text-white shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <CheckCircle2 className="w-3.5 h-3.5" /> Câu đúng ({sub.correctCount})
            </button>
          </div>
        </div>

        {/* List of Analysis Cards */}
        <div className="space-y-4">
          {filteredItems.map((item) => {
            const isBookmarked = bookmarkedMistakes.some(
              (b) => b.questionNumber === item.questionNumber && b.examId === sub.examId
            );

            return (
              <div
                key={item.questionNumber}
                className={`rounded-3xl p-5 sm:p-6 border transition-all ${
                  item.isCorrect
                    ? 'bg-white border-emerald-200/80 shadow-xs'
                    : 'bg-white border-rose-200/90 shadow-sm'
                }`}
              >
                <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3 pb-4 border-b border-slate-100">
                  <div className="flex items-center gap-3">
                    <span
                      className={`w-8 h-8 rounded-xl font-black text-sm flex items-center justify-center ${
                        item.isCorrect
                          ? 'bg-emerald-100 text-emerald-800'
                          : 'bg-rose-500 text-white shadow-xs'
                      }`}
                    >
                      {item.questionNumber}
                    </span>
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-[10px] font-extrabold uppercase px-2 py-0.5 rounded-md bg-indigo-100 text-indigo-800">
                          {item.grammarTopic}
                        </span>
                        <span className="text-xs text-slate-500 font-medium">
                          Cấp độ: {item.cognitiveLevel}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Actions for this question */}
                  <div className="flex items-center gap-2">
                    {!item.isCorrect && (
                      <>
                        <button
                          onClick={() =>
                            bookmarkMistake({
                              ...item,
                              examId: sub.examId,
                              examTitle: sub.examTitle,
                              date: sub.submittedAt,
                            })
                          }
                          className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all flex items-center gap-1.5 cursor-pointer ${
                            isBookmarked
                              ? 'bg-amber-100 text-amber-900 border border-amber-300 font-bold'
                              : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                          }`}
                        >
                          <BookmarkPlus className="w-3.5 h-3.5" />
                          {isBookmarked ? 'Đã Lưu Sổ Lỗi' : 'Lưu Sổ Tay'}
                        </button>

                        <button
                          onClick={() => handleOpenSimilarPractice(item)}
                          className="px-3 py-1.5 rounded-xl bg-indigo-50 hover:bg-indigo-100 text-indigo-700 text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer"
                        >
                          <Sparkles className="w-3.5 h-3.5 text-indigo-600" />
                          Luyện Câu Tương Tự
                        </button>
                      </>
                    )}
                  </div>
                </div>

                {/* Answers Comparison Matrix */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 py-3">
                  <div className="bg-slate-50 p-3 rounded-xl border border-slate-200/60">
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                      Đáp án em đã chọn / nộp:
                    </span>
                    <span
                      className={`text-sm font-bold block mt-0.5 ${
                        item.isCorrect ? 'text-emerald-700' : 'text-rose-600 line-through'
                      }`}
                    >
                      {item.studentAnswer || '(Bỏ trống)'}
                    </span>
                  </div>

                  <div className="bg-emerald-50/50 p-3 rounded-xl border border-emerald-200/60">
                    <span className="text-[10px] font-bold text-emerald-800 uppercase tracking-wider block">
                      Đáp án chính xác chuẩn Sở GD:
                    </span>
                    <span className="text-sm font-bold text-emerald-900 block mt-0.5">
                      {item.correctAnswer}
                    </span>
                  </div>
                </div>

                {/* AI In-depth Coaching Explanation */}
                <div className="space-y-3 pt-2 text-xs">
                  {item.rootCause && (
                    <div className="bg-amber-50/60 border border-amber-200/80 rounded-xl p-3 text-amber-950">
                      <span className="font-extrabold uppercase text-[10px] tracking-wider text-amber-800 block mb-0.5">
                        🔍 Phân tích nguyên nhân sai (Root Cause):
                      </span>
                      <p className="leading-relaxed">{item.rootCause}</p>
                    </div>
                  )}

                  {item.whyCorrect && (
                    <div className="bg-indigo-50/50 border border-indigo-100 rounded-xl p-3 text-slate-800">
                      <span className="font-extrabold uppercase text-[10px] tracking-wider text-indigo-800 block mb-0.5">
                        💡 Giải thích phương án đúng:
                      </span>
                      <p className="leading-relaxed">{item.whyCorrect}</p>
                    </div>
                  )}

                  {item.formulaAndRule && (
                    <div className="bg-slate-900 text-indigo-100 rounded-xl p-3 border border-slate-800 font-mono text-[11px]">
                      <span className="font-sans font-extrabold uppercase text-[10px] tracking-wider text-amber-300 block mb-1">
                        📐 Công thức / Quy tắc ngữ pháp cần nhớ:
                      </span>
                      <p className="whitespace-pre-line">{item.formulaAndRule}</p>
                    </div>
                  )}

                  {item.trapTip && (
                    <div className="bg-violet-50 border border-violet-200 rounded-xl p-3 text-violet-950">
                      <span className="font-extrabold uppercase text-[10px] tracking-wider text-violet-800 block mb-0.5">
                        ⚡ Mẹo né bẫy đề thi tuyển sinh 10:
                      </span>
                      <p className="leading-relaxed">{item.trapTip}</p>
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* 4. MODAL: SIMILAR PRACTICE QUESTIONS GENERATOR */}
      {similarModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-200">
          <div className="bg-white rounded-3xl shadow-2xl max-w-2xl w-full border border-slate-100 overflow-hidden max-h-[90vh] flex flex-col">
            {/* Modal Header */}
            <div className="bg-linear-to-r from-indigo-900 to-violet-900 p-5 text-white flex items-center justify-between shrink-0">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-amber-400 text-indigo-950 flex items-center justify-center font-bold">
                  <Sparkles className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-bold text-base">Luyện Tập Ngay Câu Tương Tự (AI Powered)</h3>
                  <p className="text-xs text-indigo-200">
                    Chuyên đề: {similarData?.topic || 'Củng cố Ngữ pháp'}
                  </p>
                </div>
              </div>
              <button
                onClick={() => setSimilarModalOpen(false)}
                className="text-indigo-200 hover:text-white p-1 rounded-lg hover:bg-white/10 transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-6 overflow-y-auto space-y-6 flex-1">
              {loadingSimilar ? (
                <div className="py-12 text-center space-y-3">
                  <Loader2 className="w-8 h-8 animate-spin text-indigo-600 mx-auto" />
                  <p className="text-xs font-semibold text-slate-600">
                    AI đang thiết kế 3 câu hỏi thực tế chuẩn cấu trúc Thông báo 3584...
                  </p>
                </div>
              ) : similarData ? (
                <>
                  {similarData.ruleSummary && (
                    <div className="bg-indigo-50 border border-indigo-200 rounded-2xl p-4 text-xs text-indigo-950">
                      <strong className="block text-indigo-800 uppercase tracking-wider text-[10px] mb-1">
                        🎯 Tóm tắt quy tắc cần áp dụng:
                      </strong>
                      {similarData.ruleSummary}
                    </div>
                  )}

                  <div className="space-y-6">
                    {similarData.questions.map((q, idx) => {
                      const userChoice = selectedPracticeAnswers[q.id];
                      const isGraded = practiceResults[q.id] !== undefined;
                      const isCorrect = practiceResults[q.id];

                      return (
                        <div
                          key={q.id || idx}
                          className="bg-slate-50/80 rounded-2xl p-5 border border-slate-200 space-y-3"
                        >
                          <div className="flex items-center justify-between">
                            <span className="text-xs font-black text-indigo-900">
                              Câu luyện tập {idx + 1}:
                            </span>
                            {isGraded && (
                              <span
                                className={`text-[11px] font-bold px-2 py-0.5 rounded-full flex items-center gap-1 ${
                                  isCorrect
                                    ? 'bg-emerald-100 text-emerald-800'
                                    : 'bg-rose-100 text-rose-800'
                                }`}
                              >
                                {isCorrect ? <Check className="w-3 h-3" /> : <X className="w-3 h-3" />}
                                {isCorrect ? 'Chính xác!' : 'Chưa đúng'}
                              </span>
                            )}
                          </div>

                          <p className="text-sm font-semibold text-slate-900 leading-relaxed">
                            {q.questionText}
                          </p>

                          {/* Options */}
                          {q.options && q.options.length > 0 ? (
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-1">
                              {q.options.map((opt, oIdx) => {
                                const letter = opt.charAt(0).toUpperCase();
                                const isSelected = userChoice === letter;

                                return (
                                  <button
                                    key={oIdx}
                                    type="button"
                                    onClick={() =>
                                      setSelectedPracticeAnswers((prev) => ({
                                        ...prev,
                                        [q.id]: letter,
                                      }))
                                    }
                                    className={`p-3 rounded-xl border text-xs font-semibold text-left transition-all flex items-center gap-2 cursor-pointer ${
                                      isSelected
                                        ? 'bg-indigo-600 text-white border-indigo-600 shadow-xs'
                                        : 'bg-white border-slate-200 text-slate-700 hover:border-indigo-300'
                                    }`}
                                  >
                                    <span
                                      className={`w-5 h-5 rounded-full flex items-center justify-center font-bold text-[10px] shrink-0 ${
                                        isSelected ? 'bg-white text-indigo-700' : 'bg-slate-100'
                                      }`}
                                    >
                                      {letter}
                                    </span>
                                    <span>{opt}</span>
                                  </button>
                                );
                              })}
                            </div>
                          ) : (
                            <input
                              type="text"
                              value={userChoice || ''}
                              onChange={(e) =>
                                setSelectedPracticeAnswers((prev) => ({
                                  ...prev,
                                  [q.id]: e.target.value,
                                }))
                              }
                              placeholder="Nhập câu trả lời..."
                              className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs font-bold"
                            />
                          )}

                          {/* Explanation after checking */}
                          {isGraded && (
                            <div className="bg-white p-3.5 rounded-xl border border-slate-200 text-xs text-slate-700 space-y-1">
                              <p className="font-bold text-emerald-800">
                                Đáp án đúng: {q.correctAnswer}
                              </p>
                              <p className="leading-relaxed">{q.explanation}</p>
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                </>
              ) : null}
            </div>

            {/* Modal Footer */}
            <div className="p-4 bg-slate-50 border-t border-slate-100 flex items-center justify-between shrink-0">
              <span className="text-[11px] text-slate-500">
                Thực hành ngay giúp tăng khả năng ghi nhớ lên 300%.
              </span>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setSimilarModalOpen(false)}
                  className="px-4 py-2 rounded-xl text-xs font-bold text-slate-600 hover:bg-slate-200 cursor-pointer"
                >
                  Đóng
                </button>
                <button
                  onClick={handleCheckPracticeAnswers}
                  disabled={loadingSimilar}
                  className="px-5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold shadow-xs flex items-center gap-1.5 cursor-pointer"
                >
                  <CheckCircle2 className="w-4 h-4" /> Kiểm Tra Kết Quả
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
