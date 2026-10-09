import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import {
  BookmarkCheck,
  Search,
  Filter,
  Trash2,
  Sparkles,
  BookOpen,
  ArrowRight,
  HelpCircle,
  Brain,
  RotateCcw,
  CheckCircle2,
} from 'lucide-react';

export const MistakeNotebook: React.FC = () => {
  const { bookmarkedMistakes, removeBookmarkedMistake, setStudentTab } = useApp();
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

  return (
    <div className="space-y-8 pb-16">
      {/* Top Header */}
      <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200/80 shadow-xs flex flex-wrap items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="bg-rose-100 text-rose-800 text-[10px] font-extrabold px-2.5 py-0.5 rounded-full uppercase tracking-wider">
              Sổ Tay Lỗi Sai Cá Nhân
            </span>
            <span className="text-xs text-slate-500 font-medium">Spaced Repetition Review</span>
          </div>
          <h1 className="text-xl sm:text-2xl font-black text-slate-900 mt-1">
            Tổng Hợp & Ôn Lại Các Câu Hỏi Đã Từng Làm Sai ({bookmarkedMistakes.length})
          </h1>
          <p className="text-xs text-slate-500 mt-1 max-w-xl leading-relaxed">
            Nguyên tắc vàng thi vào 10: &quot;Không để sai lại lần thứ hai ở bất kỳ điểm ngữ pháp nào đã từng gặp&quot;.
          </p>
        </div>

        {bookmarkedMistakes.length > 0 && (
          <button
            onClick={() => {
              setActiveFlashcardIdx(0);
              setIsFlipped(false);
            }}
            className="px-5 py-2.5 rounded-2xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs shadow-md shadow-indigo-200 flex items-center gap-2 transition-all cursor-pointer"
          >
            <Brain className="w-4 h-4" /> Bật Chế Độ Flashcard Ôn Nhanh
          </button>
        )}
      </div>

      {/* FLASHCARD MODAL / ACTIVE REVIEW MODE */}
      {activeFlashcardIdx !== null && filteredMistakes[activeFlashcardIdx] && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
          <div className="bg-white rounded-3xl shadow-2xl max-w-xl w-full border border-slate-100 overflow-hidden">
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
            placeholder="Tìm theo chủ đề ngữ pháp, từ khóa, đáp án..."
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
              ? 'Chưa có lỗi sai nào được lưu!'
              : 'Không tìm thấy câu hỏi phù hợp bộ lọc.'}
          </h3>
          <p className="text-xs text-slate-500 max-w-sm mx-auto">
            Khi em làm các bài thi thử hoặc kiểm tra, những câu làm sai sẽ tự động được hệ thống lưu vào đây để em ôn tập lại.
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
                  <CheckCircle2 className="w-3 h-3 text-emerald-600" /> Đã lưu trong Sổ lỗi
                </span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
