import React, { useState, useEffect } from 'react';
import { useApp } from '../context/AppContext';
import {
  KeyRound,
  Sparkles,
  CheckCircle2,
  AlertTriangle,
  RefreshCw,
  Zap,
  Save,
  Eye,
  EyeOff,
  ExternalLink,
  ShieldCheck,
  Server,
  User,
  Info,
  X,
  Clock,
  RotateCcw,
} from 'lucide-react';
import {
  apiService,
  getUserAiConfig,
  saveUserAiConfig,
} from '../services/apiService';
import { ModelOption, SystemAiConfig, UserAiConfig } from '../types';

interface AiConfigModalProps {
  isOpen: boolean;
  onClose: () => void;
  quotaExceededMessage?: string | null;
}

export const AiConfigModal: React.FC<AiConfigModalProps> = ({
  isOpen,
  onClose,
  quotaExceededMessage,
}) => {
  const { role, currentAccount, showToast } = useApp();
  const isTeacherOrAdmin = role === 'teacher' || currentAccount?.role === 'teacher';

  // Active tab: 'user' (Solution 1) or 'system' (Solution 2)
  const [activeTab, setActiveTab] = useState<'user' | 'system'>('user');

  // Solution 1: User personal config state
  const [userApiKey, setUserApiKey] = useState('');
  const [selectedModel, setSelectedModel] = useState('gemini-3.1-flash-lite');
  const [usePersonalKey, setUsePersonalKey] = useState(false);
  const [showUserKey, setShowUserKey] = useState(false);

  // Available models list
  const [availableModels, setAvailableModels] = useState<ModelOption[]>([]);
  const [isLoadingModels, setIsLoadingModels] = useState(false);

  // Solution 1 Testing state
  const [isTestingUser, setIsTestingUser] = useState(false);
  const [userTestResult, setUserTestResult] = useState<{
    success: boolean;
    message: string;
    latencyMs?: number;
    isQuotaError?: boolean;
  } | null>(null);

  // Solution 2: System / Admin config state
  const [systemConfig, setSystemConfig] = useState<SystemAiConfig>({
    hasSystemKey: false,
    maskedKey: '',
    systemModel: 'gemini-3.1-flash-lite',
    isQuotaExceeded: false,
    source: 'none',
  });
  const [adminApiKey, setAdminApiKey] = useState('');
  const [adminModel, setAdminModel] = useState('gemini-3.1-flash-lite');
  const [showAdminKey, setShowAdminKey] = useState(false);
  const [isTestingSystem, setIsTestingSystem] = useState(false);
  const [systemTestResult, setSystemTestResult] = useState<{
    success: boolean;
    message: string;
    latencyMs?: number;
    isQuotaError?: boolean;
  } | null>(null);
  const [isSavingSystem, setIsSavingSystem] = useState(false);

  // Load configuration on mount or when opened
  useEffect(() => {
    if (!isOpen) return;

    // Load user personal config from localStorage
    const savedUserConfig = getUserAiConfig();
    setUserApiKey(savedUserConfig.apiKey || '');
    setSelectedModel(savedUserConfig.model || 'gemini-3.1-flash-lite');
    setUsePersonalKey(!!savedUserConfig.usePersonalKey);
    setUserTestResult(null);

    // Students only have access to personal API key tab
    if (!isTeacherOrAdmin || quotaExceededMessage) {
      setActiveTab('user');
    }

    // Load available models
    loadModels();

    // Load system config
    loadSystemConfig();
  }, [isOpen, quotaExceededMessage, isTeacherOrAdmin]);

  const loadModels = async () => {
    setIsLoadingModels(true);
    try {
      const data = await apiService.fetchAvailableModels();
      setAvailableModels(data.models || []);
      if (!selectedModel && data.defaultModel) {
        setSelectedModel(data.defaultModel);
      }
    } catch (e) {
      console.error('Failed to load models:', e);
    } finally {
      setIsLoadingModels(false);
    }
  };

  const loadSystemConfig = async () => {
    try {
      const config = await apiService.fetchSystemAiConfig();
      setSystemConfig(config);
      setAdminModel(config.systemModel || 'gemini-3.1-flash-lite');
    } catch (e) {
      console.warn('Could not load system config:', e);
    }
  };

  // Solution 1: "Nút tải lên phiên bản mới nhất"
  const handleFetchLatestModels = async () => {
    setIsLoadingModels(true);
    try {
      const data = await apiService.fetchAvailableModels();
      setAvailableModels(data.models);
      // Auto-select latest recommended
      const rec = data.models.find((m) => m.isRecommended) || data.models[0];
      if (rec) {
        setSelectedModel(rec.id);
      }
      showToast('Đã tải lên và làm mới danh sách phiên bản Gemini mới nhất!');
    } catch (e: any) {
      showToast('Lỗi khi tải danh sách phiên bản: ' + e.message);
    } finally {
      setIsLoadingModels(false);
    }
  };

  // Solution 1: "Nút kiểm tra kết nối"
  const handleTestUserConnection = async () => {
    if (!userApiKey.trim()) {
      setUserTestResult({
        success: false,
        message: 'Vui lòng nhập API Key cá nhân của bạn trước khi kiểm tra.',
      });
      return;
    }

    setIsTestingUser(true);
    setUserTestResult(null);

    try {
      const res = await apiService.testAiConnection({
        apiKey: userApiKey.trim(),
        model: selectedModel,
        testType: 'user',
      });

      setUserTestResult({
        success: res.success,
        message: res.message,
        latencyMs: res.latencyMs,
        isQuotaError: res.isQuotaError,
      });

      if (res.success) {
        showToast(`Kiểm tra kết nối thành công (${res.latencyMs}ms)!`);
      }
    } catch (e: any) {
      setUserTestResult({
        success: false,
        message: e.message || 'Lỗi mạng khi kiểm tra kết nối.',
      });
    } finally {
      setIsTestingUser(false);
    }
  };

  // Solution 1: "Nút lưu cấu hình"
  const handleSaveUserConfig = () => {
    const configToSave: UserAiConfig = {
      apiKey: userApiKey.trim(),
      model: selectedModel,
      usePersonalKey,
      lastTestedAt: new Date().toISOString(),
      lastStatus: userTestResult?.success ? 'success' : userApiKey ? 'idle' : undefined,
      lastLatencyMs: userTestResult?.latencyMs,
    };

    saveUserAiConfig(configToSave);
    showToast('Lưu cấu hình API Key cá nhân thành công!');
    onClose();
  };

  // Solution 2: Admin Test Connection
  const handleTestSystemConnection = async () => {
    setIsTestingSystem(true);
    setSystemTestResult(null);

    try {
      const res = await apiService.testAiConnection({
        apiKey: adminApiKey.trim() || undefined,
        model: adminModel,
        testType: 'system',
      });

      setSystemTestResult({
        success: res.success,
        message: res.message,
        latencyMs: res.latencyMs,
        isQuotaError: res.isQuotaError,
      });

      if (res.success) {
        showToast(`Kết nối hệ thống Gemini AI thành công (${res.latencyMs}ms)!`);
      }
    } catch (e: any) {
      setSystemTestResult({
        success: false,
        message: e.message || 'Lỗi kiểm tra hệ thống.',
      });
    } finally {
      setIsTestingSystem(false);
    }
  };

  // Solution 2: Admin Save Global Config
  const handleSaveSystemConfig = async () => {
    setIsSavingSystem(true);
    try {
      const res = await apiService.saveSystemAiConfig({
        apiKey: adminApiKey.trim() || undefined,
        systemModel: adminModel,
        resetQuota: true,
      });

      setSystemConfig(res.config);
      setAdminApiKey('');
      showToast(res.message || 'Đã cập nhật cấu hình API chung toàn trang web!');
    } catch (e: any) {
      showToast('Lỗi lưu cấu hình hệ thống: ' + e.message);
    } finally {
      setIsSavingSystem(false);
    }
  };

  // Solution 2: Reset system quota flag
  const handleResetSystemQuota = async () => {
    try {
      const res = await apiService.saveSystemAiConfig({
        resetQuota: true,
      });
      setSystemConfig(res.config);
      showToast('Đã đặt lại trạng thái Quota cho hệ thống!');
    } catch (e: any) {
      showToast('Lỗi: ' + e.message);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 max-w-2xl w-full overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="bg-linear-to-r from-indigo-900 via-indigo-800 to-violet-900 text-white p-5 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-white/10 flex items-center justify-center border border-white/20">
              <KeyRound className="w-5 h-5 text-amber-300" />
            </div>
            <div>
              <h2 className="text-lg font-bold flex items-center gap-2">
                <span>Cấu Hình API Key Trí Tuệ Nhân Tạo</span>
                <span className="text-[11px] font-semibold bg-amber-400 text-indigo-950 px-2 py-0.5 rounded-full">
                  Gemini AI
                </span>
              </h2>
              <p className="text-xs text-indigo-200">
                {isTeacherOrAdmin
                  ? 'Lựa chọn cơ chế cấp phát AI cho toàn bộ tính năng chấm thi, OCR và lộ trình'
                  : 'Cấu hình Gemini API key cá nhân để sử dụng các tính năng chấm thi, OCR và gia sư AI'}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-indigo-200 hover:text-white hover:bg-white/10 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Quota Exceeded Alert Banner (if triggered) */}
        {quotaExceededMessage && (
          <div className="bg-amber-50 border-b border-amber-200 p-3.5 flex items-start gap-3">
            <AlertTriangle className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
            <div className="text-xs text-amber-900">
              <p className="font-bold">Hạn mức hệ thống chung đã hết tín dụng!</p>
              <p className="mt-0.5 text-amber-800">
                {quotaExceededMessage} Bạn có thể nhập <strong>API key cá nhân miễn phí</strong> bên dưới để tiếp tục sử dụng ngay lập tức mà không phải chờ đợi.
              </p>
            </div>
          </div>
        )}

        {/* Navigation Tabs (Only rendered for Teacher/Admin who have multiple tabs to switch) */}
        {isTeacherOrAdmin && (
          <div className="flex border-b border-slate-200 bg-slate-50 px-5 pt-3 gap-2">
            <button
              onClick={() => setActiveTab('user')}
              className={`pb-2.5 px-3.5 text-xs font-bold flex items-center gap-2 border-b-2 transition-all cursor-pointer ${
                activeTab === 'user'
                  ? 'border-indigo-600 text-indigo-700 bg-white rounded-t-lg shadow-2xs'
                  : 'border-transparent text-slate-500 hover:text-slate-800'
              }`}
            >
              <User className="w-4 h-4" />
              <span>Giải pháp 1: API Key Cá Nhân</span>
              {userApiKey && (
                <span className="w-2 h-2 rounded-full bg-emerald-500" title="Đã lưu key cá nhân" />
              )}
            </button>

            <button
              onClick={() => setActiveTab('system')}
              className={`pb-2.5 px-3.5 text-xs font-bold flex items-center gap-2 border-b-2 transition-all cursor-pointer ${
                activeTab === 'system'
                  ? 'border-indigo-600 text-indigo-700 bg-white rounded-t-lg shadow-2xs'
                  : 'border-transparent text-slate-500 hover:text-slate-800'
              }`}
            >
              <Server className="w-4 h-4" />
              <span>Giải pháp 2: API Chung Toàn Web (Quản Trị)</span>
              <span
                className={`text-[10px] px-1.5 py-0.2 rounded font-semibold ${
                  systemConfig.isQuotaExceeded
                    ? 'bg-rose-100 text-rose-700'
                    : systemConfig.hasSystemKey
                    ? 'bg-emerald-100 text-emerald-700'
                    : 'bg-slate-200 text-slate-600'
                }`}
              >
                {systemConfig.isQuotaExceeded ? 'Hết tín dụng' : systemConfig.hasSystemKey ? 'Sẵn sàng' : 'Chưa có'}
              </span>
            </button>
          </div>
        )}

        {/* Tab Content */}
        <div className="p-6 overflow-y-auto space-y-5 text-slate-700 flex-1">
          {!isTeacherOrAdmin || activeTab === 'user' ? (
            /* ========================================================= */
            /* TAB 1: GIẢI PHÁP 1 - NGƯỜI DÙNG TỰ CẤU HÌNH API KEY CÁ NHÂN */
            /* ========================================================= */
            <div className="space-y-4">
              <div className="bg-indigo-50/70 border border-indigo-100 rounded-xl p-3.5 flex items-start gap-3">
                <Info className="w-5 h-5 text-indigo-600 shrink-0 mt-0.5" />
                <div className="text-xs text-indigo-950">
                  <p className="font-semibold text-indigo-900">
                    Chính sách ưu tiên thông minh:
                  </p>
                  <p className="mt-0.5 text-slate-600">
                    Trang web mặc định ưu tiên sử dụng API key chung của hệ thống. Nếu API key chung bị hết tín dụng hoặc xảy ra lỗi giới hạn, hệ thống sẽ tự động dùng API key cá nhân của bạn dưới đây để đảm bảo việc làm bài thi và chấm điểm không bị gián đoạn.
                  </p>
                </div>
              </div>

              {/* 1. Nhập API Key */}
              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
                    <KeyRound className="w-3.5 h-3.5 text-indigo-600" />
                    <span>Nhập API Key Cá Nhân của bạn:</span>
                  </label>
                  <a
                    href="https://aistudio.google.com/app/apikey"
                    target="_blank"
                    rel="noreferrer"
                    className="text-[11px] text-indigo-600 hover:text-indigo-800 font-semibold flex items-center gap-1 hover:underline cursor-pointer"
                  >
                    <span>Lấy API Key Google AI Studio miễn phí</span>
                    <ExternalLink className="w-3 h-3" />
                  </a>
                </div>

                <div className="relative">
                  <input
                    type={showUserKey ? 'text' : 'password'}
                    value={userApiKey}
                    onChange={(e) => {
                      setUserApiKey(e.target.value);
                      setUserTestResult(null);
                    }}
                    placeholder="AIzaSy..."
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-xs font-mono focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:bg-white pr-20 transition-all"
                  />
                  <div className="absolute right-2 top-1/2 -translate-y-1/2 flex items-center gap-1">
                    <button
                      type="button"
                      onClick={() => setShowUserKey(!showUserKey)}
                      className="p-1 text-slate-400 hover:text-slate-600 rounded transition-colors cursor-pointer"
                      title={showUserKey ? 'Ẩn API Key' : 'Hiện API Key'}
                    >
                      {showUserKey ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                    {userApiKey && (
                      <button
                        type="button"
                        onClick={() => {
                          setUserApiKey('');
                          setUserTestResult(null);
                        }}
                        className="p-1 text-slate-400 hover:text-rose-500 rounded text-xs transition-colors cursor-pointer"
                        title="Xóa Key"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    )}
                  </div>
                </div>
                <p className="text-[11px] text-slate-500 mt-1">
                  API Key của bạn được lưu an toàn trên trình duyệt cá nhân (localStorage) và chỉ gửi qua kênh bảo mật cho các tác vụ AI.
                </p>
              </div>

              {/* 2. Chọn phiên bản + Nút Tải lên phiên bản mới nhất */}
              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
                    <Sparkles className="w-3.5 h-3.5 text-indigo-600" />
                    <span>Chọn Phiên Bản (Model Version):</span>
                  </label>

                  {/* Nút Tải lên phiên bản mới nhất */}
                  <button
                    type="button"
                    onClick={handleFetchLatestModels}
                    disabled={isLoadingModels}
                    className="px-2.5 py-1 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-all cursor-pointer disabled:opacity-50"
                    title="Tải lên và cập nhật danh sách các phiên bản Gemini mới nhất"
                  >
                    <RefreshCw className={`w-3 h-3 ${isLoadingModels ? 'animate-spin' : ''}`} />
                    <span>Tải lên phiên bản mới nhất</span>
                  </button>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  {availableModels.map((model) => {
                    const isSelected = selectedModel === model.id;
                    return (
                      <div
                        key={model.id}
                        onClick={() => {
                          setSelectedModel(model.id);
                          setUserTestResult(null);
                        }}
                        className={`p-3 rounded-xl border text-left cursor-pointer transition-all ${
                          isSelected
                            ? 'border-indigo-600 bg-indigo-50/60 ring-1 ring-indigo-600 shadow-2xs'
                            : 'border-slate-200 bg-white hover:border-slate-300 hover:bg-slate-50'
                        }`}
                      >
                        <div className="flex items-center justify-between gap-1 mb-1">
                          <span className="text-xs font-bold text-slate-800">{model.name}</span>
                          <span
                            className={`text-[10px] px-1.5 py-0.2 rounded font-semibold ${
                              model.isRecommended
                                ? 'bg-amber-100 text-amber-800 font-bold'
                                : 'bg-slate-100 text-slate-600'
                            }`}
                          >
                            {model.tag}
                          </span>
                        </div>
                        <p className="text-[11px] text-slate-500 line-clamp-2 leading-relaxed">
                          {model.description}
                        </p>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Tùy chọn ưu tiên dùng key cá nhân */}
              <div className="bg-slate-50 border border-slate-200 rounded-xl p-3 flex items-center justify-between gap-3">
                <div>
                  <p className="text-xs font-bold text-slate-800">
                    Luôn ưu tiên dùng API Key cá nhân này
                  </p>
                  <p className="text-[11px] text-slate-500">
                    Bật tùy chọn này nếu bạn muốn luôn luôn sử dụng hạn mức của chính bạn thay vì chia sẻ key chung với cả hệ thống.
                  </p>
                </div>
                <label className="relative inline-flex items-center cursor-pointer shrink-0">
                  <input
                    type="checkbox"
                    checked={usePersonalKey}
                    onChange={(e) => setUsePersonalKey(e.target.checked)}
                    className="sr-only peer"
                  />
                  <div className="w-10 h-5 bg-slate-300 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-indigo-600"></div>
                </label>
              </div>

              {/* Kết quả kiểm tra kết nối */}
              {userTestResult && (
                <div
                  className={`p-3 rounded-xl border flex items-start gap-2.5 text-xs animate-in fade-in duration-150 ${
                    userTestResult.success
                      ? 'bg-emerald-50 border-emerald-200 text-emerald-900'
                      : 'bg-rose-50 border-rose-200 text-rose-900'
                  }`}
                >
                  {userTestResult.success ? (
                    <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                  ) : (
                    <AlertTriangle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
                  )}
                  <div className="flex-1">
                    <p className="font-bold">
                      {userTestResult.success ? 'Kết nối thành công!' : 'Kiểm tra thất bại'}
                      {userTestResult.latencyMs ? ` (${userTestResult.latencyMs}ms)` : ''}
                    </p>
                    <p className="mt-0.5">{userTestResult.message}</p>
                  </div>
                </div>
              )}

              {/* Nhóm Nút: Kiểm tra kết nối + Lưu cấu hình */}
              <div className="flex flex-wrap items-center justify-between gap-2 pt-2 border-t border-slate-100">
                <button
                  type="button"
                  onClick={handleTestUserConnection}
                  disabled={isTestingUser || !userApiKey.trim()}
                  className="px-4 py-2.5 rounded-xl border border-indigo-200 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 text-xs font-bold flex items-center gap-2 transition-all cursor-pointer disabled:opacity-50"
                >
                  <Zap className={`w-3.5 h-3.5 ${isTestingUser ? 'animate-bounce' : 'text-amber-500'}`} />
                  <span>{isTestingUser ? 'Đang kiểm tra kết nối...' : 'Kiểm tra kết nối'}</span>
                </button>

                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={onClose}
                    className="px-4 py-2.5 rounded-xl border border-slate-300 text-slate-700 hover:bg-slate-100 text-xs font-semibold transition-all cursor-pointer"
                  >
                    Đóng
                  </button>

                  <button
                    type="button"
                    onClick={handleSaveUserConfig}
                    className="px-5 py-2.5 rounded-xl bg-linear-to-r from-indigo-600 to-violet-600 hover:from-indigo-700 hover:to-violet-700 text-white text-xs font-bold shadow-md shadow-indigo-200 flex items-center gap-2 transition-all cursor-pointer"
                  >
                    <Save className="w-4 h-4" />
                    <span>Lưu cấu hình</span>
                  </button>
                </div>
              </div>
            </div>
          ) : (
            /* ========================================================= */
            /* TAB 2: GIẢI PHÁP 2 - CẤU HÌNH API CHUNG TOÀN TRANG WEB    */
            /* ========================================================= */
            <div className="space-y-4">
              {/* Trạng thái hiện tại của hệ thống */}
              <div className="border border-slate-200 bg-slate-50/80 rounded-xl p-4 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-slate-600 uppercase tracking-wider">
                    Trạng thái API Key Toàn Trang Web
                  </span>
                  <span
                    className={`text-xs px-2.5 py-0.5 rounded-full font-bold flex items-center gap-1 ${
                      systemConfig.isQuotaExceeded
                        ? 'bg-rose-100 text-rose-700 border border-rose-200'
                        : systemConfig.hasSystemKey
                        ? 'bg-emerald-100 text-emerald-700 border border-emerald-200'
                        : 'bg-amber-100 text-amber-700 border border-amber-200'
                    }`}
                  >
                    {systemConfig.isQuotaExceeded ? (
                      <>
                        <AlertTriangle className="w-3.5 h-3.5" /> Hết tín dụng (Quota Exceeded)
                      </>
                    ) : systemConfig.hasSystemKey ? (
                      <>
                        <ShieldCheck className="w-3.5 h-3.5" /> Đang hoạt động bình thường
                      </>
                    ) : (
                      <>
                        <AlertTriangle className="w-3.5 h-3.5" /> Chưa thiết lập API Key chung
                      </>
                    )}
                  </span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 text-xs">
                  <div className="bg-white p-2.5 rounded-lg border border-slate-200">
                    <span className="text-slate-400 block text-[11px]">API Key hiện hành:</span>
                    <strong className="font-mono text-slate-800">
                      {systemConfig.maskedKey || '(Chưa cấu hình)'}
                    </strong>
                  </div>
                  <div className="bg-white p-2.5 rounded-lg border border-slate-200">
                    <span className="text-slate-400 block text-[11px]">Nguồn cấu hình:</span>
                    <strong className="text-slate-800 capitalize">
                      {systemConfig.source === 'custom'
                        ? 'Tùy chỉnh Quản trị viên'
                        : systemConfig.source === 'env'
                        ? 'Biến môi trường (.env)'
                        : 'Chưa có'}
                    </strong>
                  </div>
                  <div className="bg-white p-2.5 rounded-lg border border-slate-200">
                    <span className="text-slate-400 block text-[11px]">Phiên bản mặc định:</span>
                    <strong className="text-indigo-700">{systemConfig.systemModel}</strong>
                  </div>
                </div>

                {systemConfig.isQuotaExceeded && (
                  <div className="flex items-center justify-between bg-rose-50 border border-rose-200 rounded-lg p-2.5 text-xs text-rose-800">
                    <span>
                      Key hệ thống đang bị Google đánh dấu hết quota (429).
                    </span>
                    <button
                      type="button"
                      onClick={handleResetSystemQuota}
                      className="px-2.5 py-1 bg-white hover:bg-rose-100 border border-rose-300 text-rose-700 font-semibold rounded text-xs flex items-center gap-1 cursor-pointer transition-colors"
                    >
                      <RotateCcw className="w-3 h-3" />
                      <span>Đặt lại cờ Quota</span>
                    </button>
                  </div>
                )}
              </div>

              {/* Quyền quản trị chỉnh sửa API key chung */}
              {role === 'teacher' ? (
                <div className="space-y-4 pt-1">
                  <div>
                    <label className="text-xs font-bold text-slate-800 flex items-center gap-1.5 mb-1.5">
                      <KeyRound className="w-3.5 h-3.5 text-indigo-600" />
                      <span>Cập nhật API Key chung mới cho toàn bộ trang web:</span>
                    </label>
                    <div className="relative">
                      <input
                        type={showAdminKey ? 'text' : 'password'}
                        value={adminApiKey}
                        onChange={(e) => {
                          setAdminApiKey(e.target.value);
                          setSystemTestResult(null);
                        }}
                        placeholder="Nhập API Key chung mới (để trống nếu muốn giữ nguyên)..."
                        className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-xs font-mono focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:bg-white pr-10 transition-all"
                      />
                      <button
                        type="button"
                        onClick={() => setShowAdminKey(!showAdminKey)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 cursor-pointer"
                      >
                        {showAdminKey ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </button>
                    </div>
                  </div>

                  <div>
                    <label className="text-xs font-bold text-slate-800 flex items-center gap-1.5 mb-1.5">
                      <Sparkles className="w-3.5 h-3.5 text-indigo-600" />
                      <span>Phiên bản Gemini mặc định cho toàn web:</span>
                    </label>
                    <select
                      value={adminModel}
                      onChange={(e) => setAdminModel(e.target.value)}
                      className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:bg-white transition-all cursor-pointer"
                    >
                      {availableModels.map((m) => (
                        <option key={m.id} value={m.id}>
                          {m.name} - {m.tag}
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* Kết quả kiểm tra kết nối hệ thống */}
                  {systemTestResult && (
                    <div
                      className={`p-3 rounded-xl border flex items-start gap-2.5 text-xs animate-in fade-in duration-150 ${
                        systemTestResult.success
                          ? 'bg-emerald-50 border-emerald-200 text-emerald-900'
                          : 'bg-rose-50 border-rose-200 text-rose-900'
                      }`}
                    >
                      {systemTestResult.success ? (
                        <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                      ) : (
                        <AlertTriangle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
                      )}
                      <div className="flex-1">
                        <p className="font-bold">
                          {systemTestResult.success ? 'Kiểm tra thành công!' : 'Kiểm tra thất bại'}
                          {systemTestResult.latencyMs ? ` (${systemTestResult.latencyMs}ms)` : ''}
                        </p>
                        <p className="mt-0.5">{systemTestResult.message}</p>
                      </div>
                    </div>
                  )}

                  {/* Nút thao tác Admin */}
                  <div className="flex flex-wrap items-center justify-between gap-2 pt-2 border-t border-slate-100">
                    <button
                      type="button"
                      onClick={handleTestSystemConnection}
                      disabled={isTestingSystem || (!adminApiKey.trim() && !systemConfig.hasSystemKey)}
                      className="px-4 py-2.5 rounded-xl border border-indigo-200 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 text-xs font-bold flex items-center gap-2 transition-all cursor-pointer disabled:opacity-50"
                    >
                      <Zap className={`w-3.5 h-3.5 ${isTestingSystem ? 'animate-bounce' : 'text-amber-500'}`} />
                      <span>{isTestingSystem ? 'Đang kiểm tra...' : 'Kiểm tra kết nối hệ thống'}</span>
                    </button>

                    <button
                      type="button"
                      onClick={handleSaveSystemConfig}
                      disabled={isSavingSystem}
                      className="px-5 py-2.5 rounded-xl bg-linear-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white text-xs font-bold shadow-md shadow-emerald-200 flex items-center gap-2 transition-all cursor-pointer disabled:opacity-50"
                    >
                      <Save className="w-4 h-4" />
                      <span>{isSavingSystem ? 'Đang lưu...' : 'Lưu cấu hình toàn web'}</span>
                    </button>
                  </div>
                </div>
              ) : (
                <div className="bg-amber-50 border border-amber-200 rounded-xl p-3.5 text-xs text-amber-900 flex items-start gap-2.5">
                  <Info className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                  <div>
                    <p className="font-bold">Chế độ người học:</p>
                    <p className="mt-0.5">
                      Chỉ tài khoản Giáo viên / Quản trị viên mới có quyền cập nhật API key chung toàn hệ thống. Học sinh có thể cấu hình API key cá nhân của mình ở Tab <strong>"Giải pháp 1: API Key Cá Nhân"</strong> để dùng độc lập khi API key chung bị hết hạn mức.
                    </p>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
