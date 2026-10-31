import React, { useState } from 'react';
import { TopicPracticeSet } from '../data/roadmapTopicExercises';
import {
  X,
  Sparkles,
  CheckCircle2,
  AlertCircle,
  HelpCircle,
  Award,
  RefreshCw,
  Send,
  BookOpen,
  ArrowRight,
  Zap,
} from 'lucide-react';
import confetti from 'canvas-confetti';

interface Props {
  practiceSet: TopicPracticeSet;
  phaseIndex: number;
  weekIndex: number;
  isWeekAlreadyCompleted: boolean;
  onClose: () => void;
  onCompleteTask: (phaseIndex: number, weekIndex: number) => void;
}

export const InteractiveTopicPracticeModal: React.FC<Props> = ({
  practiceSet,
  phaseIndex,
  weekIndex,
  isWeekAlreadyCompleted,
  onClose,
  onCompleteTask,
}) => {
  const [userAnswers, setUserAnswers] = useState<Record<number, string>>({});
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [score, setScore] = useState(0);
  const [showFormula, setShowFormula] = useState(true);

  const handleSelectAnswer = (qNum: number, ans: string) => {
    if (isSubmitted) return;
    setUserAnswers((prev) => ({ ...prev, [qNum]: ans }));
  };

  const handleTextChange = (qNum: number, text: string) => {
    if (isSubmitted) return;
    setUserAnswers((prev) => ({ ...prev, [qNum]: text }));
  };

  const handleSubmitQuiz = () => {
    if (isSubmitted) return;

    let correctCount = 0;
    practiceSet.questions.forEach((q) => {
      const studentAns = (userAnswers[q.number] || '').trim().toLowerCase();
      const correctAns = q.correctAnswer.trim().toLowerCase();

      if (q.type === 'multiple_choice') {
        // Match option letter (e.g. 'A') or string starting with option letter
        if (studentAns.startsWith(correctAns) || studentAns === correctAns) {
          correctCount++;
        }
      } else {
        // Text input compare
        if (studentAns === correctAns) {
          correctCount++;
        } else if (
          correctAns.length > 5 &&
          studentAns.includes(correctAns.substring(0, Math.floor(correctAns.length * 0.8)))
        ) {
          correctCount++;
        }
      }
    });

    const finalScore = Math.round((correctCount / practiceSet.questions.length) * 10);
    setScore(finalScore);
    setIsSubmitted(true);

    if (finalScore >= 7) {
      confetti({
        particleCount: 80,
        spread: 70,
        origin: { y: 0.6 },
      });
    }
  };

  const handleRetry = () => {
    setUserAnswers({});
    setIsSubmitted(false);
    setScore(0);
  };

  const handleCompleteAndClose = () => {
    if (!isWeekAlreadyCompleted) {
      onCompleteTask(phaseIndex, weekIndex);
    }
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/80 backdrop-blur-sm flex items-center justify-center p-3 sm:p-4 overflow-y-auto animate-fadeIn">
      <div className="bg-white rounded-3xl max-w-3xl w-full shadow-2xl border border-slate-200 overflow-hidden my-auto max-h-[92vh] flex flex-col">
        {/* Modal Header */}
        <div className="bg-linear-to-r from-indigo-900 via-indigo-800 to-slate-900 text-white p-5 sm:p-6 shrink-0 flex items-start justify-between gap-4">
          <div className="space-y-1.5">
            <div className="inline-flex items-center gap-2 px-3 py-0.5 rounded-full bg-amber-400 text-indigo-950 text-xs font-black uppercase tracking-wider">
              <Zap className="w-3.5 h-3.5 text-indigo-950" /> Bài Tập Luyện Tập Theo Lộ Trình (Tuần {practiceSet.weekNumber})
            </div>
            <h2 className="text-lg sm:text-xl font-extrabold text-white leading-tight">
              {practiceSet.title}
            </h2>
            <p className="text-xs text-indigo-200 font-medium leading-relaxed">
              {practiceSet.grammarFocus}
            </p>
          </div>

          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 text-white flex items-center justify-center transition-colors cursor-pointer shrink-0"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Scrollable Content */}
        <div className="p-5 sm:p-6 overflow-y-auto space-y-6 flex-1">
          {/* Rule Formula Card */}
          {practiceSet.ruleFormulaCard && (
            <div className="bg-amber-50/90 border border-amber-300 rounded-2xl p-4 space-y-2.5 shadow-xs">
              <div className="flex items-center justify-between">
                <h3 className="font-bold text-amber-950 text-sm flex items-center gap-2">
                  <Sparkles className="w-4 h-4 text-amber-700" />
                  {practiceSet.ruleFormulaCard.title}
                </h3>
                <button
                  onClick={() => setShowFormula(!showFormula)}
                  className="text-xs font-semibold text-amber-800 hover:underline"
                >
                  {showFormula ? 'Thu gọn bí kíp' : 'Xem bí kíp'}
                </button>
              </div>

              {showFormula && (
                <div className="space-y-2 text-xs text-amber-900 leading-relaxed border-t border-amber-200/80 pt-2">
                  <p className="font-semibold text-amber-950">{practiceSet.ruleFormulaCard.summary}</p>
                  <ul className="space-y-1 pl-1">
                    {practiceSet.ruleFormulaCard.points.map((pt, pIdx) => (
                      <li key={pIdx} className="flex items-start gap-1.5">
                        <span className="text-amber-700 font-bold">•</span>
                        <span>{pt}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          )}

          {/* Submission Score Banner */}
          {isSubmitted && (
            <div className={`p-5 rounded-2xl border flex flex-col sm:flex-row items-center justify-between gap-4 shadow-sm ${
              score >= 8
                ? 'bg-emerald-50 border-emerald-300 text-emerald-950'
                : score >= 5
                ? 'bg-amber-50 border-amber-300 text-amber-950'
                : 'bg-rose-50 border-rose-300 text-rose-950'
            }`}>
              <div className="flex items-center gap-3">
                <div className={`w-12 h-12 rounded-2xl flex items-center justify-center text-lg font-black shrink-0 ${
                  score >= 8 ? 'bg-emerald-600 text-white' : score >= 5 ? 'bg-amber-500 text-white' : 'bg-rose-600 text-white'
                }`}>
                  {score}/10
                </div>
                <div>
                  <h4 className="font-extrabold text-sm sm:text-base">
                    {score >= 8 ? '🎉 Kết quả xuất sắc!' : score >= 5 ? '👍 Kết quả khá tốt!' : '💪 Hãy xem lời giải chi tiết và thử lại!'}
                  </h4>
                  <p className="text-xs opacity-90">
                    Đã hoàn thành {practiceSet.questions.length} câu luyện tập chuyên đề Tuần {practiceSet.weekNumber}.
                  </p>
                </div>
              </div>

              <div className="flex flex-wrap items-center gap-2 w-full sm:w-auto">
                <button
                  onClick={handleRetry}
                  className="px-3.5 py-2 bg-white border border-slate-300 text-slate-700 hover:bg-slate-50 text-xs font-bold rounded-xl shadow-xs transition-colors flex items-center gap-1.5 cursor-pointer"
                >
                  <RefreshCw className="w-3.5 h-3.5" /> Luyện Lại
                </button>
                <button
                  onClick={handleCompleteAndClose}
                  className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-xl shadow-md transition-colors flex items-center gap-1.5 cursor-pointer flex-1 sm:flex-initial justify-center"
                >
                  <CheckCircle2 className="w-4 h-4" /> Đánh Dấu Hoàn Thành Tuần {practiceSet.weekNumber}
                </button>
              </div>
            </div>
          )}

          {/* Question List */}
          <div className="space-y-6">
            {practiceSet.questions.map((q, idx) => {
              const studentAns = userAnswers[q.number] || '';
              const isChoice = q.type === 'multiple_choice';

              let isCorrect = false;
              if (isSubmitted) {
                const sAnsClean = studentAns.trim().toLowerCase();
                const cAnsClean = q.correctAnswer.trim().toLowerCase();
                if (isChoice) {
                  isCorrect = sAnsClean.startsWith(cAnsClean) || sAnsClean === cAnsClean;
                } else {
                  isCorrect = sAnsClean === cAnsClean || (cAnsClean.length > 5 && sAnsClean.includes(cAnsClean.substring(0, Math.floor(cAnsClean.length * 0.8))));
                }
              }

              return (
                <div
                  key={q.id}
                  className={`p-4 sm:p-5 rounded-2xl border transition-all ${
                    isSubmitted
                      ? isCorrect
                        ? 'bg-emerald-50/40 border-emerald-300'
                        : 'bg-rose-50/40 border-rose-300'
                      : 'bg-slate-50/60 border-slate-200 hover:border-indigo-300'
                  }`}
                >
                  {/* Question Header */}
                  <div className="flex items-start justify-between gap-3 mb-2.5">
                    <div className="flex items-center gap-2">
                      <span className="w-6 h-6 rounded-lg bg-indigo-600 text-white text-xs font-bold flex items-center justify-center shrink-0">
                        {idx + 1}
                      </span>
                      <span className="text-[11px] font-bold text-indigo-700 bg-indigo-50 border border-indigo-100 px-2 py-0.5 rounded-md">
                        {q.grammarTopic}
                      </span>
                    </div>

                    {isSubmitted && (
                      <span className={`text-xs font-extrabold flex items-center gap-1 ${
                        isCorrect ? 'text-emerald-700' : 'text-rose-700'
                      }`}>
                        {isCorrect ? <CheckCircle2 className="w-4 h-4 text-emerald-600" /> : <AlertCircle className="w-4 h-4 text-rose-600" />}
                        {isCorrect ? 'Chính xác (+1đ)' : 'Chưa đúng'}
                      </span>
                    )}
                  </div>

                  {/* Question Text */}
                  <p className="text-xs sm:text-sm font-bold text-slate-900 leading-snug mb-3">
                    {q.questionText}
                  </p>

                  {/* Image if any */}
                  {q.image && (
                    <div className="my-3 max-w-md mx-auto rounded-xl overflow-hidden border border-slate-200">
                      <img src={q.image} alt={`Question ${q.number}`} className="w-full h-auto" />
                    </div>
                  )}

                  {/* Options or Text Input */}
                  {isChoice ? (
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 mt-2">
                      {q.options?.map((opt, optIdx) => {
                        const optLetter = opt.substring(0, 1).toUpperCase();
                        const isSelected = studentAns === optLetter || studentAns === opt;

                        let optClass = 'bg-white border-slate-200 text-slate-700 hover:bg-indigo-50/50';
                        if (isSelected) {
                          optClass = 'bg-indigo-600 border-indigo-600 text-white shadow-xs font-bold';
                        }
                        if (isSubmitted) {
                          if (optLetter === q.correctAnswer || opt.startsWith(q.correctAnswer)) {
                            optClass = 'bg-emerald-600 border-emerald-600 text-white font-bold ring-2 ring-emerald-400';
                          } else if (isSelected && !isCorrect) {
                            optClass = 'bg-rose-600 border-rose-600 text-white font-bold';
                          }
                        }

                        return (
                          <button
                            key={optIdx}
                            onClick={() => handleSelectAnswer(q.number, optLetter)}
                            disabled={isSubmitted}
                            className={`p-3 rounded-xl border text-xs text-left transition-all cursor-pointer flex items-center gap-2 ${optClass}`}
                          >
                            <span className={`w-5 h-5 rounded-full text-[10px] font-bold flex items-center justify-center shrink-0 border ${
                              isSelected || (isSubmitted && (optLetter === q.correctAnswer || opt.startsWith(q.correctAnswer)))
                                ? 'border-white bg-white/20'
                                : 'border-slate-300 bg-slate-100 text-slate-600'
                            }`}>
                              {optLetter}
                            </span>
                            <span className="flex-1">{opt}</span>
                          </button>
                        );
                      })}
                    </div>
                  ) : (
                    <div className="mt-2 space-y-2">
                      <input
                        type="text"
                        placeholder="Nhập câu trả lời của em ở đây..."
                        value={studentAns}
                        onChange={(e) => handleTextChange(q.number, e.target.value)}
                        disabled={isSubmitted}
                        className="w-full px-4 py-2.5 rounded-xl border border-slate-300 text-xs font-medium focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 bg-white"
                      />
                    </div>
                  )}

                  {/* Detailed Explanation upon submission */}
                  {isSubmitted && (
                    <div className="mt-3 p-3 rounded-xl bg-white border border-slate-200/80 text-xs text-slate-700 space-y-1">
                      <p className="font-bold text-indigo-900 flex items-center gap-1.5">
                        <BookOpen className="w-3.5 h-3.5 text-indigo-600" />
                        Đáp án đúng: <strong className="text-emerald-700">{q.correctAnswer}</strong>
                      </p>
                      <p className="text-slate-600 leading-relaxed font-medium">
                        💡 <strong>Giải thích:</strong> {q.explanation}
                      </p>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* Modal Footer */}
        <div className="bg-slate-50 border-t border-slate-200 p-4 sm:p-5 shrink-0 flex items-center justify-between gap-3">
          <div className="text-xs text-slate-500 font-medium">
            {!isSubmitted
              ? `Đã trả lời ${Object.keys(userAnswers).length}/${practiceSet.questions.length} câu`
              : `Điểm số: ${score}/10`}
          </div>

          <div className="flex items-center gap-2">
            {!isSubmitted ? (
              <button
                onClick={handleSubmitQuiz}
                disabled={Object.keys(userAnswers).length === 0}
                className="px-5 py-2.5 bg-indigo-600 hover:bg-indigo-700 disabled:bg-slate-300 text-white text-xs font-bold rounded-xl shadow-md transition-all flex items-center gap-2 cursor-pointer disabled:cursor-not-allowed"
              >
                <Send className="w-3.5 h-3.5" /> Nộp Bài &amp; Chấm Điểm
              </button>
            ) : (
              <button
                onClick={handleCompleteAndClose}
                className="px-5 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-xl shadow-md transition-all flex items-center gap-2 cursor-pointer"
              >
                <CheckCircle2 className="w-4 h-4" /> Hoàn Thành &amp; Cập Nhật Lộ Trình
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
