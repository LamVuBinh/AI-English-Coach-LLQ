import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { apiService } from '../services/apiService';
import {
  X,
  Target,
  Sparkles,
  School,
  Clock,
  Calendar,
  AlertCircle,
  CheckCircle,
  Loader2,
} from 'lucide-react';

interface GoalSettingModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const POPULAR_HCM_SCHOOLS = [
  'THPT Chuyên Lê Hồng Phong (Chuyên / Điểm chuẩn 36+)',
  'THPT Chuyên Trần Đại Nghĩa (Chuyên / Điểm chuẩn 35+)',
  'THPT Nguyễn Thị Minh Khai (Quận 3 / NV1 ~23.5 - 24.5)',
  'THPT Bùi Thị Xuân (Quận 1 / NV1 ~23.0 - 24.0)',
  'THPT Gia Định (Bình Thạnh / NV1 ~23.5 - 24.5)',
  'THPT Nguyễn Thượng Hiền (Tân Bình / Top 1 không chuyên ~24.5+)',
  'THPT Lê Quý Đôn (Quận 3 / Mô hình tiên tiến)',
  'THPT Mạc Đĩnh Chi (Quận 6 / NV1 ~22.5 - 23.5)',
  'THPT Phú Nhuận (Phú Nhuận / NV1 ~22.0 - 23.0)',
  'THPT Trần Phú (Tân Phú / NV1 ~22.0 - 23.0)',
  'THPT Hùng Vương (Quận 5 / NV1 ~20.0 - 21.0)',
];

export const GoalSettingModal: React.FC<GoalSettingModalProps> = ({ isOpen, onClose }) => {
  const { studentProfile, updateStudentProfile, setRoadmap, showToast } = useApp();

  const [name, setName] = useState(studentProfile.name);
  const [targetSchool, setTargetSchool] = useState(studentProfile.targetSchool);
  const [customSchool, setCustomSchool] = useState('');
  const [targetScore, setTargetScore] = useState(studentProfile.targetScore);
  const [dailyHours, setDailyHours] = useState(studentProfile.dailyStudyMinutes / 60);
  const [examDate, setExamDate] = useState(studentProfile.examDate);
  const [isGenerating, setIsGenerating] = useState(false);

  if (!isOpen) return null;

  const handleSaveAndGenerateRoadmap = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsGenerating(true);

    const chosenSchool = customSchool.trim() ? customSchool.trim() : targetSchool;

    // Update profile
    updateStudentProfile({
      name,
      targetSchool: chosenSchool,
      targetScore,
      dailyStudyMinutes: Math.round(dailyHours * 60),
      examDate,
    });

    try {
      showToast('AI đang phân tích dữ liệu & thiết lập lộ trình mới...');
      const newRoadmap = await apiService.generatePersonalizedRoadmap({
        targetSchool: chosenSchool,
        targetScore,
        currentScore: studentProfile.currentEstimatedScore,
        availableHoursPerDay: dailyHours,
        examDate,
        weakTopics: studentProfile.weakTopics.map((w) => w.topic),
      });

      setRoadmap(newRoadmap);
      showToast('Lộ trình cá nhân hóa GDPT 2018 đã được cập nhật thành công!');
      onClose();
    } catch (error) {
      console.error(error);
      showToast('Đã lưu thông tin mục tiêu thành công!');
      onClose();
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="bg-white rounded-2xl shadow-2xl max-w-xl w-full border border-slate-100 overflow-hidden">
        {/* Header */}
        <div className="bg-linear-to-r from-indigo-900 via-indigo-800 to-violet-900 p-5 text-white flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-amber-400 text-indigo-950 flex items-center justify-center font-bold shadow-md">
              <Target className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-lg">Thiết Lập Mục Tiêu & Lộ Trình Vào 10</h3>
              <p className="text-xs text-indigo-200">
                Bám sát Thông báo 3584 Sở GD&ĐT TP.HCM & CT GDPT 2018
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-indigo-200 hover:text-white p-1 rounded-lg hover:bg-white/10 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Body Form */}
        <form onSubmit={handleSaveAndGenerateRoadmap} className="p-6 space-y-5 max-h-[80vh] overflow-y-auto">
          {/* Student Name */}
          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
              Họ và tên học sinh
            </label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-indigo-500 text-sm font-medium"
            />
          </div>

          {/* Target School */}
          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5 flex items-center gap-1.5">
              <School className="w-4 h-4 text-indigo-600" /> Nguyện vọng trường THPT mong muốn (TP.HCM)
            </label>
            <select
              value={targetSchool}
              onChange={(e) => setTargetSchool(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-indigo-500 text-sm font-medium bg-white"
            >
              {POPULAR_HCM_SCHOOLS.map((sch) => (
                <option key={sch} value={sch.split(' (')[0]}>
                  {sch}
                </option>
              ))}
            </select>
            <input
              type="text"
              placeholder="Hoặc nhập tên trường khác (Ví dụ: THPT Trưng Vương)..."
              value={customSchool}
              onChange={(e) => setCustomSchool(e.target.value)}
              className="mt-2 w-full px-3.5 py-2 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500 text-xs"
            />
          </div>

          {/* Target Score & Current Estimate */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="bg-indigo-50/60 p-4 rounded-xl border border-indigo-100">
              <div className="flex items-center justify-between mb-1.5">
                <label className="text-xs font-bold text-indigo-950 uppercase tracking-wider flex items-center gap-1">
                  <Target className="w-3.5 h-3.5 text-indigo-600" /> Mục tiêu điểm thi
                </label>
                <span className="text-lg font-black text-indigo-700">{targetScore.toFixed(1)}/10</span>
              </div>
              <input
                type="range"
                min="5.0"
                max="10.0"
                step="0.25"
                value={targetScore}
                onChange={(e) => setTargetScore(parseFloat(e.target.value))}
                className="w-full accent-indigo-600 cursor-pointer"
              />
              <div className="flex justify-between text-[10px] text-slate-500 mt-1">
                <span>5.0 (Cơ bản)</span>
                <span>8.0 (Khá giỏi)</span>
                <span>9.5+ (Chuyên/Top 1)</span>
              </div>
            </div>

            <div className="bg-slate-50 p-4 rounded-xl border border-slate-200">
              <div className="flex items-center justify-between mb-1.5">
                <label className="text-xs font-bold text-slate-700 uppercase tracking-wider flex items-center gap-1">
                  <Clock className="w-3.5 h-3.5 text-slate-600" /> Thời gian học/ngày
                </label>
                <span className="text-lg font-black text-slate-800">{dailyHours} giờ</span>
              </div>
              <input
                type="range"
                min="0.5"
                max="3.5"
                step="0.25"
                value={dailyHours}
                onChange={(e) => setDailyHours(parseFloat(e.target.value))}
                className="w-full accent-slate-700 cursor-pointer"
              />
              <div className="flex justify-between text-[10px] text-slate-500 mt-1">
                <span>30 phút</span>
                <span>1.5 giờ</span>
                <span>3.5 giờ</span>
              </div>
            </div>
          </div>

          {/* Exam Date */}
          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5 flex items-center gap-1.5">
              <Calendar className="w-4 h-4 text-indigo-600" /> Ngày thi chính thức dự kiến
            </label>
            <input
              type="date"
              value={examDate}
              onChange={(e) => setExamDate(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-indigo-500 text-sm font-medium"
            />
          </div>

          {/* AI Notice Banner */}
          <div className="bg-amber-50 border border-amber-200 rounded-xl p-3.5 flex items-start gap-3 text-amber-900 text-xs">
            <Sparkles className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
            <div>
              <p className="font-bold text-amber-950">AI Coach sẽ tự động lập trình lộ trình:</p>
              <p className="mt-0.5 text-amber-800">
                Lộ trình sẽ phân bổ các chuyên đề ngữ pháp GDPT 2018 (Mệnh đề quan hệ, Word Form, Câu điều kiện, Viết lại câu) theo đúng số tuần còn lại đến ngày thi và mục tiêu điểm của em.
              </p>
            </div>
          </div>

          {/* Submit Buttons */}
          <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-100">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2.5 rounded-xl text-xs font-bold text-slate-600 hover:bg-slate-100 transition-colors cursor-pointer"
            >
              Hủy bỏ
            </button>
            <button
              type="submit"
              disabled={isGenerating}
              className="px-5 py-2.5 rounded-xl bg-linear-to-r from-indigo-600 to-violet-600 hover:from-indigo-700 hover:to-violet-700 text-white text-xs font-bold shadow-md shadow-indigo-200 flex items-center gap-2 transition-all disabled:opacity-50 cursor-pointer"
            >
              {isGenerating ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" /> Đang cập nhật lộ trình AI...
                </>
              ) : (
                <>
                  <Sparkles className="w-4 h-4" /> Lưu & Tái Lập Lộ Trình AI
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
