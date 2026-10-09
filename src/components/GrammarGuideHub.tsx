import React, { useState } from 'react';
import { GRAMMAR_KNOWLEDGE_BASE, GrammarTopicGuide } from '../data/grammarKnowledgeBase';
import {
  BookOpen,
  Search,
  Sparkles,
  Zap,
  AlertTriangle,
  FileCheck,
  ChevronDown,
  ChevronUp,
} from 'lucide-react';

export const GrammarGuideHub: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [expandedId, setExpandedId] = useState<string | null>(GRAMMAR_KNOWLEDGE_BASE[0].id);

  const categories = Array.from(new Set(GRAMMAR_KNOWLEDGE_BASE.map((g) => g.category)));

  const filteredGuides = GRAMMAR_KNOWLEDGE_BASE.filter((g) => {
    const matchSearch =
      g.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      g.formula.toLowerCase().includes(searchTerm.toLowerCase()) ||
      g.explanationVi.toLowerCase().includes(searchTerm.toLowerCase());
    const matchCat = selectedCategory === 'all' || g.category === selectedCategory;
    return matchSearch && matchCat;
  });

  return (
    <div className="space-y-8 pb-16">
      {/* Header */}
      <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200/80 shadow-xs flex flex-wrap items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="bg-indigo-100 text-indigo-800 text-[10px] font-extrabold px-2.5 py-0.5 rounded-full uppercase tracking-wider">
              Chương Trình GDPT 2018 • Khối 9 Lên 10
            </span>
          </div>
          <h1 className="text-xl sm:text-2xl font-black text-slate-900 mt-1">
            Cẩm Nang Tra Cứu Toàn Bộ Trọng Điểm Ngữ Pháp Thi Tuyển Sinh 10
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Tổng hợp công thức chuẩn, ví dụ thực tế, ma trận đề 3584 và các bẫy đề thi hay gặp
          </p>
        </div>
      </div>

      {/* Search and Category Bar */}
      <div className="bg-white rounded-2xl p-4 border border-slate-200 shadow-xs flex flex-wrap items-center justify-between gap-3">
        <div className="relative flex-1 min-w-[240px]">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Tìm theo chuyên đề, công thức (ví dụ: Mệnh đề quan hệ, Word Form, If, Unless)..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 rounded-xl bg-slate-50 border border-slate-200 text-xs font-medium focus:outline-none focus:ring-2 focus:ring-indigo-500"
          />
        </div>

        <div className="flex flex-wrap items-center gap-1.5">
          <button
            onClick={() => setSelectedCategory('all')}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
              selectedCategory === 'all'
                ? 'bg-indigo-600 text-white'
                : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
            }`}
          >
            Tất cả
          </button>
          {categories.map((c) => (
            <button
              key={c}
              onClick={() => setSelectedCategory(c)}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                selectedCategory === c
                  ? 'bg-indigo-600 text-white'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              {c}
            </button>
          ))}
        </div>
      </div>

      {/* Accordion Topics List */}
      <div className="space-y-4">
        {filteredGuides.map((guide) => {
          const isExpanded = expandedId === guide.id;

          return (
            <div
              key={guide.id}
              className="bg-white rounded-3xl border border-slate-200/80 shadow-xs overflow-hidden transition-all"
            >
              {/* Header Accordion Bar */}
              <div
                onClick={() => setExpandedId(isExpanded ? null : guide.id)}
                className="p-5 sm:p-6 flex items-center justify-between cursor-pointer hover:bg-slate-50/80 transition-colors"
              >
                <div className="flex items-center gap-3.5">
                  <div className="w-10 h-10 rounded-2xl bg-indigo-50 text-indigo-700 flex items-center justify-center font-bold shrink-0">
                    <BookOpen className="w-5 h-5" />
                  </div>
                  <div>
                    <div className="flex flex-wrap items-center gap-2 mb-1">
                      <span className="text-[10px] font-extrabold uppercase px-2 py-0.5 rounded-md bg-indigo-100 text-indigo-800">
                        {guide.category}
                      </span>
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-amber-100 text-amber-900">
                        Tỷ trọng trong đề 3584: ~{guide.hcmcWeightPercent}%
                      </span>
                      <span className="text-[10px] font-semibold text-slate-500">
                        Mức độ: {guide.importanceLevel}
                      </span>
                    </div>
                    <h3 className="font-extrabold text-base text-slate-900">{guide.name}</h3>
                  </div>
                </div>

                <div className="text-slate-400 p-2">
                  {isExpanded ? <ChevronUp className="w-5 h-5" /> : <ChevronDown className="w-5 h-5" />}
                </div>
              </div>

              {/* Collapsible Content */}
              {isExpanded && (
                <div className="p-6 border-t border-slate-100 bg-slate-50/40 space-y-5 animate-in fade-in duration-200 text-xs">
                  {/* Formula Box */}
                  <div className="bg-slate-900 text-indigo-100 p-4 rounded-2xl font-mono border border-slate-800 space-y-1">
                    <span className="text-[10px] font-sans font-extrabold uppercase tracking-wider text-amber-300 block">
                      📐 Cấu Trúc & Công Thức Cốt Lõi:
                    </span>
                    <p className="whitespace-pre-line text-sm font-semibold">{guide.formula}</p>
                  </div>

                  {/* Explanation */}
                  <div className="bg-white p-4 rounded-2xl border border-slate-200/80 text-slate-700 space-y-1">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-indigo-800 block">
                      💡 Bản chất ngữ pháp & Cách sử dụng:
                    </span>
                    <p className="leading-relaxed">{guide.explanationVi}</p>
                  </div>

                  {/* Examples */}
                  <div className="space-y-2">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-slate-600 block">
                      📝 Ví dụ mẫu & ngữ cảnh thực tế:
                    </span>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                      {guide.examples.map((ex, exIdx) => (
                        <div
                          key={exIdx}
                          className="bg-white p-3.5 rounded-xl border border-slate-200 space-y-1"
                        >
                          <p className="font-bold text-indigo-950 font-serif text-xs leading-snug">
                            &quot;{ex.en}&quot;
                          </p>
                          <p className="text-slate-500 text-[11px]">{ex.vi}</p>
                          {ex.note && (
                            <p className="text-[10px] text-amber-800 bg-amber-50 px-2 py-0.5 rounded">
                              📌 {ex.note}
                            </p>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Common Traps */}
                  <div className="bg-rose-50 border border-rose-200 rounded-2xl p-4 text-rose-950 space-y-2">
                    <span className="text-[10px] font-extrabold uppercase tracking-wider text-rose-800 flex items-center gap-1.5">
                      <AlertTriangle className="w-3.5 h-3.5" /> Bẫy Đề Thi Tuyển Sinh 10 Cần Tránh:
                    </span>
                    <ul className="list-disc list-inside space-y-1 text-slate-700 text-xs">
                      {guide.commonTraps.map((trap, tIdx) => (
                        <li key={tIdx}>{trap}</li>
                      ))}
                    </ul>
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};
