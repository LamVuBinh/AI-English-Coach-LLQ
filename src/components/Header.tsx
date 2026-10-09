import React from 'react';
import { useApp } from '../context/AppContext';
import {
  GraduationCap,
  Sparkles,
  BookOpen,
  CheckCircle2,
  Calendar,
  Layers,
  BarChart3,
  BookmarkCheck,
  History,
  FileText,
  ScanLine,
  User,
  Users,
  School,
  LogIn,
  LogOut,
  ShieldCheck,
  Lock,
} from 'lucide-react';

interface HeaderProps {
  onOpenGoalModal: () => void;
}

export const Header: React.FC<HeaderProps> = ({ onOpenGoalModal }) => {
  const {
    role,
    setRole,
    studentTab,
    setStudentTab,
    teacherTab,
    setTeacherTab,
    studentProfile,
    bookmarkedMistakes,
    authUser,
    currentAccount,
    setAuthModalOpen,
    logout,
  } = useApp();

  // Calculate days left to exam
  const examDate = new Date(studentProfile.examDate);
  const today = new Date();
  const diffTime = examDate.getTime() - today.getTime();
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  const daysLeft = diffDays > 0 ? diffDays : 68;

  return (
    <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-slate-200 shadow-xs">
      {/* Top Banner: Standard 3584 Notice, Firebase Sync & Role Switcher */}
      <div className="bg-linear-to-r from-indigo-900 via-indigo-800 to-blue-900 text-white px-4 py-2 text-xs">
        <div className="max-w-7xl mx-auto flex flex-wrap items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <span className="bg-amber-400 text-indigo-950 font-bold px-2 py-0.5 rounded-full text-[11px] uppercase tracking-wider flex items-center gap-1 shadow-xs">
              <Sparkles className="w-3 h-3" /> Thông báo 3584 TP.HCM
            </span>
            <span className="hidden sm:inline text-indigo-100 font-medium">
              Chuẩn Đề Thi Tuyển Sinh Vào Lớp 10 &amp; CT GDPT 2018 (Sở GD&amp;ĐT TP.HCM)
            </span>
          </div>

          <div className="flex items-center gap-3">
            {/* Quick target school info */}
            {role === 'student' && (
              <button
                onClick={onOpenGoalModal}
                className="hover:bg-white/15 transition-colors px-2 py-1 rounded-md flex items-center gap-1.5 text-indigo-100 font-medium cursor-pointer"
                title="Nhấp để thay đổi mục tiêu"
              >
                <School className="w-3.5 h-3.5 text-amber-300" />
                <span>Mục tiêu: <strong className="text-white underline decoration-amber-400">{studentProfile.targetSchool}</strong></span>
                <span className="bg-indigo-700/80 px-1.5 py-0.2 rounded text-[11px] font-bold text-amber-300">
                  {studentProfile.targetScore}đ
                </span>
              </button>
            )}

            {/* Role switcher toggle with Strict 2-Way RBAC Protection */}
            {currentAccount?.role === 'teacher' ? (
              // Teacher / Admin: Fixed role badge, CANNOT switch to student!
              <div
                className="flex items-center gap-1.5 px-3 py-1 bg-amber-500 text-indigo-950 font-black rounded-lg text-xs shadow-xs"
                title="Tài khoản Quản trị viên & Giáo viên: Chỉ sử dụng giao diện quản trị"
              >
                <School className="w-3.5 h-3.5" />
                <span>Quản Trị Viên &amp; Giáo Viên</span>
              </div>
            ) : currentAccount?.role === 'student' ? (
              // Student: Fixed role badge, CANNOT switch to teacher!
              <div
                className="flex items-center gap-1.5 px-3 py-1 bg-indigo-600 text-white font-black rounded-lg text-xs shadow-xs"
                title="Tài khoản Học sinh: Chỉ sử dụng giao diện học tập"
              >
                <GraduationCap className="w-3.5 h-3.5" />
                <span>Học Sinh</span>
              </div>
            ) : (
              // Guest (Not logged in): Role switcher toggle
              <div className="flex items-center bg-indigo-950/80 p-0.5 rounded-lg border border-indigo-700/60">
                <button
                  onClick={() => setRole('student')}
                  className={`px-2.5 py-1 rounded-md text-xs font-semibold transition-all flex items-center gap-1.5 cursor-pointer ${
                    role === 'student'
                      ? 'bg-indigo-500 text-white shadow-xs'
                      : 'text-indigo-200 hover:text-white'
                  }`}
                  title="Giao diện Học sinh (Luyện thi, Nộp bài, Sổ lỗi)"
                >
                  <GraduationCap className="w-3.5 h-3.5" /> Học Sinh
                </button>
                <button
                  onClick={() => setRole('teacher')}
                  className={`px-2.5 py-1 rounded-md text-xs font-semibold transition-all flex items-center gap-1.5 cursor-pointer ${
                    role === 'teacher'
                      ? 'bg-amber-500 text-indigo-950 shadow-xs'
                      : 'text-indigo-200 hover:text-white'
                  }`}
                  title="Giao diện Quản trị viên & Giáo viên"
                >
                  <User className="w-3.5 h-3.5" /> Giáo Viên / Admin
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Main Navigation Bar */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo & App Name */}
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-linear-to-br from-indigo-600 to-violet-600 flex items-center justify-center text-white shadow-md shadow-indigo-200">
              <GraduationCap className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-extrabold text-lg tracking-tight bg-linear-to-r from-indigo-700 to-violet-700 bg-clip-text text-transparent">
                  AI English Coach
                </span>
                <span className="text-[10px] font-bold uppercase tracking-wider bg-indigo-100 text-indigo-700 px-1.5 py-0.5 rounded">
                  Lớp 10 TP.HCM
                </span>
              </div>
              <p className="text-xs text-slate-500 hidden sm:block">
                Cá nhân hóa ôn luyện Ngữ pháp &amp; Đề thi theo Thông báo 3584
              </p>
            </div>
          </div>

          {/* Navigation Items */}
          <nav className="hidden md:flex items-center gap-1">
            {role === 'student' ? (
              <>
                <button
                  onClick={() => setStudentTab('home_roadmap')}
                  className={`px-3.5 py-2 rounded-lg text-sm font-semibold transition-colors flex items-center gap-2 cursor-pointer ${
                    studentTab === 'home_roadmap'
                      ? 'bg-indigo-50 text-indigo-700 font-bold border border-indigo-100'
                      : 'text-slate-600 hover:text-indigo-600 hover:bg-slate-50'
                  }`}
                >
                  <Layers className="w-4 h-4" />
                  Lộ trình Cá nhân
                </button>

                <button
                  onClick={() => setStudentTab('take_exam')}
                  className={`px-3.5 py-2 rounded-lg text-sm font-semibold transition-colors flex items-center gap-2 cursor-pointer ${
                    studentTab === 'take_exam'
                      ? 'bg-indigo-50 text-indigo-700 font-bold border border-indigo-100'
                      : 'text-slate-600 hover:text-indigo-600 hover:bg-slate-50'
                  }`}
                >
                  <FileText className="w-4 h-4" />
                  Bài kiểm tra online &amp; bài tập
                </button>

                <button
                  onClick={() => setStudentTab('ocr_submission')}
                  className={`px-3.5 py-2 rounded-lg text-sm font-semibold transition-colors flex items-center gap-2 cursor-pointer ${
                    studentTab === 'ocr_submission'
                      ? 'bg-indigo-50 text-indigo-700 font-bold border border-indigo-100'
                      : 'text-slate-600 hover:text-indigo-600 hover:bg-slate-50'
                  }`}
                >
                  <ScanLine className="w-4 h-4 text-indigo-600" />
                  Nộp bài OCR
                </button>

                <button
                  onClick={() => setStudentTab('mistake_and_history')}
                  className={`px-3.5 py-2 rounded-lg text-sm font-semibold transition-colors flex items-center gap-2 relative cursor-pointer ${
                    studentTab === 'mistake_and_history' ||
                    studentTab === 'mistake_notebook' ||
                    studentTab === 'study_history'
                      ? 'bg-indigo-50 text-indigo-700 font-bold border border-indigo-100'
                      : 'text-slate-600 hover:text-indigo-600 hover:bg-slate-50'
                  }`}
                >
                  <BookmarkCheck className="w-4 h-4 text-rose-500" />
                  <span>Lịch sử &amp; Sổ lỗi</span>
                  {bookmarkedMistakes.length > 0 && (
                    <span className="bg-rose-500 text-white text-[10px] font-bold px-1.5 py-0.2 rounded-full">
                      {bookmarkedMistakes.length}
                    </span>
                  )}
                </button>
              </>
            ) : (
              <>
                <button
                  onClick={() => setTeacherTab('overview_dashboard')}
                  className={`px-3.5 py-2 rounded-lg text-sm font-semibold transition-colors flex items-center gap-2 cursor-pointer ${
                    teacherTab === 'overview_dashboard'
                      ? 'bg-indigo-50 text-indigo-700 font-bold border border-indigo-100'
                      : 'text-slate-600 hover:text-indigo-600 hover:bg-slate-50'
                  }`}
                >
                  <BarChart3 className="w-4 h-4" />
                  Trang tổng quan
                </button>

                <button
                  onClick={() => setTeacherTab('exam_management')}
                  className={`px-3.5 py-2 rounded-lg text-sm font-semibold transition-colors flex items-center gap-2 cursor-pointer ${
                    teacherTab === 'exam_management'
                      ? 'bg-indigo-50 text-indigo-700 font-bold border border-indigo-100'
                      : 'text-slate-600 hover:text-indigo-600 hover:bg-slate-50'
                  }`}
                >
                  <FileText className="w-4 h-4" />
                  Quản lý Đề thi &amp; Bài tập
                </button>

                <button
                  onClick={() => setTeacherTab('class_analytics')}
                  className={`px-3.5 py-2 rounded-lg text-sm font-semibold transition-colors flex items-center gap-2 cursor-pointer ${
                    teacherTab === 'class_analytics'
                      ? 'bg-indigo-50 text-indigo-700 font-bold border border-indigo-100'
                      : 'text-slate-600 hover:text-indigo-600 hover:bg-slate-50'
                  }`}
                >
                  <BarChart3 className="w-4 h-4" />
                  Báo cáo &amp; Phân tích
                </button>

                <button
                  onClick={() => setTeacherTab('user_management')}
                  className={`px-3.5 py-2 rounded-lg text-sm font-semibold transition-colors flex items-center gap-2 cursor-pointer ${
                    teacherTab === 'user_management'
                      ? 'bg-indigo-50 text-indigo-700 font-bold border border-indigo-100'
                      : 'text-slate-600 hover:text-indigo-600 hover:bg-slate-50'
                  }`}
                  title="Quản lý Tài khoản & Phân quyền RBAC"
                >
                  <Users className="w-4 h-4 text-indigo-600" />
                  Quản lý Tài khoản
                </button>
              </>
            )}
          </nav>

          {/* Right Profile & Countdown Tag & Auth Button */}
          <div className="flex items-center gap-3">
            {role === 'student' && (
              <div className="hidden lg:flex items-center gap-1.5 bg-amber-50 border border-amber-200 text-amber-900 px-3 py-1.5 rounded-lg text-xs font-semibold">
                <Calendar className="w-3.5 h-3.5 text-amber-600" />
                <span>Còn <strong>{daysLeft}</strong> ngày thi</span>
              </div>
            )}

            {/* Auth Account Trigger / User Capsule */}
            {authUser ? (
              <div
                onClick={() => setAuthModalOpen(true)}
                className="flex items-center gap-2 pl-2 border-l border-slate-200 cursor-pointer hover:bg-slate-50 p-1.5 rounded-xl transition-all"
                title="Tài khoản Firebase đã đăng nhập - Bấm để xem thông tin"
              >
                <div className="relative">
                  <div className="w-8 h-8 rounded-full bg-linear-to-tr from-indigo-600 to-violet-600 text-white flex items-center justify-center font-bold text-xs shadow-xs">
                    {authUser.photoURL ? (
                      <img src={authUser.photoURL} alt="Avatar" className="w-full h-full rounded-full object-cover" />
                    ) : (
                      currentAccount?.avatar || (currentAccount?.role === 'teacher' ? '👨‍🏫' : '👩‍🎓')
                    )}
                  </div>
                  <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 border-2 border-white absolute -bottom-0.5 -right-0.5" />
                </div>
                <div className="hidden sm:block text-left">
                  <p className="text-xs font-bold text-slate-800 leading-tight truncate max-w-[130px]">
                    {currentAccount?.name || authUser.displayName || (role === 'teacher' ? 'Quản Trị Viên' : studentProfile.name)}
                  </p>
                  <span className="text-[10px] text-emerald-600 font-semibold flex items-center gap-0.5">
                    <ShieldCheck className="w-3 h-3" /> {currentAccount?.role === 'teacher' ? 'Quản Trị & Giáo Viên' : 'Học Sinh'}
                  </span>
                </div>
              </div>
            ) : (
              <button
                onClick={() => setAuthModalOpen(true)}
                className="px-3.5 py-1.5 rounded-xl bg-linear-to-r from-indigo-600 to-violet-600 hover:from-indigo-700 hover:to-violet-700 text-white font-bold text-xs shadow-sm flex items-center gap-1.5 transition-all cursor-pointer"
              >
                <LogIn className="w-3.5 h-3.5" />
                <span>Đăng Nhập</span>
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Mobile navigation bar */}
      <div className="md:hidden border-t border-slate-100 bg-slate-50 px-2 py-1.5 flex items-center justify-around overflow-x-auto text-xs">
        {role === 'student' ? (
          <>
            <button
              onClick={() => setStudentTab('home_roadmap')}
              className={`px-2 py-1 rounded font-medium flex items-center gap-1 ${
                studentTab === 'home_roadmap' ? 'bg-indigo-600 text-white' : 'text-slate-600'
              }`}
            >
              <Layers className="w-3.5 h-3.5" /> Lộ trình
            </button>
            <button
              onClick={() => setStudentTab('take_exam')}
              className={`px-2 py-1 rounded font-medium flex items-center gap-1 ${
                studentTab === 'take_exam' ? 'bg-indigo-600 text-white' : 'text-slate-600'
              }`}
            >
              <FileText className="w-3.5 h-3.5" /> Kiểm tra &amp; Bài tập
            </button>
            <button
              onClick={() => setStudentTab('ocr_submission')}
              className={`px-2 py-1 rounded font-medium flex items-center gap-1 ${
                studentTab === 'ocr_submission' ? 'bg-indigo-600 text-white' : 'text-slate-600'
              }`}
            >
              <ScanLine className="w-3.5 h-3.5" /> Nộp bài OCR
            </button>
            <button
              onClick={() => setStudentTab('mistake_and_history')}
              className={`px-2 py-1 rounded font-medium flex items-center gap-1 ${
                studentTab === 'mistake_and_history' ||
                studentTab === 'mistake_notebook' ||
                studentTab === 'study_history'
                  ? 'bg-indigo-600 text-white'
                  : 'text-slate-600'
              }`}
            >
              <BookmarkCheck className="w-3.5 h-3.5" /> Lịch sử &amp; Sổ lỗi ({bookmarkedMistakes.length})
            </button>
          </>
        ) : (
          <>
            <button
              onClick={() => setTeacherTab('overview_dashboard')}
              className={`px-2 py-1 rounded font-medium flex items-center gap-1 ${
                teacherTab === 'overview_dashboard' ? 'bg-indigo-600 text-white' : 'text-slate-600'
              }`}
            >
              <BarChart3 className="w-3.5 h-3.5" /> Tổng quan
            </button>
            <button
              onClick={() => setTeacherTab('exam_management')}
              className={`px-2 py-1 rounded font-medium flex items-center gap-1 ${
                teacherTab === 'exam_management' ? 'bg-indigo-600 text-white' : 'text-slate-600'
              }`}
            >
              <FileText className="w-3.5 h-3.5" /> Quản lý Đề
            </button>
            <button
              onClick={() => setTeacherTab('class_analytics')}
              className={`px-2 py-1 rounded font-medium flex items-center gap-1 ${
                teacherTab === 'class_analytics' ? 'bg-indigo-600 text-white' : 'text-slate-600'
              }`}
            >
              <BarChart3 className="w-3.5 h-3.5" /> Báo cáo &amp; Phân tích
            </button>
            <button
              onClick={() => setTeacherTab('user_management')}
              className={`px-2 py-1 rounded font-medium flex items-center gap-1 ${
                teacherTab === 'user_management' ? 'bg-indigo-600 text-white' : 'text-slate-600'
              }`}
            >
              <Users className="w-3.5 h-3.5" /> Tài khoản
            </button>
          </>
        )}
      </div>
    </header>
  );
};
