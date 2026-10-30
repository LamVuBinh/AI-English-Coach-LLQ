import React, { createContext, useContext, useState, useEffect } from 'react';
import {
  Exam,
  StudentProfile,
  PersonalizedRoadmap,
  SubmissionResult,
  UserRole,
  ClassStudentStat,
  AppUserAccount,
} from '../types';
import { SAMPLE_EXAMS } from '../data/sampleExams';
import { INITIAL_STUDENT_PROFILE, INITIAL_ROADMAP } from '../data/mockClassData';
import { extractPassagesAndCleanQuestions } from '../utils/questionCleaner';
import { normalizeExam, normalizeExamList } from '../utils/examUtils';
import {
  auth,
  loginWithGoogle,
  loginWithUsernameOrEmail,
  loginWithEmail,
  logoutFirebaseUser,
  testFirestoreConnection,
  seedInitialFirestoreData,
  subscribeExamsFromFirestore,
  saveExamToFirestore,
  deleteExamFromFirestore,
  subscribeSubmissionsFromFirestore,
  saveSubmissionToFirestore,
  subscribeMistakesFromFirestore,
  saveMistakeToFirestore,
  deleteMistakeFromFirestore,
  subscribeClassStudentsFromFirestore,
  saveClassStudentToFirestore,
  fetchUserProfileFromFirestore,
  saveUserProfileToFirestore,
  fetchRoadmapFromFirestore,
  saveRoadmapToFirestore,
  ensureUserProfileOnLogin,
  subscribeAllUsersFromFirestore,
  createAccountByAdmin,
  updateAccountByAdmin,
  deleteAccountByAdmin,
  registerWithEmailAndProvision,
  subscribeSystemSettingsFromFirestore,
  saveSystemSettingsToFirestore,
} from '../services/firebase';
import { onAuthStateChanged, User as FirebaseUser } from 'firebase/auth';

export type StudentTab =
  | 'home_roadmap'
  | 'take_exam'
  | 'ocr_submission'
  | 'exam_feedback'
  | 'mistake_and_history'
  | 'grammar_guide'
  | 'mistake_notebook'
  | 'study_history';
export type TeacherTab =
  | 'overview_dashboard'
  | 'exam_management'
  | 'class_analytics'
  | 'user_management';

export { INITIAL_STUDENT_PROFILE, INITIAL_ROADMAP };

interface AppContextType {
  role: UserRole;
  setRole: (role: UserRole) => void;
  studentTab: StudentTab;
  setStudentTab: (tab: StudentTab) => void;
  teacherTab: TeacherTab;
  setTeacherTab: (tab: TeacherTab) => void;

  // Firebase Auth State & Methods
  authUser: FirebaseUser | null;
  currentAccount: AppUserAccount | null;
  isAuthReady: boolean;
  isFirestoreConnected: boolean;
  loginWithGoogleAuth: () => Promise<void>;
  loginWithIdentifierAuth: (identifier: string, pass: string) => Promise<void>;
  registerWithEmailAuth: (data: {
    email: string;
    pass: string;
    name: string;
    username: string;
    role?: UserRole;
  }) => Promise<void>;
  logout: () => Promise<void>;
  authModalOpen: boolean;
  setAuthModalOpen: (open: boolean) => void;

  // Admin User Management
  userAccounts: AppUserAccount[];
  addUserAccount: (data: {
    username: string;
    email: string;
    password?: string;
    name: string;
    role: UserRole;
    targetSchool?: string;
    notes?: string;
  }) => Promise<void>;
  editUserAccount: (id: string, data: Partial<AppUserAccount>) => Promise<void>;
  removeUserAccount: (id: string) => Promise<void>;

  // Student data
  studentProfile: StudentProfile;
  updateStudentProfile: (profile: Partial<StudentProfile>) => void;
  roadmap: PersonalizedRoadmap;
  setRoadmap: React.Dispatch<React.SetStateAction<PersonalizedRoadmap>>;
  toggleWeeklyTaskCompletion: (phaseIndex: number, weekIndex: number) => void;

  // Exams & Submissions
  exams: Exam[];
  addExam: (exam: Exam) => Promise<void>;
  updateExam: (examId: string, updatedExam: Partial<Exam>) => Promise<void>;
  deleteExam: (examId: string) => Promise<void>;
  resetExamToDefault: (examId: string) => Promise<void>;
  assignExam: (examId: string, assignedClass: string, dueDate: string) => Promise<void>;
  unassignExam: (examId: string) => Promise<void>;
  currentExam: Exam | null;
  setCurrentExam: (exam: Exam | null) => void;
  diagnosticExamId: string;
  setDiagnosticExam: (examId: string) => Promise<void>;

  submissions: SubmissionResult[];
  addSubmission: (submission: SubmissionResult) => Promise<void>;
  latestSubmission: SubmissionResult | null;
  setLatestSubmission: (sub: SubmissionResult | null) => void;

  // Teacher class data
  classStudents: ClassStudentStat[];

  // Mistake Notebook
  bookmarkMistake: (item: any) => Promise<void>;
  bookmarkedMistakes: any[];
  removeBookmarkedMistake: (questionNumber: number, examId: string) => Promise<void>;

  // Toast / notification
  toastMessage: string | null;
  showToast: (msg: string) => void;

  // AI Configuration Modal & Quota handling
  aiConfigModalOpen: boolean;
  setAiConfigModalOpen: (open: boolean) => void;
  quotaExceededMessage: string | null;
  openAiConfigModal: (message?: string) => void;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [role, setRole] = useState<UserRole>('student');
  const [studentTab, setStudentTab] = useState<StudentTab>('home_roadmap');
  const [teacherTab, setTeacherTab] = useState<TeacherTab>('overview_dashboard');

  // Firebase Auth & Cloud Firestore Readiness
  const [authUser, setAuthUser] = useState<FirebaseUser | null>(null);
  const [currentAccount, setCurrentAccount] = useState<AppUserAccount | null>(null);
  const [userAccounts, setUserAccounts] = useState<AppUserAccount[]>([]);
  const [isAuthReady, setIsAuthReady] = useState(false);
  const [isFirestoreConnected, setIsFirestoreConnected] = useState(true);
  const [authModalOpen, setAuthModalOpen] = useState(true);
  const [aiConfigModalOpen, setAiConfigModalOpen] = useState(false);
  const [quotaExceededMessage, setQuotaExceededMessage] = useState<string | null>(null);

  // Listen for quota exceeded events dispatched by apiService
  useEffect(() => {
    const handleQuota = (event: any) => {
      const msg =
        event?.detail?.message ||
        'API key chung của hệ thống đã hết tín dụng. Vui lòng nhập API key cá nhân để tiếp tục sử dụng tính năng có sự hỗ trợ của AI.';
      setQuotaExceededMessage(msg);
      setAiConfigModalOpen(true);
    };
    window.addEventListener('ai:quota_exceeded', handleQuota);
    return () => window.removeEventListener('ai:quota_exceeded', handleQuota);
  }, []);

  const openAiConfigModal = (message?: string) => {
    setQuotaExceededMessage(message || null);
    setAiConfigModalOpen(true);
  };

  // Submissions state
  const [submissions, setSubmissions] = useState<SubmissionResult[]>(() => {
    const saved = localStorage.getItem('ai_coach_submissions');
    return saved ? JSON.parse(saved) : [];
  });

  const [latestSubmission, setLatestSubmission] = useState<SubmissionResult | null>(null);

  // Student Profile
  const [studentProfile, setStudentProfile] = useState<StudentProfile>(() => {
    const saved = localStorage.getItem('ai_coach_student_profile');
    const subs = submissions;
    const testsDone = subs.length;
    let avgScore = 0;
    if (testsDone > 0) {
      const total = subs.reduce((acc, sub) => acc + sub.score, 0);
      avgScore = Number((total / testsDone).toFixed(2));
    }

    const calculateInitStreak = (sList: SubmissionResult[]) => {
      if (!sList || sList.length === 0) return 0;
      const dates = Array.from(new Set(sList.map(s => s.submittedAt ? s.submittedAt.split('T')[0] : ''))).filter(Boolean);
      return Math.max(1, dates.length);
    };

    const actualStreak = calculateInitStreak(subs);

    if (saved) {
      try {
        const parsed: StudentProfile = JSON.parse(saved);
        return {
          ...parsed,
          examDate: parsed.examDate && parsed.examDate !== '2026-06-06' && parsed.examDate !== '2027-01-01' ? parsed.examDate : '2027-06-01',
          completedTestsCount: testsDone,
          currentEstimatedScore: testsDone > 0 ? avgScore : 0,
          streakDays: parsed.streakDays !== undefined && parsed.streakDays !== 14 ? parsed.streakDays : actualStreak,
          weakTopics: testsDone > 0 ? parsed.weakTopics : [],
        };
      } catch (e) {
        // fallback
      }
    }

    return {
      ...INITIAL_STUDENT_PROFILE,
      completedTestsCount: testsDone,
      currentEstimatedScore: testsDone > 0 ? avgScore : 0,
      streakDays: actualStreak,
      weakTopics: testsDone > 0 ? INITIAL_STUDENT_PROFILE.weakTopics : [],
    };
  });

  // Roadmap
  const [roadmap, setRoadmap] = useState<PersonalizedRoadmap>(() => {
    const saved = localStorage.getItem('ai_coach_roadmap');
    return saved ? JSON.parse(saved) : INITIAL_ROADMAP;
  });

  // Exams state
  const [exams, setExams] = useState<Exam[]>(() => {
    const saved = localStorage.getItem('ai_coach_exams');
    const list = saved ? JSON.parse(saved) : SAMPLE_EXAMS;
    return normalizeExamList(list);
  });
  const [currentExam, setCurrentExamState] = useState<Exam | null>(null);
  const setCurrentExam = (action: Exam | null | ((prev: Exam | null) => Exam | null)) => {
    setCurrentExamState((prev) => {
      const next = typeof action === 'function' ? action(prev) : action;
      return next ? normalizeExam(next) : null;
    });
  };
  const [diagnosticExamId, setDiagnosticExamId] = useState<string>(() => {
    return localStorage.getItem('ai_coach_diagnostic_exam_id') || 'exam-diagnostic-1';
  });

  // Synchronize studentProfile score, completedTestsCount, and streakDays with actual submissions
  useEffect(() => {
    const testsDone = submissions.length;
    let avgScore = 0;
    if (testsDone > 0) {
      const total = submissions.reduce((acc, sub) => acc + sub.score, 0);
      avgScore = Number((total / testsDone).toFixed(2));
    }

    const calculateActualStreak = (sList: SubmissionResult[]) => {
      if (!sList || sList.length === 0) return 0;
      const dates = Array.from(new Set(sList.map(s => s.submittedAt ? s.submittedAt.split('T')[0] : ''))).filter(Boolean);
      if (dates.length === 0) return 0;
      dates.sort((a, b) => new Date(b).getTime() - new Date(a).getTime());
      
      const todayStr = new Date().toISOString().split('T')[0];
      const yesterdayStr = new Date(Date.now() - 86400000).toISOString().split('T')[0];
      
      if (dates[0] !== todayStr && dates[0] !== yesterdayStr) {
        return 1;
      }
      
      let streak = 0;
      let expectedDate = new Date(dates[0]);
      
      for (let i = 0; i < dates.length; i++) {
        const dStr = expectedDate.toISOString().split('T')[0];
        if (dates.includes(dStr)) {
          streak++;
          expectedDate.setDate(expectedDate.getDate() - 1);
        } else {
          break;
        }
      }
      return Math.max(1, streak);
    };

    const actualStreak = calculateActualStreak(submissions);

    setStudentProfile((prev) => {
      return {
        ...prev,
        completedTestsCount: testsDone,
        currentEstimatedScore: testsDone > 0 ? avgScore : 0,
        streakDays: actualStreak,
        weakTopics: testsDone > 0 ? prev.weakTopics : [],
      };
    });
  }, [submissions]);

  // Class students roster (Only contains real student accounts, zero mock data)
  const [classStudents, setClassStudents] = useState<ClassStudentStat[]>([]);

  // Mistake notebook
  const [bookmarkedMistakes, setBookmarkedMistakes] = useState<any[]>(() => {
    const saved = localStorage.getItem('ai_coach_bookmarked_mistakes');
    return saved ? JSON.parse(saved) : [];
  });

  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => {
      setToastMessage(null);
    }, 4000);
  };

  // 1. Initialize Firebase Auth Listener & Auto-Provision Admin
  useEffect(() => {
    testFirestoreConnection().then((connected) => {
      setIsFirestoreConnected(connected);
      if (connected) {
        seedInitialFirestoreData();
      }
    });

    const unsubscribeAuth = onAuthStateChanged(auth, async (user) => {
      setAuthUser(user);
      setIsAuthReady(true);

      if (user) {
        try {
          // Check if user exists in Database or auto-provision as ADMIN & TEACHER
          const profile = await ensureUserProfileOnLogin(user);
          setCurrentAccount(profile);

          const determinedRole: UserRole = profile.role === 'student' ? 'student' : 'teacher';
          setRole(determinedRole);

          setStudentProfile((prev) => ({
            ...prev,
            id: user.uid,
            name: profile.name || user.displayName || prev.name,
            avatar: profile.avatar || prev.avatar,
            targetSchool: profile.targetSchool || prev.targetSchool,
            targetScore: profile.targetScore || prev.targetScore,
            currentEstimatedScore: profile.currentEstimatedScore || prev.currentEstimatedScore,
          }));

          const cloudRoadmap = await fetchRoadmapFromFirestore(user.uid);
          if (cloudRoadmap) {
            setRoadmap(cloudRoadmap);
          }
        } catch (err) {
          console.warn('Error syncing cloud user profile:', err);
        }
      } else {
        setCurrentAccount(null);
        setAuthModalOpen(true);
      }
    });

    return () => unsubscribeAuth();
  }, []);

  // 2. Realtime Subscriptions to Firestore Collections
  useEffect(() => {
    // Subscribe to System Settings (Diagnostic Exam configuration)
    const unsubscribeSettings = subscribeSystemSettingsFromFirestore((settings) => {
      if (settings && settings.diagnosticExamId) {
        setDiagnosticExamId(settings.diagnosticExamId);
        localStorage.setItem('ai_coach_diagnostic_exam_id', settings.diagnosticExamId);
      }
    });

    // Subscribe to Exams
    const unsubscribeExams = subscribeExamsFromFirestore((cloudExams) => {
      if (cloudExams && cloudExams.length > 0) {
        const filtered = cloudExams.filter(
          (e) =>
            e.id !== 'exam-grammar-special-focus' &&
            !e.title?.includes('10 Điểm Ngữ Pháp Thường Bẫy') &&
            !e.description?.includes('phỏng vấn 4 giáo viên')
        );
        const activeDiagId = localStorage.getItem('ai_coach_diagnostic_exam_id') || diagnosticExamId;
        const mapped = filtered.map((e) =>
          normalizeExam({
            ...e,
            isDiagnostic: e.id === activeDiagId,
          })
        );
        setExams(mapped);
      }
    });

    // Subscribe to Submissions
    const studentId = authUser ? authUser.uid : studentProfile.id;
    const unsubscribeSubs = subscribeSubmissionsFromFirestore(studentId, role, (cloudSubs) => {
      if (cloudSubs) {
        setSubmissions(cloudSubs);
      }
    });

    // Subscribe to Mistakes Notebook
    const unsubscribeMistakes = subscribeMistakesFromFirestore(studentId, (cloudMistakes) => {
      if (cloudMistakes) {
        setBookmarkedMistakes(cloudMistakes);
      }
    });

    // Subscribe to Class Students (Filter out any legacy mock dummy data)
    const unsubscribeClass = subscribeClassStudentsFromFirestore((cloudClass) => {
      if (cloudClass && cloudClass.length > 0) {
        const cleanList = cloudClass.filter(
          (s) => !s.id.startsWith('stu-') && !s.id.startsWith('mock-')
        );
        if (cleanList.length > 0) {
          setClassStudents(cleanList);
        }
      }
    });

    // Subscribe to All Users for Admin / Teacher
    let unsubscribeUsers: (() => void) | undefined;
    if (role === 'teacher' || currentAccount?.role === 'teacher') {
      unsubscribeUsers = subscribeAllUsersFromFirestore((users) => {
        setUserAccounts(users);
        // Automatically reflect real student accounts in classStudents
        const realStudents = users.filter((u) => u.role === 'student');
        const mappedList: ClassStudentStat[] = realStudents.map((u) => {
          const stuSubs = submissions.filter(
            (s) => s.studentId === u.id || s.studentName.toLowerCase() === u.name.toLowerCase()
          );

          let avgScore = 0;
          let latestScore = 0;
          let testsDone = stuSubs.length;
          let weakestTopic = 'Chưa làm đề thi';

          if (stuSubs.length > 0) {
            latestScore = stuSubs[0].score;
            const totalSubScores = stuSubs.reduce((acc, sub) => acc + sub.score, 0);
            avgScore = Number((totalSubScores / stuSubs.length).toFixed(2));
            if (stuSubs[0].weakGrammarTopics && stuSubs[0].weakGrammarTopics.length > 0) {
              weakestTopic = stuSubs[0].weakGrammarTopics[0].topicName;
            }
          }

          const status: 'critical' | 'moderate' | 'excellent' =
            testsDone === 0
              ? 'moderate'
              : avgScore >= 8.5
              ? 'excellent'
              : avgScore < 6.0
              ? 'critical'
              : 'moderate';

          return {
            id: u.id,
            name: u.name || u.username,
            avatar:
              u.avatar ||
              'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150&auto=format&fit=crop&q=80',
            avgScore: testsDone > 0 ? avgScore : 0,
            latestScore: testsDone > 0 ? latestScore : 0,
            testsDone,
            targetSchool: u.targetSchool || 'THPT Công Lập TP.HCM',
            status,
            weakestTopic,
          };
        });
        setClassStudents(mappedList);
      });
    }

    return () => {
      unsubscribeSettings();
      unsubscribeExams();
      unsubscribeSubs();
      unsubscribeMistakes();
      unsubscribeClass();
      if (unsubscribeUsers) unsubscribeUsers();
    };
  }, [authUser?.uid, role, currentAccount?.role, studentProfile.id]);

  // Sync to LocalStorage as offline fallback
  useEffect(() => {
    localStorage.setItem('ai_coach_student_profile', JSON.stringify(studentProfile));
  }, [studentProfile]);

  useEffect(() => {
    localStorage.setItem('ai_coach_roadmap', JSON.stringify(roadmap));
  }, [roadmap]);

  useEffect(() => {
    localStorage.setItem('ai_coach_exams', JSON.stringify(exams));
  }, [exams]);

  useEffect(() => {
    localStorage.setItem('ai_coach_submissions', JSON.stringify(submissions));
  }, [submissions]);

  useEffect(() => {
    localStorage.setItem('ai_coach_bookmarked_mistakes', JSON.stringify(bookmarkedMistakes));
  }, [bookmarkedMistakes]);

  // Enforce role consistency whenever currentAccount or authUser updates
  useEffect(() => {
    if (authUser?.email?.toLowerCase() === 'vubinh14022013@gmail.com' || currentAccount?.role === 'teacher' || currentAccount?.email?.toLowerCase() === 'vubinh14022013@gmail.com') {
      if (role !== 'teacher') setRole('teacher');
    } else if (currentAccount?.role === 'student' && role !== 'student') {
      setRole('student');
    }
  }, [currentAccount?.role, currentAccount?.email, authUser?.email]);

  // Protected Role Setter: Strict 2-way RBAC role isolation!
  const setRoleProtected = (newRole: UserRole) => {
    if (currentAccount && currentAccount.role === 'teacher' && newRole === 'student') {
      showToast('Tài khoản Quản trị viên & Giáo viên chỉ được sử dụng giao diện quản trị, không được phép chuyển sang giao diện học sinh.');
      return;
    }
    if (currentAccount && currentAccount.role === 'student' && newRole === 'teacher') {
      showToast('Tài khoản của bạn là Học sinh, không có quyền truy cập trang Quản trị viên/Giáo viên.');
      return;
    }
    setRole(newRole);
  };

  // Authentication Handlers
  const loginWithGoogleAuth = async () => {
    const user = await loginWithGoogle();
    setAuthUser(user);
    const profile = await ensureUserProfileOnLogin(user);
    setCurrentAccount(profile);
    const determinedRole: UserRole = profile.role === 'student' ? 'student' : 'teacher';
    setRole(determinedRole);
    showToast(`Xin chào ${profile.name}! Phân quyền: ${determinedRole === 'teacher' ? 'Quản Trị Viên & Giáo Viên' : 'Học Sinh'}`);
  };

  const loginWithIdentifierAuth = async (identifier: string, pass: string) => {
    const user = await loginWithUsernameOrEmail(identifier, pass);
    setAuthUser(user);
    const profile = await ensureUserProfileOnLogin(user);
    setCurrentAccount(profile);
    const determinedRole: UserRole = profile.role === 'student' ? 'student' : 'teacher';
    setRole(determinedRole);
    showToast(`Đăng nhập thành công! Xin chào ${profile.name} (${determinedRole === 'teacher' ? 'Quản Trị Viên & Giáo Viên' : 'Học Sinh'})`);
  };

  const registerWithEmailAuth = async (data: {
    email: string;
    pass: string;
    name: string;
    username: string;
    role?: UserRole;
  }) => {
    const { user, profile } = await registerWithEmailAndProvision(data);
    setAuthUser(user);
    setCurrentAccount(profile);
    const determinedRole: UserRole = profile.role === 'student' ? 'student' : 'teacher';
    setRole(determinedRole);
    showToast(`Đăng ký thành công! Xin chào ${profile.name} (${determinedRole === 'teacher' ? 'Quản Trị Viên & Giáo Viên' : 'Học Sinh'})`);
  };

  const logout = async () => {
    await logoutFirebaseUser();
    setAuthUser(null);
    setCurrentAccount(null);
    setRole('student');
    setAuthModalOpen(true);
    showToast('Đã đăng xuất tài khoản an toàn.');
  };

  // Admin Account Management Handlers
  const addUserAccount = async (data: {
    username: string;
    email: string;
    password?: string;
    name: string;
    role: UserRole;
    targetSchool?: string;
    notes?: string;
  }) => {
    const newAcc = await createAccountByAdmin(data);
    showToast(`Đã thêm tài khoản "${newAcc.username}" (${newAcc.role === 'teacher' ? 'Quản trị viên & Giáo viên' : 'Học sinh'}) thành công!`);
  };

  const editUserAccount = async (id: string, data: Partial<AppUserAccount>) => {
    await updateAccountByAdmin(id, data);
    showToast('Đã cập nhật thông tin tài khoản thành công!');
  };

  const removeUserAccount = async (id: string) => {
    if (authUser && authUser.uid === id) {
      showToast('Không thể xóa tài khoản Quản trị viên đang trực tiếp đăng nhập!');
      return;
    }
    await deleteAccountByAdmin(id);
    showToast('Đã xóa tài khoản khỏi hệ thống.');
  };

  const updateStudentProfile = (updated: Partial<StudentProfile>) => {
    setStudentProfile((prev) => {
      const merged = { ...prev, ...updated };
      const uid = authUser?.uid || merged.id;
      saveUserProfileToFirestore({ ...merged, id: uid, role }).catch(console.warn);
      return merged;
    });
  };

  const addExam = async (exam: Exam) => {
    const cleanedQuestions = extractPassagesAndCleanQuestions(exam.questions || []);
    const sanitizedExam = normalizeExam({ ...exam, questions: cleanedQuestions });
    setExams((prev) => [sanitizedExam, ...prev]);

    // Persist to Firestore
    try {
      await saveExamToFirestore(sanitizedExam);
      showToast(`Đã lưu đề thi "${exam.title}" lên Firebase Firestore!`);
    } catch (err) {
      console.warn('Saved locally, firestore sync note:', err);
      showToast(`Đã thêm đề thi: "${exam.title}" thành công!`);
    }
  };

  const updateExam = async (examId: string, updatedExam: Partial<Exam>) => {
    let sanitizedUpdate = { ...updatedExam };
    if (updatedExam.questions) {
      sanitizedUpdate.questions = extractPassagesAndCleanQuestions(updatedExam.questions);
    }
    setExams((prev) => {
      const updatedList = prev.map((e) => {
        if (e.id === examId) {
          return normalizeExam({ ...e, ...sanitizedUpdate });
        }
        return e;
      });
      const targetExam = updatedList.find((e) => e.id === examId);
      if (targetExam) {
        saveExamToFirestore(targetExam).catch(console.warn);
      }
      return updatedList;
    });
    if (currentExam?.id === examId) {
      setCurrentExam((prev) => (prev ? normalizeExam({ ...prev, ...sanitizedUpdate }) : null));
    }
    showToast(`Đã cập nhật đề thi "${updatedExam.title || 'đề khảo sát'}" trên Firestore!`);
  };

  const resetExamToDefault = async (examId: string) => {
    const original = SAMPLE_EXAMS.find((s) => s.id === examId);
    if (original) {
      setExams((prev) => prev.map((e) => (e.id === examId ? { ...original } : e)));
      if (currentExam?.id === examId) {
        setCurrentExam(original);
      }
      await saveExamToFirestore(original).catch(console.warn);
      showToast('Đã khôi phục đề khảo sát gốc theo chuẩn Sở GD&ĐT TP.HCM.');
    }
  };

  const deleteExam = async (examId: string) => {
    setExams((prev) => {
      const remaining = prev.filter((e) => e.id !== examId);
      if (diagnosticExamId === examId && remaining.length > 0) {
        setDiagnosticExamId(remaining[0].id);
        localStorage.setItem('ai_coach_diagnostic_exam_id', remaining[0].id);
      }
      return remaining;
    });
    await deleteExamFromFirestore(examId).catch(console.warn);
    showToast('Đã xóa đề thi khỏi Firestore.');
  };

  const setDiagnosticExam = async (examId: string) => {
    const target = exams.find((e) => e.id === examId) || SAMPLE_EXAMS.find((e) => e.id === examId);
    if (!target) {
      showToast('Không tìm thấy đề thi đã chọn.');
      return;
    }

    setDiagnosticExamId(examId);
    localStorage.setItem('ai_coach_diagnostic_exam_id', examId);

    // Update state so only the selected exam has isDiagnostic = true
    setExams((prev) =>
      prev.map((e) => ({
        ...e,
        isDiagnostic: e.id === examId,
      }))
    );

    // Save to Firestore system settings so all students & teachers sync in real-time
    saveSystemSettingsToFirestore({ diagnosticExamId: examId }).catch(console.warn);

    // Persist isDiagnostic flags on exam documents in Firestore
    try {
      for (const e of exams) {
        const isTarget = e.id === examId;
        if (e.isDiagnostic !== isTarget || isTarget) {
          await saveExamToFirestore({ ...e, isDiagnostic: isTarget }).catch(console.warn);
        }
      }
    } catch (err) {
      console.warn('Firestore sync note for diagnostic exam:', err);
    }

    showToast(`Đã chọn đề "${target.title}" làm Đề khảo sát đánh giá năng lực học sinh!`);
  };

  const assignExam = async (examId: string, assignedClass: string, dueDate: string) => {
    setExams((prev) => {
      const updatedList = prev.map((e) =>
        e.id === examId ? { ...e, isAssigned: true, assignedClass, dueDate } : e
      );
      const target = updatedList.find((e) => e.id === examId);
      if (target) {
        saveExamToFirestore(target).catch(console.warn);
      }
      return updatedList;
    });
    showToast(`Đã giao đề thi cho ${assignedClass} với hạn nộp ${dueDate}`);
  };

  const unassignExam = async (examId: string) => {
    setExams((prev) => {
      const updatedList = prev.map((e) =>
        e.id === examId
          ? { ...e, isAssigned: false, assignedClass: undefined, dueDate: undefined }
          : e
      );
      const target = updatedList.find((e) => e.id === examId);
      if (target) {
        saveExamToFirestore(target).catch(console.warn);
      }
      return updatedList;
    });
    showToast('Đã thu hồi / hủy giao đề thi.');
  };

  const addSubmission = async (submission: SubmissionResult) => {
    const studentId = authUser ? authUser.uid : studentProfile.id;
    const finalSubmission: SubmissionResult = {
      ...submission,
      studentId,
      studentName: authUser?.displayName || studentProfile.name,
    };

    setSubmissions((prev) => [finalSubmission, ...prev]);
    setLatestSubmission(finalSubmission);

    // Save to Firestore
    try {
      await saveSubmissionToFirestore(finalSubmission);
    } catch (err) {
      console.warn('Firestore submission save note:', err);
    }

    // Update student estimated score & completed tests
    const updatedCount = studentProfile.completedTestsCount + 1;
    const updatedScore = Number(((studentProfile.currentEstimatedScore + finalSubmission.score) / 2).toFixed(2));
    updateStudentProfile({
      completedTestsCount: updatedCount,
      currentEstimatedScore: updatedScore,
    });

    // Automatically accumulate mistakes into bookmarked mistakes
    const newMistakes = finalSubmission.itemAnalysis
      .filter((item) => !item.isCorrect)
      .map((item) => ({
        ...item,
        studentId,
        examId: finalSubmission.examId,
        examTitle: finalSubmission.examTitle,
        date: finalSubmission.submittedAt,
        id: `mistake-${studentId}-${finalSubmission.examId}-${item.questionNumber}`,
      }));

    if (newMistakes.length > 0) {
      for (const m of newMistakes) {
        saveMistakeToFirestore(m).catch(console.warn);
      }
      setBookmarkedMistakes((prev) => {
        const existingIds = new Set(prev.map((p) => `${p.examId}-${p.questionNumber}`));
        const filtered = newMistakes.filter((m) => !existingIds.has(`${m.examId}-${m.questionNumber}`));
        return [...filtered, ...prev];
      });
    }
  };

  const bookmarkMistake = async (item: any) => {
    const studentId = authUser ? authUser.uid : studentProfile.id;
    const mistakeItem = {
      ...item,
      studentId,
      id: item.id || `mistake-${studentId}-${item.examId}-${item.questionNumber}`,
    };

    setBookmarkedMistakes((prev) => {
      const exists = prev.some(
        (p) => p.questionNumber === item.questionNumber && p.examId === item.examId
      );
      if (exists) return prev;
      return [mistakeItem, ...prev];
    });

    await saveMistakeToFirestore(mistakeItem).catch(console.warn);
    showToast('Đã lưu câu hỏi vào Sổ tay lỗi sai trên Firestore!');
  };

  const removeBookmarkedMistake = async (questionNumber: number, examId: string) => {
    const target = bookmarkedMistakes.find(
      (p) => p.questionNumber === questionNumber && p.examId === examId
    );
    setBookmarkedMistakes((prev) =>
      prev.filter((p) => !(p.questionNumber === questionNumber && p.examId === examId))
    );
    if (target?.id) {
      await deleteMistakeFromFirestore(target.id).catch(console.warn);
    }
    showToast('Đã xóa khỏi sổ tay lỗi sai.');
  };

  const toggleWeeklyTaskCompletion = (phaseIndex: number, weekIndex: number) => {
    setRoadmap((prev) => {
      const updatedPhases = [...prev.phases];
      const targetPhase = { ...updatedPhases[phaseIndex] };
      const updatedPlan = [...targetPhase.weeklyPlan];
      const targetWeek = { ...updatedPlan[weekIndex] };
      targetWeek.isCompleted = !targetWeek.isCompleted;
      updatedPlan[weekIndex] = targetWeek;
      targetPhase.weeklyPlan = updatedPlan;
      updatedPhases[phaseIndex] = targetPhase;
      const updatedRoadmap = { ...prev, phases: updatedPhases };

      const studentId = authUser ? authUser.uid : studentProfile.id;
      saveRoadmapToFirestore(studentId, updatedRoadmap).catch(console.warn);

      return updatedRoadmap;
    });
  };

  return (
    <AppContext.Provider
      value={{
        role,
        setRole: setRoleProtected,
        studentTab,
        setStudentTab,
        teacherTab,
        setTeacherTab,
        authUser,
        currentAccount,
        isAuthReady,
        isFirestoreConnected,
        loginWithGoogleAuth,
        loginWithIdentifierAuth,
        registerWithEmailAuth,
        logout,
        authModalOpen,
        setAuthModalOpen,
        userAccounts,
        addUserAccount,
        editUserAccount,
        removeUserAccount,
        studentProfile,
        updateStudentProfile,
        roadmap,
        setRoadmap,
        toggleWeeklyTaskCompletion,
        exams,
        addExam,
        updateExam,
        deleteExam,
        resetExamToDefault,
        assignExam,
        unassignExam,
        currentExam,
        setCurrentExam,
        diagnosticExamId,
        setDiagnosticExam,
        submissions,
        addSubmission,
        latestSubmission,
        setLatestSubmission,
        classStudents,
        bookmarkMistake,
        bookmarkedMistakes,
        removeBookmarkedMistake,
        toastMessage,
        showToast,
        aiConfigModalOpen,
        setAiConfigModalOpen,
        quotaExceededMessage,
        openAiConfigModal,
      }}
    >
      {children}
    </AppContext.Provider>
  );
};

export const useApp = () => {
  const context = useContext(AppContext);
  if (!context) throw new Error('useApp must be used within an AppProvider');
  return context;
};
