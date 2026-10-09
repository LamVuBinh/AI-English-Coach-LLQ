import React from 'react';
import { useApp } from '../context/AppContext';
import {
  History,
  TrendingUp,
  Award,
  Calendar,
  CheckCircle2,
  XCircle,
  FileText,
  ScanLine,
  Play,
  ArrowRight,
} from 'lucide-react';

export const StudyHistory: React.FC = () => {
  const { submissions, setLatestSubmission, setStudentTab } = useApp();

  const handleReviewSubmission = (sub: any) => {
    setLatestSubmission(sub);
    setStudentTab('exam_feedback');
  };

  return (
    <div className="space-y-8 pb-16">
      {/* Header */}
      <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200/80 shadow-xs flex flex-wrap items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="bg-indigo-100 text-indigo-800 text-[10px] font-extrabold px-2.5 py-0.5 rounded-full uppercase tracking-wider">
              Nhật Ký & Lịch Sử Luyện Thi
            </span>
          </div>
          <h1 className="text-xl sm:text-2xl font-black text-slate-900 mt-1">
            Theo Dõi Tiến Trình & Lịch Sử Làm Bài ({submissions.length} Bài)
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Ghi nhận toàn bộ kết quả làm bài trực tuyến và nộp ảnh bài làm OCR
          </p>
        </div>
      </div>

      {/* Submissions List */}
      {submissions.length === 0 ? (
        <div className="bg-white rounded-3xl p-12 text-center border border-slate-200 shadow-xs space-y-3">
          <History className="w-12 h-12 text-slate-300 mx-auto" />
          <h3 className="text-base font-bold text-slate-800">Chưa có bài thi nào được ghi nhận</h3>
          <p className="text-xs text-slate-500 max-w-sm mx-auto">
            Hãy bắt đầu làm một bài kiểm tra hoặc tải ảnh bài làm lên để hệ thống lưu trữ lịch sử và vẽ biểu đồ tiến bộ của em nhé!
          </p>
          <button
            onClick={() => setStudentTab('take_exam')}
            className="px-5 py-2.5 rounded-xl bg-indigo-600 text-white font-bold text-xs hover:bg-indigo-700 transition-colors"
          >
            Làm bài ngay
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
  );
};
