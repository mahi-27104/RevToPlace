/**
 * @license
 * SPDX-License-Identifier: Apache-2.5
 */

import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Trophy, 
  Search, 
  Award, 
  BookOpen, 
  Code, 
  Flame, 
  Sparkles, 
  ChevronRight, 
  Star, 
  Crown, 
  UserCircle2, 
  TrendingUp, 
  ArrowUpDown,
  BookMarked,
  LayoutGrid
} from 'lucide-react';
import { DatabaseState } from '../types';

interface StudentLeaderboardProps {
  dbState: DatabaseState;
  onNavigate: (tab: string) => void;
}

interface LeaderboardRecord {
  id: string;
  name: string;
  avatarColor: string;
  dsaSolved: number;
  lessonsCompleted: number;
  mockScore: number;
  streak: number;
  isCurrentUser: boolean;
  avatarText: string;
  rankBadge?: string;
  academicTier: 'Grandmaster' | 'Expert' | 'Specialist' | 'Novice';
}

export default function StudentLeaderboard({ dbState, onNavigate }: StudentLeaderboardProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [sortBy, setSortBy] = useState<'dsaSolved' | 'lessonsCompleted' | 'mockScore' | 'streak'>('dsaSolved');
  const [selectedStudentId, setSelectedStudentId] = useState<string | null>(null);

  // 1. Calculate active student's exact dynamic live stats from Firebase / Storage
  const currentUserDsaCount = useMemo(() => {
    return Object.values(dbState.dsa || {}).filter(u => u.status === 'solved').length;
  }, [dbState.dsa]);

  const currentUserLessonsCount = useMemo(() => {
    return Object.values(dbState.courses || {}).reduce((sum, list) => sum + list.length, 0);
  }, [dbState.courses]);

  const currentUserMockStats = useMemo(() => {
    const completions = Object.keys(dbState.mockTests || {}).length;
    if (completions === 0) return { score: 0, count: 0 };
    const avg = Math.round(
      Object.values(dbState.mockTests).reduce((sum, m) => sum + (m.score / m.totalQuestions), 0) / completions * 100
    );
    return { score: avg, count: completions };
  }, [dbState.mockTests]);

  // Current user's stats
  const activeStudentProfile: LeaderboardRecord = useMemo(() => {
    const name = dbState.profile?.displayName || 'You (Active Student)';
    const initials = name
      .split(' ')
      .map(part => part[0])
      .join('')
      .slice(0, 2)
      .toUpperCase() || 'ST';

    // Tier based on solve metrics
    let tier: 'Grandmaster' | 'Expert' | 'Specialist' | 'Novice' = 'Novice';
    if (currentUserDsaCount >= 8) tier = 'Grandmaster';
    else if (currentUserDsaCount >= 5) tier = 'Expert';
    else if (currentUserDsaCount >= 2) tier = 'Specialist';

    return {
      id: dbState.profile?.userId || 'active_student_uid',
      name: `${name} (You)`,
      avatarColor: 'from-indigo-500 to-purple-600',
      dsaSolved: currentUserDsaCount,
      lessonsCompleted: currentUserLessonsCount,
      mockScore: currentUserMockStats.score,
      streak: 4, // Sync default streak from active hero stat
      isCurrentUser: true,
      avatarText: initials,
      academicTier: tier
    };
  }, [dbState.profile, currentUserDsaCount, currentUserLessonsCount, currentUserMockStats]);

  // 2. High-fidelity developer peers
  const peersList: LeaderboardRecord[] = useMemo(() => [
    {
      id: 'student_1_sneha',
      name: 'Sneha Reddy',
      avatarColor: 'from-amber-400 to-orange-500',
      dsaSolved: 8,
      lessonsCompleted: 4,
      mockScore: 92,
      streak: 14,
      isCurrentUser: false,
      avatarText: 'SR',
      academicTier: 'Grandmaster'
    },
    {
      id: 'student_2_pranav',
      name: 'Pranav Saxena',
      avatarColor: 'from-teal-400 to-emerald-600',
      dsaSolved: 6,
      lessonsCompleted: 3,
      mockScore: 88,
      streak: 10,
      isCurrentUser: false,
      avatarText: 'PS',
      academicTier: 'Expert'
    },
    {
      id: 'student_3_aarav',
      name: 'Aarav Nair',
      avatarColor: 'from-pink-500 to-rose-600',
      dsaSolved: 5,
      lessonsCompleted: 3,
      mockScore: 84,
      streak: 8,
      isCurrentUser: false,
      avatarText: 'AN',
      academicTier: 'Expert'
    },
    {
      id: 'student_4_devon',
      name: 'Devon Miller',
      avatarColor: 'from-cyan-400 to-blue-600',
      dsaSolved: 4,
      lessonsCompleted: 2,
      mockScore: 78,
      streak: 5,
      isCurrentUser: false,
      avatarText: 'DM',
      academicTier: 'Specialist'
    },
    {
      id: 'student_5_isha',
      name: 'Isha Patel',
      avatarColor: 'from-fuchsia-400 to-purple-600',
      dsaSolved: 2,
      lessonsCompleted: 1,
      mockScore: 70,
      streak: 3,
      isCurrentUser: false,
      avatarText: 'IP',
      academicTier: 'Specialist'
    },
    {
      id: 'student_6_kevin',
      name: 'Kevin Vance',
      avatarColor: 'from-slate-400 to-blue-500',
      dsaSolved: 1,
      lessonsCompleted: 1,
      mockScore: 60,
      streak: 2,
      isCurrentUser: false,
      avatarText: 'KV',
      academicTier: 'Novice'
    }
  ], []);

  // 3. Merge active user dynamically and perform sorting
  const sortedLeaderboard = useMemo(() => {
    // Combine arrays. To avoid duplication if the active user ID matches any peer ID (which they won't, but safely check)
    const combined = [activeStudentProfile, ...peersList.filter(p => p.id !== activeStudentProfile.id)];

    // Sort based on chosen column priority
    return combined.sort((a, b) => {
      if (b[sortBy] !== a[sortBy]) {
        return b[sortBy] - a[sortBy];
      }
      // Tie breaker by DSA solves
      return b.dsaSolved - a.dsaSolved;
    });
  }, [activeStudentProfile, peersList, sortBy]);

  // Apply search filtering
  const filteredLeaderboard = useMemo(() => {
    return sortedLeaderboard.filter(student => 
      student.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      student.academicTier.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [sortedLeaderboard, searchTerm]);

  // Find the selected student info for the interactive detailed preview card
  const selectedStudent = useMemo(() => {
    return filteredLeaderboard.find(s => s.id === selectedStudentId) || null;
  }, [filteredLeaderboard, selectedStudentId]);

  return (
    <div id="student-leaderboard-section" className="bg-slate-900/40 border border-slate-800 rounded-2xl p-6 sm:p-8 space-y-6 shadow-xl">
      
      {/* Header element */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-slate-850 pb-5">
        <div className="space-y-1">
          <div className="flex items-center space-x-2">
            <div className="p-1.5 bg-indigo-500/10 text-indigo-400 border border-indigo-500/20 rounded-lg">
              <Trophy className="h-4.5 w-4.5 text-yellow-500 fill-yellow-500/20" />
            </div>
            <h3 className="text-lg font-bold text-white font-sans tracking-tight">Student Ranking Leaderboard</h3>
          </div>
          <p className="text-slate-400 text-xs">
            Compare live academic stats synced across Firebase databases. Complete curriculums and DSA tasks to climb the ratings.
          </p>
        </div>

        {/* Sync Info indicator */}
        <div className="flex items-center space-x-2 bg-slate-950/60 border border-slate-800 px-3 py-1.5 rounded-xl text-[10.5px] font-mono text-slate-400">
          <Sparkles className="h-3.5 w-3.5 text-purple-400 animate-pulse" />
          <span>Updates Live from Profile</span>
        </div>
      </div>

      {/* Control Ribbon (Search & Sorting) */}
      <div className="flex flex-col lg:flex-row gap-4 justify-between items-stretch lg:items-center">
        
        {/* Search Bar */}
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-500" />
          <input 
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search class rankings by name or tier..."
            className="w-full bg-slate-950 border border-slate-850 focus:border-indigo-500 rounded-xl pl-9 pr-4 py-2 text-xs text-slate-200 outline-none placeholder:text-slate-600 transition"
          />
          {searchTerm && (
            <button 
              onClick={() => setSearchTerm('')}
              className="absolute right-3 top-2 text-[10.5px] text-slate-500 hover:text-slate-300 font-mono"
            >
              clear
            </button>
          )}
        </div>

        {/* Sorting Toggles */}
        <div className="flex flex-wrap items-center gap-1.5">
          <span className="text-[10px] font-mono uppercase tracking-wider text-slate-550 mr-1.5 block sm:inline">Sort by:</span>
          
          <button
            onClick={() => setSortBy('dsaSolved')}
            className={`px-3 py-1.5 rounded-lg text-[11px] font-semibold transition border flex items-center space-x-1.5 ${
              sortBy === 'dsaSolved'
                ? 'bg-indigo-500/15 border-indigo-500/40 text-indigo-400 font-bold'
                : 'bg-slate-950/50 border-slate-850 text-slate-400 hover:text-slate-200'
            }`}
          >
            <Code className="h-3.5 w-3.5" />
            <span>DSA Solved</span>
          </button>

          <button
            onClick={() => setSortBy('lessonsCompleted')}
            className={`px-3 py-1.5 rounded-lg text-[11px] font-semibold transition border flex items-center space-x-1.5 ${
              sortBy === 'lessonsCompleted'
                ? 'bg-indigo-500/15 border-indigo-500/40 text-indigo-400 font-bold'
                : 'bg-slate-950/50 border-slate-850 text-slate-400 hover:text-slate-200'
            }`}
          >
            <BookOpen className="h-3.5 w-3.5" />
            <span>Syllabus Progress</span>
          </button>

          <button
            onClick={() => setSortBy('mockScore')}
            className={`px-3 py-1.5 rounded-lg text-[11px] font-semibold transition border flex items-center space-x-1.5 ${
              sortBy === 'mockScore'
                ? 'bg-indigo-500/15 border-indigo-500/40 text-indigo-400 font-bold'
                : 'bg-slate-950/50 border-slate-850 text-slate-400 hover:text-slate-200'
            }`}
          >
            <Award className="h-3.5 w-3.5" />
            <span>Mock Marks</span>
          </button>

          <button
            onClick={() => setSortBy('streak')}
            className={`px-3 py-1.5 rounded-lg text-[11px] font-semibold transition border flex items-center space-x-1.5 ${
              sortBy === 'streak'
                ? 'bg-indigo-500/15 border-indigo-500/40 text-indigo-400 font-bold'
                : 'bg-slate-950/50 border-slate-850 text-slate-400 hover:text-slate-200'
            }`}
          >
            <Flame className="h-3.5 w-3.5" />
            <span>Streak</span>
          </button>
        </div>
      </div>

      {/* Leaderboard Grid / Side layout */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
        
        {/* Left Side: Dynamic Rankings Table */}
        <div className="lg:col-span-2 overflow-x-auto bg-slate-950/45 border border-slate-850 rounded-xl">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-slate-850 font-mono text-[9.5px] uppercase tracking-wider text-slate-500 select-none bg-slate-900/30">
                <th className="py-3.5 px-4 text-center w-12">Rank</th>
                <th className="py-3.5 px-4">Student Name</th>
                <th className="py-3.5 px-4 text-center">DSA Solved</th>
                <th className="py-3.5 px-4 text-center">Lessons</th>
                <th className="py-3.5 px-4 text-center">Exam Avg</th>
                <th className="py-3.5 px-4 text-center">Streak</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-900">
              <AnimatePresence mode="popLayout">
                {filteredLeaderboard.map((student, index) => {
                  const rank = index + 1;
                  const isTopThree = rank <= 3;
                  const isUser = student.isCurrentUser;
                  const isSelected = selectedStudentId === student.id;

                  return (
                    <motion.tr
                      key={student.id}
                      layoutId={`row_${student.id}`}
                      initial={{ opacity: 0, y: 4 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0 }}
                      onClick={() => setSelectedStudentId(isSelected ? null : student.id)}
                      className={`cursor-pointer transition duration-150 ${
                        isUser 
                          ? 'bg-indigo-950/20 hover:bg-indigo-950/30' 
                          : isSelected 
                            ? 'bg-slate-900' 
                            : 'hover:bg-slate-900/40'
                      }`}
                    >
                      {/* Rank Column */}
                      <td className="py-4 px-4 text-center font-mono">
                        <div className="flex items-center justify-center">
                          {rank === 1 ? (
                            <div className="relative flex items-center justify-center">
                              <Crown className="h-5 w-5 text-yellow-400 absolute -top-3.5 transform -rotate-12 drop-shadow-md" />
                              <span className="w-6 h-6 rounded-full bg-yellow-500/15 border border-yellow-400/45 text-[11px] font-bold text-yellow-400 flex items-center justify-center shadow-md shadow-yellow-500/5">1</span>
                            </div>
                          ) : rank === 2 ? (
                            <span className="w-6 h-6 rounded-full bg-slate-300/10 border border-slate-300/30 text-[11px] font-bold text-slate-300 flex items-center justify-center">2</span>
                          ) : rank === 3 ? (
                            <span className="w-6 h-6 rounded-full bg-orange-700/10 border border-orange-600/30 text-[11px] font-bold text-orange-400 flex items-center justify-center">3</span>
                          ) : (
                            <span className="text-slate-500 text-xs font-semibold">{rank}</span>
                          )}
                        </div>
                      </td>

                      {/* Name Column */}
                      <td className="py-4 px-4">
                        <div className="flex items-center space-x-3">
                          <div className={`w-8 h-8 rounded-lg bg-gradient-to-tr ${student.avatarColor} text-white font-mono text-xs font-bold flex items-center justify-center shadow-inner`}>
                            {student.avatarText}
                          </div>
                          <div>
                            <div className="flex items-center space-x-2">
                              <span className={`text-[12px] font-bold ${isUser ? 'text-indigo-300' : 'text-slate-100'}`}>
                                {student.name}
                              </span>
                              {isUser && (
                                <span className="px-1.5 py-0.5 text-[8.5px] rounded bg-indigo-500/20 border border-indigo-500/40 text-indigo-400 font-bold uppercase tracking-wider">
                                  You
                                </span>
                              )}
                            </div>
                            <span className={`text-[9.5px] font-mono leading-none block mt-0.5 ${
                              student.academicTier === 'Grandmaster' 
                                ? 'text-red-400' 
                                : student.academicTier === 'Expert' 
                                  ? 'text-amber-400' 
                                  : student.academicTier === 'Specialist' 
                                    ? 'text-indigo-450' 
                                    : 'text-slate-500'
                            }`}>
                              Tier: {student.academicTier}
                            </span>
                          </div>
                        </div>
                      </td>

                      {/* DSA Solved */}
                      <td className="py-4 px-4 text-center font-mono">
                        <span className={`text-xs font-bold ${sortBy === 'dsaSolved' ? 'text-indigo-400 underline decoration-indigo-500/30 underline-offset-4' : 'text-slate-300'}`}>
                          {student.dsaSolved} solved
                        </span>
                      </td>

                      {/* Lessons Completed */}
                      <td className="py-4 px-4 text-center font-mono">
                        <span className={`text-xs ${sortBy === 'lessonsCompleted' ? 'text-indigo-400 font-bold underline decoration-indigo-500/30 underline-offset-4' : 'text-slate-400'}`}>
                          {student.lessonsCompleted} lessons
                        </span>
                      </td>

                      {/* Mock score percentage */}
                      <td className="py-4 px-4 text-center font-mono">
                        <span className={`text-xs font-bold ${
                          student.mockScore >= 85 
                            ? 'text-emerald-450' 
                            : student.mockScore >= 70 
                              ? 'text-slate-300' 
                              : 'text-slate-500'
                        } ${sortBy === 'mockScore' ? 'text-indigo-400 underline decoration-indigo-500/30 underline-offset-4' : ''}`}>
                          {student.mockScore > 0 ? `${student.mockScore}%` : 'N/A'}
                        </span>
                      </td>

                      {/* Streak days */}
                      <td className="py-4 px-4 text-center">
                        <div className="flex items-center justify-center space-x-1 font-mono text-xs">
                          <Flame className={`h-3.5 w-3.5 ${student.streak >= 8 ? 'text-orange-500 fill-orange-500/20' : 'text-slate-500'}`} />
                          <span className={sortBy === 'streak' ? 'text-indigo-400 font-bold underline decoration-indigo-500/30 underline-offset-4' : 'text-slate-300'}>
                            {student.streak}d
                          </span>
                        </div>
                      </td>
                    </motion.tr>
                  );
                })}
              </AnimatePresence>

              {filteredLeaderboard.length === 0 && (
                <tr>
                  <td colSpan={6} className="py-12 text-center text-slate-500 font-mono text-xs">
                    No results matched your filter query. Choose a different term.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Right Side: Interactive Focus Details Drawer (Bento Style) */}
        <div className="lg:col-span-1">
          <AnimatePresence mode="wait">
            {selectedStudent ? (
              <motion.div
                key={selectedStudent.id}
                initial={{ opacity: 0, scale: 0.95, y: 5 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95, y: 5 }}
                className="bg-slate-900 border border-slate-850 p-5 rounded-xl space-y-5 relative overflow-hidden"
              >
                {/* Visual Glow Ornament */}
                <div className="absolute top-0 right-0 w-24 h-24 bg-indigo-500/5 rounded-full blur-2xl pointer-events-none" />

                <div className="flex items-start justify-between">
                  <div className="space-y-1">
                    <span className="text-[9px] uppercase tracking-wider font-mono text-slate-550 block">Ranking Focus Profile</span>
                    <h4 className="text-sm font-bold text-slate-100 flex items-center space-x-2">
                      <span>{selectedStudent.name}</span>
                      {selectedStudent.isCurrentUser && <span className="h-1.5 w-1.5 bg-indigo-400 rounded-full animate-ping" />}
                    </h4>
                  </div>
                  <button 
                    onClick={() => setSelectedStudentId(null)}
                    className="text-slate-600 hover:text-slate-400 font-mono text-[10.5px] p-1 px-1.5 bg-slate-950 border border-slate-850 rounded"
                  >
                    ×
                  </button>
                </div>

                {/* Main Rank Indicator */}
                <div className="flex items-center space-x-4 p-3 bg-slate-950/60 border border-slate-850/80 rounded-xl">
                  <div className="p-2.5 bg-indigo-500/10 rounded-lg text-indigo-400 font-mono font-bold text-xs">
                    Rank #{filteredLeaderboard.findIndex(x => x.id === selectedStudent.id) + 1}
                  </div>
                  <div className="space-y-0.5">
                    <span className="text-[9.5px] text-slate-500 font-mono block">Class Status Tier</span>
                    <span className="text-xs font-semibold text-slate-200">{selectedStudent.academicTier} Coder</span>
                  </div>
                </div>

                {/* Substats breakdown bars */}
                <div className="space-y-3.5 pt-1.5">
                  
                  {/* Stat 1: DSA progress percentage estimate */}
                  <div className="space-y-1.5">
                    <div className="flex justify-between items-center text-[10.5px] font-mono">
                      <span className="text-slate-400 flex items-center space-x-1">
                        <Code className="h-3 w-3 text-indigo-400" />
                        <span>DSA Solves</span>
                      </span>
                      <span className="text-slate-200 font-semibold">{selectedStudent.dsaSolved} solved</span>
                    </div>
                    <div className="h-1.5 bg-slate-950 rounded-full overflow-hidden">
                      <div 
                        className="h-full bg-gradient-to-r from-indigo-500 to-indigo-400 rounded-full" 
                        style={{ width: `${Math.min(100, (selectedStudent.dsaSolved / 10) * 100)}%` }} // assume 10 peak problems
                      />
                    </div>
                  </div>

                  {/* Stat 2: Course Progress lessons completed */}
                  <div className="space-y-1.5">
                    <div className="flex justify-between items-center text-[10.5px] font-mono">
                      <span className="text-slate-400 flex items-center space-x-1">
                        <BookOpen className="h-3 w-3 text-indigo-400" />
                        <span>Syllabus Lessons</span>
                      </span>
                      <span className="text-slate-200 font-semibold">{selectedStudent.lessonsCompleted} lessons</span>
                    </div>
                    <div className="h-1.5 bg-slate-950 rounded-full overflow-hidden">
                      <div 
                        className="h-full bg-gradient-to-r from-emerald-500 to-emerald-400 rounded-full" 
                        style={{ width: `${Math.min(100, (selectedStudent.lessonsCompleted / 4) * 100)}%` }} // assume 4 total lessons
                      />
                    </div>
                  </div>

                  {/* Stat 3: Average Exam marks */}
                  <div className="space-y-1.5">
                    <div className="flex justify-between items-center text-[10.5px] font-mono">
                      <span className="text-slate-400 flex items-center space-x-1">
                        <Award className="h-3 w-3 text-indigo-400" />
                        <span>Placement Exam Average</span>
                      </span>
                      <span className="text-slate-200 font-semibold">
                        {selectedStudent.mockScore > 0 ? `${selectedStudent.mockScore}%` : 'Not Completed'}
                      </span>
                    </div>
                    <div className="h-1.5 bg-slate-950 rounded-full overflow-hidden">
                      <div 
                        className="h-full bg-gradient-to-r from-fuchsia-500 to-fuchsia-400 rounded-full" 
                        style={{ width: `${selectedStudent.mockScore}%` }}
                      />
                    </div>
                  </div>

                </div>

                {/* Motivational action button for live user */}
                <div className="pt-2">
                  {selectedStudent.isCurrentUser ? (
                    <button
                      onClick={() => onNavigate('dsa')}
                      className="w-full flex items-center justify-center space-x-1.5 py-2.5 bg-indigo-650 hover:bg-indigo-600 text-white rounded-lg text-xs font-semibold shadow transition"
                    >
                      <span>Challenge Peer Rankings</span>
                      <ChevronRight className="h-3.5 w-3.5" />
                    </button>
                  ) : (
                    <div className="p-3 bg-slate-950/40 border border-slate-850 text-slate-500 rounded-lg text-[10.5px] tracking-tight leading-normal font-mono text-center">
                      Select individual competitors to target your code training. Compare Big-O variables on exercises!
                    </div>
                  )}
                </div>

              </motion.div>
            ) : (
              /* Empty display slot default */
              <div className="border border-slate-850 border-dashed p-8 rounded-xl flex flex-col items-center justify-center text-center space-y-3.5 h-[340px] text-slate-500">
                <div className="p-3 bg-slate-900 rounded-2xl text-slate-600 border border-slate-850">
                  <LayoutGrid className="h-6 w-6 stroke-1" />
                </div>
                <div className="space-y-1 max-w-[200px]">
                  <h4 className="text-[11.5px] font-bold text-slate-400">Interactive Stats Preview</h4>
                  <p className="text-[10.5px] leading-normal text-slate-500">
                    Click on any participant row in the ranking leaderboard to pop up detailed diagnostic study counts.
                  </p>
                </div>
              </div>
            )}
          </AnimatePresence>
        </div>

      </div>

    </div>
  );
}
