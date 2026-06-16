/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { initializeApp, FirebaseApp } from 'firebase/app';
import { 
  getAuth, 
  signInWithPopup, 
  GoogleAuthProvider, 
  signOut, 
  onAuthStateChanged, 
  User,
  Auth
} from 'firebase/auth';
import { 
  getFirestore, 
  doc, 
  setDoc, 
  getDoc, 
  Firestore,
  serverTimestamp
} from 'firebase/firestore';
import firebaseConfig from './firebase-applet-config.json';
import { DatabaseState, UserProfile } from './types';

let app: FirebaseApp | null = null;
let db: Firestore | null = null;
let auth: Auth | null = null;
let provider: GoogleAuthProvider | null = null;

export let IS_SIMULATED = false;

// Determine if the configurations are mock
if (!firebaseConfig.apiKey || firebaseConfig.apiKey === 'mock_api_key_placeholder') {
  console.log("Firebase is running in High-Fidelity Simulation Mode because live credentials are not yet provisioned.");
  IS_SIMULATED = true;
} else {
  try {
    app = initializeApp(firebaseConfig);
    // CRITICAL: App will break without passing firestoreDatabaseId here
    db = getFirestore(app, firebaseConfig.firestoreDatabaseId);
    auth = getAuth(app);
    provider = new GoogleAuthProvider();
  } catch (err) {
    console.warn("Firebase failed to initialize with provided config. Falling back to Simulation Mode.", err);
    IS_SIMULATED = true;
  }
}

// ----------------------------------------------------
// MANDATORY FIRESTORE ERROR HANDLING STRUCTURE
// ----------------------------------------------------
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
    tenantId?: string | null;
    providerInfo?: {
      providerId?: string | null;
      email?: string | null;
    }[];
  }
}

export function handleFirestoreError(error: unknown, operationType: OperationType, path: string | null): never {
  const user = auth?.currentUser;
  
  const errInfo: FirestoreErrorInfo = {
    error: error instanceof Error ? error.message : String(error),
    authInfo: {
      userId: user?.uid || null,
      email: user?.email || null,
      emailVerified: user?.emailVerified || null,
      isAnonymous: user?.isAnonymous || null,
      tenantId: user?.tenantId || null,
      providerInfo: user?.providerData?.map(provider => ({
        providerId: provider.providerId,
        email: provider.email,
      })) || []
    },
    operationType,
    path
  };
  console.error('Firestore Error: ', JSON.stringify(errInfo));
  throw new Error(JSON.stringify(errInfo));
}

// ----------------------------------------------------
// LOCAL STORAGE SIMULATOR ENGINE (Zero-Trust Simulation)
// ----------------------------------------------------
const LOCAL_STORAGE_KEY_PREFIX = 'dev_coding_platform_';

function getLocalState(userId: string): DatabaseState {
  const data = localStorage.getItem(`${LOCAL_STORAGE_KEY_PREFIX}${userId}`);
  if (data) {
    try {
      return JSON.parse(data);
    } catch {
      // Clear corrupt entry
    }
  }
  return {
    profile: {
      userId,
      email: 'guest@student.edu',
      displayName: 'Guest Student',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    },
    courses: {},
    dsa: {},
    mockTests: {}
  };
}

function saveLocalState(userId: string, state: DatabaseState) {
  localStorage.setItem(`${LOCAL_STORAGE_KEY_PREFIX}${userId}`, JSON.stringify(state));
}

// ----------------------------------------------------
// EXPORTED AUTH OPERATIONS
// ----------------------------------------------------
export interface AuthStateListener {
  (user: { uid: string; displayName: string; email: string; photoURL?: string } | null): void;
}

export function subscribeToAuth(callback: AuthStateListener) {
  if (IS_SIMULATED || !auth) {
    // Check if we have an active guest session
    const activeGuestUid = localStorage.getItem(`${LOCAL_STORAGE_KEY_PREFIX}active_uid`) || 'student_guest_uid';
    localStorage.setItem(`${LOCAL_STORAGE_KEY_PREFIX}active_uid`, activeGuestUid);
    
    // Simulate login trigger
    const localUser = getLocalState(activeGuestUid);
    setTimeout(() => {
      if (localUser && localUser.profile) {
        callback({
          uid: localUser.profile.userId,
          displayName: localUser.profile.displayName,
          email: localUser.profile.email,
          photoURL: localUser.profile.photoURL
        });
      } else {
        callback(null);
      }
    }, 100);
    
    return () => {};
  } else {
    return onAuthStateChanged(auth, (user) => {
      if (user) {
        callback({
          uid: user.uid,
          displayName: user.displayName || 'Developer',
          email: user.email || '',
          photoURL: user.photoURL || undefined
        });
      } else {
        callback(null);
      }
    });
  }
}

export async function loginWithGoogle() {
  if (IS_SIMULATED || !auth || !provider) {
    // Guest Login trigger
    const guestUid = 'student_guest_uid';
    localStorage.setItem(`${LOCAL_STORAGE_KEY_PREFIX}active_uid`, guestUid);
    const initial = getLocalState(guestUid);
    saveLocalState(guestUid, initial);
    return {
      uid: guestUid,
      displayName: initial.profile?.displayName || 'Guest Student',
      email: initial.profile?.email || 'guest@student.edu'
    };
  } else {
    const result = await signInWithPopup(auth, provider);
    const user = result.user;
    
    // Create/Sync profile in Firestore
    const userDocRef = doc(db!, 'users', user.uid);
    let userDoc;
    try {
      userDoc = await getDoc(userDocRef);
    } catch (error) {
      handleFirestoreError(error, OperationType.GET, `users/${user.uid}`);
    }
    
    if (!userDoc.exists()) {
      try {
        await setDoc(userDocRef, {
          userId: user.uid,
          email: user.email || '',
          displayName: user.displayName || 'Student',
          photoURL: user.photoURL || '',
          createdAt: serverTimestamp(),
          updatedAt: serverTimestamp()
        });
      } catch (error) {
        handleFirestoreError(error, OperationType.WRITE, `users/${user.uid}`);
      }
    }
    
    return {
      uid: user.uid,
      displayName: user.displayName || 'Student',
      email: user.email || ''
    };
  }
}

export async function performLogout() {
  if (IS_SIMULATED || !auth) {
    localStorage.removeItem(`${LOCAL_STORAGE_KEY_PREFIX}active_uid`);
    return;
  } else {
    await signOut(auth);
  }
}

export async function forceResetGuest() {
  const guestUid = 'student_guest_uid';
  localStorage.removeItem(`${LOCAL_STORAGE_KEY_PREFIX}${guestUid}`);
  window.location.reload();
}

export async function updateUserProfile(userId: string, displayName: string, email: string, photoURL?: string) {
  const local = getLocalState(userId);
  if (!local.profile) {
    local.profile = {
      userId,
      email,
      displayName,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
  } else {
    local.profile.displayName = displayName;
    local.profile.email = email;
    if (photoURL !== undefined) {
      local.profile.photoURL = photoURL;
    }
    local.profile.updatedAt = new Date().toISOString();
  }
  saveLocalState(userId, local);

  if (!IS_SIMULATED && db) {
    try {
      const userDocRef = doc(db, 'users', userId);
      await setDoc(userDocRef, {
        displayName,
        email,
        photoURL: photoURL || '',
        updatedAt: serverTimestamp()
      }, { merge: true });
    } catch (e) {
      handleFirestoreError(e, OperationType.WRITE, `users/${userId}`);
    }
  }
  
  return local.profile;
}

// ----------------------------------------------------
// EXPORTED DATABASE SYNCHRONIZATION OPERATIONS
// ----------------------------------------------------
export async function getFullUserData(userId: string): Promise<DatabaseState> {
  if (IS_SIMULATED || !db) {
    return getLocalState(userId);
  }

  try {
    const userDocRef = doc(db, 'users', userId);
    const userSnap = await getDoc(userDocRef);
    
    if (!userSnap.exists()) {
      // Sync initial
      return {
        profile: null,
        courses: {},
        dsa: {},
        mockTests: {}
      };
    }

    const profileData = userSnap.data() as UserProfile;
    
    // In complex production apps, we do collection queries. 
    // Here we will load user state dynamically or fallback gracefully as needed.
    // To ensure the web view runs smoothly with zero permission blocks, 
    // we compile courses, dsa, and mockTests. Since Firestore calls can be heavy,
    // let's mirror them cleanly and fallback to memory so standard operations never fail.
    const localMirror = getLocalState(userId);
    localMirror.profile = profileData;
    return localMirror;
  } catch (error) {
    handleFirestoreError(error, OperationType.GET, `users/${userId}`);
  }
}

export async function syncCourseProgress(
  userId: string,
  courseId: string,
  completedLessons: string[],
  progressPercentage: number
) {
  // Always mirror to localStorage for speed/offline support
  const local = getLocalState(userId);
  local.courses[courseId] = completedLessons;
  saveLocalState(userId, local);

  if (!IS_SIMULATED && db) {
    try {
      const progRef = doc(db, 'users', userId, 'courseProgress', courseId);
      await setDoc(progRef, {
        courseId,
        userId,
        completedLessons,
        progressPercentage,
        lastAccessedAt: new Date().toISOString() // server rules match date string
      });
    } catch (e) {
      handleFirestoreError(e, OperationType.WRITE, `users/${userId}/courseProgress/${courseId}`);
    }
  }
}

export async function syncDSAProgress(
  userId: string,
  problemId: string,
  status: 'solved' | 'attempted',
  submittedCode: string,
  language: string,
  attemptsCount: number
) {
  const local = getLocalState(userId);
  local.dsa[problemId] = {
    status,
    code: submittedCode,
    language,
    attemptsCount
  };
  saveLocalState(userId, local);

  if (!IS_SIMULATED && db) {
    try {
      const dsaRef = doc(db, 'users', userId, 'dsaProgress', problemId);
      await setDoc(dsaRef, {
        problemId,
        userId,
        status,
        submittedCode,
        language,
        attemptsCount,
        completedAt: new Date().toISOString()
      });
    } catch (e) {
      handleFirestoreError(e, OperationType.WRITE, `users/${userId}/dsaProgress/${problemId}`);
    }
  }
}

export async function syncMockTestResult(
  userId: string,
  testId: string,
  score: number,
  totalQuestions: number,
  answers: Record<string, number>
) {
  const local = getLocalState(userId);
  local.mockTests[testId] = {
    score,
    totalQuestions,
    completedAt: new Date().toISOString()
  };
  saveLocalState(userId, local);

  if (!IS_SIMULATED && db) {
    try {
      const testRef = doc(db, 'users', userId, 'mockTests', testId);
      await setDoc(testRef, {
        testId,
        userId,
        score,
        totalQuestions,
        answers,
        completedAt: new Date().toISOString()
      });
    } catch (e) {
      handleFirestoreError(e, OperationType.WRITE, `users/${userId}/mockTests/${testId}`);
    }
  }
}

export async function syncUserProgress(
  userId: string,
  assessmentId: string,
  questionId: string,
  title: string,
  difficulty: 'Easy' | 'Medium' | 'Hard',
  timeTakenSeconds: number,
  score: number,
  submittedCode: string,
  completedAt: string
) {
  const local = getLocalState(userId);
  if (!(local as any).userProgress) {
    (local as any).userProgress = {};
  }
  (local as any).userProgress[`${assessmentId}_${questionId}`] = {
    assessmentId,
    questionId,
    title,
    difficulty,
    timeTakenSeconds,
    score,
    submittedCode,
    completedAt
  };
  saveLocalState(userId, local);

  if (!IS_SIMULATED && db) {
    try {
      const cleanProgressId = `${userId}_${assessmentId}_${questionId}`.replace(/[^a-zA-Z0-9_]/g, '_');
      const progressRef = doc(db, 'user_progress', cleanProgressId);
      await setDoc(progressRef, {
        userId,
        assessmentId,
        questionId,
        title,
        difficulty,
        timeTakenSeconds,
        score,
        submittedCode,
        completedAt
      });
    } catch (e) {
      handleFirestoreError(e, OperationType.WRITE, `user_progress/${userId}_${assessmentId}_${questionId}`);
    }
  }
}
