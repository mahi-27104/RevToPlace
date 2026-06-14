/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useMemo } from 'react';
import { 
  BookOpen, 
  CheckCircle2, 
  ChevronRight, 
  Award, 
  Lock, 
  HelpCircle, 
  Trophy, 
  RefreshCw, 
  AlertTriangle, 
  Check, 
  X,
  FileCode,
  Flame,
  Play
} from 'lucide-react';
import { Course, DatabaseState, Topic } from '../types';
import { COURSES } from '../mockData';
import Compiler from './Compiler';

interface CourseHubViewProps {
  dbState: DatabaseState;
  onSyncProgress: (courseId: string, completedLessons: string[], progressPercent: number) => void;
}

export default function CourseHubView({ dbState, onSyncProgress }: CourseHubViewProps) {
  // Course Selector
  const [selectedCourseId, setSelectedCourseId] = useState<string>(COURSES[0].id);

  // Active Course Reference
  const activeCourse = useMemo(() => {
    return COURSES.find(c => c.id === selectedCourseId) || COURSES[0];
  }, [selectedCourseId]);

  // Flattened Topics for sequential index tracking
  const allTopics = useMemo(() => {
    const list: Topic[] = [];
    activeCourse.sections?.forEach(sec => {
      sec.topics.forEach(topic => {
        list.push(topic as Topic);
      });
    });
    // Fallback if course didn't have sections
    if (list.length === 0) {
      activeCourse.lessons.forEach(l => {
        list.push({
          topic_id: l.id,
          title: l.title,
          description: l.description,
          content: l.content,
          starterCode: l.starterCode,
          solution: l.solution,
          expectedOutput: l.expectedOutput,
          quiz: []
        });
      });
    }
    return list;
  }, [activeCourse]);

  // Current Active Topic ID state
  const [activeTopicId, setActiveTopicId] = useState<string>('');

  // Derived currentTopic ID
  const currentTopicId = useMemo(() => {
    if (activeTopicId && allTopics.some(t => t.topic_id === activeTopicId)) {
      return activeTopicId;
    }
    return allTopics[0]?.topic_id || '';
  }, [activeTopicId, allTopics]);

  // Active Topic object
  const activeTopic = useMemo(() => {
    return allTopics.find(t => t.topic_id === currentTopicId) || allTopics[0];
  }, [currentTopicId, allTopics]);

  // List of completed lessons/topics from database states
  const completedLessonIds = useMemo(() => {
    return dbState.courses[selectedCourseId] || [];
  }, [dbState, selectedCourseId]);

  const isTopicCompleted = (topicId: string) => completedLessonIds.includes(topicId);

  // Check if topic is unlocked (Idx 0 is always unlocked, others are unlocked if previous is completed)
  const isTopicUnlocked = (topicId: string) => {
    const idx = allTopics.findIndex(t => t.topic_id === topicId);
    if (idx <= 0) return true;
    const prevTopic = allTopics[idx - 1];
    return isTopicCompleted(prevTopic.topic_id);
  };

  // Local state tracking for compiler success
  const [compilerPassed, setCompilerPassed] = useState<boolean>(false);

  // Quiz Engine States
  const [quizStarted, setQuizStarted] = useState<boolean>(false);
  const [currentQuestionIdx, setCurrentQuestionIdx] = useState<number>(0);
  const [selectedOption, setSelectedOption] = useState<string>('');
  const [quizAnswers, setQuizAnswers] = useState<string[]>([]); // indexes correspond to quiz questions
  const [quizSubmitted, setQuizSubmitted] = useState<boolean>(false);
  const [quizScore, setQuizScore] = useState<number>(0);
  const [quizPassed, setQuizPassed] = useState<boolean>(false);
  const [errorToast, setErrorToast] = useState<string | null>(null);

  // Reset progress and states on changing Active Topic
  useEffect(() => {
    setCompilerPassed(false);
    setQuizStarted(false);
    setCurrentQuestionIdx(0);
    setSelectedOption('');
    setQuizAnswers([]);
    setQuizSubmitted(false);
    setQuizScore(0);
    setQuizPassed(false);
    setErrorToast(null);
  }, [currentTopicId, selectedCourseId]);

  // Guard: Automatically redirect to first unlocked if active gets locked
  useEffect(() => {
    if (allTopics.length > 0 && !isTopicUnlocked(currentTopicId)) {
      // Find the first locked topic, and set to previous
      const firstLockedIdx = allTopics.findIndex(t => !isTopicUnlocked(t.topic_id));
      if (firstLockedIdx > 0) {
        setActiveTopicId(allTopics[firstLockedIdx - 1].topic_id);
      } else {
        setActiveTopicId(allTopics[0].topic_id);
      }
    }
  }, [selectedCourseId, completedLessonIds]);

  // Compiler success trigger
  const handleCompilerSuccess = (submittedCode: string) => {
    setCompilerPassed(true);
  };

  // Skip compiler if there's no code starter, or if already completed
  const needsCompiler = !!activeTopic?.starterCode;
  const isCompilerSatisfied = !needsCompiler || compilerPassed || isTopicCompleted(activeTopic?.topic_id);

  // Quiz questions for current active topic
  const activeQuiz = useMemo(() => {
    return activeTopic?.quiz || [];
  }, [activeTopic]);

  // Quiz completion status
  const handleOptionSelect = (option: string) => {
    if (quizSubmitted) return;
    setSelectedOption(option);
  };

  const handleNextQuestion = () => {
    if (!selectedOption) {
      setErrorToast("Please select an option before proceeding.");
      return;
    }
    setErrorToast(null);
    const updatedAnswers = [...quizAnswers];
    updatedAnswers[currentQuestionIdx] = selectedOption;
    setQuizAnswers(updatedAnswers);

    if (currentQuestionIdx < activeQuiz.length - 1) {
      setCurrentQuestionIdx(prev => prev + 1);
      // If already answered before, restore selection, else clear
      setSelectedOption(updatedAnswers[currentQuestionIdx + 1] || '');
    } else {
      // Last question completed, now evaluate score!
      let scoreCount = 0;
      activeQuiz.forEach((qObj, idx) => {
        if (updatedAnswers[idx] === qObj.answer) {
          scoreCount++;
        }
      });

      const thresholdScore = Math.ceil(activeQuiz.length * 0.8); // 80% passing rule
      const hasPassed = scoreCount >= thresholdScore;

      setQuizScore(scoreCount);
      setQuizPassed(hasPassed);
      setQuizSubmitted(true);

      if (hasPassed && !isTopicCompleted(activeTopic.topic_id)) {
        // Topic fully completed! Save block in database state
        const updatedCompletedList = [...completedLessonIds, activeTopic.topic_id];
        
        // Calculate Section-wise Progress Percent
        const completedSections = activeCourse.sections?.filter(sec => 
          sec.topics.every(t => updatedCompletedList.includes(t.topic_id))
        ) || [];
        const totalSectionsCount = activeCourse.sections?.length || 1;
        const progressPercent = Math.round((completedSections.length / totalSectionsCount) * 100);

        onSyncProgress(selectedCourseId, updatedCompletedList, progressPercent);
      }
    }
  };

  const startQuizEngine = () => {
    setQuizStarted(true);
    setCurrentQuestionIdx(0);
    setSelectedOption('');
    setQuizAnswers([]);
    setQuizSubmitted(false);
    setQuizScore(0);
    setQuizPassed(false);
    setErrorToast(null);
  };

  const handleProceedToNext = () => {
    const currentIdx = allTopics.findIndex(t => t.topic_id === currentTopicId);
    if (currentIdx !== -1 && currentIdx < allTopics.length - 1) {
      const nextTopic = allTopics[currentIdx + 1];
      setActiveTopicId(nextTopic.topic_id);
    }
  };

  // Section level metadata metrics for Sidebar/roadmap presentation
  const sectionsProgress = useMemo(() => {
    if (!activeCourse.sections) return [];
    return activeCourse.sections.map(sec => {
      const totalTopics = sec.topics.length;
      const completedTopics = sec.topics.filter(t => completedLessonIds.includes(t.topic_id)).length;
      const percent = Math.round((completedTopics / totalTopics) * 100);
      return {
        name: sec.section_name,
        done: completedTopics,
        total: totalTopics,
        percent
      };
    });
  }, [activeCourse, completedLessonIds]);

  const courseOverallSectionPercent = useMemo(() => {
    if (!sectionsProgress.length) return 0;
    const completedSecs = sectionsProgress.filter(s => s.percent === 100).length;
    return Math.round((completedSecs / sectionsProgress.length) * 100);
  }, [sectionsProgress]);

  return (
    <div className="grid grid-cols-1 xl:grid-cols-4 gap-8 h-full min-h-[750px] animate-fade-in text-white font-sans">
      
      {/* COLUMN 1: LEFT NAVIGATION RAIL (Sections & Topics Grouped) */}
      <div className="xl:col-span-1 space-y-6">
        
        {/* Curriculums Selector */}
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-3.5 space-y-2 shadow-xl">
          <span className="text-[10px] font-bold text-indigo-400 uppercase tracking-widest px-2 block">Curriculum Path</span>
          <div className="flex flex-col space-y-1">
            {COURSES.map(course => {
              const active = course.id === selectedCourseId;
              
              // Calculate Completed sections
              const currentCourseSecs = course.sections || [];
              const currentCompletedTopics = dbState.courses[course.id] || [];
              const completedSecsCount = currentCourseSecs.filter(sec => 
                sec.topics.every(t => currentCompletedTopics.includes(t.topic_id))
              ).length;
              const totalSecsCount = currentCourseSecs.length || 1;
              const pathSectionPercent = Math.round((completedSecsCount / totalSecsCount) * 100);

              return (
                <button
                  key={course.id}
                  onClick={() => {
                    setSelectedCourseId(course.id);
                    setActiveTopicId('');
                  }}
                  id={`course-tab-${course.id}`}
                  className={`w-full flex items-center justify-between p-3 rounded-lg text-left transition duration-200 ${
                    active 
                      ? 'bg-indigo-600 text-white font-bold shadow-lg shadow-indigo-600/10' 
                      : 'bg-transparent text-slate-300 hover:bg-slate-800/50 hover:text-white'
                  }`}
                >
                  <div className="flex items-center space-x-2.5">
                    <BookOpen className="h-4 w-4 flex-shrink-0" />
                    <span className="text-xs uppercase tracking-wide capitalize">{course.language} Sandbox</span>
                  </div>
                  <span className="text-[10px] font-bold font-mono px-2 py-0.5 rounded bg-slate-950/40 text-slate-300">
                    {pathSectionPercent}% Section Progress
                  </span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Upgraded Syllabus Chapter syllabus grouped by Sections */}
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 space-y-4 shadow-xl">
          <div>
            <h3 className="text-sm font-bold text-slate-200">Modular Path</h3>
            <p className="text-slate-500 text-[11px] mt-0.5">Sections inside {activeCourse.title}</p>
          </div>

          <div className="space-y-4 max-h-[500px] overflow-y-auto pr-1">
            {activeCourse.sections?.map((section, sIdx) => {
              const secCompleted = section.topics.every(t => completedLessonIds.includes(t.topic_id));
              
              return (
                <div key={section.section_name} className="space-y-1.5 border-l-2 border-slate-800 pl-3 ml-2">
                  <div className="flex items-center justify-between mb-2">
                    <h4 className="text-[10.5px] font-bold text-indigo-400 uppercase tracking-widest">
                      {section.section_name}
                    </h4>
                    {secCompleted && (
                      <span className="text-[9px] bg-emerald-500/10 text-emerald-400 font-bold px-1.5 py-0.5 rounded border border-emerald-500/20">
                        100% Passed
                      </span>
                    )}
                  </div>

                  <div className="space-y-1.5">
                    {section.topics.map((t) => {
                      const isSelected = t.topic_id === currentTopicId;
                      const isDone = isTopicCompleted(t.topic_id);
                      const isUnlocked = isTopicUnlocked(t.topic_id);

                      return (
                        <button
                          key={t.topic_id}
                          disabled={!isUnlocked}
                          onClick={() => setActiveTopicId(t.topic_id)}
                          id={`topic-selector-${t.topic_id}`}
                          className={`w-full flex items-start space-x-2.5 p-2.5 rounded-lg text-left border transition duration-200 ${
                            isSelected 
                              ? 'bg-slate-950 border-indigo-500/50 text-indigo-400 shadow-inner' 
                              : isUnlocked
                                ? 'bg-slate-950/20 border-slate-900 text-slate-300 hover:border-slate-800 hover:text-white'
                                : 'bg-slate-950/10 border-transparent text-slate-600 cursor-not-allowed opacity-60'
                          }`}
                        >
                          <div className="mt-0.5 flex-shrink-0">
                            {isDone ? (
                              <CheckCircle2 className="h-3.5 w-3.5 text-emerald-500 fill-emerald-500/10" />
                            ) : !isUnlocked ? (
                              <Lock className="h-3.5 w-3.5 text-slate-700" />
                            ) : (
                              <div className={`h-3.5 w-3.5 rounded-full border flex items-center justify-center text-[8.5px] font-mono ${
                                isSelected ? 'border-indigo-400 font-bold' : 'border-slate-700'
                              }`}>
                                •
                              </div>
                            )}
                          </div>
                          <div className="flex-1 space-y-0.5">
                            <h5 className={`text-[11.5px] font-semibold tracking-wide ${isSelected ? 'text-white' : 'text-slate-300'}`}>
                              {t.title}
                            </h5>
                            <p className="text-[9.5px] text-slate-500 line-clamp-1">{t.description}</p>
                          </div>
                        </button>
                      );
                    })}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

      </div>

      {/* ADAPTIVE WORKSPACE VIEWER (3 Columns split into Concept/Sandbox on left, Progress/NextStep on right) */}
      <div className="xl:col-span-3 grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch">
        
        {/* LEFT COLUMN (lg:col-span-7 or 8): Concept Material & Sandbox Compiler */}
        <div className="lg:col-span-7 flex flex-col bg-slate-900/40 border border-slate-800 rounded-2xl p-5 sm:p-6 overflow-hidden max-h-[850px] shadow-2xl">
          <div className="flex items-center justify-between border-b border-slate-800 pb-4 mb-4">
            <div>
              <span className="text-[9.5px] font-bold text-indigo-400 uppercase tracking-widest">{activeCourse.language} path • structural concept</span>
              <h2 className="text-base font-bold text-white leading-snug mt-1">{activeTopic?.title}</h2>
            </div>
            {isTopicCompleted(activeTopic?.topic_id) && (
              <span className="flex items-center space-x-1.5 px-3 py-1 rounded-full text-[10px] font-bold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 shadow-sm shadow-emerald-500/5">
                <Award className="h-3.5 w-3.5" />
                <span>Passed & Certified</span>
              </span>
            )}
          </div>

          {/* Scrollable learning concepts and exercises */}
          <div className="flex-1 overflow-y-auto space-y-5 text-slate-300 text-xs leading-relaxed pr-2">
            
            {/* Render topic concept markdown */}
            <div className="space-y-3.5">
              {activeTopic?.content.split('\n').map((line, ix) => {
                if (line.startsWith('###')) {
                  return <h3 key={ix} className="text-xs font-bold text-white border-b border-slate-800/60 pb-1.5 pt-2 tracking-wide uppercase">{line.replace('###', '')}</h3>;
                }
                if (line.startsWith('1.') || line.startsWith('2.') || line.startsWith('3.')) {
                  return (
                    <div key={ix} className="flex items-start space-x-2 pl-2">
                      <span className="text-indigo-400 font-mono text-xs font-bold">•</span>
                      <p className="text-slate-300 text-[11px]">{line.substring(2)}</p>
                    </div>
                  );
                }
                if (line.startsWith('**Exercise:**')) {
                  return (
                    <div key={ix} className="p-4 bg-indigo-950/20 border border-indigo-900/30 rounded-xl space-y-1.5 my-3 shadow-inner">
                      <div className="flex items-center space-x-2">
                        <FileCode className="h-3.5 w-3.5 text-indigo-400" />
                        <h4 className="font-bold text-indigo-400 text-xs">Sandbox Practical Exercise:</h4>
                      </div>
                      <p className="text-slate-300 text-[11px] leading-relaxed pl-1.5">{line.replace('**Exercise:**', '')}</p>
                    </div>
                  );
                }
                if (line.startsWith('*Tip:*')) {
                  return (
                    <p key={ix} className="text-[10px] text-indigo-400 italic bg-indigo-500/5 p-2.5 rounded-lg pl-3 border-l-2 border-indigo-500">
                      {line.replace('*Tip:*', '')}
                    </p>
                  );
                }
                if (line.trim().length === 0) return null;
                return <p key={ix} className="text-slate-300 text-[11.5px] leading-relaxed">{line}</p>;
              })}
            </div>

            {/* Embedded interactive sandbox compiler */}
            {needsCompiler && (
              <div className="pt-4 border-t border-slate-800/80 space-y-3">
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Interactive Code Workspace</span>
                <div className="h-[400px] rounded-xl overflow-hidden shadow-2xl border border-slate-800">
                  <Compiler
                    key={`${selectedCourseId}-${currentTopicId}`}
                    initialLanguage={activeCourse.language}
                    initialCode={activeTopic.starterCode || ''}
                    expectedOutput={activeTopic.expectedOutput || ''}
                    onSuccess={handleCompilerSuccess}
                  />
                </div>
              </div>
            )}
          </div>
        </div>

        {/* RIGHT COLUMN (lg:col-span-5): Progress Tracking & Quiz Engine Component */}
        <div className="lg:col-span-5 flex flex-col bg-slate-900/80 border border-slate-800 rounded-2xl p-5 sm:p-6 justify-between overflow-y-auto max-h-[850px] shadow-2xl">
          <div className="space-y-6">
            
            {/* 1. Header roadmap */}
            <div>
              <span className="text-[9px] font-bold text-indigo-400 uppercase tracking-widest block">Study Center</span>
              <h3 className="text-sm font-bold text-slate-200 mt-1">Progress / Next Step</h3>
            </div>

            {/* 2. visual course progress indicators */}
            <div className="bg-slate-950 p-4 rounded-xl border border-slate-850 space-y-3.5 shadow-inner">
              <div className="flex items-center justify-between">
                <span className="text-xs text-slate-400 font-semibold">Course Progress (Sections)</span>
                <span className="text-xs font-bold text-indigo-400">{courseOverallSectionPercent}%</span>
              </div>
              <div className="w-full h-2 bg-slate-900 rounded-full overflow-hidden border border-slate-800">
                <div 
                  className="h-full bg-indigo-500 rounded-full transition-all duration-500 shadow-md shadow-indigo-500/20" 
                  style={{ width: `${courseOverallSectionPercent}%` }} 
                />
              </div>

              {/* Section Breakdown lists */}
              <div className="pt-2 border-t border-slate-900/80 grid grid-cols-1 gap-2">
                {sectionsProgress.map(secPrg => (
                  <div key={secPrg.name} className="flex items-center justify-between text-[10px]">
                    <span className="text-slate-400 capitalize">{secPrg.name}</span>
                    <div className="flex items-center space-x-2">
                      <span className="text-slate-500">[{secPrg.done}/{secPrg.total} topics]</span>
                      <span className={`font-bold ${secPrg.percent === 100 ? 'text-emerald-400' : 'text-indigo-400'}`}>
                        {secPrg.percent}%
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* 3. Steps Checklist */}
            <div className="space-y-2.5">
              <span className="text-[9.5px] font-bold text-slate-400 uppercase tracking-wider block">Topic Learning Gateways</span>
              <div className="space-y-2">
                
                {/* Step 1: Read theory */}
                <div className="flex items-center justify-between p-3 bg-slate-950/40 rounded-lg border border-slate-850/65">
                  <div className="flex items-center space-x-3">
                    <span className="w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-bold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">✓</span>
                    <span className="text-xs text-slate-300 font-medium">1. Read Learning Concept Material</span>
                  </div>
                  <span className="text-[10px] text-emerald-400 font-semibold uppercase">Done</span>
                </div>

                {/* Step 2: Code compiler */}
                {needsCompiler && (
                  <div className={`flex items-center justify-between p-3 rounded-lg border transition duration-200 ${
                    compilerPassed || isTopicCompleted(activeTopic.topic_id)
                      ? 'bg-slate-950/40 border-slate-850'
                      : 'bg-indigo-950/10 border-indigo-900/30'
                  }`}>
                    <div className="flex items-center space-x-3">
                      {compilerPassed || isTopicCompleted(activeTopic.topic_id) ? (
                        <span className="w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-bold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">✓</span>
                      ) : (
                        <span className="w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-bold bg-indigo-500/15 text-indigo-400 border border-indigo-500/30 animate-pulse">•</span>
                      )}
                      <span className="text-xs text-slate-300 font-medium">2. Execute Code Compiler Sandbox</span>
                    </div>
                    <span className={`text-[10.5px] font-semibold uppercase ${
                      compilerPassed || isTopicCompleted(activeTopic.topic_id)
                        ? 'text-emerald-400'
                        : 'text-indigo-400'
                    }`}>
                      {compilerPassed || isTopicCompleted(activeTopic.topic_id) ? 'Passed' : 'Pending Compile'}
                    </span>
                  </div>
                )}

                {/* Step 3: Pass Topic Quiz */}
                <div className={`p-3 rounded-lg border flex items-center justify-between transition duration-200 ${
                  isTopicCompleted(activeTopic.topic_id)
                    ? 'bg-slate-950/40 border-slate-850'
                    : isCompilerSatisfied
                      ? 'bg-indigo-600/10 border-indigo-500/40'
                      : 'bg-slate-950/10 border-transparent text-slate-600'
                }`}>
                  <div className="flex items-center space-x-3">
                    {isTopicCompleted(activeTopic.topic_id) ? (
                      <span className="w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-bold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">✓</span>
                    ) : (
                      <span className="w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-bold bg-slate-900 text-slate-500 border border-slate-800">3</span>
                    )}
                    <span className={`text-xs font-medium ${isCompilerSatisfied ? 'text-slate-300' : 'text-slate-500'}`}>
                      3. Pass Topic Quiz (Min 80% mark)
                    </span>
                  </div>
                  <span className={`text-[10px] font-semibold uppercase ${
                    isTopicCompleted(activeTopic.topic_id)
                      ? 'text-emerald-400'
                      : isCompilerSatisfied
                        ? 'text-indigo-400 animate-pulse'
                        : 'text-slate-650'
                  }`}>
                    {isTopicCompleted(activeTopic.topic_id) ? 'Passed' : 'Required'}
                  </span>
                </div>

              </div>
            </div>

            {/* 4. QUIZ ENGINE DISPLAY SECTION */}
            {activeQuiz.length > 0 && isCompilerSatisfied && (
              <div className="pt-4 border-t border-slate-800/80 space-y-4">
                
                {/* State A: Quiz NOT started */}
                {!quizStarted && !quizSubmitted && (
                  <div className="space-y-3 mr-0">
                    <div className="p-3.5 bg-indigo-950/30 border border-indigo-900/20 rounded-xl space-y-1.5 text-left">
                      <h4 className="text-[11.5px] font-bold text-indigo-400 flex items-center space-x-1.5">
                        <HelpCircle className="h-3.5 w-3.5" />
                        <span>Topic Quiz is Unlocked!</span>
                      </h4>
                      <p className="text-[10px] text-slate-400 leading-relaxed">
                        Test your practical knowledge with a dynamic <strong>5-question multiple choice quiz</strong>. You must get an 80% passing grade (at least 4 correct) to earn completion.
                      </p>
                    </div>

                    <button
                      onClick={startQuizEngine}
                      className="w-full py-3 bg-indigo-600 hover:bg-indigo-505 text-white font-bold leading-normal transition-all duration-150 rounded-xl shadow-lg hover:shadow-indigo-600/10 text-xs flex items-center justify-center space-x-2 cursor-pointer"
                    >
                      <Play className="h-3.5 w-3.5 fill-white" />
                      <span>Start Topic Quiz (5 Questions)</span>
                    </button>
                  </div>
                )}

                {/* State B: Quiz actively running */}
                {quizStarted && !quizSubmitted && (
                  <div className="p-4 bg-slate-950 border border-slate-850 rounded-xl space-y-4 shadow-inner text-left">
                    <div className="flex items-center justify-between border-b border-slate-900 pb-2.5">
                      <span className="text-[9px] font-bold text-slate-500 uppercase">Question {currentQuestionIdx + 1} of {activeQuiz.length}</span>
                      <span className="text-[9px] bg-indigo-500/10 text-indigo-400 font-mono px-2 py-0.5 rounded font-bold">Passing: 80%</span>
                    </div>

                    <div className="space-y-4">
                      <p className="text-slate-200 text-xs font-semibold leading-relaxed">
                        {activeQuiz[currentQuestionIdx]?.q}
                      </p>

                      <div className="grid grid-cols-1 gap-2">
                        {activeQuiz[currentQuestionIdx]?.options.map((opt, oIdx) => {
                          const isPicked = selectedOption === opt;
                          return (
                            <button
                              key={oIdx}
                              onClick={() => handleOptionSelect(opt)}
                              className={`w-full flex items-center justify-between p-3 rounded-lg text-left text-xs border transition duration-150 ${
                                isPicked
                                  ? 'bg-indigo-600/10 border-indigo-500 text-indigo-300 font-semibold'
                                  : 'bg-slate-900/60 border-slate-800/80 text-slate-400 hover:bg-slate-900 hover:text-slate-200'
                              }`}
                            >
                              <span>{opt}</span>
                              <div className={`w-3.5 h-3.5 rounded-full border flex items-center justify-center flex-shrink-0 ml-2 ${
                                isPicked ? 'border-indigo-400 bg-indigo-500' : 'border-slate-700'
                              }`}>
                                {isPicked && <span className="text-[8px] text-white">✓</span>}
                              </div>
                            </button>
                          );
                        })}
                      </div>
                    </div>

                    {errorToast && (
                      <p className="text-[10px] text-red-400 font-semibold flex items-center space-x-1">
                        <AlertTriangle className="h-3 w-3" />
                        <span>{errorToast}</span>
                      </p>
                    )}

                    <button
                      onClick={handleNextQuestion}
                      className="w-full py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg text-xs font-bold leading-normal transition shadow cursor-pointer text-center"
                    >
                      {currentQuestionIdx < activeQuiz.length - 1 ? 'Save & Next' : 'Submit Quiz Answers'}
                    </button>
                  </div>
                )}

                {/* State C: Quiz finished (Score results displayed) */}
                {quizSubmitted && (
                  <div className="p-4 bg-slate-950 border border-slate-850 rounded-xl space-y-4 shadow-inner text-left">
                    <div className="flex flex-col items-center text-center space-y-2 py-2">
                      {quizPassed ? (
                        <div className="p-3 bg-emerald-500/10 border border-emerald-500/25 rounded-full text-emerald-400">
                          <Trophy className="h-8 w-8 animate-bounce" />
                        </div>
                      ) : (
                        <div className="p-3 bg-red-500/10 border border-red-500/25 rounded-full text-red-400">
                          <AlertTriangle className="h-8 w-8 animate-pulse" />
                        </div>
                      )}
                      
                      <h4 className={`text-base font-bold ${quizPassed ? 'text-emerald-400' : 'text-red-400'}`}>
                        {quizPassed ? 'Congratulations! You Passed' : 'Quiz Failed'}
                      </h4>

                      <div className="text-slate-300 space-y-1">
                        <p className="text-xs">
                          You scored <span className="font-bold text-white">{quizScore} out of {activeQuiz.length}</span> correct.
                        </p>
                        <p className="text-[11px] text-slate-500 leading-normal">
                          {quizPassed 
                            ? 'Excellent execution! This topic has been checked off and synchronized.' 
                            : 'Minimum passing mark is 80% (4/5 questions). Please review the content on the left pane and try again!'
                          }
                        </p>
                      </div>
                    </div>

                    {/* Correction details if failed or passed */}
                    <div className="border-t border-slate-900 pt-3 space-y-2.5">
                      <span className="text-[9px] font-bold text-slate-500 uppercase block">Review Correction Guide:</span>
                      <div className="space-y-2 max-h-[150px] overflow-y-auto pr-1">
                        {activeQuiz.map((qObj, idx) => {
                          const ansIsCorrect = quizAnswers[idx] === qObj.answer;
                          return (
                            <div key={idx} className="p-2 rounded bg-slate-900 border border-slate-850/40 text-[10.5px] space-y-1">
                              <p className="text-slate-300 font-medium">Q: {qObj.q}</p>
                              <div className="flex flex-col space-y-0.5 font-mono text-[9.5px]">
                                <span className={ansIsCorrect ? 'text-emerald-400' : 'text-red-400'}>
                                  Your selection: {quizAnswers[idx]}
                                </span>
                                {!ansIsCorrect && (
                                  <span className="text-emerald-400">
                                    Correct answer: {qObj.answer}
                                  </span>
                                )}
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </div>

                    <div className="flex items-center space-x-2.5">
                      <button
                        onClick={startQuizEngine}
                        className="flex-1 py-2.5 bg-slate-900 hover:bg-slate-800 text-slate-300 border border-slate-800 hover:text-white rounded-lg text-xs font-semibold flex items-center justify-center space-x-1.5 transition cursor-pointer"
                      >
                        <RefreshCw className="h-3 w-3" />
                        <span>Retake Quiz</span>
                      </button>
                    </div>
                  </div>
                )}

              </div>
            )}

            {/* Fallback info card if compiler is not satisfied */}
            {needsCompiler && !isCompilerSatisfied && (
              <div className="p-4 bg-slate-950/40 border border-slate-900 rounded-xl text-center py-6 space-y-1 mt-6">
                <Lock className="h-5 w-5 text-slate-700 mx-auto mb-1 animate-pulse" />
                <h4 className="text-[11.5px] font-bold text-slate-400">Sandbox Compile Required</h4>
                <p className="text-[9.5px] text-slate-500 max-w-xs mx-auto leading-relaxed">
                  Before we can unlock the final topic quiz, you must successfully compile and pass the interactive compiler sandbox exercise on the left.
                </p>
              </div>
            )}

          </div>

          {/* Proceed to next step action button footer */}
          <div className="pt-4 border-t border-slate-850 mt-6 flex items-center justify-between text-[11px] text-slate-500 font-mono">
            {isTopicCompleted(activeTopic?.topic_id) ? (
              <button
                type="button"
                onClick={handleProceedToNext}
                disabled={allTopics.findIndex(t => t.topic_id === currentTopicId) === allTopics.length - 1}
                className="w-full py-2.5 bg-emerald-600 hover:bg-emerald-500 disabled:bg-slate-900 disabled:text-slate-650 disabled:border-transparent text-white font-bold leading-normal transition duration-200 rounded-xl shadow-lg flex items-center justify-center space-x-1 text-xs cursor-pointer"
              >
                <span>Proceed to Next Topic</span>
                <ChevronRight className="h-4 w-4" />
              </button>
            ) : (
              <div className="flex items-center justify-between w-full text-[10px]">
                <span>Status: Incomplete</span>
                <span>System Sandbox Protected</span>
              </div>
            )}
          </div>

        </div>

      </div>

    </div>
  );
}
