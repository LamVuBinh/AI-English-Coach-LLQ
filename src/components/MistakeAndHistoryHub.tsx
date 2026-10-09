import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import {
  BookmarkCheck,
  History,
  Search,
  Filter,
  Trash2,
  Sparkles,
  BookOpen,
  ArrowRight,
  Brain,
  RotateCcw,
  CheckCircle2,
  XCircle,
  TrendingUp,
  Award,
  Calendar,
  FileText,
  ScanLine,
  Play,
  Layers,
} from 'lucide-react';

interface MistakeAndHistoryHubProps {
  initialSubTab?: 'mistakes' | 'history';
}

export const MistakeAndHistoryHub: React.FC<MistakeAndHistoryHubProps> = ({ initialSubTab = 'mistakes' }) => {
  const {
    bookmarkedMistakes,
    removeBookmarkedMistake,
    submissions,
    setLatestSubmission,
    setStudentTab,
  } = useApp();

  // Active sub-tab: 'mistakes' (Sổ tay lỗi sai) or 'history' (Lịch sử bài thi)
  const [activeSubTab, setActiveSubTab] = useState<'mistakes' | 'history'>(initialSubTab);

  // States for Mistake Notebook
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedTopic, setSelectedTopic] = useState<string>('all');
  const [activeFlashcardIdx, setActiveFlashcardIdx] = useState<number | null>(null);
  const [isFlipped, setIsFlipped] = useState(false);

  // Extract unique topics from mistakes
  const topics = Array.from(new Set(bookmarkedMistakes.map((m) => m.grammarTopic)));

  const filteredMistakes = bookmarkedMistakes.filter((m) => {
    const matchesSearch =
      (m.grammarTopic || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
      (m.rootCause || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
      (m.whyCorrect || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
      (m.correctAnswer || '').toLowerCase().includes(searchTerm.toLowerCase());

    const matchesTopic = selectedTopic === 'all' || m.grammarTopic === selectedTopic;
    return matchesSearch && matchesTopic;
  });

  const handleReviewSubmission = (sub: any) => {
    setLatestSubmission(sub);
    setStudentTab('exam_feedback');
  };

  // Compute history metrics
  const totalSubmissions = submissions.length;
  const avgScore = totalSubmissions > 0
    ? (submissions.reduce((acc, s) => acc + s.score, 0) / totalSubmissions).toFixed(2)
    : '0.00';
  const highestScore = totalSubmissions > 0
    ? Math.max(...submissions.map((s) => s.score)).toFixed(2)
    : '0.00';

  return (
    <div className="space-y-8 pb-16">
      {/* 1. UNIFIED MAIN HEADER WITH SUB-TAB SWITCHER */}
      <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200/80 shadow-xs space-y-6">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <span className="bg-indigo-100 text-indigo-800 text-[10px] font-extrabold px-2.5 py-0.5 rounded-full uppercase tracking-wider">
                Trung Tâm Ôn Luyện &amp; Theo Dõi Kết Quả
              </span>
            </div>
            <h1 className="text-xl sm:text-2xl font-black text-slate-900 mt-1">
              Sổ Tay Lỗi Sai &amp; Lịch Sử Làm Bài Thi
            </h1>
            <p className="text-xs text-slate-500 mt-1 max-w-xl">
              Tích hợp 2 trong 1: Dễ dàng tra cứu lại tất cả lỗi sai ngữ pháp đã gặp và xem lại lịch sử làm bài, điểm số thi thử vào lớp 10.
            </p>
          </div>

          {/* Quick Action when in mistake mode */}
          {activeSubTab === 'mistakes' && bookmarkedMistakes.length > 0 && (
            <button
              onClick={() => {
                setActiveFlashcardIdx(0);
                setIsFlipped(false);
              }}
              className="px-5 py-2.5 rounded-2xl bg-linear-to-r from-indigo-600 to-violet-600 hover:from-indigo-700 hover:to-violet-700 text-white font-bold text-xs shadow-md shadow-indigo-200 flex items-center gap-2 transition-all cursor-pointer"
            >
              <Brain className="w-4 h-4" /> Bật Flashcard Ôn Nhanh
            </button>
          )}

          {/* Quick Action when in history mode */}
          {activeSubTab === 'history' && (
            <button
              onClick={() => setStudentTab('take_exam')}
              className="px-5 py-2.5 rounded-2xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs shadow-md shadow-indigo-200 flex items-center gap-2 transition-all cursor-pointer"
            >
              <Play className="w-4 h-4" /> Làm Đề Thi Mới
            </button>
          )}
        </div>

        {/* 2. TAB CONTROLS (TABS SELECTION BAR) */}
        <div className="bg-slate-100/90 p-1.5 rounded-2xl flex flex-wrap items-center gap-2 border border-slate-200 max-w-md">
          <button
            onClick={() => setActiveSubTab('mistakes')}
            className={`flex-1 py-2.5 px-4 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-2 cursor-pointer ${
              activeSubTab === 'mistakes'
                ? 'bg-white text-indigo-700 shadow-md border border-slate-200/80'
                : 'text-slate-600 hover:text-indigo-600 hover:bg-white/50'
            }`}
          >
            <BookmarkCheck className="w-4 h-4 text-rose-500" />
            <span>Sổ Tay Lỗi Sai</span>
            <span
              className={`text-[10px] font-extrabold px-2 py-0.5 rounded-full ${
                activeSubTab === 'mistakes'
                  ? 'bg-rose-500 text-white'
                  : 'bg-slate-200 text-slate-700'
              }`}
            >
              {bookmarkedMistakes.length}
            </span>
          </button>

          <button
            onClick={() => setActiveSubTab('history')}
            className={`flex-1 py-2.5 px-4 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-2 cursor-pointer ${
              activeSubTab === 'history'
                ? 'bg-white text-indigo-700 shadow-md border border-slate-200/80'
                : 'text-slate-600 hover:text-indigo-600 hover:bg-white/50'
            }`}
          >
            <History className="w-4 h-4 text-indigo-600" />
            <span>Lịch Sử Bài Thi</span>
            <span
              className={`text-[10px] font-extrabold px-2 py-0.5 rounded-full ${
                activeSubTab === 'history'
                  ? 'bg-indigo-600 text-white'
                  : 'bg-slate-200 text-slate-700'
              }`}
            >
              {submissions.length}
            </span>
          </button>
        </div>
      </div>

      {/* ============================================================== */}
      {/* FEATURE 1: SỔ TAY LỖI SAI (MISTAKE NOTEBOOK) */}
      {/* ============================================================== */}
      {activeSubTab === 'mistakes' && (
        <div className="space-y-6 animate-in fade-in duration-200">
          {/* Flashcard Modal / Active Review Mode */}
          {activeFlashcardIdx !== null && filteredMistakes[activeFlashcardIdx] && (
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
              <div className="bg-white rounded-3xl shadow-2xl max-w-xl w-full border border-slate-100 overflow-hidden animate-in zoom-in-95 duration-150">
                <div className="bg-linear-to-r from-indigo-900 to-violet-900 p-4 text-white flex items-center justify-between">
                  <span className="text-xs font-bold text-amber-300">
                    Flashcard {activeFlashcardIdx + 1} / {filteredMistakes.length}
                  </span>
                  <button
                    onClick={() => setActiveFlashcardIdx(null)}
                    className="text-indigo-200 hover:text-white text-xs font-bold px-2 py-1 rounded-lg hover:bg-white/10"
                  >
                    Đóng
                  </button>
                </div>

                <div className="p-8 text-center space-y-6">
                  <span className="text-[10px] font-extrabold uppercase px-3 py-1 rounded-full bg-indigo-100 text-indigo-800 inline-block">
                    {filteredMistakes[activeFlashcardIdx].grammarTopic}
                  </span>

                  {!isFlipped ? (
                    <div className="space-y-4 py-6">
                      <p className="text-xs text-slate-400 font-bold uppercase tracking-wider">
                        Câu số {filteredMistakes[activeFlashcardIdx].questionNumber} ({filteredMistakes[activeFlashcardIdx].examTitle})
                      </p>
                      <p className="text-base font-bold text-slate-800">
                        Đáp án em từng chọn sai là: &quot;
                        <span className="text-rose-600 underline">
                          {filteredMistakes[activeFlashcardIdx].studentAnswer}
                        </span>
                        &quot;
                      </p>
                      <p className="text-xs text-slate-500 italic">
                        Hãy thử nhớ lại quy tắc ngữ pháp đúng trước khi lật thẻ nhé!
                      </p>
                    </div>
                  ) : (
                    <div className="space-y-4 py-4 text-left bg-indigo-50/50 p-5 rounded-2xl border border-indigo-100 animate-in fade-in duration-200">
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-bold text-emerald-800">Đáp án chuẩn:</span>
                        <strong className="text-base text-emerald-950 font-black">
                          {filteredMistakes[activeFlashcardIdx].correctAnswer}
                        </strong>
                      </div>
                      <p className="text-xs text-slate-700 leading-relaxed">
                        💡 {filteredMistakes[activeFlashcardIdx].whyCorrect}
                      </p>
                      {filteredMistakes[activeFlashcardIdx].formulaAndRule && (
                        <p className="text-xs font-mono bg-white p-2.5 rounded-xl border border-slate-200 text-indigo-950">
                          📐 {filteredMistakes[activeFlashcardIdx].formulaAndRule}
                        </p>
                      )}
                    </div>
                  )}

                  <div className="flex items-center justify-center gap-3 pt-2">
                    <button
                      onClick={() => setIsFlipped(!isFlipped)}
                      className="px-5 py-2.5 rounded-xl bg-indigo-600 text-white font-bold text-xs hover:bg-indigo-700 transition-colors flex items-center gap-1.5 cursor-pointer"
                    >
                      <RotateCcw className="w-3.5 h-3.5" /> {isFlipped ? 'Xem lại mặt trước' : 'Lật xem đáp án & quy tắc'}
                    </button>
                  </div>

                  {/* Next / Prev */}
                  <div className="flex items-center justify-between pt-4 border-t border-slate-100">
                    <button
                      disabled={activeFlashcardIdx === 0}
                      onClick={() => {
                        setActiveFlashcardIdx((p) => (p !== null ? Math.max(0, p - 1) : 0));
                        setIsFlipped(false);
                      }}
                      className="text-xs font-bold text-slate-500 disabled:opacity-30"
                    >
                      ← Thẻ trước
                    </button>
                    <button
                      disabled={activeFlashcardIdx === filteredMistakes.length - 1}
                      onClick={() => {
                        setActiveFlashcardIdx((p) => (p !== null ? Math.min(filteredMistakes.length - 1, p + 1) : 0));
                        setIsFlipped(false);
                      }}
                      className="text-xs font-bold text-indigo-600 disabled:opacity-30"
                    >
                      Thẻ tiếp theo →
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Filter and Search Bar */}
          <div className="bg-white rounded-2xl p-4 border border-slate-200 shadow-xs flex flex-wrap items-center justify-between gap-3">
            {/* Search */}
            <div className="relative flex-1 min-w-[240px]">
              <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Tìm theo chuyên đề ngữ pháp, từ khóa, đáp án..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 rounded-xl bg-slate-50 border border-slate-200 text-xs font-medium focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>

            {/* Topic filter */}
            <div className="flex items-center gap-2">
              <Filter className="w-4 h-4 text-slate-400" />
              <select
                value={selectedTopic}
                onChange={(e) => setSelectedTopic(e.target.value)}
                className="px-3 py-2 rounded-xl bg-slate-50 border border-slate-200 text-xs font-semibold text-slate-700 focus:outline-none focus:ring-2 focus:ring-indigo-500"
              >
                <option value="all">Tất cả chủ điểm ({bookmarkedMistakes.length})</option>
                {topics.map((t) => (
                  <option key={t} value={t}>
                    {t}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Mistake Cards Grid */}
          {filteredMistakes.length === 0 ? (
            <div className="bg-white rounded-3xl p-12 text-center border border-slate-200 shadow-xs space-y-3">
              <BookmarkCheck className="w-12 h-12 text-emerald-500 mx-auto" />
              <h3 className="text-base font-bold text-slate-800">
                {bookmarkedMistakes.length === 0
                  ? 'Chưa có lỗi sai nào trong sổ tay!'
                  : 'Không tìm thấy câu hỏi phù hợp bộ lọc.'}
              </h3>
              <p className="text-xs text-slate-500 max-w-sm mx-auto">
                Khi em làm bài thi hoặc kiểm tra, những câu làm sai sẽ tự động được AI phân tích và lưu vào đây để em ôn tập lại bất kỳ lúc nào.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {filteredMistakes.map((m, idx) => (
                <div
                  key={idx}
                  className="bg-white rounded-3xl p-5 border border-slate-200/90 shadow-xs hover:border-indigo-300 hover:shadow-md transition-all flex flex-col justify-between space-y-4"
                >
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] font-extrabold uppercase px-2.5 py-0.5 rounded-full bg-indigo-100 text-indigo-800">
                        {m.grammarTopic}
                      </span>
                      <button
                        onClick={() => removeBookmarkedMistake(m.questionNumber, m.examId)}
                        className="text-slate-400 hover:text-rose-600 transition-colors p-1"
                        title="Xóa khỏi sổ tay"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>

                    <div>
                      <h4 className="font-bold text-sm text-slate-900">
                        Câu số {m.questionNumber} ({m.examTitle})
                      </h4>
                      <div className="flex items-center gap-3 text-xs mt-2">
                        <span className="text-rose-600 font-semibold line-through">
                          Đã chọn: {m.studentAnswer}
                        </span>
                        <span className="text-emerald-700 font-bold">
                          Đáp án đúng: {m.correctAnswer}
                        </span>
                      </div>
                    </div>

                    {m.rootCause && (
                      <p className="text-xs text-slate-600 bg-amber-50/60 p-2.5 rounded-xl border border-amber-200/60">
                        🔍 <strong>Nguyên nhân:</strong> {m.rootCause}
                      </p>
                    )}

                    {m.formulaAndRule && (
                      <p className="text-[11px] font-mono bg-slate-900 text-indigo-100 p-2.5 rounded-xl">
                        📐 {m.formulaAndRule}
                      </p>
                    )}
                  </div>

                  <div className="pt-3 border-t border-slate-100 flex items-center justify-between text-xs">
                    <span className="text-[10px] text-slate-400 font-medium">
                      {m.date ? new Date(m.date).toLocaleDateString('vi-VN') : 'Gần đây'}
                    </span>
                    <span className="text-emerald-700 font-bold flex items-center gap-1 text-[11px]">
                      <CheckCircle2 className="w-3 h-3 text-emerald-600" /> Đã ghi nhận trong sổ lỗi
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* ============================================================== */}
      {/* FEATURE 2: LỊCH SỬ BÀI THI (EXAM SUBMISSION HISTORY) */}
      {/* ============================================================== */}
      {activeSubTab === 'history' && (
        <div className="space-y-6 animate-in fade-in duration-200">
          {/* Quick Metrics Bar */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="bg-white rounded-2xl p-4 border border-slate-200/80 shadow-xs text-center">
              <span className="text-xs font-bold text-slate-500 uppercase tracking-wider block">
                Tổng số bài đã nộp
              </span>
              <span className="text-2xl font-black text-slate-900 mt-1 block">
                {totalSubmissions} <span className="text-xs font-normal text-slate-400">bài</span>
              </span>
            </div>

            <div className="bg-white rounded-2xl p-4 border border-slate-200/80 shadow-xs text-center">
              <span className="text-xs font-bold text-slate-500 uppercase tracking-wider block">
                Điểm trung bình các bài
              </span>
              <span className="text-2xl font-black text-indigo-700 mt-1 block">
                {avgScore} <span className="text-xs font-normal text-slate-400">/ 10</span>
              </span>
            </div>

            <div className="bg-white rounded-2xl p-4 border border-slate-200/80 shadow-xs text-center">
              <span className="text-xs font-bold text-slate-500 uppercase tracking-wider block">
                Điểm cao nhất đạt được
              </span>
              <span className="text-2xl font-black text-emerald-600 mt-1 block">
                {highestScore} <span className="text-xs font-normal text-slate-400">/ 10</span>
              </span>
            </div>
          </div>

          {/* Submissions List */}
          {submissions.length === 0 ? (
            <div className="bg-white rounded-3xl p-12 text-center border border-slate-200 shadow-xs space-y-3">
              <History className="w-12 h-12 text-slate-300 mx-auto" />
              <h3 className="text-base font-bold text-slate-800">Chưa có bài thi nào được nộp</h3>
              <p className="text-xs text-slate-500 max-w-sm mx-auto">
                Hãy bắt đầu làm một bài kiểm tra trắc nghiệm trực tuyến hoặc tải lên ảnh chụp bài làm để AI chấm điểm và lưu kết quả vào đây nhé!
              </p>
              <button
                onClick={() => setStudentTab('take_exam')}
                className="px-5 py-2.5 rounded-xl bg-indigo-600 text-white font-bold text-xs hover:bg-indigo-700 transition-colors"
              >
                Đến Trang Làm Bài
              </button>
            </div>
          ) : (
            <div className="space-y-4">
              {submissions.map((sub, idx) => (
                <div
                  key={sub.id || idx}
                  className="bg-white rounded-3xl p-5 sm:p-6 border border-slate-200/80 shadow-xs hover:border-indigo-300 hover:shadow-md transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-4"
                >
                  <div className="space-y-2">
                    <div className="flex items-center gap-2">
                      <span className="text-[10px] font-extrabold uppercase px-2.5 py-0.5 rounded-full bg-indigo-50 text-indigo-700 border border-indigo-100">
                        {sub.submissionType === 'ocr_scan' ? 'Quét Ảnh OCR' : 'Làm Trực Tuyến'}
                      </span>
                      <span className="text-xs text-slate-400">
                        {new Date(sub.submittedAt).toLocaleString('vi-VN')}
                      </span>
                    </div>

                    <h3 className="font-extrabold text-slate-900 text-base">{sub.examTitle}</h3>

                    <div className="flex flex-wrap items-center gap-4 text-xs text-slate-600">
                      <span className="flex items-center gap-1 text-emerald-700 font-semibold">
                        <CheckCircle2 className="w-3.5 h-3.5" /> Đúng: {sub.correctCount} câu
                      </span>
                      <span className="flex items-center gap-1 text-rose-600 font-semibold">
                        <XCircle className="w-3.5 h-3.5" /> Sai: {sub.wrongCount} câu
                      </span>
                      <span className="text-slate-500">
                        Cần chú ý: {sub.weakGrammarTopics?.[0]?.topicName || 'Ngữ pháp cơ bản'}
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center gap-4 shrink-0 sm:border-l sm:border-slate-100 sm:pl-6">
                    <div className="text-right">
                      <span className="text-xs text-slate-400 block font-medium">Điểm số</span>
                      <span className="text-2xl font-black text-indigo-700">
                        {sub.score.toFixed(2)}
                        <span className="text-xs text-slate-400 font-normal">/10</span>
                      </span>
                    </div>

                    <button
                      onClick={() => handleReviewSubmission(sub)}
                      className="px-4 py-2.5 rounded-xl bg-indigo-50 hover:bg-indigo-100 text-indigo-700 text-xs font-bold transition-colors flex items-center gap-1.5 cursor-pointer"
                    >
                      Xem Báo Cáo AI <ArrowRight className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
};
