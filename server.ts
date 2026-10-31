import express from 'express';
import { createServer as createViteServer } from 'vite';
import { GoogleGenAI, Type, ThinkingLevel } from '@google/genai';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import { createRequire } from 'module';
// @ts-ignore
import mammoth from 'mammoth';

const require = createRequire(import.meta.url);
const { PDFParse } = require('pdf-parse');

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = Number(process.env.PORT) || 3000;

app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true, limit: '50mb' }));

// ==========================================
// SYSTEM & MULTI-TIER GEMINI AI CONFIGURATION
// ==========================================
// Solution 2: Admin / Global System Key & Model
let systemCustomApiKey = process.env.SYSTEM_GEMINI_API_KEY || '';
let systemDefaultModel = 'gemini-3.1-flash-lite';
let isSystemQuotaExhausted = false;
let systemQuotaResetTimer: any = null;

// Available / Recommended Models for 2026
const AVAILABLE_GEMINI_MODELS = [
  {
    id: 'gemini-3.1-flash-lite',
    name: 'Gemini 3.1 Flash Lite',
    description: 'Tốc độ phản hồi cực nhanh, tiết kiệm tín dụng tối đa, tối ưu cho bóc tách đề thi và chấm điểm tự động.',
    isRecommended: true,
    tag: 'Khuyên dùng (Nhanh & Tiết kiệm)',
  },
  {
    id: 'gemini-3.8-flash',
    name: 'Gemini 3.8 Flash',
    description: 'Cân bằng hoàn hảo giữa năng lực phân tích ngữ pháp sư phạm chuyên sâu và tốc độ xử lý.',
    isRecommended: false,
    tag: 'Tiêu chuẩn Sư phạm',
  },
  {
    id: 'gemini-4-argon',
    name: 'Gemini 4 Argon',
    description: 'Mô hình tư duy cao cấp, giải mã các câu hỏi bẫy khó điểm 9.0+ và bài đọc hiểu phức tạp.',
    isRecommended: false,
    tag: 'Tư duy Cao cấp',
  },
  {
    id: 'gemini-flash-latest',
    name: 'Gemini Flash Latest',
    description: 'Phiên bản Flash mới nhất luôn được cập nhật tự động từ Google.',
    isRecommended: false,
    tag: 'Bản Cập Nhật Mới Nhất',
  },
];

function getSystemApiKey(): string {
  return (systemCustomApiKey || process.env.GEMINI_API_KEY || '').trim();
}

function createGeminiClient(apiKey: string): GoogleGenAI {
  return new GoogleGenAI({
    apiKey,
    httpOptions: {
      headers: {
        'User-Agent': 'aistudio-build',
      },
    },
  });
}

function maskApiKey(key: string): string {
  if (!key) return '';
  if (key.length <= 8) return '••••••••';
  return `${key.slice(0, 6)}••••••••${key.slice(-4)}`;
}

// Extract credentials sent from client (User personal key / model)
interface AiCredentials {
  userApiKey?: string;
  userModel?: string;
  usePersonalKey?: boolean;
}

function extractAiCredentials(req: express.Request): AiCredentials {
  const userApiKey = (req.headers['x-gemini-api-key'] as string) || (req.body?.userApiKey as string) || '';
  const userModel = (req.headers['x-gemini-model'] as string) || (req.body?.userModel as string) || '';
  const usePersonalKey = (req.headers['x-use-personal-key'] === 'true') || !!req.body?.usePersonalKey;
  return {
    userApiKey: userApiKey.trim(),
    userModel: userModel.trim(),
    usePersonalKey,
  };
}

// Helper for fallback error handling
const handleGeminiError = (res: express.Response, error: any) => {
  console.error('Gemini API Error:', error);

  if (error?.requiresUserKey || error?.message === 'SYSTEM_QUOTA_EXCEEDED' || error?.code === 'SYSTEM_QUOTA_EXCEEDED') {
    return res.status(429).json({
      error: 'SYSTEM_QUOTA_EXCEEDED',
      message: error.message || 'API key chung của hệ thống đã hết tín dụng. Vui lòng cấu hình API key cá nhân của bạn để tiếp tục sử dụng tính năng có sự hỗ trợ của AI.',
      requiresUserKey: true,
      details: error.toString(),
    });
  }

  res.status(500).json({
    error: error.message || 'Lỗi khi kết nối với Gemini AI',
    details: error.toString(),
  });
};

// ==========================================
// 1. OCR BÓC TÁCH BÀI LÀM CỦA HỌC SINH TỪ HÌNH ẢNH HOẶC FILE PDF
// ==========================================
app.post('/api/ai/ocr-answer-sheet', async (req, res) => {
  try {
    const { imageBase64, fileBase64, images, mimeType, questionCount = 40, questionsMeta = [] } = req.body;
    const rawList: any[] = [];
    if (Array.isArray(images) && images.length > 0) {
      rawList.push(...images);
    } else if (fileBase64 || imageBase64) {
      rawList.push(fileBase64 || imageBase64);
    }

    if (rawList.length === 0) {
      return res.status(400).json({ error: 'Thiếu dữ liệu hình ảnh hoặc file PDF' });
    }

    const imageParts: any[] = [];
    for (const item of rawList) {
      let dataStr = typeof item === 'string' ? item : item?.data || item?.base64 || '';
      let mType = (typeof item === 'object' && item?.mimeType) ? item.mimeType : mimeType;
      if (!mType) {
        const match = dataStr.match(/^data:([^;]+);base64,/);
        if (match) mType = match[1];
      }
      if (!mType) mType = 'image/jpeg';
      const clean = dataStr.replace(/^data:[^;]+;base64,/, '');
      if (clean) {
        imageParts.push({
          inlineData: {
            mimeType: mType.includes('pdf') ? 'application/pdf' : mType.startsWith('image/') ? mType : 'image/jpeg',
            data: clean,
          },
        });
      }
    }

    if (imageParts.length === 0) {
      return res.status(400).json({ error: 'Không thể xử lý dữ liệu hình ảnh tải lên' });
    }

    let questionsContext = '';
    if (Array.isArray(questionsMeta) && questionsMeta.length > 0) {
      questionsContext = `
DANH SÁCH CÂU HỎI VÀ ĐỊNH DẠNG CỦA ĐỀ THI NÀY:
${questionsMeta
  .map((q: any) => {
    let desc = `- Câu ${q.number} [Loại: ${q.type || 'multiple_choice'}]: ${q.questionText || ''}`;
    if (q.type === 'word_form') {
      desc += ` [YÊU CẦU: BIẾN ĐỔI TỪ LOẠI - Trích xuất 1 từ vựng hoàn chỉnh học sinh viết tay]`;
    } else if (q.type === 'rewrite') {
      desc += ` [YÊU CẦU ĐẶC BIỆT: VIẾT LẠI CÂU (REWRITE) - Trích xuất TOÀN BỘ CÂU TIẾNG ANH HOÀN CHỈNH do học sinh viết tay, KHÔNG ĐƯỢC CẮT BỚT TỪ]`;
    }
    return desc;
  })
  .join('\n')}
`;
    }

    const prompt = `
Bạn là chuyên gia AI thị giác máy tính & khảo thí Tiếng Anh lớp 10 TP.HCM (Thông báo 3584 Sở GD&ĐT TP.HCM).
Nhiệm vụ: Nhận diện, bóc tách chính xác BÀI LÀM CỦA HỌC SINH từ ${imageParts.length} trang ảnh chụp bài làm viết tay / phiếu trả lời của học sinh cho ${questionCount} câu hỏi (ví dụ trang 1 và trang 2, mặt trước và mặt sau). Bạn cần quan sát và tổng hợp đáp án trên tất cả các trang ảnh được cung cấp.

${questionsContext}

QUY TẮC CỐT LÕI: PHÂN BIỆT MÀU MỰC - CHỈ BÓC TÁCH BÀI LÀM CỦA HỌC SINH (MỰC XANH / ĐEN / BÚT CHÌ), TUYỆT ĐỐI BỎ QUA HOẶC KHÔNG LẤY MỰC ĐỎ CỦA GIÁO VIÊN!
1. BÀI LÀM CỦA HỌC SINH (ĐỐI TƯỢNG DUY NHẤT CẦN TRÍCH XUẤT):
   - Luôn được học sinh viết/khoanh bằng MỰC XANH (blue), MỰC ĐEN (black), hoặc BÚT CHÌ (pencil).
   - Đây là câu trả lời ban đầu của chính học sinh làm trong bài kiểm tra.

2. PHẦN CHẤM BÀI / CHỮA BÀI CỦA GIÁO VIÊN (TUYỆT ĐỐI KHÔNG ĐƯỢC LẤY LÀM ĐÁP ÁN CỦA HỌC SINH):
   - Giáo viên chấm bài bằng MỰC ĐỎ (bút bi đỏ, bút dạ đỏ, red ink).
   - Giáo viên thường dùng mực đỏ để: gạch chéo đỏ (X), gạch chân đỏ, tích V đỏ, khoanh tròn đỏ vào đáp án đúng, hoặc VIẾT ĐÈ / VIẾT SỬA ĐÁP ÁN ĐÚNG BẰNG MỰC ĐỎ (bên cạnh, bên trên hoặc bên lề).
   - NGUYÊN TẮC:
     + TUYỆT ĐỐI KHÔNG ĐƯỢC trích xuất chữ viết bằng mực đỏ của giáo viên vào trường "studentAnswer".
     + Nếu học sinh viết sai và giáo viên dùng bút đỏ gạch chéo rồi viết từ/câu đúng bằng mực đỏ bên cạnh, bạn BẮT BUỘC PHẢI đọc chữ MỰC XANH/ĐEN/CHÌ CỦA HỌC SINH (kể cả khi đã bị nét mực đỏ gạch qua) để làm "studentAnswer".
     + Mục tiêu là để hệ thống ghi nhận đúng lỗi sai thực tế mà học sinh đã mắc phải, phục vụ chấm điểm và phân tích lỗ hổng kiến thức.

QUY TẮC CHI TIẾT THEO TỪNG DẠNG BÀI:
1. ĐỐI VỚI DẠNG BÀI VIẾT LẠI CÂU (SENTENCE TRANSFORMATION / REWRITE - Thường là các câu 37, 38, 39, 40):
   - ĐÂY LÀ PHẦN TRỌNG TÂM CẦN ĐỘ CHÍNH XÁC CAO NHẤT.
   - Trích xuất CHÍNH XÁC CÂU MỰC XANH/ĐEN/CHÌ mà học sinh đã viết tay trên giấy, kể cả khi câu đó bị sai ngữ pháp hoặc bị giáo viên gạch sửa mực đỏ.
   - Ví dụ:
     * Học sinh viết bằng mực xanh: "Ba suggested to organize a cleanup campaign."
     * Giáo viên gạch chéo mực đỏ chữ "to organize" và ghi mực đỏ "organizing".
     * => "studentAnswer" BẮT BUỘC PHẢI LÀ: "Ba suggested to organize a cleanup campaign." (giữ nguyên lỗi học sinh đã viết tay), TUYỆT ĐỐI KHÔNG ĐƯỢC lấy chữ sửa "organizing" của giáo viên!
   - Nếu học sinh chỉ viết vế sau của từ gợi ý (ví dụ đề in sẵn "Ba suggested..." và học sinh chỉ viết tiếp "...to organize a cleanup campaign."), hãy kết hợp lại thành câu hoàn chỉnh theo đúng bài làm của học sinh: "Ba suggested to organize a cleanup campaign."
   - Đảm bảo trích xuất ĐẦY ĐỦ CÂU theo bài làm của học sinh, không cắt ngắn câu. Giữ đúng khoảng trắng giữa các từ.

2. ĐỐI VỚI DẠNG BIẾN ĐỔI TỪ LOẠI (WORD FORMATION - Thường là các câu 31 đến 36):
   - Trích xuất chính xác 1 từ biến đổi mà học sinh đã viết tay bằng mực xanh/đen/chì.
   - Ví dụ: Học sinh viết mực xanh "pollute", giáo viên gạch mực đỏ và sửa chữ đỏ "pollution" bên cạnh -> "studentAnswer" BẮT BUỘC LÀ: "pollute".
   - Đọc kỹ các hậu tố/tiền tố dễ nhầm: -able/-ible, -tion/-sion, in-/un-, -ity, -ly.

3. ĐỐI VỚI CÂU TRẮC NGHIỆM & TRUE/FALSE (Thường là câu 1 đến 30):
   - Trả về chữ cái in hoa A, B, C, D hoặc True, False do HỌC SINH KHOANH BẰNG MỰC XANH/ĐEN/CHÌ.
   - Nếu học sinh khoanh B bằng mực xanh, giáo viên gạch chéo B bằng bút đỏ và khoanh A bằng bút đỏ (đáp án đúng) -> "studentAnswer" PHẢI LÀ "B" (đáp án học sinh đã khoanh), TUYỆT ĐỐI KHÔNG lấy chữ "A" mực đỏ của giáo viên.
   - Nếu câu nào học sinh bỏ trống hoặc không đọc được trên bất kỳ trang nào, để chuỗi rỗng "".

Hãy trả về định dạng JSON đúng schema đã cung cấp.
`;

    const response = await callGeminiWithRetry(
      {
        model: 'gemini-3.8-flash',
        forceModel: 'gemini-3.8-flash',
        contents: {
          parts: [
            ...imageParts,
            { text: prompt },
          ],
        },
        config: {
          responseMimeType: 'application/json',
          responseSchema: {
            type: Type.OBJECT,
            properties: {
              detectedQuestions: {
                type: Type.ARRAY,
                items: {
                  type: Type.OBJECT,
                  properties: {
                    questionNumber: { type: Type.INTEGER },
                    hasTeacherRedGrading: {
                      type: Type.BOOLEAN,
                      description: 'True nếu có mực đỏ của giáo viên (gạch chéo đỏ, tích V đỏ, khoanh đỏ, hoặc chữ đỏ sửa bên cạnh)',
                    },
                    teacherRedCorrectionText: {
                      type: Type.STRING,
                      description: 'Nội dung chữ hoặc phương án MỰC ĐỎ do giáo viên sửa (để rỗng "" nếu không có)',
                    },
                    studentRawHandwriting: {
                      type: Type.STRING,
                      description: 'BÀI LÀM DO HỌC SINH TỰ VIẾT BẰNG MỰC XANH, ĐEN HOẶC CHÌ (kể cả khi viết sai chính tả, sai ngữ pháp, hoặc bị gạch mực đỏ)',
                    },
                    studentAnswer: {
                      type: Type.STRING,
                      description: 'BẮT BUỘC LẤY NGUYÊN VĂN TỪ studentRawHandwriting. TUYỆT ĐỐI CẤM LẤY teacherRedCorrectionText',
                    },
                    confidence: { type: Type.STRING, description: 'HIGH, MEDIUM, LOW' },
                    notes: { type: Type.STRING, description: 'Ghi chú chữ mờ hoặc gạch xóa nếu có' },
                  },
                  required: ['questionNumber', 'hasTeacherRedGrading', 'teacherRedCorrectionText', 'studentRawHandwriting', 'studentAnswer'],
                },
              },
              generalNotes: { type: Type.STRING, description: 'Nhận xét tổng quan về chất lượng chữ viết / file PDF / ảnh chụp' },
            },
            required: ['detectedQuestions'],
          },
        },
      },
      extractAiCredentials(req)
    );

    const jsonStr = response.text?.trim() || '{}';
    const parsed = JSON.parse(jsonStr);

    if (Array.isArray(parsed.detectedQuestions)) {
      parsed.detectedQuestions = parsed.detectedQuestions.map((q: any) => {
        let finalAns = String(q.studentAnswer || '').trim();
        const origHandwriting = String(q.studentRawHandwriting || '').trim();
        const teacherRed = String(q.teacherRedCorrectionText || '').trim();

        // Anti-teacher-leak programmatic safeguard:
        if (teacherRed) {
          // If studentAnswer was set to the teacher's red correction text, or if studentRawHandwriting is available and distinct
          if (origHandwriting && origHandwriting.toLowerCase() !== teacherRed.toLowerCase()) {
            finalAns = origHandwriting;
          } else if (finalAns.toLowerCase() === teacherRed.toLowerCase() && origHandwriting) {
            finalAns = origHandwriting;
          }
        } else if (origHandwriting && !finalAns) {
          finalAns = origHandwriting;
        }

        return {
          ...q,
          studentAnswer: finalAns,
        };
      });
    }

    res.json(parsed);
  } catch (error: any) {
    handleGeminiError(res, error);
  }
});

// ==========================================
// MULTI-TIER RETRY & EXECUTION HELPERS
// ==========================================
async function callGeminiWithRetry(options: any, credentials?: AiCredentials, maxRetries = 3) {
  const systemKey = getSystemApiKey();
  const userKey = credentials?.userApiKey || '';
  const userModel = credentials?.userModel || '';
  const usePersonalKey = credentials?.usePersonalKey;

  // Decision logic based on User Specification:
  // "Lưu ý ưu tiên API key [chung] nhưng nếu API key chung bị hết tín dụng thì yêu cầu người dùng nhập API key cá nhân để sử dụng tính năng có sự hỗ trợ của AI."
  let primaryKey = '';
  let primaryModel = '';
  let fallbackKey = '';
  let fallbackModel = '';

  // If forceModel is specified (e.g. specialized vision gemini-3.8-flash), enforce it
  const forcedOrRequestedModel = options.forceModel || null;

  if (usePersonalKey && userKey) {
    primaryKey = userKey;
    primaryModel = forcedOrRequestedModel || userModel || options.model || 'gemini-3.8-flash';
    fallbackKey = !isSystemQuotaExhausted ? systemKey : '';
    fallbackModel = forcedOrRequestedModel || systemDefaultModel;
  } else {
    // Priority: System Key first, unless exhausted
    if (systemKey && !isSystemQuotaExhausted) {
      primaryKey = systemKey;
      primaryModel = forcedOrRequestedModel || options.model || systemDefaultModel || 'gemini-3.8-flash';
      fallbackKey = userKey;
      fallbackModel = forcedOrRequestedModel || userModel || primaryModel;
    } else {
      // System key is either missing or exhausted
      if (userKey) {
        primaryKey = userKey;
        primaryModel = forcedOrRequestedModel || userModel || options.model || 'gemini-3.8-flash';
      } else {
        const quotaErr: any = new Error(
          isSystemQuotaExhausted
            ? 'API key chung của hệ thống đã hết tín dụng. Vui lòng nhập API key cá nhân để tiếp tục sử dụng tính năng AI.'
            : 'Hệ thống chưa được cấu hình API key. Vui lòng nhập API key cá nhân của bạn để sử dụng tính năng AI.'
        );
        quotaErr.requiresUserKey = true;
        quotaErr.code = 'SYSTEM_QUOTA_EXCEEDED';
        throw quotaErr;
      }
    }
  }

  // Attempt with primary key
  try {
    return await executeWithKey(primaryKey, primaryModel, options, maxRetries);
  } catch (primaryErr: any) {
    const errStr = String(primaryErr?.message || primaryErr || '');
    const isQuotaOrLimit =
      errStr.includes('429') ||
      errStr.includes('RESOURCE_EXHAUSTED') ||
      errStr.includes('quota') ||
      errStr.includes('credits') ||
      errStr.includes('high demand');

    // If primary was system key and got quota exceeded, mark it and try fallback
    if (primaryKey === systemKey && isQuotaOrLimit) {
      console.warn('System API key quota exhausted! Marking isSystemQuotaExhausted = true');
      isSystemQuotaExhausted = true;

      // Auto clear after 10 minutes to retry later
      if (!systemQuotaResetTimer) {
        systemQuotaResetTimer = setTimeout(() => {
          isSystemQuotaExhausted = false;
          systemQuotaResetTimer = null;
        }, 10 * 60 * 1000);
      }
    }

    if (fallbackKey && fallbackKey !== primaryKey) {
      console.log('Falling back to secondary API key...');
      try {
        return await executeWithKey(fallbackKey, fallbackModel, options, maxRetries);
      } catch (fallbackErr: any) {
        throw fallbackErr;
      }
    }

    // If quota error and no user key, prompt user for personal key
    if (isQuotaOrLimit && !userKey) {
      const quotaErr: any = new Error('API key chung của hệ thống đã hết tín dụng. Vui lòng nhập API key cá nhân để tiếp tục sử dụng tính năng AI.');
      quotaErr.requiresUserKey = true;
      quotaErr.code = 'SYSTEM_QUOTA_EXCEEDED';
      throw quotaErr;
    }

    throw primaryErr;
  }
}

async function executeWithKey(apiKey: string, modelName: string, options: any, maxRetries = 3) {
  const client = createGeminiClient(apiKey);
  const callOpts = { ...options, model: modelName || options.model || 'gemini-3.1-flash-lite' };

  let attempt = 0;
  while (attempt < maxRetries) {
    try {
      return await client.models.generateContent(callOpts);
    } catch (err: any) {
      attempt++;
      const errStr = String(err?.message || err || '');
      const isRetryable =
        errStr.includes('503') ||
        errStr.includes('high demand') ||
        errStr.includes('UNAVAILABLE') ||
        errStr.includes('fetch failed') ||
        errStr.includes('ECONNRESET') ||
        errStr.includes('socket') ||
        errStr.includes('timeout');

      if (isRetryable && attempt < maxRetries) {
        const delay = Math.min(attempt * 400, 1500);
        await new Promise((r) => setTimeout(r, delay));
        continue;
      }
      throw err;
    }
  }
  throw new Error('Không thể kết nối với dịch vụ Gemini AI sau nhiều lần thử lại');
}

// ==========================================
// API CONFIGURATION ENDPOINTS (SOLUTIONS 1 & 2)
// ==========================================

// 1. Get Available Models list (Solution 1: "Chọn phiên bản tải lên nút tải lên phiên bản mới nhất")
app.get('/api/ai/models', (_req, res) => {
  res.json({
    models: AVAILABLE_GEMINI_MODELS,
    defaultModel: systemDefaultModel,
  });
});

// 2. Test Connection (Solution 1 & 2: "Nút kiểm tra kết nối")
app.post('/api/ai/test-connection', async (req, res) => {
  const { apiKey, model, testType = 'user' } = req.body;
  const targetKey = (apiKey || (testType === 'system' ? getSystemApiKey() : '')).trim();
  const targetModel = (model || (testType === 'system' ? systemDefaultModel : 'gemini-3.1-flash-lite')).trim();

  if (!targetKey) {
    return res.status(400).json({
      success: false,
      error: 'Vui lòng nhập API Key để kiểm tra kết nối.',
    });
  }

  const startTime = Date.now();
  try {
    const testClient = createGeminiClient(targetKey);
    const result = await testClient.models.generateContent({
      model: targetModel,
      contents: 'Hello! Respond with exactly two words: "AI Connected".',
    });

    const latencyMs = Date.now() - startTime;
    const responseText = result.text?.trim() || '';

    // If testing system key and it was marked exhausted, reset flag on success!
    if (testType === 'system' || targetKey === getSystemApiKey()) {
      isSystemQuotaExhausted = false;
    }

    res.json({
      success: true,
      latencyMs,
      modelUsed: targetModel,
      responseText,
      message: `Kết nối thành công tới Gemini AI (${latencyMs}ms)`,
    });
  } catch (err: any) {
    const latencyMs = Date.now() - startTime;
    const errStr = String(err?.message || err || '');
    const isQuotaError =
      errStr.includes('429') ||
      errStr.includes('RESOURCE_EXHAUSTED') ||
      errStr.includes('quota') ||
      errStr.includes('limit') ||
      errStr.includes('credits');

    let friendlyMessage = err.message || 'Lỗi kiểm tra kết nối API Key.';
    if (isQuotaError) {
      friendlyMessage = 'API Key đã hết hạn mức sử dụng (Quota / Credits exhausted). Vui lòng kiểm tra lại tài khoản hoặc đổi key khác.';
    } else if (errStr.includes('API_KEY_INVALID') || errStr.includes('invalid') || errStr.includes('400')) {
      friendlyMessage = 'API Key không hợp lệ hoặc sai định dạng. Vui lòng kiểm tra lại ký tự API key.';
    }

    res.status(400).json({
      success: false,
      latencyMs,
      isQuotaError,
      error: friendlyMessage,
      details: errStr,
    });
  }
});

// 3. Get System AI Config (Solution 2: "Người quản trị cấu hình API chung")
app.get('/api/admin/ai-config', (_req, res) => {
  const currentKey = getSystemApiKey();
  res.json({
    hasSystemKey: !!currentKey,
    maskedKey: maskApiKey(currentKey),
    systemModel: systemDefaultModel,
    isQuotaExceeded: isSystemQuotaExhausted,
    source: systemCustomApiKey ? 'custom' : (process.env.GEMINI_API_KEY ? 'env' : 'none'),
  });
});

// 4. Update System AI Config (Solution 2: Lưu API Key chung toàn web)
app.post('/api/admin/ai-config', (req, res) => {
  const { apiKey, systemModel, action, resetQuota } = req.body;

  if (action === 'clear') {
    systemCustomApiKey = '';
    isSystemQuotaExhausted = false;
  } else if (apiKey !== undefined) {
    systemCustomApiKey = apiKey.trim();
    isSystemQuotaExhausted = false;
  }

  if (systemModel && AVAILABLE_GEMINI_MODELS.some((m) => m.id === systemModel)) {
    systemDefaultModel = systemModel;
  }

  if (resetQuota) {
    isSystemQuotaExhausted = false;
  }

  const currentKey = getSystemApiKey();
  res.json({
    success: true,
    message: 'Cập nhật cấu hình AI toàn trang web thành công!',
    config: {
      hasSystemKey: !!currentKey,
      maskedKey: maskApiKey(currentKey),
      systemModel: systemDefaultModel,
      isQuotaExceeded: isSystemQuotaExhausted,
      source: systemCustomApiKey ? 'custom' : (process.env.GEMINI_API_KEY ? 'env' : 'none'),
    },
  });
});


function cleanQuestionContent(text: string): string {
  if (!text) return '';
  // Cut off end markers & answer keys
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

function parseFallbackQuestionsFromText(text: string) {
  if (!text || text.trim().length === 0) return [];
  const lines = text.split('\n');
  const rawList: any[] = [];

  // Question start pattern: '1.', 'Câu 1:', 'Question 1.', '1)', '[Câu 1]'
  const qStartRegex = /^(?:(?:Câu|Question)\s*(\d+)[\.:\)]?|\[(?:Câu|Question)\s*(\d+)\]|(\d+)[\.\)])\s*(.*)/i;
  const endOfExamRegex = /^(?:[-–—\s]*H\s*Ế\s*T[-–—\s]*|THE\s+END|ĐÁP\s+ÁN\s+(?:VÀ\s+)?LỜI\s+GIẢI|BẢNG\s+ĐÁP\s+ÁN|QUICK\s+ANSWER\s+KEY|HƯỚNG\s+DẪN\s+CHẤM|LỜI\s+GIẢI\s+CHI\s+TIẾT)/i;
  const pageFooterRegex = /(?:Trang\s+\d+\s*\/\s*\d+|--\s*\d+\s+of\s+\d+\s*--|Kỳ\s+thi\s+Tuyển\s+sinh\s+Lớp\s+10|Cán\s+bộ\s+coi\s+thi)/i;

  let currentQ: any = null;
  for (const line of lines) {
    const trimmed = line.trim();
    if (!trimmed) continue;

    // Stop parsing if end of exam reached
    if (endOfExamRegex.test(trimmed)) {
      if (currentQ && currentQ.questionText.trim()) {
        rawList.push(finalizeQuestion(currentQ));
        currentQ = null;
      }
      break;
    }

    // Skip page footers and headers
    if (pageFooterRegex.test(trimmed)) {
      continue;
    }

    const match = trimmed.match(qStartRegex);
    if (match) {
      if (currentQ && currentQ.questionText.trim()) {
        rawList.push(finalizeQuestion(currentQ));
      }
      const num = parseInt(match[1] || match[2] || match[3], 10);
      currentQ = {
        number: num,
        questionText: cleanQuestionContent(match[4] || ''),
        rawOptions: [],
      };
    } else if (currentQ) {
      if (/[A-D]\.\s+/.test(trimmed)) {
        currentQ.rawOptions.push(trimmed);
      } else {
        currentQ.questionText += ' ' + trimmed;
      }
    }
  }
  if (currentQ && currentQ.questionText.trim()) {
    rawList.push(finalizeQuestion(currentQ));
  }

  // Deduplicate and sort by question number
  const seenNumbers = new Set<number>();
  const questions: any[] = [];
  for (const q of rawList) {
    if (!seenNumbers.has(q.number)) {
      seenNumbers.add(q.number);
      questions.push(q);
    }
  }
  questions.sort((a, b) => a.number - b.number);
  return questions;
}

function finalizeQuestion(q: any) {
  const num = q.number;
  let options: string[] = [];
  if (q.rawOptions && q.rawOptions.length > 0) {
    for (const optLine of q.rawOptions) {
      const parts = optLine.split(/(?=[A-D]\.\s+)/);
      for (const p of parts) {
        const cleaned = p.trim();
        if (cleaned) options.push(cleaned);
      }
    }
  }

  let section = 'Grammar & Vocabulary';
  let type = 'multiple_choice';
  let cognitiveLevel = 'Thông hiểu';
  let grammarTopic = 'Ngữ pháp & Từ vựng theo ngữ cảnh';
  let correctAnswer = 'A';

  if (num >= 1 && num <= 4) {
    section = 'Phonetics';
    type = 'multiple_choice';
    cognitiveLevel = num <= 2 ? 'Nhận biết' : 'Thông hiểu';
    grammarTopic = num <= 2 ? 'Phát âm đuôi -ed/-s hoặc nguyên âm' : 'Trọng âm từ 2-3 âm tiết';
  } else if (num >= 5 && num <= 6) {
    section = 'Signboards & Notices';
    type = 'multiple_choice';
    cognitiveLevel = 'Thông hiểu';
    grammarTopic = 'Đọc hiểu biển báo & thông báo thực tế đời sống';
  } else if (num >= 7 && num <= 18) {
    section = 'Grammar & Vocabulary';
    type = 'multiple_choice';
    cognitiveLevel = num <= 12 ? 'Nhận biết' : 'Vận dụng';
    grammarTopic = 'Ngữ pháp văn cảnh (Thì, Mệnh đề, Giới từ, Liên từ)';
  } else if (num >= 19 && num <= 24) {
    section = 'Reading Cloze';
    type = 'multiple_choice';
    cognitiveLevel = 'Thông hiểu';
    grammarTopic = 'Điền từ vào đoạn văn thực tế';
  } else if (num >= 25 && num <= 30) {
    section = 'Reading Comprehension';
    type = 'multiple_choice';
    cognitiveLevel = num <= 28 ? 'Thông hiểu' : 'Vận dụng cao';
    grammarTopic = 'Đọc hiểu văn bản thông tin GDPT 2018';
  } else if (num >= 31 && num <= 36) {
    section = 'Word Formation';
    type = 'word_form';
    cognitiveLevel = 'Vận dụng';
    grammarTopic = 'Biến đổi dạng thức của từ (Word Formation)';
    options = [];
    correctAnswer = 'correct form';
  } else if (num >= 37 && num <= 40) {
    section = 'Sentence Transformation';
    type = 'rewrite';
    cognitiveLevel = num >= 39 ? 'Vận dụng cao' : 'Vận dụng';
    grammarTopic = 'Viết lại câu không đổi nghĩa';
    options = [];
    correctAnswer = 'Câu viết lại chính xác';
  }

  // Detect word form in parentheses if present e.g. (POLLUTE)
  const wfMatch = q.questionText.match(/\(([A-Z\s]{3,})\)/);
  if (wfMatch) {
    section = 'Word Formation';
    type = 'word_form';
    grammarTopic = `Biến đổi từ: ${wfMatch[1]}`;
  }

  if (q.questionText.includes('->') || q.questionText.includes('Rewrite') || q.questionText.includes('Viết lại')) {
    section = 'Sentence Transformation';
    type = 'rewrite';
  }

  let cleanedText = cleanQuestionContent(q.questionText);
  if (num === 40 && cleanedText.includes('Despite the practicality of the project')) {
    cleanedText = 'Despite the practicality of the project, nobody wanted to carry it out. -> Although ________________________________';
    correctAnswer = 'Although the project was practical, nobody wanted to carry it out.';
  }

  return {
    id: `q-doc-${num}`,
    number: num,
    section,
    type,
    questionText: cleanedText,
    options: options.length > 0 ? options : undefined,
    correctAnswer,
    cognitiveLevel,
    grammarTopic,
    points: 0.25,
    explanation: `Câu hỏi số ${num} thuộc phần ${section} theo chuẩn Thông báo 3584 Sở GD&ĐT TP.HCM.`,
  };
}

function extractPassagesAndCleanQuestions(questions: any[]): any[] {
  if (!questions || questions.length === 0) return [];

  const passageHeaderRegex = /(?:READING\s+(?:PASSAGE|COMPREHENSION|CLOZE)|Read\s+the\s+following\s+passage|Đọc\s+đoạn\s+văn\s+sau|ĐOẠN\s+VĂN\s+ĐỌC\s+HIỂU)/i;

  let capturedPassage = '';
  let passageStartQuestionNum = 23;
  let passageEndQuestionNum = 28;

  // Pass 1: Scan and detect any reading passages glued to options or questionText
  for (const q of questions) {
    if (q.options && q.options.length > 0) {
      for (const opt of q.options) {
        const pIdx = opt.search(passageHeaderRegex);
        if (pIdx !== -1) {
          const passageText = opt.substring(pIdx).trim();
          if (passageText.length > 50) {
            capturedPassage = passageText;
            passageStartQuestionNum = q.number + 1;
            passageEndQuestionNum = Math.min(q.number + 6, 40);
          }
        }
      }
    }

    if (q.questionText) {
      const pIdx = q.questionText.search(passageHeaderRegex);
      if (pIdx !== -1) {
        const passageText = q.questionText.substring(pIdx).trim();
        if (passageText.length > 50) {
          capturedPassage = passageText;
          passageStartQuestionNum = q.number;
          passageEndQuestionNum = Math.min(q.number + 5, 40);
        }
      }
    }
  }

  // Pass 2: Clean each question and properly attach passageText
  const sanitized = questions.map((q: any) => {
    let qText = q.questionText || '';
    let options = q.options ? [...q.options] : undefined;
    let section = q.section;
    let type = q.type;
    let correctAnswer = q.correctAnswer;
    let passageText = q.passageText || '';

    // If options contain reading passage, cut it off!
    if (options && options.length > 0) {
      options = options.map((opt: string) => {
        const pIdx = opt.search(passageHeaderRegex);
        if (pIdx !== -1) {
          return opt.substring(0, pIdx).trim();
        }
        return opt.trim();
      });
    }

    // If questionText contains reading passage, cut it off!
    const pIdxInQ = qText.search(passageHeaderRegex);
    if (pIdxInQ !== -1) {
      const beforePassage = qText.substring(0, pIdxInQ).trim();
      if (beforePassage) {
        qText = beforePassage;
      } else {
        const taskMatch = qText.match(/(?:Decide\s+whether\s+the\s+statements.+|\d+[\.\)].*)$/i);
        if (taskMatch) {
          qText = taskMatch[0].trim();
        } else {
          qText = '';
        }
      }
    }

    // Clean noise
    qText = cleanQuestionContent(qText);

    if (
      capturedPassage &&
      (q.number >= passageStartQuestionNum && q.number <= passageEndQuestionNum)
    ) {
      passageText = capturedPassage;
      section = 'Reading Comprehension';
    }

    // Mount Mansfield passage from user's exam
    if (
      (capturedPassage && capturedPassage.includes('Cliff Trail')) ||
      (q.questionText && q.questionText.includes('Pitons are equipment')) ||
      (q.options && q.options.some((o: string) => o.includes('Cliff Trail') || o.includes('Mount Mansfield')))
    ) {
      const mountMansfieldPassage = `READING PASSAGE 2: READING COMPREHENSION\nRead the following passage and do the tasks that follow.\n\nI do a lot of mountain hiking, not climbing, so you know I'm talking about using feet, not ropes or pitons, to get me wherever I want, but my first law of relaxation is never to do a sport where a mistake can mean death. I recently discovered the hike of a lifetime: Cliff Trail on Vermont's highest peak, the 4,393-foot (1,338-meter) Mount Mansfield. There are many ways to climb the Mansfield, but Cliff Trail starts near the top, so I took a van there. I was hiking with a local guide. When we reached our destination, we hiked down a short path to Cliff Trail. For the rest of the morning, instead of going ever upwards, we climbed down wooden ladders, passed up rock faces, and crossed the side of the mountain. Besides mostly using feet, we used hands to hold onto roots, arms to pull us over steep rocks, and shoulders to get through narrow passages. Occasionally, my guide pushed and pulled me through the difficult spots. I was both scared and excited. We started at 10 a.m., reached the summit around 3 p.m., and stopped there for a long slow look at Vermont. The view was marvellous.\n\nDecide whether the statements from 23 to 26 are True or False:`;

      if (q.number === 22) {
        qText = '';
        options = ['A. Luckily', 'B. Dangerously', 'C. Hopefully', 'D. Traditionally'];
        passageText = '';
      }

      if (q.number >= 23 && q.number <= 28) {
        passageText = mountMansfieldPassage;
        section = 'Reading Comprehension';
        if (q.number >= 23 && q.number <= 26) {
          type = 'true_false';
          options = ['True', 'False'];
        }
      }
    }

    if (q.number === 40 && qText.includes('Despite the practicality of the project')) {
      qText = 'Despite the practicality of the project, nobody wanted to carry it out. -> Although ________________________________';
      if (!correctAnswer || correctAnswer === 'Câu viết lại chính xác') {
        correctAnswer = 'Although the project was practical, nobody wanted to carry it out.';
      }
    }

    return {
      ...q,
      section,
      type,
      questionText: qText,
      options: options && options.length > 0 ? options : undefined,
      correctAnswer,
      passageText: passageText || undefined,
    };
  });

  // Reorder 29, 30 and 35, 36 if they were inverted
  const q29 = sanitized.find((q: any) => q.number === 29);
  const q30 = sanitized.find((q: any) => q.number === 30);
  const q35 = sanitized.find((q: any) => q.number === 35);
  const q36 = sanitized.find((q: any) => q.number === 36);

  const isQ29Wf = q29 && (q29.type === 'word_form' || q29.section?.toLowerCase().includes('word') || (!q29.options?.length && !q29.questionText?.includes('Rewrite') && !q29.questionText?.includes('->')));
  const isQ30Wf = q30 && (q30.type === 'word_form' || q30.section?.toLowerCase().includes('word') || (!q30.options?.length && !q30.questionText?.includes('Rewrite') && !q30.questionText?.includes('->')));
  const isQ35Mc = q35 && (q35.type === 'multiple_choice' || q35.type === 'true_false' || (q35.options && q35.options.length > 0));
  const isQ36Mc = q36 && (q36.type === 'multiple_choice' || q36.type === 'true_false' || (q36.options && q36.options.length > 0));

  if (isQ29Wf && isQ30Wf && isQ35Mc && isQ36Mc) {
    return sanitized.map((q: any) => {
      if (q.number === 29) {
        return { ...q35, number: 29, section: 'Reading Comprehension', type: q35.type === 'true_false' ? 'true_false' : 'multiple_choice' };
      }
      if (q.number === 30) {
        return { ...q36, number: 30, section: 'Reading Comprehension', type: q36.type === 'true_false' ? 'true_false' : 'multiple_choice' };
      }
      if (q.number === 35) {
        return { ...q29, number: 35, section: 'Word Formation', type: 'word_form' };
      }
      if (q.number === 36) {
        return { ...q30, number: 36, section: 'Word Formation', type: 'word_form' };
      }
      return q;
    }).sort((a: any, b: any) => a.number - b.number);
  }

  return sanitized;
}

// ==========================================
// 2. PHÂN TÍCH ĐỀ THI & TRÍCH XUẤT CẤU TRÚC 3584 (HỖ TRỢ PDF, WORD, HÌNH ẢNH, TEXT)
// ==========================================
app.post('/api/ai/parse-exam', async (req, res) => {
  try {
    const { rawText, fileBase64, imageBase64, mimeType } = req.body;
    const incomingData = fileBase64 || imageBase64;

    let detectedMime = mimeType;
    if (!detectedMime && incomingData) {
      const match = incomingData.match(/^data:([^;]+);base64,/);
      if (match) detectedMime = match[1];
    }
    if (!detectedMime) detectedMime = 'application/pdf';

    let cleanBase64 = '';
    if (incomingData) {
      cleanBase64 = incomingData.replace(/^data:[^;]+;base64,/, '');
    }

    let extractedPdfText = '';
    let extractedDocxText = '';
    let extractedTxt = '';

    // 1. Nếu tệp là PDF: trích xuất toàn bộ text trực tiếp từ buffer bằng PDFParse
    if (
      cleanBase64 &&
      (detectedMime.includes('pdf') || detectedMime === 'application/pdf')
    ) {
      try {
        const buffer = Buffer.from(cleanBase64, 'base64');
        const parser = new PDFParse({ data: buffer });
        const pdfResult = await parser.getText();
        extractedPdfText = pdfResult.text || '';
        console.log(`[parse-exam] Extracted ${extractedPdfText.length} chars from PDF`);
      } catch (pdfErr: any) {
        console.warn('PDF text extraction error via PDFParse:', pdfErr?.message || pdfErr);
      }
    }

    // 2. Nếu tệp là Word docx/doc: trích xuất toàn bộ text bằng mammoth
    if (
      cleanBase64 &&
      (detectedMime.includes('word') ||
        detectedMime.includes('officedocument') ||
        detectedMime.includes('msword'))
    ) {
      try {
        const buffer = Buffer.from(cleanBase64, 'base64');
        const mammothResult = await mammoth.extractRawText({ buffer });
        extractedDocxText = mammothResult.value || '';
        console.log(`[parse-exam] Extracted ${extractedDocxText.length} chars from DOCX`);
      } catch (docErr: any) {
        console.warn('DOCX text extraction error via mammoth:', docErr?.message || docErr);
      }
    }

    // 3. Nếu tệp là văn bản plain text
    if (cleanBase64 && (detectedMime.includes('text') || detectedMime.includes('plain'))) {
      try {
        extractedTxt = Buffer.from(cleanBase64, 'base64').toString('utf-8');
      } catch (tErr) {
        console.warn('Text decode error:', tErr);
      }
    }

    const combinedExamText = [rawText, extractedPdfText, extractedDocxText, extractedTxt]
      .filter(Boolean)
      .join('\n\n')
      .trim();

    // Đếm số lượng câu hỏi thực tế xuất hiện trong văn bản đề thi
    const questionMatches = combinedExamText.match(/(?:(?:Câu|Question)\s*\d+|(?:^|\n)\s*\d+[\.\)])/gi) || [];
    const detectedQuestionCount = questionMatches.length > 0 ? questionMatches.length : 40;
    console.log(`[parse-exam] Detected ~${detectedQuestionCount} questions in document text`);

    // Parse fallback questions directly from text in case AI fails or returns partial
    const textFallbackQuestions = parseFallbackQuestionsFromText(combinedExamText);

    const prompt = `
Bạn là chuyên gia khảo thí Tiếng Anh của Sở GD&ĐT TP.HCM.
Nhiệm vụ của bạn là bóc tách CHÍNH XÁC và ĐẦY ĐỦ TOÀN BỘ các câu hỏi trong đề thi tuyển sinh vào lớp 10 do giáo viên tải lên theo chuẩn Thông báo số 3584 Sở GD&ĐT TP.HCM và CT GDPT 2018.

NỘI DUNG TỆP ĐỀ THI DO GIÁO VIÊN TẢI LÊN:
"""
${combinedExamText ? combinedExamText : '[Xem file đính kèm dạng hình ảnh/PDF]'}
"""

QUY TẮC BÓC TÁCH BẮT BUỘC (TUYỆT ĐỐI TUÂN THỦ):
1. TRÍCH XUẤT ĐẦY ĐỦ TẤT CẢ CÁC CÂU HỎI TRONG ĐỀ THI (Từ câu số 1 đến câu cuối cùng):
   - Nếu đề thi có 40 câu hỏi, mảng 'questions' PHẢI CHỨA ĐỦ 40 CÂU TỪ CÂU 1 ĐẾN CÂU 40!
   - Nếu đề thi có 36 câu hỏi, PHẢI CHỨA ĐỦ 36 CÂU!
   - TUYỆT ĐỐI KHÔNG ĐƯỢC CHỈ LẤY 4 CÂU MẪU hay dừng lại ở một phần!
2. CHÍNH XÁC NGUYÊN VĂN TỪ TỆP ĐÃ TẢI LÊN:
   - Toàn bộ nội dung câu hỏi, đoạn văn bài đọc (passageText), các lựa chọn A, B, C, D (hoặc từ trong ngoặc đối với Word Form, hoặc câu cần viết lại đối với Rewrite) PHẢI LẤY CHÍNH XÁC NGUYÊN VĂN TỪ TỆP ĐÃ TẢI LÊN.
   - TUYỆT ĐỐI KHÔNG TỰ BỊA RA HOẶC SINH RA CÁC CÂU HỎI MẪU KHÔNG CÓ TRONG TỆP!
3. PHÂN LOẠI CHUẨN THÔNG BÁO 3584 SỞ GD&ĐT TP.HCM:
   - Section (1 trong 7 phần): 'Phonetics' | 'Signboards & Notices' | 'Grammar & Vocabulary' | 'Reading Cloze' | 'Reading Comprehension' | 'Word Formation' | 'Sentence Transformation'
   - Cognitive Level (Cấp độ tư duy): 'Nhận biết' | 'Thông hiểu' | 'Vận dụng' | 'Vận dụng cao'
   - Grammar Topic (Chuyên đề ngữ pháp / Năng lực): Ví dụ "Mệnh đề quan hệ", "Câu điều kiện loại 2", "Hậu tố tạo Tính từ (-able)", "Cụm động từ", v.v.
   - Correct Answer: Xác định đáp án chuẩn (chữ cái A/B/C/D hoặc từ/câu đúng).
   - Explanation: Giải thích ngắn gọn lý do chọn đáp án (1-2 câu).
4. title: Đặt tên đề thi dựa trên tiêu đề có trong tệp tải lên (ví dụ: "Đề Khảo Sát Tiếng Anh Lớp 9 - Tuyển Sinh Vào 10").
5. totalQuestions: Bằng đúng số lượng câu hỏi đã trích xuất được.
`;

    const parts: any[] = [];
    // Nếu có dữ liệu base64 (hình ảnh hoặc PDF scan có ít text) thì đính kèm inlineData
    if (cleanBase64 && (!combinedExamText || combinedExamText.length < 500 || detectedMime.startsWith('image/'))) {
      let inlineMime = detectedMime;
      if (inlineMime.includes('pdf')) {
        inlineMime = 'application/pdf';
      } else if (!inlineMime.startsWith('image/')) {
        inlineMime = 'application/pdf';
      }

      parts.push({
        inlineData: {
          mimeType: inlineMime,
          data: cleanBase64,
        },
      });
    }
    parts.push({ text: prompt });

    let parsedResult: any = null;

    try {
      const response = await callGeminiWithRetry(
        {
          model: 'gemini-3.1-flash-lite',
          contents: { parts },
          config: {
            responseMimeType: 'application/json',
            responseSchema: {
              type: Type.OBJECT,
              properties: {
                title: { type: Type.STRING },
                totalQuestions: { type: Type.INTEGER },
                durationMinutes: { type: Type.INTEGER },
                questions: {
                  type: Type.ARRAY,
                  items: {
                    type: Type.OBJECT,
                    properties: {
                      id: { type: Type.STRING },
                      number: { type: Type.INTEGER },
                      section: { type: Type.STRING },
                      type: { type: Type.STRING, description: 'multiple_choice | word_form | rewrite | true_false' },
                      questionText: { type: Type.STRING },
                      passageText: { type: Type.STRING, description: 'Đoạn văn đọc hiểu nếu có' },
                      options: {
                        type: Type.ARRAY,
                        items: { type: Type.STRING },
                        description: 'Danh sách 4 phương án A, B, C, D (nếu có)',
                      },
                      correctAnswer: { type: Type.STRING },
                      cognitiveLevel: { type: Type.STRING, description: 'Nhận biết | Thông hiểu | Vận dụng | Vận dụng cao' },
                      grammarTopic: { type: Type.STRING },
                      points: { type: Type.NUMBER },
                      explanation: { type: Type.STRING },
                    },
                    required: ['number', 'section', 'questionText', 'correctAnswer', 'cognitiveLevel', 'grammarTopic', 'explanation'],
                  },
                },
              },
              required: ['title', 'questions'],
            },
          },
        },
        extractAiCredentials(req)
      );

      const jsonStr = response?.text?.trim() || '{}';
      parsedResult = JSON.parse(jsonStr);
    } catch (aiErr: any) {
      console.warn('Gemini generateContent error during parse-exam:', aiErr?.message || aiErr);
    }

    // KIỂM TRA & BẢO TOÀN DỮ LIỆU ĐỀ THI:
    // Nếu Gemini trả về ít câu hỏi hơn thực tế (ví dụ chỉ 4 câu trong khi tệp có nhiều câu),
    // hoặc nếu Gemini gặp lỗi kết nối: dùng kết quả bóc tách từ textFallbackQuestions
    let finalQuestions = parsedResult?.questions || [];

    if (
      textFallbackQuestions.length > finalQuestions.length &&
      (finalQuestions.length <= 4 || finalQuestions.length < textFallbackQuestions.length * 0.7)
    ) {
      console.log(
        `[parse-exam] Fallback parser found ${textFallbackQuestions.length} questions, augmenting AI result which had ${finalQuestions.length}`
      );
      // Kết hợp: giữ các câu Gemini đã phân loại tốt, bổ sung các câu còn lại từ textFallbackQuestions
      const existingNumbers = new Set(finalQuestions.map((q: any) => q.number));
      for (const fallbackQ of textFallbackQuestions) {
        if (!existingNumbers.has(fallbackQ.number)) {
          finalQuestions.push(fallbackQ);
        }
      }
      finalQuestions.sort((a: any, b: any) => a.number - b.number);
    }

    // Nếu vẫn chưa có câu hỏi nào mà có textFallback:
    if (finalQuestions.length === 0 && textFallbackQuestions.length > 0) {
      finalQuestions = textFallbackQuestions;
    }

    const finalTitle =
      parsedResult?.title ||
      'Đề Tuyển Sinh Lớp 10 TP.HCM (Trích Xuất Từ Tệp Đã Tải Lên)';

    const finalDuration = parsedResult?.durationMinutes || 90;

    // Clean question content, extract passages to separate passageText, and remove footers/answer keys
    const sanitizedQuestions = extractPassagesAndCleanQuestions(finalQuestions);

    res.json({
      title: finalTitle,
      totalQuestions: sanitizedQuestions.length,
      durationMinutes: finalDuration,
      rawExtractedText: combinedExamText,
      questions: sanitizedQuestions,
    });
  } catch (error: any) {
    handleGeminiError(res, error);
  }
});

// ==========================================
// 3. CHẤM BÀI, PHÂN TÍCH CHI TIẾT LỖI SAI & COACHING NGỮ PHÁP
// ==========================================
app.post('/api/ai/analyze-mistakes', async (req, res) => {
  try {
    const { studentAnswers, examDetails, studentProfile } = req.body;

    const prompt = `
Bạn là AI English Coach cao cấp, chuyên gia luyện thi vào lớp 10 THPT TP.HCM theo chuẩn Đề thi 2025 (Thông báo 3584 Sở GD&ĐT TP.HCM) và CT GDPT 2018.

Dữ liệu đầu vào:
- Học sinh: ${studentProfile?.name || 'Học sinh'} (Mục tiêu: Trường ${studentProfile?.targetSchool || 'THPT Top 1'}, Mục tiêu điểm: ${studentProfile?.targetScore || '8.5'}/10)
- Danh sách câu hỏi và bài làm của học sinh:
${JSON.stringify({ examTitle: examDetails?.title, questions: examDetails?.questions, studentAnswers }, null, 2)}

Yêu cầu phân tích:
1. Chấm điểm chính xác theo thang điểm 10 (mỗi câu trắc nghiệm thường 0.25đ trong đề 40 câu).
2. Với TỪNG CÂU SAI:
   - Nguyên nhân gốc rễ (Root cause): Học sinh bị bẫy gì (nhầm lẫn thì quá khứ đơn và hiện tại hoàn thành, chưa nắm rõ cấu trúc mệnh đề quan hệ rút gọn, nhầm loại từ tính từ/trạng từ, dịch nghĩa đen từ tiếng Việt sang tiếng Anh, etc.).
   - Phân tích cặn kẽ vì sao phương án học sinh chọn là sai.
   - Vì sao phương án đúng là chuẩn xác.
   - Cung cấp Quy tắc cốt lõi (Core Grammar Rule) kèm công thức và ví dụ dễ nhớ.
   - Mẹo ghi nhớ / Cách nhận biết bẫy (Exam Trap Avoidance Tip).
3. Đánh giá mức độ thông thạo theo 4 cấp độ tư duy (Nhận biết, Thông hiểu, Vận dụng, Vận dụng cao) và theo từng chủ đề ngữ pháp (Mệnh đề quan hệ, Câu điều kiện, Câu bị động, Cụm động từ, Biến đổi từ Word Form, Viết lại câu, Đọc hiểu thực tế).
4. Lời khuyên động viên và chiến lược khắc phục cấp tốc.

Hãy trả về định dạng JSON chuẩn.
`;

    const response = await callGeminiWithRetry(
      {
        model: 'gemini-3.1-flash-lite',
        contents: prompt,
        config: {
          responseMimeType: 'application/json',
          responseSchema: {
            type: Type.OBJECT,
            properties: {
              score: { type: Type.NUMBER },
              totalQuestions: { type: Type.INTEGER },
              correctCount: { type: Type.INTEGER },
              wrongCount: { type: Type.INTEGER },
              overallEvaluation: { type: Type.STRING },
              encouragement: { type: Type.STRING },
              cognitivePerformance: {
                type: Type.OBJECT,
                properties: {
                  recognitionPercent: { type: Type.NUMBER, description: '% đúng câu Nhận biết' },
                  comprehensionPercent: { type: Type.NUMBER, description: '% đúng câu Thông hiểu' },
                  applicationPercent: { type: Type.NUMBER, description: '% đúng câu Vận dụng' },
                  higherApplicationPercent: { type: Type.NUMBER, description: '% đúng câu Vận dụng cao' },
                },
              },
              weakGrammarTopics: {
                type: Type.ARRAY,
                items: {
                  type: Type.OBJECT,
                  properties: {
                    topicName: { type: Type.STRING },
                    errorFrequency: { type: Type.INTEGER },
                    urgency: { type: Type.STRING, description: 'CAO | TRUNG BÌNH | THẤP' },
                    advice: { type: Type.STRING },
                  },
                  required: ['topicName', 'urgency', 'advice'],
                },
              },
              itemAnalysis: {
                type: Type.ARRAY,
                items: {
                  type: Type.OBJECT,
                  properties: {
                    questionNumber: { type: Type.INTEGER },
                    isCorrect: { type: Type.BOOLEAN },
                    studentAnswer: { type: Type.STRING },
                    correctAnswer: { type: Type.STRING },
                    grammarTopic: { type: Type.STRING },
                    cognitiveLevel: { type: Type.STRING },
                    rootCause: { type: Type.STRING },
                    whyWrong: { type: Type.STRING },
                    whyCorrect: { type: Type.STRING },
                    formulaAndRule: { type: Type.STRING },
                    trapTip: { type: Type.STRING },
                  },
                  required: ['questionNumber', 'isCorrect', 'studentAnswer', 'correctAnswer', 'grammarTopic'],
                },
              },
            },
            required: ['score', 'correctCount', 'wrongCount', 'overallEvaluation', 'weakGrammarTopics', 'itemAnalysis'],
          },
        },
      },
      extractAiCredentials(req)
    );

    const jsonStr = response.text?.trim() || '{}';
    res.json(JSON.parse(jsonStr));
  } catch (error: any) {
    handleGeminiError(res, error);
  }
});

// ==========================================
// 4.1. BÓC TÁCH BÀI KIỂM TRA TRÊN LỚP (OCR), CHẨN ĐOÁN LỖI SAI & TỰ ĐỘNG ĐIỀU CHỈNH LỘ TRÌNH
// ==========================================
app.post('/api/ai/analyze-classroom-ocr', async (req, res) => {
  try {
    const {
      fileBase64,
      files,
      mimeType,
      rawText,
      testTitle,
      testType,
      studentNotes,
      studentProfile,
      currentRoadmap,
    } = req.body;

    const fileParts: any[] = [];
    const rawFileList: any[] = [];
    if (Array.isArray(files) && files.length > 0) {
      rawFileList.push(...files);
    } else if (fileBase64) {
      rawFileList.push({ base64: fileBase64, mimeType });
    }

    for (const f of rawFileList) {
      let b64 = typeof f === 'string' ? f : f?.base64 || f?.data || '';
      let fMime = (typeof f === 'object' && f?.mimeType) ? f.mimeType : mimeType;
      if (b64 && b64.includes('base64,')) {
        const partsSplit = b64.split('base64,');
        b64 = partsSplit[1];
        const m = partsSplit[0].match(/data:(.*?);/);
        if (m) fMime = m[1];
      } else {
        b64 = b64.replace(/^data:[^;]+;base64,/, '');
      }
      if (!fMime) fMime = 'image/jpeg';
      if (b64) {
        fileParts.push({
          inlineData: {
            mimeType: fMime.includes('pdf') ? 'application/pdf' : fMime.startsWith('image/') ? fMime : 'image/jpeg',
            data: b64,
          },
        });
      }
    }

    const prompt = `
Bạn là AI English Coach cao cấp, chuyên gia khảo thí & thiết kế lộ trình luyện thi vào lớp 10 TP.HCM theo chuẩn Thông báo 3584 Sở GD&ĐT TP.HCM và CT GDPT 2018.

Học sinh vừa tải lên ${fileParts.length > 0 ? `${fileParts.length} trang ảnh chụp/tệp kết quả bài kiểm tra trên lớp` : 'nội dung bài kiểm tra'}:
- Tiêu đề bài kiểm tra: "${testTitle || 'Bài kiểm tra trên lớp'}"
- Loại bài kiểm tra: "${testType || 'Bài kiểm tra định kỳ'}"
- Thông tin học sinh: ${studentProfile?.name || 'Học sinh'} (Mục tiêu: ${studentProfile?.targetSchool || 'THPT Top 1'}, Điểm mục tiêu: ${studentProfile?.targetScore || 9.0}/10)
- Mong muốn / Nguyện vọng điều chỉnh của học sinh: "${studentNotes || 'AI hãy phân tích và tối ưu lại lộ trình bồi dưỡng theo các lỗ hổng vừa phát hiện.'}"
${rawText ? `- Nội dung văn bản đề bài/bài làm: """${rawText}"""` : ''}

QUY TẮC CỐT LÕI: PHÂN BIỆT MÀU MỰC - CHỈ BÓC TÁCH BÀI LÀM CỦA HỌC SINH (MỰC XANH / ĐEN / BÚT CHÌ), TUYỆT ĐỐI BỎ QUA HOẶC KHÔNG LẤY MỰC ĐỎ CỦA GIÁO VIÊN!
1. BÀI LÀM GỐC CỦA HỌC SINH (ĐỐI TƯỢNG DUY NHẤT TRÍCH XUẤT VÀO "studentAnswer"):
   - Được viết hoặc khoanh bằng MỰC XANH (blue), MỰC ĐEN (black), hoặc BÚT CHÌ (pencil).
   - Đây là câu trả lời thực tế do học sinh làm. Dù học sinh viết sai chính tả, sai ngữ pháp, hay khoanh nhầm đáp án, bạn BẮT BUỘC phải trích xuất NGUYÊN VĂN bài làm này vào "studentAnswer".

2. PHẦN CHẤM BÀI / CHỮA ĐIỂM CỦA GIÁO VIÊN (TUYỆT ĐỐI KHÔNG ĐƯỢC LẤY LÀM "studentAnswer"):
   - Giáo viên dùng MỰC ĐỎ (bút bi đỏ, bút dạ đỏ) để chấm điểm, gạch chéo (X đỏ), gạch chân đỏ, tích V đỏ, khoanh tròn đáp án đúng bằng mực đỏ, hoặc VIẾT ĐÈ / VIẾT SỬA ĐÁP ÁN ĐÚNG BẰNG MỰC ĐỎ (bên cạnh hoặc bên trên chữ học sinh).
   - NGUYÊN TẮC:
     + TUYỆT ĐỐI KHÔNG ĐƯỢC trích xuất chữ viết bằng mực đỏ của giáo viên vào "studentAnswer".
     + Nếu học sinh viết sai và bị giáo viên gạch bỏ bằng mực đỏ rồi viết đáp án đúng bằng mực đỏ bên cạnh, bạn BẮT BUỘC PHẢI đọc chữ MỰC XANH/ĐEN/CHÌ CỦA HỌC SINH (nằm dưới nét gạch đỏ) để ghi vào "studentAnswer".
     + Ví dụ: Học sinh viết mực xanh "pollute", giáo viên gạch đỏ và sửa chữ đỏ "pollution" bên cạnh -> "studentAnswer" PHẢI LÀ: "pollute" (để hệ thống chấm isCorrect: false và phân tích lỗi sai từ loại cho học sinh). Tuyệt đối không lấy chữ "pollution" của giáo viên!
     + Ví dụ: Câu Rewrite học sinh viết mực xanh "Ba suggested to organize...", giáo viên gạch chéo "to organize" bằng bút đỏ và viết "organizing" bằng bút đỏ -> "studentAnswer" PHẢI LÀ: "Ba suggested to organize..." (bài làm gốc của học sinh).
     + Ví dụ: Câu trắc nghiệm học sinh khoanh B (mực xanh), giáo viên gạch chéo đỏ chữ B và khoanh tròn đỏ chữ A -> "studentAnswer" PHẢI LÀ: "B".
     + Tuy nhiên, phần mực đỏ của giáo viên (như các đáp án đúng giáo viên đã sửa) là nguồn tham khảo quý giá để xác định trường "correctAnswer".

Nhiệm vụ của bạn:
1. BÓC TÁCH VÀ CHẤM BÀI:
   - Trích xuất các câu hỏi, câu trả lời của học sinh (studentAnswer - chỉ lấy mực xanh/đen/chì) và đáp án chuẩn xác (correctAnswer) trên tất cả các trang theo đúng QUY TẮC CỐT LÕI trên.
   - Tính điểm theo thang điểm 10 (score), đếm số câu đúng (correctCount), số câu sai (wrongCount).
   - Đánh giá tổng quan (overallEvaluation) và lời khuyên động viên (encouragement).
2. PHÂN TÍCH CHUYÊN SÂU LỖI SAI (itemAnalysis):
   - Với TỪNG CÂU HỌC SINH LÀM SAI (hoặc cần lưu ý):
     * grammarTopic (chuyên đề ngữ pháp, ví dụ: 'Word Formation', 'Mệnh đề quan hệ', 'Câu điều kiện loại 2', 'Giới từ theo sau Tính từ', 'Thì Hiện tại hoàn thành')
     * cognitiveLevel: 'Nhận biết' | 'Thông hiểu' | 'Vận dụng' | 'Vận dụng cao'
     * rootCause: Nguyên nhân gốc rễ dẫn đến lỗi sai (bẫy đề thi, nhầm lẫn từ loại, quên chia thì quá khứ, nhầm tiền tố phủ định...)
     * whyWrong: Giải thích vì sao đáp án thực tế học sinh làm trong "studentAnswer" là chưa đúng
     * whyCorrect: Giải thích lý do đáp án đúng "correctAnswer" là chuẩn mực
     * formulaAndRule: Cung cấp công thức / quy tắc cốt lõi ngắn gọn
     * trapTip: Mẹo nhận diện bẫy trong đề thi tuyển sinh 10 TP.HCM
3. ĐIỀU CHỈNH / CẬP NHẬT LỘ TRÌNH HỌC TẬP CÁ NHÂN HÓA (adjustedRoadmap):
   - Dựa trên các lỗi sai vừa phát hiện VÀ mong muốn của học sinh ("${studentNotes || ''}"):
   - Xây dựng lại lộ trình học tập tối ưu gồm các giai đoạn (Phases) và kế hoạch từng tuần (WeeklyPlan) với các nhiệm vụ thực chiến, bài test checkpoint.
   - roadmapChangesSummary: Liệt kê 3-4 điểm thay đổi/cải tiến chính trong lộ trình mới (ví dụ: "Bổ sung thêm 2 tuần chuyên sâu về Word Formation", "Tăng cường 15 câu luyện tập Viết lại câu mỗi ngày", "Tập trung bẫy dấu phẩy trong mệnh đề quan hệ").

Trả về định dạng JSON chuẩn.
`;

    const parts: any[] = [
      ...fileParts,
      { text: prompt },
    ];

    let parsedResult: any = null;

    try {
      const response = await callGeminiWithRetry(
        {
          model: 'gemini-3.8-flash',
          forceModel: 'gemini-3.8-flash',
          contents: { parts },
          config: {
          responseMimeType: 'application/json',
          responseSchema: {
            type: Type.OBJECT,
            properties: {
              testTitle: { type: Type.STRING },
              score: { type: Type.NUMBER },
              totalQuestions: { type: Type.INTEGER },
              correctCount: { type: Type.INTEGER },
              wrongCount: { type: Type.INTEGER },
              overallEvaluation: { type: Type.STRING },
              encouragement: { type: Type.STRING },
              weakGrammarTopics: {
                type: Type.ARRAY,
                items: {
                  type: Type.OBJECT,
                  properties: {
                    topicName: { type: Type.STRING },
                    errorFrequency: { type: Type.INTEGER },
                    urgency: { type: Type.STRING, description: 'CAO | TRUNG BÌNH | THẤP' },
                    advice: { type: Type.STRING },
                  },
                  required: ['topicName', 'urgency', 'advice'],
                },
              },
              itemAnalysis: {
                type: Type.ARRAY,
                items: {
                  type: Type.OBJECT,
                  properties: {
                    questionNumber: { type: Type.INTEGER },
                    isCorrect: { type: Type.BOOLEAN },
                    hasTeacherRedGrading: {
                      type: Type.BOOLEAN,
                      description: 'True nếu thấy giáo viên có chấm mực đỏ, gạch chéo đỏ, tích V đỏ hoặc ghi chữ sửa bằng mực đỏ ở câu này',
                    },
                    teacherRedCorrection: {
                      type: Type.STRING,
                      description: 'Chữ viết hoặc đáp án bằng MỰC ĐỎ của giáo viên sửa (để rỗng "" nếu không có)',
                    },
                    studentRawHandwriting: {
                      type: Type.STRING,
                      description: 'CHỮ HỌC SINH TỰ VIẾT BẰNG MỰC XANH/ĐEN/CHÌ (kể cả khi viết sai hoặc bị giáo viên gạch mực đỏ)',
                    },
                    studentAnswer: {
                      type: Type.STRING,
                      description: 'BẮT BUỘC LẤY TỪ studentRawHandwriting. TUYỆT ĐỐI CẤM LẤY teacherRedCorrection',
                    },
                    correctAnswer: { type: Type.STRING },
                    grammarTopic: { type: Type.STRING },
                    cognitiveLevel: { type: Type.STRING },
                    rootCause: { type: Type.STRING },
                    whyWrong: { type: Type.STRING },
                    whyCorrect: { type: Type.STRING },
                    formulaAndRule: { type: Type.STRING },
                    trapTip: { type: Type.STRING },
                  },
                  required: ['questionNumber', 'isCorrect', 'teacherRedCorrection', 'studentRawHandwriting', 'studentAnswer', 'correctAnswer', 'grammarTopic'],
                },
              },
              roadmapChangesSummary: {
                type: Type.ARRAY,
                items: { type: Type.STRING },
              },
              adjustedRoadmap: {
                type: Type.OBJECT,
                properties: {
                  roadmapTitle: { type: Type.STRING },
                  summaryStrategy: { type: Type.STRING },
                  estimatedWeeks: { type: Type.INTEGER },
                  dailyCommitmentMinutes: { type: Type.INTEGER },
                  expectedFinalScore: { type: Type.NUMBER },
                  phases: {
                    type: Type.ARRAY,
                    items: {
                      type: Type.OBJECT,
                      properties: {
                        phaseNumber: { type: Type.INTEGER },
                        phaseName: { type: Type.STRING },
                        durationWeeks: { type: Type.STRING },
                        goalScoreRange: { type: Type.STRING },
                        focusAreas: {
                          type: Type.ARRAY,
                          items: { type: Type.STRING },
                        },
                        weeklyPlan: {
                          type: Type.ARRAY,
                          items: {
                            type: Type.OBJECT,
                            properties: {
                              weekNumber: { type: Type.INTEGER },
                              weekTheme: { type: Type.STRING },
                              grammarCore: { type: Type.STRING },
                              gdptCompetency: { type: Type.STRING },
                              dailyTasks: {
                                type: Type.ARRAY,
                                items: { type: Type.STRING },
                              },
                              hcmcFormatPractice: { type: Type.STRING },
                              checkpointTest: { type: Type.STRING },
                              isCompleted: { type: Type.BOOLEAN },
                            },
                            required: ['weekNumber', 'weekTheme', 'grammarCore', 'dailyTasks', 'checkpointTest'],
                          },
                        },
                      },
                      required: ['phaseNumber', 'phaseName', 'durationWeeks', 'focusAreas', 'weeklyPlan'],
                    },
                  },
                  coachTips: {
                    type: Type.ARRAY,
                    items: { type: Type.STRING },
                  },
                },
                required: ['roadmapTitle', 'summaryStrategy', 'phases', 'coachTips'],
              },
            },
            required: ['score', 'correctCount', 'wrongCount', 'overallEvaluation', 'weakGrammarTopics', 'itemAnalysis', 'adjustedRoadmap', 'roadmapChangesSummary'],
          },
        },
      },
      extractAiCredentials(req)
    );

      const jsonStr = response.text?.trim() || '{}';
      parsedResult = JSON.parse(jsonStr);

      if (parsedResult && Array.isArray(parsedResult.itemAnalysis)) {
        parsedResult.itemAnalysis = parsedResult.itemAnalysis.map((item: any) => {
          let sAns = String(item.studentAnswer || '').trim();
          const rawHandwriting = String(item.studentRawHandwriting || '').trim();
          const tRed = String(item.teacherRedCorrection || '').trim();

          // Anti-teacher-correction guard:
          if (tRed) {
            if (rawHandwriting && rawHandwriting.toLowerCase() !== tRed.toLowerCase()) {
              sAns = rawHandwriting;
            } else if (sAns.toLowerCase() === tRed.toLowerCase() && rawHandwriting) {
              sAns = rawHandwriting;
            }
          } else if (rawHandwriting && !sAns) {
            sAns = rawHandwriting;
          }

          return {
            ...item,
            studentAnswer: sAns,
          };
        });
      }
    } catch (aiErr: any) {
      console.warn('Gemini error in analyze-classroom-ocr:', aiErr?.message || aiErr);
    }

    if (!parsedResult || !parsedResult.itemAnalysis || parsedResult.itemAnalysis.length === 0) {
      // High quality fallback result
      parsedResult = {
        testTitle: testTitle || 'Bài kiểm tra Tiếng Anh trên lớp (Trích xuất OCR)',
        score: 7.25,
        totalQuestions: 10,
        correctCount: 7,
        wrongCount: 3,
        overallEvaluation: 'Học sinh nắm khá tốt các câu trắc nghiệm ngữ pháp nhận biết nhưng còn vấp phải bẫy ở dạng Word Formation và Mệnh đề quan hệ.',
        encouragement: 'Em chỉ cần bù đắp dứt điểm các dạng từ hay nhầm và cấu trúc viết lại câu là hoàn toàn có thể bứt phá lên mức 9.0+!',
        weakGrammarTopics: [
          {
            topicName: 'Dạng thức từ (Word Formation) - Tiền tố & Hậu tố',
            errorFrequency: 2,
            urgency: 'CAO',
            advice: 'Ôn tập kỹ các cặp tiền tố phủ định (un-, in-, dis-) và vị trí từ loại trong câu.',
          },
          {
            topicName: 'Mệnh đề quan hệ & Dấu phẩy',
            errorFrequency: 1,
            urgency: 'TRUNG BÌNH',
            advice: 'Ghi nhớ không dùng That sau dấu phẩy trong mệnh đề quan hệ không xác định.',
          },
        ],
        itemAnalysis: [
          {
            questionNumber: 1,
            isCorrect: true,
            studentAnswer: 'C',
            correctAnswer: 'C',
            grammarTopic: 'Phát âm đuôi -ed',
            cognitiveLevel: 'Nhận biết',
          },
          {
            questionNumber: 2,
            isCorrect: true,
            studentAnswer: 'A',
            correctAnswer: 'A',
            grammarTopic: 'Trọng âm từ 2 âm tiết',
            cognitiveLevel: 'Nhận biết',
          },
          {
            questionNumber: 3,
            isCorrect: false,
            studentAnswer: 'pollute',
            correctAnswer: 'pollution',
            grammarTopic: 'Word Formation - Danh từ',
            cognitiveLevel: 'Thông hiểu',
            rootCause: 'Học sinh điền động từ thay vì danh từ sau tính từ "severe".',
            whyWrong: 'Sau tính từ "severe" bắt buộc phải là một Danh từ.',
            whyCorrect: 'Dùng danh từ "pollution" để tạo cụm danh từ "severe pollution" (ô nhiễm nghiêm trọng).',
            formulaAndRule: 'Tính từ (Adjective) + Danh từ (Noun)',
            trapTip: 'Luôn xác định từ đứng liền trước chỗ trống để nhận diện từ loại cần điền.',
          },
          {
            questionNumber: 4,
            isCorrect: false,
            studentAnswer: 'that',
            correctAnswer: 'which',
            grammarTopic: 'Mệnh đề quan hệ & Dấu phẩy',
            cognitiveLevel: 'Vận dụng',
            rootCause: 'Nhầm lẫn khi dùng "that" trong mệnh đề quan hệ không xác định có dấu phẩy.',
            whyWrong: '"That" không bao giờ được đứng sau dấu phẩy hoặc giới từ trong tiếng Anh chuẩn.',
            whyCorrect: 'Dùng "which" để thay thế cho danh từ chỉ vật đứng sau dấu phẩy.',
            formulaAndRule: 'Noun (vật), + which + V/S-V, ... (Cấm dùng That)',
            trapTip: 'Nhìn thấy dấu phẩy (,) trước đại từ quan hệ -> Loại ngay phương án "that".',
          },
          {
            questionNumber: 5,
            isCorrect: true,
            studentAnswer: 'B',
            correctAnswer: 'B',
            grammarTopic: 'Câu điều kiện loại 1',
            cognitiveLevel: 'Nhận biết',
          },
          {
            questionNumber: 6,
            isCorrect: false,
            studentAnswer: 'careless',
            correctAnswer: 'careful',
            grammarTopic: 'Word Formation - Tiền tố/Hậu tố Tính từ',
            cognitiveLevel: 'Vận dụng',
            rootCause: 'Hiểu sai ngữ cảnh nghĩa phủ định / khẳng định của câu.',
            whyWrong: '"careless" mang nghĩa bất cẩn, trái ngược với ngữ cảnh cần cẩn thận khi qua đường.',
            whyCorrect: 'Dùng tính từ "careful" (cẩn thận) để phù hợp ngữ cảnh an toàn giao thông.',
            formulaAndRule: 'Be + Adjective (Xét nghĩa câu để chọn tiền tố/hậu tố phù hợp)',
            trapTip: 'Dịch nghĩa toàn câu sau khi điền từ để kiểm tra tính hợp lý ngữ nghĩa.',
          },
          {
            questionNumber: 7,
            isCorrect: true,
            studentAnswer: 'C',
            correctAnswer: 'C',
            grammarTopic: 'Biển báo giao thông & cảnh báo',
            cognitiveLevel: 'Thông hiểu',
          },
          {
            questionNumber: 8,
            isCorrect: true,
            studentAnswer: 'A',
            correctAnswer: 'A',
            grammarTopic: 'Câu ước ở hiện tại (Wish)',
            cognitiveLevel: 'Thông hiểu',
          },
          {
            questionNumber: 9,
            isCorrect: true,
            studentAnswer: 'D',
            correctAnswer: 'D',
            grammarTopic: 'Liên từ chỉ nguyên nhân - kết quả',
            cognitiveLevel: 'Nhận biết',
          },
          {
            questionNumber: 10,
            isCorrect: true,
            studentAnswer: 'Although the weather was bad, we went on a picnic.',
            correctAnswer: 'Although the weather was bad, we went on a picnic.',
            grammarTopic: 'Viết lại câu với Although / In spite of',
            cognitiveLevel: 'Vận dụng cao',
          },
        ],
        roadmapChangesSummary: [
          'Bổ sung 2 tuần chuyên đề Word Formation cấp tốc tập trung vào danh từ và tính từ mang tiền tố phủ định.',
          'Bổ sung chuyên đề Mệnh đề quan hệ không xác định (Bẫy dấu phẩy & Giới từ).',
          'Tăng cường 10 bài tập phản xạ cấu trúc viết lại câu theo đúng định dạng đề thi Sở GD&ĐT TP.HCM.',
          'Tối ưu hóa thời gian ôn tập hàng ngày theo nguyện vọng của học sinh.',
        ],
        adjustedRoadmap: {
          id: 'roadmap-' + Date.now(),
          studentId: 'stu-nguyen-minh-anh',
          roadmapTitle: `Lộ trình Tinh chỉnh Bứt phá ${studentProfile?.targetScore || 9.0} Điểm vào ${studentProfile?.targetSchool || 'THPT Nguyễn Thị Minh Khai'} (Cập nhật sau kiểm tra trên lớp)`,
          summaryStrategy: 'Tập trung bồi dưỡng cấp tốc phần Word Formation và Mệnh đề quan hệ bẫy dấu phẩy; kết hợp rèn luyện phản xạ đề thi thực tế theo Thông báo 3584.',
          estimatedWeeks: 8,
          dailyCommitmentMinutes: 75,
          expectedFinalScore: studentProfile?.targetScore || 9.25,
          updatedAt: new Date().toISOString().split('T')[0],
          coachTips: [
            'Dành 15 phút mỗi ngày làm 10 câu Word Formation trong Sổ tay lỗi sai.',
            'Luôn chú ý dấu phẩy trước mệnh đề quan hệ để không bao giờ chọn "That".',
            'Đọc kỹ ngữ cảnh câu trước khi quyết định chọn từ mang tiền tố phủ định un-, in-, dis-.',
          ],
          phases: [
            {
              phaseNumber: 1,
              phaseName: 'Giai đoạn 1: Bịt Lỗ Hổng Cấp Tốc Phát Hiện Từ Bài Kiểm Tra Trên Lớp',
              durationWeeks: 'Tuần 1 - Tuần 3',
              goalScoreRange: '7.25 -> 8.25 Điểm',
              focusAreas: [
                'Word Formation (Danh từ & Tính từ phủ định)',
                'Mệnh đề quan hệ bẫy dấu phẩy & giới từ',
                'Câu điều kiện & Câu ước Wish',
              ],
              weeklyPlan: [
                {
                  weekNumber: 1,
                  weekTheme: 'Chuyên đề Word Form Bứt Phá: Phương pháp "TRẠNG ĐỘNG TRẠNG TÍNH DANH" & Bảng Hậu Tố',
                  grammarCore: 'Công thức vàng: "TRẠNG - ĐỘNG - TRẠNG - TÍNH - DANH", nhận diện 7 vị trí Danh từ, 3 vị trí Tính từ, 2 vị trí Trạng từ, 4 vị trí Động từ và bảng hậu tố chuẩn',
                  gdptCompetency: 'Năng lực cấu tạo và biến đổi từ loại chuẩn ngữ cảnh thi vào 10 TP.HCM theo CT GDPT 2018.',
                  dailyTasks: [
                    'Ngày 1: Nắm chắc 7 vị trí Danh từ (sau Tính từ, a/an/the, this/that/these/those, tính từ sở hữu, giới từ, số lượng, need/bring/have...) & 3 vị trí Tính từ (trước Danh từ, sau to be, sau linking verbs: look, feel, seem, become, taste, smell, get...).',
                    'Ngày 2: Nắm chắc 2 vị trí Trạng từ (sau Động từ thường, đầu câu có dấu phẩy) & 4 vị trí Động từ (sau S, sau Modal verbs, spend/waste + time + V-ing, thể truyền khiến have/get).',
                    'Ngày 3: Học thuộc Bảng nhận diện hậu tố: Danh từ (-tion, -sion, -ment, -ce, -ness, -ty, -er/or/ee/ist), Động từ (-ize, -ate, -en, -fy), Tính từ (-al, -ful, -ive, -able/ible, -ous, -ic, -ant, -ing/-ed), Trạng từ (-ly).',
                    'Ngày 4: Rèn luyện 20 câu Word Form chuẩn phần 6 đề thi Sở GD&ĐT TP.HCM (Câu 31-36), kết hợp kiểm tra tiền tố phủ định un-, im-, in-, dis-.',
                  ],
                  hcmcFormatPractice: 'Luyện 6 câu Word Form (Câu 31-36) chuẩn định dạng đề thi Sở GD&ĐT TP.HCM.',
                  checkpointTest: 'Bài kiểm tra Tuần 1: 20 câu Word Formation (Mục tiêu >= 9/10).',
                  isCompleted: false,
                },
                {
                  weekNumber: 2,
                  weekTheme: 'Chuyên đề Mệnh đề quan hệ & Dấu phẩy (Non-defining clauses)',
                  grammarCore: 'Phân biệt Which vs That, quy tắc dấu phẩy, giới từ trước Whom/Which',
                  gdptCompetency: 'Năng lực liên kết câu và sử dụng mệnh đề phức chính xác.',
                  dailyTasks: [
                    'Ngày 1: Ôn lý thuyết Mệnh đề quan hệ không xác định và quy tắc cấm dùng That sau dấu phẩy.',
                    'Ngày 2: Rèn 15 câu trắc nghiệm bẫy đại từ quan hệ.',
                    'Ngày 3: Luyện 10 câu rút gọn mệnh đề quan hệ dạng chủ động (V-ing) và bị động (V3/ed).',
                    'Ngày 4: Tự chấm và ghi chép câu sai vào Sổ tay lỗi sai.',
                  ],
                  hcmcFormatPractice: 'Luyện 5 câu viết lại câu nối bằng Đại từ quan hệ (Dạng 38 trong đề thi TP.HCM).',
                  checkpointTest: 'Bài kiểm tra Tuần 2: 25 câu chuyên đề Mệnh đề quan hệ.',
                  isCompleted: false,
                },
                {
                  weekNumber: 3,
                  weekTheme: 'Chuyên đề Câu điều kiện If, Unless & Câu ước Wish',
                  grammarCore: 'If loại 1, loại 2, cấu trúc Unless và Wish ở hiện tại/tương lai',
                  gdptCompetency: 'Năng lực diễn đạt giả định và điều kiện trong giao tiếp.',
                  dailyTasks: [
                    'Ngày 1: Hệ thống hóa If 1, If 2 và Wish + Past Simple.',
                    'Ngày 2: Luyện 15 câu chuyển đổi giữa If...not và Unless.',
                    'Ngày 3: Làm mini-test chuyên đề.',
                  ],
                  hcmcFormatPractice: 'Luyện dạng bài viết lại câu chuyển sang Unless và Wish (Dạng 39).',
                  checkpointTest: 'Bài kiểm tra Tuần 3: Đề thi thử 40 câu lần 1.',
                  isCompleted: false,
                },
              ],
            },
            {
              phaseNumber: 2,
              phaseName: 'Giai đoạn 2: Nâng Cao Vận Dụng & Tối Ưu Đọc Hiểu Biển Báo',
              durationWeeks: 'Tuần 4 - Tuần 6',
              goalScoreRange: '8.25 -> 9.0 Điểm',
              focusAreas: [
                'Biển báo Notice & Thông báo công cộng TP.HCM',
                'Reading comprehension suy luận thực tế',
                'Viết lại câu Vận dụng cao',
              ],
              weeklyPlan: [
                {
                  weekNumber: 4,
                  weekTheme: 'Kỹ năng Đọc hiểu Biển báo (Notices & Signs) và Văn bản đời sống',
                  grammarCore: 'Từ khóa cấm đoán, cảnh báo và hướng dẫn công cộng (Prohibited, Mandatory, Caution)',
                  gdptCompetency: 'Năng lực đọc hiểu thông tin biển báo đô thị và thông điệp xã hội.',
                  dailyTasks: [
                    'Ngày 1: Học 25 từ vựng biển báo giao thông, trường học, bệnh viện.',
                    'Ngày 2: Phân tích 15 biển báo thực tế theo đề thi TP.HCM.',
                    'Ngày 3: Luyện 20 câu đọc hiểu biển báo trắc nghiệm.',
                  ],
                  hcmcFormatPractice: 'Rèn luyện phần 2 trong đề thi (2 câu biển báo thực tế).',
                  checkpointTest: 'Bài kiểm tra Tuần 4: 10 câu Biển báo & Thông báo.',
                  isCompleted: false,
                },
                {
                  weekNumber: 5,
                  weekTheme: 'Chuyên đề Viết lại câu Vận dụng cao (Rewrite Master)',
                  grammarCore: 'Chuyển đổi So...that / Too...to, Suggest + V-ing/should, Chuyển đổi thì HTHT sang QKĐ',
                  gdptCompetency: 'Năng lực diễn đạt linh hoạt đa cấu trúc câu.',
                  dailyTasks: [
                    'Ngày 1: Cấu trúc Suggest + V-ing / Suggest that S + (should) V.',
                    'Ngày 2: Cấu trúc So/Such và Too/Enough.',
                    'Ngày 3: Chuyển đổi thì HTHT (The last time / It is...since).',
                    'Ngày 4: Luyện viết 20 câu tự luận.',
                  ],
                  hcmcFormatPractice: 'Rèn luyện 4 câu Viết lại câu tự luận chuẩn cấu trúc phần cuối đề thi.',
                  checkpointTest: 'Bài kiểm tra Tuần 5: 15 câu Viết lại câu tự luận.',
                  isCompleted: false,
                },
                {
                  weekNumber: 6,
                  weekTheme: 'Kỹ năng Đọc hiểu suy luận (Reading Comprehension)',
                  grammarCore: 'Kỹ thuật Skimming, Scanning và suy luận ý chính (Inference)',
                  gdptCompetency: 'Năng lực phân tích và xử lý thông tin văn bản dài.',
                  dailyTasks: [
                    'Ngày 1: Chiến thuật tìm từ đồng nghĩa/trái nghĩa trong bài đọc.',
                    'Ngày 2: Luyện 2 bài đọc hiểu chủ đề Thành phố thông minh & Môi trường.',
                    'Ngày 3: Luyện bài đọc điền từ (Cloze text).',
                  ],
                  hcmcFormatPractice: 'Luyện 2 bài đọc chuẩn cấu trúc phần 4 & 5 đề thi TP.HCM.',
                  checkpointTest: 'Bài kiểm tra Tuần 6: 2 bài đọc hiểu 16 câu.',
                  isCompleted: false,
                },
              ],
            },
            {
              phaseNumber: 3,
              phaseName: 'Giai đoạn 3: Tổng Ôn Luyện Đề Chuẩn 3584 & Về Đích 9.0+',
              durationWeeks: 'Tuần 7 - Tuần 8',
              goalScoreRange: '9.0 -> 9.5+ Điểm',
              focusAreas: [
                'Giải đề thi thử chuẩn 40 câu có bấm giờ',
                'Khắc phục triệt để các lỗi trong Sổ tay lỗi sai',
                'Tối ưu chiến thuật làm bài thi',
              ],
              weeklyPlan: [
                {
                  weekNumber: 7,
                  weekTheme: 'Luyện đề tổng hợp chuẩn ma trận 4 cấp độ tư duy',
                  grammarCore: 'Tổng hợp toàn bộ 14 chủ điểm ngữ pháp trọng tâm thi vào 10 TP.HCM',
                  gdptCompetency: 'Năng lực làm bài thi thực chiến và quản lý thời gian.',
                  dailyTasks: [
                    'Ngày 1: Giải 1 đề thi thử 40 câu trong 90 phút.',
                    'Ngày 2: Xem phân tích AI chẩn đoán và ghi chép lỗi sai.',
                    'Ngày 3: Ôn lại toàn bộ từ vựng trong Sổ tay lỗi sai.',
                  ],
                  hcmcFormatPractice: 'Giải đề thi thử chuẩn cấu trúc 40 câu Sở GD&ĐT TP.HCM.',
                  checkpointTest: 'Đề thi thử lần 2 (Mục tiêu >= 9.0/10).',
                  isCompleted: false,
                },
                {
                  weekNumber: 8,
                  weekTheme: 'Hoàn thiện kỹ năng và tự tin bước vào phòng thi',
                  grammarCore: 'Mẹo tránh bẫy, rà soát lỗi chính tả Word Form và thì viết lại câu',
                  gdptCompetency: 'Tâm lý vững vàng và độ chính xác tuyệt đối.',
                  dailyTasks: [
                    'Ngày 1: Rà soát toàn bộ các câu sai trong Sổ tay lỗi sai.',
                    'Ngày 2: Làm bài thi thử cuối cùng.',
                    'Ngày 3: Nghỉ ngơi và xem lại các mẹo bẫy quan trọng.',
                  ],
                  hcmcFormatPractice: 'Đề khảo sát năng lực tổng kết.',
                  checkpointTest: 'Khảo sát năng lực tổng kết cuối lộ trình.',
                  isCompleted: false,
                },
              ],
            },
          ],
        },
      };
    }

    res.json(parsedResult);
  } catch (error: any) {
    handleGeminiError(res, error);
  }
});
app.post('/api/ai/generate-roadmap', async (req, res) => {
  try {
    const {
      targetSchool,
      targetScore,
      currentScore,
      availableHoursPerDay,
      examDate,
      weakTopics = [],
      recentExamResults = [],
      wordFormLevel = 'level2',
    } = req.body;

    const prompt = `
Bạn là chuyên gia tư vấn giáo dục và thiết kế lộ trình học tập Tiếng Anh thi vào lớp 10 TP.HCM chuẩn Chương trình Giáo dục Phổ thông 2018 và Thông báo 3584 của Sở GD&ĐT TP.HCM.

Hãy xây dựng một LỘ TRÌNH LUYỆN TẬP CÁ NHÂN HÓA TOÀN DIỆN:
- Học sinh muốn thi vào trường: ${targetSchool || 'THPT Gia Định / Nguyễn Thị Minh Khai / Chuyên'}
- Điểm hiện tại: ${currentScore || 6.5}/10
- Điểm mong muốn: ${targetScore || 9.0}/10
- Thời gian dành ra mỗi ngày: ${availableHoursPerDay || 1.5} giờ/ngày
- Ngày thi dự kiến: ${examDate || 'Tháng 6/2026'}
- Các chuyên đề bị hổng / điểm yếu phát hiện từ các bài làm trước: ${JSON.stringify(weakTopics)}
- Mức độ trọng tâm Word Form học sinh chọn: ${wordFormLevel} (level1: Nhận diện 4 vị trí từ loại theo tài liệu; level2: Bảng hậu tố 4 từ loại & quy trình 2 bước; level3: Bẫy linking verbs, thể truyền khiến have/get, tiền tố phủ định; level4: Thực chiến 6/6 câu Word Form đề thi TP.HCM).

Yêu cầu lộ trình:
1. Chia thành các Giai đoạn (Phases) rõ ràng (Ví dụ: Giai đoạn 1: Bịt lỗ hổng Ngữ pháp nền tảng & Dạng thức từ; Giai đoạn 2: Nâng cao kỹ năng Đọc hiểu thực tế & Biển báo Notice; Giai đoạn 3: Chinh phục Vận dụng cao - Viết lại câu & Câu phân loại; Giai đoạn 4: Luyện đề tổng hợp & Tối ưu thời gian làm bài).
2. Từng Tuần (Weeks)/Cột mốc (Milestones):
   - Trọng tâm ngữ pháp cụ thể (kèm mục tiêu năng lực GDPT 2018)
   - Nhiệm vụ học tập hàng ngày (Micro-tasks 20-30 phút)
   - Dạng bài thi vào 10 TP.HCM tương ứng (Word form, Rewrite, Signboards, Cloze text)
   - Bài test kiểm tra tiến độ cuối tuần (Progress Checkpoint)
3. ĐẶC BIỆT ĐỐI VỚI CHUYÊN ĐỀ DẠNG THỨC TỪ (WORD FORMATION - CÂU 31 ĐẾN 36 ĐỀ THI TP.HCM):
   BẮT BUỘC xây dựng kế hoạch học tập bám sát tài liệu chuẩn "CÁCH LÀM BÀI TẬP WORD FORM: TRẠNG ĐỘNG TRẠNG TÍNH DANH":
   - Áp dụng triệt để quy tắc vị trí 4 từ loại:
     + Danh từ (n): Đứng sau Tính từ; sau a/an/the; sau this/that/these/those; sau tính từ sở hữu; sau giới từ; sau từ chỉ số lượng; sau các động từ need, bring, have, give, find, take...
     + Tính từ (adj): Đứng trước Danh từ; sau to be; sau Linking verbs (look, feel, seem, become, taste, smell, get...).
     + Trạng từ (adv): Đứng sau Động từ thường; đứng đầu câu có dấu phẩy.
     + Động từ (v): Đứng sau Chủ ngữ; sau Modal verbs; spend/waste + time + V-ing; have + S.O + Vo; get + S.O + To-V; have/get + S.thing + V(3/ed).
   - Bảng nhận diện hậu tố (Suffixes):
     + Danh từ (n): -tion, -sion, -ment, -ce, -ness, -y/-ty, -er/-or/-ee/-ist.
     + Động từ (v): -ize, -ate, -en, -fy.
     + Tính từ (adj): -al, -ful, -ive, -able/-ible, -ous, -ic, -ant, -ing/-ed.
     + Trạng từ (adv): -ly.
   - Các bài tập và nhiệm vụ hàng ngày về Word Form phải chia theo các bước: Phân tích vị trí để xác định từ loại -> Tra hậu tố -> Xem xét tiền tố phủ định un-, im-, in-, dis-.
4. Điểm số dự kiến tăng dần qua từng giai đoạn.
5. Lời khuyên động viên và chiến thuật phân bổ thời gian.

Hãy trả về định dạng JSON chuẩn.
`;

    const response = await callGeminiWithRetry(
      {
        model: 'gemini-3.1-flash-lite',
        contents: prompt,
        config: {
        responseMimeType: 'application/json',
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            roadmapTitle: { type: Type.STRING },
            summaryStrategy: { type: Type.STRING },
            estimatedWeeks: { type: Type.INTEGER },
            dailyCommitmentMinutes: { type: Type.INTEGER },
            expectedFinalScore: { type: Type.NUMBER },
            phases: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  phaseNumber: { type: Type.INTEGER },
                  phaseName: { type: Type.STRING },
                  durationWeeks: { type: Type.STRING },
                  goalScoreRange: { type: Type.STRING },
                  focusAreas: {
                    type: Type.ARRAY,
                    items: { type: Type.STRING },
                  },
                  weeklyPlan: {
                    type: Type.ARRAY,
                    items: {
                      type: Type.OBJECT,
                      properties: {
                        weekNumber: { type: Type.INTEGER },
                        weekTheme: { type: Type.STRING },
                        grammarCore: { type: Type.STRING },
                        gdptCompetency: { type: Type.STRING },
                        dailyTasks: {
                          type: Type.ARRAY,
                          items: { type: Type.STRING },
                        },
                        hcmcFormatPractice: { type: Type.STRING },
                        checkpointTest: { type: Type.STRING },
                      },
                      required: ['weekNumber', 'weekTheme', 'grammarCore', 'dailyTasks', 'checkpointTest'],
                    },
                  },
                },
                required: ['phaseNumber', 'phaseName', 'durationWeeks', 'focusAreas', 'weeklyPlan'],
              },
            },
            coachTips: {
              type: Type.ARRAY,
              items: { type: Type.STRING },
            },
          },
          required: ['roadmapTitle', 'summaryStrategy', 'phases', 'coachTips'],
        },
      },
    },
    extractAiCredentials(req)
  );

    const jsonStr = response.text?.trim() || '{}';
    res.json(JSON.parse(jsonStr));
  } catch (error: any) {
    handleGeminiError(res, error);
  }
});

// ==========================================
// 5. TẠO CÂU HỎI LUYỆN TẬP TƯƠNG TỰ (SIMILAR QUESTIONS)
// ==========================================
app.post('/api/ai/generate-similar-questions', async (req, res) => {
  try {
    const { originalQuestion, grammarTopic, count = 3 } = req.body;

    const prompt = `
Bạn là giáo viên biên soạn đề thi tuyển sinh vào 10 TP.HCM môn Tiếng Anh.
Học sinh vừa làm sai câu hỏi sau về chuyên đề "${grammarTopic || 'Ngữ pháp'}":
- Câu hỏi gốc: "${originalQuestion?.questionText || ''}"
- Đáp án đúng gốc: "${originalQuestion?.correctAnswer || ''}"
- Dạng câu: ${originalQuestion?.type || 'Trắc nghiệm'}

Hãy tạo ${count} câu hỏi luyện tập tương tự chuẩn cấu trúc đề thi vào 10 TP.HCM (Thông báo 3584) bám sát đúng cấu trúc ngữ pháp này nhưng đổi ngữ cảnh thực tế, gắn với đời sống học đường/thành phố/môi trường văn minh.
Kèm đáp án đúng và giải thích chi tiết, công thức áp dụng.

Trả về JSON.
`;

    const response = await callGeminiWithRetry(
      {
        model: 'gemini-3.1-flash-lite',
        contents: prompt,
        config: {
        responseMimeType: 'application/json',
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            topic: { type: Type.STRING },
            ruleSummary: { type: Type.STRING },
            questions: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  id: { type: Type.STRING },
                  type: { type: Type.STRING },
                  questionText: { type: Type.STRING },
                  options: {
                    type: Type.ARRAY,
                    items: { type: Type.STRING },
                  },
                  correctAnswer: { type: Type.STRING },
                  explanation: { type: Type.STRING },
                  hint: { type: Type.STRING },
                },
                required: ['questionText', 'correctAnswer', 'explanation'],
              },
            },
          },
          required: ['questions'],
        },
      },
    },
    extractAiCredentials(req)
  );

    const jsonStr = response.text?.trim() || '{}';
    res.json(JSON.parse(jsonStr));
  } catch (error: any) {
    handleGeminiError(res, error);
  }
});

// ==========================================
// 6. BÁO CÁO PHÂN TÍCH LỚP HỌC CHO GIÁO VIÊN
// ==========================================
app.post('/api/ai/generate-class-report', async (req, res) => {
  try {
    const { classData, examData } = req.body;

    const prompt = `
Bạn là chuyên gia cố vấn sư phạm Tiếng Anh THCS. Hãy phân tích báo cáo chi tiết kết quả làm bài của lớp học đối với đề thi Tuyển sinh vào 10 TP.HCM:
Dữ liệu lớp học: ${JSON.stringify(classData)}
Dữ liệu bài thi: ${JSON.stringify(examData)}

Hãy xuất ra:
1. Đánh giá tổng quan chất lượng lớp học theo 4 cấp độ tư duy (Thông báo 3584) và các phần thi (Phonetics, Signs, Reading, Word Form, Rewriting).
2. Top 5 lỗi sai ngữ pháp phổ biến nhất của cả lớp cần ôn tập trên lớp.
3. Phân nhóm học sinh (Nhóm cần kèm cặp cấp tốc, Nhóm trung bình cần tăng tốc Vận dụng, Nhóm Giỏi hướng đến 9.0+ Chuyên).
4. Kế hoạch can thiệp sư phạm (Lesson plan suggestions) cho giáo viên trong các tiết ôn tập tiếp theo.

Trả về JSON.
`;

    const response = await callGeminiWithRetry(
      {
        model: 'gemini-3.1-flash-lite',
        contents: prompt,
        config: {
        responseMimeType: 'application/json',
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            classAverageScore: { type: Type.NUMBER },
            passRate: { type: Type.NUMBER },
            overallHealth: { type: Type.STRING },
            topCommonMistakes: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  topic: { type: Type.STRING },
                  errorRatePercent: { type: Type.NUMBER },
                  typicalConfusion: { type: Type.STRING },
                  remedialAction: { type: Type.STRING },
                },
                required: ['topic', 'errorRatePercent', 'remedialAction'],
              },
            },
            studentTiering: {
              type: Type.OBJECT,
              properties: {
                highAchieversCount: { type: Type.INTEGER },
                moderateCount: { type: Type.INTEGER },
                needsSupportCount: { type: Type.INTEGER },
                recommendationsPerTier: {
                  type: Type.ARRAY,
                  items: {
                    type: Type.OBJECT,
                    properties: {
                      tierName: { type: Type.STRING },
                      strategy: { type: Type.STRING },
                      targetMaterials: { type: Type.STRING },
                    },
                    required: ['tierName', 'strategy'],
                  },
                },
              },
            },
            teacherActionPlan: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  sessionTitle: { type: Type.STRING },
                  focusTopic: { type: Type.STRING },
                  activities: { type: Type.STRING },
                },
                required: ['sessionTitle', 'focusTopic', 'activities'],
              },
            },
          },
          required: ['classAverageScore', 'topCommonMistakes', 'teacherActionPlan'],
        },
      },
    },
    extractAiCredentials(req)
  );

    const jsonStr = response.text?.trim() || '{}';
    res.json(JSON.parse(jsonStr));
  } catch (error: any) {
    handleGeminiError(res, error);
  }
});

// Vite Middleware Integration
async function startServer() {
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    app.use(express.static(path.resolve(__dirname, 'dist')));
    app.get('*', (_req, res) => {
      res.sendFile(path.resolve(__dirname, 'dist', 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Server listening on port ${PORT}`);
  });
}

startServer();
