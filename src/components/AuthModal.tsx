import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import {
  X,
  Lock,
  User,
  ShieldCheck,
  AlertCircle,
  Loader2,
  ArrowRight,
  Info,
} from 'lucide-react';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const AuthModal: React.FC<AuthModalProps> = ({ isOpen, onClose }) => {
  const {
    authUser,
    currentAccount,
    loginWithGoogleAuth,
    loginWithIdentifierAuth,
    logout,
    role,
  } = useApp();

  const [identifier, setIdentifier] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleLoginSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    const cleanId = identifier.trim();
    if (!cleanId) {
      setErrorMessage('Vui lòng nhập Tên đăng nhập (Username) hoặc Email.');
      return;
    }
    if (!password) {
      setErrorMessage('Vui lòng nhập Mật khẩu.');
      return;
    }

    setIsLoading(true);

    try {
      await loginWithIdentifierAuth(cleanId, password);
      onClose();
    } catch (err: any) {
      let msg = err.message || 'Lỗi đăng nhập hệ thống.';
      if (
        msg.includes('auth/invalid-credential') ||
        msg.includes('auth/wrong-password') ||
        msg.includes('auth/user-not-found')
      ) {
        msg = 'Tên đăng nhập/Email hoặc mật khẩu không chính xác.';
      } else if (msg.includes('auth/too-many-requests')) {
        msg = 'Bạn đã thử đăng nhập sai quá nhiều lần. Vui lòng thử lại sau ít phút.';
      }
      setErrorMessage(msg);
    } finally {
      setIsLoading(false);
    }
  };

  const handleGoogleSignIn = async () => {
    setErrorMessage(null);
    setIsLoading(true);
    try {
      await loginWithGoogleAuth();
      onClose();
    } catch (err: any) {
      if (err.code === 'auth/popup-blocked' || err.message?.includes('popup-blocked')) {
        setErrorMessage(
          'Trình duyệt đã chặn cửa sổ pop-up của Google (do trang web đang mở trong khung iframe). Vui lòng đăng nhập trực tiếp bằng Email & Mật khẩu bên dưới!'
        );
      } else if (!err.message?.includes('popup-closed-by-user')) {
        setErrorMessage(err.message || 'Không thể đăng nhập Google.');
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/70 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="bg-white rounded-3xl shadow-2xl max-w-md w-full border border-slate-100 overflow-hidden">
        {/* Header */}
        <div className="bg-linear-to-r from-indigo-900 via-indigo-800 to-violet-900 p-6 text-white relative">
          <button
            onClick={onClose}
            className="absolute top-4 right-4 text-white/80 hover:text-white p-1 rounded-lg hover:bg-white/10 transition-colors cursor-pointer"
            title="Đóng cửa sổ"
          >
            <X className="w-5 h-5" />
          </button>

          <h2 className="text-xl font-extrabold text-white">
            {authUser ? 'Hồ Sơ Tài Khoản Của Bạn' : 'Đăng Nhập Hệ Thống'}
          </h2>
          <p className="text-xs text-indigo-200 mt-1 leading-relaxed">
            Hệ thống quản lý ôn thi vào 10 chuyên &amp; công lập TP.HCM theo chuẩn GDPT 2018.
          </p>
        </div>

        {/* Body */}
        <div className="p-6 space-y-4 text-xs">
          {authUser ? (
            <div className="space-y-4 text-center">
              <div className="w-16 h-16 rounded-3xl bg-linear-to-tr from-indigo-600 to-violet-600 text-white flex items-center justify-center mx-auto text-2xl font-black shadow-md">
                {authUser.photoURL ? (
                  <img src={authUser.photoURL} alt="Avatar" className="w-full h-full rounded-3xl object-cover" />
                ) : (
                  currentAccount?.avatar || (role === 'teacher' ? '👨‍🏫' : '👩‍🎓')
                )}
              </div>

              <div>
                <h3 className="font-extrabold text-slate-900 text-base">
                  {currentAccount?.name || authUser.displayName || 'Người dùng'}
                </h3>
                <p className="text-slate-500 text-xs font-mono">{authUser.email}</p>
                {currentAccount?.username && (
                  <p className="text-[11px] text-slate-400 mt-0.5">
                    Username: <span className="font-semibold text-slate-600">@{currentAccount.username}</span>
                  </p>
                )}

                <div className="mt-2 inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-indigo-50 text-indigo-700 border border-indigo-200">
                  <ShieldCheck className="w-3.5 h-3.5 text-indigo-600" />
                  <span>
                    Phân quyền: {role === 'teacher' ? 'Quản Trị Viên & Giáo Viên' : 'Học Sinh'}
                  </span>
                </div>
              </div>

              <div className="pt-3 border-t border-slate-100 flex flex-col gap-2">
                <button
                  onClick={() => {
                    logout();
                    onClose();
                  }}
                  className="w-full py-2.5 rounded-xl bg-rose-50 text-rose-700 hover:bg-rose-100 font-bold transition-colors cursor-pointer"
                >
                  Đăng Xuất Khỏi Tài Khoản
                </button>
              </div>
            </div>
          ) : (
            <>
              {/* Google 1-Click Sign In */}
              <button
                type="button"
                onClick={handleGoogleSignIn}
                disabled={isLoading}
                className="w-full py-2.5 px-4 rounded-xl border border-slate-300 hover:bg-slate-50 font-bold text-slate-700 flex items-center justify-center gap-2.5 shadow-2xs transition-all cursor-pointer disabled:opacity-50"
              >
                <svg className="w-4 h-4" viewBox="0 0 24 24">
                  <path
                    fill="#4285F4"
                    d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                  />
                  <path
                    fill="#34A853"
                    d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                  />
                  <path
                    fill="#FBBC05"
                    d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
                  />
                  <path
                    fill="#EA4335"
                    d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
                  />
                </svg>
                <span>Đăng nhập với Google</span>
              </button>

              <div className="flex items-center my-2.5">
                <div className="flex-1 border-t border-slate-200"></div>
                <span className="px-3 text-[11px] text-slate-400 uppercase font-semibold">hoặc đăng nhập bằng tài khoản</span>
                <div className="flex-1 border-t border-slate-200"></div>
              </div>

              {/* Error Message */}
              {errorMessage && (
                <div className="p-3 bg-rose-50 border border-rose-200 rounded-xl text-rose-800 text-[11px] flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
                  <span className="leading-tight">{errorMessage}</span>
                </div>
              )}

              {/* Login Form: Supports Username OR Email */}
              <form onSubmit={handleLoginSubmit} className="space-y-3.5">
                <div>
                  <label className="block text-[11px] font-bold text-slate-700 uppercase mb-1">
                    Tên đăng nhập (Username) hoặc Email:
                  </label>
                  <div className="relative">
                    <User className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                    <input
                      type="text"
                      required
                      value={identifier}
                      onChange={(e) => setIdentifier(e.target.value)}
                      placeholder="Nhập tên đăng nhập hoặc email của bạn..."
                      className="w-full pl-9 pr-3.5 py-2.5 border border-slate-300 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:outline-none text-xs font-medium"
                    />
                  </div>
                  <p className="text-[10px] text-slate-400 mt-1">
                    * Nếu nhập Tên đăng nhập (không chứa ký tự @), hệ thống sẽ tự động tra cứu email liên kết trong Database.
                  </p>
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-slate-700 uppercase mb-1">
                    Mật khẩu:
                  </label>
                  <div className="relative">
                    <Lock className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                    <input
                      type="password"
                      required
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="Nhập mật khẩu của bạn..."
                      className="w-full pl-9 pr-3.5 py-2.5 border border-slate-300 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:outline-none text-xs font-medium"
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={isLoading}
                  className="w-full py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs shadow-md shadow-indigo-200 flex items-center justify-center gap-2 transition-all cursor-pointer disabled:opacity-50"
                >
                  {isLoading ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" /> Đang kiểm tra &amp; đăng nhập...
                    </>
                  ) : (
                    <>
                      <span>Đăng Nhập</span> <ArrowRight className="w-3.5 h-3.5" />
                    </>
                  )}
                </button>
              </form>

              {/* Requirement: Strict Security Note */}
              <div className="pt-3 border-t border-slate-100 text-center">
                <div className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl bg-amber-50/80 border border-amber-200 text-amber-900 text-xs font-medium">
                  <Info className="w-4 h-4 text-amber-600 shrink-0" />
                  <span>Nếu chưa có tài khoản, vui lòng liên hệ Quản trị viên</span>
                </div>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
};
