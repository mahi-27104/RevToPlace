/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useMemo } from 'react';
import { LayoutGrid, Cpu, CheckCircle, HelpCircle, Activity, Award, Search, Filter, CheckCircle2 } from 'lucide-react';
import { DSAProblem, DatabaseState } from '../types';
import { DSA_PROBLEMS, CATEGORIES } from '../dsaProblemsData';
import Compiler from './Compiler';

interface DSAPracticeViewProps {
  dbState: DatabaseState;
  onSyncDSA: (problemId: string, status: 'solved' | 'attempted', submittedCode: string, language: string, attempts: number) => void;
}

export default function DSAPracticeView({ dbState, onSyncDSA }: DSAPracticeViewProps) {
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [selectedDifficulty, setSelectedDifficulty] = useState<string>('All');
  const [searchQuery, setSearchQuery] = useState<string>('');
  
  // Find first category problem id safely
  const initialProbId = useMemo(() => {
    return DSA_PROBLEMS[0]?.id || '';
  }, []);

  const [selectedProbId, setSelectedProbId] = useState<string>(initialProbId);

  // Filter tasks based on Category, Difficulty and Search queries
  const filteredProblems = useMemo(() => {
    return DSA_PROBLEMS.filter((prob) => {
      const matchesCategory = selectedCategory === 'All' || prob.category === selectedCategory;
      const matchesDifficulty = selectedDifficulty === 'All' || prob.difficulty === selectedDifficulty;
      const matchesSearch = 
        prob.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
        prob.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
        prob.category.toLowerCase().includes(searchQuery.toLowerCase());
      return matchesCategory && matchesDifficulty && matchesSearch;
    });
  }, [selectedCategory, selectedDifficulty, searchQuery]);

  // Ensure selected ID falls back correctly
  const activeProblem = useMemo(() => {
    const found = filteredProblems.find(p => p.id === selectedProbId);
    if (found) return found;
    return filteredProblems[0] || DSA_PROBLEMS[0];
  }, [filteredProblems, selectedProbId]);

  const problemMeta = dbState.dsa[activeProblem.id];
  const isSolved = problemMeta?.status === 'solved';

  const handleCompilerSuccess = (code: string) => {
    const attempts = (problemMeta?.attemptsCount || 0) + 1;
    onSyncDSA(activeProblem.id, 'solved', code, activeProblem.language, attempts);
  };

  // Syllabus tracker calculations
  const totalCount = DSA_PROBLEMS.length;
  const solvedCount = useMemo(() => {
    return DSA_PROBLEMS.filter(p => dbState.dsa[p.id]?.status === 'solved').length;
  }, [dbState.dsa]);

  const attemptedCount = useMemo(() => {
    return DSA_PROBLEMS.filter(p => dbState.dsa[p.id]?.status === 'attempted' && dbState.dsa[p.id]?.status !== 'solved').length;
  }, [dbState.dsa]);

  const syllabusPercentage = totalCount === 0 ? 0 : Math.round((solvedCount / totalCount) * 100);

  // Get problem count & solved ratio for each category
  const categoryStats = useMemo(() => {
    const stats: Record<string, { total: number; solved: number }> = {};
    CATEGORIES.forEach((cat) => {
      const catProblems = DSA_PROBLEMS.filter(p => p.category === cat);
      const solvedInCat = catProblems.filter(p => dbState.dsa[p.id]?.status === 'solved').length;
      stats[cat] = {
        total: catProblems.length,
        solved: solvedInCat
      };
    });
    return stats;
  }, [dbState.dsa]);

  return (
    <div className="grid grid-cols-1 xl:grid-cols-4 gap-8 min-h-[750px] animate-fade-in">
      
      {/* Search and List Side rail */}
      <div className="xl:col-span-1 space-y-5">
        <div className="bg-slate-900/60 border border-slate-800 rounded-xl p-4 space-y-4">
          <div>
            <h3 className="text-sm font-bold text-slate-200">Algorithmic Tasks ({filteredProblems.length})</h3>
            <p className="text-slate-500 text-[11px] mt-0.5">Prepare with 78 PDF syllabus problems from scratch</p>
          </div>

          {/* Search Bar Input */}
          <div className="relative">
            <Search className="absolute left-3 top-2.5 h-3.5 w-3.5 text-slate-500" />
            <input
              type="text"
              placeholder="Search PDF tasks..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-3 py-1.5 bg-slate-950 border border-slate-800 rounded-lg text-xs text-slate-300 placeholder-slate-650 outline-none focus:border-emerald-500/50 transition font-sans"
            />
          </div>

          {/* Category Dropdown Selector */}
          <div className="space-y-1">
            <label className="text-[10px] uppercase font-bold tracking-wider text-slate-500">Category Section</label>
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="w-full bg-slate-950 border border-slate-800 rounded-lg text-xs text-slate-300 p-2 outline-none focus:border-emerald-500/50 transition"
            >
              <option value="All">All Categories ({totalCount} problems)</option>
              {CATEGORIES.map((cat) => {
                const stat = categoryStats[cat];
                return (
                  <option key={cat} value={cat}>
                    {cat} ({stat ? `${stat.solved}/${stat.total}` : cat})
                  </option>
                );
              })}
            </select>
          </div>

          {/* Difficulty Filter Tabs */}
          <div className="flex items-center space-x-1.5 py-1 justify-between">
            {['All', 'Easy', 'Medium', 'Hard'].map((diff) => (
              <button
                key={diff}
                onClick={() => setSelectedDifficulty(diff)}
                className={`flex-1 text-[10px] font-semibold py-1 rounded transition border ${
                  selectedDifficulty === diff
                    ? 'bg-emerald-600/10 border-emerald-500 text-emerald-400'
                    : 'bg-slate-950 border-slate-850 text-slate-400 hover:text-slate-200 hover:border-slate-700'
                }`}
              >
                {diff}
              </button>
            ))}
          </div>

          {/* Filtered Problem Selectable Cards */}
          <div className="space-y-2 max-h-[380px] overflow-y-auto pr-1 scrollbar-thin scrollbar-thumb-slate-800 scrollbar-track-transparent">
            {filteredProblems.length === 0 ? (
              <div className="text-center py-8 text-xs text-slate-600">
                No matching tasks found.
              </div>
            ) : (
              filteredProblems.map((prob) => {
                const solved = dbState.dsa[prob.id]?.status === 'solved';
                const attempted = dbState.dsa[prob.id]?.status === 'attempted';
                const active = prob.id === activeProblem.id;

                const badgeColors = {
                  Easy: 'text-emerald-400 bg-emerald-500/10 border-emerald-500/20',
                  Medium: 'text-amber-400 bg-amber-500/10 border-amber-500/20',
                  Hard: 'text-red-400 bg-red-400/10 border-red-500/20'
                }[prob.difficulty];

                return (
                  <button
                    key={prob.id}
                    onClick={() => setSelectedProbId(prob.id)}
                    id={`dsa-tab-${prob.id}`}
                    className={`w-full flex items-center justify-between p-3 rounded-lg text-left border transition ${
                      active 
                        ? 'bg-slate-950 border-emerald-500/40 text-emerald-400' 
                        : 'bg-slate-900/40 border-slate-850 text-slate-450 hover:border-slate-800'
                    }`}
                  >
                    <div className="space-y-1 pr-2 overflow-hidden">
                      <div className="flex items-center space-x-1.5">
                        <span className={`px-1.5 py-0.2 rounded text-[8px] font-extrabold border ${badgeColors}`}>
                          {prob.difficulty}
                        </span>
                        <span className="text-[9px] text-slate-500 font-mono">
                          #{prob.id.split('-')[1]}
                        </span>
                      </div>
                      <h4 className={`text-xs font-semibold truncate ${active ? 'text-white' : 'text-slate-300'}`}>
                        {prob.title}
                      </h4>
                      <span className="text-[9px] text-slate-500 block truncate capitalize">
                        {prob.category} • {prob.language}
                      </span>
                    </div>

                    <div className="flex-shrink-0">
                      {solved ? (
                        <div className="h-4.5 w-4.5 rounded-full bg-emerald-500/10 flex items-center justify-center text-emerald-400 border border-emerald-500/20">
                          <CheckCircle className="h-2.5 w-2.5 fill-emerald-500/10" />
                        </div>
                      ) : attempted ? (
                        <span className="text-[8px] font-mono text-amber-500 bg-amber-500/10 p-0.5 px-1 rounded border border-amber-500/20">Tent</span>
                      ) : (
                        <HelpCircle className="h-3.5 w-3.5 text-slate-700" />
                      )}
                    </div>
                  </button>
                );
              })
            )}
          </div>
        </div>

        {/* DSA Status tracker panel */}
        <div className="bg-slate-900/60 border border-slate-800 rounded-xl p-4 space-y-3.5">
          <div className="flex items-center justify-between">
            <h4 className="text-xs font-bold text-slate-300">Class Board Progress</h4>
            <span className="text-[10px] font-mono text-emerald-400 font-bold">{syllabusPercentage}% Done</span>
          </div>

          <div className="space-y-2">
            {/* Progress bar */}
            <div className="w-full bg-slate-950 rounded-full h-1.5 overflow-hidden">
              <div 
                className="bg-emerald-500 h-1.5 rounded-full transition-all duration-300"
                style={{ width: `${syllabusPercentage}%` }}
              />
            </div>

            <div className="flex items-center justify-between text-[11px] font-mono text-slate-550 pt-1">
              <span>Solved: {solvedCount}/{totalCount}</span>
              <span>Attempted: {attemptedCount}</span>
            </div>

            <div className="p-3 bg-slate-950 rounded-lg text-[10.5px] text-slate-450 leading-relaxed flex items-start space-x-2 border border-slate-850">
              <Activity className="h-3.5 w-3.5 text-emerald-400 mt-0.5 flex-shrink-0" />
              <span>Submit checks compile output automatically. Dynamic driver tests output matching validation!</span>
            </div>
          </div>
        </div>
      </div>

      {/* Main Coding Area */}
      <div className="xl:col-span-3 grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch">
        
        {/* Challenge specifications panel */}
        <div className="lg:col-span-4 flex flex-col bg-slate-900/40 border border-slate-800 rounded-2xl p-5 sm:p-6 overflow-y-auto max-h-[750px] space-y-4">
          <div className="border-b border-slate-800 pb-4">
            <div className="flex items-center justify-between">
              <span className="text-[9.5px] font-mono font-bold text-emerald-400 uppercase tracking-widest">Active PDF Task</span>
              <span className="text-[10px] font-mono text-slate-500">Problem #{activeProblem.id.split('-')[1]} of {totalCount}</span>
            </div>
            <h2 className="text-base font-bold text-white mt-1.5 leading-snug">{activeProblem.title}</h2>
            <div className="flex items-center space-x-2 mt-2">
              <span className={`inline-flex px-2 py-0.5 rounded-full text-[9px] font-bold border ${
                activeProblem.difficulty === 'Easy' 
                  ? 'text-emerald-400 bg-emerald-500/10 border-emerald-500/20' 
                  : activeProblem.difficulty === 'Medium' 
                    ? 'text-amber-400 bg-amber-500/10 border-amber-500/20' 
                    : 'text-red-400 bg-red-500/10 border-red-500/20'
              }`}>
                {activeProblem.difficulty}
              </span>
              <span className="text-xs text-slate-500">•</span>
              <span className="text-xs text-slate-400 font-medium capitalize">{activeProblem.category}</span>
            </div>
          </div>

          {/* Description layout */}
          <div className="flex-1 text-slate-300 text-xs leading-normal space-y-3 pt-1">
            <p className="text-slate-300 text-[11.5px] leading-relaxed font-sans">{activeProblem.description}</p>
            
            <div className="p-4 bg-slate-950 border border-slate-850 rounded-xl space-y-2.5 mt-4 text-[11px]">
              <span className="font-bold text-emerald-400 text-xs block border-b border-slate-900 pb-1.5">Expected Test Cases</span>
              {activeProblem.testCases.map((tc, ix) => (
                <div key={ix} className="space-y-1 leading-normal font-mono text-[10px]">
                  <div className="flex justify-between items-center bg-slate-900/40 p-1 px-1.5 rounded">
                    <span className="text-slate-500">Input parameter:</span>
                    <span className="text-slate-350">{tc.input}</span>
                  </div>
                  <div className="flex justify-between items-center p-1 px-1.5">
                    <span className="text-slate-500">Expected stdout:</span>
                    <span className="text-emerald-400 font-bold">{tc.expected}</span>
                  </div>
                </div>
              ))}
            </div>

            <div className="p-3 bg-indigo-950/20 border border-indigo-950/40 rounded-xl text-[10.5px] text-indigo-300 leading-relaxed space-y-1">
              <span className="font-semibold text-indigo-400 block pb-0.5 font-sans"> Tutors Tip:</span>
              <p className="font-sans leading-normal">Your code includes an invocation driver call at the bottom. Complete the function, ensure it prints the result, and click Run or Submit to verify!</p>
            </div>
          </div>

          <div className="pt-4 border-t border-slate-800 flex items-center justify-between text-[10px] text-slate-550 font-mono">
            <span>Runtime: {activeProblem.language.toUpperCase()} environment</span>
            {isSolved && (
              <span className="flex items-center space-x-1 font-bold text-emerald-400 bg-emerald-500/10 p-1 px-2 rounded-full border border-emerald-500/20 animate-pulse">
                <Award className="h-3 w-3" />
                <span>Verified</span>
              </span>
            )}
          </div>
        </div>

        {/* Live IDE Section */}
        <div className="lg:col-span-8 flex flex-col h-full">
          <Compiler
            key={activeProblem.id}
            initialLanguage={activeProblem.language}
            initialCode={activeProblem.starterCode}
            expectedOutput={activeProblem.testCases[0].expected}
            onSuccess={handleCompilerSuccess}
          />
        </div>

      </div>

    </div>
  );
}
