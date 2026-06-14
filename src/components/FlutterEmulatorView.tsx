/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { Smartphone, Wifi, Battery, Copy, Check, FileCode, AppWindow, Settings, RefreshCw } from 'lucide-react';
import { DatabaseState } from '../types';
import { COURSES, DSA_PROBLEMS } from '../mockData';

interface FlutterEmulatorViewProps {
  dbState: DatabaseState;
}

export default function FlutterEmulatorView({ dbState }: FlutterEmulatorViewProps) {
  const [activeSubTab, setActiveSubTab] = useState<'mirror' | 'dart' | 'pubspec'>('mirror');
  const [copied, setCopied] = useState<boolean>(false);

  // Compute stats
  const totalLessons = COURSES.reduce((sum, course) => sum + course.lessons.length, 0);
  const completedLessons = Object.values(dbState.courses).reduce((sum, list) => sum + list.length, 0);
  const dsaSolved = Object.values(dbState.dsa).filter(u => u.status === 'solved').length;

  const flutterDartCode = `// lib/services/firebase_sync_service.dart
import 'package:cloud_firestore/cloud_firestore.dart';
import 'package:firebase_auth/firebase_auth.dart';

class FirebaseSyncService {
  final FirebaseFirestore _firestore = FirebaseFirestore.instance;
  final FirebaseAuth _auth = FirebaseAuth.instance;

  // Stream user education progress directly to mobile app
  Stream<DocumentSnapshot> getUserProfileStream() {
    final String? uid = _auth.currentUser?.uid;
    if (uid == null) {
      throw Exception("User is not signed in to sync mobile status.");
    }
    return _firestore.collection('users').doc(uid).snapshots();
  }

  // Stream Course Lesson records
  Stream<QuerySnapshot> getCourseProgressStream() {
    final String? uid = _auth.currentUser?.uid;
    return _firestore
        .collection('users')
        .doc(uid)
        .collection('courseProgress')
        .snapshots();
  }

  // Sync mobile compilation details back to Cloud Firestore
  Future<void> updateCourseProgress(String courseId, List<String> completed, double progress) async {
    final String? uid = _auth.currentUser?.uid;
    if (uid == null) return;

    await _firestore
        .collection('users')
        .doc(uid)
        .collection('courseProgress')
        .doc(courseId)
        .set({
      'courseId': courseId,
      'userId': uid,
      'completedLessons': completed,
      'progressPercentage': progress,
      'lastAccessedAt': FieldValue.serverTimestamp(),
    }, SetOptions(merge: true));
  }
}`;

  const pubspecYaml = `# pubspec.yaml
dependencies:
  flutter:
    sdk: flutter
  
  # Official Firebase and Firestore modules
  firebase_core: ^2.24.2
  firebase_auth: ^4.15.3
  cloud_firestore: ^4.13.3
  
  # Dynamic animations matching motion
  flutter_animate: ^4.2.0.1
  lucide_icons: ^0.300.0`;

  const handleCopy = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-5 gap-8 items-stretch h-full animate-fade-in">
      
      {/* Device frame (Left Column) */}
      <div className="lg:col-span-2 flex flex-col items-center justify-start bg-slate-950/20 py-4">
        
        {/* Smartphone Container Outer */}
        <div className="relative w-[310px] h-[610px] bg-slate-900 border-[10px] border-slate-950 rounded-[48px] shadow-2xl flex flex-col overflow-hidden">
          {/* Phone Ear Piece Notch */}
          <div className="absolute top-0 left-1/2 transform -translate-x-1/2 w-32 h-6 bg-slate-950 rounded-b-2xl z-50 flex items-center justify-center space-x-1">
            <span className="h-1.5 w-1.5 rounded-full bg-slate-800" />
            <span className="h-1 w-8 rounded-full bg-slate-850" />
          </div>

          {/* Device Screen Area */}
          <div className="flex-1 flex flex-col bg-slate-950 relative select-none">
            
            {/* Status Bar */}
            <div className="h-7 px-6 pt-2 bg-indigo-950 flex items-center justify-between text-slate-400 text-[10px] font-mono z-40">
              <span>06:52 UTC</span>
              <div className="flex items-center space-x-1">
                <Wifi className="h-3 w-3 text-slate-300" />
                <Battery className="h-3.5 w-3.5 text-slate-300 fill-slate-300" />
              </div>
            </div>

            {/* Mobile Header */}
            <div className="p-4 bg-indigo-950 border-b border-indigo-900 flex items-center justify-between z-30">
              <span className="text-xs font-bold text-white tracking-tight">MNtech.sols Mobile Dashboard</span>
              <span className="text-[9px] px-2 py-0.5 bg-emerald-500/20 text-emerald-400 font-bold rounded-full uppercase animate-pulse flex items-center space-x-1">
                <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 mr-1 inline-block" />
                Synced
              </span>
            </div>

            {/* Phone Screen body scroll */}
            <div className="flex-1 p-4 overflow-y-auto space-y-4 text-xs font-sans text-slate-300">
              
              {/* Profile Bar */}
              <div className="flex items-center space-x-3 bg-slate-900 p-3 rounded-xl border border-slate-850">
                <div className="w-8 h-8 rounded-full bg-indigo-600 flex items-center justify-center text-[10.5px] font-bold text-white">
                  {dbState.profile?.displayName ? dbState.profile.displayName[0] : 'S'}
                </div>
                <div>
                  <h4 className="text-[11px] font-bold text-slate-100">{dbState.profile?.displayName || 'Guest Developer'}</h4>
                  <p className="text-[9.5px] text-slate-500 font-mono">ID: {dbState.profile?.userId?.substring(0, 10)}...</p>
                </div>
              </div>

              {/* Progress Summary Card */}
              <div className="bg-gradient-to-br from-indigo-900/60 to-purple-900/30 border border-indigo-800/40 p-4 rounded-xl space-y-3">
                <span className="text-[10px] font-bold text-indigo-400 block tracking-wider uppercase">Active Progress Stats</span>
                
                <div className="grid grid-cols-2 gap-2 text-center text-[10.5px] font-mono">
                  <div className="p-2 bg-slate-950/80 rounded-lg">
                    <span className="text-slate-400 block text-[9.5px]">Lessons</span>
                    <span className="text-xs font-bold text-white">{completedLessons}/{totalLessons}</span>
                  </div>
                  <div className="p-2 bg-slate-950/80 rounded-lg">
                    <span className="text-slate-400 block text-[9.5px]">DSA</span>
                    <span className="text-xs font-bold text-emerald-400">{dsaSolved} solved</span>
                  </div>
                </div>
              </div>

              {/* Solved Courses Logs */}
              <div className="space-y-2">
                <span className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider block">Course Integrities</span>
                
                {COURSES.map(c => {
                  const completedLessons = dbState.courses[c.id] || [];
                  let ratio = 0;
                  if (c.sections && c.sections.length > 0) {
                    const completedSecs = c.sections.filter(sec => 
                      sec.topics.every(t => completedLessons.includes(t.topic_id))
                    ).length;
                    ratio = completedSecs / c.sections.length;
                  } else {
                    ratio = c.lessons.length === 0 ? 0 : completedLessons.length / c.lessons.length;
                  }
                  return (
                    <div key={c.id} className="p-3 bg-slate-900 rounded-lg border border-slate-850 flex items-center justify-between">
                      <span className="text-[11px] text-slate-200 capitalize font-medium">{c.language} Language</span>
                      <div className="flex items-center space-x-2">
                        <span className="text-[10.5px] text-indigo-400 font-bold font-mono">{Math.round(ratio * 100)}%</span>
                        <div className="h-1.5 w-12 bg-slate-950 rounded-full overflow-hidden">
                          <div className="h-full bg-indigo-500" style={{ width: `${ratio * 100}%` }} />
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Developer Database sync packet logs */}
              <div className="p-3 bg-slate-950 border border-slate-900 rounded-xl space-y-1.5 font-mono text-[9px] leading-relaxed">
                <div className="flex items-center justify-between text-slate-600">
                  <span>PACKET LOGS</span>
                  <RefreshCw className="h-2.5 w-2.5 text-emerald-500 animate-spin" />
                </div>
                <p className="text-indigo-400">CONNECTING /databases/(default)/users/student_guest_uid</p>
                <p className="text-slate-400">STREAMS ON_SNAPSHOT: OK</p>
                <p className="text-emerald-500">PACKET RX: courseProgress={JSON.stringify(dbState.courses)}</p>
              </div>

            </div>

            {/* Bottom virtual home button spacer */}
            <div className="h-6 bg-slate-950 flex items-center justify-center p-1.5 z-40">
              <span className="h-1 w-20 bg-slate-800 rounded-full" />
            </div>

          </div>
        </div>

        <p className="text-slate-500 text-[10px] font-mono mt-3">High-integrity live rendering sync emulation</p>
      </div>

      {/* Code reference documentation (Right Column) */}
      <div className="lg:col-span-3 flex flex-col bg-slate-900/40 border border-slate-800 rounded-2xl overflow-hidden shadow-2xl">
        
        {/* Navigation Tab selection inside details */}
        <div className="flex bg-slate-950 border-b border-slate-800/90 px-4">
          <button
            onClick={() => setActiveSubTab('mirror')}
            className={`px-4 py-3 text-xs font-semibold border-b-2 transition ${
              activeSubTab === 'mirror' 
                ? 'border-indigo-500 text-indigo-400' 
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            Flutter Synchronizer Architecture
          </button>
          
          <button
            onClick={() => setActiveSubTab('dart')}
            className={`px-4 py-3 text-xs font-semibold flex items-center space-x-1.5 border-b-2 transition ${
              activeSubTab === 'dart' 
                ? 'border-indigo-500 text-indigo-400' 
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <FileCode className="h-3.5 w-3.5 text-blue-400" />
            <span>sync_service.dart</span>
          </button>

          <button
            onClick={() => setActiveSubTab('pubspec')}
            className={`px-4 py-3 text-xs font-semibold flex items-center space-x-1.5 border-b-2 transition ${
              activeSubTab === 'pubspec' 
                ? 'border-indigo-500 text-indigo-400' 
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <span>pubspec.yaml</span>
          </button>
        </div>

        {/* Dynamic Detail Body panel */}
        <div className="flex-1 p-6 overflow-y-auto leading-normal text-xs text-slate-300">
          {activeSubTab === 'mirror' && (
            <div className="space-y-6">
              <div>
                <h3 className="text-sm font-bold text-white font-sans">Multiplatform Firebase Progress Sync</h3>
                <p className="text-slate-400 text-xs mt-0.5">How your Android mobile client syncs state with the Web backend</p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="p-4 bg-slate-950 rounded-xl space-y-2">
                  <h4 className="font-bold text-xs text-indigo-400 flex items-center space-x-2">
                    <span className="w-1.5 h-1.5 bg-indigo-400 rounded-full" />
                    <span>Attribute-Based Matching</span>
                  </h4>
                  <p className="text-[11px] text-slate-400 leading-normal">
                    Due to matching Document paths (<span className="font-mono bg-slate-900 px-1 py-0.5 rounded text-indigo-300">/users/uid/...</span>), progress resolved inside the Web dashboard compiles cleanly into public Firestore registries which the Android Flutter snapshots pull instantly.
                  </p>
                </div>

                <div className="p-4 bg-slate-950 rounded-xl space-y-2">
                  <h4 className="font-bold text-xs text-emerald-400 flex items-center space-x-2">
                    <span className="w-1.5 h-1.5 bg-emerald-400 rounded-full" />
                    <span>Real-time Streams</span>
                  </h4>
                  <p className="text-[11px] text-slate-400 leading-normal">
                    The Flutter app uses Dart's <span className="font-mono bg-slate-900 px-1 py-0.5 rounded text-emerald-300">snapshots()</span> API for persistent real-time streaming, which ensures instant, sub-second progress updates whenever the student solves compile challenges.
                  </p>
                </div>
              </div>

              <div className="p-4 bg-indigo-950/20 border border-indigo-900/30 rounded-xl space-y-1">
                <span className="font-bold text-indigo-300">Database Schema Replication:</span>
                <p className="text-slate-400 text-[11px] pt-1">
                  Both Web and Phone access the exact same structure declared in the <span className="font-semibold text-slate-200">firebase-blueprint.json</span>. By keeping rules securely locked behind owner checking and strict validators, cheating or spoofing is programmatically impossible!
                </p>
              </div>
            </div>
          )}

          {activeSubTab === 'dart' && (
            <div className="space-y-4">
              <div className="flex justify-between items-center bg-slate-950 px-4 py-2 border border-slate-800 rounded-lg">
                <span className="font-mono text-slate-400 text-[11px]">Flutter Firestore Sync Service</span>
                <button
                  onClick={() => handleCopy(flutterDartCode)}
                  className="flex items-center space-x-1 text-[11px] text-indigo-400 hover:text-white font-bold font-mono py-1 rounded transition"
                >
                  {copied ? <Check className="h-3 w-3 text-emerald-400" /> : <Copy className="h-3 w-3" />}
                  <span>{copied ? 'Copied Dart!' : 'Copy Code'}</span>
                </button>
              </div>

              <pre className="p-4 bg-slate-950 border border-slate-900 text-slate-300 font-mono text-[10.5px] rounded-xl overflow-x-auto whitespace-pre max-h-[400px]">
                {flutterDartCode}
              </pre>
            </div>
          )}

          {activeSubTab === 'pubspec' && (
            <div className="space-y-4">
              <div className="flex justify-between items-center bg-slate-950 px-4 py-2 border border-slate-800 rounded-lg">
                <span className="font-mono text-slate-400 text-[11px]">Add to pubspec.yaml dependencies</span>
                <button
                  onClick={() => handleCopy(pubspecYaml)}
                  className="flex items-center space-x-1 text-[11px] text-indigo-400 hover:text-white font-bold font-mono py-1 rounded transition"
                >
                  {copied ? <Check className="h-3 w-3 text-emerald-400" /> : <Copy className="h-3 w-3" />}
                  <span>{copied ? 'Copied pubspec!' : 'Copy YAML'}</span>
                </button>
              </div>

              <pre className="p-4 bg-slate-950 border border-slate-900 text-slate-300 font-mono text-[11px] rounded-xl overflow-x-auto whitespace-pre">
                {pubspecYaml}
              </pre>
            </div>
          )}
        </div>

      </div>

    </div>
  );
}
