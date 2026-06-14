/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { Course, DSAProblem, MockTest, Lesson } from './types';
import { STRUCTURED_COURSES } from './structuredCoursesData';

export const COURSES: Course[] = Object.keys(STRUCTURED_COURSES).map(key => {
  const sCourse = STRUCTURED_COURSES[key];
  const flatLessons: Lesson[] = [];
  
  sCourse.sections.forEach((section: any) => {
    section.topics.forEach((topic: any) => {
      flatLessons.push({
        id: topic.topic_id,
        title: topic.title,
        description: topic.description,
        content: topic.content,
        starterCode: topic.starterCode || '',
        solution: topic.solution || '',
        expectedOutput: topic.expectedOutput || ''
      });
    });
  });

  return {
    id: key,
    title: sCourse.title,
    description: sCourse.description,
    language: sCourse.language,
    sections: sCourse.sections,
    lessons: flatLessons
  };
});


import { DSA_PROBLEMS as PARSED_DSA_PROBLEMS } from './dsaProblemsData';
export const DSA_PROBLEMS = PARSED_DSA_PROBLEMS;

export const MOCK_TESTS: MockTest[] = [
  {
    id: 'test-01',
    title: 'Technical Screening Mock Assesment',
    durationMinutes: 20,
    category: 'Placement',
    questions: [
      {
        id: 'q-01',
        text: 'What is the time complexity of looking up a key inside a standard HashTable/HashMap in the average case?',
        options: ['O(1)', 'O(log N)', 'O(N)', 'O(N log N)'],
        correctAnswerIndex: 0
      },
      {
        id: 'q-02',
        text: 'In Python, which built-in function returns both the element index and the value in a loop?',
        options: ['range()', 'enumerate()', 'zip()', 'map()'],
        correctAnswerIndex: 1
      },
      {
        id: 'q-03',
        text: 'What is the absolute risk of an uninitialized pointer in C called?',
        options: ['Stack overflow', 'Null Pointer Dereference & Wild undefined pointers', 'Memory alignment crash', 'Segmentation Leak'],
        correctAnswerIndex: 1
      },
      {
        id: 'q-04',
        text: 'Which Java memory component stores local primitive variables inside method blocks?',
        options: ['Heap memory', 'Stack memory', 'Global registers', 'Static memory pool'],
        correctAnswerIndex: 1
      },
      {
        id: 'q-05',
        text: 'If we perform an In-order traversal (Left, Root, Right) on a valid Binary Search Tree (BST), what traversal sequence order do we get?',
        options: ['The level-order sequence', 'A strictly sorted ascending sequence', 'A descending sorted sequence', 'The reverse post-order sequence'],
        correctAnswerIndex: 1
      }
    ]
  },
  {
    id: 'test-02',
    title: 'Data Structures Mastery Exam',
    durationMinutes: 15,
    category: 'DSA',
    questions: [
      {
        id: 'dq-01',
        text: 'Which data structure follows the strict LIFO (Last In First Out) principle?',
        options: ['Queue', 'Stack', 'Doubly Linked List', 'Max Heap'],
        correctAnswerIndex: 1
      },
      {
        id: 'dq-02',
        text: 'In a graph with V vertices and E edges, which algorithm resolves the Single-Source Shortest Path (SSSP) when edge weights are positive?',
        options: ['Kruskal\'s Algorithm', 'Dijkstra\'s Algorithm', 'Kahn\'s Algorithm', 'Bellman-Ford Algorithm'],
        correctAnswerIndex: 1
      },
      {
        id: 'dq-03',
        text: 'What is the worst-case lookup time inside a Binary Search Tree (BST) of depth/height H that is completely unbalanced (skewed)?',
        options: ['O(1)', 'O(log N)', 'O(N)', 'O(H^2)'],
        correctAnswerIndex: 2
      },
      {
        id: 'dq-04',
        text: 'Which of the following sorting algorithms is NOT stable by default?',
        options: ['Merge Sort', 'Insertion Sort', 'Quick Sort', 'Bubble Sort'],
        correctAnswerIndex: 2
      },
      {
        id: 'dq-05',
        text: 'What is the primary utility of a Bloom Filter?',
        options: ['Sort items in sub-linear time', 'Confirm exact sequence patterns in text searches', 'Test set membership in constant time (may contain false positives, but never false negatives)', 'Encrypt binary byte streams'],
        correctAnswerIndex: 2
      }
    ]
  }
];

export const MOCK_INTERVIEW_QUESTIONS = [
  "Take a deep breath and tell me about yourself. What are your primary language choices, and what project built on this platform are you most proud of?",
  "How do you compare the automatic garbage collection of Java's JVM with manual memory management (malloc/free) in C/C++?",
  "A client database operation experiences high read count latency. How would you design a caching tier using Redis or Firestore to alleviate this bottleneck?",
  "Walk me through the conceptual steps of building a real-time collaborative code-editing canvas. What protocols would you select?",
  "Tell me about a complex technical dispute you had with a team member during a programming project. How did you resolve it?"
];
