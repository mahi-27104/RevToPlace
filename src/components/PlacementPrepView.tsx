/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useRef } from 'react';
import { 
  FileText, 
  UserCheck, 
  Clock, 
  HelpCircle, 
  CheckCircle, 
  XCircle, 
  Video, 
  VideoOff,
  Brain, 
  Award, 
  RotateCcw,
  Sparkles,
  ArrowRight,
  ChevronRight,
  Send,
  MessageSquare,
  AlertCircle,
  Briefcase,
  Mic,
  MicOff,
  Volume2,
  Activity
} from 'lucide-react';
import { MockTest, DatabaseState, DSAProblem } from '../types';
import { MOCK_TESTS, COURSES } from '../mockData';
import { DSA_PROBLEMS } from '../dsaProblemsData';
import Compiler from './Compiler';
import { motion, AnimatePresence } from 'motion/react';
import Webcam from 'react-webcam';

interface PlacementPrepViewProps {
  dbState: DatabaseState;
  onSyncMockTest: (testId: string, score: number, totalQuestions: number, answers: Record<string, number>) => void;
  onSyncUserProgress?: (
    assessmentId: string,
    questionId: string,
    title: string,
    difficulty: 'Easy' | 'Medium' | 'Hard',
    timeTakenSeconds: number,
    score: number,
    submittedCode: string,
    completedAt: string
  ) => void;
}

export default function PlacementPrepView({ 
  dbState, 
  onSyncMockTest,
  onSyncUserProgress 
}: PlacementPrepViewProps) {
  const [activeSegment, setActiveSegment] = useState<'tests' | 'interviews'>('tests');

  // --- TIMED DSA ASSESSMENT ENGINE STATES ---
  const [assessmentPlaying, setAssessmentPlaying] = useState<boolean>(false);
  const [assessmentQuestions, setAssessmentQuestions] = useState<DSAProblem[]>([]);
  const [assessmentDrafts, setAssessmentDrafts] = useState<Record<number, string>>({});
  const [assessmentScores, setAssessmentScores] = useState<Record<number, number>>({});
  const [assessmentTimeRemaining, setAssessmentTimeRemaining] = useState<number>(0);
  const [assessmentTimesTaken, setAssessmentTimesTaken] = useState<Record<number, number>>({});
  const [activeQuestionIdx, setActiveQuestionIdx] = useState<number>(0); // 0, 1, 2
  const [assessmentId, setAssessmentId] = useState<string>('');
  
  const [assessmentResults, setAssessmentResults] = useState<{
    score: number;
    total: number;
    submitted: boolean;
    timesTaken: Record<'Easy' | 'Medium' | 'Hard', number>;
    questions: DSAProblem[];
    drafts: Record<number, string>;
  } | null>(null);

  const [expandedSolutionIdx, setExpandedSolutionIdx] = useState<number | null>(null);

  // Helper: duration in seconds
  const getQuestionDuration = (idx: number) => {
    if (idx === 0) return 10 * 60; // Easy: 10 mins (600s)
    if (idx === 1) return 20 * 60; // Medium: 20 mins (1200s)
    return 30 * 60; // Hard: 30 mins (1800s)
  };

  // Timer Effect for active assessment
  useEffect(() => {
    if (!assessmentPlaying || assessmentTimeRemaining <= 0) {
      if (assessmentPlaying && assessmentTimeRemaining === 0) {
        handleAutoSubmitQuestion();
      }
      return;
    }

    const interval = setInterval(() => {
      setAssessmentTimeRemaining(prev => prev - 1);
    }, 1000);

    return () => clearInterval(interval);
  }, [assessmentPlaying, assessmentTimeRemaining]);

  const handleStartAssessment = () => {
    const easyProbs = DSA_PROBLEMS.filter(p => p.difficulty === 'Easy');
    const mediumProbs = DSA_PROBLEMS.filter(p => p.difficulty === 'Medium');
    const hardProbs = DSA_PROBLEMS.filter(p => p.difficulty === 'Hard');

    // Safe fallback indices
    const easy = easyProbs[Math.floor(Math.random() * easyProbs.length)];
    const medium = mediumProbs[Math.floor(Math.random() * mediumProbs.length)];
    const hard = hardProbs[Math.floor(Math.random() * hardProbs.length)];

    const chosen = [easy, medium, hard].filter(Boolean) as DSAProblem[];
    
    const sessId = "dsa_timed_" + Date.now();
    setAssessmentId(sessId);
    setAssessmentQuestions(chosen);
    setActiveQuestionIdx(0);
    setAssessmentTimeRemaining(10 * 60); // 10 minutes for Easy
    
    const initialDrafts: Record<number, string> = {};
    const initialScores: Record<number, number> = {};
    const initialTimes: Record<number, number> = {};
    chosen.forEach((prob, index) => {
      initialDrafts[index] = prob.starterCode;
      initialScores[index] = 0;
      initialTimes[index] = 0;
    });

    setAssessmentDrafts(initialDrafts);
    setAssessmentScores(initialScores);
    setAssessmentTimesTaken(initialTimes);
    setAssessmentResults(null);
    setAssessmentPlaying(true);
  };

  const syncActiveQuestionProgress = (idx: number, timeTaken: number, scoresRecord?: Record<number, number>) => {
    const curProb = assessmentQuestions[idx];
    if (!curProb) return;

    const scoresToUse = scoresRecord || assessmentScores;
    const curScore = scoresToUse[idx] || 0;
    const curCode = assessmentDrafts[idx] || curProb.starterCode;

    if (onSyncUserProgress) {
      onSyncUserProgress(
        assessmentId,
        curProb.id,
        curProb.title,
        curProb.difficulty,
        timeTaken,
        curScore,
        curCode,
        new Date().toISOString()
      );
    }
  };

  const handleAutoSubmitQuestion = () => {
    const limit = getQuestionDuration(activeQuestionIdx);
    const taken = limit; // Timer hit zero, full time taken

    // Record time taken
    const updatedTimes = {
      ...assessmentTimesTaken,
      [activeQuestionIdx]: taken
    };
    setAssessmentTimesTaken(updatedTimes);

    // Sync progress to cloud database
    syncActiveQuestionProgress(activeQuestionIdx, taken);

    // Transition state machine
    if (activeQuestionIdx < 2) {
      const nextIdx = activeQuestionIdx + 1;
      setActiveQuestionIdx(nextIdx);
      setAssessmentTimeRemaining(getQuestionDuration(nextIdx));
    } else {
      // Completed last question (Hard) via timeout
      finishAssessment(updatedTimes);
    }
  };

  const handleNextQuestionManual = () => {
    const limit = getQuestionDuration(activeQuestionIdx);
    const taken = Math.max(1, limit - assessmentTimeRemaining);

    // Record time taken
    const updatedTimes = {
      ...assessmentTimesTaken,
      [activeQuestionIdx]: taken
    };
    setAssessmentTimesTaken(updatedTimes);

    // Sync progress to cloud database
    syncActiveQuestionProgress(activeQuestionIdx, taken);

    // Transition state machine
    if (activeQuestionIdx < 2) {
      const nextIdx = activeQuestionIdx + 1;
      setActiveQuestionIdx(nextIdx);
      setAssessmentTimeRemaining(getQuestionDuration(nextIdx));
    } else {
      // Completed last question (Hard) manually clicking Submit
      finishAssessment(updatedTimes);
    }
  };

  const finishAssessment = (allTimes: Record<number, number>) => {
    setAssessmentPlaying(false);

    // Re-evaluate final score from assessmentScores state
    let totalScore = 0;
    for (let i = 0; i < 3; i++) {
      if (assessmentScores[i] === 1) {
        totalScore++;
      }
    }

    setAssessmentResults({
      score: totalScore,
      total: 3,
      submitted: true,
      timesTaken: {
        Easy: allTimes[0] || 0,
        Medium: allTimes[1] || 0,
        Hard: allTimes[2] || 0
      },
      questions: assessmentQuestions,
      drafts: assessmentDrafts
    });

    // Mirror to standard mockTests log so achievements panel remains synced as well!
    onSyncMockTest(assessmentId, totalScore, 3, {});
  };

  const handleCompilerSuccess = (code: string) => {
    // Current question is successfully solved! Record 1 point.
    const updatedScores = {
      ...assessmentScores,
      [activeQuestionIdx]: 1
    };
    setAssessmentScores(updatedScores);

    // Update draft as well
    setAssessmentDrafts(prev => ({
      ...prev,
      [activeQuestionIdx]: code
    }));
  };

  const handleCodeChange = (code: string) => {
    setAssessmentDrafts(prev => ({
      ...prev,
      [activeQuestionIdx]: code
    }));
  };

  const formatTime = (seconds: number) => {
    const min = Math.floor(seconds / 60);
    const sec = seconds % 60;
    return `${min}:${sec < 10 ? '0' : ''}${sec}`;
  };

  // --- REAL-TIME AUDIOVISUAL MOCK INTERVIEW CHAT STATES ---
  const [interviewStarted, setInterviewStarted] = useState<boolean>(false);
  const [selectedCourseTitle, setSelectedCourseTitle] = useState<string>('General Data Structures & Algorithms');
  const [selectedDifficulty, setSelectedDifficulty] = useState<string>('Intermediate');
  const [chatMessages, setChatMessages] = useState<{
    id: string;
    role: 'interviewer' | 'candidate';
    text: string;
    timestamp: string;
    feedback?: {
      score: number;
      technicalAccuracy: string;
      critique: string;
      suggestions: string;
    };
  }[]>([]);
  const [userInput, setUserInput] = useState<string>('');
  const [isAiThinking, setIsAiThinking] = useState<boolean>(false);
  const [interviewError, setInterviewError] = useState<string | null>(null);

  // Audiovisual Connection States
  const [useVoiceVideo, setUseVoiceVideo] = useState<boolean>(true);
  const [isLiveConnected, setIsLiveConnected] = useState<boolean>(false);
  const [isInterviewerSpeaking, setIsInterviewerSpeaking] = useState<boolean>(false);
  const [currentUserSubtitle, setCurrentUserSubtitle] = useState<string>('');
  const [currentAiSubtitle, setCurrentAiSubtitle] = useState<string>('');
  const [sessionId, setSessionId] = useState<string>('');
  const [isMuted, setIsMuted] = useState<boolean>(false);
  const [isCameraOn, setIsCameraOn] = useState<boolean>(true);
  const [micAmplitude, setMicAmplitude] = useState<number>(0);
  const [report, setReport] = useState<{
    score: number;
    technicalAccuracy: string;
    communicationSkills: string;
    bodyLanguage: string;
    overallFeedback: string;
  } | null>(null);

  // Connection & Media References
  const webcamRef = useRef<any>(null);
  const wsRef = useRef<WebSocket | null>(null);
  const inputAudioCtxRef = useRef<AudioContext | null>(null);
  const outputAudioCtxRef = useRef<AudioContext | null>(null);
  const nextStartTimeRef = useRef<number>(0);
  const micAnalyserRef = useRef<AnalyserNode | null>(null);
  const scriptProcessorRef = useRef<ScriptProcessorNode | null>(null);
  const speakerIndicatorTimeoutRef = useRef<any>(null);
  const micStreamRef = useRef<MediaStream | null>(null);

  // Clean-up media & sockets on unmount or resets
  useEffect(() => {
    return () => {
      cleanupMediaAndSockets();
    };
  }, []);

  const cleanupMediaAndSockets = () => {
    if (scriptProcessorRef.current) {
      try { scriptProcessorRef.current.disconnect(); } catch (e) {}
      scriptProcessorRef.current = null;
    }
    if (micAnalyserRef.current) {
      try { micAnalyserRef.current.disconnect(); } catch (e) {}
      micAnalyserRef.current = null;
    }
    if (micStreamRef.current) {
      micStreamRef.current.getTracks().forEach(track => {
        try { track.stop(); } catch (e) {}
      });
      micStreamRef.current = null;
    }
    if (inputAudioCtxRef.current) {
      try { inputAudioCtxRef.current.close(); } catch (e) {}
      inputAudioCtxRef.current = null;
    }
    if (outputAudioCtxRef.current) {
      try { outputAudioCtxRef.current.close(); } catch (e) {}
      outputAudioCtxRef.current = null;
    }
    if (wsRef.current) {
      try { wsRef.current.close(); } catch (e) {}
      wsRef.current = null;
    }
    setIsLiveConnected(false);
  };

  const playAudioChunk = (base64: string) => {
    if (!outputAudioCtxRef.current) return;
    try {
      const binary = window.atob(base64);
      const bytes = new Uint8Array(binary.length);
      for (let i = 0; i < binary.length; i++) {
        bytes[i] = binary.charCodeAt(i);
      }
      
      const int16Array = new Int16Array(bytes.buffer);
      const floatArray = new Float32Array(int16Array.length);
      for (let i = 0; i < int16Array.length; i++) {
        floatArray[i] = int16Array[i] / 32768.0;
      }

      const buffer = outputAudioCtxRef.current.createBuffer(1, floatArray.length, 24000);
      buffer.getChannelData(0).set(floatArray);

      const source = outputAudioCtxRef.current.createBufferSource();
      source.buffer = buffer;
      source.connect(outputAudioCtxRef.current.destination);

      setIsInterviewerSpeaking(true);
      if (speakerIndicatorTimeoutRef.current) clearTimeout(speakerIndicatorTimeoutRef.current);
      speakerIndicatorTimeoutRef.current = setTimeout(() => {
        setIsInterviewerSpeaking(false);
      }, buffer.duration * 1000 + 400);

      const currentTime = outputAudioCtxRef.current.currentTime;
      if (nextStartTimeRef.current < currentTime) {
        nextStartTimeRef.current = currentTime;
      }
      source.start(nextStartTimeRef.current);
      nextStartTimeRef.current += buffer.duration;
    } catch (err) {
      console.error('Error playing speaker chunk:', err);
    }
  };

  // Handle 1 FPS Video Streaming loop to Gemini Multimodal Live
  useEffect(() => {
    let videoTimer: any;
    if (interviewStarted && isLiveConnected && isCameraOn && useVoiceVideo) {
      videoTimer = setInterval(() => {
        if (webcamRef.current && wsRef.current && wsRef.current.readyState === WebSocket.OPEN) {
          try {
            const screenshot = webcamRef.current.getScreenshot();
            if (screenshot) {
              const base64Jpeg = screenshot.split(',')[1];
              wsRef.current.send(JSON.stringify({ video: base64Jpeg }));
            }
          } catch (e) {
            console.warn('Screenshot cap failed', e);
          }
        }
      }, 1000); // 1 FPS precisely matches recommendations
    }
    return () => {
      if (videoTimer) clearInterval(videoTimer);
    };
  }, [interviewStarted, isLiveConnected, isCameraOn, useVoiceVideo]);

  const handleStartInterview = async () => {
    setInterviewError(null);
    setReport(null);
    setCurrentUserSubtitle('');
    setCurrentAiSubtitle('');
    
    if (!useVoiceVideo) {
      // Fallback: Traditional Text Mode Interview
      setIsAiThinking(true);
      try {
        const response = await fetch('/api/interview/start', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            courseTitle: selectedCourseTitle,
            difficulty: selectedDifficulty
          })
        });
        if (!response.ok) {
          throw new Error('Failed to fetch initial mock interview context.');
        }
        const data = await response.json();
        setChatMessages([
          {
            id: 'msg-start',
            role: 'interviewer',
            text: data.question || "Welcome to your mock interview! Let's start with a general question: Can you describe what a Hash Map is and its average time complexity?",
            timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
          }
        ]);
        setInterviewStarted(true);
      } catch (err: any) {
        setInterviewError(err.message || 'System error while launching simulation.');
      } finally {
        setIsAiThinking(false);
      }
      return;
    }

    // Audiovisual Mode Interview
    setIsAiThinking(true);
    const generatedSessionId = `sess-${Date.now()}`;
    setSessionId(generatedSessionId);

    try {
      // 1. Request microphone permission and configure context
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      micStreamRef.current = stream;

      const inputCtx = new (window.AudioContext || (window as any).webkitAudioContext)({ sampleRate: 16000 });
      const outputCtx = new (window.AudioContext || (window as any).webkitAudioContext)({ sampleRate: 24000 });
      inputAudioCtxRef.current = inputCtx;
      outputAudioCtxRef.current = outputCtx;
      nextStartTimeRef.current = 0;

      // 2. Attach analyzer for real-time waveform bars
      const source = inputCtx.createMediaStreamSource(stream);
      const analyser = inputCtx.createAnalyser();
      analyser.fftSize = 32;
      source.connect(analyser);
      micAnalyserRef.current = analyser;

      const drawVolume = () => {
        if (!micAnalyserRef.current) return;
        const dataArray = new Uint8Array(analyser.frequencyBinCount);
        analyser.getByteFrequencyData(dataArray);
        const avg = dataArray.reduce((acc, v) => acc + v, 0) / dataArray.length;
        setMicAmplitude(avg / 255);
        requestAnimationFrame(drawVolume);
      };
      drawVolume();

      // 3. Audio script processor to stream raw PCM inputs at 16kHz
      const processor = inputCtx.createScriptProcessor(2048, 1, 1);
      source.connect(processor);
      processor.connect(inputCtx.destination);
      scriptProcessorRef.current = processor;

      // 4. Initialize WebSocket channel
      const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
      const wsUrl = `${protocol}//${window.location.host}/api/live-interview?courseTitle=${encodeURIComponent(selectedCourseTitle)}&difficulty=${encodeURIComponent(selectedDifficulty)}&sessionId=${generatedSessionId}`;
      const ws = new WebSocket(wsUrl);
      wsRef.current = ws;

      processor.onaudioprocess = (e) => {
        if (isMuted) return;
        if (ws.readyState !== WebSocket.OPEN) return;

        const channelData = e.inputBuffer.getChannelData(0);
        const pcmBuffer = new ArrayBuffer(channelData.length * 2);
        const dataView = new DataView(pcmBuffer);
        for (let i = 0; i < channelData.length; i++) {
          const sample = Math.max(-1, Math.min(1, channelData[i]));
          dataView.setInt16(i * 2, sample < 0 ? sample * 32768 : sample * 32767, true);
        }

        const byteArr = new Uint8Array(pcmBuffer);
        let binaryStr = '';
        for (let i = 0; i < byteArr.byteLength; i++) {
          binaryStr += String.fromCharCode(byteArr[i]);
        }
        const pcmBase64 = window.btoa(binaryStr);
        ws.send(JSON.stringify({ audio: pcmBase64 }));
      };

      ws.onopen = () => {
        setIsLiveConnected(true);
        setInterviewStarted(true);
        setIsAiThinking(false);
      };

      ws.onmessage = (event) => {
        try {
          const packet = JSON.parse(event.data);
          
          if (packet.type === 'audio' && packet.data) {
            playAudioChunk(packet.data);
          } else if (packet.type === 'interrupted') {
            nextStartTimeRef.current = outputCtx.currentTime + 0.05;
          } else if (packet.type === 'user_transcript') {
            setCurrentUserSubtitle(packet.data);
          } else if (packet.type === 'model_transcript') {
            setCurrentAiSubtitle(packet.data);
          } else if (packet.type === 'error') {
            setInterviewError(packet.data);
          }
        } catch (err) {
          console.error('Failed to parse socket response:', err);
        }
      };

      ws.onerror = (err) => {
        console.error('WebSocket connection error:', err);
        setInterviewError('WebSocket connection is offline or server failed.');
      };

    } catch (err: any) {
      setInterviewError(err.message || 'Microphone capture permission or network initialisation failed.');
      cleanupMediaAndSockets();
      setIsAiThinking(false);
    }
  };

  const handleSendAnswer = async () => {
    if (!userInput.trim() || isAiThinking) return;
    const cleanInput = userInput.trim();
    setUserInput('');
    setInterviewError(null);

    if (useVoiceVideo) {
      // Stream user text as transcription or supplementary question
      setCurrentUserSubtitle(cleanInput);
      if (wsRef.current && wsRef.current.readyState === WebSocket.OPEN) {
        wsRef.current.send(JSON.stringify({ transcript: cleanInput }));
      }
      return;
    }

    // Classic Text-Only mode sending
    setIsAiThinking(true);
    const userMessageId = `msg-user-${Date.now()}`;
    const userTimestamp = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

    const candidateMessage = {
      id: userMessageId,
      role: 'candidate' as const,
      text: cleanInput,
      timestamp: userTimestamp
    };

    const currentHistory = [...chatMessages, candidateMessage];
    setChatMessages(currentHistory);

    try {
      const formattedHistory = chatMessages.map(msg => ({
        role: msg.role === 'candidate' ? 'user' : 'interviewer',
        text: msg.text
      }));

      const response = await fetch('/api/interview/respond', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          courseTitle: selectedCourseTitle,
          difficulty: selectedDifficulty,
          history: formattedHistory,
          userResponse: cleanInput
        })
      });

      if (!response.ok) {
        throw new Error('Feedback response failed. Ensure GEMINI_API_KEY is defined in your Settings > Secrets panel.');
      }

      const data = await response.json();

      setChatMessages(prev => {
        const updated = prev.map(msg => {
          if (msg.id === userMessageId) {
            return { ...msg, feedback: data.feedback };
          }
          return msg;
        });

        return [
          ...updated,
          {
            id: `msg-interviewer-${Date.now()}`,
            role: 'interviewer',
            text: data.nextQuestion || 'Thank you for your answer. Let\'s continue our technical screening.',
            timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
          }
        ];
      });

    } catch (err: any) {
      setInterviewError(err.message || 'An error occurred during evaluation.');
    } finally {
      setIsAiThinking(false);
    }
  };

  const handleStopLiveInterview = async () => {
    cleanupMediaAndSockets();
    setIsLiveConnected(false);
    setIsAiThinking(true);

    try {
      const response = await fetch('/api/interview/generate-report', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ sessionId })
      });
      if (!response.ok) {
        throw new Error('Could not generate candidate assessment report.');
      }
      const data = await response.json();
      setReport(data);
    } catch (err: any) {
      setInterviewError(err.message || 'Error occurred while loading report review.');
    } finally {
      setIsAiThinking(false);
    }
  };

  const handleResetInterview = () => {
    cleanupMediaAndSockets();
    setInterviewStarted(false);
    setReport(null);
    setChatMessages([]);
    setInterviewError(null);
    setCurrentUserSubtitle('');
    setCurrentAiSubtitle('');
    setSessionId('');
    setUserInput('');
  };

  return (
    <div className="space-y-8 animate-fade-in">
      
      {/* Top Navigation switch */}
      <div className="flex border-b border-slate-800 pb-0.5">
        <button
          onClick={() => setActiveSegment('tests')}
          className={`px-5 py-3 text-xs font-semibold uppercase tracking-wider border-b-2 transition ${
            activeSegment === 'tests' 
              ? 'border-indigo-500 text-indigo-400 font-bold' 
              : 'border-transparent text-slate-400 hover:text-slate-200'
          }`}
        >
          <div className="flex items-center space-x-2">
            <FileText className="h-4 w-4" />
            <span>Placement Mock Tests</span>
          </div>
        </button>

        <button
          onClick={() => setActiveSegment('interviews')}
          className={`px-5 py-3 text-xs font-semibold uppercase tracking-wider border-b-2 transition ${
            activeSegment === 'interviews' 
              ? 'border-purple-500 text-purple-400 font-bold' 
              : 'border-transparent text-slate-400 hover:text-slate-200'
          }`}
        >
          <div className="flex items-center space-x-2">
            <Video className="h-4 w-4" />
            <span>AI Mock Interview Simulator</span>
          </div>
        </button>
      </div>

      <AnimatePresence mode="wait">
        {activeSegment === 'tests' ? (
          
          <motion.div
            key="tests"
            initial={{ opacity: 0, y: 5 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -5 }}
            className="grid grid-cols-1 lg:grid-cols-4 gap-8"
          >
            {/* Sidebar selection & info */}
            <div className="lg:col-span-1 space-y-6">
              
              <div className="bg-slate-900/60 border border-slate-800 rounded-xl p-4 space-y-4">
                <div className="flex items-center space-x-2 pb-2 border-b border-slate-850">
                  <Brain className="h-4.5 w-4.5 text-indigo-400" />
                  <span className="text-xs font-bold text-slate-300 uppercase tracking-wider">Assessment Status</span>
                </div>

                {!assessmentPlaying ? (
                  <div className="space-y-3.5">
                    <p className="text-[11.5px] text-slate-400 leading-relaxed">
                      Prepare with standard, server-validated syllabus problems under structural time pressure.
                    </p>
                    
                    <div className="space-y-2.5 pt-1">
                      <div className="flex items-center justify-between text-xs font-mono bg-slate-950/40 p-2 border border-slate-900 rounded-lg">
                        <span className="text-slate-500">Easy Level</span>
                        <span className="text-emerald-400 font-bold">10 Mins</span>
                      </div>
                      <div className="flex items-center justify-between text-xs font-mono bg-slate-950/40 p-2 border border-slate-900 rounded-lg">
                        <span className="text-slate-500">Medium Level</span>
                        <span className="text-amber-400 font-bold">20 Mins</span>
                      </div>
                      <div className="flex items-center justify-between text-xs font-mono bg-slate-950/40 p-2 border border-slate-900 rounded-lg">
                        <span className="text-slate-500">Hard Level</span>
                        <span className="text-rose-400 font-bold">30 Mins</span>
                      </div>
                    </div>

                    <div className="pt-2 text-center border-t border-slate-850">
                      <span className="text-[10px] text-slate-500 block font-mono">
                        Requires verified compilation to pass.
                      </span>
                    </div>
                  </div>
                ) : (
                  <div className="space-y-4">
                    <div className="space-y-3">
                      <span className="text-[10px] text-slate-500 block font-bold uppercase tracking-wider">ACTIVE TIMELINE</span>
                      
                      {[0, 1, 2].map((idx) => {
                        const label = idx === 0 ? 'Easy Problem' : idx === 1 ? 'Medium Problem' : 'Hard Problem';
                        const isActive = idx === activeQuestionIdx;
                        const isSolved = assessmentScores[idx] === 1;
                        const isPast = idx < activeQuestionIdx;
                        
                        return (
                          <div 
                            key={idx}
                            className={`flex items-center justify-between p-3.5 border rounded-xl font-mono text-[11px] transition ${
                              isActive 
                                ? 'bg-indigo-600/10 border-indigo-500 text-white font-bold' 
                                : isPast
                                  ? 'bg-slate-950/10 border-slate-900 text-slate-500'
                                  : 'bg-slate-900/10 border-slate-950 text-slate-600'
                            }`}
                          >
                            <div className="flex items-center space-x-2">
                              <span className={`h-1.5 w-1.5 rounded-full ${isActive ? 'bg-indigo-400 animate-pulse' : isSolved ? 'bg-emerald-400' : isPast ? 'bg-slate-600' : 'bg-slate-800'}`} />
                              <span>{label}</span>
                            </div>
                            
                            <span>
                              {isActive ? (
                                <span className="text-indigo-400 font-bold animate-pulse">ACTIVE</span>
                              ) : isSolved ? (
                                <span className="text-emerald-400 font-semibold font-mono">SOLVED</span>
                              ) : isPast ? (
                                <span className="text-slate-500">COMPLETED</span>
                              ) : (
                                <span className="text-slate-700">LOCKED</span>
                              )}
                            </span>
                          </div>
                        );
                      })}
                    </div>

                    <div className="p-3 bg-slate-950/60 border border-slate-900 rounded-xl space-y-1">
                      <span className="text-[10px] text-slate-500 font-mono block uppercase">Interactive Note</span>
                      <p className="text-[10.5px] text-slate-400 leading-relaxed font-mono">
                        Run and pass compiler matching tests. If timer elapses, your code saves automatically and moves next.
                      </p>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Test Core Board */}
            <div className="lg:col-span-3">
              <div className="bg-slate-900/40 border border-slate-800 rounded-2xl min-h-[500px] flex flex-col">
                
                {/* 1. IDLE VIEW */}
                {!assessmentPlaying && !assessmentResults && (
                  <div className="flex-1 flex flex-col items-center justify-center text-center p-8 sm:p-12 space-y-6">
                    <div className="h-16 w-16 bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 rounded-2xl flex items-center justify-center">
                      <Clock className="h-8 w-8 text-indigo-400" />
                    </div>

                    <div className="space-y-2 max-w-xl">
                      <h3 className="text-xl sm:text-2xl font-sans font-semibold tracking-tight text-white">
                        DSA Timed Assessment Engine
                      </h3>
                      <p className="text-slate-400 text-xs sm:text-sm leading-relaxed">
                        Assess your skills against exactly three syllabus problems picked dynamically across Easy, Medium, and Hard complexities.
                      </p>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 max-w-2xl w-full text-left pt-2">
                      <div className="p-4 bg-slate-950/40 border border-slate-900 rounded-xl space-y-1">
                        <div className="text-indigo-400 text-xs font-bold font-mono">01. PDF TOPICS</div>
                        <p className="text-slate-400 text-[11px] leading-relaxed font-sans">
                          Algorithm challenges sourced from your primary PDF curriculum.
                        </p>
                      </div>
                      <div className="p-4 bg-slate-950/40 border border-slate-900 rounded-xl space-y-1">
                        <div className="text-amber-400 text-xs font-bold font-mono">02. TIMER CONTROL</div>
                        <p className="text-slate-400 text-[11px] leading-relaxed font-sans">
                          Independent ticking limits (10/20/30m) forcing production discipline.
                        </p>
                      </div>
                      <div className="p-4 bg-slate-950/40 border border-slate-900 rounded-xl space-y-1">
                        <div className="text-rose-400 text-xs font-bold font-mono">03. PERSISTENT RECORDS</div>
                        <p className="text-slate-400 text-[11px] leading-relaxed font-sans">
                          Saves question code drafts and time taken metrics directly to Cloud Firestore.
                        </p>
                      </div>
                    </div>

                    <button
                      onClick={handleStartAssessment}
                      className="inline-flex items-center justify-center space-x-2 px-8 py-4 bg-indigo-600 hover:bg-indigo-500 hover:scale-[1.02] text-white rounded-xl text-xs sm:text-sm font-semibold transition active:scale-[0.98] shadow-lg shadow-indigo-600/10 cursor-pointer"
                    >
                      <span>Begin Timed Assessment</span>
                      <ArrowRight className="h-4.5 w-4.5" />
                    </button>
                  </div>
                )}

                {/* 2. PLAYING VIEW */}
                {assessmentPlaying && assessmentQuestions[activeQuestionIdx] && (() => {
                  const activeQuestion = assessmentQuestions[activeQuestionIdx];
                  const isLast = activeQuestionIdx === 2;
                  const isTimeUrgent = assessmentTimeRemaining < 120; // 2 minutes or less

                  return (
                    <div className="flex-1 flex flex-col h-full divide-y divide-slate-800">
                      
                      {/* Sub-Header: Progress and Countdown Status */}
                      <div className="p-4 bg-slate-950/40 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                        
                        {/* Progressive Timeline indicator */}
                        <div className="flex-1 max-w-md space-y-2">
                          <div className="flex items-center justify-between text-xs font-mono">
                            <span className="text-slate-400">Assessment Progress:</span>
                            <span className="text-indigo-400 font-bold">{activeQuestionIdx + 1} / 3 Problems</span>
                          </div>
                          
                          <div className="w-full bg-slate-900 h-2 rounded-full overflow-hidden border border-slate-850">
                            <div 
                              className="bg-indigo-500 h-full rounded-full transition-all duration-500"
                              style={{ width: `${((activeQuestionIdx + 1) / 3) * 100}%` }}
                            />
                          </div>
                        </div>

                        {/* Prominent ticking timer */}
                        <div className="flex items-center space-x-3 self-start sm:self-center">
                          <span className="text-xs font-mono text-slate-500 uppercase tracking-widest">Question Timer</span>
                          <div className={`flex items-center space-x-2 px-4 py-2 border rounded-xl font-mono text-sm font-bold shadow-sm transition ${
                            isTimeUrgent 
                              ? 'bg-rose-500/10 border-rose-500/40 text-rose-400 animate-pulse' 
                              : 'bg-slate-900/80 border-slate-800 text-amber-400'
                          }`}>
                            <Clock className={`h-4 w-4 ${isTimeUrgent ? 'animate-spin' : ''}`} />
                            <span>{formatTime(assessmentTimeRemaining)}</span>
                          </div>
                        </div>

                      </div>

                      {/* Main Dynamic Workstation Split Layout */}
                      <div className="flex-1 grid grid-cols-1 lg:grid-cols-5 gap-0 overflow-hidden divide-y lg:divide-y-0 lg:divide-x divide-slate-850 min-h-[500px]">
                        
                        {/* Left split: problem requirements and constraints */}
                        <div className="lg:col-span-2 p-5 sm:p-6 space-y-5 overflow-y-auto max-h-[550px]">
                          <div className="space-y-2.5">
                            <div className="flex flex-wrap items-center gap-2">
                              <span className="text-[10px] font-bold font-mono px-2 py-0.5 bg-indigo-500/5 text-indigo-400 border border-indigo-500/10 rounded-md">
                                {activeQuestion.category}
                              </span>
                              
                              <span className={`text-[10px] font-bold font-mono px-2 py-0.5 border rounded-md uppercase tracking-wider ${
                                activeQuestion.difficulty === 'Easy' 
                                  ? 'bg-emerald-500/5 border-emerald-500/10 text-emerald-400' 
                                  : activeQuestion.difficulty === 'Medium'
                                    ? 'bg-amber-500/5 border-amber-500/10 text-amber-400'
                                    : 'bg-rose-500/5 border-rose-500/10 text-rose-400'
                              }`}>
                                {activeQuestion.difficulty} Level
                              </span>
                            </div>

                            <h4 className="text-base sm:text-lg font-sans font-bold tracking-tight text-white">
                              {activeQuestion.title}
                            </h4>
                          </div>

                          <div className="prose prose-slate prose-sm text-slate-300 text-xs sm:text-sm leading-relaxed whitespace-pre-wrap max-h-[280px] overflow-y-auto pr-2 bg-slate-950/20 p-3 border border-slate-900/60 rounded-xl font-mono">
                            {activeQuestion.description}
                          </div>

                          {/* Test Cases display */}
                          <div className="space-y-2">
                            <span className="text-[10px] font-mono text-slate-500 uppercase tracking-wider">Example Validation Case</span>
                            {activeQuestion.testCases && activeQuestion.testCases[0] && (
                              <div className="bg-slate-950/60 border border-slate-900 rounded-xl p-3 space-y-2 text-xs font-mono">
                                <div className="space-y-0.5">
                                  <span className="text-slate-500 block text-[10px]">Test Input:</span>
                                  <span className="text-slate-300 block">{activeQuestion.testCases[0].input}</span>
                                </div>
                                <div className="space-y-0.5 border-t border-slate-900 pt-1.5 mt-1.5">
                                  <span className="text-slate-500 block text-[10px]">Expected Output:</span>
                                  <span className="text-indigo-400 block font-semibold">{activeQuestion.testCases[0].expected}</span>
                                </div>
                              </div>
                            )}
                          </div>
                        </div>

                        {/* Right split: integrated compiling terminal workspace */}
                        <div className="lg:col-span-3 flex flex-col bg-slate-900/10">
                          <Compiler
                            key={`${activeQuestion.id}_${activeQuestionIdx}`} // enforces reset on question transitions
                            initialLanguage={activeQuestion.language}
                            initialCode={assessmentDrafts[activeQuestionIdx] || activeQuestion.starterCode}
                            expectedOutput={activeQuestion.testCases?.[0]?.expected}
                            onSuccess={handleCompilerSuccess}
                            onChange={handleCodeChange}
                            currentProblem={activeQuestion}
                          />
                        </div>

                      </div>

                      {/* Playground controlling actions bar */}
                      <div className="p-4 sm:p-5 bg-slate-950/40 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                        <div className="flex items-center space-x-2 text-[11px] text-slate-500 font-mono">
                          <AlertCircle className="h-4 w-4 text-slate-400 flex-shrink-0" />
                          <span>Code status is determined by compilation accuracy. You can update code as many times as you want before submitting.</span>
                        </div>

                        <button
                          onClick={handleNextQuestionManual}
                          className="inline-flex items-center justify-center space-x-2 px-6 py-3 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-xs font-bold tracking-wide transition shadow-md shadow-indigo-600/5 cursor-pointer whitespace-nowrap self-end sm:self-auto"
                        >
                          <span>{isLast ? 'Complete & Submit Assessment' : 'Submit & Proceed'}</span>
                          <ArrowRight className="h-4 w-4" />
                        </button>
                      </div>

                    </div>
                  );
                })()}

                {/* 3. FINAL SUMMARY RESULTS CARD */}
                {assessmentResults && (
                  <div className="flex-1 p-6 sm:p-8 space-y-8 animate-fade-in text-left">
                    
                    {/* Upper Score Dashboard banner */}
                    <div className="bg-slate-950/40 border border-slate-800 rounded-2xl p-6 flex flex-col sm:flex-row sm:items-center justify-between gap-6">
                      <div className="space-y-1.5">
                        <span className="text-[10px] font-bold font-mono text-indigo-400 uppercase tracking-widest block font-bold">ASSESSMENT COMPLETED</span>
                        <h4 className="text-xl sm:text-2xl font-sans font-semibold tracking-tight text-white leading-none">Your Performance Summary</h4>
                        <p className="text-xs text-slate-400">
                          Syllabus tracking completed successfully. Individual timings has been saved to your student profile metrics.
                        </p>
                      </div>

                      {/* Circular or block visual scoreboard */}
                      <div className="flex items-center space-x-4 bg-slate-900 border border-slate-850 px-5 py-3.5 rounded-xl font-mono text-right self-start sm:self-auto">
                        <div className="space-y-0.5">
                          <span className="text-[9.5px] text-slate-500 block uppercase">Accuracy Score</span>
                          <div className="flex items-baseline justify-end space-x-1">
                            <span className="text-2xl font-bold text-indigo-400">{assessmentResults.score}</span>
                            <span className="text-slate-500 text-sm">/ {assessmentResults.total}</span>
                          </div>
                        </div>
                        <div className="h-8 w-px bg-slate-800" />
                        <div className="space-y-0.5">
                          <span className="text-[9.5px] text-slate-500 block uppercase font-mono">Status Rank</span>
                          <span className={`text-xs font-bold block ${
                            assessmentResults.score === 3 
                              ? 'text-emerald-400' 
                              : assessmentResults.score === 2 
                                ? 'text-amber-400' 
                                : 'text-slate-400'
                          }`}>
                            {assessmentResults.score === 3 ? 'EXPERT' : assessmentResults.score === 2 ? 'PROFICIENT' : 'BEGINNER'}
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Step timings list */}
                    <div className="space-y-4">
                      <span className="text-[10px] font-mono font-bold text-slate-500 uppercase tracking-wider block">QUESTION WISE METRICS & FEEDBACK</span>
                      
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
                        {assessmentResults.questions.map((q, idx) => {
                          const level = idx === 0 ? 'Easy' : idx === 1 ? 'Medium' : 'Hard';
                          const timeTakenSec = assessmentResults.timesTaken[level as 'Easy' | 'Medium' | 'Hard'] || 0;
                          const isSolvedCorrectly = assessmentScores[idx] === 1;
                          const [expandedState, setExpandedState] = useState<boolean>(false);

                          return (
                            <div 
                              key={idx}
                              className="bg-slate-900/60 border border-slate-850 rounded-xl p-5 flex flex-col justify-between space-y-4 hover:border-slate-800 transition"
                            >
                              <div className="space-y-2.5">
                                <div className="flex items-center justify-between">
                                  <span className={`text-[10px] font-bold font-mono px-2 py-0.5 border rounded-md uppercase tracking-wider ${
                                    level === 'Easy' 
                                      ? 'bg-emerald-500/5 border-emerald-500/10 text-emerald-400' 
                                      : level === 'Medium'
                                        ? 'bg-amber-500/5 border-amber-500/10 text-amber-400'
                                        : 'bg-rose-500/5 border-rose-500/10 text-rose-400'
                                  }`}>
                                    {level} Level
                                  </span>
                                  
                                  <div className="flex items-center space-x-1 font-mono text-[11px]">
                                    {isSolvedCorrectly ? (
                                      <span className="text-emerald-400 font-bold flex items-center space-x-1">
                                        <CheckCircle className="h-3.5 w-3.5" />
                                        <span>PASSED</span>
                                      </span>
                                    ) : (
                                      <span className="text-rose-400 font-bold flex items-center space-x-1">
                                        <XCircle className="h-3.5 w-3.5" />
                                        <span>UNSOLVED</span>
                                      </span>
                                    )}
                                  </div>
                                </div>

                                <h5 className="text-xs font-bold text-slate-200 line-clamp-1">{q.title}</h5>
                                <p className="text-[11px] text-slate-500 line-clamp-2">{q.category} • Compilation validation</p>
                              </div>

                              <div className="space-y-3.5 pt-3 border-t border-slate-850">
                                <div className="flex items-center justify-between text-xs font-mono">
                                  <span className="text-slate-500">Time Spent:</span>
                                  <span className="text-slate-300 font-bold">
                                    {Math.floor(timeTakenSec / 60)}m {timeTakenSec % 60}s
                                  </span>
                                </div>

                                <button
                                  onClick={() => {
                                    // Set state index
                                    setExpandedSolutionIdx(expandedSolutionIdx === idx ? null : idx);
                                  }}
                                  className="w-full py-2.5 bg-slate-950 border border-slate-850 rounded-lg text-[10.5px] font-semibold text-indigo-400 hover:text-indigo-300 hover:border-slate-800 transition align-middle flex items-center justify-center space-x-1 cursor-pointer"
                                >
                                  <span>{expandedSolutionIdx === idx ? 'Hide Solution Review' : 'Review Correct Solution'}</span>
                                  <ChevronRight className={`h-3 w-3 transform transition-transform ${expandedSolutionIdx === idx ? 'rotate-90' : ''}`} />
                                </button>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </div>

                    {/* Expandable correct solutions code view block */}
                    <AnimatePresence>
                      {expandedSolutionIdx !== null && (() => {
                        const q = assessmentResults.questions[expandedSolutionIdx];
                        const level = expandedSolutionIdx === 0 ? 'Easy' : expandedSolutionIdx === 1 ? 'Medium' : 'Hard';
                        return (
                          <motion.div 
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: 10 }}
                            className="bg-slate-900 border border-slate-800 rounded-2xl p-5 sm:p-6 space-y-4"
                          >
                            <div className="flex items-center justify-between pb-3 border-b border-slate-850">
                              <div className="space-y-0.5">
                                <span className="text-[10px] font-bold font-mono text-indigo-400 uppercase tracking-widest block">Reference Solutions Library</span>
                                <h4 className="text-sm font-bold text-white">{q.title} ({level} Challenge)</h4>
                              </div>
                              <button 
                                onClick={() => setExpandedSolutionIdx(null)}
                                className="text-slate-500 hover:text-slate-300 text-xs font-mono"
                              >
                                Minimize
                              </button>
                            </div>

                            <div className="space-y-3">
                              <h5 className="text-[11px] font-mono text-slate-400 uppercase tracking-wider">Algorithmic Problem Description</h5>
                              <p className="text-xs text-slate-300 leading-relaxed font-sans whitespace-pre-wrap bg-slate-950 p-4 rounded-xl border border-slate-900 leading-relaxed max-h-[160px] overflow-y-auto">
                                {q.description}
                              </p>
                            </div>

                            <div className="space-y-2.5 pt-1">
                              <div className="flex items-center justify-between text-xs font-mono text-slate-400">
                                <span className="uppercase">VALIDATED INTERPRETER SOURCE CODE:</span>
                                <span className="px-1.5 py-0.5 bg-slate-950 border border-slate-900 text-indigo-400 rounded text-[10px] font-bold">{q.language.toUpperCase()}</span>
                              </div>
                              <pre className="bg-slate-950 p-4 rounded-xl border border-slate-900 text-xs text-emerald-400 font-mono overflow-x-auto select-text leading-relaxed max-h-[300px]">
                                <code>{q.solution}</code>
                              </pre>
                            </div>
                          </motion.div>
                        );
                      })()}
                    </AnimatePresence>

                    {/* Footer resets */}
                    <div className="flex flex-col sm:flex-row items-center gap-4 pt-4 border-t border-slate-850">
                      <button
                        onClick={handleStartAssessment}
                        className="w-full sm:w-auto inline-flex items-center justify-center space-x-2 px-6 py-3.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-xs font-bold transition cursor-pointer"
                      >
                        <RotateCcw className="h-4 w-4" />
                        <span>Launch Another Assessment</span>
                      </button>
                    </div>

                  </div>
                )}

              </div>
            </div>
          </motion.div>

        ) : (
          
          <motion.div
            key="interviews"
            initial={{ opacity: 0, y: 5 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -5 }}
            className="grid grid-cols-1 lg:grid-cols-4 gap-8"
          >
            {/* Interview Settings sidebar */}
            <div className="lg:col-span-1 space-y-6">
              <div className="bg-slate-900/60 border border-slate-800 rounded-xl p-4 space-y-4">
                <div>
                  <h3 className="text-sm font-bold text-slate-200">AI Recruiter Suite</h3>
                  <p className="text-slate-500 text-[11px] mt-0.5 font-sans">Multimodal mock screenings with conversational technical feedback.</p>
                </div>

                {!interviewStarted && !report ? (
                  <div className="space-y-4 pt-1">
                    {/* Voice/Video Toggle */}
                    <div className="space-y-1.5">
                      <label className="text-[10px] font-mono font-semibold uppercase tracking-wider text-slate-500 block">Assessment Mode:</label>
                      <div className="grid grid-cols-2 gap-2">
                        <button
                          type="button"
                          onClick={() => setUseVoiceVideo(true)}
                          className={`py-2 px-2 text-[10.5px] font-semibold rounded-xl border transition flex flex-col items-center justify-center space-y-1 ${
                            useVoiceVideo
                              ? 'bg-indigo-500/15 border-indigo-500 text-indigo-400'
                              : 'bg-slate-950/40 border-slate-850 text-slate-400 hover:text-slate-200'
                          }`}
                        >
                          <Video className="h-4 w-4" />
                          <span>Audiovisual Stream</span>
                        </button>
                        <button
                          type="button"
                          onClick={() => setUseVoiceVideo(false)}
                          className={`py-2 px-2 text-[10.5px] font-semibold rounded-xl border transition flex flex-col items-center justify-center space-y-1 ${
                            !useVoiceVideo
                              ? 'bg-purple-500/15 border-purple-500 text-purple-400'
                              : 'bg-slate-950/40 border-slate-850 text-slate-400 hover:text-slate-200'
                          }`}
                        >
                          <MessageSquare className="h-4 w-4" />
                          <span>Traditional Chat</span>
                        </button>
                      </div>
                    </div>

                    {/* Course/Topic Selector */}
                    <div className="space-y-1.5">
                      <label className="text-[10px] font-mono font-semibold uppercase tracking-wider text-slate-500 block">Select Course Topic:</label>
                      <select
                        value={selectedCourseTitle}
                        onChange={(e) => setSelectedCourseTitle(e.target.value)}
                        className="w-full bg-slate-950 text-xs border border-slate-800 rounded-xl p-3 text-slate-200 focus:border-indigo-500 transition outline-none"
                      >
                        <option value="General Data Structures & Algorithms">General Data Structures & Algorithms</option>
                        {COURSES.map(c => (
                          <option key={c.id} value={c.title}>{c.title}</option>
                        ))}
                      </select>
                    </div>

                    {/* Difficulty Level Selector */}
                    <div className="space-y-1.5">
                      <label className="text-[10px] font-mono font-semibold uppercase tracking-wider text-slate-500 block">Experience Level:</label>
                      <div className="grid grid-cols-3 gap-1">
                        {['Beginner', 'Intermediate', 'Advanced'].map((level) => (
                          <button
                            key={level}
                            type="button"
                            onClick={() => setSelectedDifficulty(level)}
                            className={`py-2 text-[9.5px] font-semibold rounded-xl border transition ${
                              selectedDifficulty === level
                                ? 'bg-purple-500/15 border-purple-500 text-purple-400'
                                : 'bg-slate-950/40 border-slate-850 text-slate-400 hover:text-slate-200'
                            }`}
                          >
                            {level}
                          </button>
                        ))}
                      </div>
                    </div>

                    <button
                      onClick={handleStartInterview}
                      disabled={isAiThinking}
                      className="w-full flex items-center justify-center space-x-2 py-3 bg-indigo-600 hover:bg-indigo-500 disabled:bg-indigo-800 text-white rounded-xl text-xs font-bold transition shadow-lg shadow-indigo-600/10"
                    >
                      <Sparkles className="h-4 w-4 text-white" />
                      <span>{isAiThinking ? 'Starting Session...' : 'Launch Live Assessment'}</span>
                      <ArrowRight className="h-4 w-4" />
                    </button>
                  </div>
                ) : (
                  <div className="space-y-5 pt-1">
                    <div className="p-3.5 bg-slate-950 border border-slate-850 rounded-xl space-y-3 font-mono text-[10.5px]">
                      <div>
                        <span className="text-slate-500 block text-[9px] uppercase tracking-wider">Active Subject</span>
                        <span className="text-slate-200 font-sans font-semibold line-clamp-2 mt-0.5">{selectedCourseTitle}</span>
                      </div>
                      <div className="h-px bg-slate-850" />
                      <div>
                        <span className="text-slate-500 block text-[9px] uppercase tracking-wider">Target Level</span>
                        <span className="text-indigo-400 font-semibold">{selectedDifficulty}</span>
                      </div>
                      <div className="h-px bg-slate-850" />
                      <div className="flex justify-between items-center">
                        <span className="text-slate-500 text-[9px] uppercase tracking-wider">Mode</span>
                        <span className="text-purple-400 font-bold font-mono">
                          {useVoiceVideo ? 'Live Audio/Video' : 'Text Based'}
                        </span>
                      </div>
                    </div>

                    <div className="p-3 bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 text-xs rounded-xl flex items-start space-x-2 leading-relaxed">
                      <Brain className="h-4 w-4 mt-0.5 flex-shrink-0 animate-pulse" />
                      <span>Your engagement and spoken replies are analyzed in real time. Terminate screening to review the finalized assessment report.</span>
                    </div>

                    <button
                      onClick={useVoiceVideo ? handleStopLiveInterview : handleResetInterview}
                      className="w-full py-2.5 bg-red-600/10 hover:bg-red-600/25 border border-red-500/20 text-xs font-semibold text-red-400 hover:text-red-300 rounded-xl transition"
                    >
                      Terminate Screening
                    </button>
                  </div>
                )}
              </div>
            </div>

            {/* Coach Workspace */}
            <div className="lg:col-span-3">
              {report ? (
                /* Assessment Structured Report View */
                <motion.div
                  initial={{ opacity: 0, scale: 0.98 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="bg-slate-900/60 border border-slate-800 rounded-2xl p-6 sm:p-8 space-y-6"
                >
                  <div className="flex flex-col items-center text-center pb-6 border-b border-slate-800">
                    <div className="h-16 w-16 bg-gradient-to-tr from-indigo-500/10 to-purple-500/10 rounded-full flex items-center justify-center text-indigo-400 mb-4 border border-indigo-500/20">
                      <Award className="h-8 w-8 text-indigo-300" />
                    </div>
                    <h3 className="text-lg sm:text-xl font-bold font-sans text-white">Interactive Assessment Concluded</h3>
                    <p className="text-slate-400 text-xs mt-1">Your real-time conversational screening performance report has been evaluated.</p>
                    
                    <div className="flex items-center space-x-6 mt-5 bg-slate-950 border border-slate-850 p-4 rounded-xl">
                      <div className="text-left font-mono">
                        <span className="text-[10px] text-slate-500 block uppercase tracking-wide">Technical Score</span>
                        <span className="text-2xl font-black text-white">{report.score} / 10</span>
                      </div>
                      <div className="w-px h-8 bg-slate-800" />
                      <div className="text-left font-mono">
                        <span className="text-[10px] text-slate-500 block uppercase tracking-wide">Status</span>
                        <span className={`text-xs font-bold px-2.5 py-1 rounded ${
                          report.score >= 8 ? 'bg-emerald-500/15 text-emerald-400' : 'bg-amber-500/15 text-amber-400'
                        }`}>{report.score >= 8 ? 'Strong Candidate' : 'Under Assessment'}</span>
                      </div>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    {/* Technical Accuracy */}
                    <div className="p-5 bg-slate-950/60 border border-slate-900 rounded-xl space-y-2">
                      <div className="flex items-center space-x-2 text-indigo-400 font-semibold text-xs font-mono uppercase tracking-wider">
                        <Brain className="h-4 w-4" />
                        <span>Technical Accuracy</span>
                      </div>
                      <p className="text-slate-300 text-[11.5px] leading-relaxed">{report.technicalAccuracy}</p>
                    </div>

                    {/* Communication Skills */}
                    <div className="p-5 bg-slate-950/60 border border-slate-900 rounded-xl space-y-2">
                      <div className="flex items-center space-x-2 text-purple-400 font-semibold text-xs font-mono uppercase tracking-wider">
                        <Volume2 className="h-4 w-4" />
                        <span>Verbal Clarity</span>
                      </div>
                      <p className="text-slate-300 text-[11.5px] leading-relaxed">{report.communicationSkills}</p>
                    </div>

                    {/* Confidence & Posture */}
                    <div className="p-5 bg-slate-950/60 border border-slate-900 rounded-xl space-y-2">
                      <div className="flex items-center space-x-2 text-pink-400 font-semibold text-xs font-mono uppercase tracking-wider">
                        <Video className="h-4 w-4" />
                        <span>Body Language</span>
                      </div>
                      <p className="text-slate-300 text-[11.5px] leading-relaxed">{report.bodyLanguage}</p>
                    </div>
                  </div>

                  <div className="p-5 bg-slate-950 border border-indigo-500/10 rounded-xl space-y-2">
                    <span className="font-semibold text-xs text-indigo-400 font-mono uppercase tracking-wider block">Elite Assessor Overall Roadmap</span>
                    <p className="text-slate-200 text-xs leading-relaxed">{report.overallFeedback}</p>
                  </div>

                  <button
                    onClick={handleResetInterview}
                    className="w-full flex items-center justify-center space-x-2 py-3 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-xs font-bold transition shadow-lg shrink-0"
                  >
                    <RotateCcw className="h-4 w-4" />
                    <span>Retake Assessment or Change Settings</span>
                  </button>
                </motion.div>
              ) : (
                <div className="bg-slate-900/40 border border-slate-800 rounded-2xl min-h-[500px] flex flex-col justify-between overflow-hidden shadow-xl">
                  
                  {/* Workspace Header ribbon */}
                  <div className="bg-slate-900/40 px-6 py-4 border-b border-slate-850 flex items-center justify-between flex-shrink-0">
                    <div className="flex items-center space-x-2.5">
                      <div className="p-1.5 bg-indigo-500/10 rounded-lg text-indigo-400 border border-indigo-500/25">
                        <Activity className="h-4 w-4" />
                      </div>
                      <div>
                        <h4 className="text-xs font-bold text-slate-200">
                          {interviewStarted ? `${selectedDifficulty} Screening Board` : 'Developer Screening Simulator'}
                        </h4>
                        <p className="text-[10px] text-slate-400 font-sans">
                          {interviewStarted 
                            ? (useVoiceVideo ? 'Real-Time Multimodal Stream Active' : 'Traditional text reviews enabled') 
                            : 'Practice key conceptual topics in secure environments.'
                          }
                        </p>
                      </div>
                    </div>
                    
                    {interviewStarted && (
                      <span className="inline-flex items-center space-x-1 px-2.5 py-1 text-[9.5px] font-mono font-bold text-emerald-400 bg-emerald-500/5 border border-emerald-500/10 rounded-full">
                        <span className="h-1.5 w-1.5 bg-emerald-400 rounded-full animate-pulse" />
                        <span>Live Session</span>
                      </span>
                    )}
                  </div>

                  {!interviewStarted ? (
                    /* Welcome Lobby Screen */
                    <div className="flex-1 flex flex-col items-center justify-center p-8 text-center space-y-6">
                      <div className="w-16 h-16 bg-gradient-to-tr from-indigo-500/10 to-purple-500/10 border border-indigo-500/25 rounded-2xl flex items-center justify-center shadow-lg">
                        <Briefcase className="h-8 w-8 text-indigo-400" />
                      </div>
                      
                      <div className="max-w-md space-y-2">
                        <h3 className="text-base font-bold text-slate-200">AI Technical Interview Screening Simulator</h3>
                        <p className="text-slate-400 text-xs leading-relaxed">
                          Prepare for top tier technical screening calls. Connect with Gemini Live using real-time audio analysis and body-language capture, or select native chat reviews.
                        </p>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 w-full max-w-lg text-left text-[11px] pt-4">
                        <div className="p-4 bg-slate-950/60 border border-slate-900 rounded-xl space-y-1.5">
                          <div className="flex items-center space-x-2 text-indigo-400 font-bold">
                            <Video className="h-4 w-4" />
                            <span>Real-Time Webcam & Audio</span>
                          </div>
                          <p className="text-slate-500 leading-normal">Allows the interviewer to "see" your posture, background, and "hear" live voice explanations dynamically.</p>
                        </div>
                        <div className="p-4 bg-slate-950/60 border border-slate-900 rounded-xl space-y-1.5">
                          <div className="flex items-center space-x-2 text-purple-400 font-bold">
                            <Brain className="h-4 w-4" />
                            <span>Deep Structured Feedback</span>
                          </div>
                          <p className="text-slate-500 leading-normal">Provides clear comprehensive ratings on accuracy, communication style, verbal speed pacing, and body posture.</p>
                        </div>
                      </div>

                      <div className="pt-2">
                        <button
                          onClick={handleStartInterview}
                          disabled={isAiThinking}
                          className="px-6 py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold rounded-xl transition shadow-lg shadow-indigo-600/10 flex items-center space-x-1.5"
                        >
                          <Sparkles className="h-3.5 w-3.5" />
                          <span>Launch Live Simulator</span>
                          <ArrowRight className="h-4 w-4" />
                        </button>
                      </div>
                    </div>
                  ) : useVoiceVideo ? (
                    /* Immersive Real-Time Audiovisual Call Grid Screen */
                    <div className="flex-1 flex flex-col justify-between overflow-hidden bg-slate-950 p-6 space-y-4">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 flex-1">
                        
                        {/* Recruiter Avatar Feed */}
                        <div className="relative border border-slate-800 rounded-xl overflow-hidden bg-slate-900/60 flex flex-col items-center justify-center p-6 text-center space-y-4 min-h-[220px]">
                          <span className="absolute top-3 left-3 bg-indigo-600/15 border border-indigo-500/20 text-indigo-400 px-2 py-0.5 rounded text-[9px] font-mono font-bold uppercase tracking-widest">
                            AI Screening Partner
                          </span>

                          <div className="relative">
                            <div className={`p-8 bg-indigo-500/10 rounded-full border border-indigo-500/30 transition-transform duration-500 ${
                              isInterviewerSpeaking ? 'scale-110 border-purple-500 ring-2 ring-purple-500/20' : ''
                            }`}>
                              <Brain className={`h-10 w-10 text-indigo-400 ${isInterviewerSpeaking ? 'animate-pulse text-purple-400' : ''}`} />
                            </div>
                            {isInterviewerSpeaking && (
                              <span className="absolute -bottom-2 left-1/2 -translate-x-1/2 bg-purple-500 text-white font-bold text-[8.5px] px-2 py-0.5 rounded uppercase tracking-wider font-mono">
                                Speaking
                              </span>
                            )}
                          </div>

                          <div className="space-y-1">
                            <h4 className="text-white text-xs font-semibold">Gemini Live Screening Suite</h4>
                            <p className="text-slate-500 text-[10px]">
                              {isInterviewerSpeaking ? 'Delivering screening question/critique...' : 'Listen attentively and speak your response.'}
                            </p>
                          </div>
                        </div>

                        {/* Candidate Source Camera Stream */}
                        <div className="relative border border-slate-800 rounded-xl overflow-hidden bg-slate-900/60 flex items-center justify-center min-h-[220px]">
                          <span className="absolute top-3 left-3 bg-red-600/20 border border-red-500/30 text-red-500 px-2 py-0.5 rounded text-[9px] font-mono font-bold uppercase tracking-widest flex items-center space-x-1.5 z-10">
                            <span className="h-1.5 w-1.5 rounded-full bg-red-500 animate-pulse" />
                            <span>Candidate camera</span>
                          </span>

                          {isCameraOn ? (
                            <Webcam
                              audio={false}
                              ref={webcamRef}
                              screenshotFormat="image/jpeg"
                              className="object-cover w-full h-full"
                            />
                          ) : (
                            <div className="flex flex-col items-center space-y-2 text-slate-500 text-center">
                              <VideoOff className="h-10 w-10 text-slate-600" />
                              <span className="text-xs">Camera Feed disabled</span>
                            </div>
                          )}

                          {/* Sound wave visualizer overlay represent stream amplitude */}
                          <div className="absolute bottom-3 left-3 right-3 flex items-center justify-between bg-slate-950/80 p-2.5 rounded-lg border border-slate-800/40 z-10">
                            <span className="text-[9px] text-slate-400 font-mono flex items-center space-x-1">
                              <Mic className="h-3 w-3 text-indigo-400" />
                              <span>Live Mic Volume</span>
                            </span>
                            <div className="flex items-center space-x-0.5 h-3">
                              {[1, 2, 3, 4, 5, 6].map((bar) => {
                                // Dynamic height based on volume
                                const delay = bar * 0.15;
                                const maxScale = micAmplitude * 100 * (1.5 - (bar % 3) * 0.2);
                                return (
                                  <span
                                    key={bar}
                                    style={{ 
                                      height: isMuted ? '2px' : `${Math.max(2, Math.min(12, maxScale))}px`,
                                      transition: 'height 0.1s ease-out'
                                    }}
                                    className="w-1 bg-indigo-400 rounded-sm"
                                  />
                                );
                              })}
                            </div>
                          </div>
                        </div>

                      </div>

                      {/* Dynamic Subtitles bar strip */}
                      <div className="bg-slate-900/60 border border-slate-850 p-4 rounded-xl min-h-[80px] space-y-2 flex-shrink-0">
                        {currentAiSubtitle && (
                          <div className="text-left">
                            <span className="text-[8px] font-mono text-indigo-500 uppercase tracking-widest block font-bold">Interviewer:</span>
                            <p className="text-slate-100 text-xs italic">"{currentAiSubtitle}"</p>
                          </div>
                        )}
                        {currentUserSubtitle && (
                          <div className="text-left border-t border-slate-850 pt-1.5 mt-1.5">
                            <span className="text-[8px] font-mono text-purple-400 uppercase tracking-widest block font-bold">You (Spoken / Typed):</span>
                            <p className="text-slate-300 text-xs font-medium">"{currentUserSubtitle}"</p>
                          </div>
                        )}
                        {!currentAiSubtitle && !currentUserSubtitle && (
                          <div className="text-center py-2">
                            <p className="text-slate-500 text-[11px]">Subtitles transcribe live dialog. Start explaining your solution verbally to begin.</p>
                          </div>
                        )}
                      </div>

                      {/* Audiovisual Action Buttons Ribbon */}
                      <div className="flex flex-col sm:flex-row items-center justify-between border-t border-slate-850 pt-4 gap-3">
                        <div className="flex items-center space-x-2">
                          <button
                            onClick={() => setIsMuted(!isMuted)}
                            className={`p-2.5 rounded-lg border transition ${
                              isMuted 
                                ? 'bg-red-500/10 border-red-500 text-red-400' 
                                : 'bg-slate-900 border-slate-800 text-slate-350 hover:text-white'
                            }`}
                            title={isMuted ? "Unmute microphone" : "Mute microphone"}
                          >
                            {isMuted ? <MicOff className="h-4 w-4" /> : <Mic className="h-4 w-4" />}
                          </button>
                          <button
                            onClick={() => setIsCameraOn(!isCameraOn)}
                            className={`p-2.5 rounded-lg border transition ${
                              !isCameraOn 
                                ? 'bg-red-500/10 border-red-500 text-red-400' 
                                : 'bg-slate-900 border-slate-800 text-slate-350 hover:text-white'
                            }`}
                            title={isCameraOn ? "Mute camera feed" : "Unmute camera feed"}
                          >
                            {isCameraOn ? <Video className="h-4 w-4" /> : <VideoOff className="h-4 w-4" />}
                          </button>

                          <div className="flex gap-2">
                            <input
                              type="text"
                              value={userInput}
                              onChange={(e) => setUserInput(e.target.value)}
                              onKeyDown={(e) => {
                                if (e.key === 'Enter') {
                                  e.preventDefault();
                                  handleSendAnswer();
                                }
                              }}
                              placeholder="Type brief note or clarify text here..."
                              className="bg-slate-950 border border-slate-850 rounded-lg text-xs px-3 py-1.5 focus:border-indigo-500 outline-none w-[180px] text-slate-300 placeholder:text-slate-600 font-medium"
                            />
                            <button
                              onClick={handleSendAnswer}
                              disabled={!userInput.trim()}
                              className="bg-slate-850 hover:bg-slate-800 text-white rounded-lg p-1.5 border border-slate-800 transition disabled:opacity-40"
                            >
                              <Send className="h-3.5 w-3.5" />
                            </button>
                          </div>
                        </div>

                        <button
                          onClick={handleStopLiveInterview}
                          disabled={isAiThinking}
                          className="px-5 py-2.5 bg-red-600 hover:bg-red-500 text-white text-xs font-bold rounded-lg transition shadow-md flex items-center space-x-1.5"
                        >
                          <CheckCircle className="h-4 w-4" />
                          <span>{isAiThinking ? 'Evaluating...' : 'Complete Real-Time Interview'}</span>
                        </button>
                      </div>

                    </div>
                  ) : (
                    /* Immersive Text-Only Call chat logs panel precisely preserved */
                    <div className="flex-1 flex flex-col justify-between overflow-hidden">
                      
                      <div className="flex-1 overflow-y-auto p-6 space-y-6 max-h-[460px]">
                        {chatMessages.map((msg) => {
                          const isInterviewer = msg.role === 'interviewer';
                          return (
                            <div key={msg.id} className={`flex ${isInterviewer ? 'justify-start' : 'justify-end'} items-start space-x-3`}>
                              {isInterviewer && (
                                <div className="w-8 h-8 rounded-lg bg-indigo-600/15 border border-indigo-500/20 text-indigo-400 flex items-center justify-center flex-shrink-0 font-bold text-xs mt-1">
                                  HR
                                </div>
                              )}
                              
                              <div className="space-y-2 max-w-[85%]">
                                <div className={`p-4 rounded-2xl text-[12px] leading-relaxed font-sans shadow-sm ${
                                  isInterviewer 
                                    ? 'bg-slate-900 text-slate-100 border border-slate-850 rounded-tl-sm' 
                                    : 'bg-indigo-600 text-white rounded-tr-sm'
                                }`}>
                                  <p className="whitespace-pre-line">{msg.text}</p>
                                  <span className={`block text-[9px] text-right mt-1.5 select-none ${isInterviewer ? 'text-slate-500' : 'text-indigo-200 opacity-60'}`}>{msg.timestamp}</span>
                                </div>

                                {!isInterviewer && msg.feedback && (
                                  <motion.div
                                    initial={{ opacity: 0, y: 5 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    className="w-full bg-slate-900/80 border border-slate-800 rounded-xl p-4 space-y-3 shadow-inner text-xs text-slate-300"
                                  >
                                    <div className="flex items-center justify-between border-b border-slate-800 pb-2 mb-1.5">
                                      <span className="flex items-center space-x-1.5 text-[10.5px] font-bold text-indigo-400">
                                        <Sparkles className="h-3.5 w-3.5 animate-pulse text-indigo-400" />
                                        <span>Technical Assessment Report</span>
                                      </span>
                                      <div className="flex items-center space-x-1.5">
                                        <span className="px-2 py-0.5 rounded-md font-mono text-[9.5px] font-semibold bg-slate-950 text-slate-400 border border-slate-850">
                                          Accuracy: {msg.feedback.technicalAccuracy}
                                        </span>
                                        <span className={`px-2 py-0.5 rounded-md font-mono text-[9.5px] font-bold border ${
                                          msg.feedback.score >= 8
                                            ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20'
                                            : 'bg-amber-500/10 text-amber-400 border-amber-500/20'
                                        }`}>
                                          Score: {msg.feedback.score}/10
                                        </span>
                                      </div>
                                    </div>

                                    <div className="space-y-2">
                                      <div>
                                        <span className="text-[10px] text-slate-500 font-mono block uppercase">Critique</span>
                                        <p className="text-[11px] text-slate-300 leading-relaxed mt-0.5 whitespace-pre-line">{msg.feedback.critique}</p>
                                      </div>
                                      <div className="pt-1.5 border-t border-slate-850">
                                        <span className="text-[10px] text-slate-500 font-mono block uppercase">Recruiter Suggestions</span>
                                        <p className="text-[11px] text-indigo-300 leading-relaxed mt-0.5 whitespace-pre-line">{msg.feedback.suggestions}</p>
                                      </div>
                                    </div>
                                  </motion.div>
                                )}
                              </div>

                              {!isInterviewer && (
                                <div className="w-8 h-8 rounded-lg bg-indigo-500/15 border border-indigo-500/25 text-indigo-300 flex items-center justify-center flex-shrink-0 font-bold text-xs mt-1">
                                  ME
                                </div>
                              )}
                            </div>
                          );
                        })}

                        {isAiThinking && (
                          <div className="flex justify-start items-start space-x-3">
                            <div className="w-8 h-8 rounded-lg bg-indigo-600/15 border border-indigo-500/20 text-indigo-400 flex items-center justify-center flex-shrink-0 font-bold text-xs mt-1 animate-pulse">
                              HR
                            </div>
                            <div className="bg-slate-900 border border-slate-850 text-slate-400 rounded-2xl rounded-tl-sm p-4 text-[11px] font-mono flex items-center space-x-2">
                              <span className="relative flex h-2 w-2">
                                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-purple-400 opacity-75"></span>
                                <span className="relative inline-flex rounded-full h-2 w-2 bg-purple-500"></span>
                              </span>
                              <span className="text-slate-400 font-sans">Recruiter is parsing concepts and framing follow-ups...</span>
                            </div>
                          </div>
                        )}

                        {interviewError && (
                          <div className="p-4 bg-red-950/15 border border-red-900/30 text-red-400 text-xs rounded-xl flex items-start space-x-2">
                            <AlertCircle className="h-4.5 w-4.5 mt-0.5 flex-shrink-0" />
                            <div className="space-y-1">
                              <span className="font-bold block">Developer Screening Setup Error</span>
                              <p className="text-[11px] leading-relaxed text-red-300">{interviewError}</p>
                              <span className="block text-[10px] pt-1 text-red-500 font-mono">Tip: Configure your Google Gemini API Key inside Settings &rarr; Secrets panel.</span>
                            </div>
                          </div>
                        )}
                      </div>

                      {/* Chat text input bar */}
                      <div className="px-6 py-4 bg-slate-900/20 border-t border-slate-850 flex-shrink-0 space-y-2">
                        <div className="flex gap-3">
                          <textarea
                            rows={2}
                            value={userInput}
                            onChange={(e) => setUserInput(e.target.value)}
                            onKeyDown={(e) => {
                              if (e.key === 'Enter' && !e.shiftKey) {
                                e.preventDefault();
                                handleSendAnswer();
                              }
                            }}
                            disabled={isAiThinking}
                            placeholder="Type your comprehensive technical answer explanations here ... (Press Enter to submit, Shift+Enter for new line)"
                            className="flex-1 bg-slate-950 border border-slate-850 focus:border-indigo-500 outline-none text-[12px] p-3 rounded-xl text-slate-200 placeholder:text-slate-600 transition resize-none leading-relaxed"
                          />
                          <button
                            onClick={handleSendAnswer}
                            disabled={isAiThinking || !userInput.trim()}
                            className="px-5 bg-indigo-600 hover:bg-indigo-500 disabled:bg-slate-900 disabled:text-slate-600 border border-transparent disabled:border-slate-850 text-white rounded-xl flex items-center justify-center transition flex-shrink-0 font-semibold text-xs"
                            title="Send technical response"
                          >
                            <Send className="h-4 w-4" />
                          </button>
                        </div>
                        <div className="flex items-center justify-between text-[10px] text-slate-500 font-mono px-1">
                          <span>Explain edge-cases, memory footprints, and complexity limits.</span>
                          {isAiThinking && <span className="text-purple-400 animate-pulse uppercase tracking-wider">Evaluating transcript...</span>}
                        </div>
                      </div>

                    </div>
                  )}

                </div>
              )}
            </div>
          </motion.div>

        )}
      </AnimatePresence>
    </div>
  );
}
