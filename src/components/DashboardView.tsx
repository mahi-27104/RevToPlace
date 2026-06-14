/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { Award, Code, BookOpen, Flame, CheckCircle, Database } from 'lucide-react';
import { DatabaseState } from '../types';
import { COURSES, DSA_PROBLEMS } from '../mockData';
import StudentLeaderboard from './StudentLeaderboard';

interface DashboardViewProps {
  dbState: DatabaseState;
  onNavigate: (tab: string) => void;
}

export default function DashboardView({ dbState, onNavigate }: DashboardViewProps) {
  // Calculators
  const totalLessons = COURSES.reduce((sum, course) => sum + course.lessons.length, 0);
  const completedLessons = Object.values(dbState.courses).reduce((sum, list) => sum + list.length, 0);
  const coursePercent = totalLessons === 0 ? 0 : Math.round((completedLessons / totalLessons) * 100);

  const dsaSolved = Object.values(dbState.dsa).filter(u => u.status === 'solved').length;
  const dsaPercent = DSA_PROBLEMS.length === 0 ? 0 : Math.round((dsaSolved / DSA_PROBLEMS.length) * 100);

  // Solved by difficulty
  const solvedProblems = Object.keys(dbState.dsa).filter(pId => dbState.dsa[pId].status === 'solved');
  const solvedCount = {
    Easy: DSA_PROBLEMS.filter(p => p.difficulty === 'Easy' && solvedProblems.includes(p.id)).length,
    Medium: DSA_PROBLEMS.filter(p => p.difficulty === 'Medium' && solvedProblems.includes(p.id)).length,
    Hard: DSA_PROBLEMS.filter(p => p.difficulty === 'Hard' && solvedProblems.includes(p.id)).length
  };

  const totalDsaByDifficulty = {
    Easy: DSA_PROBLEMS.filter(p => p.difficulty === 'Easy').length,
    Medium: DSA_PROBLEMS.filter(p => p.difficulty === 'Medium').length,
    Hard: DSA_PROBLEMS.filter(p => p.difficulty === 'Hard').length
  };

  const testsCompleted = Object.keys(dbState.mockTests).length;
  const averageMockScore = testsCompleted === 0 
    ? 0 
    : Math.round(Object.values(dbState.mockTests).reduce((sum, mock) => sum + (mock.score / mock.totalQuestions), 0) / testsCompleted * 100);

  return (
    <div className="space-y-8 animate-fade-in">
      {/* Welcome Hero Grid */}
      <div className="bg-gradient-to-r from-indigo-900/40 via-purple-900/20 to-slate-900 border border-slate-800 rounded-2xl p-6 sm:p-8 flex flex-col sm:flex-row items-center justify-between gap-6">
        <div className="space-y-2 text-center sm:text-left">
          <span className="inline-flex items-center space-x-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">
            <Database className="h-3.5 w-3.5" />
            <span>Firebase Synced Profile</span>
          </span>
          <h1 className="text-2xl sm:text-3xl font-sans font-bold tracking-tight text-white">
            Welcome back, <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 to-purple-400">{dbState.profile?.displayName || 'Developer'}</span>!
          </h1>
          <p className="text-slate-400 text-sm max-w-md">
            All coding exercises, code edits, compiler inputs, and course marks are securely backed up in your account profile.
          </p>
        </div>

        {/* Sync Indicator Card */}
        <div className="bg-slate-950/85 border border-slate-800/80 rounded-xl p-4 flex items-center space-x-3 w-full sm:w-auto">
          <div className="p-3 bg-emerald-500/10 rounded-lg text-emerald-400">
            <Flame className="h-6 w-6 text-orange-500 fill-orange-500 animate-pulse" />
          </div>
          <div>
            <div className="text-xs text-slate-400">Current Active Streak</div>
            <div className="text-lg font-bold text-white font-mono">4 Days Coding</div>
          </div>
        </div>
      </div>

      {/* Main Stats Row */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Curricular Completion Stats */}
        <div className="bg-slate-900/60 border border-slate-800/80 rounded-xl p-5 flex items-center justify-between">
          <div className="space-y-1">
            <span className="text-slate-400 text-xs font-medium uppercase tracking-wider">Lesson Progress</span>
            <h3 className="text-2xl font-bold text-white font-mono">{completedLessons}/{totalLessons}</h3>
            <p className="text-slate-400 text-xs mt-1">Language fundamentals</p>
          </div>
          <div className="relative h-16 w-16 flex items-center justify-center">
            {/* SVG custom progress circular ring */}
            <svg className="w-full h-full transform -rotate-90">
              <circle cx="32" cy="32" r="26" className="text-slate-800" strokeWidth="6" stroke="currentColor" fill="transparent" />
              <circle cx="32" cy="32" r="26" className="text-indigo-500" strokeWidth="6" strokeDasharray={163.3} strokeDashoffset={163.3 - (163.3 * coursePercent) / 100} strokeLinecap="round" stroke="currentColor" fill="transparent" />
            </svg>
            <span className="absolute text-xs font-bold text-white font-mono">{coursePercent}%</span>
          </div>
        </div>

        {/* Algorithmic Solved Rings */}
        <div className="bg-slate-900/60 border border-slate-800/80 rounded-xl p-5 flex items-center justify-between">
          <div className="space-y-1">
            <span className="text-slate-400 text-xs font-semibold uppercase tracking-wider">DSA Achievements</span>
            <h3 className="text-2xl font-bold text-white font-mono">{dsaSolved}/{DSA_PROBLEMS.length}</h3>
            <p className="text-slate-400 text-xs mt-1">Curated Interview tasks</p>
          </div>
          <div className="relative h-16 w-16 flex items-center justify-center">
            <svg className="w-full h-full transform -rotate-90">
              <circle cx="32" cy="32" r="26" className="text-slate-800" strokeWidth="6" stroke="currentColor" fill="transparent" />
              <circle cx="32" cy="32" r="26" className="text-emerald-500" strokeWidth="6" strokeDasharray={163.3} strokeDashoffset={163.3 - (163.3 * dsaPercent) / 100} strokeLinecap="round" stroke="currentColor" fill="transparent" />
            </svg>
            <span className="absolute text-xs font-bold text-white font-mono">{dsaPercent}%</span>
          </div>
        </div>

        {/* Mock Exam Average Accuracy */}
        <div className="bg-slate-900/60 border border-slate-800/80 rounded-xl p-5 flex items-center justify-between">
          <div className="space-y-1">
            <span className="text-slate-400 text-xs font-semibold uppercase tracking-wider">Mock Assessment</span>
            <h3 className="text-2xl font-bold text-white font-mono">
              {testsCompleted > 0 ? `${averageMockScore}%` : 'N/A'}
            </h3>
            <p className="text-slate-400 text-xs mt-1">{testsCompleted} Assessments completed</p>
          </div>
          <div className="p-3 bg-fuchsia-500/10 rounded-xl text-fuchsia-400">
            <Award className="h-8 w-8 text-fuchsia-500" />
          </div>
        </div>
      </div>

      {/* Grid: DSA Difficulty Metrics & Course Progress Cards */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        
        {/* Left Card: Detailed DSA breakdown */}
        <div className="bg-slate-900/50 border border-slate-800 rounded-xl p-6 space-y-6">
          <div>
            <h3 className="text-lg font-bold text-white font-sans">DSA Difficulty Breakdown</h3>
            <p className="text-slate-400 text-xs mt-0.5">Performance tracking grouped by computational difficulty</p>
          </div>

          <div className="space-y-4">
            {/* Easy Bar */}
            <div className="space-y-2">
              <div className="flex justify-between text-xs font-mono">
                <span className="text-emerald-400 font-medium">Easy Problems</span>
                <span className="text-slate-300">{solvedCount.Easy} / {totalDsaByDifficulty.Easy}</span>
              </div>
              <div className="h-2 w-full bg-slate-950 rounded-full overflow-hidden">
                <div 
                  className="h-full bg-emerald-500 rounded-full transition-all duration-500" 
                  style={{ width: `${totalDsaByDifficulty.Easy === 0 ? 0 : (solvedCount.Easy / totalDsaByDifficulty.Easy) * 100}%` }}
                />
              </div>
            </div>

            {/* Medium Bar */}
            <div className="space-y-2">
              <div className="flex justify-between text-xs font-mono">
                <span className="text-amber-400 font-medium">Medium Problems</span>
                <span className="text-slate-300">{solvedCount.Medium} / {totalDsaByDifficulty.Medium}</span>
              </div>
              <div className="h-2 w-full bg-slate-950 rounded-full overflow-hidden">
                <div 
                  className="h-full bg-amber-500 rounded-full transition-all duration-500" 
                  style={{ width: `${totalDsaByDifficulty.Medium === 0 ? 0 : (solvedCount.Medium / totalDsaByDifficulty.Medium) * 100}%` }}
                />
              </div>
            </div>

            {/* Hard Bar */}
            <div className="space-y-2">
              <div className="flex justify-between text-xs font-mono">
                <span className="text-red-400 font-medium">Hard Problems</span>
                <span className="text-slate-300">{solvedCount.Hard} / {totalDsaByDifficulty.Hard}</span>
              </div>
              <div className="h-2 w-full bg-slate-950 rounded-full overflow-hidden">
                <div 
                  className="h-full bg-red-500 rounded-full transition-all duration-500" 
                  style={{ width: `${totalDsaByDifficulty.Hard === 0 ? 0 : (solvedCount.Hard / totalDsaByDifficulty.Hard) * 100}%` }}
                />
              </div>
            </div>
          </div>

          <div className="pt-2">
            <button
              onClick={() => onNavigate('dsa')}
              id="dashboard-goto-dsa"
              className="w-full py-2.5 bg-slate-950 hover:bg-slate-900 border border-slate-800 text-xs font-medium text-slate-300 rounded-lg transition"
            >
              Solve DSA Coding Problems
            </button>
          </div>
        </div>

        {/* Right Card: Quick Navigation Modules */}
        <div className="bg-slate-900/50 border border-slate-800 rounded-xl p-6 space-y-6">
          <div>
            <h3 className="text-lg font-bold text-white font-sans">Active Curriculums</h3>
            <p className="text-slate-400 text-xs mt-0.5">Toggle and run programs in our specialized environments</p>
          </div>

          <div className="grid grid-cols-1 gap-4">
            {COURSES.map(course => {
              const completedLessons = dbState.courses[course.id] || [];
              let compPercent = 0;
              if (course.sections && course.sections.length > 0) {
                const completedSectionsCount = course.sections.filter(sec => 
                  sec.topics.every(t => completedLessons.includes(t.topic_id))
                ).length;
                compPercent = Math.round((completedSectionsCount / course.sections.length) * 100);
              } else {
                compPercent = course.lessons.length === 0 ? 0 : Math.round((completedLessons.length / course.lessons.length) * 100);
              }
              return (
                <div 
                  key={course.id}
                  className="flex items-center justify-between p-4 bg-slate-950/60 border border-slate-800/80 rounded-xl hover:border-slate-700 transition"
                >
                  <div className="flex items-center space-x-3.5">
                    <div className="p-2 w-10 h-10 rounded-lg flex items-center justify-center bg-indigo-500/10 text-indigo-400 font-bold capitalize">
                      {course.language === 'python' ? 'Py' : course.language === 'java' ? 'Jv' : 'C'}
                    </div>
                    <div>
                      <h4 className="text-xs font-bold text-slate-200">{course.title}</h4>
                      <div className="flex items-center space-x-2 mt-1">
                        <span className="text-[10.5px] text-slate-500">
                          {course.sections && course.sections.length > 0 
                            ? `${course.sections.length} sections (${course.lessons.length} topics)` 
                            : `${course.lessons.length} lessons`
                          } available
                        </span>
                        <span className="text-slate-700 font-mono text-[9px]">•</span>
                        <span className="text-[10.5px] text-indigo-400 font-semibold">{compPercent}% Completed</span>
                      </div>
                    </div>
                  </div>

                  <button
                    onClick={() => onNavigate('courses')}
                    className="p-1 px-3 bg-indigo-600 hover:bg-indigo-500 hover:text-white rounded-md text-[10px] text-slate-200 font-semibold transition"
                  >
                    Open
                  </button>
                </div>
              );
            })}
          </div>
        </div>

      </div>

      {/* Student Leaderboard Section */}
      <StudentLeaderboard dbState={dbState} onNavigate={onNavigate} />
    </div>
  );
}
