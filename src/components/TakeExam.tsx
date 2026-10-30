import React, { useState, useEffect, useRef } from 'react';
import { useApp } from '../context/AppContext';
import { apiService } from '../services/apiService';
import { SAMPLE_EXAMS } from '../data/sampleExams';
import { normalizeExam } from '../utils/examUtils';
import {
  Exam,
  Question,
} from '../types';
import {
  Clock,
  Send,
  UploadCloud,
  FileImage,
  Sparkles,
  AlertCircle,
  CheckCircle2,
  Bookmark,
  ChevronLeft,
  ChevronRight,
  ZoomIn,
  ZoomOut,
  RefreshCw,
  Loader2,
  FileText,
  ScanLine,
  HelpCircle,
  Award,
  History,
  Layers,
  BookmarkCheck,
  Play,
  Trash2,
  Plus,
} from 'lucide-react';
import confetti from 'canvas-confetti';

export const TakeExam: React.FC = () => {
  const {
    currentExam,
    exams,
    setCurrentExam,
    studentProfile,
    submissions,
    setLatestSubmission,
    addSubmission,
    setStudentTab,
    showToast,
    diagnosticExamId,
  } = useApp();

  // Completed exam IDs
  const completedExamIds = new Set(submissions.map((s) => s.examId));

  const diagnosticExam =
    exams.find((e) => e.id === diagnosticExamId) ||
    SAMPLE_EXAMS.find((e) => e.id === diagnosticExamId) ||
    exams.find((e) => e.isDiagnostic) ||
    exams[0] ||
    SAMPLE_EXAMS[0];

  const isDiagnosticCompleted = completedExamIds.has(diagnosticExam?.id);

  // Available uncompleted exams (assigned exams or official sample exams), excluding the diagnostic exam
  const availableExams = exams.filter(
    (e) =>
      (e.isAssigned || e.category === 'official_sample') &&
      e.id !== diagnosticExam?.id &&
      !completedExamIds.has(e.id)
  );

  // Active exam to take. If the student explicitly selected the diagnostic exam, allow it (even if completed, for retaking).
  // Otherwise, fallback to the first available exam if diagnostic is completed, or default directly to the diagnostic exam.
  const isDiagnosticSelected = currentExam?.id === diagnosticExam?.id;
  const rawExam: Exam | undefined =
    (currentExam && (isDiagnosticSelected || !completedExamIds.has(currentExam.id)) ? currentExam : null) ||
    (isDiagnosticCompleted ? availableExams[0] : diagnosticExam);
  const exam: Exam | undefined = rawExam ? normalizeExam(rawExam) : undefined;

  const showLockScreen = !isDiagnosticCompleted && exam?.id !== diagnosticExam?.id;

  // Submission Mode: 'online_form' | 'ocr_photo'
  const [mode, setMode] = useState<'online_form' | 'ocr_photo'>('online_form');

  // Answers State: mapping question number -> answer string
  const [answers, setAnswers] = useState<Record<number, string>>({});
  const [flaggedQuestions, setFlaggedQuestions] = useState<Set<number>>(new Set());
  const [activeQuestionIdx, setActiveQuestionIdx] = useState(0);

  // Timer
  const [timeLeftSeconds, setTimeLeftSeconds] = useState((exam?.durationMinutes || 90) * 60);
  const [isTimerRunning, setIsTimerRunning] = useState(true);

  // OCR Multi-Image Upload States
  interface UploadedExamImage {
    id: string;
    base64: string;
    name: string;
    size: string;
    mimeType: string;
  }
  const [uploadedImages, setUploadedImages] = useState<UploadedExamImage[]>([]);
  const uploadedImage = uploadedImages[0]?.base64 || null;
  const [isOcrProcessing, setIsOcrProcessing] = useState(false);
  const [ocrNotes, setOcrNotes] = useState<string | null>(null);
  const [ocrRawTextInput, setOcrRawTextInput] = useState<string>('');
  const [ocrFilterSection, setOcrFilterSection] = useState<'all' | 'mc' | 'word_form' | 'rewrite'>('all');
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Submitting state
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Font size multiplier for exam reading comfort
  const [fontScale, setFontScale] = useState(1);

  // Reset timer when exam changes
  useEffect(() => {
    if (exam) {
      setTimeLeftSeconds(exam.durationMinutes * 60);
      setAnswers({});
      setFlaggedQuestions(new Set());
      setActiveQuestionIdx(0);
      setUploadedImages([]);
      setOcrNotes(null);
      setOcrRawTextInput('');
      setOcrFilterSection('all');
    }
  }, [exam?.id]);

  // Auto-sync answers if question 29/30 and 35/36 swap occurred
  useEffect(() => {
    if (!exam) return;
    const q29 = exam.questions.find((q) => q.number === 29);
    const q35 = exam.questions.find((q) => q.number === 35);
    if (!q29 || !q35) return;

    const ans29 = (answers[29] || '').trim();
    const ans35 = (answers[35] || '').trim();

    const needSwap =
      (q29.type === 'multiple_choice' && ans29.length > 2 && (/^[a-d]$/i.test(ans35) || !ans35)) ||
      (q35.type === 'word_form' && /^[a-d]$/i.test(ans35) && ans29.length > 2);

    if (needSwap) {
      setAnswers((prev) => ({
        ...prev,
        29: prev[35] || '',
        35: prev[29] || '',
        30: prev[36] || '',
        36: prev[30] || '',
      }));
    }
  }, [exam?.id, answers[29], answers[35]]);

  // Countdown timer effect
  useEffect(() => {
    if (!isTimerRunning) return;
    const interval = setInterval(() => {
      setTimeLeftSeconds((prev) => {
        if (prev <= 1) {
          clearInterval(interval);
          handleSubmitExam();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(interval);
  }, [isTimerRunning]);

  const formatTime = (secs: number) => {
    const mins = Math.floor(secs / 60);
    const s = secs % 60;
    return `${mins.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  const handleSelectOption = (questionNumber: number, optionLetter: string) => {
    setAnswers((prev) => ({ ...prev, [questionNumber]: optionLetter }));
  };

  const handleTextAnswerChange = (questionNumber: number, val: string) => {
    setAnswers((prev) => ({ ...prev, [questionNumber]: val }));
  };

  const handleParseAnswersFromText = () => {
    if (!ocrRawTextInput.trim()) {
      showToast('Vui lòng nhập văn bản hoặc câu trả lời trước khi trích xuất.');
      return;
    }

    const maxQuestions = exam?.questions.length || 100;
    const extracted: Record<number, string> = { ...answers };
    let count = 0;

    // Line-by-line smart parser for both multiple-choice and multi-word sentences (rewrite)
    const lines = ocrRawTextInput.split('\n');
    const questionNumberPattern = /^(?:câu|question|\#)?\s*(\d+)[\.\-:\)\/]\s*(.*)$/i;

    lines.forEach((line) => {
      const trimmed = line.trim();
      if (!trimmed) return;

      const match = trimmed.match(questionNumberPattern);
      if (match) {
        const qNum = parseInt(match[1], 10);
        let content = match[2].trim();
        if (qNum > 0 && qNum <= maxQuestions && content) {
          const qType = exam?.questions.find((q) => q.number === qNum)?.type;
          // If multiple choice, uppercase single letter A-D
          if (qType === 'multiple_choice' && /^[a-d]$/i.test(content)) {
            content = content.toUpperCase();
          }
          extracted[qNum] = content;
          count++;
        }
      }
    });

    // If line-by-line didn't match many (e.g. all on one line or mixed), parse with token scanner
    if (count === 0) {
      // Split on question patterns e.g. "1A 2B 3C..." or "Câu 1: A, Câu 2: B"
      const tokenRegex = /(?:câu|question)?\s*(\d+)[\.\-:\)]?\s*([A-D]|True|False)/gi;
      let tokenMatch;
      while ((tokenMatch = tokenRegex.exec(ocrRawTextInput)) !== null) {
        const qNum = parseInt(tokenMatch[1], 10);
        const ans = tokenMatch[2].trim();
        if (qNum > 0 && qNum <= maxQuestions) {
          extracted[qNum] = ans.toUpperCase();
          count++;
        }
      }

      // Also check sequential numbers for sentences e.g. "37. Because of... 38. The scientist..."
      const seqRegex = /(?:^|[\n\r])\s*(?:câu\s*)?(\d+)[\.\-:\)]\s*([^\n\r]+)/gi;
      let seqMatch;
      while ((seqMatch = seqRegex.exec(ocrRawTextInput)) !== null) {
        const qNum = parseInt(seqMatch[1], 10);
        const ans = seqMatch[2].trim();
        if (qNum > 0 && qNum <= maxQuestions && ans) {
          extracted[qNum] = ans;
          count++;
        }
      }
    }

    if (count > 0) {
      setAnswers(extracted);
      showToast(`Đã tự động trích xuất và điền thành công ${count} câu trả lời từ văn bản!`);
    } else {
      showToast('Không tìm thấy định dạng câu trả lời phù hợp (Ví dụ mẫu: 1A, 2. B, hoặc Câu 37: Ba suggested...).');
    }
  };

  const toggleFlag = (num: number) => {
    setFlaggedQuestions((prev) => {
      const next = new Set(prev);
      if (next.has(num)) next.delete(num);
      else next.add(num);
      return next;
    });
  };

  // Run OCR for a list of images
  const runOcrForImages = async (imagesToScan: UploadedExamImage[]) => {
    if (!exam || imagesToScan.length === 0) return;
    setIsOcrProcessing(true);
    showToast(
      imagesToScan.length > 1
        ? `AI Gemini 3.8 Flash Vision đang quét và trích xuất chữ viết tay từ ${imagesToScan.length} trang ảnh bài làm...`
        : 'AI Gemini 3.8 Flash Vision đang quét và trích xuất chi tiết chữ viết tay bài làm...'
    );

    try {
      const questionsMeta = exam.questions.map((q) => ({
        number: q.number,
        type: q.type,
        section: q.section,
        questionText: q.questionText,
        rootWord: q.type === 'word_form' ? q.questionText.match(/\(([A-Z\s]+)\)/)?.[1] : undefined,
      }));

      const ocrResult = await apiService.ocrAnswerSheet(
        imagesToScan.map((img) => img.base64),
        exam.questions.length || 40,
        questionsMeta
      );
      const extracted: Record<number, string> = { ...answers };
      let rewriteCount = 0;
      let totalExtracted = 0;

      ocrResult.detectedQuestions.forEach((item) => {
        if (item.studentAnswer !== undefined && item.studentAnswer !== null) {
          const val = String(item.studentAnswer).trim();
          if (val) {
            extracted[item.questionNumber] = val;
            totalExtracted++;
            const qMeta = exam.questions.find((q) => q.number === item.questionNumber);
            if (qMeta?.type === 'rewrite') rewriteCount++;
          }
        }
      });

      setAnswers(extracted);
      setOcrNotes(
        ocrResult.generalNotes ||
          `AI đã nhận diện thành công đáp án từ ${imagesToScan.length} trang ảnh bài làm!`
      );
      showToast(
        rewriteCount > 0
          ? `Trích xuất OCR từ ${imagesToScan.length} ảnh thành công! Đã bóc tách chính xác ${rewriteCount} câu viết lại (Rewrite) và ${totalExtracted - rewriteCount} câu khác.`
          : `Trích xuất OCR từ ${imagesToScan.length} ảnh thành công ${totalExtracted} câu! Hãy kiểm tra lại trước khi nộp.`
      );
    } catch (error: any) {
      console.error(error);
      showToast('Lỗi khi bóc tách OCR: ' + (error?.message || 'Vui lòng thử lại.'));
    } finally {
      setIsOcrProcessing(false);
    }
  };

  // Handle OCR multiple image upload
  const handleImageFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!exam) return;
    const files = e.target.files;
    if (!files || files.length === 0) return;

    const fileList = Array.from(files);
    const readPromises = fileList.map((file, idx) => {
      return new Promise<UploadedExamImage>((resolve) => {
        const reader = new FileReader();
        reader.onload = () => {
          resolve({
            id: 'img-' + Date.now() + '-' + idx + '-' + Math.random().toString(36).substring(2, 6),
            base64: reader.result as string,
            name: file.name,
            size: (file.size / (1024 * 1024)).toFixed(2) + ' MB',
            mimeType: file.type || 'image/jpeg',
          });
        };
        reader.readAsDataURL(file);
      });
    });

    const newUploaded = await Promise.all(readPromises);
    const combined = [...uploadedImages, ...newUploaded];
    setUploadedImages(combined);

    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }

    await runOcrForImages(combined);
  };

  const handleRemoveImage = (idToRemove: string) => {
    const remaining = uploadedImages.filter((img) => img.id !== idToRemove);
    setUploadedImages(remaining);
    if (remaining.length === 0) {
      setOcrNotes(null);
    } else {
      showToast(`Đã xóa ảnh. Còn lại ${remaining.length} trang ảnh.`);
    }
  };

  const handleClearAllImages = () => {
    setUploadedImages([]);
    setOcrNotes(null);
    showToast('Đã xóa tất cả ảnh bài làm.');
  };

  // Submit and grade exam
  const handleSubmitExam = async () => {
    if (!exam) return;
    setIsSubmitting(true);
    setIsTimerRunning(false);
    showToast('AI English Coach đang chấm điểm & phân tích chuyên sâu lỗi sai...');

    try {
      const result = await apiService.analyzeMistakes(answers, exam, studentProfile);
      addSubmission({
        ...result,
        submissionType: mode === 'ocr_photo' ? 'ocr_scan' : 'online',
        uploadedImageUrl: uploadedImage || undefined,
      });

      confetti({
        particleCount: 100,
        spread: 70,
        origin: { y: 0.6 },
      });

      showToast('Đã chấm xong bài thi!');
      setStudentTab('exam_feedback');
    } catch (error) {
      console.error(error);
      showToast('Lỗi khi chấm bài thi.');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (showLockScreen) {
    return (
      <div className="space-y-6 pb-16">
        {/* Header */}
        <div className="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-xs flex flex-wrap items-center justify-between gap-4">
          <div>
            <span className="bg-amber-100 text-indigo-950 font-extrabold text-[10px] px-2.5 py-0.5 rounded-full uppercase tracking-wider">
              Bài Kiểm Tra Online &amp; Bài Tập
            </span>
            <h1 className="text-xl font-black text-slate-900 mt-1">Danh Sách Bài Kiểm Tra &amp; Bài Tập</h1>
          </div>
        </div>

        {/* Locked Screen */}
        <div className="bg-white rounded-3xl p-8 sm:p-12 border border-slate-200/80 shadow-xs text-center space-y-6 max-w-2xl mx-auto">
          <div className="w-16 h-16 rounded-2xl bg-amber-100 text-amber-700 flex items-center justify-center mx-auto shadow-xs">
            <AlertCircle className="w-8 h-8 animate-bounce" />
          </div>
          <div className="space-y-2">
            <h2 className="text-xl sm:text-2xl font-black text-slate-900">
              Yêu Cầu Hoàn Thành Đề Khảo Sát Năng Lực
            </h2>
            <p className="text-xs sm:text-sm text-slate-500 leading-relaxed">
              Theo quy trình học tập chuẩn, em cần hoàn thành <strong>{diagnosticExam?.title || 'Đề Khảo Sát Năng Lực Chuẩn 3584'}</strong> để AI đánh giá chính xác trình độ hiện tại, lập lộ trình ôn tập cá nhân hóa và mở khóa toàn bộ đề thi &amp; bài tập giao bởi giáo viên.
            </p>
          </div>

          <div className="pt-4 flex flex-wrap items-center justify-center gap-3">
            <button
              onClick={() => {
                if (diagnosticExam) setCurrentExam(diagnosticExam);
              }}
              className="px-6 py-3 rounded-xl bg-amber-400 hover:bg-amber-300 text-indigo-950 font-bold text-xs shadow-md shadow-amber-400/20 transition-all flex items-center gap-2 cursor-pointer"
            >
              <Play className="w-4 h-4 fill-indigo-950" /> Bắt Đầu Làm Đề Khảo Sát Ngay
            </button>
            <button
              onClick={() => setStudentTab('home_roadmap')}
              className="px-5 py-3 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs transition-all cursor-pointer"
            >
              Quay Lại Trang Chủ
            </button>
          </div>
        </div>
      </div>
    );
  }

  // If no uncompleted exam is available
  if (!exam) {
    return (
      <div className="space-y-6 pb-16">
        {/* Header */}
        <div className="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-xs flex flex-wrap items-center justify-between gap-4">
          <div>
            <span className="bg-amber-100 text-indigo-950 font-extrabold text-[10px] px-2.5 py-0.5 rounded-full uppercase tracking-wider">
              Bài Kiểm Tra Online &amp; Bài Tập
            </span>
            <h1 className="text-xl font-black text-slate-900 mt-1">Danh Sách Bài Kiểm Tra &amp; Bài Tập</h1>
          </div>
          <span className="bg-emerald-100 text-emerald-800 font-bold text-xs px-3 py-1 rounded-full flex items-center gap-1.5">
            <CheckCircle2 className="w-4 h-4" /> 100% Đã Nộp Bài
          </span>
        </div>

        {/* Celebratory Completion Hero */}
        <div className="bg-linear-to-r from-emerald-900 via-teal-900 to-indigo-950 rounded-3xl p-6 sm:p-8 text-white shadow-xl border border-emerald-700/40 text-center space-y-4">
          <div className="w-16 h-16 rounded-3xl bg-emerald-400 text-indigo-950 flex items-center justify-center mx-auto shadow-lg shadow-emerald-400/20 font-black">
            <Award className="w-8 h-8" />
          </div>
          <div className="max-w-xl mx-auto space-y-2">
            <h2 className="text-xl sm:text-2xl font-black">
              Em Đã Hoàn Thành Tất Cả Bài Kiểm Tra &amp; Bài Tập! 🎉
            </h2>
            <p className="text-xs sm:text-sm text-emerald-100 leading-relaxed">
              Toàn bộ bài thi trực tuyến và bài tập do giáo viên giao đã được em nộp và hệ thống đã chấm điểm hoàn tất. Bài đã nộp sẽ tự động đóng lại để bảo toàn kết quả khảo thí và chuyển vào Lịch sử bài thi.
            </p>
          </div>

          <div className="pt-2 flex flex-wrap items-center justify-center gap-3 text-xs">
            <button
              onClick={() => setStudentTab('mistake_and_history')}
              className="px-5 py-2.5 rounded-xl bg-amber-400 hover:bg-amber-300 text-indigo-950 font-bold shadow-md flex items-center gap-2 cursor-pointer"
            >
              <BookmarkCheck className="w-4 h-4" /> Xem Sổ Tay Lỗi Sai &amp; Lịch Sử Bài Làm
            </button>
            <button
              onClick={() => setStudentTab('home_roadmap')}
              className="px-4 py-2.5 rounded-xl bg-white/15 hover:bg-white/25 border border-white/20 text-white font-semibold flex items-center gap-1.5 cursor-pointer"
            >
              <Layers className="w-4 h-4" /> Về Lộ Trình Cá Nhân
            </button>
            <button
              onClick={() => setStudentTab('ocr_submission')}
              className="px-4 py-2.5 rounded-xl bg-white/15 hover:bg-white/25 border border-white/20 text-white font-semibold flex items-center gap-1.5 cursor-pointer"
            >
              <ScanLine className="w-4 h-4" /> Nộp Bài Kiểm Tra Trên Lớp (OCR)
            </button>
          </div>
        </div>

        {/* List of completed submissions for review */}
        {submissions.length > 0 && (
          <div className="space-y-4">
            <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
              <History className="w-5 h-5 text-indigo-600" />
              Kết Quả Các Bài Thi Đã Hoàn Thành ({submissions.length} bài)
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {submissions.map((sub, sIdx) => (
                <div
                  key={sub.id || sIdx}
                  className="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-xs flex flex-col justify-between space-y-3"
                >
                  <div>
                    <div className="flex items-center justify-between gap-2 mb-1.5">
                      <span className="bg-emerald-100 text-emerald-800 text-[10px] font-bold px-2 py-0.5 rounded-full flex items-center gap-1">
                        <CheckCircle2 className="w-3 h-3 text-emerald-600" /> Đã chấm điểm
                      </span>
                      <span className="text-[11px] text-slate-400">
                        {sub.submittedAt ? new Date(sub.submittedAt).toLocaleDateString('vi-VN') : 'Vừa xong'}
                      </span>
                    </div>

                    <h4 className="font-bold text-slate-900 text-sm">{sub.examTitle}</h4>
                    <div className="flex items-center gap-3 text-xs text-slate-600 mt-2">
                      <span>Điểm số: <strong className="text-indigo-700 font-extrabold text-sm">{sub.score}/10</strong></span>
                      <span>Đúng: <strong className="text-emerald-600">{sub.correctCount}</strong> câu</span>
                      <span>Sai: <strong className="text-rose-600">{sub.wrongCount}</strong> câu</span>
                    </div>
                  </div>

                  <div className="pt-3 border-t border-slate-100 flex items-center justify-between">
                    <span className="text-[11px] text-slate-500">
                      {sub.submissionType === 'ocr_scan' ? 'Ảnh chụp OCR' : 'Làm trực tuyến'}
                    </span>
                    <button
                      onClick={() => {
                        setLatestSubmission(sub);
                        setStudentTab('exam_feedback');
                      }}
                      className="px-3.5 py-1.5 rounded-xl bg-indigo-50 hover:bg-indigo-100 text-indigo-700 font-bold text-xs flex items-center gap-1 cursor-pointer"
                    >
                      Xem Lời Giải &amp; Lỗi Sai <ChevronRight className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    );
  }

  const totalQuestions = exam.questions.length;
  const answeredCount = Object.keys(answers).filter((k) => (answers[Number(k)] || '').trim() !== '').length;
  const activeQuestion = exam.questions[activeQuestionIdx] || exam.questions[0];

  return (
    <div className="space-y-6 pb-16">
      {/* Top Header & Exam Switcher */}
      <div className="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-xs flex flex-wrap items-center justify-between gap-4">
        <div className="space-y-1">
          <div className="flex flex-wrap items-center gap-2">
            <span className="bg-amber-100 text-indigo-950 font-extrabold text-[10px] px-2.5 py-0.5 rounded-full uppercase tracking-wider">
              Bài Kiểm Tra Online &amp; Bài Tập
            </span>
            <span className="bg-indigo-100 text-indigo-800 text-[10px] font-bold px-2 py-0.5 rounded-full">
              {exam.standardNotice}
            </span>
            {exam.isAssigned && exam.assignedClass && (
              <span className="bg-emerald-100 text-emerald-800 text-[10px] font-bold px-2 py-0.5 rounded-full">
                Lớp: {exam.assignedClass}
              </span>
            )}
          </div>
          <div className="flex flex-wrap items-center gap-3">
            <h1 className="text-lg sm:text-xl font-extrabold text-slate-900">{exam.title}</h1>
            {availableExams.length > 1 && (
              <select
                value={exam.id}
                onChange={(e) => {
                  const selected = exams.find((x) => x.id === e.target.value);
                  if (selected) setCurrentExam(selected);
                }}
                className="text-xs font-semibold px-2.5 py-1 rounded-lg border border-slate-300 bg-slate-50 text-slate-700"
              >
                {availableExams.map((ae) => (
                  <option key={ae.id} value={ae.id}>
                    Đổi đề: {ae.title}
                  </option>
                ))}
              </select>
            )}
          </div>
        </div>

        {/* Action Controls: Switch Mode & Timer */}
        <div className="flex items-center gap-3">
          {/* Mode Switcher */}
          <div className="bg-slate-100 p-1 rounded-xl flex items-center gap-1 border border-slate-200">
            <button
              onClick={() => setMode('online_form')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer ${
                mode === 'online_form'
                  ? 'bg-white text-indigo-700 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <FileText className="w-3.5 h-3.5" /> Làm Trực Tuyến
            </button>
            <button
              onClick={() => setMode('ocr_photo')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer ${
                mode === 'ocr_photo'
                  ? 'bg-white text-indigo-700 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <ScanLine className="w-3.5 h-3.5 text-amber-600" /> Tải Ảnh Bài Làm (OCR)
            </button>
          </div>

          {/* Timer Card */}
          <div className="bg-indigo-900 text-white px-4 py-2 rounded-xl flex items-center gap-2 text-sm font-black shadow-md shadow-indigo-900/20">
            <Clock className="w-4 h-4 text-amber-300 animate-pulse" />
            <span>{formatTime(timeLeftSeconds)}</span>
          </div>
        </div>
      </div>

      {/* OCR SCAN PHOTO MODE */}
      {mode === 'ocr_photo' ? (
        <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200/80 shadow-xs space-y-6">
          <div className="text-center max-w-xl mx-auto space-y-2">
            <div className="w-14 h-14 rounded-2xl bg-amber-100 text-amber-700 flex items-center justify-center mx-auto shadow-xs">
              <ScanLine className="w-7 h-7" />
            </div>
            <h2 className="text-xl font-extrabold text-slate-900">
              Nộp Bài Bằng Ảnh Chụp Hoặc Nhập Đáp Án Nhanh (AI OCR)
            </h2>
            <p className="text-xs text-slate-500 leading-relaxed">
              Dành cho học sinh đã làm đề trên giấy hoặc trên lớp. Em có thể dán danh sách câu trả lời nhanh (ví dụ: 1A, 2B, 3C...), tự gõ vào bảng hoặc tải ảnh chụp bài làm để AI tự động trích xuất đáp án và chấm điểm.
            </p>
          </div>

          {/* OCR Processing Loader */}
          {isOcrProcessing && (
            <div className="bg-amber-50 border border-amber-200 rounded-2xl p-4 flex items-center justify-center gap-3 text-amber-900 text-xs font-semibold">
              <Loader2 className="w-5 h-5 animate-spin text-amber-600" />
              <span>Gemini 3.8 Flash Vision đang nhận diện và bóc tách các câu trả lời...</span>
            </div>
          )}

          {!isOcrProcessing && (
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 pt-4 border-t border-slate-100">
              {/* Left Column: Image Upload & Text Input */}
              <div className="lg:col-span-5 space-y-4">
                {/* Multi-Image Upload Section / Preview */}
                <input
                  type="file"
                  ref={fileInputRef}
                  onChange={handleImageFileChange}
                  accept="image/*,.pdf,application/pdf"
                  multiple
                  className="hidden"
                />

                {uploadedImages.length === 0 ? (
                  <div
                    onClick={() => fileInputRef.current?.click()}
                    className="border-2 border-dashed border-indigo-200 hover:border-indigo-400 bg-indigo-50/40 hover:bg-indigo-50/80 rounded-2xl p-6 text-center cursor-pointer transition-all space-y-2"
                  >
                    <div className="w-10 h-10 rounded-full bg-indigo-600 text-white flex items-center justify-center mx-auto shadow-md">
                      <UploadCloud className="w-5 h-5" />
                    </div>
                    <div>
                      <p className="text-xs font-bold text-indigo-950">
                        Tải ảnh chụp bài làm (Chọn được nhiều ảnh cùng lúc)
                      </p>
                      <p className="text-[10px] text-slate-500">
                        Kéo thả hoặc nhấp để tải 1 hoặc nhiều ảnh (Trang 1, Trang 2, mặt trước, mặt sau) để AI quét OCR
                      </p>
                    </div>
                  </div>
                ) : (
                  <div className="space-y-3 bg-slate-50/70 p-3.5 rounded-2xl border border-slate-200">
                    <div className="flex items-center justify-between text-xs font-bold text-slate-700">
                      <span className="flex items-center gap-1.5">
                        <FileImage className="w-4 h-4 text-emerald-600" />
                        Đã tải lên <span className="text-indigo-600 font-extrabold">{uploadedImages.length}</span> trang ảnh bài làm:
                      </span>
                      <div className="flex items-center gap-2">
                        <button
                          type="button"
                          onClick={() => fileInputRef.current?.click()}
                          className="text-indigo-600 hover:text-indigo-800 text-[11px] font-bold flex items-center gap-1 cursor-pointer bg-white px-2 py-0.5 rounded-lg border border-indigo-200 hover:bg-indigo-50 transition-colors"
                        >
                          <Plus className="w-3 h-3" /> Thêm ảnh
                        </button>
                        <button
                          type="button"
                          onClick={handleClearAllImages}
                          className="text-rose-600 hover:text-rose-800 text-[11px] font-bold cursor-pointer"
                        >
                          Xóa tất cả
                        </button>
                      </div>
                    </div>

                    {/* Thumbnail list */}
                    <div className="space-y-2 max-h-56 overflow-y-auto pr-1">
                      {uploadedImages.map((img, idx) => (
                        <div
                          key={img.id}
                          className="flex items-center justify-between gap-3 p-2 rounded-xl bg-white border border-slate-200 shadow-2xs hover:border-indigo-200 transition-colors"
                        >
                          <div className="flex items-center gap-2.5 overflow-hidden">
                            <div className="relative w-12 h-12 rounded-lg overflow-hidden bg-slate-900 shrink-0 border border-slate-200">
                              <img
                                src={img.base64}
                                alt={`Trang ${idx + 1}`}
                                className="w-full h-full object-cover"
                              />
                            </div>
                            <div className="min-w-0">
                              <div className="flex items-center gap-1.5">
                                <span className="bg-indigo-100 text-indigo-800 text-[10px] font-extrabold px-1.5 py-0.2 rounded-md">
                                  Trang {idx + 1}
                                </span>
                                <p className="text-xs font-semibold text-slate-800 truncate max-w-[130px]">
                                  {img.name}
                                </p>
                              </div>
                              <p className="text-[10px] text-slate-400 mt-0.5">{img.size}</p>
                            </div>
                          </div>
                          <button
                            type="button"
                            onClick={() => handleRemoveImage(img.id)}
                            className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors cursor-pointer"
                            title="Xóa trang ảnh này"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      ))}
                    </div>

                    {/* Re-scan button */}
                    <button
                      type="button"
                      onClick={() => runOcrForImages(uploadedImages)}
                      disabled={isOcrProcessing}
                      className="w-full py-1.5 px-3 rounded-xl bg-indigo-50 hover:bg-indigo-100 text-indigo-700 text-xs font-bold transition-colors flex items-center justify-center gap-1.5 border border-indigo-200 cursor-pointer disabled:opacity-50"
                    >
                      <RefreshCw className={`w-3.5 h-3.5 ${isOcrProcessing ? 'animate-spin' : ''}`} />
                      Quét lại OCR {uploadedImages.length} trang ảnh
                    </button>
                  </div>
                )}

                {/* Text input container - ALWAYS visible */}
                <div className="bg-amber-50/50 rounded-2xl p-4 border border-amber-200/60 space-y-3">
                  <div className="flex items-center justify-between">
                    <label className="text-xs font-bold text-indigo-950 uppercase tracking-wider flex items-center gap-1.5">
                      <FileText className="w-4 h-4 text-amber-600 animate-pulse" />
                      Nhập đề bài &amp; đáp án nhanh:
                    </label>
                  </div>
                  <textarea
                    rows={5}
                    value={ocrRawTextInput}
                    onChange={(e) => setOcrRawTextInput(e.target.value)}
                    placeholder="Nhập hoặc dán đáp án em đã làm trên lớp (Ví dụ: 1A 2B 3C... hoặc 1. pollution, 2. careful...) để tự động điền nhanh."
                    className="w-full p-2.5 rounded-xl border border-amber-200 bg-white text-xs font-medium text-slate-800 focus:ring-2 focus:ring-amber-400 focus:outline-none"
                  />
                  <div className="flex gap-2">
                    <button
                      type="button"
                      onClick={handleParseAnswersFromText}
                      className="flex-1 py-1.5 px-3 rounded-lg bg-amber-400 hover:bg-amber-500 text-indigo-950 font-bold text-[11px] flex items-center justify-center gap-1 transition-all cursor-pointer shadow-xs"
                    >
                      <Sparkles className="w-3.5 h-3.5 fill-indigo-950" /> Trích xuất điền đáp án
                    </button>
                    {ocrRawTextInput && (
                      <button
                        type="button"
                        onClick={() => setOcrRawTextInput('')}
                        className="py-1.5 px-2.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-500 hover:text-slate-800 font-semibold text-[11px] transition-colors cursor-pointer"
                      >
                        Xóa chữ
                      </button>
                    )}
                  </div>

                  <div className="flex items-center justify-between pt-1">
                    <button
                      type="button"
                      onClick={() => {
                        setOcrRawTextInput(`1A\n2A\n3D\n4B\n5C\n6B\n7A\n8B\n9B\n10A\n11B\n12C\n13A\n14D\n15B\n16C\n17A\n18B\n19C\n20D\n21B\n22A\n23 True\n24 False\n25B\n26B\n27A\n28A\n29B\n30B\n31. renewable\n32. seriously\n33. expectancy\n34. inconvenient\n35. hospitality\n36. dramatically\n37. Ba suggested organizing a campus cleanup campaign this Sunday.\n38. The young female scientist whom you met yesterday delivered an inspiring speech at the seminar.\n39. If he had a bike or scooter, he could travel to school much faster.\n40. Although the project was practical, nobody wanted to carry it out.`);
                        showToast('Đã nạp mẫu bài làm đầy đủ trắc nghiệm và câu Rewrite!');
                      }}
                      className="text-[10px] text-indigo-700 hover:text-indigo-900 font-bold underline cursor-pointer"
                    >
                      + Nạp mẫu câu trả lời &amp; Rewrite
                    </button>
                    {ocrRawTextInput && (
                      <span className="text-[10px] text-slate-400">
                        {ocrRawTextInput.split('\n').length} dòng
                      </span>
                    )}
                  </div>
                </div>

                {ocrNotes && (
                  <p className="text-xs text-slate-500 bg-slate-50 p-2.5 rounded-xl border border-slate-200/60">
                    🔍 {ocrNotes}
                  </p>
                )}
              </div>

              {/* Right Column: Answers Review & Editing Panel (ALWAYS visible) */}
              <div className="lg:col-span-7 space-y-4">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                  <div>
                    <h3 className="font-bold text-slate-900 text-sm flex items-center gap-2">
                      <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                      Rà soát & Chỉnh sửa đáp án ({answeredCount}/{totalQuestions} câu)
                    </h3>
                    <p className="text-[11px] text-slate-500">
                      AI đã bóc tách chữ viết tay. Em hãy rà soát kỹ nội dung, đặc biệt là các câu <strong>Viết lại câu (Rewrite)</strong> trước khi nộp.
                    </p>
                  </div>
                </div>

                {/* Section Filter Pills */}
                {(() => {
                  const mcQuestions = exam.questions.filter((q) => q.type !== 'word_form' && q.type !== 'rewrite');
                  const wfQuestions = exam.questions.filter((q) => q.type === 'word_form');
                  const rewriteQuestions = exam.questions.filter((q) => q.type === 'rewrite');

                  return (
                    <div className="space-y-3">
                      <div className="flex flex-wrap items-center gap-1.5 bg-slate-100 p-1 rounded-xl border border-slate-200">
                        <button
                          type="button"
                          onClick={() => setOcrFilterSection('all')}
                          className={`px-3 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                            ocrFilterSection === 'all'
                              ? 'bg-white text-indigo-700 shadow-xs'
                              : 'text-slate-600 hover:text-slate-900'
                          }`}
                        >
                          Tất cả ({totalQuestions})
                        </button>
                        <button
                          type="button"
                          onClick={() => setOcrFilterSection('mc')}
                          className={`px-3 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                            ocrFilterSection === 'mc'
                              ? 'bg-white text-indigo-700 shadow-xs'
                              : 'text-slate-600 hover:text-slate-900'
                          }`}
                        >
                          Trắc nghiệm ({mcQuestions.length})
                        </button>
                        <button
                          type="button"
                          onClick={() => setOcrFilterSection('word_form')}
                          className={`px-3 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                            ocrFilterSection === 'word_form'
                              ? 'bg-white text-indigo-700 shadow-xs'
                              : 'text-slate-600 hover:text-slate-900'
                          }`}
                        >
                          Word Form ({wfQuestions.length})
                        </button>
                        <button
                          type="button"
                          onClick={() => setOcrFilterSection('rewrite')}
                          className={`px-3 py-1 rounded-lg text-xs font-bold transition-all flex items-center gap-1 cursor-pointer ${
                            ocrFilterSection === 'rewrite'
                              ? 'bg-amber-400 text-indigo-950 shadow-xs'
                              : 'text-slate-600 hover:text-amber-800'
                          }`}
                        >
                          <Sparkles className="w-3 h-3 text-amber-600" />
                          Viết lại câu ({rewriteQuestions.length})
                        </button>
                      </div>

                      {/* Scrollable Questions Container */}
                      <div className="max-h-[380px] overflow-y-auto p-2 border border-slate-200 rounded-2xl bg-slate-50/60 space-y-3">
                        {/* 1. REWRITE QUESTIONS SECTION */}
                        {(ocrFilterSection === 'all' || ocrFilterSection === 'rewrite') && rewriteQuestions.length > 0 && (
                          <div className="space-y-2.5">
                            {ocrFilterSection === 'all' && (
                              <div className="flex items-center gap-1.5 text-xs font-extrabold text-amber-900 bg-amber-100/70 px-2.5 py-1 rounded-lg border border-amber-200">
                                <Sparkles className="w-3.5 h-3.5 text-amber-600" />
                                <span>PHẦN VIẾT LẠI CÂU (SENTENCE TRANSFORMATION - {rewriteQuestions.length} CÂU)</span>
                              </div>
                            )}

                            {rewriteQuestions.map((q) => {
                              const ansVal = answers[q.number] || '';
                              const isFilled = ansVal.trim().length > 0;

                              return (
                                <div
                                  key={q.number}
                                  className="bg-white rounded-2xl p-3.5 border border-amber-200/90 shadow-2xs space-y-2.5 transition-all hover:border-amber-400"
                                >
                                  <div className="flex flex-wrap items-center justify-between gap-2">
                                    <div className="flex items-center gap-2">
                                      <span className="w-6 h-6 rounded-lg bg-amber-500 text-white font-black text-xs flex items-center justify-center shadow-xs">
                                        {q.number}
                                      </span>
                                      <span className="text-xs font-bold text-amber-950 uppercase tracking-wide">
                                        Câu {q.number}: Viết lại câu
                                      </span>
                                    </div>
                                    <span
                                      className={`text-[10px] font-bold px-2 py-0.5 rounded-full flex items-center gap-1 ${
                                        isFilled
                                          ? 'bg-emerald-100 text-emerald-800 border border-emerald-200'
                                          : 'bg-amber-100 text-amber-800 border border-amber-200'
                                      }`}
                                    >
                                      {isFilled ? (
                                        <>
                                          <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                                          Đã bóc tách nội dung
                                        </>
                                      ) : (
                                        <>
                                          <AlertCircle className="w-3 h-3 text-amber-600" />
                                          Chưa có nội dung
                                        </>
                                      )}
                                    </span>
                                  </div>

                                  {/* Prompt content */}
                                  <div className="bg-amber-50/50 p-2.5 rounded-xl border border-amber-100 text-xs text-slate-700 leading-relaxed">
                                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-0.5">
                                      Đề bài gốc:
                                    </p>
                                    <p className="font-semibold text-slate-800">{q.questionText}</p>
                                  </div>

                                  {/* Input field for the handwritten full sentence */}
                                  <div className="space-y-1">
                                    <div className="flex items-center justify-between text-[11px] font-semibold text-slate-600">
                                      <label className="text-indigo-950 font-bold flex items-center gap-1">
                                        Nội dung câu viết lại hoàn chỉnh:
                                      </label>
                                      {ansVal && (
                                        <span className="text-[10px] text-slate-400">
                                          {ansVal.length} ký tự
                                        </span>
                                      )}
                                    </div>
                                    <textarea
                                      rows={2}
                                      value={ansVal}
                                      onChange={(e) => handleTextAnswerChange(q.number, e.target.value)}
                                      placeholder="Nhập hoặc chỉnh sửa câu viết lại hoàn chỉnh của học sinh..."
                                      className="w-full px-3 py-2 text-xs font-medium text-slate-800 bg-white border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-amber-500 shadow-2xs leading-relaxed"
                                    />
                                  </div>
                                </div>
                              );
                            })}
                          </div>
                        )}

                        {/* 2. WORD FORM QUESTIONS SECTION */}
                        {(ocrFilterSection === 'all' || ocrFilterSection === 'word_form') && wfQuestions.length > 0 && (
                          <div className="space-y-2">
                            {ocrFilterSection === 'all' && (
                              <div className="flex items-center gap-1.5 text-xs font-extrabold text-indigo-900 bg-indigo-100/70 px-2.5 py-1 rounded-lg border border-indigo-200 mt-2">
                                <FileText className="w-3.5 h-3.5 text-indigo-600" />
                                <span>PHẦN BIẾN ĐỔI TỪ LOẠI (WORD FORMATION - {wfQuestions.length} CÂU)</span>
                              </div>
                            )}

                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                              {wfQuestions.map((q) => {
                                const rootWord = q.questionText.match(/\(([A-Z\s]+)\)/)?.[1];
                                return (
                                  <div
                                    key={q.number}
                                    className="bg-white rounded-xl p-2.5 border border-indigo-100 shadow-2xs space-y-1.5"
                                  >
                                    <div className="flex items-center justify-between text-[11px] font-bold text-slate-700">
                                      <span className="flex items-center gap-1">
                                        <span className="w-5 h-5 rounded bg-indigo-600 text-white flex items-center justify-center text-[10px] font-black">
                                          {q.number}
                                        </span>
                                        <span>Câu {q.number}</span>
                                        {rootWord && (
                                          <span className="text-[10px] font-extrabold text-amber-700 bg-amber-100 px-1.5 py-0.2 rounded">
                                            {rootWord}
                                          </span>
                                        )}
                                      </span>
                                      <span
                                        className={`text-[10px] font-semibold ${
                                          answers[q.number] ? 'text-emerald-700' : 'text-slate-400'
                                        }`}
                                      >
                                        {answers[q.number] ? '✓ Đã điền' : 'Chưa có'}
                                      </span>
                                    </div>
                                    <input
                                      type="text"
                                      value={answers[q.number] || ''}
                                      onChange={(e) => handleTextAnswerChange(q.number, e.target.value)}
                                      placeholder="Từ biến đổi (vd: renewable)..."
                                      className="w-full px-2.5 py-1.5 text-xs font-medium text-slate-800 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:bg-white shadow-2xs"
                                    />
                                  </div>
                                );
                              })}
                            </div>
                          </div>
                        )}

                        {/* 3. MULTIPLE CHOICE QUESTIONS SECTION */}
                        {(ocrFilterSection === 'all' || ocrFilterSection === 'mc') && mcQuestions.length > 0 && (
                          <div className="space-y-2">
                            {ocrFilterSection === 'all' && (
                              <div className="flex items-center gap-1.5 text-xs font-extrabold text-slate-800 bg-slate-200/70 px-2.5 py-1 rounded-lg border border-slate-300 mt-2">
                                <Layers className="w-3.5 h-3.5 text-slate-600" />
                                <span>PHẦN TRẮC NGHIỆM & ĐÚNG/SAI ({mcQuestions.length} CÂU)</span>
                              </div>
                            )}

                            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                              {mcQuestions.map((q) => (
                                <div
                                  key={q.number}
                                  className="bg-white rounded-xl p-2 border border-slate-200 space-y-1 shadow-2xs hover:border-slate-300 transition-all"
                                >
                                  <div className="flex items-center justify-between text-[11px] font-bold text-slate-700">
                                    <span>Câu {q.number}:</span>
                                    <span className="text-[9px] text-slate-400 uppercase">
                                      {q.type === 'multiple_choice' ? 'TN' : q.type}
                                    </span>
                                  </div>
                                  <input
                                    type="text"
                                    value={answers[q.number] || ''}
                                    onChange={(e) =>
                                      handleTextAnswerChange(q.number, e.target.value.toUpperCase())
                                    }
                                    placeholder="-"
                                    maxLength={5}
                                    className="w-full px-2 py-1 text-xs font-extrabold bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:bg-white text-center uppercase text-indigo-700"
                                  />
                                </div>
                              ))}
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })()}

                {/* Submit OCR Button */}
                <div className="pt-2 flex justify-end">
                  <button
                    onClick={handleSubmitExam}
                    disabled={isSubmitting}
                    className="px-6 py-3 rounded-2xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-sm shadow-md shadow-indigo-200 flex items-center gap-2 transition-all disabled:opacity-50 cursor-pointer"
                  >
                    {isSubmitting ? (
                      <>
                        <Loader2 className="w-4 h-4 animate-spin" /> Đang Chấm Bài & Phân Tích Lỗi Sai...
                      </>
                    ) : (
                      <>
                        <Send className="w-4 h-4" /> Nộp Bài & Nhận Phân Tích AI
                      </>
                    )}
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      ) : (
        /* ONLINE INTERACTIVE EXAM MODE */
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Main Question Panel (8 cols) */}
          <div className="lg:col-span-8 space-y-4">
            <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200/80 shadow-xs space-y-6">
              {/* Question Header & Section Meta */}
              <div className="flex flex-wrap items-center justify-between gap-3 pb-4 border-b border-slate-100">
                <div className="flex items-center gap-2.5">
                  <span className="w-8 h-8 rounded-xl bg-indigo-600 text-white font-extrabold text-sm flex items-center justify-center shadow-xs">
                    {activeQuestion.number}
                  </span>
                  <div>
                    <span className="text-[10px] font-bold text-indigo-700 uppercase tracking-wider block">
                      Phần: {activeQuestion.section} • Cấp độ: {activeQuestion.cognitiveLevel}
                    </span>
                    <span className="text-xs font-semibold text-slate-500">
                      Chuyên đề: {activeQuestion.grammarTopic}
                    </span>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={() => toggleFlag(activeQuestion.number)}
                    className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all flex items-center gap-1.5 cursor-pointer ${
                      flaggedQuestions.has(activeQuestion.number)
                        ? 'bg-amber-100 text-amber-900 border border-amber-300 font-bold'
                        : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                    }`}
                  >
                    <Bookmark className="w-3.5 h-3.5" />
                    {flaggedQuestions.has(activeQuestion.number) ? 'Đã Đánh Dấu' : 'Đánh Dấu Xem Lại'}
                  </button>

                  <div className="hidden sm:flex items-center bg-slate-100 rounded-lg p-0.5 border border-slate-200">
                    <button
                      onClick={() => setFontScale((p) => Math.max(0.85, p - 0.1))}
                      className="p-1 hover:bg-white rounded text-slate-600 cursor-pointer"
                      title="Thu nhỏ chữ"
                    >
                      <ZoomOut className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={() => setFontScale((p) => Math.min(1.3, p + 0.1))}
                      className="p-1 hover:bg-white rounded text-slate-600 cursor-pointer"
                      title="Phóng to chữ"
                    >
                      <ZoomIn className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              </div>

              {/* Passage text if reading question */}
              {activeQuestion.passageText && (
                <div className="bg-slate-50 rounded-2xl p-4 sm:p-5 border border-slate-200 text-slate-800 text-sm leading-relaxed font-serif">
                  <p className="font-sans text-[11px] font-bold text-indigo-900 uppercase tracking-wider mb-2">
                    📖 Đoạn văn đọc hiểu / Văn cảnh:
                  </p>
                  <p className="whitespace-pre-line" style={{ fontSize: `${fontScale * 0.875}rem` }}>
                    {activeQuestion.passageText}
                  </p>
                </div>
              )}

              {/* Signboard / Notice Image for visual questions (Section 2) */}
              {(activeQuestion.image || activeQuestion.section === 'Signboards & Notices') && (
                <div className="bg-linear-to-b from-slate-900 via-slate-900 to-indigo-950 rounded-2xl p-4 sm:p-5 border-2 border-indigo-500/30 text-white shadow-md">
                  <div className="flex items-center justify-between gap-2 mb-3 pb-2 border-b border-white/10">
                    <span className="text-[11px] font-black tracking-wider uppercase bg-amber-400 text-indigo-950 px-2.5 py-0.5 rounded-full flex items-center gap-1.5 shadow-xs">
                      🚦 Biển báo / Hình ảnh câu hỏi {activeQuestion.number}
                    </span>
                    <span className="text-[11px] text-indigo-200 font-medium hidden sm:inline">
                      Quan sát kỹ biển báo bên dưới để chọn đáp án đúng
                    </span>
                  </div>

                  {activeQuestion.image ? (
                    <div className="flex items-center justify-center p-2 bg-slate-950/60 rounded-xl overflow-hidden border border-white/10">
                      <img
                        src={activeQuestion.image}
                        alt={`Biển báo câu ${activeQuestion.number}`}
                        className="max-h-64 object-contain rounded-lg shadow-lg hover:scale-102 transition-transform"
                      />
                    </div>
                  ) : (
                    /* Default Stylized Signboard Mockup if no image uploaded yet */
                    <div className="bg-blue-900/80 border-2 border-amber-400 rounded-xl p-5 text-center space-y-2 shadow-inner">
                      <div className="inline-flex items-center justify-center w-10 h-10 rounded-full bg-rose-500 text-white font-black text-lg">
                        !
                      </div>
                      <p className="text-amber-300 font-black text-base uppercase tracking-wider">
                        PUBLIC NOTICE / TRAFFIC SIGN
                      </p>
                      <p className="text-white text-xs font-semibold max-w-md mx-auto">
                        (Thầy/cô có thể tải lên ảnh biển báo thực tế trong mục Quản lý đề thi)
                      </p>
                    </div>
                  )}
                </div>
              )}

              {/* Question Text */}
              <div
                className="text-slate-900 font-medium leading-relaxed"
                style={{ fontSize: `${fontScale * 1.05}rem` }}
              >
                <p className="whitespace-pre-line font-semibold">{activeQuestion.questionText}</p>
              </div>

              {/* Options (Multiple Choice) or Text Input (Word Form / Rewrite) */}
              {activeQuestion.options && activeQuestion.options.length > 0 ? (
                <div className="space-y-3 pt-2">
                  {activeQuestion.options.map((opt, oIdx) => {
                    const letter = opt.charAt(0).toUpperCase();
                    const isSelected = answers[activeQuestion.number] === letter;

                    return (
                      <div
                        key={oIdx}
                        onClick={() => handleSelectOption(activeQuestion.number, letter)}
                        className={`p-4 rounded-2xl border-2 transition-all cursor-pointer flex items-start gap-3.5 ${
                          isSelected
                            ? 'bg-indigo-50/80 border-indigo-600 shadow-sm'
                            : 'bg-white border-slate-200 hover:border-indigo-300 hover:bg-slate-50'
                        }`}
                      >
                        <div
                          className={`w-6 h-6 rounded-full flex items-center justify-center font-bold text-xs shrink-0 mt-0.5 ${
                            isSelected
                              ? 'bg-indigo-600 text-white'
                              : 'bg-slate-100 text-slate-700 border border-slate-300'
                          }`}
                        >
                          {letter}
                        </div>
                        <span
                          className={`text-sm ${isSelected ? 'font-bold text-indigo-950' : 'text-slate-700'}`}
                          style={{ fontSize: `${fontScale * 0.95}rem` }}
                        >
                          {opt}
                        </span>
                      </div>
                    );
                  })}
                </div>
              ) : (
                /* Text Input for Word Form / Sentence Transformation */
                <div className="pt-2 space-y-2">
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider">
                    Nhập câu trả lời / câu viết lại của em:
                  </label>
                  <textarea
                    rows={3}
                    value={answers[activeQuestion.number] || ''}
                    onChange={(e) => handleTextAnswerChange(activeQuestion.number, e.target.value)}
                    placeholder="Gõ đáp án chính xác tại đây..."
                    className="w-full px-4 py-3 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-indigo-500 text-sm font-medium"
                    style={{ fontSize: `${fontScale * 0.95}rem` }}
                  />
                  <p className="text-[11px] text-slate-500 italic">
                    Lưu ý: Đối với phần Viết lại câu, hãy kiểm tra kỹ dấu câu, chia thì và chính tả.
                  </p>
                </div>
              )}

              {/* Navigation buttons: Prev / Next */}
              <div className="flex items-center justify-between pt-6 border-t border-slate-100">
                <button
                  disabled={activeQuestionIdx === 0}
                  onClick={() => setActiveQuestionIdx((p) => Math.max(0, p - 1))}
                  className="px-4 py-2 rounded-xl border border-slate-200 hover:bg-slate-50 text-xs font-bold text-slate-700 disabled:opacity-40 flex items-center gap-1.5 cursor-pointer"
                >
                  <ChevronLeft className="w-4 h-4" /> Câu trước
                </button>

                <div className="text-xs font-bold text-slate-500">
                  Câu {activeQuestionIdx + 1} / {totalQuestions}
                </div>

                <button
                  disabled={activeQuestionIdx === totalQuestions - 1}
                  onClick={() => setActiveQuestionIdx((p) => Math.min(totalQuestions - 1, p + 1))}
                  className="px-4 py-2 rounded-xl bg-indigo-50 hover:bg-indigo-100 text-indigo-700 text-xs font-bold disabled:opacity-40 flex items-center gap-1.5 cursor-pointer"
                >
                  Câu tiếp theo <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>

          {/* Right Question Palette Navigator (4 cols) */}
          <div className="lg:col-span-4 space-y-4">
            <div className="bg-white rounded-3xl p-5 border border-slate-200/80 shadow-xs space-y-5 sticky top-24">
              <div className="flex items-center justify-between">
                <h3 className="font-extrabold text-slate-900 text-sm">Bảng Điều Hướng Câu Hỏi</h3>
                <span className="text-xs font-bold text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded-md">
                  Đã làm: {answeredCount}/{totalQuestions}
                </span>
              </div>

              {/* Progress bar */}
              <div className="w-full bg-slate-100 rounded-full h-2">
                <div
                  className="bg-indigo-600 h-2 rounded-full transition-all"
                  style={{ width: `${(answeredCount / totalQuestions) * 100}%` }}
                ></div>
              </div>

              {/* Questions Numbers Grid */}
              <div className="grid grid-cols-5 sm:grid-cols-8 lg:grid-cols-5 gap-2 max-h-72 overflow-y-auto p-1">
                {exam.questions.map((q, idx) => {
                  const isAnswered = !!(answers[q.number] && answers[q.number].trim() !== '');
                  const isFlagged = flaggedQuestions.has(q.number);
                  const isActive = activeQuestionIdx === idx;

                  return (
                    <button
                      key={q.number}
                      onClick={() => setActiveQuestionIdx(idx)}
                      className={`h-9 rounded-xl font-bold text-xs transition-all relative flex items-center justify-center cursor-pointer ${
                        isActive
                          ? 'ring-2 ring-indigo-600 font-black'
                          : ''
                      } ${
                        isAnswered
                          ? 'bg-indigo-600 text-white shadow-xs'
                          : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                      }`}
                    >
                      {q.number}
                      {isFlagged && (
                        <span className="absolute -top-1 -right-1 w-2.5 h-2.5 rounded-full bg-amber-400 border border-white"></span>
                      )}
                    </button>
                  );
                })}
              </div>

              {/* Legend */}
              <div className="flex flex-wrap items-center gap-3 text-[11px] text-slate-500 pt-2 border-t border-slate-100">
                <div className="flex items-center gap-1.5">
                  <span className="w-3 h-3 rounded bg-indigo-600"></span> Đã làm
                </div>
                <div className="flex items-center gap-1.5">
                  <span className="w-3 h-3 rounded bg-slate-200"></span> Chưa làm
                </div>
                <div className="flex items-center gap-1.5">
                  <span className="w-3 h-3 rounded bg-amber-400"></span> Đánh dấu
                </div>
              </div>

              {/* Submit Button */}
              <button
                onClick={handleSubmitExam}
                disabled={isSubmitting}
                className="w-full py-3 rounded-2xl bg-linear-to-r from-indigo-600 to-violet-600 hover:from-indigo-700 hover:to-violet-700 text-white font-extrabold text-sm shadow-lg shadow-indigo-200 flex items-center justify-center gap-2 transition-all disabled:opacity-50 cursor-pointer"
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" /> AI Đang Chấm Bài...
                  </>
                ) : (
                  <>
                    <Send className="w-4 h-4" /> Nộp Bài & Nhận Đánh Giá
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
