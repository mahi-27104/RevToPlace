/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { 
  Database, 
  Layout, 
  BookOpen, 
  Code, 
  Briefcase, 
  Smartphone, 
  LogOut, 
  Github, 
  RefreshCw, 
  Terminal, 
  Lock,
  Sparkles,
  Award,
  Globe2,
  ChevronRight,
  Info
} from 'lucide-react';
import { 
  subscribeToAuth, 
  loginWithGoogle, 
  performLogout, 
  getFullUserData, 
  syncCourseProgress, 
  syncDSAProgress, 
  syncMockTestResult, 
  syncUserProgress,
  IS_SIMULATED,
  forceResetGuest
} from './firebase';
import { DatabaseState, UserProfile } from './types';

// Subcomponents
import DashboardView from './components/DashboardView';
import CourseHubView from './components/CourseHubView';
import DSAPracticeView from './components/DSAPracticeView';
import PlacementPrepView from './components/PlacementPrepView';
import FlutterEmulatorView from './components/FlutterEmulatorView';

export default function App() {
  const [activeTab, setActiveTab] = useState<string>('dashboard');
  const [user, setUser] = useState<{ uid: string; displayName: string; email: string; photoURL?: string } | null>(null);
  const [dbState, setDbState] = useState<DatabaseState>({
    profile: null,
    courses: {},
    dsa: {},
    mockTests: {}
  });
  const [loading, setLoading] = useState<boolean>(true);
  const [syncing, setSyncing] = useState<boolean>(false);

  // Subscribe to Auth
  useEffect(() => {
    const unsubscribe = subscribeToAuth(async (currentUser) => {
      setUser(currentUser);
      if (currentUser) {
        try {
          const freshData = await getFullUserData(currentUser.uid);
          setDbState(freshData);
        } catch (e) {
          console.error("Failed to fetch fresh user profile data", e);
        }
      } else {
        setDbState({
          profile: null,
          courses: {},
          dsa: {},
          mockTests: {}
        });
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const handleLogin = async () => {
    setLoading(true);
    try {
      const loggedUser = await loginWithGoogle();
      const freshData = await getFullUserData(loggedUser.uid);
      setDbState(freshData);
    } catch (e) {
      console.error("Login trigger failed:", e);
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = async () => {
    setLoading(true);
    try {
      await performLogout();
      setUser(null);
    } catch (e) {
      console.error("Logout trigger failed:", e);
    } finally {
      setLoading(false);
    }
  };

  // Sync Wrappers
  const handleCourseProgressSync = async (courseId: string, completedList: string[], progressPercent: number) => {
    if (!user) return;
    setSyncing(true);
    try {
      await syncCourseProgress(user.uid, courseId, completedList, progressPercent);
      // Refresh local state instantly for UI reactivity
      setDbState(prev => ({
        ...prev,
        courses: {
          ...prev.courses,
          [courseId]: completedList
        }
      }));
    } catch (err) {
      console.error(err);
    } finally {
      setSyncing(false);
    }
  };

  const handleDSAProgressSync = async (
    problemId: string,
    status: 'solved' | 'attempted',
    submittedCode: string,
    language: string,
    attempts: number
  ) => {
    if (!user) return;
    setSyncing(true);
    try {
      await syncDSAProgress(user.uid, problemId, status, submittedCode, language, attempts);
      setDbState(prev => ({
        ...prev,
        dsa: {
          ...prev.dsa,
          [problemId]: { status, code: submittedCode, language, attemptsCount: attempts }
        }
      }));
    } catch (err) {
      console.error(err);
    } finally {
      setSyncing(false);
    }
  };

  const handleMockTestResultSync = async (
    testId: string,
    score: number,
    totalQuestions: number,
    answers: Record<string, number>
  ) => {
    if (!user) return;
    setSyncing(true);
    try {
      await syncMockTestResult(user.uid, testId, score, totalQuestions, answers);
      setDbState(prev => ({
        ...prev,
        mockTests: {
          ...prev.mockTests,
          [testId]: { score, totalQuestions, completedAt: new Date().toISOString() }
        }
      }));
    } catch (err) {
      console.error(err);
    } finally {
      setSyncing(false);
    }
  };

  const handleAssessmentProgressSync = async (
    assessmentId: string,
    questionId: string,
    title: string,
    difficulty: 'Easy' | 'Medium' | 'Hard',
    timeTakenSeconds: number,
    score: number,
    submittedCode: string,
    completedAt: string
  ) => {
    if (!user) return;
    setSyncing(true);
    try {
      await syncUserProgress(
        user.uid,
        assessmentId,
        questionId,
        title,
        difficulty,
        timeTakenSeconds,
        score,
        submittedCode,
        completedAt
      );
    } catch (err) {
      console.error(err);
    } finally {
      setSyncing(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center space-y-4">
        <div className="relative flex justify-center items-center">
          <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-indigo-500"></div>
        </div>
        <p className="text-slate-400 font-mono text-xs tracking-wider uppercase animate-pulse">Initializing Dev Sandbox ...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans select-none antialiased">
      
      {/* Top Navigation Ribbon Bar */}
      <header className="border-b border-slate-900 bg-slate-900/40 backdrop-blur-md sticky top-0 z-50 px-6 py-4 flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <div className="p-2 bg-gradient-to-tr from-indigo-500 to-purple-500 rounded-xl shadow-lg shadow-indigo-500/20 text-white flex items-center justify-center">
            <Terminal className="h-5 w-5" />
          </div>
          <div>
            <h1 className="text-sm font-bold tracking-tight text-white flex items-center space-x-1.5">
              <span>MNtech.sols</span>
              <span className="text-[9px] px-1.5 py-0.5 rounded-full bg-slate-800 text-indigo-400 font-mono">v1.1</span>
            </h1>
            <p className="text-[10px] text-slate-400">Comprehensive Engineering Platform</p>
          </div>
        </div>

        {/* Database state indicator & Auth controls */}
        <div className="flex items-center space-x-4">
          
          {/* Firestore Connection status pill */}
          <div className="hidden sm:flex items-center space-x-2 bg-slate-950 px-3 py-1.5 border border-slate-900 rounded-full text-[10px] font-semibold text-slate-400">
            <span className={`h-1.5 w-1.5 rounded-full ${IS_SIMULATED ? 'bg-amber-400' : 'bg-emerald-400 animate-pulse'}`} />
            <span className="font-mono">
              DB: {IS_SIMULATED ? 'Simulation Layer Sync' : 'Live Cloud Firebase'}
            </span>
            {syncing && <RefreshCw className="h-2.5 w-2.5 text-indigo-400 animate-spin ml-1" />}
          </div>

          {/* User Widget */}
          {user ? (
            <div className="flex items-center space-x-3 bg-slate-900/60 p-1 pl-3.5 pr-2 rounded-full border border-slate-800/80">
              <div className="hidden md:block text-right">
                <span className="text-[11px] font-bold text-slate-200 block">{user.displayName}</span>
                <span className="text-[9px] text-slate-500 font-mono block">{user.email}</span>
              </div>
              <button
                onClick={handleLogout}
                id="header-logout-btn"
                className="p-1.5 hover:text-red-400 rounded-full hover:bg-slate-950 transition text-slate-400"
                title="Wipe temporary progress or sign out"
              >
                <LogOut className="h-4 w-4" />
              </button>
            </div>
          ) : (
            <button
              onClick={handleLogin}
              id="header-signin-btn"
              className="px-4 py-1.5 rounded-full bg-indigo-600 hover:bg-indigo-500 text-white font-semibold text-xs transition shadow-md shadow-indigo-600/10"
            >
              Sign In / Guest Profile
            </button>
          )}

          {/* Wipe profile reset button */}
          <button
            onClick={forceResetGuest}
            className="text-[9.5px] font-mono text-slate-600 hover:text-slate-200 bg-transparent py-1 border border-transparent hover:border-slate-800 rounded px-2 transition"
            title="Reset storage to scratch"
          >
            Reset storage
          </button>
        </div>
      </header>

      {/* Main Application Inner Frame */}
      <div className="flex-1 flex flex-col md:flex-row">
        
        {/* Navigation Sidebar Panel */}
        <aside className="w-full md:w-64 border-r border-slate-900 bg-slate-950/60 p-4 md:p-6 space-y-6 flex-shrink-0">
          <div className="space-y-1.5">
            <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest px-2">Navigation Matrix</span>
            
            <nav className="space-y-1">
              {/* Dashboard Tab */}
              <button
                onClick={() => setActiveTab('dashboard')}
                id="nav-tab-dashboard"
                className={`w-full flex items-center space-x-3 px-3.5 py-2.5 rounded-xl text-left text-xs font-semibold transition ${
                  activeTab === 'dashboard' 
                    ? 'bg-slate-900 text-indigo-400 border border-slate-800/80 shadow-lg' 
                    : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900/30'
                }`}
              >
                <Layout className="h-4 w-4 text-indigo-400" />
                <span>Student Dashboard</span>
              </button>

              {/* Course Hub Tab */}
              <button
                onClick={() => setActiveTab('courses')}
                id="nav-tab-courses"
                className={`w-full flex items-center space-x-3 px-3.5 py-2.5 rounded-xl text-left text-xs font-semibold transition ${
                  activeTab === 'courses' 
                    ? 'bg-slate-900 text-indigo-400 border border-slate-800/80 shadow-lg' 
                    : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900/30'
                }`}
              >
                <BookOpen className="h-4 w-4 text-indigo-400" />
                <span>Curriculum Modules</span>
              </button>

              {/* DSA specialized module Tab */}
              <button
                onClick={() => setActiveTab('dsa')}
                id="nav-tab-dsa"
                className={`w-full flex items-center space-x-3 px-3.5 py-2.5 rounded-xl text-left text-xs font-semibold transition ${
                  activeTab === 'dsa' 
                    ? 'bg-slate-900 text-indigo-400 border border-slate-800/80 shadow-lg' 
                    : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900/30'
                }`}
              >
                <Code className="h-4 w-4 text-indigo-400" />
                <span>DSA Coding Tasks</span>
              </button>

              {/* Placement Prep Tab */}
              <button
                onClick={() => setActiveTab('prep')}
                id="nav-tab-prep"
                className={`w-full flex items-center space-x-3 px-3.5 py-2.5 rounded-xl text-left text-xs font-semibold transition ${
                  activeTab === 'prep' 
                    ? 'bg-slate-900 text-indigo-400 border border-slate-800/80 shadow-lg' 
                    : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900/30'
                }`}
              >
                <Briefcase className="h-4 w-4 text-indigo-400" />
                <span>Placement Screening</span>
              </button>

              {/* Android Mockup Tab */}
              <button
                onClick={() => setActiveTab('android')}
                id="nav-tab-android"
                className={`w-full flex items-center space-x-3 px-3.5 py-2.5 rounded-xl text-left text-xs font-semibold transition ${
                  activeTab === 'android' 
                    ? 'bg-slate-900 text-indigo-400 border border-slate-800/80 shadow-lg' 
                    : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900/30'
                }`}
              >
                <Smartphone className="h-4 w-4 text-indigo-400" />
                <span>Android Sync Mirror</span>
              </button>
            </nav>
          </div>

          {/* Quick tips widget */}
          <div className="pt-6 border-t border-slate-900 hidden md:block">
            <div className="p-4 bg-slate-900/40 rounded-2xl border border-slate-800 space-y-2">
              <span className="text-[9.5px] uppercase font-bold text-indigo-400 tracking-wider flex items-center space-x-1">
                <Info className="h-3 w-3" />
                <span>Pro Tip</span>
              </span>
              <p className="text-[10.5px] text-slate-400 leading-normal">
                Double clicking a completed lesson allows running of free syntax scripts inside the micro sandbox console instantly!
              </p>
            </div>
          </div>
        </aside>

        {/* Content Panel Frame */}
        <main className="flex-1 p-6 md:p-8 overflow-y-auto bg-slate-950/40">
          
          {/* Header context info bar */}
          <div className="mb-6 flex flex-col sm:flex-row items-start sm:items-center justify-between border-b border-slate-900 pb-4 gap-4">
            <div>
              <h2 className="text-xl font-bold font-sans tracking-tight text-white capitalize">
                {activeTab === 'prep' ? 'Placement Prep Exam Center' : activeTab === 'android' ? 'Android mobile progress framework' : activeTab === 'dsa' ? 'Specialized DSA Syllabus' : activeTab === 'courses' ? 'Language Syllabus Course Hub' : 'Dashboard Overview'}
              </h2>
              <p className="text-slate-500 text-xs mt-0.5">
                {activeTab === 'prep' ? 'Simulate standard MCQs with timers and review behavior feedback.' : activeTab === 'android' ? 'Sync databases and review copyable Dart templates.' : activeTab === 'dsa' ? 'Solve curated list problems to achieve high developer accuracy.' : activeTab === 'courses' ? 'Select a syllabus class, type your program, and run compiling validations.' : 'All educational progression tracked live across databases.'}
              </p>
            </div>
            
            {/* Sync counter overlay */}
            <div className="text-[11px] font-mono text-slate-700 bg-slate-900/10 p-2 rounded-lg border border-slate-900">
              Session sync: active and healthy
            </div>
          </div>

          {/* Tab Render router */}
          {activeTab === 'dashboard' && (
            <DashboardView dbState={dbState} onNavigate={setActiveTab} />
          )}

          {activeTab === 'courses' && (
            <CourseHubView dbState={dbState} onSyncProgress={handleCourseProgressSync} />
          )}

          {activeTab === 'dsa' && (
            <DSAPracticeView dbState={dbState} onSyncDSA={handleDSAProgressSync} />
          )}

          {activeTab === 'prep' && (
            <PlacementPrepView 
              dbState={dbState} 
              onSyncMockTest={handleMockTestResultSync} 
              onSyncUserProgress={handleAssessmentProgressSync}
            />
          )}

          {activeTab === 'android' && (
            <FlutterEmulatorView dbState={dbState} />
          )}

        </main>

      </div>

      {/* Footer Info Ribbon */}
      <footer className="border-t border-slate-900 bg-slate-950 px-6 py-4 flex flex-col sm:flex-row items-center justify-between text-[11px] text-slate-500 font-mono gap-3">
        <span>© 2026 MNtech.sols Education Platform. All configurations secured.</span>
        <div className="flex items-center space-x-4">
          <span className="text-emerald-500 flex items-center space-x-1">
            <span className="h-1.5 w-1.5 bg-emerald-500 rounded-full animate-pulse" />
            <span>Server Container: Live on Port 3000</span>
          </span>
          <span className="text-slate-600">|</span>
          <span>Dual Web & Android Backed Model</span>
        </div>
      </footer>

    </div>
  );
}
