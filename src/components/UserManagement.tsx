import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { AppUserAccount, UserRole } from '../types';
import {
  Users,
  UserPlus,
  Search,
  Filter,
  Edit2,
  Trash2,
  ShieldCheck,
  GraduationCap,
  School,
  CheckCircle2,
  X,
  Lock,
  Mail,
  User,
  AlertCircle,
  Loader2,
  KeyRound,
  FileSpreadsheet,
  Building,
  Target,
  Sparkles,
  Info,
} from 'lucide-react';

export const UserManagement: React.FC = () => {
  const {
    userAccounts,
    addUserAccount,
    editUserAccount,
    removeUserAccount,
    authUser,
    showToast,
  } = useApp();

  const [searchQuery, setSearchQuery] = useState('');
  const [roleFilter, setRoleFilter] = useState<'all' | UserRole>('all');

  // Modal States
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [selectedUserToEdit, setSelectedUserToEdit] = useState<AppUserAccount | null>(null);
  const [userToDelete, setUserToDelete] = useState<AppUserAccount | null>(null);

  // Form States (Create)
  const [createName, setCreateName] = useState('');
  const [createUsername, setCreateUsername] = useState('');
  const [createEmail, setCreateEmail] = useState('');
  const [createPassword, setCreatePassword] = useState('');
  const [createRole, setCreateRole] = useState<UserRole>('student');
  const [createTargetSchool, setCreateTargetSchool] = useState('THPT Nguyễn Thị Minh Khai');
  const [createTargetScore, setCreateTargetScore] = useState(9.0);
  const [createNotes, setCreateNotes] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);

  // Form States (Edit)
  const [editName, setEditName] = useState('');
  const [editUsername, setEditUsername] = useState('');
  const [editEmail, setEditEmail] = useState('');
  const [editRole, setEditRole] = useState<UserRole>('student');
  const [editTargetSchool, setEditTargetSchool] = useState('');
  const [editIsActive, setEditIsActive] = useState(true);
  const [editNotes, setEditNotes] = useState('');

  // Filtered List
  const filteredUsers = userAccounts.filter((acc) => {
    const matchesSearch =
      acc.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      acc.username.toLowerCase().includes(searchQuery.toLowerCase()) ||
      acc.email.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesRole = roleFilter === 'all' || acc.role === roleFilter;
    return matchesSearch && matchesRole;
  });

  const totalTeachers = userAccounts.filter((u) => u.role === 'teacher').length;
  const totalStudents = userAccounts.filter((u) => u.role === 'student').length;

  // Handle Open Edit Modal
  const handleOpenEdit = (user: AppUserAccount) => {
    setSelectedUserToEdit(user);
    setEditName(user.name);
    setEditUsername(user.username);
    setEditEmail(user.email);
    setEditRole(user.role);
    setEditTargetSchool(user.targetSchool || '');
    setEditIsActive(user.isActive !== false);
    setEditNotes(user.notes || '');
    setFormError(null);
    setIsEditModalOpen(true);
  };

  // Handle Submit Create
  const handleCreateSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);

    if (!createUsername.trim()) {
      setFormError('Vui lòng nhập Tên đăng nhập (Username).');
      return;
    }
    if (!createEmail.trim()) {
      setFormError('Vui lòng nhập Email cho tài khoản.');
      return;
    }
    if (createPassword && createPassword.length < 6) {
      setFormError('Mật khẩu cần tối thiểu 6 ký tự.');
      return;
    }

    setIsSubmitting(true);
    try {
      await addUserAccount({
        name: createName,
        username: createUsername,
        email: createEmail,
        password: createPassword,
        role: createRole,
        targetSchool: createRole === 'student' ? createTargetSchool : undefined,
        notes: createNotes,
      });

      setIsCreateModalOpen(false);
      // Reset form
      setCreateName('');
      setCreateUsername('');
      setCreateEmail('');
      setCreatePassword('');
      setCreateRole('student');
      setCreateNotes('');
    } catch (err: any) {
      console.error(err);
      setFormError(err.message || 'Lỗi khi tạo tài khoản người dùng.');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Handle Submit Edit
  const handleEditSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedUserToEdit) return;

    setFormError(null);
    setIsSubmitting(true);
    try {
      await editUserAccount(selectedUserToEdit.id, {
        name: editName,
        username: editUsername,
        email: editEmail,
        role: editRole,
        targetSchool: editTargetSchool,
        isActive: editIsActive,
        notes: editNotes,
      });

      setIsEditModalOpen(false);
      setSelectedUserToEdit(null);
    } catch (err: any) {
      console.error(err);
      setFormError(err.message || 'Lỗi khi cập nhật tài khoản.');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Handle Confirm Delete
  const handleConfirmDelete = async () => {
    if (!userToDelete) return;
    setIsSubmitting(true);
    try {
      await removeUserAccount(userToDelete.id);
      setUserToDelete(null);
    } catch (err: any) {
      showToast(err.message || 'Lỗi khi xóa tài khoản.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-6 pb-16">
      {/* 1. Header Bar */}
      <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200/80 shadow-xs flex flex-wrap items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="bg-amber-100 text-amber-900 text-[10px] font-extrabold px-2.5 py-0.5 rounded-full uppercase tracking-wider flex items-center gap-1">
              <ShieldCheck className="w-3.5 h-3.5 text-amber-600" />
              Bảo Mật &amp; Phân Quyền RBAC
            </span>
            <span className="text-xs text-slate-500 font-medium">Hệ thống Firestore</span>
          </div>
          <h1 className="text-xl sm:text-2xl font-black text-slate-900 mt-1">
            Quản Lý Tài Khoản Người Dùng &amp; Phân Quyền
          </h1>
          <p className="text-xs text-slate-500 mt-1 max-w-2xl leading-relaxed">
            Quản trị viên toàn quyền xem danh sách, cấp phát tài khoản, phân quyền Giáo viên / Học sinh và quản lý mật khẩu.
          </p>
        </div>

        <button
          onClick={() => {
            setFormError(null);
            setIsCreateModalOpen(true);
          }}
          className="px-5 py-3 rounded-2xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs shadow-md shadow-indigo-200 flex items-center gap-2 transition-all cursor-pointer"
        >
          <UserPlus className="w-4 h-4" /> Thêm Tài Khoản Mới
        </button>
      </div>

      {/* 2. Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-xs flex items-center justify-between">
          <div>
            <span className="text-xs text-slate-500 font-medium">Tổng tài khoản hệ thống</span>
            <p className="text-2xl font-black text-slate-900 mt-1">{userAccounts.length}</p>
          </div>
          <div className="w-12 h-12 rounded-2xl bg-indigo-50 text-indigo-600 flex items-center justify-center">
            <Users className="w-6 h-6" />
          </div>
        </div>

        <div className="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-xs flex items-center justify-between">
          <div>
            <span className="text-xs text-slate-500 font-medium">Quản trị viên &amp; Giáo viên</span>
            <p className="text-2xl font-black text-indigo-700 mt-1">{totalTeachers}</p>
          </div>
          <div className="w-12 h-12 rounded-2xl bg-indigo-50 text-indigo-600 flex items-center justify-center">
            <School className="w-6 h-6" />
          </div>
        </div>

        <div className="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-xs flex items-center justify-between">
          <div>
            <span className="text-xs text-slate-500 font-medium">Học sinh lớp 9</span>
            <p className="text-2xl font-black text-emerald-600 mt-1">{totalStudents}</p>
          </div>
          <div className="w-12 h-12 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
            <GraduationCap className="w-6 h-6" />
          </div>
        </div>
      </div>

      {/* 3. Search and Filters */}
      <div className="bg-white rounded-2xl p-4 border border-slate-200/80 shadow-xs flex flex-wrap items-center justify-between gap-3">
        <div className="relative flex-1 min-w-[240px]">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Tìm theo Tên, Username (@username) hoặc Email..."
            className="w-full pl-10 pr-4 py-2 border border-slate-200 rounded-xl text-xs font-medium focus:ring-2 focus:ring-indigo-500 focus:outline-none"
          />
        </div>

        <div className="flex items-center gap-2">
          <Filter className="w-4 h-4 text-slate-400" />
          <select
            value={roleFilter}
            onChange={(e) => setRoleFilter(e.target.value as any)}
            className="px-3 py-2 border border-slate-200 rounded-xl text-xs font-semibold bg-white text-slate-700"
          >
            <option value="all">Tất cả phân quyền ({userAccounts.length})</option>
            <option value="teacher">Quản trị viên &amp; Giáo viên ({totalTeachers})</option>
            <option value="student">Học sinh ({totalStudents})</option>
          </select>
        </div>
      </div>

      {/* 4. Users Table */}
      <div className="bg-white rounded-3xl border border-slate-200/80 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50/80 text-slate-500 font-bold border-b border-slate-200 uppercase tracking-wider text-[10px]">
              <tr>
                <th className="px-5 py-4">Tài khoản &amp; Họ tên</th>
                <th className="px-5 py-4">Tên đăng nhập (Username)</th>
                <th className="px-5 py-4">Email đăng nhập</th>
                <th className="px-5 py-4">Phân quyền (Role)</th>
                <th className="px-5 py-4">Trường mục tiêu / Lớp</th>
                <th className="px-5 py-4">Trạng thái</th>
                <th className="px-5 py-4 text-right">Thao tác</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 font-medium text-slate-700">
              {filteredUsers.length > 0 ? (
                filteredUsers.map((user) => {
                  const isCurrentLoggedIn = Boolean(authUser && authUser.uid === user.id);

                  return (
                    <tr key={user.id} className="hover:bg-slate-50/60 transition-colors">
                      <td className="px-5 py-4">
                        <div className="flex items-center gap-3">
                          <div className="w-9 h-9 rounded-xl bg-linear-to-tr from-indigo-600 to-violet-600 text-white flex items-center justify-center font-bold text-sm shadow-xs shrink-0">
                            {user.avatar || (user.role === 'teacher' ? '👨‍🏫' : '👩‍🎓')}
                          </div>
                          <div>
                            <p className="font-bold text-slate-900 text-xs flex items-center gap-1.5">
                              {user.name}
                              {isCurrentLoggedIn && (
                                <span className="bg-indigo-100 text-indigo-800 text-[9px] font-extrabold px-1.5 py-0.2 rounded-full">
                                  Bạn
                                </span>
                              )}
                            </p>
                            <span className="text-[10px] text-slate-400">
                              UID: {user.id.slice(0, 8)}...
                            </span>
                          </div>
                        </div>
                      </td>

                      <td className="px-5 py-4">
                        <span className="font-mono font-bold text-indigo-700 bg-indigo-50 px-2 py-0.5 rounded-lg border border-indigo-100">
                          @{user.username || 'chua_dat'}
                        </span>
                      </td>

                      <td className="px-5 py-4 text-slate-600 font-mono text-[11px]">
                        {user.email || '(Chưa có email)'}
                      </td>

                      <td className="px-5 py-4">
                        {user.role === 'teacher' ? (
                          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-extrabold bg-amber-100 text-amber-900 border border-amber-200 shadow-2xs">
                            <School className="w-3 h-3 text-amber-700" /> Quản Trị &amp; Giáo Viên
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-extrabold bg-blue-100 text-blue-900 border border-blue-200 shadow-2xs">
                            <GraduationCap className="w-3 h-3 text-blue-700" /> Học Sinh
                          </span>
                        )}
                      </td>

                      <td className="px-5 py-4 text-slate-600">
                        {user.targetSchool ? (
                          <span className="font-semibold text-slate-800">{user.targetSchool}</span>
                        ) : (
                          <span className="text-slate-400 italic">Tổ Tiếng Anh Khối 9</span>
                        )}
                      </td>

                      <td className="px-5 py-4">
                        {user.isActive !== false ? (
                          <span className="inline-flex items-center gap-1 text-[11px] font-bold text-emerald-700">
                            <span className="w-2 h-2 rounded-full bg-emerald-500"></span> Hoạt động
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 text-[11px] font-bold text-rose-600">
                            <span className="w-2 h-2 rounded-full bg-rose-500"></span> Đã khóa
                          </span>
                        )}
                      </td>

                      <td className="px-5 py-4 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          <button
                            onClick={() => handleOpenEdit(user)}
                            className="p-1.5 rounded-lg text-slate-500 hover:text-indigo-600 hover:bg-indigo-50 transition-colors cursor-pointer"
                            title="Chỉnh sửa tài khoản & phân quyền"
                          >
                            <Edit2 className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => setUserToDelete(user)}
                            disabled={isCurrentLoggedIn}
                            className={`p-1.5 rounded-lg transition-colors ${
                              isCurrentLoggedIn
                                ? 'text-slate-300 cursor-not-allowed'
                                : 'text-slate-500 hover:text-rose-600 hover:bg-rose-50 cursor-pointer'
                            }`}
                            title={isCurrentLoggedIn ? 'Không thể xóa tài khoản đang đăng nhập' : 'Xóa tài khoản'}
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              ) : (
                <tr>
                  <td colSpan={7} className="px-5 py-12 text-center text-slate-400">
                    <p className="text-sm font-semibold">Không tìm thấy tài khoản phù hợp với tìm kiếm.</p>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* 5. MODAL: CREATE ACCOUNT */}
      {isCreateModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-200">
          <div className="bg-white rounded-3xl shadow-2xl max-w-lg w-full border border-slate-100 overflow-hidden">
            <div className="bg-linear-to-r from-indigo-900 to-violet-900 p-5 text-white flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-amber-400 text-indigo-950 flex items-center justify-center font-bold">
                  <UserPlus className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-extrabold text-sm sm:text-base">Thêm Tài Khoản Người Dùng Mới</h3>
                  <p className="text-[11px] text-indigo-200">Cấp phát tài khoản trực tiếp vào Authentication &amp; Firestore</p>
                </div>
              </div>
              <button
                onClick={() => setIsCreateModalOpen(false)}
                className="text-white/80 hover:text-white p-1 rounded-lg hover:bg-white/10"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateSubmit} className="p-6 space-y-4 text-xs">
              {formError && (
                <div className="p-3 bg-rose-50 border border-rose-200 rounded-xl text-rose-800 text-[11px] flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
                  <span>{formError}</span>
                </div>
              )}

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] font-bold text-slate-700 uppercase mb-1">
                    Họ và tên: *
                  </label>
                  <input
                    type="text"
                    required
                    value={createName}
                    onChange={(e) => setCreateName(e.target.value)}
                    placeholder="Ví dụ: Nguyễn Văn An"
                    className="w-full px-3.5 py-2 border border-slate-300 rounded-xl text-xs font-medium focus:ring-2 focus:ring-indigo-500"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-slate-700 uppercase mb-1">
                    Tên đăng nhập (Username): *
                  </label>
                  <input
                    type="text"
                    required
                    value={createUsername}
                    onChange={(e) => setCreateUsername(e.target.value.toLowerCase().replace(/\s+/g, ''))}
                    placeholder="Ví dụ: nguyenan"
                    className="w-full px-3.5 py-2 border border-slate-300 rounded-xl text-xs font-mono font-bold focus:ring-2 focus:ring-indigo-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] font-bold text-slate-700 uppercase mb-1">
                    Email đăng nhập: *
                  </label>
                  <input
                    type="email"
                    required
                    value={createEmail}
                    onChange={(e) => setCreateEmail(e.target.value)}
                    placeholder="nguyenan@example.com"
                    className="w-full px-3.5 py-2 border border-slate-300 rounded-xl text-xs font-medium focus:ring-2 focus:ring-indigo-500"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-slate-700 uppercase mb-1">
                    Mật khẩu ban đầu: *
                  </label>
                  <input
                    type="password"
                    required
                    value={createPassword}
                    onChange={(e) => setCreatePassword(e.target.value)}
                    placeholder="Tối thiểu 6 ký tự..."
                    className="w-full px-3.5 py-2 border border-slate-300 rounded-xl text-xs font-medium focus:ring-2 focus:ring-indigo-500"
                  />
                </div>
              </div>

              {/* Requirement: DROPDOWN CHỌN PHÂN QUYỀN (ROLE) */}
              <div>
                <label className="block text-[11px] font-bold text-slate-700 uppercase mb-1">
                  Phân quyền (Role): *
                </label>
                <select
                  value={createRole}
                  onChange={(e) => setCreateRole(e.target.value as UserRole)}
                  className="w-full px-3.5 py-2.5 border border-indigo-300 bg-indigo-50/50 rounded-xl text-xs font-bold text-indigo-950 focus:ring-2 focus:ring-indigo-500 cursor-pointer"
                >
                  <option value="student">🎓 Học sinh (Luyện thi vào 10, làm bài kiểm tra &amp; nộp bài OCR)</option>
                  <option value="teacher">👨‍🏫 Quản trị viên &amp; Giáo viên (Toàn quyền quản lý đề thi, lớp học &amp; tài khoản)</option>
                </select>
              </div>

              {createRole === 'student' && (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 p-3 bg-slate-50 rounded-xl border border-slate-200">
                  <div>
                    <label className="block text-[10px] font-bold text-slate-600 uppercase mb-1">
                      Trường mục tiêu:
                    </label>
                    <input
                      type="text"
                      value={createTargetSchool}
                      onChange={(e) => setCreateTargetSchool(e.target.value)}
                      placeholder="THPT Nguyễn Thị Minh Khai"
                      className="w-full px-3 py-1.5 border border-slate-300 rounded-lg text-xs"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] font-bold text-slate-600 uppercase mb-1">
                      Điểm mục tiêu:
                    </label>
                    <input
                      type="number"
                      step="0.25"
                      min="1"
                      max="10"
                      value={createTargetScore}
                      onChange={(e) => setCreateTargetScore(Number(e.target.value))}
                      className="w-full px-3 py-1.5 border border-slate-300 rounded-lg text-xs font-bold"
                    />
                  </div>
                </div>
              )}

              <div>
                <label className="block text-[11px] font-bold text-slate-700 uppercase mb-1">
                  Ghi chú thêm (Tùy chọn):
                </label>
                <input
                  type="text"
                  value={createNotes}
                  onChange={(e) => setCreateNotes(e.target.value)}
                  placeholder="Ví dụ: Học sinh đội tuyển, giáo viên bộ môn..."
                  className="w-full px-3.5 py-2 border border-slate-300 rounded-xl text-xs font-medium"
                />
              </div>

              <div className="pt-3 border-t border-slate-100 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsCreateModalOpen(false)}
                  className="px-4 py-2 rounded-xl text-xs font-bold text-slate-600 hover:bg-slate-100 cursor-pointer"
                >
                  Hủy
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs shadow-md shadow-indigo-200 flex items-center gap-2 cursor-pointer disabled:opacity-50"
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" /> Đang tạo tài khoản...
                    </>
                  ) : (
                    <>
                      <CheckCircle2 className="w-4 h-4" /> Xác Nhận Thêm Tài Khoản
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* 6. MODAL: EDIT ACCOUNT */}
      {isEditModalOpen && selectedUserToEdit && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-200">
          <div className="bg-white rounded-3xl shadow-2xl max-w-lg w-full border border-slate-100 overflow-hidden">
            <div className="bg-linear-to-r from-slate-900 to-indigo-950 p-5 text-white flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-indigo-500 text-white flex items-center justify-center font-bold">
                  <Edit2 className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-extrabold text-sm sm:text-base">Chỉnh Sửa Tài Khoản &amp; Phân Quyền</h3>
                  <p className="text-[11px] text-indigo-200">{selectedUserToEdit.email}</p>
                </div>
              </div>
              <button
                onClick={() => setIsEditModalOpen(false)}
                className="text-white/80 hover:text-white p-1 rounded-lg hover:bg-white/10"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleEditSubmit} className="p-6 space-y-4 text-xs">
              {formError && (
                <div className="p-3 bg-rose-50 border border-rose-200 rounded-xl text-rose-800 text-[11px] flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
                  <span>{formError}</span>
                </div>
              )}

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] font-bold text-slate-700 uppercase mb-1">
                    Họ và tên: *
                  </label>
                  <input
                    type="text"
                    required
                    value={editName}
                    onChange={(e) => setEditName(e.target.value)}
                    className="w-full px-3.5 py-2 border border-slate-300 rounded-xl text-xs font-medium"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-slate-700 uppercase mb-1">
                    Tên đăng nhập (Username): *
                  </label>
                  <input
                    type="text"
                    required
                    value={editUsername}
                    onChange={(e) => setEditUsername(e.target.value.toLowerCase().replace(/\s+/g, ''))}
                    className="w-full px-3.5 py-2 border border-slate-300 rounded-xl text-xs font-mono font-bold"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[11px] font-bold text-slate-700 uppercase mb-1">
                  Email đăng nhập: *
                </label>
                <input
                  type="email"
                  required
                  value={editEmail}
                  onChange={(e) => setEditEmail(e.target.value)}
                  className="w-full px-3.5 py-2 border border-slate-300 rounded-xl text-xs font-medium"
                />
              </div>

              {/* Requirement: DROPDOWN CHỌN PHÂN QUYỀN (ROLE) */}
              <div>
                <label className="block text-[11px] font-bold text-slate-700 uppercase mb-1">
                  Phân quyền (Role): *
                </label>
                <select
                  value={editRole}
                  onChange={(e) => setEditRole(e.target.value as UserRole)}
                  className="w-full px-3.5 py-2.5 border border-indigo-300 bg-indigo-50/50 rounded-xl text-xs font-bold text-indigo-950 cursor-pointer"
                >
                  <option value="student">🎓 Học sinh (Luyện thi vào 10, làm bài kiểm tra &amp; nộp bài OCR)</option>
                  <option value="teacher">👨‍🏫 Quản trị viên &amp; Giáo viên (Toàn quyền quản lý)</option>
                </select>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] font-bold text-slate-700 uppercase mb-1">
                    Trường mục tiêu / Đơn vị:
                  </label>
                  <input
                    type="text"
                    value={editTargetSchool}
                    onChange={(e) => setEditTargetSchool(e.target.value)}
                    className="w-full px-3.5 py-2 border border-slate-300 rounded-xl text-xs"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-slate-700 uppercase mb-1">
                    Trạng thái tài khoản:
                  </label>
                  <select
                    value={editIsActive ? 'active' : 'inactive'}
                    onChange={(e) => setEditIsActive(e.target.value === 'active')}
                    className="w-full px-3.5 py-2 border border-slate-300 rounded-xl text-xs font-semibold"
                  >
                    <option value="active">Hoạt động bình thường</option>
                    <option value="inactive">Tạm khóa tài khoản</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-[11px] font-bold text-slate-700 uppercase mb-1">
                  Ghi chú:
                </label>
                <input
                  type="text"
                  value={editNotes}
                  onChange={(e) => setEditNotes(e.target.value)}
                  className="w-full px-3.5 py-2 border border-slate-300 rounded-xl text-xs"
                />
              </div>

              <div className="pt-3 border-t border-slate-100 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsEditModalOpen(false)}
                  className="px-4 py-2 rounded-xl text-xs font-bold text-slate-600 hover:bg-slate-100 cursor-pointer"
                >
                  Hủy
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs shadow-md flex items-center gap-2 cursor-pointer disabled:opacity-50"
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" /> Đang lưu...
                    </>
                  ) : (
                    <>
                      <CheckCircle2 className="w-4 h-4" /> Lưu Thay Đổi
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* 7. MODAL: CONFIRM DELETE */}
      {userToDelete && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-200">
          <div className="bg-white rounded-3xl shadow-2xl max-w-sm w-full border border-slate-100 p-6 text-center space-y-4">
            <div className="w-14 h-14 rounded-2xl bg-rose-100 text-rose-600 flex items-center justify-center mx-auto">
              <Trash2 className="w-7 h-7" />
            </div>

            <div>
              <h3 className="font-extrabold text-base text-slate-900">Xóa Tài Khoản Này?</h3>
              <p className="text-xs text-slate-500 mt-1 leading-relaxed">
                Bạn có chắc chắn muốn xóa tài khoản <strong>{userToDelete.name}</strong> (@{userToDelete.username}) khỏi hệ thống? Dữ liệu người dùng này trên Firestore sẽ bị xóa.
              </p>
            </div>

            <div className="pt-2 flex items-center justify-center gap-2">
              <button
                type="button"
                onClick={() => setUserToDelete(null)}
                className="px-4 py-2.5 rounded-xl text-xs font-bold text-slate-600 hover:bg-slate-100 cursor-pointer"
              >
                Hủy bỏ
              </button>
              <button
                type="button"
                onClick={handleConfirmDelete}
                disabled={isSubmitting}
                className="px-5 py-2.5 rounded-xl bg-rose-600 hover:bg-rose-700 text-white font-bold text-xs shadow-md flex items-center gap-2 cursor-pointer disabled:opacity-50"
              >
                {isSubmitting ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Xác Nhận Xóa'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
