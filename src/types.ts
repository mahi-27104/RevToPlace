/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export type Language = 'python' | 'java' | 'c' | 'cpp' | 'javascript';

export interface QuizQuestion {
  q: string;
  options: string[];
  answer: string; // The correct option string
}

export interface Topic {
  topic_id: string;
  title: string;
  description: string;
  content: string; // Markdown text
  starterCode?: string;
  solution?: string;
  expectedOutput?: string;
  quiz: QuizQuestion[];
}

export interface Section {
  section_name: string;
  topics: Topic[];
}

export interface Lesson {
  id: string;
  title: string;
  description: string;
  content: string; // Markdown text
  starterCode: string;
  solution: string;
  expectedOutput: string;
}

export interface Course {
  id: string;
  title: string;
  description: string;
  language: Language;
  sections?: Section[];
  lessons: Lesson[]; // Keep for backwards compatibility
}

export interface DSAProblem {
  id: string;
  title: string;
  difficulty: 'Easy' | 'Medium' | 'Hard';
  category: string;
  description: string;
  starterCode: string;
  solution: string;
  language: Language;
  testCases: {
    input: string;
    expected: string;
  }[];
}

export interface MockQuestion {
  id: string;
  text: string;
  options: string[];
  correctAnswerIndex: number;
}

export interface MockTest {
  id: string;
  title: string;
  durationMinutes: number;
  category: 'Python' | 'Java' | 'C' | 'DSA' | 'General' | 'Placement';
  questions: MockQuestion[];
}

export interface UserProfile {
  userId: string;
  email: string;
  displayName: string;
  photoURL?: string;
  createdAt: string;
  updatedAt: string;
}

export interface DatabaseState {
  profile: UserProfile | null;
  courses: { [courseId: string]: string[] }; // completed lesson IDs
  dsa: { [problemId: string]: { status: 'solved' | 'attempted'; code: string; language: string; attemptsCount: number } };
  mockTests: { [testId: string]: { score: number; totalQuestions: number; completedAt: string } };
}
