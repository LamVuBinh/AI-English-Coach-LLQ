import React, { useState, useMemo } from 'react';
import { useApp } from '../context/AppContext';
import { ClassStudentStat } from '../types';
import { SAMPLE_EXAMS } from '../data/sampleExams';
import {
  BarChart3,
  Users,
  FileText,
  AlertTriangle,
  Sparkles,
  TrendingUp,
  Award,
  Clock,
  CheckCircle2,
  ArrowRight,
  School,
  PlusCircle,
  Play,
  FileCheck,
  RefreshCw,
  Search,
  Filter,
  Calendar,
  Layers,
  Check,
  ScanLine,
  ShieldCheck,
  ChevronRight,
  Eye,
  Target,
  Star,
  KeyRound,
} from 'lucide-react';

export const TeacherDashboard: React.FC = () => {
  const {
    exams,
    classStudents,
    submissions,
    userAccounts,
    setTeacherTab,
    setCurrentExam,
    setStudentTab,
    setRole,
    showToast,
    diagnosticExamId,
    setDiagnosticExam,
    openAiConfigModal,
  } = useApp();

  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'critical' | 'moderate' | 'excellent'>('all');
  const [isRefreshing, setIsRefreshing] = useState(false);

  // 1. Recalculate dynamic student statistics strictly using registered student accounts in userAccounts and real submissions
  const dynamicStudents = useMemo<ClassStudentStat[]>(() => {
    const list: ClassStudentStat[] = [];
    const registeredStudents = userAccounts.filter((u) => u.role === 'student');

    registeredStudents.forEach((u) => {
      // Find all submissions by this student
      const stuSubs = submissions.filter(
        (s) => s.studentId === u.id || s.studentName.toLowerCase() === u.name.toLowerCase()
      );

      let avgScore = 0;
      let latestScore = 0;
      let testsDone = stuSubs.length;
      let weakestTopic = 'Chưa làm bài thi';

      if (stuSubs.length > 0) {
        latestScore = stuSubs[0].score;
        const totalSubScores = stuSubs.reduce((acc, sub) => acc + sub.score, 0);
        avgScore = Number((totalSubScores / stuSubs.length).toFixed(2));

        // Detect weakest topic from recent submissions
        if (stuSubs[0].weakGrammarTopics && stuSubs[0].weakGrammarTopics.length > 0) {
          weakestTopic = stuSubs[0].weakGrammarTopics[0].topicName;
        }
      }

      const status: 'critical' | 'moderate' | 'excellent' =
        testsDone === 0
          ? 'moderate'
          : avgScore >= 8.5
          ? 'excellent'
          : avgScore < 6.0
          ? 'critical'
          : 'moderate';

      list.push({
        id: u.id,
        name: u.name || u.username,
        avatar:
          u.avatar ||
          `https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80`,
        avgScore: testsDone > 0 ? avgScore : 0,
        latestScore: testsDone > 0 ? latestScore : 0,
        testsDone,
        targetSchool: u.targetSchool || 'THPT Công Lập TP.HCM',
        status,
        weakestTopic,
      });
    });

    return list;
  }, [submissions, userAccounts]);

  // 2. Filter students based on search and status
  const filteredStudents = useMemo(() => {
    return dynamicStudents.filter((stu) => {
      const matchSearch =
        stu.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        stu.targetSchool.toLowerCase().includes(searchTerm.toLowerCase()) ||
        stu.weakestTopic.toLowerCase().includes(searchTerm.toLowerCase());

      const matchStatus = statusFilter === 'all' || stu.status === statusFilter;
      return matchSearch && matchStatus;
    });
  }, [dynamicStudents, searchTerm, statusFilter]);

  // 3. Compute High-Level Metrics
  const totalStudents = dynamicStudents.length;
  const studentsWithTests = dynamicStudents.filter((s) => s.testsDone > 0);
  const classAvg = studentsWithTests.length > 0
    ? (studentsWithTests.reduce((acc, curr) => acc + curr.avgScore, 0) / studentsWithTests.length).toFixed(2)
    : '0.00';
  const criticalCount = dynamicStudents.filter((s) => s.status === 'critical').length;
  const moderateCount = dynamicStudents.filter((s) => s.status === 'moderate').length;
  const excellentCount = dynamicStudents.filter((s) => s.status === 'excellent').length;
  const totalSubmissionsCount = submissions.length;
  const assignedExams = exams.filter((e) => e.isAssigned);

  // 3.5. Active Diagnostic Assessment Exam
  const activeDiagnosticExam = useMemo(() => {
    return (
      exams.find((e) => e.id === diagnosticExamId) ||
      SAMPLE_EXAMS.find((e) => e.id === diagnosticExamId) ||
      exams.find((e) => e.isDiagnostic) ||
      exams[0] ||
      SAMPLE_EXAMS[0]
    );
  }, [exams, diagnosticExamId]);

  const diagnosticSubmissions = useMemo(() => {
    if (!activeDiagnosticExam) return [];
    return submissions.filter((s) => s.examId === activeDiagnosticExam.id);
  }, [submissions, activeDiagnosticExam]);

  const studentsTakenDiagnostic = useMemo(() => {
    return new Set(diagnosticSubmissions.map((s) => s.studentId)).size;
  }, [diagnosticSubmissions]);

  const diagAvgScore = useMemo(() => {
    if (diagnosticSubmissions.length === 0) return null;
    const sum = diagnosticSubmissions.reduce((acc, curr) => acc + curr.score, 0);
    return (sum / diagnosticSubmissions.length).toFixed(2);
  }, [diagnosticSubmissions]);

  // 4. Refresh handler
  const handleRefreshData = () => {
    setIsRefreshing(true);
    showToast('Đang đồng bộ và cập nhật lại số liệu từ Cloud Firestore...');
    setTimeout(() => {
      setIsRefreshing(false);
      showToast('Đã cập nhật dữ liệu trang tổng quan mới nhất thành công!');
    }, 600);
  };

  return (
    <div className="space-y-8 pb-16">
      {/* 1. TEACHER HERO BANNER */}
      <div className="bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 rounded-3xl p-6 sm:p-8 text-white shadow-xl border border-indigo-900/50 flex flex-wrap items-center justify-between gap-6">
        <div className="space-y-2 max-w-2xl">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-400/20 text-amber-300 border border-amber-400/30 text-xs font-bold">
            <School className="w-3.5 h-3.5" /> Quản Trị Học Tập &amp; Khảo Thí Khối 9 Lên 10
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
            Bảng Điều Khiển Giáo Viên - Khối 9 Tuyển Sinh 10
          </h1>
          <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
            Giám sát năng lực học sinh theo 4 cấp độ tư duy (Thông báo 3584 Sở GD&ĐT TP.HCM), giao đề thi, theo dõi bài nộp thời gian thực và nhận phân tích AI chẩn đoán lỗ hổng ngữ pháp tức thời.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <button
            onClick={handleRefreshData}
            disabled={isRefreshing}
            className="px-4 py-2.5 rounded-xl bg-white/10 hover:bg-white/20 border border-white/20 text-white font-semibold text-xs transition-all flex items-center gap-2 cursor-pointer disabled:opacity-50"
            title="Làm mới dữ liệu từ Firestore"
          >
            <RefreshCw className={`w-3.5 h-3.5 text-amber-300 ${isRefreshing ? 'animate-spin' : ''}`} />
            Đồng Bộ Dữ Liệu
          </button>

          <button
            onClick={() => setTeacherTab('exam_management')}
            className="px-5 py-2.5 rounded-xl bg-amber-400 hover:bg-amber-300 text-indigo-950 font-bold text-xs shadow-md shadow-amber-400/20 flex items-center gap-2 transition-all cursor-pointer"
          >
            <PlusCircle className="w-4 h-4 text-indigo-950" /> Quản Lý / Giao Đề Thi
          </button>

          <button
            onClick={() => setTeacherTab('class_analytics')}
            className="px-4 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 border border-indigo-400/30 text-white font-semibold text-xs transition-all flex items-center gap-1.5 cursor-pointer shadow-md"
          >
            <BarChart3 className="w-4 h-4 text-amber-300" /> Báo Cáo Phân Tích
          </button>

          <button
            onClick={() => openAiConfigModal()}
            className="px-4 py-2.5 rounded-xl bg-violet-600 hover:bg-violet-500 border border-violet-400/30 text-white font-semibold text-xs transition-all flex items-center gap-1.5 cursor-pointer shadow-md"
            title="Cấu hình API Key chung cho toàn trang web (Giải pháp 2)"
          >
            <KeyRound className="w-4 h-4 text-amber-300" /> Cấu Hình AI Toàn Web
          </button>
        </div>
      </div>

      {/* 1.5. CẤU HÌNH & CHỌN ĐỀ KHẢO SÁT ĐÁNH GIÁ NĂNG LỰC HỌC SINH */}
      <div className="bg-gradient-to-br from-amber-50 via-white to-indigo-50/40 rounded-3xl p-6 border-2 border-amber-300 shadow-sm relative overflow-hidden space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="flex flex-wrap items-center gap-2">
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-400 text-indigo-950 font-black text-xs shadow-xs">
                <Star className="w-3.5 h-3.5 fill-indigo-950" /> ĐỀ KHẢO SÁT ĐÁNH GIÁ NĂNG LỰC HỌC SINH (CHUẨN 3584)
              </span>
              <span className="text-[11px] font-bold text-indigo-700 bg-indigo-100/80 px-2.5 py-0.5 rounded-full">
                Áp dụng toàn khối 9
              </span>
            </div>
            <h2 className="text-lg sm:text-xl font-black text-slate-900 flex items-center gap-2 pt-1">
              <Target className="w-5 h-5 text-indigo-600" />
              {activeDiagnosticExam?.title || 'Chưa chọn đề khảo sát'}
            </h2>
            <p className="text-xs text-slate-600 max-w-2xl leading-relaxed">
              {activeDiagnosticExam?.description || 'Học sinh khi bấm "Làm đề khảo sát năng lực" sẽ làm đề này để AI phân tích 4 cấp độ tư duy và khởi tạo lộ trình cá nhân hóa.'}
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <div className="bg-white px-4 py-2.5 rounded-2xl border border-amber-200/80 shadow-xs flex items-center gap-4 text-xs font-bold text-slate-700">
              <div className="text-center">
                <span className="text-[10px] text-slate-400 block font-semibold">Đã nộp khảo sát</span>
                <span className="text-base font-black text-indigo-700">{studentsTakenDiagnostic}/{totalStudents} HS</span>
              </div>
              <div className="h-7 w-px bg-slate-200" />
              <div className="text-center">
                <span className="text-[10px] text-slate-400 block font-semibold">Điểm TB khảo sát</span>
                <span className="text-base font-black text-amber-600">{diagAvgScore ? `${diagAvgScore}đ` : '--'}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Teacher selection control bar */}
        <div className="bg-white rounded-2xl p-4 border border-slate-200/80 shadow-xs flex flex-wrap items-center justify-between gap-3">
          <div className="flex flex-wrap items-center gap-2.5 flex-1 min-w-[280px]">
            <span className="text-xs font-bold text-slate-700 flex items-center gap-1.5 shrink-0">
              <FileText className="w-4 h-4 text-indigo-600" /> Chọn đề khảo sát:
            </span>
            <select
              value={activeDiagnosticExam?.id}
              onChange={(e) => {
                setDiagnosticExam(e.target.value);
              }}
              className="flex-1 min-w-[240px] max-w-md px-3.5 py-2 bg-slate-50 hover:bg-slate-100/80 border border-slate-300 rounded-xl text-xs font-bold text-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-500 cursor-pointer"
            >
              {exams.map((ex) => (
                <option key={ex.id} value={ex.id}>
                  {ex.title} ({ex.totalQuestions} câu • {ex.durationMinutes}p)
                </option>
              ))}
            </select>
            <span className="text-[11px] text-emerald-700 bg-emerald-50 border border-emerald-200 px-2.5 py-1 rounded-lg font-bold flex items-center gap-1">
              <Check className="w-3 h-3" /> Đang áp dụng cho học sinh
            </span>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => {
                if (activeDiagnosticExam) {
                  setCurrentExam(activeDiagnosticExam);
                  setTeacherTab('exam_management');
                }
              }}
              className="px-3.5 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs flex items-center gap-1.5 transition-colors cursor-pointer"
              title="Xem nội dung chi tiết của đề khảo sát này"
            >
              <Eye className="w-3.5 h-3.5" /> Chi Tiết Đề
            </button>
            <button
              onClick={() => setTeacherTab('exam_management')}
              className="px-3.5 py-2 rounded-xl bg-indigo-50 hover:bg-indigo-100 text-indigo-700 border border-indigo-200/80 font-bold text-xs flex items-center gap-1.5 transition-colors cursor-pointer"
              title="Tải lên hoặc quản lý ngân hàng đề thi"
            >
              <PlusCircle className="w-3.5 h-3.5" /> Thêm / Quản Lý Đề
            </button>
          </div>
        </div>
      </div>

      {/* 2. SUMMARY KPI CARDS */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
        {/* Card 1: Class Avg */}
        <div className="bg-white rounded-3xl p-5 border border-slate-200/80 shadow-xs space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">
              Điểm TB Toàn Khối
            </span>
            <div className="w-8 h-8 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center font-bold">
              <TrendingUp className="w-4 h-4" />
            </div>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-3xl font-black text-slate-900">{classAvg}</span>
            <span className="text-xs font-bold text-emerald-600">/ 10.0đ</span>
          </div>
          <p className="text-[11px] text-slate-400 font-medium">Chuẩn khảo thí TP.HCM 3584</p>
        </div>

        {/* Card 2: Total Students */}
        <div className="bg-white rounded-3xl p-5 border border-slate-200/80 shadow-xs space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">
              Tổng Số Học Sinh
            </span>
            <div className="w-8 h-8 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center font-bold">
              <Users className="w-4 h-4" />
            </div>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-3xl font-black text-slate-900">{totalStudents}</span>
            <span className="text-xs font-bold text-slate-500">học sinh</span>
          </div>
          <p className="text-[11px] text-slate-400 font-medium">Khối 9 ôn thi vào 10</p>
        </div>

        {/* Card 3: Total Submissions */}
        <div className="bg-white rounded-3xl p-5 border border-slate-200/80 shadow-xs space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">
              Lượt Nộp Bài Thi
            </span>
            <div className="w-8 h-8 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center font-bold">
              <FileCheck className="w-4 h-4" />
            </div>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-3xl font-black text-amber-600">{totalSubmissionsCount}</span>
            <span className="text-xs font-bold text-amber-700">bài làm</span>
          </div>
          <p className="text-[11px] text-slate-400 font-medium">Trực tuyến &amp; Chụp ảnh OCR</p>
        </div>

        {/* Card 4: Critical Care */}
        <div className="bg-white rounded-3xl p-5 border border-slate-200/80 shadow-xs space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">
              Cần Phụ Đạo Gấp
            </span>
            <div className="w-8 h-8 rounded-xl bg-rose-50 text-rose-600 flex items-center justify-center font-bold">
              <AlertTriangle className="w-4 h-4" />
            </div>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-3xl font-black text-rose-600">{criticalCount}</span>
            <span className="text-xs font-bold text-rose-600">Dưới 6.0đ</span>
          </div>
          <p className="text-[11px] text-rose-500 font-medium">Hổng ngữ pháp cốt lõi</p>
        </div>

        {/* Card 5: Top 1 Candidates */}
        <div className="bg-white rounded-3xl p-5 border border-slate-200/80 shadow-xs space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">
              Nhóm Mục Tiêu Top 1
            </span>
            <div className="w-8 h-8 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center font-bold">
              <Award className="w-4 h-4" />
            </div>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-3xl font-black text-emerald-600">{excellentCount}</span>
            <span className="text-xs font-bold text-emerald-600">&gt;= 8.5đ</span>
          </div>
          <p className="text-[11px] text-emerald-600 font-medium">Tiềm năng đỗ trường chuyên</p>
        </div>
      </div>

      {/* 3. ASSIGNED EXAMS GLANCE */}
      {assignedExams.length > 0 && (
        <div className="bg-white rounded-3xl border border-slate-200/80 p-5 sm:p-6 shadow-xs space-y-4">
          <div className="flex items-center justify-between flex-wrap gap-2">
            <div>
              <h2 className="text-base font-extrabold text-slate-900 flex items-center gap-2">
                <FileText className="w-4 h-4 text-indigo-600" /> Đề Thi Đang Giao Cho Học Sinh ({assignedExams.length})
              </h2>
              <p className="text-xs text-slate-500">Các đề thi đang mở cho học sinh làm bài và thu bài tự động</p>
            </div>
            <button
              onClick={() => setTeacherTab('exam_management')}
              className="text-xs font-bold text-indigo-600 hover:text-indigo-800 flex items-center gap-1 cursor-pointer"
            >
              Quản lý đề thi <ChevronRight className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {assignedExams.map((exam) => {
              const examSubmissions = submissions.filter((s) => s.examId === exam.id);
              return (
                <div
                  key={exam.id}
                  className="p-4 rounded-2xl bg-slate-50 border border-slate-200/90 flex flex-col justify-between space-y-3 hover:border-indigo-300 transition-colors"
                >
                  <div className="space-y-1">
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-indigo-100 text-indigo-700">
                        {exam.assignedClass || 'Lớp Khối 9'}
                      </span>
                      {exam.dueDate && (
                        <span className="text-[11px] font-semibold text-slate-500 flex items-center gap-1">
                          <Calendar className="w-3 h-3 text-slate-400" /> Hạn: {exam.dueDate}
                        </span>
                      )}
                    </div>
                    <h3 className="font-bold text-xs sm:text-sm text-slate-900 line-clamp-1">{exam.title}</h3>
                    <p className="text-[11px] text-slate-500 line-clamp-1">{exam.description}</p>
                  </div>

                  <div className="pt-2 border-t border-slate-200/70 flex items-center justify-between text-xs">
                    <div className="flex items-center gap-1.5 text-slate-700 font-semibold">
                      <FileCheck className="w-3.5 h-3.5 text-emerald-600" />
                      <span>Đã nộp: <strong>{examSubmissions.length}</strong> bài</span>
                    </div>
                    <button
                      onClick={() => {
                        setCurrentExam(exam);
                        setTeacherTab('exam_management');
                      }}
                      className="px-2.5 py-1 rounded-lg bg-indigo-50 hover:bg-indigo-100 text-indigo-700 font-bold text-[11px] transition-colors cursor-pointer"
                    >
                      Chi tiết đề
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* 4. STUDENT PERFORMANCE TABLE WITH SEARCH & FILTER */}
      <div className="bg-white rounded-3xl border border-slate-200/80 shadow-xs overflow-hidden">
        <div className="p-5 sm:p-6 border-b border-slate-100 space-y-4">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <h2 className="text-lg font-black text-slate-900">
                Danh Sách Học Sinh &amp; Tiến Độ Ôn Thi Vào 10
              </h2>
              <p className="text-xs text-slate-500">
                Hiển thị {filteredStudents.length} / {totalStudents} học sinh đang được theo dõi
              </p>
            </div>

            <button
              onClick={() => setTeacherTab('class_analytics')}
              className="text-xs font-bold text-indigo-600 hover:text-indigo-800 flex items-center gap-1 cursor-pointer"
            >
              Xem Phân Tích Ma Trận 3584 <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>

          {/* Search & Filter Bar */}
          <div className="flex flex-wrap items-center justify-between gap-3 pt-2">
            <div className="relative flex-1 min-w-[240px] max-w-md">
              <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Tìm kiếm học sinh theo tên, trường mục tiêu, điểm yếu..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-9 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:bg-white"
              />
              {searchTerm && (
                <button
                  onClick={() => setSearchTerm('')}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 text-xs"
                >
                  ✕
                </button>
              )}
            </div>

            <div className="flex items-center gap-2 flex-wrap">
              <span className="text-xs text-slate-500 font-bold flex items-center gap-1">
                <Filter className="w-3 h-3 text-slate-400" /> Lọc trạng thái:
              </span>
              <button
                onClick={() => setStatusFilter('all')}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-colors cursor-pointer ${
                  statusFilter === 'all'
                    ? 'bg-slate-900 text-white'
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                }`}
              >
                Tất cả ({dynamicStudents.length})
              </button>
              <button
                onClick={() => setStatusFilter('critical')}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-colors cursor-pointer ${
                  statusFilter === 'critical'
                    ? 'bg-rose-600 text-white'
                    : 'bg-rose-50 text-rose-700 hover:bg-rose-100'
                }`}
              >
                Cần phụ đạo ({criticalCount})
              </button>
              <button
                onClick={() => setStatusFilter('moderate')}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-colors cursor-pointer ${
                  statusFilter === 'moderate'
                    ? 'bg-indigo-600 text-white'
                    : 'bg-indigo-50 text-indigo-700 hover:bg-indigo-100'
                }`}
              >
                Tăng tốc ({moderateCount})
              </button>
              <button
                onClick={() => setStatusFilter('excellent')}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-colors cursor-pointer ${
                  statusFilter === 'excellent'
                    ? 'bg-emerald-600 text-white'
                    : 'bg-emerald-50 text-emerald-700 hover:bg-emerald-100'
                }`}
              >
                Nhóm 9.0+ ({excellentCount})
              </button>
            </div>
          </div>
        </div>

        {/* Table Body */}
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 text-slate-500 uppercase font-bold text-[10px] tracking-wider border-b border-slate-100">
              <tr>
                <th className="px-6 py-3.5">Học sinh</th>
                <th className="px-6 py-3.5">Trường mục tiêu</th>
                <th className="px-6 py-3.5">Điểm TB</th>
                <th className="px-6 py-3.5">Bài gần nhất</th>
                <th className="px-6 py-3.5">Lỗ hổng ngữ pháp chính</th>
                <th className="px-6 py-3.5">Trạng thái</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-slate-700 font-medium">
              {filteredStudents.length === 0 ? (
                <tr>
                  <td colSpan={6} className="text-center py-10 text-slate-400">
                    Không tìm thấy học sinh phù hợp với tiêu chí tìm kiếm.
                  </td>
                </tr>
              ) : (
                filteredStudents.map((stu) => (
                  <tr key={stu.id} className="hover:bg-slate-50/80 transition-colors">
                    <td className="px-6 py-4 flex items-center gap-3">
                      <img
                        src={stu.avatar}
                        alt={stu.name}
                        className="w-9 h-9 rounded-full object-cover border border-slate-200 shrink-0"
                        onError={(e) => {
                          (e.target as HTMLElement).style.display = 'none';
                        }}
                      />
                      <div>
                        <strong className="text-slate-900 block font-bold text-xs">{stu.name}</strong>
                        <span className="text-[11px] text-slate-400 font-normal">
                          Đã làm: <strong className="text-indigo-600 font-bold">{stu.testsDone}</strong> đề
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4 font-semibold text-slate-800">{stu.targetSchool}</td>
                    <td className="px-6 py-4">
                      <span className="font-extrabold text-sm text-indigo-700">
                        {stu.testsDone > 0 ? stu.avgScore.toFixed(2) : '--'}
                      </span>
                    </td>
                    <td className="px-6 py-4 font-bold text-slate-900">
                      {stu.testsDone > 0 ? `${stu.latestScore.toFixed(1)}đ` : '--'}
                    </td>
                    <td className="px-6 py-4 text-slate-500 font-semibold max-w-[220px]">
                      {stu.weakestTopic}
                    </td>
                    <td className="px-6 py-4">
                      <span
                        className={`text-[10px] font-bold px-2.5 py-1 rounded-full uppercase tracking-wider inline-block ${
                          stu.testsDone === 0
                            ? 'bg-slate-100 text-slate-600'
                            : stu.status === 'excellent'
                            ? 'bg-emerald-100 text-emerald-800'
                            : stu.status === 'critical'
                            ? 'bg-rose-100 text-rose-800'
                            : 'bg-indigo-50 text-indigo-700'
                        }`}
                      >
                        {stu.testsDone === 0
                          ? 'Chưa làm bài'
                          : stu.status === 'excellent'
                          ? 'Ổn định 9.0+'
                          : stu.status === 'critical'
                          ? 'Cần kèm cặp'
                          : 'Tăng tốc'}
                      </span>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* 5. RECENT SUBMISSIONS FEED */}
      <div className="bg-white rounded-3xl border border-slate-200/80 shadow-xs p-5 sm:p-6 space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-base font-extrabold text-slate-900 flex items-center gap-2">
              <Clock className="w-4 h-4 text-indigo-600" /> Hoạt Động Nộp Bài Thời Gian Thực
            </h2>
            <p className="text-xs text-slate-500">Các bài thi học sinh vừa hoàn thành gần đây</p>
          </div>
          <span className="text-xs font-bold text-slate-400">
            Tổng cộng: {submissions.length} bài đã nộp
          </span>
        </div>

        {submissions.length === 0 ? (
          <div className="text-center py-8 text-slate-400 bg-slate-50 rounded-2xl border border-dashed border-slate-200">
            <p className="text-xs">Chưa có bài nộp nào từ học sinh trong hệ thống.</p>
            <p className="text-[11px] text-slate-400 mt-1">
              Khi học sinh hoàn thành bài kiểm tra hoặc nộp ảnh chụp OCR, bài làm sẽ tự động hiển thị tại đây.
            </p>
          </div>
        ) : (
          <div className="divide-y divide-slate-100">
            {submissions.slice(0, 6).map((sub) => (
              <div key={sub.id} className="py-3.5 flex items-center justify-between flex-wrap gap-3">
                <div className="flex items-center gap-3">
                  <div
                    className={`w-9 h-9 rounded-xl flex items-center justify-center font-black text-xs ${
                      sub.score >= 8.5
                        ? 'bg-emerald-100 text-emerald-800'
                        : sub.score < 6.0
                        ? 'bg-rose-100 text-rose-800'
                        : 'bg-indigo-100 text-indigo-800'
                    }`}
                  >
                    {sub.score.toFixed(1)}
                  </div>
                  <div>
                    <h4 className="font-bold text-xs text-slate-900">
                      {sub.studentName} <span className="text-slate-400 font-normal">đã nộp</span> {sub.examTitle}
                    </h4>
                    <div className="flex items-center gap-3 text-[11px] text-slate-400 mt-0.5">
                      <span>Đúng {sub.correctCount} / {sub.correctCount + sub.wrongCount} câu</span>
                      <span>•</span>
                      <span>{new Date(sub.submittedAt).toLocaleDateString('vi-VN')} {new Date(sub.submittedAt).toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' })}</span>
                      <span>•</span>
                      <span className="capitalize">{sub.submissionType === 'ocr_scan' ? 'Chụp bài OCR' : 'Trực tuyến'}</span>
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <span
                    className={`text-[10px] font-extrabold px-2.5 py-0.5 rounded-full ${
                      sub.score >= 8.5
                        ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                        : sub.score < 6.0
                        ? 'bg-rose-50 text-rose-700 border border-rose-200'
                        : 'bg-indigo-50 text-indigo-700 border border-indigo-200'
                    }`}
                  >
                    {sub.score >= 8.5 ? 'Đạt loại Giỏi' : sub.score < 6.0 ? 'Cần cải thiện' : 'Khá'}
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

