import React, { useState } from 'react';
import { BookOpen, ChevronDown, ChevronUp, FileText } from 'lucide-react';

interface ReadingPassageCardProps {
  passageText: string;
  questionRange?: string; // e.g. "Câu 23 - 26"
  defaultExpanded?: boolean;
}

export const ReadingPassageCard: React.FC<ReadingPassageCardProps> = ({
  passageText,
  questionRange,
  defaultExpanded = true,
}) => {
  const [isExpanded, setIsExpanded] = useState(defaultExpanded);

  if (!passageText || passageText.trim().length === 0) return null;

  return (
    <div className="bg-linear-to-br from-amber-50/90 via-orange-50/40 to-amber-50/80 border-2 border-amber-200/90 rounded-3xl p-4 sm:p-5 shadow-xs space-y-3 my-3 transition-all animate-in fade-in duration-200">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-2 pb-2.5 border-b border-amber-200/70">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-xl bg-amber-500 text-white flex items-center justify-center font-bold text-sm shadow-xs shrink-0">
            <BookOpen className="w-4 h-4" />
          </div>
          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <h4 className="font-extrabold text-amber-950 text-xs sm:text-sm uppercase tracking-wide">
                ĐOẠN VĂN ĐỌC HIỂU (READING PASSAGE)
              </h4>
              {questionRange && (
                <span className="text-[10px] font-extrabold bg-amber-200 text-amber-900 px-2 py-0.5 rounded-full border border-amber-300">
                  {questionRange}
                </span>
              )}
            </div>
            <p className="text-[11px] text-amber-800 mt-0.5">
              Đọc kỹ đoạn văn ngữ cảnh sau đây để hoàn thành các câu hỏi bên dưới
            </p>
          </div>
        </div>

        <button
          type="button"
          onClick={() => setIsExpanded(!isExpanded)}
          className="px-3 py-1 rounded-xl bg-white/90 hover:bg-white border border-amber-300 text-amber-900 text-xs font-bold flex items-center gap-1 shadow-2xs transition-all cursor-pointer"
        >
          {isExpanded ? (
            <>
              <ChevronUp className="w-3.5 h-3.5" /> Thu gọn
            </>
          ) : (
            <>
              <ChevronDown className="w-3.5 h-3.5" /> Mở rộng đoạn văn
            </>
          )}
        </button>
      </div>

      {/* Passage Body */}
      {isExpanded && (
        <div className="bg-white/95 rounded-2xl p-4 sm:p-5 border border-amber-100 shadow-2xs space-y-2">
          <div className="text-xs sm:text-[13px] text-slate-800 leading-relaxed font-serif whitespace-pre-line max-h-72 overflow-y-auto pr-2 selection:bg-amber-100">
            {passageText}
          </div>
          <div className="pt-2 flex items-center justify-between text-[10px] text-amber-800/80 font-sans border-t border-amber-50">
            <span className="flex items-center gap-1">
              <FileText className="w-3 h-3 text-amber-600" /> Ngữ liệu đọc hiểu theo cấu trúc Thông báo 3584 Sở GD&ĐT TP.HCM
            </span>
            <span>{passageText.length} ký tự</span>
          </div>
        </div>
      )}
    </div>
  );
};
