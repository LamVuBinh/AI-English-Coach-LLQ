export interface GrammarTopicGuide {
  id: string;
  name: string;
  category: 'Cấu trúc câu' | 'Thì & Dạng thức' | 'Mệnh đề & Liên từ' | 'Dạng thức từ (Word Form)' | 'Đọc hiểu & Biển báo';
  importanceLevel: 'Cao' | 'Rất Cao' | 'Đặc biệt quan trọng';
  hcmcWeightPercent: number; // e.g. 15%
  formula: string;
  explanationVi: string;
  examples: { en: string; vi: string; note?: string }[];
  commonTraps: string[];
  cognitiveLevels: ('Nhận biết' | 'Thông hiểu' | 'Vận dụng' | 'Vận dụng cao')[];
}

export const GRAMMAR_KNOWLEDGE_BASE: GrammarTopicGuide[] = [
  {
    id: 'relative-clauses',
    name: 'Mệnh đề quan hệ (Relative Clauses)',
    category: 'Mệnh đề & Liên từ',
    importanceLevel: 'Đặc biệt quan trọng',
    hcmcWeightPercent: 12,
    formula: 'S + (Who / Whom / Which / That / Whose / Where / When) + Clause + V...',
    explanationVi: 'Dùng để nối 2 câu đơn hoặc bổ nghĩa rõ ràng cho danh từ đứng trước. Phân biệt mệnh đề quan hệ xác định (Defining) không có dấu phẩy và không xác định (Non-defining) có dấu phẩy (lưu ý: "THAT" không bao giờ đứng sau dấu phẩy hoặc giới từ).',
    examples: [
      {
        en: 'The student who scored highest in the mock test was rewarded by the teacher.',
        vi: 'Học sinh đạt điểm cao nhất trong bài thi thử đã được thầy giáo khen thưởng.',
      },
      {
        en: 'Ho Chi Minh City, which has vibrant cultural life, is embracing green public transport.',
        vi: 'TP.HCM, nơi có đời sống văn hóa sôi động, đang đón nhận giao thông công cộng xanh.',
        note: 'Có dấu phẩy, dùng WHICH thay cho cả thành phố, không dùng THAT.',
      },
    ],
    commonTraps: [
      'Dùng "THAT" sau dấu phẩy hoặc sau giới từ (ví dụ sai: "in that", ", that").',
      'Nhầm lẫn giữa "WHOSE + Noun" (sở hữu) và "WHO\'S" (viết tắt của who is / who has).',
      'Quên bỏ tân ngữ lặp lại khi đã dùng đại từ quan hệ (ví dụ sai: "The book that I bought it yesterday").',
    ],
    cognitiveLevels: ['Nhận biết', 'Thông hiểu', 'Vận dụng', 'Vận dụng cao'],
  },
  {
    id: 'conditional-sentences',
    name: 'Câu điều kiện & Unless (Conditionals)',
    category: 'Cấu trúc câu',
    importanceLevel: 'Đặc biệt quan trọng',
    hcmcWeightPercent: 10,
    formula: 'Type 1: If + S + V(s/es), S + will/can + V-bare\nType 2: If + S + V2/ed (were), S + would/could + V-bare\nUnless = If ... not',
    explanationVi: 'Câu điều kiện loại 1 diễn tả sự việc có thể xảy ra ở hiện tại hoặc tương lai. Loại 2 diễn tả giả định trái ngược với thực tế ở hiện tại (lưu ý động từ to be luôn dùng WERE cho mọi ngôi).',
    examples: [
      {
        en: 'If we plant more trees, our city will be much cooler.',
        vi: 'Nếu chúng ta trồng thêm cây xanh, thành phố sẽ mát mẻ hơn nhiều.',
      },
      {
        en: 'If I were you, I would allocate 30 minutes every morning for vocabulary review.',
        vi: 'Nếu tôi là bạn, tôi sẽ dành ra 30 phút mỗi sáng để ôn từ vựng.',
      },
      {
        en: 'Unless you review the formula carefully, you may fall into exam traps.',
        vi: 'Trừ khi bạn ôn công thức cẩn thận, bạn có thể rơi vào bẫy đề thi.',
      },
    ],
    commonTraps: [
      'Dùng WILL/WOULD ngay trong mệnh đề IF (ví dụ sai: "If it will rain").',
      'Nhầm "Unless" mang sẵn nghĩa phủ định, nên trong mệnh đề Unless KHÔNG dùng "not" (ví dụ sai: "Unless you don\'t study").',
      'Dùng "was" thay vì "were" trong câu điều kiện loại 2 của văn phong thi cử chuẩn.',
    ],
    cognitiveLevels: ['Nhận biết', 'Thông hiểu', 'Vận dụng'],
  },
  {
    id: 'passive-voice',
    name: 'Câu bị động (Passive Voice)',
    category: 'Thì & Dạng thức',
    importanceLevel: 'Rất Cao',
    hcmcWeightPercent: 12,
    formula: 'S + Be + V3/ed (+ by Agent)',
    explanationVi: 'Nhấn mạnh đối tượng chịu tác động của hành động. Các thì thường ra trong đề thi TP.HCM: Hiện tại tiếp diễn (is/are being V3), Hiện tại hoàn thành (have/has been V3), Động từ khuyết thiếu (Modal + be + V3).',
    examples: [
      {
        en: 'A new metro line is being constructed in the eastern zone of the city.',
        vi: 'Một tuyến metro mới đang được xây dựng ở khu vực phía đông thành phố.',
      },
      {
        en: 'Single-use plastic bags should be replaced with biodegradable ones.',
        vi: 'Túi nilon dùng một lần nên được thay thế bằng túi tự phân hủy sinh học.',
      },
    ],
    commonTraps: [
      'Quên trợ động từ "BE" hoặc chia sai dạng của "BE" theo chủ ngữ mới (số ít/số nhiều).',
      'Quy tắc trật tự nơi chốn và thời gian: [Nơi chốn] + by Agent + [Thời gian].',
      'Quên biến đổi thì tiếp diễn: thiếu "being".',
    ],
    cognitiveLevels: ['Thông hiểu', 'Vận dụng', 'Vận dụng cao'],
  },
  {
    id: 'word-formation',
    name: 'Dạng thức từ (Word Formation / Word Forms)',
    category: 'Dạng thức từ (Word Form)',
    importanceLevel: 'Đặc biệt quan trọng',
    hcmcWeightPercent: 15,
    formula: 'Xác định từ loại cần điền (Noun / Verb / Adj / Adv) -> Thêm tiền tố / hậu tố chuẩn.',
    explanationVi: 'Chiếm 6 câu (1.5 điểm) trong đề thi chính thức của TP.HCM. Học sinh cần phân tích vị trí ngữ pháp trong câu để xác định đúng từ loại, sau đó đọc kỹ ngữ cảnh để xem có cần thêm tiền tố phủ định (un-, im-, in-, dis-) hay không.',
    examples: [
      {
        en: 'The environment has been seriously (POLLUTE) -> POLLUTED (Tính từ dạng bị động).',
        vi: 'Môi trường đã bị ô nhiễm nghiêm trọng.',
      },
      {
        en: 'Solar energy is completely (RENEW) -> RENEWABLE (Tính từ).',
        vi: 'Năng lượng mặt trời hoàn toàn có thể tái tạo.',
      },
      {
        en: 'The local people treated the visitors with great (HOSPITABLE) -> HOSPITALITY (Danh từ).',
        vi: 'Người dân địa phương tiếp đãi du khách với sự hiếu khách nồng hậu.',
      },
    ],
    commonTraps: [
      'Điền đúng từ loại nhưng quên tiền tố phủ định do không đọc hết câu (ví dụ: convenience -> inconvenient).',
      'Nhầm lẫn giữa Danh từ chỉ người (-er, -or, -ist, -ant) và Danh từ chỉ sự vật/khái niệm (-tion, -ment, -ance, -ity).',
      'Viết sai chính tả khi biến đổi đuôi (ví dụ: maintain -> maintenance, pronounce -> pronunciation).',
    ],
    cognitiveLevels: ['Thông hiểu', 'Vận dụng', 'Vận dụng cao'],
  },
  {
    id: 'sentence-transformation',
    name: 'Biến đổi & Viết lại câu (Sentence Rewriting)',
    category: 'Cấu trúc câu',
    importanceLevel: 'Đặc biệt quan trọng',
    hcmcWeightPercent: 15,
    formula: 'Nắm vững các cặp cấu trúc tương đương: Suggest + Ving, So...that / Such...that, Because -> Because of, Wish + Past, Unless -> If...not',
    explanationVi: 'Phần thi tự luận 4 câu cuối quyết định điểm 9.0 - 10.0. Yêu cầu chuyển đổi câu giữ nguyên nghĩa, đúng ngữ pháp và tuyệt đối không sai chính tả một từ nào.',
    examples: [
      {
        en: '"Why don\'t we turn off the faucet while brushing teeth?" -> Ba suggested turning off the faucet while brushing teeth.',
        vi: 'Ba đề xuất nên khóa vòi nước trong khi đánh răng.',
      },
      {
        en: 'Because the storm was severe, all flights were delayed. -> Because of the severe storm, all flights were delayed.',
        vi: 'Bởi vì cơn bão dữ dội, tất cả các chuyến bay đều bị hoãn.',
      },
    ],
    commonTraps: [
      'Quên lùi thì trong câu gián tiếp hoặc quên đổi trạng từ chỉ nơi chốn/thời gian (this -> that, tomorrow -> the next day).',
      'Viết thiếu giới từ đi kèm động từ sau khi biến đổi.',
      'Sai cấu trúc "suggest that + S + (should) + V-bare": sau should là động từ nguyên mẫu không chia.',
    ],
    cognitiveLevels: ['Vận dụng', 'Vận dụng cao'],
  },
  {
    id: 'verb-patterns-and-gerunds',
    name: 'Danh động từ & Động từ nguyên mẫu (Gerunds & Infinitives)',
    category: 'Thì & Dạng thức',
    importanceLevel: 'Rất Cao',
    hcmcWeightPercent: 10,
    formula: 'V + V-ing (enjoy, avoid, suggest, mind, spend time, look forward to...) vs V + to-V (decide, promise, want, hope, refuse...)',
    explanationVi: 'Các động từ đặc biệt thay đổi nghĩa theo to-V hay V-ing: remember, forget, stop, try, regret.',
    examples: [
      {
        en: 'He stopped smoking two years ago (Dừng hẳn việc hút thuốc).',
        vi: 'Anh ấy đã bỏ thuốc lá 2 năm trước.',
      },
      {
        en: 'He stopped to buy a newspaper (Dừng lại để mua báo).',
        vi: 'Anh ấy dừng chân để mua một tờ báo.',
      },
    ],
    commonTraps: [
      'Nhầm "look forward to + V-ing" (to là giới từ, sau đó phải dùng V-ing chứ không phải V-bare).',
      'Nhầm "used to + V" (thói quen trong quá khứ) với "be/get used to + V-ing" (quen với việc gì ở hiện tại).',
    ],
    cognitiveLevels: ['Nhận biết', 'Thông hiểu', 'Vận dụng'],
  },
];
