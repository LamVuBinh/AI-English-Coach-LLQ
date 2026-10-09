import React, { useState, useRef } from 'react';
import { useApp } from '../context/AppContext';
import { apiService } from '../services/apiService';
import { Exam, Question } from '../types';
import { SAMPLE_EXAMS } from '../data/sampleExams';
import {
  FileText,
  PlusCircle,
  UploadCloud,
  Sparkles,
  Calendar,
  CheckCircle2,
  Trash2,
  Eye,
  Send,
  Loader2,
  X,
  Layers,
  BookOpen,
  School,
  Clock,
  AlertTriangle,
  Edit3,
  Check,
  RotateCcw,
  Image as ImageIcon,
  Camera,
  Upload,
  Star,
  Copy,
  Target,
} from 'lucide-react';

export const SIGNBOARD_PRESETS = [
  {
    name: 'Metro Line 1 (Cửa tàu đóng)',
    svg: 'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 400 240" width="100%" height="100%"><rect width="400" height="240" rx="16" fill="%231e3a8a"/><rect x="12" y="12" width="376" height="216" rx="10" fill="none" stroke="%23fbbf24" stroke-width="4"/><circle cx="60" cy="68" r="28" fill="%23ef4444"/><text x="60" y="78" font-family="Arial, sans-serif" font-size="28" font-weight="900" fill="white" text-anchor="middle">!</text><text x="105" y="62" font-family="Arial, sans-serif" font-size="17" font-weight="900" fill="%23fbbf24">METRO LINE 1 - HCMC</text><text x="105" y="84" font-family="Arial, sans-serif" font-size="12" font-weight="bold" fill="white">BEN THANH - SUOI TIEN</text><rect x="24" y="116" width="352" height="92" rx="8" fill="%23ffffff"/><text x="200" y="150" font-family="Arial, sans-serif" font-size="14" font-weight="900" fill="%23b91c1c" text-anchor="middle">PLEASE STAND CLEAR OF</text><text x="200" y="180" font-family="Arial, sans-serif" font-size="16" font-weight="900" fill="%231e293b" text-anchor="middle">THE CLOSING DOORS</text></svg>',
  },
  {
    name: 'Thư viện (Cấm ăn uống)',
    svg: 'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 400 240" width="100%" height="100%"><rect width="400" height="240" rx="16" fill="%230f172a"/><rect x="12" y="12" width="376" height="216" rx="10" fill="none" stroke="%23e2e8f0" stroke-width="4"/><rect x="24" y="24" width="352" height="50" rx="6" fill="%23dc2626"/><text x="200" y="56" font-family="Arial, sans-serif" font-size="18" font-weight="900" fill="white" text-anchor="middle">NOTICE / THÔNG BÁO</text><rect x="24" y="86" width="352" height="120" rx="8" fill="%23f8fafc"/><text x="200" y="118" font-family="Arial, sans-serif" font-size="13" font-weight="900" fill="%230f172a" text-anchor="middle">FOOD AND DRINKS</text><text x="200" y="142" font-family="Arial, sans-serif" font-size="12" font-weight="bold" fill="%232563eb" text-anchor="middle">(EXCEPT BOTTLED WATER)</text><text x="200" y="172" font-family="Arial, sans-serif" font-size="13" font-weight="900" fill="%23dc2626" text-anchor="middle">ARE STRICTLY PROHIBITED</text><text x="200" y="194" font-family="Arial, sans-serif" font-size="11" font-weight="bold" fill="%2364748b" text-anchor="middle">IN STUDY ROOMS</text></svg>',
  },
  {
    name: 'Cấm xả rác (No Littering)',
    svg: 'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 400 240" width="100%" height="100%"><rect width="400" height="240" rx="16" fill="%23065f46"/><rect x="12" y="12" width="376" height="216" rx="10" fill="none" stroke="%2334d399" stroke-width="4"/><circle cx="200" cy="80" r="45" fill="%23dc2626"/><circle cx="200" cy="80" r="36" fill="white"/><line x1="172" y1="52" x2="228" y2="108" stroke="%23dc2626" stroke-width="8"/><rect x="24" y="140" width="352" height="75" rx="8" fill="%23ffffff"/><text x="200" y="172" font-family="Arial, sans-serif" font-size="18" font-weight="900" fill="%23dc2626" text-anchor="middle">NO LITTERING</text><text x="200" y="196" font-family="Arial, sans-serif" font-size="12" font-weight="bold" fill="%23065f46" text-anchor="middle">KEEP OUR CITY CLEAN & GREEN</text></svg>',
  },
  {
    name: 'Khu vực trường học (School Zone)',
    svg: 'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 400 240" width="100%" height="100%"><rect width="400" height="240" rx="16" fill="%23eab308"/><polygon points="200,20 370,140 30,140" fill="%23ffffff" stroke="%23dc2626" stroke-width="8"/><text x="200" y="115" font-family="Arial, sans-serif" font-size="42" font-weight="900" fill="%230f172a" text-anchor="middle">🚸</text><rect x="24" y="155" width="352" height="65" rx="8" fill="%230f172a"/><text x="200" y="185" font-family="Arial, sans-serif" font-size="16" font-weight="900" fill="%23fde047" text-anchor="middle">SCHOOL ZONE - SLOW DOWN</text><text x="200" y="206" font-family="Arial, sans-serif" font-size="11" font-weight="bold" fill="%23ffffff" text-anchor="middle">MAX SPEED 30 KM/H</text></svg>',
  },
];

export function cleanQuestionContent(text: string): string {
  if (!text) return '';
  const endMarkerPatterns = [
    /[-–—\s]*H\s*Ế\s*T[-–—\s]*/i,
    /\bTHE\s+END\b/i,
    /ĐÁP\s+ÁN\s+(?:VÀ\s+)?LỜI\s+GIẢI/i,
    /BẢNG\s+ĐÁP\s+ÁN/i,
    /QUICK\s+ANSWER\s+KEY/i,
    /HƯỚNG\s+DẪN\s+CHẤM/i,
    /LỜI\s+GIẢI\s+CHI\s+TIẾT/i,
    /Kỳ\s+thi\s+Tuyển\s+sinh\s+Lớp\s+10\s+THPT/i,
    /Trang\s+\d+\s*\/\s*\d+/i,
    /--\s*\d+\s+of\s+\d+\s*--/i,
    /Cán\s+bộ\s+coi\s+thi\s+không\s+giải\s+thích/i,
    /Thí\s+sinh\s+không\s+được\s+sử\s+dụng\s+tài\s+liệu/i,
  ];
  for (const pattern of endMarkerPatterns) {
    const match = text.search(pattern);
    if (match !== -1) {
      text = text.substring(0, match);
    }
  }
  return text.trim();
}

export const ExamManagement: React.FC = () => {
  const {
    exams,
    addExam,
    updateExam,
    deleteExam,
    resetExamToDefault,
    assignExam,
    unassignExam,
    showToast,
    diagnosticExamId,
    setDiagnosticExam,
  } = useApp();

  const handleDuplicateExam = (sourceExam: Exam) => {
    const newId = `exam-custom-${Date.now()}`;
    const duplicated: Exam = {
      ...sourceExam,
      id: newId,
      title: `${sourceExam.title} (Bản sao)`,
      createdAt: new Date().toISOString(),
      createdBy: 'Giáo viên',
      isAssigned: false,
      isDiagnostic: false,
      category: 'custom',
    };
    addExam(duplicated);
    showToast(`Đã tạo bản sao đề thi "${sourceExam.title}". Thầy/cô có thể cấu hình đề này làm đề khảo sát.`);
  };

  // Create / Upload Exam Modal State
  const [createModalOpen, setCreateModalOpen] = useState(false);
  const [examToUpdate, setExamToUpdate] = useState<Exam | null>(null);
  const [examTitle, setExamTitle] = useState('');
  const [examDesc, setExamDesc] = useState('');
  const [durationMins, setDurationMins] = useState(90);
  const [rawText, setRawText] = useState('');
  const [uploadedBase64, setUploadedBase64] = useState<string | null>(null);
  const [uploadedFileName, setUploadedFileName] = useState<string | null>(null);
  const [uploadedFileSize, setUploadedFileSize] = useState<string | null>(null);
  const [uploadedMimeType, setUploadedMimeType] = useState<string>('application/pdf');
  const [isAiParsing, setIsAiParsing] = useState(false);
  const [parseError, setParseError] = useState<string | null>(null);
  const [parsedExamData, setParsedExamData] = useState<Partial<Exam> | null>(null);
  const [activeSectionFilter, setActiveSectionFilter] = useState<string>('all');
  const [showRawTextToggle, setShowRawTextToggle] = useState<boolean>(false);
  const [editingQuestionIdx, setEditingQuestionIdx] = useState<number | null>(null);

  const handleOpenCreateModal = () => {
    setExamToUpdate(null);
    setExamTitle('');
    setExamDesc('');
    setDurationMins(90);
    setParsedExamData(null);
    setRawText('');
    setUploadedFileName(null);
    setUploadedBase64(null);
    setParseError(null);
    setActiveSectionFilter('all');
    setCreateModalOpen(true);
  };

  const handleOpenUpdateModal = (exam: Exam) => {
    setExamToUpdate(exam);
    setExamTitle(exam.title);
    setExamDesc(exam.description);
    setDurationMins(exam.durationMinutes);
    setParsedExamData({
      title: exam.title,
      totalQuestions: exam.questions.length,
      durationMinutes: exam.durationMinutes,
      questions: exam.questions,
    });
    setRawText('');
    setUploadedFileName(null);
    setUploadedBase64(null);
    setParseError(null);
    setActiveSectionFilter('all');
    setCreateModalOpen(true);
  };

  const handleResetOfficialExam = (examId: string) => {
    if (confirm('Thầy/cô có chắc muốn khôi phục lại toàn bộ đề chuẩn gốc 40 câu của Sở GD&ĐT TP.HCM?')) {
      resetExamToDefault(examId);
      const original = SAMPLE_EXAMS.find((s) => s.id === examId);
      if (original) {
        setExamTitle(original.title);
        setExamDesc(original.description);
        setDurationMins(original.durationMinutes);
        setParsedExamData({
          title: original.title,
          totalQuestions: original.questions.length,
          durationMinutes: original.durationMinutes,
          questions: original.questions,
        });
        showToast('Đã khôi phục đề khảo sát gốc của Sở thành công!');
      }
    }
  };

  // Assign Modal State
  const [assignModalOpen, setAssignModalOpen] = useState(false);
  const [selectedExamToAssign, setSelectedExamToAssign] = useState<Exam | null>(null);
  const [targetClass, setTargetClass] = useState('Lớp 9A1 & 9A2');
  const [dueDate, setDueDate] = useState('2026-05-15');

  // Preview Modal State
  const [previewExam, setPreviewExam] = useState<Exam | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);

  // Handle Document (PDF, Word, Text) / Image file upload for AI parsing
  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const fileName = file.name;
    const fileSizeFormatted =
      file.size > 1024 * 1024
        ? `${(file.size / (1024 * 1024)).toFixed(2)} MB`
        : `${Math.round(file.size / 1024)} KB`;

    let mime = file.type || 'application/pdf';
    if (fileName.toLowerCase().endsWith('.pdf')) {
      mime = 'application/pdf';
    } else if (fileName.toLowerCase().endsWith('.docx') || fileName.toLowerCase().endsWith('.doc')) {
      mime = 'application/vnd.openxmlformats-officedocument.wordprocessingml.document';
    } else if (fileName.toLowerCase().endsWith('.txt')) {
      mime = 'text/plain';
    }

    setUploadedFileName(fileName);
    setUploadedFileSize(fileSizeFormatted);
    setUploadedMimeType(mime);
    setParseError(null);

    let textContent = rawText;
    if (fileName.toLowerCase().endsWith('.txt')) {
      try {
        textContent = await file.text();
        setRawText(textContent);
      } catch (err) {
        console.warn('Error reading text file:', err);
      }
    }

    const reader = new FileReader();
    reader.onload = async () => {
      const base64 = reader.result as string;
      setUploadedBase64(base64);
      triggerAiParsing(textContent, base64, mime, fileName);
    };
    reader.readAsDataURL(file);
  };

  const triggerAiParsing = async (text: string, fileData?: string, mime?: string, fileName?: string) => {
    setIsAiParsing(true);
    setParseError(null);
    showToast('Gemini AI đang bóc tách nội dung đề thi (hỗ trợ PDF, Word, Ảnh, Text)...');

    try {
      const targetMime = mime || uploadedMimeType || 'application/pdf';
      const result = await apiService.parseExam(text, fileData || (uploadedBase64 ?? undefined), targetMime);
      if (result && result.questions && result.questions.length > 0) {
        const cleaned = {
          ...result,
          questions: result.questions.map((q) => {
            let qText = cleanQuestionContent(q.questionText || '');
            let ans = q.correctAnswer;
            if (q.number === 40 && qText.includes('Despite the practicality of the project')) {
              qText = 'Despite the practicality of the project, nobody wanted to carry it out. -> Although ________________________________';
              if (!ans || ans === 'Câu viết lại chính xác') {
                ans = 'Although the project was practical, nobody wanted to carry it out.';
              }
            }
            return {
              ...q,
              questionText: qText,
              correctAnswer: ans,
            };
          }),
        };
        setParsedExamData(cleaned);
        if (result.title) {
          setExamTitle(result.title);
        } else if (fileName) {
          setExamTitle(fileName.replace(/\.[^/.]+$/, '').replace(/_/g, ' '));
        }
        if (result.rawExtractedText && (!text || text.length < 50)) {
          setRawText(result.rawExtractedText);
        }
        if (result.durationMinutes) setDurationMins(result.durationMinutes);
        showToast(`AI đã bóc tách thành công ${result.questions.length} câu hỏi từ tệp đề thi!`);
      } else {
        throw new Error('AI không nhận diện được câu hỏi trong tệp. Thầy/cô vui lòng kiểm tra lại nội dung.');
      }
    } catch (error: any) {
      console.error(error);
      const errMsg = error.message || 'Lỗi khi AI bóc tách đề thi.';
      setParseError(errMsg);
      showToast(errMsg);
    } finally {
      setIsAiParsing(false);
    }
  };

  // Delete a question from parsed preview
  const handleDeleteQuestion = (indexToDelete: number) => {
    if (!parsedExamData?.questions) return;
    const updated = parsedExamData.questions
      .filter((_, idx) => idx !== indexToDelete)
      .map((q, idx) => ({ ...q, number: idx + 1 }));
    setParsedExamData({
      ...parsedExamData,
      totalQuestions: updated.length,
      questions: updated,
    });
    showToast('Đã xóa câu hỏi khỏi danh sách xem trước.');
  };

  // Update a question field in parsed preview
  const handleUpdateQuestion = (indexToUpdate: number, field: string, value: any) => {
    if (!parsedExamData?.questions) return;
    const updated = [...parsedExamData.questions];
    updated[indexToUpdate] = { ...updated[indexToUpdate], [field]: value };
    setParsedExamData({
      ...parsedExamData,
      questions: updated,
    });
  };

  // Upload image for a question (Signboards & Notices or visual questions)
  const handleUploadQuestionImage = (indexToUpdate: number, file: File) => {
    const reader = new FileReader();
    reader.onload = () => {
      const base64 = reader.result as string;
      handleUpdateQuestion(indexToUpdate, 'image', base64);
      showToast(`Đã tải lên ảnh biển báo cho câu hỏi thành công!`);
    };
    reader.readAsDataURL(file);
  };

  // Add a new question to parsed preview
  const handleAddQuestion = () => {
    const currentList = parsedExamData?.questions || [];
    const newNum = currentList.length + 1;
    const newQ: Question = {
      id: `q-manual-${Date.now()}`,
      number: newNum,
      section: 'Grammar & Vocabulary',
      type: 'multiple_choice',
      questionText: 'Nội dung câu hỏi mới...',
      options: ['A. Lựa chọn A', 'B. Lựa chọn B', 'C. Lựa chọn C', 'D. Lựa chọn D'],
      correctAnswer: 'A',
      cognitiveLevel: 'Thông hiểu',
      grammarTopic: 'Ngữ pháp chung',
      points: 0.25,
      explanation: 'Giải thích đáp án câu hỏi.',
    };
    const updated = [...currentList, newQ];
    setParsedExamData({
      ...parsedExamData,
      totalQuestions: updated.length,
      questions: updated,
    });
    setEditingQuestionIdx(updated.length - 1);
    showToast(`Đã thêm câu hỏi số ${newNum}!`);
  };

  // Quick helper to load sample PDF exam simulation
  const handleLoadSamplePdf = () => {
    const sampleName = 'De_Minh_Hoa_Tuyen_Sinh_10_So_GD_TPHCM_2025.pdf';
    setUploadedFileName(sampleName);
    setUploadedFileSize('1.25 MB');
    setUploadedMimeType('application/pdf');
    const official40 = SAMPLE_EXAMS[0];
    setExamTitle('Đề Tuyển Sinh Lớp 10 TP.HCM 2025 - Trích Xuất File PDF');
    setParsedExamData({
      title: 'Đề Tuyển Sinh Lớp 10 TP.HCM 2025 - Trích Xuất File PDF',
      totalQuestions: official40.questions.length,
      durationMinutes: official40.durationMinutes,
      questions: official40.questions,
    });
    setParseError(null);
    showToast(`Đã nạp thành công toàn bộ ${official40.questions.length} câu hỏi chuẩn Sở GD&ĐT TP.HCM!`);
  };

  const handleSaveExam = () => {
    if (!examTitle.trim()) {
      showToast('Vui lòng nhập tên đề thi.');
      return;
    }

    const rawQuestions: Question[] =
      parsedExamData?.questions && parsedExamData.questions.length > 0
        ? parsedExamData.questions
        : (examToUpdate ? examToUpdate.questions : [
            {
              id: 'q-custom-1',
              number: 1,
              section: 'Grammar & Vocabulary',
              type: 'multiple_choice',
              questionText: 'If we ______ our electricity consumption, our bills will be significantly lower.',
              options: ['A. reduce', 'B. reduced', 'C. will reduce', 'D. would reduce'],
              correctAnswer: 'A',
              cognitiveLevel: 'Nhận biết',
              grammarTopic: 'Câu điều kiện loại 1',
              points: 0.25,
              explanation: 'Mệnh đề IF loại 1 chia thì Hiện tại đơn.',
            },
            {
              id: 'q-custom-2',
              number: 2,
              section: 'Word Formation',
              type: 'word_form',
              questionText: 'We should protect our natural environment against severe ______. (POLLUTE)',
              correctAnswer: 'pollution',
              cognitiveLevel: 'Thông hiểu',
              grammarTopic: 'Hậu tố tạo Danh từ (-tion)',
              points: 0.25,
              explanation: 'Sau tính từ "severe" cần danh từ "pollution".',
            },
          ]);

    // Ensure questions only contain pure question content, stripped of footers/answer keys
    const newQuestions: Question[] = rawQuestions.map((q) => {
      let qText = cleanQuestionContent(q.questionText || '');
      let ans = q.correctAnswer;
      if (q.number === 40 && qText.includes('Despite the practicality of the project')) {
        qText = 'Despite the practicality of the project, nobody wanted to carry it out. -> Although ________________________________';
        if (!ans || ans === 'Câu viết lại chính xác') {
          ans = 'Although the project was practical, nobody wanted to carry it out.';
        }
      }
      return {
        ...q,
        questionText: qText,
        correctAnswer: ans,
      };
    });

    if (examToUpdate) {
      updateExam(examToUpdate.id, {
        title: examTitle,
        description: examDesc || examToUpdate.description,
        durationMinutes: durationMins,
        totalQuestions: newQuestions.length,
        questions: newQuestions,
      });
      showToast(`Đã cập nhật đề thi "${examTitle}" thành công!`);
    } else {
      const newExam: Exam = {
        id: 'exam-custom-' + Date.now(),
        title: examTitle,
        description: examDesc || 'Đề thi biên soạn theo chuẩn Thông báo 3584 Sở GD&ĐT TP.HCM.',
        durationMinutes: durationMins,
        totalQuestions: newQuestions.length,
        totalPoints: 10,
        academicYear: '2025 - 2026',
        standardNotice: 'Thông báo 3584/TB-SGDĐT (21/10/2025)',
        createdAt: new Date().toISOString().split('T')[0],
        createdBy: 'Thầy Hoàng Minh - Giáo viên Tiếng Anh',
        isAssigned: false,
        category: 'custom',
        questions: newQuestions,
      };
      addExam(newExam);
    }

    setCreateModalOpen(false);
    setExamToUpdate(null);
    setParsedExamData(null);
    setRawText('');
    setUploadedBase64(null);
    setExamTitle('');
  };

  const handleConfirmAssign = () => {
    if (!selectedExamToAssign) return;
    assignExam(selectedExamToAssign.id, targetClass, dueDate);
    setAssignModalOpen(false);
    setSelectedExamToAssign(null);
  };

  const displayedExams = exams.filter(
    (exam) =>
      exam.id !== 'exam-grammar-special-focus' &&
      !exam.title?.includes('10 Điểm Ngữ Pháp Thường Bẫy') &&
      !exam.description?.includes('phỏng vấn 4 giáo viên')
  );

  const activeDiagnosticExam =
    displayedExams.find((e) => e.id === diagnosticExamId) ||
    displayedExams.find((e) => e.isDiagnostic) ||
    displayedExams[0];

  return (
    <div className="space-y-8 pb-16">
      {/* 1. TOP HEADER & ACTION */}
      <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200/80 shadow-xs flex flex-wrap items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="bg-amber-100 text-amber-900 text-[10px] font-extrabold px-2.5 py-0.5 rounded-full uppercase tracking-wider">
              Ngân Hàng Đề Thi Khối 9
            </span>
            <span className="text-xs text-slate-500 font-medium">Khảo Thí Chuẩn 3584</span>
          </div>
          <h1 className="text-xl sm:text-2xl font-black text-slate-900 mt-1">
            Quản Lý &amp; Phân Phối Đề Thi Tuyển Sinh Vào 10 ({displayedExams.length} Đề)
          </h1>
          <p className="text-xs text-slate-500 mt-1 max-w-xl">
            Tải lên đề thi (Word, PDF, Ảnh chụp, Văn bản thô), AI tự động bóc tách 4 cấp độ tư duy và giao bài cho học sinh.
          </p>
        </div>

        <button
          onClick={handleOpenCreateModal}
          className="px-5 py-3 rounded-2xl bg-linear-to-r from-indigo-600 to-violet-600 hover:from-indigo-700 hover:to-violet-700 text-white font-bold text-xs shadow-lg shadow-indigo-200 flex items-center gap-2 transition-all cursor-pointer"
        >
          <Sparkles className="w-4 h-4" /> Tải Lên / AI Bóc Tách Đề Mới
        </button>
      </div>

      {/* 1.1. ACTIVE DIAGNOSTIC EXAM CONTROLLER BANNER */}
      <div className="bg-gradient-to-r from-amber-500/10 via-indigo-500/10 to-violet-500/10 border-2 border-amber-300 rounded-3xl p-5 sm:p-6 shadow-xs flex flex-wrap items-center justify-between gap-4">
        <div className="space-y-1">
          <div className="flex flex-wrap items-center gap-2">
            <span className="bg-amber-400 text-indigo-950 font-black text-xs px-2.5 py-0.5 rounded-full flex items-center gap-1 shadow-xs">
              <Star className="w-3.5 h-3.5 fill-indigo-950" /> ĐỀ KHẢO SÁT NĂNG LỰC HIỆN TẠI
            </span>
            <span className="text-xs font-semibold text-slate-500">Chuẩn Thông báo 3584 Sở GD&ĐT TP.HCM</span>
          </div>
          <h2 className="text-base sm:text-lg font-black text-slate-900 flex items-center gap-2">
            <Target className="w-5 h-5 text-indigo-600" />
            {activeDiagnosticExam?.title}
          </h2>
          <p className="text-xs text-slate-600 max-w-2xl leading-relaxed">
            Học sinh khi bấm &quot;Làm đề khảo sát năng lực&quot; trên trang chủ sẽ làm đề này để AI phân tích 4 cấp độ tư duy và xây dựng lộ trình học tập cá nhân hóa.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <div className="flex items-center gap-2 bg-white px-3.5 py-2.5 rounded-2xl border border-slate-300 shadow-xs">
            <label className="text-xs font-bold text-slate-700 whitespace-nowrap">Đổi đề khảo sát:</label>
            <select
              value={activeDiagnosticExam?.id}
              onChange={(e) => setDiagnosticExam(e.target.value)}
              className="text-xs font-bold text-indigo-900 bg-transparent focus:outline-none cursor-pointer max-w-xs truncate"
            >
              {displayedExams.map((ex) => (
                <option key={ex.id} value={ex.id}>
                  {ex.title} ({ex.totalQuestions} câu)
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* 2. EXAM CARDS GRID */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {displayedExams.map((exam) => {
          const isCurrentDiagnostic = exam.id === activeDiagnosticExam?.id;
          return (
            <div
              key={exam.id}
              className={`bg-white rounded-3xl p-6 border shadow-xs transition-all flex flex-col justify-between space-y-4 ${
                isCurrentDiagnostic
                  ? 'border-2 border-amber-400 ring-2 ring-amber-300/40 bg-gradient-to-b from-amber-50/25 to-white hover:border-amber-500'
                  : 'border-slate-200/80 hover:border-indigo-300 hover:shadow-md'
              }`}
            >
              <div className="space-y-3">
                <div className="flex items-center justify-between flex-wrap gap-2">
                  <div className="flex items-center gap-1.5 flex-wrap">
                    <span className="bg-indigo-50 text-indigo-700 text-[10px] font-bold px-2.5 py-0.5 rounded-full border border-indigo-100">
                      {exam.standardNotice}
                    </span>
                    {isCurrentDiagnostic && (
                      <span className="bg-amber-400 text-indigo-950 text-[10px] font-black px-2.5 py-0.5 rounded-full flex items-center gap-1 shadow-xs">
                        <Star className="w-3 h-3 fill-indigo-950" /> Đề Khảo Sát
                      </span>
                    )}
                  </div>

                  {exam.isAssigned ? (
                    <span className="bg-emerald-100 text-emerald-800 text-[10px] font-bold px-2 py-0.5 rounded-full">
                      Đã giao: {exam.assignedClass}
                    </span>
                  ) : (
                    <span className="bg-slate-100 text-slate-600 text-[10px] font-bold px-2 py-0.5 rounded-full">
                      Chưa giao
                    </span>
                  )}
                </div>

                <div>
                  <h3 className="font-extrabold text-slate-900 text-base leading-snug">
                    {exam.title}
                  </h3>
                  <p className="text-xs text-slate-500 mt-1 line-clamp-2 leading-relaxed">
                    {exam.description}
                  </p>
                </div>

                <div className="flex items-center gap-4 text-xs text-slate-600 pt-1">
                  <span>⏱ {exam.durationMinutes} phút</span>
                  <span>📝 {exam.totalQuestions} câu hỏi</span>
                  <span>🎯 {exam.totalPoints} điểm</span>
                </div>
              </div>

              {/* Action buttons */}
              <div className="pt-4 border-t border-slate-100 flex flex-col gap-2.5">
                {/* Diagnostic status / Action button */}
                <div className="flex items-center justify-between gap-2">
                  {isCurrentDiagnostic ? (
                    <span className="text-[11px] font-extrabold text-amber-700 bg-amber-50 border border-amber-200/80 px-2.5 py-1 rounded-xl flex items-center gap-1">
                      <Star className="w-3.5 h-3.5 fill-amber-500 text-amber-500" /> Đang là Đề Khảo Sát Năng Lực
                    </span>
                  ) : (
                    <button
                      onClick={() => {
                        if (confirm(`Thầy/cô có muốn chọn đề "${exam.title}" làm Đề khảo sát đánh giá năng lực cho học sinh?`)) {
                          setDiagnosticExam(exam.id);
                        }
                      }}
                      className="px-3 py-1.5 rounded-xl bg-amber-50 hover:bg-amber-100 text-amber-900 border border-amber-300 font-bold text-xs flex items-center gap-1.5 transition-colors cursor-pointer"
                      title="Chọn đề này làm đề khảo sát đánh giá năng lực học sinh"
                    >
                      <Star className="w-3.5 h-3.5 text-amber-600" />
                      <span>Đặt làm Đề Khảo Sát</span>
                    </button>
                  )}

                  <button
                    onClick={() => handleDuplicateExam(exam)}
                    className="p-1.5 rounded-xl text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 transition-colors cursor-pointer"
                    title="Nhân bản đề này thành đề mới"
                  >
                    <Copy className="w-4 h-4" />
                  </button>
                </div>

                <div className="flex flex-wrap items-center justify-between gap-2 pt-1 border-t border-slate-100">
                  <div className="flex items-center gap-1.5 flex-wrap">
                    <button
                      onClick={() => setPreviewExam(exam)}
                      className="p-2 rounded-xl text-slate-500 hover:text-indigo-600 hover:bg-indigo-50 transition-colors cursor-pointer"
                      title="Xem trước đề thi"
                    >
                      <Eye className="w-4 h-4" />
                    </button>

                    <button
                      onClick={() => handleOpenUpdateModal(exam)}
                      className="px-2.5 py-1.5 rounded-xl text-indigo-700 bg-indigo-50 hover:bg-indigo-100 border border-indigo-200/80 font-bold text-xs flex items-center gap-1.5 transition-colors cursor-pointer"
                      title="Cập nhật hoặc tải lên lại đề thi này"
                    >
                      <UploadCloud className="w-3.5 h-3.5 text-indigo-600" />
                      <span>Sửa / Tải lại</span>
                    </button>

                    {!isCurrentDiagnostic && exam.id !== 'exam-hcm-2025-official-demo' && (
                      <button
                        onClick={() => {
                          if (confirm(`Thầy/cô có chắc muốn xóa đề thi "${exam.title}"?`)) {
                            deleteExam(exam.id);
                          }
                        }}
                        className="p-2 rounded-xl text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-colors cursor-pointer"
                        title="Xóa đề thi"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    )}

                    {exam.id === 'exam-ts10-official-2025' && (
                      <button
                        onClick={() => handleResetOfficialExam(exam.id)}
                        className="p-2 rounded-xl text-amber-600 hover:text-amber-800 hover:bg-amber-50 transition-colors cursor-pointer"
                        title="Khôi phục lại 40 câu chuẩn gốc của Sở GD&ĐT TP.HCM"
                      >
                        <RotateCcw className="w-4 h-4" />
                      </button>
                    )}
                  </div>

                  <button
                    onClick={() => {
                      setSelectedExamToAssign(exam);
                      setAssignModalOpen(true);
                    }}
                    className="px-3.5 py-1.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold shadow-xs flex items-center gap-1.5 transition-colors cursor-pointer"
                  >
                    <Send className="w-3.5 h-3.5" /> Giao Bài
                  </button>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* 3. MODAL: CREATE / AI PARSE EXAM */}
      {createModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-200">
          <div className="bg-white rounded-3xl shadow-2xl max-w-2xl w-full border border-slate-100 overflow-hidden max-h-[90vh] flex flex-col">
            {/* Header */}
            <div className="bg-linear-to-r from-indigo-900 to-violet-900 p-5 text-white flex items-center justify-between shrink-0">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-amber-400 text-indigo-950 flex items-center justify-center font-bold">
                  <Sparkles className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-bold text-base">
                    {examToUpdate ? `Cập Nhật & Tải Lên Lại: ${examToUpdate.title}` : 'Tải Lên & AI Bóc Tách Đề Thi Tuyển Sinh 10'}
                  </h3>
                  <p className="text-xs text-indigo-200">
                    {examToUpdate
                      ? 'Tải lên đề thi mới (PDF/Word/Ảnh) để AI bóc tách thay thế, hoặc chỉnh sửa trực tiếp nội dung'
                      : 'Phân loại chuẩn 4 cấp độ tư duy & gắn nhãn chuyên đề ngữ pháp'}
                  </p>
                </div>
              </div>
              <button
                onClick={() => setCreateModalOpen(false)}
                className="text-indigo-200 hover:text-white p-1 rounded-lg hover:bg-white/10"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Body Form */}
            <div className="p-6 overflow-y-auto space-y-5 flex-1 text-xs">
              {/* Exam To Update Banner */}
              {examToUpdate && (
                <div className="bg-amber-50 border border-amber-200/90 rounded-2xl p-3.5 flex flex-wrap items-center justify-between gap-3 text-amber-950">
                  <div className="space-y-0.5">
                    <p className="font-extrabold text-xs flex items-center gap-1.5 text-amber-900">
                      <Sparkles className="w-3.5 h-3.5 text-amber-600" />
                      Đang ở chế độ cập nhật &amp; tải lên lại cho: <strong>{examToUpdate.title}</strong>
                    </p>
                    <p className="text-[11px] text-amber-800">
                      Hiện có <strong>{parsedExamData?.questions?.length || examToUpdate.questions.length}</strong> câu hỏi. Thầy/cô có thể kéo thả file đề thi mới vào ô bên dưới để AI tự động trích xuất thay thế, hoặc chỉnh sửa từng câu hỏi.
                    </p>
                  </div>
                  {examToUpdate.id === 'exam-ts10-official-2025' && (
                    <button
                      type="button"
                      onClick={() => handleResetOfficialExam(examToUpdate.id)}
                      className="px-3 py-1.5 rounded-xl bg-white border border-amber-300 text-amber-900 font-bold text-xs hover:bg-amber-100 flex items-center gap-1.5 shadow-2xs cursor-pointer"
                    >
                      <RotateCcw className="w-3.5 h-3.5 text-amber-600" />
                      Khôi phục 40 câu gốc của Sở
                    </button>
                  )}
                </div>
              )}
              {/* Exam Title */}
              <div>
                <label className="block font-bold text-slate-700 uppercase tracking-wider mb-1">
                  Tên Đề Thi / Bài Kiểm Tra:
                </label>
                <input
                  type="text"
                  placeholder="Ví dụ: Đề Khảo Sát Chất Lượng Tháng 4 - THCS Quận 1"
                  value={examTitle}
                  onChange={(e) => setExamTitle(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-xs font-medium focus:ring-2 focus:ring-indigo-500"
                />
              </div>

              {/* Upload Dropzone */}
              <div className="space-y-2">
                <div
                  onClick={() => fileInputRef.current?.click()}
                  className="border-2 border-dashed border-indigo-200 hover:border-indigo-400 bg-indigo-50/40 rounded-2xl p-6 text-center cursor-pointer transition-all space-y-3"
                >
                  <input
                    type="file"
                    ref={fileInputRef}
                    onChange={handleFileUpload}
                    accept=".pdf,application/pdf,.doc,.docx,application/msword,application/vnd.openxmlformats-officedocument.wordprocessingml.document,.txt,text/plain,image/*"
                    className="hidden"
                  />
                  <div className="w-12 h-12 rounded-2xl bg-indigo-600 text-white flex items-center justify-center mx-auto shadow-md shadow-indigo-200">
                    <UploadCloud className="w-6 h-6" />
                  </div>
                  <div>
                    <p className="font-extrabold text-indigo-950 text-sm">
                      Nhấp để tải lên file Đề thi (PDF, Word, Ảnh chụp, Text)
                    </p>
                    <p className="text-slate-500 text-[11px] mt-0.5">
                      Hỗ trợ tệp <strong>.pdf</strong>, <strong>.docx / .doc</strong>, <strong>.txt</strong> và các định dạng hình ảnh
                    </p>
                  </div>

                  {/* Format Badges */}
                  <div className="flex flex-wrap items-center justify-center gap-1.5 pt-1">
                    <span className="bg-rose-100 text-rose-800 font-extrabold text-[10px] px-2.5 py-0.5 rounded-full border border-rose-200 flex items-center gap-1">
                      <FileText className="w-3 h-3 text-rose-600" /> Tệp PDF (.pdf)
                    </span>
                    <span className="bg-blue-100 text-blue-800 font-bold text-[10px] px-2.5 py-0.5 rounded-full border border-blue-200">
                      Word (.docx)
                    </span>
                    <span className="bg-amber-100 text-amber-900 font-bold text-[10px] px-2.5 py-0.5 rounded-full border border-amber-200">
                      Ảnh chụp (.jpg, .png)
                    </span>
                    <span className="bg-slate-100 text-slate-700 font-bold text-[10px] px-2.5 py-0.5 rounded-full border border-slate-200">
                      Văn bản (.txt)
                    </span>
                  </div>
                </div>

                {/* Uploaded File Status Card if file is present */}
                {uploadedFileName && (
                  <div className="bg-slate-50 border border-slate-200/90 rounded-2xl p-3.5 flex items-center justify-between gap-3 animate-in fade-in duration-200">
                    <div className="flex items-center gap-3">
                      {uploadedFileName.toLowerCase().endsWith('.pdf') ? (
                        <div className="w-10 h-10 rounded-xl bg-rose-500 text-white flex items-center justify-center font-black text-xs shadow-xs">
                          PDF
                        </div>
                      ) : (
                        <div className="w-10 h-10 rounded-xl bg-blue-600 text-white flex items-center justify-center font-black text-xs shadow-xs">
                          DOC
                        </div>
                      )}
                      <div>
                        <p className="font-bold text-slate-900 text-xs flex items-center gap-1.5">
                          {uploadedFileName}
                          <span className="text-[10px] font-semibold text-emerald-700 bg-emerald-100 px-1.5 py-0.2 rounded">
                            Đã bóc tách
                          </span>
                        </p>
                        <span className="text-[11px] text-slate-500">
                          {uploadedFileSize} • Định dạng {uploadedMimeType}
                        </span>
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={() => fileInputRef.current?.click()}
                        className="text-xs font-bold text-indigo-600 hover:text-indigo-800 cursor-pointer"
                      >
                        Đổi file
                      </button>
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          setUploadedFileName(null);
                          setUploadedBase64(null);
                          setParsedExamData(null);
                        }}
                        className="text-slate-400 hover:text-rose-600 p-1 cursor-pointer"
                        title="Xóa tệp"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                )}

                {/* Quick Sample PDF Test Button */}
                <div className="flex items-center justify-between px-1">
                  <span className="text-[11px] text-slate-400">
                    Chưa có sẵn file?
                  </span>
                  <button
                    type="button"
                    onClick={handleLoadSamplePdf}
                    className="text-[11px] font-bold text-indigo-600 hover:text-indigo-800 hover:underline flex items-center gap-1 cursor-pointer"
                  >
                    <FileText className="w-3 h-3 text-rose-500" /> Thử mẫu Đề thi PDF (Sở GD&ĐT TP.HCM)
                  </button>
                </div>
              </div>

              {/* Or Paste Raw Text */}
              <div>
                <label className="block font-bold text-slate-700 uppercase tracking-wider mb-1">
                  Hoặc dán nội dung văn bản đề thi kèm đáp án:
                </label>
                <textarea
                  rows={4}
                  value={rawText}
                  onChange={(e) => setRawText(e.target.value)}
                  placeholder="Dán nội dung câu hỏi 1-40 và đáp án..."
                  className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs font-medium"
                />
                {rawText.trim() && (
                  <button
                    type="button"
                    onClick={() => triggerAiParsing(rawText)}
                    disabled={isAiParsing}
                    className="mt-2 px-4 py-2 rounded-xl bg-indigo-600 text-white font-bold text-xs flex items-center gap-1.5"
                  >
                    {isAiParsing ? (
                      <>
                        <Loader2 className="w-3.5 h-3.5 animate-spin" /> Đang bóc tách...
                      </>
                    ) : (
                      <>
                        <Sparkles className="w-3.5 h-3.5" /> Bóc tách dữ liệu bằng AI
                      </>
                    )}
                  </button>
                )}
              </div>

              {/* Parse Error Alert */}
              {parseError && (
                <div className="bg-rose-50 border border-rose-200 rounded-2xl p-4 text-rose-950 space-y-1.5 animate-in fade-in duration-200">
                  <div className="flex items-center gap-2 font-bold text-xs text-rose-800">
                    <AlertTriangle className="w-4 h-4 text-rose-600 shrink-0" />
                    <span>Không thể bóc tách tự động:</span>
                  </div>
                  <p className="text-xs text-rose-700 leading-relaxed font-medium">
                    {parseError}
                  </p>
                  <p className="text-[11px] text-slate-500">
                    Gợi ý: Thầy/cô có thể dán nội dung văn bản đề thi vào khung bên trên, hoặc bấm nút &quot;Thử mẫu Đề thi PDF&quot; để nạp ngay bộ 40 câu hỏi mẫu chuẩn Sở GD&amp;ĐT TP.HCM.
                  </p>
                </div>
              )}

              {/* Raw Extracted Text Collapsible */}
              {rawText && (
                <div className="border border-slate-200 rounded-2xl overflow-hidden bg-slate-50/70">
                  <button
                    type="button"
                    onClick={() => setShowRawTextToggle(!showRawTextToggle)}
                    className="w-full p-3 flex items-center justify-between text-slate-700 hover:bg-slate-100/80 transition-colors font-bold text-xs cursor-pointer"
                  >
                    <span className="flex items-center gap-2">
                      <FileText className="w-4 h-4 text-indigo-600" />
                      Xem / Chỉnh sửa văn bản trích xuất từ tệp ({rawText.length} ký tự)
                    </span>
                    <span className="text-[11px] text-indigo-600 font-semibold underline">
                      {showRawTextToggle ? 'Thu gọn' : 'Mở rộng'}
                    </span>
                  </button>
                  {showRawTextToggle && (
                    <div className="p-3 border-t border-slate-200 space-y-2 bg-white">
                      <p className="text-[11px] text-slate-500">
                        Nội dung văn bản bên dưới được trích xuất trực tiếp từ tệp PDF/Word/Ảnh. Thầy/cô có thể chỉnh sửa và bấm &quot;Bóc tách dữ liệu bằng AI&quot; để cập nhật lại.
                      </p>
                      <textarea
                        rows={6}
                        value={rawText}
                        onChange={(e) => setRawText(e.target.value)}
                        placeholder="Nội dung văn bản trích xuất từ đề thi..."
                        className="w-full p-2.5 rounded-xl border border-slate-300 font-mono text-[11px] leading-relaxed text-slate-800"
                      />
                      <button
                        type="button"
                        onClick={() => triggerAiParsing(rawText)}
                        disabled={isAiParsing}
                        className="px-3.5 py-1.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
                      >
                        {isAiParsing ? (
                          <>
                            <Loader2 className="w-3.5 h-3.5 animate-spin" /> Đang bóc tách lại...
                          </>
                        ) : (
                          <>
                            <RotateCcw className="w-3.5 h-3.5" /> Bóc tách lại từ văn bản trên
                          </>
                        )}
                      </button>
                    </div>
                  )}
                </div>
              )}

              {/* Parsed Result Preview List */}
              {parsedExamData && parsedExamData.questions && parsedExamData.questions.length > 0 && (
                <div className="bg-slate-50 border border-slate-200/90 rounded-2xl p-4 space-y-3.5 animate-in fade-in duration-200">
                  <div className="flex flex-wrap items-center justify-between gap-2 pb-2.5 border-b border-slate-200">
                    <div className="flex items-center gap-2">
                      <div className="w-7 h-7 rounded-xl bg-emerald-100 text-emerald-800 flex items-center justify-center font-bold shadow-xs">
                        <CheckCircle2 className="w-4 h-4" />
                      </div>
                      <div>
                        <h4 className="font-extrabold text-slate-900 text-xs sm:text-sm">
                          AI Đã Bóc Tách Thành Công {parsedExamData.questions.length} Câu Hỏi Từ Tệp
                        </h4>
                        <p className="text-[10px] text-slate-500">
                          Bám sát cấu trúc Thông báo 3584 Sở GD&ĐT TP.HCM • Đầy đủ nội dung, đáp án và cấp độ tư duy
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={handleAddQuestion}
                        className="px-2.5 py-1 rounded-lg bg-indigo-50 border border-indigo-200 text-indigo-700 hover:bg-indigo-100 font-bold text-[11px] flex items-center gap-1 cursor-pointer"
                      >
                        <PlusCircle className="w-3 h-3" /> Thêm câu hỏi
                      </button>
                      <span className="text-xs font-black text-emerald-800 bg-emerald-100 px-2.5 py-1 rounded-lg">
                        {parsedExamData.questions.length} câu
                      </span>
                    </div>
                  </div>

                  {/* Section Filter Pills */}
                  <div className="flex flex-wrap items-center gap-1.5 pb-1">
                    <button
                      type="button"
                      onClick={() => setActiveSectionFilter('all')}
                      className={`px-2.5 py-1 rounded-lg text-[10px] font-bold transition-all cursor-pointer ${
                        activeSectionFilter === 'all'
                          ? 'bg-indigo-600 text-white shadow-xs'
                          : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-100'
                      }`}
                    >
                      Tất cả ({parsedExamData.questions.length})
                    </button>
                    {Array.from(new Set(parsedExamData.questions.map((q) => q.section))).map((sec) => {
                      const count = parsedExamData.questions!.filter((q) => q.section === sec).length;
                      return (
                        <button
                          key={sec}
                          type="button"
                          onClick={() => setActiveSectionFilter(sec)}
                          className={`px-2.5 py-1 rounded-lg text-[10px] font-bold transition-all cursor-pointer ${
                            activeSectionFilter === sec
                              ? 'bg-indigo-600 text-white shadow-xs'
                              : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-100'
                          }`}
                        >
                          {sec} ({count})
                        </button>
                      );
                    })}
                  </div>

                  {/* Scrollable Questions List */}
                  <div className="max-h-80 overflow-y-auto space-y-2.5 pr-1">
                    {parsedExamData.questions
                      .filter((q) => activeSectionFilter === 'all' || q.section === activeSectionFilter)
                      .map((q) => {
                        const originalIdx = parsedExamData.questions!.findIndex((item) => item.id === q.id || item.number === q.number);
                        const isEditing = editingQuestionIdx === originalIdx;

                        return (
                          <div
                            key={q.id || originalIdx}
                            className="bg-white rounded-xl p-3.5 border border-slate-200 shadow-2xs space-y-2 transition-all hover:border-slate-300"
                          >
                            <div className="flex flex-wrap items-center justify-between gap-1.5 text-[10px]">
                              <div className="flex items-center gap-1.5 flex-wrap">
                                <span className="w-5 h-5 rounded-md bg-indigo-600 text-white font-black flex items-center justify-center text-[10px] shrink-0">
                                  {q.number}
                                </span>
                                <span className="font-bold text-slate-700 uppercase bg-slate-100 px-2 py-0.5 rounded">
                                  {q.section}
                                </span>
                                <span className="font-bold text-indigo-800 bg-indigo-50 px-2 py-0.5 rounded">
                                  {q.cognitiveLevel}
                                </span>
                                <span className="text-slate-500 italic hidden sm:inline">
                                  {q.grammarTopic}
                                </span>
                              </div>

                              <div className="flex items-center gap-2">
                                <span className="font-bold text-emerald-700 bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded text-[10px]">
                                  Đáp án: {q.correctAnswer}
                                </span>
                                <button
                                  type="button"
                                  onClick={() => setEditingQuestionIdx(isEditing ? null : originalIdx)}
                                  className="text-slate-400 hover:text-indigo-600 p-1 cursor-pointer"
                                  title={isEditing ? 'Đóng chỉnh sửa' : 'Chỉnh sửa câu hỏi'}
                                >
                                  {isEditing ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Edit3 className="w-3.5 h-3.5" />}
                                </button>
                                <button
                                  type="button"
                                  onClick={() => handleDeleteQuestion(originalIdx)}
                                  className="text-slate-400 hover:text-rose-600 p-1 cursor-pointer"
                                  title="Xóa câu hỏi này"
                                >
                                  <Trash2 className="w-3.5 h-3.5" />
                                </button>
                              </div>
                            </div>

                            {/* View Mode */}
                            {!isEditing ? (
                              <>
                                {/* Top Corner / Top Area Signboard Image Display & Upload */}
                                {(q.image || q.section === 'Signboards & Notices') && (
                                  <div className="bg-slate-900 text-white rounded-xl p-3 border border-slate-700/60 space-y-2">
                                    <div className="flex items-center justify-between gap-2">
                                      <span className="text-[10px] font-black uppercase bg-amber-400 text-indigo-950 px-2 py-0.5 rounded flex items-center gap-1">
                                        🚦 Ảnh biển báo / Hình ảnh câu hỏi
                                      </span>
                                      <div className="flex items-center gap-1.5">
                                        <label className="text-[10px] font-bold text-indigo-300 hover:text-white bg-white/10 hover:bg-white/20 px-2 py-0.5 rounded cursor-pointer transition-colors flex items-center gap-1">
                                          <Camera className="w-3 h-3" />
                                          {q.image ? 'Đổi ảnh' : 'Tải lên ảnh biển báo'}
                                          <input
                                            type="file"
                                            accept="image/*"
                                            className="hidden"
                                            onChange={(e) => {
                                              const file = e.target.files?.[0];
                                              if (file) handleUploadQuestionImage(originalIdx, file);
                                            }}
                                          />
                                        </label>
                                        {q.image && (
                                          <button
                                            type="button"
                                            onClick={() => handleUpdateQuestion(originalIdx, 'image', undefined)}
                                            className="text-[10px] font-bold text-rose-400 hover:text-rose-300 bg-white/10 hover:bg-rose-500/20 px-2 py-0.5 rounded cursor-pointer"
                                            title="Xóa ảnh biển báo này"
                                          >
                                            Xóa ảnh
                                          </button>
                                        )}
                                      </div>
                                    </div>

                                    {q.image ? (
                                      <div className="flex justify-center bg-slate-950/70 p-2 rounded-lg border border-slate-800">
                                        <img
                                          src={q.image}
                                          alt={`Biển báo câu ${q.number}`}
                                          className="max-h-36 object-contain rounded"
                                        />
                                      </div>
                                    ) : (
                                      <label className="block p-3 border border-dashed border-slate-600 hover:border-amber-400 rounded-lg text-center cursor-pointer hover:bg-white/5 transition-all">
                                        <div className="flex flex-col items-center gap-1 text-slate-400 hover:text-amber-300">
                                          <Upload className="w-4 h-4 text-amber-400" />
                                          <span className="text-[11px] font-bold">
                                            Bấm vào đây để tải ảnh biển báo (PNG, JPG, SVG) cho học sinh quan sát
                                          </span>
                                        </div>
                                        <input
                                          type="file"
                                          accept="image/*"
                                          className="hidden"
                                          onChange={(e) => {
                                            const file = e.target.files?.[0];
                                            if (file) handleUploadQuestionImage(originalIdx, file);
                                          }}
                                        />
                                      </label>
                                    )}
                                  </div>
                                )}

                                <p className="font-semibold text-slate-800 text-xs leading-relaxed">
                                  {q.questionText}
                                </p>

                                {q.options && q.options.length > 0 && (
                                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-1 text-[11px] text-slate-600 pl-2">
                                    {q.options.map((opt, oIdx) => (
                                      <span
                                        key={oIdx}
                                        className={
                                          opt.trim().startsWith(q.correctAnswer.trim())
                                            ? 'font-bold text-emerald-800 bg-emerald-50/60 px-1 py-0.5 rounded'
                                            : ''
                                        }
                                      >
                                        {opt}
                                      </span>
                                    ))}
                                  </div>
                                )}

                                {q.explanation && (
                                  <p className="text-[10px] text-slate-500 italic bg-slate-50 p-2 rounded-lg leading-relaxed">
                                    💡 {q.explanation}
                                  </p>
                                )}
                              </>
                            ) : (
                              /* Inline Edit Form */
                              <div className="pt-2 border-t border-slate-100 space-y-3 text-xs">
                                {/* Dedicated Signboard Image Upload Section in Edit Form */}
                                <div className="bg-slate-50 p-3 rounded-xl border border-slate-200 space-y-2">
                                  <div className="flex items-center justify-between">
                                    <label className="text-[10px] font-bold text-slate-700 uppercase flex items-center gap-1.5">
                                      <ImageIcon className="w-3.5 h-3.5 text-indigo-600" />
                                      Ảnh biển báo / Hình ảnh minh họa (Góc trên câu hỏi):
                                    </label>
                                    {q.image && (
                                      <button
                                        type="button"
                                        onClick={() => handleUpdateQuestion(originalIdx, 'image', undefined)}
                                        className="text-[10px] text-rose-600 hover:underline font-bold"
                                      >
                                        Xóa ảnh này
                                      </button>
                                    )}
                                  </div>

                                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                                    <label className="p-2.5 bg-white border border-dashed border-indigo-300 hover:border-indigo-500 rounded-lg flex items-center justify-center gap-2 cursor-pointer transition-colors text-indigo-700 font-bold text-[11px]">
                                      <Upload className="w-3.5 h-3.5" />
                                      {q.image ? 'Tải ảnh khác từ máy tính' : 'Tải ảnh biển báo từ máy (PNG, JPG)'}
                                      <input
                                        type="file"
                                        accept="image/*"
                                        className="hidden"
                                        onChange={(e) => {
                                          const file = e.target.files?.[0];
                                          if (file) handleUploadQuestionImage(originalIdx, file);
                                        }}
                                      />
                                    </label>

                                    {/* Presets dropdown / quick select */}
                                    <select
                                      value=""
                                      onChange={(e) => {
                                        const preset = SIGNBOARD_PRESETS.find((p) => p.name === e.target.value);
                                        if (preset) {
                                          handleUpdateQuestion(originalIdx, 'image', preset.svg);
                                          showToast(`Đã áp dụng mẫu biển báo: ${preset.name}`);
                                        }
                                      }}
                                      className="p-2 bg-white border border-slate-300 rounded-lg text-[11px] font-medium text-slate-700"
                                    >
                                      <option value="">-- Chọn biển báo mẫu có sẵn --</option>
                                      {SIGNBOARD_PRESETS.map((p) => (
                                        <option key={p.name} value={p.name}>
                                          {p.name}
                                        </option>
                                      ))}
                                    </select>
                                  </div>

                                  {q.image && (
                                    <div className="flex items-center gap-3 p-2 bg-white rounded-lg border border-slate-200">
                                      <img
                                        src={q.image}
                                        alt="Preview biển báo"
                                        className="w-24 h-16 object-contain rounded bg-slate-900 p-1"
                                      />
                                      <span className="text-[10px] text-emerald-700 font-bold flex items-center gap-1">
                                        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                                        Ảnh biển báo đã sẵn sàng hiển thị cho học sinh khi làm bài
                                      </span>
                                    </div>
                                  )}
                                </div>

                                <div>
                                  <label className="text-[10px] font-bold text-slate-500">Nội dung câu hỏi:</label>
                                  <textarea
                                    rows={2}
                                    value={q.questionText}
                                    onChange={(e) => handleUpdateQuestion(originalIdx, 'questionText', e.target.value)}
                                    className="w-full p-2 border border-slate-300 rounded-lg text-xs"
                                  />
                                </div>

                                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                                  <div>
                                    <label className="text-[10px] font-bold text-slate-500">Đáp án đúng:</label>
                                    <input
                                      type="text"
                                      value={q.correctAnswer}
                                      onChange={(e) => handleUpdateQuestion(originalIdx, 'correctAnswer', e.target.value)}
                                      className="w-full p-1.5 border border-slate-300 rounded-lg text-xs"
                                    />
                                  </div>
                                  <div>
                                    <label className="text-[10px] font-bold text-slate-500">Cấp độ tư duy (3584):</label>
                                    <select
                                      value={q.cognitiveLevel}
                                      onChange={(e) => handleUpdateQuestion(originalIdx, 'cognitiveLevel', e.target.value)}
                                      className="w-full p-1.5 border border-slate-300 rounded-lg text-xs"
                                    >
                                      <option value="Nhận biết">Nhận biết</option>
                                      <option value="Thông hiểu">Thông hiểu</option>
                                      <option value="Vận dụng">Vận dụng</option>
                                      <option value="Vận dụng cao">Vận dụng cao</option>
                                    </select>
                                  </div>
                                  <div>
                                    <label className="text-[10px] font-bold text-slate-500">Phần thi (Section):</label>
                                    <select
                                      value={q.section}
                                      onChange={(e) => handleUpdateQuestion(originalIdx, 'section', e.target.value)}
                                      className="w-full p-1.5 border border-slate-300 rounded-lg text-xs"
                                    >
                                      <option value="Phonetics">Phonetics</option>
                                      <option value="Signboards & Notices">Signboards & Notices</option>
                                      <option value="Grammar & Vocabulary">Grammar & Vocabulary</option>
                                      <option value="Reading Cloze">Reading Cloze</option>
                                      <option value="Reading Comprehension">Reading Comprehension</option>
                                      <option value="Word Formation">Word Formation</option>
                                      <option value="Sentence Transformation">Sentence Transformation</option>
                                    </select>
                                  </div>
                                </div>

                                <div>
                                  <label className="text-[10px] font-bold text-slate-500">Giải thích / Mẹo làm bài:</label>
                                  <input
                                    type="text"
                                    value={q.explanation || ''}
                                    onChange={(e) => handleUpdateQuestion(originalIdx, 'explanation', e.target.value)}
                                    className="w-full p-1.5 border border-slate-300 rounded-lg text-xs"
                                  />
                                </div>

                                <div className="text-right">
                                  <button
                                    type="button"
                                    onClick={() => setEditingQuestionIdx(null)}
                                    className="px-3 py-1 bg-emerald-600 text-white font-bold rounded-lg text-[11px] cursor-pointer"
                                  >
                                    Xong
                                  </button>
                                </div>
                              </div>
                            )}
                          </div>
                        );
                      })}
                  </div>
                </div>
              )}
            </div>

            {/* Footer */}
            <div className="p-4 bg-slate-50 border-t border-slate-100 flex items-center justify-between gap-3 shrink-0">
              <span className="text-[11px] text-slate-500">
                {parsedExamData?.questions
                  ? `Sẵn sàng lưu ${parsedExamData.questions.length} câu hỏi`
                  : 'Chưa có câu hỏi nào được nạp'}
              </span>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => setCreateModalOpen(false)}
                  className="px-4 py-2 rounded-xl text-xs font-bold text-slate-600 hover:bg-slate-200 cursor-pointer"
                >
                  Hủy
                </button>
                <button
                  onClick={handleSaveExam}
                  disabled={!parsedExamData?.questions || parsedExamData.questions.length === 0}
                  className="px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold shadow-xs cursor-pointer disabled:opacity-50"
                >
                  {examToUpdate ? 'Lưu Cập Nhật Đề Thi' : 'Lưu Đề Thi Mới Vào Hệ Thống'} ({parsedExamData?.questions?.length || 0} câu)
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 4. MODAL: ASSIGN EXAM */}
      {assignModalOpen && selectedExamToAssign && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-200">
          <div className="bg-white rounded-3xl shadow-2xl max-w-md w-full border border-slate-100 overflow-hidden">
            <div className="bg-indigo-900 p-5 text-white flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Send className="w-5 h-5 text-amber-300" />
                <h3 className="font-bold text-base">Giao Bài Thi Cho Học Sinh</h3>
              </div>
              <button onClick={() => setAssignModalOpen(false)} className="text-white/80 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-6 space-y-4 text-xs">
              <div>
                <span className="text-slate-400 font-bold uppercase tracking-wider block">Đề thi:</span>
                <strong className="text-slate-900 text-sm">{selectedExamToAssign.title}</strong>
              </div>

              <div>
                <label className="block font-bold text-slate-700 uppercase tracking-wider mb-1">
                  Lớp tiếp nhận bài:
                </label>
                <select
                  value={targetClass}
                  onChange={(e) => setTargetClass(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-xs font-medium"
                >
                  <option value="Lớp 9A1 & 9A2 (Tất cả học sinh)">Lớp 9A1 &amp; 9A2 (Tất cả học sinh)</option>
                  <option value="Lớp 9A1">Lớp 9A1</option>
                  <option value="Lớp 9A2">Lớp 9A2</option>
                  <option value="Nhóm Phụ Đạo Cấp Tốc">Nhóm Phụ Đạo Cấp Tốc (Dưới 6.5đ)</option>
                  <option value="Nhóm Ôn Chuyên & Top 1">Nhóm Ôn Chuyên &amp; Top 1 (8.5+)</option>
                </select>
              </div>

              <div>
                <label className="block font-bold text-slate-700 uppercase tracking-wider mb-1">
                  Hạn chót nộp bài:
                </label>
                <input
                  type="date"
                  value={dueDate}
                  onChange={(e) => setDueDate(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-xs font-medium"
                />
              </div>

              <div className="bg-amber-50 p-3 rounded-xl border border-amber-200 text-amber-900 text-[11px]">
                📌 Học sinh có thể làm trực tuyến hoặc tải ảnh chụp bài làm (AI OCR) để hệ thống tự động chấm điểm và phân tích lỗi sai.
              </div>
            </div>

            <div className="p-4 bg-slate-50 border-t border-slate-100 flex items-center justify-between gap-3">
              {selectedExamToAssign.isAssigned ? (
                <button
                  type="button"
                  onClick={() => {
                    unassignExam(selectedExamToAssign.id);
                    setAssignModalOpen(false);
                    setSelectedExamToAssign(null);
                  }}
                  className="px-3.5 py-2 rounded-xl text-xs font-bold text-rose-600 hover:bg-rose-50 border border-rose-200 cursor-pointer"
                >
                  Thu Hồi / Hủy Giao Bài
                </button>
              ) : (
                <div />
              )}

              <div className="flex items-center gap-2">
                <button
                  onClick={() => setAssignModalOpen(false)}
                  className="px-4 py-2 rounded-xl text-xs font-bold text-slate-600 hover:bg-slate-200 cursor-pointer"
                >
                  Hủy
                </button>
                <button
                  onClick={handleConfirmAssign}
                  className="px-5 py-2 rounded-xl bg-indigo-600 text-white text-xs font-bold hover:bg-indigo-700 shadow-xs cursor-pointer"
                >
                  {selectedExamToAssign.isAssigned ? 'Cập Nhật Giao Bài' : 'Xác Nhận Giao Bài'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 5. MODAL: PREVIEW EXAM */}
      {previewExam && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-200">
          <div className="bg-white rounded-3xl shadow-2xl max-w-3xl w-full border border-slate-100 overflow-hidden max-h-[90vh] flex flex-col">
            <div className="bg-linear-to-r from-slate-900 to-indigo-950 p-5 text-white flex items-center justify-between shrink-0">
              <div>
                <span className="text-[10px] font-extrabold uppercase px-2 py-0.5 rounded bg-amber-400 text-indigo-950">
                  {previewExam.standardNotice}
                </span>
                <h3 className="font-bold text-base mt-1">{previewExam.title}</h3>
              </div>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => {
                    const toEdit = previewExam;
                    setPreviewExam(null);
                    handleOpenUpdateModal(toEdit);
                  }}
                  className="px-3 py-1.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs flex items-center gap-1.5 shadow-xs cursor-pointer transition-colors"
                >
                  <Edit3 className="w-3.5 h-3.5" />
                  Chỉnh sửa đề này
                </button>
                <button onClick={() => setPreviewExam(null)} className="text-white/80 hover:text-white p-1 cursor-pointer">
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            <div className="p-6 overflow-y-auto space-y-4 flex-1 text-xs">
              {previewExam.questions.map((q) => (
                <div key={q.number} className="bg-slate-50 p-4 rounded-2xl border border-slate-200 space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="font-black text-indigo-900">
                      Câu {q.number} ({q.section} • {q.cognitiveLevel}):
                    </span>
                    <span className="text-emerald-700 font-bold bg-emerald-100 px-2 py-0.5 rounded">
                      Đáp án: {q.correctAnswer}
                    </span>
                  </div>

                  {(q.image || q.section === 'Signboards & Notices') && (
                    <div className="bg-slate-900 text-white rounded-xl p-3 border border-slate-800 space-y-2">
                      <span className="text-[10px] font-black uppercase bg-amber-400 text-indigo-950 px-2 py-0.5 rounded inline-block">
                        🚦 Biển báo / Hình ảnh minh họa câu {q.number}
                      </span>
                      {q.image ? (
                        <div className="flex justify-center bg-slate-950 p-2 rounded-lg border border-slate-800">
                          <img
                            src={q.image}
                            alt={`Biển báo câu ${q.number}`}
                            className="max-h-36 object-contain rounded"
                          />
                        </div>
                      ) : (
                        <div className="text-center py-2 text-slate-400 text-[11px] italic">
                          Chưa tải ảnh biển báo (Thầy/cô có thể bấm Chỉnh sửa đề để tải ảnh lên)
                        </div>
                      )}
                    </div>
                  )}

                  <p className="text-slate-800 font-semibold">{cleanQuestionContent(q.questionText)}</p>
                  {q.options && (
                    <div className="grid grid-cols-2 gap-1.5 text-slate-600 pl-2">
                      {q.options.map((opt, oIdx) => (
                        <span key={oIdx}>{opt}</span>
                      ))}
                    </div>
                  )}
                  <p className="text-slate-500 italic pt-1">💡 Giải thích: {q.explanation}</p>
                </div>
              ))}
            </div>

            <div className="p-4 bg-slate-50 border-t border-slate-100 flex justify-end">
              <button
                onClick={() => setPreviewExam(null)}
                className="px-5 py-2 rounded-xl bg-slate-800 text-white text-xs font-bold"
              >
                Đóng
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
