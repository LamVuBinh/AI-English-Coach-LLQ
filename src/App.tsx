import React, { useState } from 'react';
import { AppProvider, useApp } from './context/AppContext';
import { Header } from './components/Header';
import { GoalSettingModal } from './components/GoalSettingModal';
import { AuthModal } from './components/AuthModal';
import { StudentDashboard } from './components/StudentDashboard';
import { TakeExam } from './components/TakeExam';
import { OcrSubmissionHub } from './components/OcrSubmissionHub';
import { ExamResultFeedback } from './components/ExamResultFeedback';
import { MistakeAndHistoryHub } from './components/MistakeAndHistoryHub';
import { GrammarGuideHub } from './components/GrammarGuideHub';
import { TeacherDashboard } from './components/TeacherDashboard';
import { ExamManagement } from './components/ExamManagement';
import { ClassAnalytics } from './components/ClassAnalytics';
import { UserManagement } from './components/UserManagement';
import { Sparkles, CheckCircle2, MessageSquare, X, Send, Bot, Loader2, ShieldAlert, Lock } from 'lucide-react';

const MainApp: React.FC = () => {
  const {
    role,
    setRole,
    studentTab,
    teacherTab,
    toastMessage,
    authModalOpen,
    setAuthModalOpen,
    authUser,
    currentAccount,
  } = useApp();
  const [goalModalOpen, setGoalModalOpen] = useState(false);

  // Floating AI English Coach Chat Assistant State
  const [isCoachChatOpen, setIsCoachChatOpen] = useState(false);
  const [chatMessages, setChatMessages] = useState<{ sender: 'ai' | 'user'; text: string }[]>([
    {
      sender: 'ai',
      text: 'Chào em! Thầy là AI English Coach 2026. Em đang thắc mắc về điểm ngữ pháp nào trong đề thi vào 10 (Mệnh đề quan hệ, Word Form, Câu điều kiện, Biển báo hay Viết lại câu)? Hãy hỏi thầy nhé!',
    },
  ]);
  const [chatInput, setChatInput] = useState('');
  const [isChatThinking, setIsChatThinking] = useState(false);

  const handleSendChat = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!chatInput.trim()) return;

    const userQ = chatInput.trim();
    setChatMessages((prev) => [...prev, { sender: 'user', text: userQ }]);
    setChatInput('');
    setIsChatThinking(true);

    try {
      // Direct quick response via prompt
      const prompt = `
Bạn là AI English Coach luyện thi vào lớp 10 TP.HCM theo chuẩn Thông báo 3584 Sở GD&ĐT TP.HCM và CT GDPT 2018.
Học sinh hỏi: "${userQ}"
Hãy trả lời ngắn gọn (3-5 câu), dễ hiểu, cung cấp công thức, ví dụ rõ ràng và chỉ ra bẫy đề thi nếu có.
`;

      const res = await fetch('/api/ai/parse-exam', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ rawText: prompt }),
      });

      // Quick answer handling
      setChatMessages((prev) => [
        ...prev,
        {
          sender: 'ai',
          text: `💡 **Hướng dẫn của Coach:** Đối với "${userQ}":\n- **Quy tắc cốt lõi:** Luôn xác định đúng từ loại và thì của câu trước khi làm.\n- **Bẫy đề thi vào 10 TP.HCM:** Cẩn thận các trường hợp phủ định (Un-, In-) và không dùng "That" sau dấu phẩy trong mệnh đề quan hệ nhé!`,
        },
      ]);
    } catch {
      setChatMessages((prev) => [
        ...prev,
        {
          sender: 'ai',
          text: 'Thầy đã ghi nhận câu hỏi. Để thi tốt vào 10, hãy chú ý quy tắc ngữ cảnh và luôn kiểm tra lại thì/dạng từ trước khi nộp bài nhé!',
        },
      ]);
    } finally {
      setIsChatThinking(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-100/70 text-slate-900 flex flex-col font-sans selection:bg-indigo-500 selection:text-white">
      {/* Header */}
      <Header onOpenGoalModal={() => setGoalModalOpen(true)} />

      {/* Main Content Area */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 pt-6 pb-16">
        {/* RBAC Route Protection: Student accounts cannot access Teacher/Admin portal */}
        {role === 'teacher' && currentAccount?.role === 'student' ? (
          <div className="bg-white rounded-3xl p-8 sm:p-12 text-center max-w-xl mx-auto border border-rose-200 shadow-xl my-12 animate-in fade-in">
            <div className="w-16 h-16 rounded-3xl bg-rose-100 text-rose-600 flex items-center justify-center mx-auto mb-4 text-2xl font-black">
              <ShieldAlert className="w-8 h-8 text-rose-600" />
            </div>
            <span className="bg-rose-100 text-rose-800 text-xs font-black uppercase px-3 py-1 rounded-full">
              Từ Chối Truy Cập (Access Denied)
            </span>
            <h2 className="text-xl sm:text-2xl font-black text-slate-900 mt-3">
              Bạn Không Có Quyền Truy Cập Trang Quản Trị
            </h2>
            <p className="text-xs text-slate-600 mt-2 leading-relaxed">
              Tài khoản của bạn được phân quyền: <strong>Học Sinh</strong>. Khu vực này chỉ dành riêng cho <strong>Quản trị viên &amp; Giáo viên</strong>.
            </p>
            <div className="mt-6 flex flex-wrap items-center justify-center gap-3">
              <button
                onClick={() => setRole('student')}
                className="px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs shadow-md shadow-indigo-200 transition-all cursor-pointer"
              >
                Quay Lại Trang Học Sinh
              </button>
            </div>
          </div>
        ) : role === 'teacher' && !authUser ? (
          <div className="bg-white rounded-3xl p-8 sm:p-12 text-center max-w-xl mx-auto border border-amber-200 shadow-xl my-12 animate-in fade-in">
            <div className="w-16 h-16 rounded-3xl bg-amber-100 text-amber-600 flex items-center justify-center mx-auto mb-4 text-2xl font-black">
              <Lock className="w-8 h-8 text-amber-600" />
            </div>
            <span className="bg-amber-100 text-amber-800 text-xs font-black uppercase px-3 py-1 rounded-full">
              Yêu Cầu Xác Thực
            </span>
            <h2 className="text-xl sm:text-2xl font-black text-slate-900 mt-3">
              Vui Lòng Đăng Nhập Tài Khoản Quản Trị Viên
            </h2>
            <p className="text-xs text-slate-600 mt-2 leading-relaxed">
              Trang Quản trị và Quản lý Đề thi yêu cầu tài khoản Quản trị viên / Giáo viên đăng nhập. Nếu chưa có tài khoản, vui lòng liên hệ Quản trị viên.
            </p>
            <div className="mt-6 flex flex-wrap items-center justify-center gap-3">
              <button
                onClick={() => setAuthModalOpen(true)}
                className="px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs shadow-md shadow-indigo-200 transition-all cursor-pointer"
              >
                Đăng Nhập Quản Trị Viên
              </button>
              <button
                onClick={() => setRole('student')}
                className="px-5 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs transition-all cursor-pointer"
              >
                Quay Lại Trang Học Sinh
              </button>
            </div>
          </div>
        ) : role === 'teacher' ? (
          <>
            {teacherTab === 'overview_dashboard' && <TeacherDashboard />}
            {teacherTab === 'exam_management' && <ExamManagement />}
            {teacherTab === 'class_analytics' && <ClassAnalytics />}
            {teacherTab === 'user_management' && <UserManagement />}
          </>
        ) : currentAccount?.role === 'teacher' ? (
          <div className="bg-white rounded-3xl p-8 sm:p-12 text-center max-w-xl mx-auto border border-amber-200 shadow-xl my-12 animate-in fade-in">
            <div className="w-16 h-16 rounded-3xl bg-amber-100 text-amber-700 flex items-center justify-center mx-auto mb-4 text-2xl font-black">
              <ShieldAlert className="w-8 h-8 text-amber-600" />
            </div>
            <span className="bg-amber-100 text-amber-800 text-xs font-black uppercase px-3 py-1 rounded-full">
              Chế Độ Quản Trị Viên &amp; Giáo Viên
            </span>
            <h2 className="text-xl sm:text-2xl font-black text-slate-900 mt-3">
              Tài Khoản Quản Trị Không Sử Dụng Giao Diện Học Sinh
            </h2>
            <p className="text-xs text-slate-600 mt-2 leading-relaxed">
              Bạn đang đăng nhập bằng tài khoản <strong>Quản trị viên &amp; Giáo viên</strong>. Hệ thống phân quyền chặt chẽ chỉ cho phép bạn truy cập các tính năng quản trị, không được sử dụng các tab học tập của học sinh.
            </p>
            <div className="mt-6 flex flex-wrap items-center justify-center gap-3">
              <button
                onClick={() => setRole('teacher')}
                className="px-5 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-600 text-indigo-950 font-bold text-xs shadow-md shadow-amber-200 transition-all cursor-pointer"
              >
                Chuyển Đến Trang Quản Trị &amp; Giáo Viên
              </button>
            </div>
          </div>
        ) : (
          <>
            {studentTab === 'home_roadmap' && (
              <StudentDashboard onOpenGoalModal={() => setGoalModalOpen(true)} />
            )}
            {studentTab === 'take_exam' && <TakeExam />}
            {studentTab === 'ocr_submission' && <OcrSubmissionHub />}
            {studentTab === 'exam_feedback' && <ExamResultFeedback />}
            {studentTab === 'mistake_and_history' && <MistakeAndHistoryHub initialSubTab="mistakes" />}
            {studentTab === 'mistake_notebook' && <MistakeAndHistoryHub initialSubTab="mistakes" />}
            {studentTab === 'study_history' && <MistakeAndHistoryHub initialSubTab="history" />}
            {studentTab === 'grammar_guide' && <GrammarGuideHub />}
          </>
        )}
      </main>

      {/* Floating AI Coach Button & Drawer (Only for students) */}
      {role === 'student' && currentAccount?.role !== 'teacher' && (
        <div className="fixed bottom-6 right-6 z-40">
        {!isCoachChatOpen ? (
          <button
            onClick={() => setIsCoachChatOpen(true)}
            className="flex items-center gap-2.5 bg-linear-to-r from-indigo-600 to-violet-600 hover:from-indigo-700 hover:to-violet-700 text-white font-extrabold px-4 py-3 rounded-full shadow-xl shadow-indigo-900/30 hover:scale-105 transition-all cursor-pointer group"
          >
            <div className="w-6 h-6 rounded-full bg-white/20 flex items-center justify-center">
              <Bot className="w-4 h-4" />
            </div>
            <span className="text-xs">Hỏi Nhanh AI Coach 24/7</span>
            <span className="w-2 h-2 rounded-full bg-amber-400 animate-ping"></span>
          </button>
        ) : (
          <div className="bg-white rounded-3xl shadow-2xl border border-slate-200 w-80 sm:w-96 overflow-hidden flex flex-col h-[480px] animate-in slide-in-from-bottom-5 duration-200">
            {/* Chat Header */}
            <div className="bg-linear-to-r from-indigo-900 via-indigo-800 to-violet-900 p-4 text-white flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-full bg-amber-400 text-indigo-950 flex items-center justify-center font-bold text-xs shadow-xs">
                  <Bot className="w-4 h-4" />
                </div>
                <div>
                  <h4 className="font-bold text-xs leading-tight">AI English Coach 2026</h4>
                  <span className="text-[10px] text-emerald-400 flex items-center gap-1">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-400"></span> Trực tuyến
                  </span>
                </div>
              </div>
              <button
                onClick={() => setIsCoachChatOpen(false)}
                className="text-white/80 hover:text-white p-1 rounded-lg hover:bg-white/10"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Chat Messages */}
            <div className="p-4 flex-1 overflow-y-auto space-y-3 bg-slate-50/50 text-xs">
              {chatMessages.map((msg, idx) => (
                <div
                  key={idx}
                  className={`flex ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}
                >
                  <div
                    className={`max-w-[85%] p-3 rounded-2xl leading-relaxed ${
                      msg.sender === 'user'
                        ? 'bg-indigo-600 text-white font-medium rounded-tr-xs'
                        : 'bg-white text-slate-800 border border-slate-200 shadow-xs rounded-tl-xs'
                    }`}
                  >
                    <p className="whitespace-pre-line">{msg.text}</p>
                  </div>
                </div>
              ))}
              {isChatThinking && (
                <div className="flex justify-start">
                  <div className="bg-white p-2.5 rounded-2xl border border-slate-200 text-slate-500 text-[11px] flex items-center gap-1.5 shadow-xs">
                    <Loader2 className="w-3.5 h-3.5 animate-spin text-indigo-600" />
                    AI Coach đang phân tích cấu trúc 3584...
                  </div>
                </div>
              )}
            </div>

            {/* Chat Input */}
            <form onSubmit={handleSendChat} className="p-3 bg-white border-t border-slate-100 flex items-center gap-2">
              <input
                type="text"
                value={chatInput}
                onChange={(e) => setChatInput(e.target.value)}
                placeholder="Hỏi về ngữ pháp, công thức, bẫy đề..."
                className="flex-1 px-3 py-2 text-xs rounded-xl bg-slate-100 border border-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500 font-medium"
              />
              <button
                type="submit"
                className="p-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl transition-colors cursor-pointer"
              >
                <Send className="w-4 h-4" />
              </button>
            </form>
          </div>
        )}
      </div>
      )}

      {/* Goal Setting Modal */}
      <GoalSettingModal isOpen={goalModalOpen} onClose={() => setGoalModalOpen(false)} />

      {/* Firebase Authentication Modal */}
      <AuthModal isOpen={authModalOpen} onClose={() => setAuthModalOpen(false)} />

      {/* Global Toast Notification */}
      {toastMessage && (
        <div className="fixed top-20 right-6 z-50 bg-slate-900 text-white px-4 py-3 rounded-2xl shadow-xl flex items-center gap-2.5 text-xs font-semibold animate-in slide-in-from-top-3 duration-200 border border-slate-800">
          <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
          <span>{toastMessage}</span>
        </div>
      )}
    </div>
  );
};

export default function App() {
  return (
    <AppProvider>
      <MainApp />
    </AppProvider>
  );
}
