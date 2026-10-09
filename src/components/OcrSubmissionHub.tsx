import React, { useState, useRef } from 'react';
import { useApp } from '../context/AppContext';
import { apiService, ClassroomOcrAnalysisResult } from '../services/apiService';
import {
  ScanLine,
  UploadCloud,
  Sparkles,
  FileText,
  CheckCircle2,
  AlertCircle,
  Clock,
  ArrowRight,
  RefreshCw,
  Layers,
  BookmarkCheck,
  Zap,
  HelpCircle,
  Lightbulb,
  FileCheck,
  ChevronRight,
  Award,
  AlertTriangle,
  RotateCcw,
  Target,
  BookOpen,
} from 'lucide-react';
import confetti from 'canvas-confetti';

export const OcrSubmissionHub: React.FC = () => {
  const {
    studentProfile,
    roadmap,
    setRoadmap,
    addSubmission,
    setStudentTab,
    showToast,
  } = useApp();

  // Mode: 'upload_file' | 'raw_text'
  const [inputMode, setInputMode] = useState<'upload_file' | 'raw_text'>('upload_file');
  const [testType, setTestType] = useState<string>('Bài kiểm tra 1 tiết (45 phút) trên lớp');
  const [testTitle, setTestTitle] = useState<string>('Bài kiểm tra Giữa kỳ 2 - Tiếng Anh 9 (Trường THCS)');
  const [studentNotes, setStudentNotes] = useState<string>('Em muốn tập trung bồi dưỡng cấp tốc phần Word Formation và Viết lại câu để nâng điểm lên 9.0.');

  // File Upload State
  const [fileBase64, setFileBase64] = useState<string | null>(null);
  const [fileName, setFileName] = useState<string | null>(null);
  const [fileSize, setFileSize] = useState<string | null>(null);
  const [mimeType, setMimeType] = useState<string>('image/jpeg');
  const [rawText, setRawText] = useState<string>('');
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Analysis States
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysisStep, setAnalysisStep] = useState(1);
  const [analysisResult, setAnalysisResult] = useState<ClassroomOcrAnalysisResult | null>(null);
  const [isRoadmapApplied, setIsRoadmapApplied] = useState(false);

  // Quick suggestion chips
  const suggestionChips = [
    'Tăng cường rèn Word Formation cấp tốc',
    'Bổ sung chuyên đề Viết lại câu có gợi ý',
    'Tập trung bẫy dấu phẩy & Mệnh đề quan hệ',
    'Rèn thêm dạng bài Đọc hiểu biển báo thực tế',
    'Đẩy nhanh tiến độ mục tiêu 9.0+ điểm',
  ];

  // Handle file select
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setFileName(file.name);
    setFileSize((file.size / (1024 * 1024)).toFixed(2) + ' MB');
    setMimeType(file.type || 'image/jpeg');

    const reader = new FileReader();
    reader.onload = () => {
      setFileBase64(reader.result as string);
    };
    reader.readAsDataURL(file);
  };

  // Quick sample loaders
  const handleLoadSample1 = () => {
    setInputMode('raw_text');
    setTestType('Bài kiểm tra 1 tiết (45 phút) trên lớp');
    setTestTitle('Bài kiểm tra 1 Tiết Giữa Kỳ 2 - Tiếng Anh 9 (Chuẩn TP.HCM)');
    setStudentNotes('Em muốn AI điều chỉnh lộ trình ưu tiên thêm 2 tuần luyện chuyên sâu Word Form và Viết lại câu.');
    setRawText(`BÀI KIỂM TRA 1 TIẾT TIẾNG ANH LỚP 9 - GIỮA KỲ 2
Họ và tên học sinh: Nguyễn Minh Anh - Lớp 9A1
Trường THCS Chu Văn An - TP.HCM

I. PHONETICS & STRESS
1. A. washed  B. missed  C. played  D. stopped
-> Học sinh chọn: C (Đáp án đúng: C) - Đúng
2. A. climate  B. pride  C. stripe  D. divide
-> Học sinh chọn: A (Đáp án đúng: A) - Đúng

II. WORD FORMATION & VOCABULARY
3. We must protect our natural environment against severe _______. (POLLUTE)
-> Học sinh điền: pollute (Đáp án đúng: pollution) - SAI (Điền động từ thay vì danh từ)
4. You should be _______ when crossing the busy street in Ho Chi Minh City. (CARE)
-> Học sinh điền: careless (Đáp án đúng: careful) - SAI (Nhầm tiền tố phủ định)

III. GRAMMAR & RELATIVE CLAUSES
5. If we reduce our energy consumption, we _______ our bills significantly.
A. will lower  B. lowered  C. would lower  D. lower
-> Học sinh chọn: A (Đáp án đúng: A) - Đúng
6. My uncle, _______ lives in District 1, is a solar energy engineer.
A. who  B. that  C. which  D. whom
-> Học sinh chọn: B (that) (Đáp án đúng: A - who) - SAI (Dùng that sau dấu phẩy)
7. There are many solar panels on the roof, _______ generate clean electricity.
A. which  B. that  C. whom  D. who
-> Học sinh chọn: A (Đáp án đúng: A) - Đúng

IV. SENTENCE TRANSFORMATION (REWRITE)
8. Ba said: "Why don't we organize a campus cleanup campaign this Sunday?"
-> Ba suggested organizing a campus cleanup campaign this Sunday.
(Học sinh làm đúng)
9. Despite the bad weather, they decided to go on a school picnic.
-> Although the weather was bad, they decided to go on a school picnic.
(Học sinh làm đúng)
10. The water is so contaminated that we cannot swim in this lake.
-> The water is too contaminated for us to swim in this lake.
(Học sinh làm đúng)`);
    showToast('Đã nạp bài kiểm tra mẫu 1 tiết với đầy đủ câu hỏi và bài làm!');
  };

  const handleLoadSample2 = () => {
    setInputMode('raw_text');
    setTestType('Bài kiểm tra 15 phút trên lớp');
    setTestTitle('Bài kiểm tra 15 phút - Chuyên đề Câu điều kiện & Mệnh đề quan hệ');
    setStudentNotes('Em muốn bổ sung bài tập phân biệt Unless và If...not, cùng các bẫy đảo ngữ.');
    setRawText(`BÀI KIỂM TRA 15 PHÚT TIẾNG ANH 9
Chuyên đề: Conditional Sentences & Relative Clauses
Học sinh: Nguyễn Minh Anh

1. If you don't study hard, you won't pass the entrance exam to Grade 10.
-> Unless you study hard, you won't pass the entrance exam to Grade 10. (Đúng)
2. This is the new high school _______ I told you about yesterday.
A. which  B. where  C. whose  D. when (Học sinh chọn: A - Đúng)
3. She didn't have enough money, so she couldn't buy that English dictionary.
-> If she had had enough money, she could have bought that English dictionary. (Học sinh điền: If she has enough money... - SAI thì điều kiện)
4. Mr. Nam, _______ son won the national English contest, is our headmaster.
A. whose  B. who  C. whom  D. that (Học sinh chọn: A - Đúng)
5. We should save water, _______ we will face severe water shortage in the dry season.
A. or  B. and  C. but  D. so (Học sinh chọn: A - Đúng)`);
    showToast('Đã nạp bài kiểm tra 15 phút mẫu!');
  };

  // Submit and analyze
  const handleStartAnalysis = async () => {
    if (inputMode === 'upload_file' && !fileBase64) {
      showToast('Vui lòng tải lên ảnh chụp bài làm hoặc chọn bài mẫu để kiểm tra.');
      return;
    }
    if (inputMode === 'raw_text' && !rawText.trim()) {
      showToast('Vui lòng nhập nội dung đề bài và bài làm của em.');
      return;
    }

    setIsAnalyzing(true);
    setAnalysisStep(1);
    setIsRoadmapApplied(false);
    showToast('AI Vision đang bóc tách bài kiểm tra và đối chiếu ma trận đề thi 3584...');

    // Progress animation
    const stepInterval = setInterval(() => {
      setAnalysisStep((prev) => (prev < 4 ? prev + 1 : prev));
    }, 1100);

    try {
      const result = await apiService.analyzeClassroomOcr({
        fileBase64: inputMode === 'upload_file' ? (fileBase64 || undefined) : undefined,
        mimeType: inputMode === 'upload_file' ? mimeType : undefined,
        rawText: inputMode === 'raw_text' ? rawText : undefined,
        testTitle: testTitle.trim() || 'Bài kiểm tra trên lớp',
        testType,
        studentNotes: studentNotes.trim(),
        studentProfile,
        currentRoadmap: roadmap,
      });

      clearInterval(stepInterval);
      setAnalysisResult(result);

      // Automatically accumulate mistakes into mistake notebook & history
      const wrongItems = result.itemAnalysis.filter((item) => !item.isCorrect);
      addSubmission({
        id: 'sub-ocr-' + Date.now(),
        examId: 'classroom-ocr-' + Date.now(),
        examTitle: result.testTitle || testTitle,
        studentId: studentProfile.id,
        studentName: studentProfile.name,
        submittedAt: new Date().toISOString().split('T')[0],
        submissionType: 'ocr_scan',
        score: result.score,
        totalPoints: 10,
        correctCount: result.correctCount,
        wrongCount: result.wrongCount,
        timeSpentSeconds: 45 * 60,
        studentAnswers: {},
        overallEvaluation: result.overallEvaluation,
        encouragement: result.encouragement,
        cognitivePerformance: {
          recognitionPercent: 85,
          comprehensionPercent: 75,
          applicationPercent: 60,
          higherApplicationPercent: 70,
        },
        weakGrammarTopics: result.weakGrammarTopics,
        itemAnalysis: result.itemAnalysis,
        uploadedImageUrl: fileBase64 || undefined,
      });

      confetti({
        particleCount: 80,
        spread: 70,
        origin: { y: 0.6 },
      });

      showToast(`Đã bóc tách thành công! ${wrongItems.length} lỗi sai đã được tự động lưu vào Sổ tay lỗi sai.`);
    } catch (error) {
      clearInterval(stepInterval);
      console.error('Lỗi khi phân tích OCR bài kiểm tra:', error);
      showToast('Đã xảy ra lỗi khi phân tích bài kiểm tra. Vui lòng thử lại.');
    } finally {
      setIsAnalyzing(false);
    }
  };

  // Apply new adjusted roadmap
  const handleApplyRoadmap = () => {
    if (!analysisResult?.adjustedRoadmap) return;
    setRoadmap(analysisResult.adjustedRoadmap);
    setIsRoadmapApplied(true);

    confetti({
      particleCount: 120,
      spread: 90,
      origin: { y: 0.5 },
    });

    showToast('🎉 Đã cập nhật thành công Lộ trình cá nhân hóa mới theo kết quả kiểm tra!');
    setTimeout(() => {
      setStudentTab('home_roadmap');
    }, 1200);
  };

  return (
    <div className="space-y-8 pb-16">
      {/* 1. HERO BANNER */}
      <div className="relative overflow-hidden rounded-3xl bg-linear-to-r from-indigo-900 via-indigo-800 to-violet-900 text-white p-6 sm:p-8 shadow-xl shadow-indigo-950/20 border border-indigo-700/50">
        <div className="relative z-10 grid grid-cols-1 lg:grid-cols-12 gap-6 items-center">
          <div className="lg:col-span-8 space-y-3">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 backdrop-blur-md border border-white/20 text-xs font-semibold text-amber-300">
              <ScanLine className="w-3.5 h-3.5" /> AI Vision OCR 2026 • Chuẩn Thông Báo 3584 TP.HCM
            </div>

            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
              Nộp Bài Kiểm Tra Trên Lớp (AI OCR &amp; Tinh Chỉnh Lộ Trình)
            </h1>

            <p className="text-indigo-100 text-xs sm:text-sm leading-relaxed max-w-2xl">
              Học sinh có thể tải lên ảnh chụp bài kiểm tra 15 phút, 1 tiết, học kỳ tại trường hoặc phiếu điểm. AI sẽ tự động bóc tách, chấm điểm, chẩn đoán nguyên nhân bẫy sai, <strong>tự động lưu vào Sổ tay lỗi sai</strong> và <strong>cập nhật lộ trình học tập cá nhân hóa</strong> theo đúng mong muốn của em.
            </p>

            <div className="pt-2 flex flex-wrap items-center gap-3">
              <button
                onClick={handleLoadSample1}
                className="px-3.5 py-2 rounded-xl bg-amber-400 hover:bg-amber-300 text-indigo-950 font-bold text-xs shadow-md transition-all flex items-center gap-1.5 cursor-pointer"
              >
                <Zap className="w-3.5 h-3.5 fill-indigo-950" /> Nạp Bài Kiểm Tra 1 Tiết Mẫu
              </button>

              <button
                onClick={handleLoadSample2}
                className="px-3.5 py-2 rounded-xl bg-white/15 hover:bg-white/25 border border-white/20 text-white font-semibold text-xs transition-all flex items-center gap-1.5 cursor-pointer"
              >
                <FileText className="w-3.5 h-3.5 text-amber-300" /> Nạp Bài 15 Phút Mẫu
              </button>
            </div>
          </div>

          <div className="lg:col-span-4 bg-white/10 backdrop-blur-lg rounded-2xl p-5 border border-white/15 space-y-3 text-xs text-indigo-100">
            <div className="flex items-center gap-2 font-bold text-amber-300 uppercase tracking-wider text-[11px]">
              <Sparkles className="w-4 h-4" /> Tính năng thông minh 3-trong-1
            </div>
            <ul className="space-y-2">
              <li className="flex items-start gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                <span>Bóc tách chính xác chữ viết tay &amp; khoanh trắc nghiệm</span>
              </li>
              <li className="flex items-start gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                <span>Tự động đưa tất cả câu sai vào <strong>Sổ tay lỗi sai</strong></span>
              </li>
              <li className="flex items-start gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                <span>Đề xuất chỉnh sửa <strong>Lộ trình cá nhân</strong> theo nguyện vọng</span>
              </li>
            </ul>
          </div>
        </div>

        {/* Glow */}
        <div className="absolute -right-20 -top-20 w-80 h-80 rounded-full bg-violet-600/30 blur-3xl pointer-events-none"></div>
      </div>

      {/* 2. SUBMISSION INPUT FORM */}
      {!analysisResult && (
        <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200/80 shadow-xs space-y-6">
          <div className="flex flex-wrap items-center justify-between gap-4 border-b border-slate-100 pb-5">
            <div>
              <h2 className="text-lg sm:text-xl font-black text-slate-900 flex items-center gap-2">
                <UploadCloud className="w-6 h-6 text-indigo-600" />
                Thông Tin &amp; Tệp Bài Kiểm Tra Cần Bóc Tách
              </h2>
              <p className="text-xs text-slate-500 mt-0.5">
                Chọn ảnh chụp phiếu làm bài trên lớp hoặc dán nội dung văn bản trực tiếp
              </p>
            </div>

            {/* Input Mode Switcher */}
            <div className="bg-slate-100 p-1 rounded-xl flex items-center gap-1 border border-slate-200">
              <button
                type="button"
                onClick={() => setInputMode('upload_file')}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer ${
                  inputMode === 'upload_file'
                    ? 'bg-white text-indigo-700 shadow-xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                <ScanLine className="w-3.5 h-3.5" /> Tải Ảnh Chụp / PDF (OCR)
              </button>
              <button
                type="button"
                onClick={() => setInputMode('raw_text')}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer ${
                  inputMode === 'raw_text'
                    ? 'bg-white text-indigo-700 shadow-xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                <FileText className="w-3.5 h-3.5" /> Nhập Văn Bản
              </button>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                Loại bài kiểm tra trên lớp:
              </label>
              <select
                value={testType}
                onChange={(e) => setTestType(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-xs font-medium focus:ring-2 focus:ring-indigo-500 focus:outline-none"
              >
                <option value="Bài kiểm tra 1 tiết (45 phút) trên lớp">Bài kiểm tra 1 tiết (45 phút) trên lớp</option>
                <option value="Bài kiểm tra 15 phút trên lớp">Bài kiểm tra 15 phút trên lớp</option>
                <option value="Bài thi Học kỳ / Khảo sát trường THCS">Bài thi Học kỳ / Khảo sát trường THCS</option>
                <option value="Phiếu bài tập tự luyện tại nhà">Phiếu bài tập tự luyện tại nhà</option>
                <option value="Đề thi thử Tuyển sinh vào 10">Đề thi thử Tuyển sinh vào 10</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                Tiêu đề bài kiểm tra / Tên trường:
              </label>
              <input
                type="text"
                value={testTitle}
                onChange={(e) => setTestTitle(e.target.value)}
                placeholder="Ví dụ: Kiểm tra 1 tiết Tiếng Anh 9 - THCS Nguyễn Du"
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-xs font-medium focus:ring-2 focus:ring-indigo-500 focus:outline-none"
              />
            </div>
          </div>

          {/* Student customization notes / desires for roadmap */}
          <div className="bg-indigo-50/60 rounded-2xl p-4 sm:p-5 border border-indigo-100 space-y-3">
            <div className="flex items-center justify-between">
              <label className="text-xs font-bold text-indigo-950 uppercase tracking-wider flex items-center gap-1.5">
                <Target className="w-4 h-4 text-indigo-600" />
                Mong muốn &amp; Nguyện vọng điều chỉnh lộ trình học tập của em:
              </label>
              <span className="text-[11px] text-indigo-600 font-medium">
                AI sẽ căn cứ vào đây để tinh chỉnh lộ trình
              </span>
            </div>

            <textarea
              rows={2}
              value={studentNotes}
              onChange={(e) => setStudentNotes(e.target.value)}
              placeholder="Nhập yêu cầu của em (Ví dụ: Em muốn dành thêm thời gian ôn Word Form và Mệnh đề quan hệ; tăng tốc độ đạt mục tiêu 9.0...)"
              className="w-full p-3 rounded-xl border border-indigo-200 bg-white text-xs font-medium text-slate-800 focus:ring-2 focus:ring-indigo-500 focus:outline-none"
            />

            {/* Quick chips */}
            <div className="flex flex-wrap items-center gap-2">
              <span className="text-[11px] font-semibold text-slate-500">Gợi ý nhanh:</span>
              {suggestionChips.map((chip, idx) => (
                <button
                  key={idx}
                  type="button"
                  onClick={() => setStudentNotes((prev) => (prev ? `${prev}; ${chip}` : chip))}
                  className="bg-white hover:bg-indigo-100 border border-indigo-200 text-indigo-800 text-[11px] font-semibold px-2.5 py-1 rounded-lg transition-colors cursor-pointer"
                >
                  + {chip}
                </button>
              ))}
            </div>
          </div>

          {/* File Upload / Text Area */}
          {inputMode === 'upload_file' ? (
            <div className="space-y-4">
              <div
                onClick={() => fileInputRef.current?.click()}
                className="border-2 border-dashed border-indigo-200 hover:border-indigo-400 bg-indigo-50/30 hover:bg-indigo-50/60 rounded-2xl p-8 text-center cursor-pointer transition-all space-y-3"
              >
                <input
                  type="file"
                  ref={fileInputRef}
                  onChange={handleFileChange}
                  accept="image/*,.pdf,application/pdf"
                  className="hidden"
                />

                <div className="w-14 h-14 rounded-2xl bg-indigo-600 text-white flex items-center justify-center mx-auto shadow-md">
                  <ScanLine className="w-7 h-7" />
                </div>

                <div>
                  <p className="text-sm font-bold text-slate-900">
                    Nhấp để tải lên ảnh chụp bài làm hoặc file PDF (JPG, PNG, PDF)
                  </p>
                  <p className="text-xs text-slate-500 mt-0.5">
                    Hỗ trợ quét chữ viết tay học sinh, phiếu trắc nghiệm khoanh tròn, bài tự luận chấm điểm
                  </p>
                </div>

                {fileName && (
                  <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-emerald-100 text-emerald-800 rounded-xl text-xs font-bold border border-emerald-200">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                    Đã chọn tệp: {fileName} ({fileSize})
                  </div>
                )}
              </div>

              {/* Preview Image if image uploaded */}
              {fileBase64 && mimeType.startsWith('image/') && (
                <div className="rounded-2xl border border-slate-200 overflow-hidden bg-slate-900 max-h-72 flex items-center justify-center p-2">
                  <img
                    src={fileBase64}
                    alt="Xem trước bài làm"
                    className="max-h-64 object-contain rounded-lg"
                  />
                </div>
              )}
            </div>
          ) : (
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                Nội dung câu hỏi &amp; Bài làm của em:
              </label>
              <textarea
                rows={8}
                value={rawText}
                onChange={(e) => setRawText(e.target.value)}
                placeholder="Dán nội dung đề bài và câu trả lời của em tại đây..."
                className="w-full p-4 rounded-2xl border border-slate-300 font-mono text-xs focus:ring-2 focus:ring-indigo-500 focus:outline-none"
              />
            </div>
          )}

          {/* Action Button */}
          <div className="pt-2 flex flex-wrap items-center justify-between gap-4">
            <span className="text-xs text-slate-500">
              💡 Sau khi phân tích, hệ thống sẽ tự động tổng hợp lỗi sai vào <strong>Sổ tay lỗi sai</strong> và xuất đề xuất lộ trình mới.
            </span>

            <button
              onClick={handleStartAnalysis}
              disabled={isAnalyzing}
              className="px-6 py-3 rounded-2xl bg-linear-to-r from-indigo-600 to-violet-600 hover:from-indigo-700 hover:to-violet-700 text-white font-extrabold text-sm shadow-lg shadow-indigo-200 transition-all flex items-center gap-2 cursor-pointer disabled:opacity-50"
            >
              <Sparkles className="w-4 h-4" /> Bắt Đầu AI OCR &amp; Phân Tích Lộ Trình
            </button>
          </div>
        </div>
      )}

      {/* 3. ANIMATED LOADING STATE */}
      {isAnalyzing && (
        <div className="bg-white rounded-3xl p-8 border border-slate-200/80 shadow-xs space-y-6 text-center">
          <div className="w-16 h-16 rounded-3xl bg-indigo-50 text-indigo-600 flex items-center justify-center mx-auto shadow-md animate-bounce">
            <ScanLine className="w-8 h-8" />
          </div>

          <div className="max-w-md mx-auto space-y-2">
            <h3 className="text-lg font-black text-slate-900">
              Gemini 3.8 Flash Đang Xử Lý &amp; Chẩn Đoán Lỗi Sai...
            </h3>
            <p className="text-xs text-slate-500">
              Đang phân tích bài kiểm tra theo 4 cấp độ tư duy Thông báo 3584 và điều chỉnh lộ trình học tập cá nhân hóa.
            </p>
          </div>

          {/* Step tracker */}
          <div className="grid grid-cols-1 sm:grid-cols-4 gap-3 max-w-3xl mx-auto pt-2 text-xs">
            <div className={`p-3 rounded-xl border ${analysisStep >= 1 ? 'bg-indigo-50 border-indigo-200 text-indigo-900 font-bold' : 'bg-slate-50 border-slate-200 text-slate-400'}`}>
              <span>1. Quét thị giác OCR</span>
            </div>
            <div className={`p-3 rounded-xl border ${analysisStep >= 2 ? 'bg-indigo-50 border-indigo-200 text-indigo-900 font-bold' : 'bg-slate-50 border-slate-200 text-slate-400'}`}>
              <span>2. Đối chiếu đáp án 3584</span>
            </div>
            <div className={`p-3 rounded-xl border ${analysisStep >= 3 ? 'bg-indigo-50 border-indigo-200 text-indigo-900 font-bold' : 'bg-slate-50 border-slate-200 text-slate-400'}`}>
              <span>3. Đưa lỗi vào Sổ tay lỗi sai</span>
            </div>
            <div className={`p-3 rounded-xl border ${analysisStep >= 4 ? 'bg-indigo-50 border-indigo-200 text-indigo-900 font-bold' : 'bg-slate-50 border-slate-200 text-slate-400'}`}>
              <span>4. Tinh chỉnh lộ trình mới</span>
            </div>
          </div>
        </div>
      )}

      {/* 4. ANALYSIS RESULT & ROADMAP ADJUSTMENT VIEW */}
      {analysisResult && (
        <div className="space-y-6">
          {/* Top Result Banner */}
          <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200/80 shadow-xs space-y-6">
            <div className="flex flex-wrap items-center justify-between gap-4">
              <div>
                <div className="flex items-center gap-2">
                  <span className="bg-emerald-100 text-emerald-800 text-[10px] font-extrabold px-2.5 py-0.5 rounded-full uppercase tracking-wider">
                    Kết Quả Bóc Tách OCR Thành Công
                  </span>
                  <span className="text-xs text-slate-500 font-medium">{analysisResult.testTitle}</span>
                </div>
                <h2 className="text-xl sm:text-2xl font-black text-slate-900 mt-1">
                  Chẩn Đoán Kết Quả Kiểm Tra &amp; Lỗ Hổng Ngữ Pháp
                </h2>
              </div>

              <button
                onClick={() => {
                  setAnalysisResult(null);
                  setFileBase64(null);
                  setFileName(null);
                  setRawText('');
                }}
                className="px-4 py-2 rounded-xl text-xs font-bold text-slate-600 hover:bg-slate-100 border border-slate-200 flex items-center gap-1.5 cursor-pointer"
              >
                <RotateCcw className="w-3.5 h-3.5" /> Nộp Bài Kiểm Tra Khác
              </button>
            </div>

            {/* Score & Key Metrics */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
              <div className="bg-linear-to-br from-indigo-50 to-indigo-100/60 rounded-2xl p-4 border border-indigo-100 text-center">
                <span className="text-[11px] font-bold text-indigo-700 uppercase block">Điểm bài làm</span>
                <span className="text-3xl font-black text-indigo-900">
                  {analysisResult.score}
                  <span className="text-xs text-indigo-600 font-normal">/10</span>
                </span>
              </div>

              <div className="bg-emerald-50 rounded-2xl p-4 border border-emerald-100 text-center">
                <span className="text-[11px] font-bold text-emerald-700 uppercase block">Câu đúng</span>
                <span className="text-3xl font-black text-emerald-700">
                  {analysisResult.correctCount}
                  <span className="text-xs text-emerald-600 font-normal">/{analysisResult.totalQuestions}</span>
                </span>
              </div>

              <div className="bg-rose-50 rounded-2xl p-4 border border-rose-100 text-center">
                <span className="text-[11px] font-bold text-rose-700 uppercase block">Câu sai (Vào Sổ Lỗi)</span>
                <span className="text-3xl font-black text-rose-700">
                  {analysisResult.wrongCount}
                  <span className="text-xs text-rose-600 font-normal"> câu</span>
                </span>
              </div>

              <div className="bg-amber-50 rounded-2xl p-4 border border-amber-100 text-center">
                <span className="text-[11px] font-bold text-amber-800 uppercase block">Mục tiêu hướng tới</span>
                <span className="text-3xl font-black text-amber-900">
                  {studentProfile.targetScore}
                  <span className="text-xs text-amber-700 font-normal">đ</span>
                </span>
              </div>
            </div>

            {/* Coach Feedback & Automatic Mistake Notification */}
            <div className="bg-slate-50 rounded-2xl p-5 border border-slate-200/70 space-y-3">
              <div className="flex items-center gap-2 text-indigo-900 font-bold text-sm">
                <Lightbulb className="w-4 h-4 text-amber-500" />
                Nhận xét &amp; Định hướng của AI English Coach:
              </div>
              <p className="text-xs text-slate-700 leading-relaxed font-medium">
                {analysisResult.overallEvaluation}
              </p>
              <p className="text-xs text-emerald-800 bg-emerald-50 p-2.5 rounded-xl border border-emerald-200">
                ✨ <strong>Lời khuyên:</strong> {analysisResult.encouragement}
              </p>

              <div className="pt-2 flex flex-wrap items-center justify-between gap-3 border-t border-slate-200">
                <div className="flex items-center gap-2 text-xs text-rose-700 font-semibold">
                  <BookmarkCheck className="w-4 h-4 text-rose-500" />
                  <span>
                    Toàn bộ <strong>{analysisResult.wrongCount} câu sai</strong> đã được tự động lưu vào Sổ tay lỗi sai &amp; Lịch sử bài làm.
                  </span>
                </div>

                <button
                  onClick={() => setStudentTab('mistake_notebook')}
                  className="text-xs font-bold text-indigo-600 hover:text-indigo-800 flex items-center gap-1 underline decoration-indigo-400 cursor-pointer"
                >
                  Mở Sổ tay lỗi sai ngay <ChevronRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          </div>

          {/* 5. PROPOSED ADJUSTED ROADMAP (HIGHLIGHT FEATURE) */}
          {analysisResult.adjustedRoadmap && (
            <div className="bg-linear-to-r from-indigo-950 via-indigo-900 to-violet-950 rounded-3xl p-6 sm:p-8 text-white border border-indigo-700/60 shadow-xl space-y-6">
              <div className="flex flex-wrap items-center justify-between gap-4">
                <div>
                  <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-400/20 border border-amber-400/40 text-amber-300 text-xs font-bold">
                    <Sparkles className="w-3.5 h-3.5" /> Lộ Trình Tinh Chỉnh Đề Xuất Dành Riêng Cho Em
                  </div>
                  <h3 className="text-xl sm:text-2xl font-black mt-2">
                    {analysisResult.adjustedRoadmap.roadmapTitle}
                  </h3>
                  <p className="text-xs text-indigo-200 mt-1 max-w-2xl leading-relaxed">
                    {analysisResult.adjustedRoadmap.summaryStrategy}
                  </p>
                </div>

                {/* Primary CTA button to apply roadmap */}
                <button
                  onClick={handleApplyRoadmap}
                  disabled={isRoadmapApplied}
                  className={`px-6 py-3.5 rounded-2xl font-black text-xs sm:text-sm shadow-xl transition-all flex items-center gap-2 cursor-pointer ${
                    isRoadmapApplied
                      ? 'bg-emerald-500 text-white shadow-emerald-500/20'
                      : 'bg-amber-400 hover:bg-amber-300 text-indigo-950 shadow-amber-400/30 hover:scale-105'
                  }`}
                >
                  {isRoadmapApplied ? (
                    <>
                      <CheckCircle2 className="w-4 h-4" /> Đã Áp Dụng Lộ Trình Mới!
                    </>
                  ) : (
                    <>
                      <Layers className="w-4 h-4 fill-indigo-950" /> Áp Dụng Lộ Trình Mới Này Vào Hệ Thống Ngay
                    </>
                  )}
                </button>
              </div>

              {/* What changed in the roadmap */}
              <div className="bg-white/10 backdrop-blur-md rounded-2xl p-5 border border-white/15 space-y-3">
                <h4 className="font-bold text-xs uppercase tracking-wider text-amber-300 flex items-center gap-2">
                  <Zap className="w-4 h-4 text-amber-400" />
                  Các điểm cải tiến trong lộ trình mới (Dựa trên lỗi sai &amp; nguyện vọng của em):
                </h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 text-xs text-indigo-100">
                  {analysisResult.roadmapChangesSummary.map((change, cIdx) => (
                    <div key={cIdx} className="flex items-start gap-2 bg-indigo-900/40 p-2.5 rounded-xl border border-indigo-700/40">
                      <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                      <span>{change}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Preview of phases in the new roadmap */}
              <div className="space-y-3">
                <span className="text-xs font-bold uppercase tracking-wider text-indigo-300 block">
                  Tổng quan các giai đoạn mới ({analysisResult.adjustedRoadmap.phases.length} giai đoạn):
                </span>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                  {analysisResult.adjustedRoadmap.phases.map((phase, pIdx) => (
                    <div
                      key={pIdx}
                      className="bg-white/5 backdrop-blur-sm rounded-2xl p-4 border border-white/10 space-y-2 text-xs"
                    >
                      <div className="flex items-center justify-between">
                        <span className="bg-amber-400/20 text-amber-300 text-[10px] font-bold px-2 py-0.5 rounded-md">
                          Giai đoạn {phase.phaseNumber}
                        </span>
                        <span className="text-[11px] text-indigo-200">{phase.durationWeeks}</span>
                      </div>
                      <h5 className="font-bold text-white text-sm leading-snug">{phase.phaseName}</h5>
                      <div className="flex flex-wrap gap-1 pt-1">
                        {phase.focusAreas.map((fa, faIdx) => (
                          <span key={faIdx} className="bg-white/10 text-indigo-200 text-[10px] px-2 py-0.5 rounded">
                            {fa}
                          </span>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* 6. DETAILED MISTAKE BREAKDOWN */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-lg font-black text-slate-900 flex items-center gap-2">
                  <AlertTriangle className="w-5 h-5 text-rose-600" />
                  Chi Tiết Từng Câu Hỏi &amp; Phân Tích Nguyên Nhân Lỗi Sai ({analysisResult.itemAnalysis.length} câu)
                </h3>
                <p className="text-xs text-slate-500">
                  Bấm vào từng câu sai để xem công thức ngữ pháp cốt lõi và mẹo nhận diện bẫy
                </p>
              </div>
            </div>

            <div className="space-y-3">
              {analysisResult.itemAnalysis.map((item, idx) => (
                <div
                  key={idx}
                  className={`rounded-2xl p-5 border transition-all ${
                    item.isCorrect
                      ? 'bg-white border-slate-200/80 shadow-xs'
                      : 'bg-rose-50/40 border-rose-200 shadow-xs'
                  }`}
                >
                  <div className="flex flex-wrap items-center justify-between gap-2 mb-2.5">
                    <div className="flex items-center gap-2">
                      <span
                        className={`w-7 h-7 rounded-xl font-black text-xs flex items-center justify-center ${
                          item.isCorrect ? 'bg-emerald-100 text-emerald-800' : 'bg-rose-500 text-white'
                        }`}
                      >
                        {item.questionNumber}
                      </span>
                      <span className="font-bold text-slate-900 text-xs sm:text-sm">
                        Câu số {item.questionNumber}
                      </span>
                      <span className="bg-slate-100 text-slate-700 text-[10px] font-bold px-2 py-0.5 rounded-full">
                        {item.grammarTopic}
                      </span>
                      {item.cognitiveLevel && (
                        <span className="bg-indigo-50 text-indigo-700 text-[10px] font-semibold px-2 py-0.5 rounded-full">
                          {item.cognitiveLevel}
                        </span>
                      )}
                    </div>

                    <div>
                      {item.isCorrect ? (
                        <span className="text-xs font-bold text-emerald-700 flex items-center gap-1">
                          <CheckCircle2 className="w-4 h-4" /> Chính xác
                        </span>
                      ) : (
                        <span className="text-xs font-bold text-rose-700 flex items-center gap-1">
                          <AlertCircle className="w-4 h-4" /> Cần khắc phục (Đã lưu vào Sổ lỗi)
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Answers comparison */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs pt-1">
                    <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-200/80">
                      <span className="text-[10px] font-bold text-slate-400 uppercase block">Đáp án học sinh:</span>
                      <strong className={item.isCorrect ? 'text-emerald-700' : 'text-rose-700'}>
                        {item.studentAnswer || '(Chưa điền)'}
                      </strong>
                    </div>

                    <div className="p-2.5 rounded-xl bg-emerald-50/60 border border-emerald-200/80">
                      <span className="text-[10px] font-bold text-emerald-700 uppercase block">Đáp án chuẩn xác:</span>
                      <strong className="text-emerald-900">{item.correctAnswer}</strong>
                    </div>
                  </div>

                  {/* Deep Analysis for Incorrect Items */}
                  {!item.isCorrect && (
                    <div className="mt-3.5 pt-3.5 border-t border-rose-100 space-y-2 text-xs">
                      {item.rootCause && (
                        <p className="text-rose-900 font-semibold bg-white p-2.5 rounded-xl border border-rose-100">
                          🔍 <strong>Nguyên nhân gốc rễ:</strong> {item.rootCause}
                        </p>
                      )}

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                        {item.whyWrong && (
                          <div className="bg-white p-2.5 rounded-xl border border-rose-100 text-rose-800">
                            <strong>Vì sao sai:</strong> {item.whyWrong}
                          </div>
                        )}
                        {item.whyCorrect && (
                          <div className="bg-white p-2.5 rounded-xl border border-emerald-100 text-emerald-800">
                            <strong>Vì sao đúng:</strong> {item.whyCorrect}
                          </div>
                        )}
                      </div>

                      {item.formulaAndRule && (
                        <div className="bg-indigo-50/80 p-2.5 rounded-xl border border-indigo-100 text-indigo-950 font-medium">
                          📐 <strong>Quy tắc cốt lõi:</strong> {item.formulaAndRule}
                        </div>
                      )}

                      {item.trapTip && (
                        <div className="bg-amber-50 p-2.5 rounded-xl border border-amber-200 text-amber-950">
                          💡 <strong>Mẹo tránh bẫy tuyển sinh 10 TP.HCM:</strong> {item.trapTip}
                        </div>
                      )}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
