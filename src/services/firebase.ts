import { initializeApp, getApps, getApp } from 'firebase/app';
import {
  getAuth,
  signInWithPopup,
  GoogleAuthProvider,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
  User as FirebaseUser,
  updateProfile,
} from 'firebase/auth';
import {
  getFirestore,
  collection,
  doc,
  getDoc,
  getDocs,
  setDoc as firebaseSetDoc,
  updateDoc as firebaseUpdateDoc,
  deleteDoc,
  query,
  where,
  onSnapshot,
  getDocFromServer,
} from 'firebase/firestore';

// Helper to recursively remove all `undefined` fields from an object to prevent Firestore errors
export function cleanUndefined(obj: any): any {
  if (obj === null || obj === undefined) {
    return null;
  }
  if (obj instanceof Date) {
    return obj;
  }
  if (Array.isArray(obj)) {
    return obj.map(item => cleanUndefined(item));
  }
  if (typeof obj === 'object') {
    const newObj: any = {};
    for (const key of Object.keys(obj)) {
      const val = obj[key];
      if (val !== undefined) {
        newObj[key] = cleanUndefined(val);
      }
    }
    return newObj;
  }
  return obj;
}

// Wrapper for setDoc to clean undefined values recursively
export async function setDoc(reference: any, data: any, options?: any): Promise<void> {
  const cleanedData = cleanUndefined(data);
  if (options) {
    await firebaseSetDoc(reference, cleanedData, options);
  } else {
    await firebaseSetDoc(reference, cleanedData);
  }
}

// Wrapper for updateDoc to clean undefined values recursively
export async function updateDoc(reference: any, data: any): Promise<void> {
  const cleanedData = cleanUndefined(data);
  await firebaseUpdateDoc(reference, cleanedData);
}
import {
  Exam,
  StudentProfile,
  PersonalizedRoadmap,
  SubmissionResult,
  ClassStudentStat,
  UserRole,
  AppUserAccount,
} from '../types';
import { SAMPLE_EXAMS } from '../data/sampleExams';
import { INITIAL_STUDENT_PROFILE, INITIAL_ROADMAP } from '../context/AppContext';
import { MOCK_CLASS_STUDENTS } from '../data/mockClassData';

// 1. Firebase Configuration from User Project
export const firebaseConfig = {
  apiKey: "AIzaSyBVq3hC7KM7NouLF-AFKrGAaUmyH1NO2Qw",
  authDomain: "aienglishcoach-e6e62.firebaseapp.com",
  projectId: "aienglishcoach-e6e62",
  storageBucket: "aienglishcoach-e6e62.firebasestorage.app",
  messagingSenderId: "570457906881",
  appId: "1:570457906881:web:a6070c2aca18e2ca36be40",
  measurementId: "G-5TZ216Y0Z7",
};

// Initialize Firebase App instance
export const app = getApps().length > 0 ? getApp() : initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);

// 2. Structured Firestore Error Handler
export enum OperationType {
  CREATE = 'create',
  UPDATE = 'update',
  DELETE = 'delete',
  LIST = 'list',
  GET = 'get',
  WRITE = 'write',
}

export interface FirestoreErrorInfo {
  error: string;
  operationType: OperationType;
  path: string | null;
  authInfo: {
    userId?: string | null;
    email?: string | null;
    emailVerified?: boolean | null;
    isAnonymous?: boolean | null;
    providerInfo?: {
      providerId?: string | null;
      email?: string | null;
    }[];
  };
}

export function handleFirestoreError(error: unknown, operationType: OperationType, path: string | null) {
  const errInfo: FirestoreErrorInfo = {
    error: error instanceof Error ? error.message : String(error),
    authInfo: {
      userId: auth.currentUser?.uid,
      email: auth.currentUser?.email,
      emailVerified: auth.currentUser?.emailVerified,
      isAnonymous: auth.currentUser?.isAnonymous,
      providerInfo:
        auth.currentUser?.providerData?.map((provider) => ({
          providerId: provider.providerId,
          email: provider.email,
        })) || [],
    },
    operationType,
    path,
  };
  console.error('Firestore Error: ', JSON.stringify(errInfo));
  return errInfo;
}

// 3. Test Connection
export async function testFirestoreConnection(): Promise<boolean> {
  try {
    await getDocFromServer(doc(db, 'system_health', 'ping'));
    return true;
  } catch (error) {
    if (error instanceof Error && error.message.includes('the client is offline')) {
      console.warn('Firebase client is offline or initializing.');
      return false;
    }
    // Connected even if document does not exist
    return true;
  }
}

// 4. Authentication Methods
const googleProvider = new GoogleAuthProvider();
googleProvider.setCustomParameters({ prompt: 'select_account' });

export async function loginWithGoogle(): Promise<FirebaseUser> {
  const result = await signInWithPopup(auth, googleProvider);
  return result.user;
}

/**
 * Flexible Login: Supports either Username OR Email.
 * If identifier does NOT contain '@', queries Firestore `users` collection to locate
 * the associated email before invoking Firebase Authentication.
 */
export async function loginWithUsernameOrEmail(identifier: string, pass: string): Promise<FirebaseUser> {
  const cleanInput = identifier.trim();
  if (!cleanInput) {
    throw new Error('Vui lòng nhập Tên đăng nhập hoặc Email.');
  }

  let emailToUse = cleanInput;

  // If input is a Username (no '@')
  if (!cleanInput.includes('@')) {
    try {
      const usersRef = collection(db, 'users');
      // Query case-insensitive and standard match
      const qLower = query(usersRef, where('username', '==', cleanInput.toLowerCase()));
      const snapLower = await getDocs(qLower);

      if (!snapLower.empty) {
        const found = snapLower.docs[0].data();
        if (found.email) {
          emailToUse = found.email;
        } else {
          throw new Error('Tài khoản này chưa có email xác thực trong hệ thống.');
        }
      } else {
        // Fallback: check exact username match
        const qExact = query(usersRef, where('username', '==', cleanInput));
        const snapExact = await getDocs(qExact);
        if (!snapExact.empty) {
          const found = snapExact.docs[0].data();
          if (found.email) {
            emailToUse = found.email;
          } else {
            throw new Error('Tài khoản này chưa có email xác thực trong hệ thống.');
          }
        } else {
          throw new Error('Tên đăng nhập không tồn tại trong hệ thống. Vui lòng kiểm tra lại hoặc nhập Email.');
        }
      }
    } catch (err: any) {
      if (err.message && err.message.includes('Tên đăng nhập')) {
        throw err;
      }
      console.warn('Username query error:', err);
      throw new Error(err.message || 'Không thể tìm thấy tài khoản với tên đăng nhập này.');
    }
  }

  const result = await signInWithEmailAndPassword(auth, emailToUse, pass);
  return result.user;
}

export async function loginWithEmail(email: string, pass: string): Promise<FirebaseUser> {
  const result = await signInWithEmailAndPassword(auth, email.trim(), pass);
  return result.user;
}

/**
 * Register a new user in Firebase Auth and provision document in Firestore.
 * Automatically gives Admin & Teacher role by default if role is not specified.
 */
export async function registerWithEmailAndProvision(data: {
  email: string;
  pass: string;
  name: string;
  username: string;
  role?: UserRole;
}): Promise<{ user: FirebaseUser; profile: AppUserAccount }> {
  const cleanEmail = data.email.trim();
  const cleanUsername = data.username.trim().toLowerCase().replace(/[^a-z0-9_]/g, '');

  if (!cleanEmail) {
    throw new Error('Vui lòng nhập Email hợp lệ.');
  }
  if (!data.pass || data.pass.length < 6) {
    throw new Error('Mật khẩu cần tối thiểu 6 ký tự.');
  }

  // 1. Check if username is already taken in Firestore
  if (cleanUsername) {
    const usersRef = collection(db, 'users');
    const qUsername = query(usersRef, where('username', '==', cleanUsername));
    const snapUsername = await getDocs(qUsername);
    if (!snapUsername.empty) {
      throw new Error(`Tên đăng nhập "${cleanUsername}" đã có người sử dụng. Vui lòng chọn tên khác.`);
    }
  }

  // 2. Register user in Firebase Auth
  const cred = await createUserWithEmailAndPassword(auth, cleanEmail, data.pass);
  const user = cred.user;

  if (data.name) {
    try {
      await updateProfile(user, { displayName: data.name.trim() });
    } catch (e) {
      console.warn('Update profile display name error:', e);
    }
  }

  // 3. Determine role: if role is passed use it, otherwise default to 'teacher' (Quản trị viên & Giáo viên)
  const assignedRole: UserRole = data.role || 'teacher';

  const newAccount: AppUserAccount = {
    id: user.uid,
    uid: user.uid,
    email: cleanEmail,
    username: cleanUsername || cleanEmail.split('@')[0],
    name: data.name?.trim() || (assignedRole === 'teacher' ? 'Quản Trị Viên (Giáo Viên)' : 'Học Sinh'),
    role: assignedRole,
    avatar: assignedRole === 'teacher' ? '👨‍🏫' : '👩‍🎓',
    targetSchool: assignedRole === 'student' ? 'THPT Nguyễn Thị Minh Khai' : 'THPT Chuyên Lê Hồng Phong',
    targetScore: assignedRole === 'student' ? 9.0 : 9.5,
    currentEstimatedScore: assignedRole === 'student' ? 7.5 : 8.5,
    isActive: true,
    notes: assignedRole === 'teacher' ? 'Tài khoản Quản trị viên khởi tạo từ hệ thống' : 'Tài khoản học sinh đăng ký',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };

  await setDoc(doc(db, 'users', user.uid), newAccount);
  return { user, profile: newAccount };
}

export async function logoutFirebaseUser(): Promise<void> {
  await signOut(auth);
}

// 5. User Profile in Firestore & Automatic Admin Provisioning
/**
 * Ensures user profile exists in Firestore.
 * If user exists in Auth (e.g. created manually via Firebase Console) but has NO document
 * in Database: Automatically provisions document and grants ADMIN & TEACHER role by default.
 */
export async function ensureUserProfileOnLogin(user: FirebaseUser): Promise<AppUserAccount> {
  try {
    const userDocRef = doc(db, 'users', user.uid);
    const docSnap = await getDoc(userDocRef);

    const isAdminEmail = user.email?.toLowerCase() === 'vubinh14022013@gmail.com' || user.email?.toLowerCase().includes('admin');

    if (docSnap.exists()) {
      const existingData = docSnap.data();
      const resolvedRole: UserRole = isAdminEmail ? 'teacher' : (existingData.role || 'teacher');
      const resolvedName = user.email?.toLowerCase() === 'vubinh14022013@gmail.com' ? 'Quản Trị Viên (Vũ Bình)' : (isAdminEmail ? 'Quản Trị Viên (Giáo Viên)' : (existingData.name || user.displayName || 'Người dùng'));

      const profileData: AppUserAccount = {
        id: user.uid,
        uid: user.uid,
        email: user.email || existingData.email || '',
        username: existingData.username || (user.email ? user.email.split('@')[0] : 'user'),
        name: resolvedName,
        role: resolvedRole,
        avatar: resolvedRole === 'teacher' ? '👨‍🏫' : '👩‍🎓',
        targetSchool: resolvedRole === 'student' ? (existingData.targetSchool || 'THPT Nguyễn Thị Minh Khai') : undefined,
        targetScore: resolvedRole === 'student' ? (existingData.targetScore || 9.0) : undefined,
        currentEstimatedScore: resolvedRole === 'student' ? (existingData.currentEstimatedScore || 7.5) : undefined,
        isActive: existingData.isActive !== false,
        notes: isAdminEmail ? 'Tài khoản Quản trị viên hệ thống Vũ Bình' : existingData.notes,
        createdAt: existingData.createdAt || new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };

      if (isAdminEmail) {
        profileData.role = 'teacher';
        if (user.email?.toLowerCase() === 'vubinh14022013@gmail.com') {
          profileData.name = 'Quản Trị Viên (Vũ Bình)';
        }
        await setDoc(userDocRef, profileData, { merge: true });
      } else if (existingData.role !== resolvedRole) {
        await setDoc(userDocRef, profileData, { merge: true });
      }

      return profileData;
    }

    // Check if account was created beforehand by Admin using email
    if (user.email) {
      const qEmail = query(collection(db, 'users'), where('email', '==', user.email.trim()));
      const snapEmail = await getDocs(qEmail);
      if (!snapEmail.empty) {
        const foundDoc = snapEmail.docs[0];
        const existingData = foundDoc.data();
        const resolvedRole: UserRole = isAdminEmail ? 'teacher' : (existingData.role || 'student');
        const merged: AppUserAccount = {
          id: user.uid,
          uid: user.uid,
          email: user.email,
          username: existingData.username || user.email.split('@')[0].toLowerCase(),
          name: existingData.name || user.displayName || (isAdminEmail ? 'Quản Trị Viên (Vũ Bình)' : 'Người dùng'),
          role: resolvedRole,
          avatar: resolvedRole === 'teacher' ? '👨‍🏫' : '👩‍🎓',
          targetSchool: existingData.targetSchool,
          targetScore: existingData.targetScore,
          currentEstimatedScore: existingData.currentEstimatedScore,
          isActive: existingData.isActive !== false,
          notes: existingData.notes,
          createdAt: existingData.createdAt || new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        };
        await setDoc(userDocRef, merged);
        if (foundDoc.id !== user.uid) {
          await deleteDoc(foundDoc.ref).catch(console.warn);
        }
        return merged;
      }
    }

    // USER EXISTS IN AUTH (e.g. created on Firebase Console) BUT NOT IN DATABASE:
    // AUTO-PROVISION AS ADMIN (Quản trị viên toàn quyền đồng thời là Giáo viên)
    const usernameFromEmail = user.email
      ? user.email.split('@')[0].toLowerCase().replace(/[^a-z0-9_]/g, '')
      : `admin_${user.uid.slice(0, 6)}`;
    const newAdminAccount: AppUserAccount = {
      id: user.uid,
      uid: user.uid,
      email: user.email || '',
      username: usernameFromEmail,
      name: user.displayName || (isAdminEmail ? 'Quản Trị Viên (Vũ Bình)' : 'Quản Trị Viên (Giáo Viên)'),
      role: 'teacher', // Quản trị viên đồng thời là giáo viên toàn quyền
      avatar: '👨‍🏫',
      targetSchool: 'THPT Chuyên Lê Hồng Phong',
      targetScore: 9.5,
      currentEstimatedScore: 8.5,
      isActive: true,
      notes: 'Tài khoản Quản trị viên tự động cấp quyền từ hệ thống',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    await setDoc(userDocRef, newAdminAccount);
    return newAdminAccount;
  } catch (err) {
    handleFirestoreError(err, OperationType.WRITE, `users/${user.uid}`);
    // Return safe fallback admin profile
    return {
      id: user.uid,
      uid: user.uid,
      email: user.email || '',
      username: user.email ? user.email.split('@')[0] : 'admin',
      name: user.displayName || 'Quản Trị Viên & Giáo Viên',
      role: 'teacher',
      isActive: true,
    };
  }
}

export async function fetchUserProfileFromFirestore(uid: string): Promise<any | null> {
  try {
    const docSnap = await getDoc(doc(db, 'users', uid));
    if (docSnap.exists()) {
      return docSnap.data();
    }
    return null;
  } catch (err) {
    handleFirestoreError(err, OperationType.GET, `users/${uid}`);
    return null;
  }
}

export async function saveUserProfileToFirestore(profile: Partial<StudentProfile> & { id: string; role?: string; username?: string }): Promise<void> {
  try {
    await setDoc(doc(db, 'users', profile.id), {
      ...profile,
      updatedAt: new Date().toISOString(),
    }, { merge: true });
  } catch (err) {
    handleFirestoreError(err, OperationType.WRITE, `users/${profile.id}`);
  }
}

// 5.1. Admin Account Management (CRUD on users collection)
export function subscribeAllUsersFromFirestore(onUpdate: (users: AppUserAccount[]) => void) {
  const usersCol = collection(db, 'users');
  return onSnapshot(
    usersCol,
    (snapshot) => {
      const list: AppUserAccount[] = [];
      snapshot.forEach((d) => {
        const data = d.data();
        list.push({
          id: d.id,
          uid: data.uid || d.id,
          username: data.username || (data.email ? data.email.split('@')[0] : d.id.slice(0, 8)),
          email: data.email || '',
          name: data.name || 'Người dùng',
          role: data.role || 'student',
          avatar: data.avatar,
          targetSchool: data.targetSchool,
          targetScore: data.targetScore,
          currentEstimatedScore: data.currentEstimatedScore,
          isActive: data.isActive !== false,
          notes: data.notes,
          createdAt: data.createdAt,
          updatedAt: data.updatedAt,
        });
      });
      // Sort by creation date descending
      list.sort((a, b) => (b.createdAt || '').localeCompare(a.createdAt || ''));
      onUpdate(list);
    },
    (err) => {
      handleFirestoreError(err, OperationType.LIST, 'users');
    }
  );
}

let secondaryAppInstance: any = null;
function getSecondaryAuthInstance() {
  if (!secondaryAppInstance) {
    const existing = getApps().find((a) => a.name === 'SecondaryAdminApp');
    secondaryAppInstance = existing || initializeApp(firebaseConfig, 'SecondaryAdminApp');
  }
  return getAuth(secondaryAppInstance);
}

/**
 * Admin creates account:
 * Creates user credentials in Firebase Authentication via secondary app (so admin is not signed out),
 * then stores user document with role, username, email, etc. in Firestore `users`.
 */
export async function createAccountByAdmin(accountData: {
  username: string;
  email: string;
  password?: string;
  name: string;
  role: UserRole;
  targetSchool?: string;
  notes?: string;
}): Promise<AppUserAccount> {
  const cleanUsername = accountData.username.trim().toLowerCase();
  const cleanEmail = accountData.email.trim();

  // Check unique username
  const usersRef = collection(db, 'users');
  const q = query(usersRef, where('username', '==', cleanUsername));
  const snap = await getDocs(q);
  if (!snap.empty) {
    throw new Error(`Tên đăng nhập "${cleanUsername}" đã được sử dụng. Vui lòng chọn tên đăng nhập khác.`);
  }

  let generatedUid = `user_${Date.now()}`;

  // If password provided, attempt to register in Firebase Auth via Secondary App
  if (accountData.password && accountData.password.length >= 6) {
    try {
      const secAuth = getSecondaryAuthInstance();
      const userCred = await createUserWithEmailAndPassword(secAuth, cleanEmail, accountData.password);
      generatedUid = userCred.user.uid;
      await signOut(secAuth);
    } catch (authErr: any) {
      if (authErr.code === 'auth/email-already-in-use') {
        // Find existing or reuse uid
        console.warn('Email already in Auth, saving Firestore profile.');
      } else {
        throw new Error(authErr.message || 'Lỗi khi tạo tài khoản xác thực.');
      }
    }
  }

  const newRecord: AppUserAccount = {
    id: generatedUid,
    uid: generatedUid,
    username: cleanUsername,
    email: cleanEmail,
    name: accountData.name.trim(),
    role: accountData.role,
    avatar: accountData.role === 'teacher' ? '👨‍🏫' : '👩‍🎓',
    targetSchool: accountData.targetSchool || (accountData.role === 'student' ? 'THPT Nguyễn Thị Minh Khai' : undefined),
    targetScore: accountData.role === 'student' ? 9.0 : undefined,
    currentEstimatedScore: accountData.role === 'student' ? 7.0 : undefined,
    isActive: true,
    notes: accountData.notes || '',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };

  await setDoc(doc(db, 'users', generatedUid), newRecord);
  return newRecord;
}

export async function updateAccountByAdmin(
  userId: string,
  updatedData: Partial<AppUserAccount>
): Promise<void> {
  const cleanUpdate: any = {
    ...updatedData,
    updatedAt: new Date().toISOString(),
  };

  if (updatedData.username) {
    cleanUpdate.username = updatedData.username.trim().toLowerCase();
    // Validate uniqueness if username changed
    const usersRef = collection(db, 'users');
    const q = query(usersRef, where('username', '==', cleanUpdate.username));
    const snap = await getDocs(q);
    const conflicting = snap.docs.find((d) => d.id !== userId);
    if (conflicting) {
      throw new Error(`Tên đăng nhập "${cleanUpdate.username}" đã thuộc về tài khoản khác.`);
    }
  }

  await updateDoc(doc(db, 'users', userId), cleanUpdate);
}

export async function deleteAccountByAdmin(userId: string): Promise<void> {
  await deleteDoc(doc(db, 'users', userId));
}

// 6. Roadmap in Firestore
export async function fetchRoadmapFromFirestore(studentId: string): Promise<PersonalizedRoadmap | null> {
  try {
    const docSnap = await getDoc(doc(db, 'roadmaps', studentId));
    if (docSnap.exists()) {
      return docSnap.data() as PersonalizedRoadmap;
    }
    return null;
  } catch (err) {
    handleFirestoreError(err, OperationType.GET, `roadmaps/${studentId}`);
    return null;
  }
}

export async function saveRoadmapToFirestore(studentId: string, roadmap: PersonalizedRoadmap): Promise<void> {
  try {
    await setDoc(doc(db, 'roadmaps', studentId), {
      ...roadmap,
      studentId,
      updatedAt: new Date().toISOString(),
    }, { merge: true });
  } catch (err) {
    handleFirestoreError(err, OperationType.WRITE, `roadmaps/${studentId}`);
  }
}

// 6.5 System Settings in Firestore (Diagnostic Exam, Global Configurations)
export function subscribeSystemSettingsFromFirestore(
  onUpdate: (settings: Record<string, any>) => void,
  onError?: (err: any) => void
) {
  const settingDocRef = doc(db, 'system_settings', 'app_config');
  return onSnapshot(
    settingDocRef,
    (docSnap) => {
      if (docSnap.exists()) {
        onUpdate(docSnap.data() || {});
      }
    },
    (error) => {
      handleFirestoreError(error, OperationType.GET, 'system_settings/app_config');
      if (onError) onError(error);
    }
  );
}

export async function saveSystemSettingsToFirestore(
  settings: Record<string, any>
): Promise<void> {
  try {
    const settingDocRef = doc(db, 'system_settings', 'app_config');
    await setDoc(
      settingDocRef,
      {
        ...settings,
        updatedAt: new Date().toISOString(),
      },
      { merge: true }
    );
  } catch (err) {
    handleFirestoreError(err, OperationType.WRITE, 'system_settings/app_config');
  }
}

// 7. Realtime Exams Collection
export function subscribeExamsFromFirestore(onUpdate: (exams: Exam[]) => void, onError?: (err: any) => void) {
  const examsCol = collection(db, 'exams');
  return onSnapshot(
    examsCol,
    (snapshot) => {
      const examsList: Exam[] = [];
      snapshot.forEach((docSnap) => {
        examsList.push({ id: docSnap.id, ...(docSnap.data() as Omit<Exam, 'id'>) });
      });
      // Sort by creation or assigned status
      examsList.sort((a, b) => (b.createdAt || '').localeCompare(a.createdAt || ''));
      onUpdate(examsList);
    },
    (error) => {
      handleFirestoreError(error, OperationType.LIST, 'exams');
      if (onError) onError(error);
    }
  );
}

export async function saveExamToFirestore(exam: Exam): Promise<void> {
  try {
    const examDoc = doc(db, 'exams', exam.id);
    await setDoc(examDoc, exam, { merge: true });
  } catch (err) {
    handleFirestoreError(err, OperationType.WRITE, `exams/${exam.id}`);
    throw err;
  }
}

export async function deleteExamFromFirestore(examId: string): Promise<void> {
  try {
    await deleteDoc(doc(db, 'exams', examId));
  } catch (err) {
    handleFirestoreError(err, OperationType.DELETE, `exams/${examId}`);
    throw err;
  }
}

// 8. Submissions in Firestore
export function subscribeSubmissionsFromFirestore(
  studentId: string | null,
  role: UserRole,
  onUpdate: (submissions: SubmissionResult[]) => void
) {
  const subCol = collection(db, 'submissions');
  const q =
    role === 'teacher' || !studentId
      ? subCol
      : query(subCol, where('studentId', '==', studentId));

  return onSnapshot(
    q,
    (snapshot) => {
      const list: SubmissionResult[] = [];
      snapshot.forEach((docSnap) => {
        list.push({ id: docSnap.id, ...(docSnap.data() as Omit<SubmissionResult, 'id'>) });
      });
      list.sort((a, b) => (b.submittedAt || '').localeCompare(a.submittedAt || ''));
      onUpdate(list);
    },
    (error) => {
      handleFirestoreError(error, OperationType.LIST, 'submissions');
    }
  );
}

export async function saveSubmissionToFirestore(submission: SubmissionResult): Promise<void> {
  try {
    const subDoc = doc(db, 'submissions', submission.id);
    await setDoc(subDoc, submission, { merge: true });
  } catch (err) {
    handleFirestoreError(err, OperationType.WRITE, `submissions/${submission.id}`);
    throw err;
  }
}

// 9. Mistakes Notebook in Firestore
export function subscribeMistakesFromFirestore(
  studentId: string,
  onUpdate: (mistakes: any[]) => void
) {
  const colRef = collection(db, 'mistakes');
  const q = query(colRef, where('studentId', '==', studentId));

  return onSnapshot(
    q,
    (snapshot) => {
      const list: any[] = [];
      snapshot.forEach((docSnap) => {
        list.push({ id: docSnap.id, ...docSnap.data() });
      });
      list.sort((a, b) => (b.date || '').localeCompare(a.date || ''));
      onUpdate(list);
    },
    (error) => {
      handleFirestoreError(error, OperationType.LIST, 'mistakes');
    }
  );
}

export async function saveMistakeToFirestore(mistake: any): Promise<void> {
  try {
    const mId = mistake.id || `mistake-${mistake.studentId}-${mistake.examId}-${mistake.questionNumber}`;
    await setDoc(doc(db, 'mistakes', mId), { ...mistake, id: mId }, { merge: true });
  } catch (err) {
    handleFirestoreError(err, OperationType.WRITE, 'mistakes');
    throw err;
  }
}

export async function deleteMistakeFromFirestore(mistakeId: string): Promise<void> {
  try {
    await deleteDoc(doc(db, 'mistakes', mistakeId));
  } catch (err) {
    handleFirestoreError(err, OperationType.DELETE, `mistakes/${mistakeId}`);
    throw err;
  }
}

// 10. Class Students in Firestore
export function subscribeClassStudentsFromFirestore(onUpdate: (students: ClassStudentStat[]) => void) {
  const colRef = collection(db, 'class_students');
  return onSnapshot(
    colRef,
    (snapshot) => {
      const list: ClassStudentStat[] = [];
      snapshot.forEach((docSnap) => {
        list.push({ id: docSnap.id, ...(docSnap.data() as Omit<ClassStudentStat, 'id'>) });
      });
      onUpdate(list);
    },
    (error) => {
      handleFirestoreError(error, OperationType.LIST, 'class_students');
    }
  );
}

export async function saveClassStudentToFirestore(student: ClassStudentStat): Promise<void> {
  try {
    await setDoc(doc(db, 'class_students', student.id), student, { merge: true });
  } catch (err) {
    handleFirestoreError(err, OperationType.WRITE, `class_students/${student.id}`);
  }
}

// 11. Initial Data Seeder (Syncs default sample exams and cleans up any old mock student data)
export async function seedInitialFirestoreData(): Promise<void> {
  try {
    const examsSnap = await getDocs(collection(db, 'exams'));
    if (examsSnap.empty) {
      console.log('🌱 Seeding initial sample exams to Firestore...');
      for (const exam of SAMPLE_EXAMS) {
        await setDoc(doc(db, 'exams', exam.id), exam);
      }
    } else {
      // Ensure all SAMPLE_EXAMS (including round 2 survey exam) exist in Firestore
      for (const exam of SAMPLE_EXAMS) {
        try {
          const snap = await getDoc(doc(db, 'exams', exam.id));
          if (!snap.exists()) {
            await setDoc(doc(db, 'exams', exam.id), exam);
            console.log(`🌱 Seeded exam ${exam.id} to Firestore`);
          }
        } catch (e) {
          // ignore
        }
      }

      // Clean up special focus exam if previously stored in Firestore
      try {
        const specialRef = doc(db, 'exams', 'exam-grammar-special-focus');
        const specialSnap = await getDoc(specialRef);
        if (specialSnap.exists()) {
          await deleteDoc(specialRef);
          console.log('🧹 Cleaned up exam-grammar-special-focus from Firestore');
        }
      } catch (e) {
        // Ignore deletion note
      }
    }

    // Clean up any old mock students from Firestore so only real accounts in userAccounts exist
    const mockIds = ['stu-1', 'stu-2', 'stu-3', 'stu-4', 'stu-5', 'stu-6'];
    for (const mId of mockIds) {
      try {
        const docRef = doc(db, 'class_students', mId);
        const snap = await getDoc(docRef);
        if (snap.exists()) {
          await deleteDoc(docRef);
          console.log(`🧹 Cleaned up mock student ${mId} from Firestore`);
        }
      } catch (e) {
        // Ignore deletion errors for non-existent documents
      }
    }

    // Ensure system_settings app_config exists for diagnostic exam tracking
    try {
      const settingsSnap = await getDoc(doc(db, 'system_settings', 'app_config'));
      if (!settingsSnap.exists()) {
        await setDoc(doc(db, 'system_settings', 'app_config'), {
          diagnosticExamId: 'exam-hcm-2025-official-demo',
          updatedAt: new Date().toISOString(),
        });
      }
    } catch (e) {
      // Ignore settings note
    }
  } catch (err) {
    console.warn('Initial seeding note:', err);
  }
}

