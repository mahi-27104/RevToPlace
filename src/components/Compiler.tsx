/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */
import Editor from "@monaco-editor/react";
import React, { useState, useEffect, useRef, useMemo } from 'react';
import { Play, RotateCcw, AlertTriangle, Terminal, CheckCircle2, Cpu, Sparkles, BookOpen, Settings } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import ReactMarkdown from 'react-markdown';
import { Language, DSAProblem } from '../types';
import { getBoilerplateForProblem } from '../utils/boilerplateMapper';

interface CompilerProps {
  key?: string;
  initialLanguage: Language;
  initialCode: string;
  expectedOutput?: string;
  onSuccess?: (code: string) => void;
  onChange?: (code: string) => void;
  currentProblem?: DSAProblem;
}

const RUNTIME_VERSIONS: Record<string, string> = {
  python: '3.10.0',
  java: '15.0.2',
  c: '10.2.0',
  cpp: '10.2.0',
  javascript: '18.15.0'
};

const ANCHOR_TEXT = '// Write your code here';

const DEFAULT_STARTER_CODES: Record<Language, string> = {
  python: `# Python Execution Sandbox\n\ndef solve():\n    print("Hello, DSA Sandbox!")\n\nsolve()\n`,
  javascript: `// JavaScript Execution Sandbox\n\nfunction solve() {\n    console.log("Hello, DSA Sandbox!");\n}\n\nsolve();\n`,
  java: `// Java Execution Sandbox\n\npublic class Main {\n    public static void main(String[] args) {\n        System.out.println("Hello, DSA Sandbox!");\n    }\n}\n`,
  c: `// C Execution Sandbox\n\n#include <stdio.h>\n\nint main() {\n    printf("Hello, DSA Sandbox!\\n");\n    return 0;\n}\n`,
  cpp: `// C++ Execution Sandbox\n\n#include <iostream>\nusing namespace std;\n\nint main() {\n    cout << "Hello, DSA Sandbox!" << endl;\n    return 0;\n}\n`
};

export interface Token {
  type: 'keyword' | 'type' | 'string' | 'comment' | 'number' | 'function' | 'text';
  value: string;
}

// Zero-dependency compiler high performance lexical tokenizer
function tokenizeCode(code: string, lang: string): Token[] {
  const keywords = new Set<string>();
  const types = new Set<string>();
  
  if (lang === 'python') {
    ['def', 'class', 'import', 'from', 'return', 'for', 'while', 'if', 'elif', 'else', 
     'in', 'is', 'and', 'or', 'not', 'True', 'False', 'None', 'lambda', 'try', 'except', 
     'as', 'pass', 'with', 'print', 'len', 'range', 'append', 'list', 'dict', 'set', 'int', 'str'].forEach(k => keywords.add(k));
  } else if (lang === 'javascript') {
    ['const', 'let', 'var', 'function', 'return', 'for', 'while', 'if', 'else', 
     'import', 'export', 'from', 'try', 'catch', 'class', 'extends', 'new', 'this', 
     'typeof', 'instanceof', 'true', 'false', 'null', 'undefined', 'async', 'await', 'console', 'log'].forEach(k => keywords.add(k));
  } else if (lang === 'java') {
    ['public', 'private', 'protected', 'class', 'interface', 'enum', 'extends', 
     'implements', 'import', 'package', 'return', 'for', 'while', 'if', 'else', 
     'try', 'catch', 'new', 'this', 'super', 'static', 'final', 'void', 'null', 'true', 'false'].forEach(k => keywords.add(k));
    ['int', 'double', 'float', 'char', 'boolean', 'long', 'short', 'byte', 'String', 'System', 'Math', 'List', 'ArrayList', 'HashMap', 'Map', 'Set', 'HashSet'].forEach(t => types.add(t));
  } else if (lang === 'c' || lang === 'cpp') {
    ['return', 'if', 'else', 'for', 'while', 'switch', 'case', 'default', 'break', 
     'continue', 'static', 'extern', 'using', 'namespace', 'std', 'include', 'define', 'class', 'public', 'private', 'protected', 'new', 'delete', 'template'].forEach(k => keywords.add(k));
    ['int', 'char', 'float', 'double', 'void', 'struct', 'typedef', 'bool', 'string', 'vector', 'size_t', 'cout', 'cin', 'endl', 'printf', 'scanf'].forEach(t => types.add(t));
  }

  const tokens: Token[] = [];
  let i = 0;
  const len = code.length;

  while (i < len) {
    const char = code[i];

    // Single-line or Multi-line Comments
    if (lang === 'python') {
      if (char === '#') {
        let commentVal = '';
        while (i < len && code[i] !== '\n') {
          commentVal += code[i];
          i++;
        }
        tokens.push({ type: 'comment', value: commentVal });
        continue;
      }
    } else {
      // C-style comments
      if (char === '/' && i + 1 < len && code[i + 1] === '/') {
        let commentVal = '';
        while (i < len && code[i] !== '\n') {
          commentVal += code[i];
          i++;
        }
        tokens.push({ type: 'comment', value: commentVal });
        continue;
      }
      if (char === '/' && i + 1 < len && code[i + 1] === '*') {
        let commentVal = '/*';
        i += 2;
        while (i < len && !(code[i] === '*' && i + 1 < len && code[i + 1] === '/')) {
          commentVal += code[i];
          i++;
        }
        if (i < len) {
          commentVal += '*/';
          i += 2;
        }
        tokens.push({ type: 'comment', value: commentVal });
        continue;
      }
    }

    // Double-quote Strings
    if (char === '"') {
      let strVal = '"';
      i++;
      while (i < len && code[i] !== '"') {
        if (code[i] === '\\' && i + 1 < len) {
          strVal += '\\' + code[i + 1];
          i += 2;
        } else {
          strVal += code[i];
          i++;
        }
      }
      if (i < len && code[i] === '"') {
        strVal += '"';
        i++;
      }
      tokens.push({ type: 'string', value: strVal });
      continue;
    }

    // Single-quote Strings / Characters
    if (char === "'") {
      let strVal = "'";
      i++;
      while (i < len && code[i] !== "'") {
        if (code[i] === '\\' && i + 1 < len) {
          strVal += '\\' + code[i + 1];
          i += 2;
        } else {
          strVal += code[i];
          i++;
        }
      }
      if (i < len && code[i] === "'") {
        strVal += "'";
        i++;
      }
      tokens.push({ type: 'string', value: strVal });
      continue;
    }

    // Multi-line Strings / Tri-Quotes in python or Template Literals in JS
    if (lang === 'python' && char === '"' && i + 2 < len && code[i + 1] === '"' && code[i + 2] === '"') {
      let strVal = '"""';
      i += 3;
      while (i < len && !(code[i] === '"' && i + 2 < len && code[i + 1] === '"' && code[i + 2] === '"')) {
        strVal += code[i];
        i++;
      }
      if (i < len) {
        strVal += '"""';
        i += 3;
      }
      tokens.push({ type: 'comment', value: strVal });
      continue;
    }
    if (lang === 'javascript' && char === '`') {
      let strVal = '`';
      i++;
      while (i < len && code[i] !== '`') {
        if (code[i] === '\\' && i + 1 < len) {
          strVal += '\\' + code[i + 1];
          i += 2;
        } else {
          strVal += code[i];
          i++;
        }
      }
      if (i < len && code[i] === '`') {
        strVal += '`';
        i++;
      }
      tokens.push({ type: 'string', value: strVal });
      continue;
    }

    // C-preprocessor directives like #include
    if ((lang === 'c' || lang === 'cpp') && char === '#') {
      let preVal = '#';
      i++;
      while (i < len && /[a-zA-Z]/.test(code[i])) {
        preVal += code[i];
        i++;
      }
      tokens.push({ type: 'keyword', value: preVal });
      continue;
    }

    // Numbers
    if (/[0-9]/.test(char)) {
      let numVal = '';
      while (i < len && /[0-9\.]/.test(code[i])) {
        numVal += code[i];
        i++;
      }
      tokens.push({ type: 'number', value: numVal });
      continue;
    }

    // Identifiers & Keywords
    if (/[a-zA-Z_]/.test(char)) {
      let idVal = '';
      while (i < len && /[a-zA-Z0-9_]/.test(code[i])) {
        idVal += code[i];
        i++;
      }

      // Check for function calls (next non-whitespace char is '(')
      let tempI = i;
      while (tempI < len && /\s/.test(code[tempI])) {
        tempI++;
      }
      const isFunc = tempI < len && code[tempI] === '(';

      if (keywords.has(idVal)) {
        tokens.push({ type: 'keyword', value: idVal });
      } else if (types.has(idVal)) {
        tokens.push({ type: 'type', value: idVal });
      } else if (isFunc) {
        tokens.push({ type: 'function', value: idVal });
      } else {
        tokens.push({ type: 'text', value: idVal });
      }
      continue;
    }

    // Normal Text / Symbols
    tokens.push({ type: 'text', value: char });
    i++;
  }

  return tokens;
}

interface ConsoleCoordinates {
  lineNumber: number;
  column: number;
}

const parseLogLineCoordinates = (lineText: string, lang: string): ConsoleCoordinates | null => {
  let lineNum: number | null = null;
  let colNum: number | null = null;

  // Pattern 1: main.cpp:12:8: error... (or similar :line:col:)
  const fileLineColMatch = lineText.match(/(?:\w+\.\w+):(\d+):(\d+)/);
  if (fileLineColMatch) {
    lineNum = parseInt(fileLineColMatch[1], 10);
    colNum = parseInt(fileLineColMatch[2], 10);
  }

  if (lineNum === null) {
    // Pattern 2: Main.java:6: error... (or similar :line:)
    const fileLineMatch = lineText.match(/(?:\w+\.\w+):(\d+)/);
    if (fileLineMatch) {
      lineNum = parseInt(fileLineMatch[1], 10);
      colNum = 1;
    }
  }

  if (lineNum === null) {
    // Pattern 3: Python traceback: File "main.py", line 4, in ...
    const pythonMatch = lineText.match(/line\s+(\d+)/i);
    if (pythonMatch) {
      lineNum = parseInt(pythonMatch[1], 10);
      colNum = 1;
    }
  }

  if (lineNum === null) {
    // Pattern 4: JS error: at Object.<anonymous> (test.js:12:34) or similar
    const jsFileLineColMatch = lineText.match(/:(\d+):(\d+)/);
    if (jsFileLineColMatch) {
      lineNum = parseInt(jsFileLineColMatch[1], 10);
      colNum = parseInt(jsFileLineColMatch[2], 10);
    }
  }

  if (lineNum === null) {
    // Pattern 5: Generic col X line Y indicator
    const genericColLine = lineText.match(/col(?:umn)?\s*(\d+).*line\s*(\d+)/i);
    if (genericColLine) {
      colNum = parseInt(genericColLine[1], 10);
      lineNum = parseInt(genericColLine[2], 10);
    } else {
      const genericLineCol = lineText.match(/line\s*(\d+).*col(?:umn)?\s*(\d+)/i);
      if (genericLineCol) {
        lineNum = parseInt(genericLineCol[1], 10);
        colNum = parseInt(genericLineCol[2], 10);
      }
    }
  }

  if (lineNum === null) {
    // Last resort generic line fallback: "line X"
    const genericLineOnly = lineText.match(/line\s*(\d+)/i);
    if (genericLineOnly) {
      lineNum = parseInt(genericLineOnly[1], 10);
      colNum = 1;
    }
  }

  if (lineNum !== null && !isNaN(lineNum)) {
    return {
      lineNumber: Math.max(1, lineNum),
      column: colNum && !isNaN(colNum) ? Math.max(1, colNum) : 1
    };
  }

  return null;
};

interface TerminalConsoleProps {
  output: string;
  stderr: string;
  isRunning: boolean;
  expectedOutput?: string;
  parsedErrorLine: number | null;
  customCodeErrLine: number | null;
  isAnalyzingError: boolean;
  aiFixExplanation: string;
  isMatch: boolean | null;
  compilationEngine: string;
  language: string;
  onLineFocus: (rawLine: number, rawColumn: number) => void;
}

const TerminalConsole: React.FC<TerminalConsoleProps> = ({
  output,
  stderr,
  isRunning,
  expectedOutput,
  parsedErrorLine,
  customCodeErrLine,
  isAnalyzingError,
  aiFixExplanation,
  isMatch,
  compilationEngine,
  language,
  onLineFocus
}) => {
  // Helper to render lines with clickable jump features if they contain file name/line indicators
  const renderClickableTerminalLines = (text: string, isError: boolean) => {
    const rawLines = text.split('\n');
    return rawLines.map((lineText, idx) => {
      const coords = parseLogLineCoordinates(lineText, language);
      const isClickable = coords !== null;

      return (
        <div 
          key={idx}
          onClick={() => {
            if (isClickable && coords) {
              onLineFocus(coords.lineNumber, coords.column);
            }
          }}
          className={`min-h-[1.5rem] px-2 py-0.5 rounded transition-all leading-relaxed whitespace-pre font-mono ${
            isError 
              ? isClickable 
                ? 'cursor-pointer text-red-300 hover:bg-red-500/15 hover:text-red-200 border-l-2 border-red-500 pl-2 bg-red-950/20' 
                : 'text-red-400'
              : isClickable
                ? 'cursor-pointer text-indigo-300 hover:bg-indigo-500/15 hover:text-indigo-200 border-l-2 border-indigo-500 pl-2 bg-indigo-950/20'
                : 'text-slate-200'
          }`}
          title={isClickable && coords ? `Click to target Editor Line ${coords.lineNumber}, Column ${coords.column}` : undefined}
        >
          {lineText || ' '}
        </div>
      );
    });
  };

  return (
    <div className="lg:col-span-2 flex flex-col bg-slate-950 h-full">
      {/* Terminal Header */}
      <div className="flex items-center px-4 py-3 border-b border-slate-900 bg-slate-900/60 justify-between">
        <div className="flex items-center space-x-2 text-slate-300 text-xs font-mono font-medium">
          <Terminal className="h-4 w-4 text-slate-400" />
          <span>Interactive Terminal</span>
        </div>
        {expectedOutput && (
          <div className="text-[10px] font-mono px-2 py-0.5 bg-slate-850 border border-slate-800 text-slate-400 rounded">
            Exp: {expectedOutput}
          </div>
        )}
      </div>

      {/* Console Logs */}
      <div id="compiler-console-output" className="flex-1 p-5 overflow-y-auto space-y-4 font-mono select-text text-sm">
        <AnimatePresence mode="wait">
          {!output && !stderr && !isRunning && (
            <motion.div 
              key="empty"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="text-slate-500 text-center flex flex-col items-center justify-center h-full space-y-3 py-16"
            >
              <Cpu className="h-8 w-8 text-slate-700 animate-pulse" />
              <p className="text-xs">Write code on the left and tap "Run Code" above.</p>
              <p className="text-[10px] text-slate-600">Sandbox sandbox environment delivers live standard compilation.</p>
            </motion.div>
          )}

          {isRunning && (
            <motion.div 
              key="running"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="text-slate-400 flex flex-col justify-center h-full py-16 text-center space-y-3"
            >
              <div className="relative flex justify-center items-center">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-emerald-500 animate-pulse"></div>
              </div>
              <p className="text-xs">Connecting to secure sandbox environment...</p>
              <p className="text-[10px] text-zinc-500">Executing inside Judge0 compile containers</p>
            </motion.div>
          )}

          {stderr && (
            <motion.div
              key="stderr"
              initial={{ opacity: 0, y: 5 }}
              animate={{ opacity: 1, y: 0 }}
              className="space-y-4"
            >
              {parsedErrorLine !== null && (
                <div 
                  onClick={() => onLineFocus(parsedErrorLine, 1)}
                  className="flex items-start space-x-3 p-3 bg-red-950/40 border border-red-900/50 rounded-xl cursor-pointer hover:bg-red-950/60 hover:border-red-500/50 transition-all"
                  title={`Click to target Syntax Alert Line ${parsedErrorLine}`}
                >
                  <AlertTriangle className="h-5 w-5 text-red-500 flex-shrink-0 mt-0.5" />
                  <div>
                    <h4 className="text-xs font-bold text-red-400">
                      Syntax Alert: Line {parsedErrorLine}
                      {customCodeErrLine !== null && (
                        <span className="text-[11px] text-indigo-400 ml-1.5 font-semibold">
                          (Custom Code Line {customCodeErrLine})
                        </span>
                      )}
                    </h4>
                    <p className="text-[11px] text-red-300 font-mono mt-0.5 font-sans leading-normal">
                      Please check and fix code syntax around line {parsedErrorLine}
                      {customCodeErrLine !== null ? ` of your custom logical solution.` : '.'}
                    </p>
                  </div>
                </div>
              )}

              <div className="p-4 bg-red-950/20 border border-red-950 text-red-400 rounded-xl text-xs overflow-x-auto whitespace-pre leading-relaxed font-mono space-y-1">
                {renderClickableTerminalLines(stderr, true)}
              </div>

              {(isAnalyzingError || aiFixExplanation) && (
                <div className="p-4 bg-indigo-950/35 border border-indigo-900/40 rounded-xl space-y-3">
                  <div className="flex items-center justify-between border-b border-indigo-900/50 pb-2">
                    <div className="flex items-center space-x-2 text-indigo-400 text-xs font-bold">
                      <Sparkles className="h-4 w-4 text-indigo-400 animate-pulse" />
                      <span>Gemini AI Tutor Debugger Advice</span>
                    </div>
                    {isAnalyzingError && (
                      <span className="text-[10px] font-mono text-indigo-400/80 animate-pulse">Diagnosing...</span>
                    )}
                  </div>

                  {isAnalyzingError ? (
                    <div className="py-4 flex flex-col items-center justify-center space-y-2 text-center">
                      <div className="h-5 w-5 border-2 border-indigo-500 border-t-transparent rounded-full animate-spin"></div>
                      <p className="text-indigo-300 text-[11px]">Analyzing error reports and code layout...</p>
                    </div>
                  ) : (
                    <div className="text-xs text-slate-300 leading-relaxed font-sans prose prose-invert prose-xs max-w-none">
                      <ReactMarkdown>{aiFixExplanation}</ReactMarkdown>
                    </div>
                  )}
                </div>
              )}
            </motion.div>
          )}

          {output && (
            <motion.div
              key="stdout"
              initial={{ opacity: 0, y: 5 }}
              animate={{ opacity: 1, y: 0 }}
              className="space-y-4"
            >
              <div className="p-4 bg-slate-900 border border-slate-800 text-slate-200 rounded-xl text-xs overflow-x-auto whitespace-pre leading-relaxed space-y-1">
                {renderClickableTerminalLines(output, false)}
              </div>

              {isMatch === true && (
                <div className="flex items-center space-x-3 p-3.5 bg-emerald-950/30 border border-emerald-900/50 rounded-xl text-emerald-400 text-xs">
                  <CheckCircle2 className="h-5 w-5 text-emerald-500 flex-shrink-0" />
                  <div>
                    <span className="font-bold">Test Verification Passed!</span>
                    <p className="text-[10px] text-emerald-500/85 mt-0.5">Your console output matches the lesson expectation criteria perfectly. Progress synced!</p>
                  </div>
                </div>
              )}

              {isMatch === false && (
                <div className="flex items-start space-x-3 p-3.5 bg-amber-950/30 border border-amber-900/50 rounded-xl text-amber-500 text-xs">
                  <AlertTriangle className="h-5 w-5 text-amber-500 flex-shrink-0 mt-0.5" />
                  <div>
                    <span className="font-bold">Output Mismatch</span>
                    <p className="text-[10.5px] text-amber-400/80 mt-1">Expected Output:</p>
                    <pre className="bg-amber-950/50 rounded p-1.5 font-mono text-[10px] text-amber-300 mt-1 max-w-full overflow-x-auto">
                      {expectedOutput}
                    </pre>
                  </div>
                </div>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Footer info brand */}
      <div className="px-4 py-2.5 bg-slate-950 border-t border-slate-900 text-center text-[10px] text-slate-600 tracking-tight font-sans flex items-center justify-between">
        <span>Sandbox Engine: <span className="text-slate-400 font-mono font-semibold">{compilationEngine ? compilationEngine.toUpperCase() : 'JUDGE0'}</span></span>
        <span>Powered by remote secure containers.</span>
      </div>
    </div>
  );
};

export default function Compiler({ 
  initialLanguage, 
  initialCode, 
  expectedOutput, 
  onSuccess,
  onChange,
  currentProblem: propCurrentProblem
}: CompilerProps) {
  const [currentProblem, setCurrentProblem] = useState<DSAProblem | undefined>(propCurrentProblem);
  const [language, setLanguage] = useState<Language>(initialLanguage);
  const [code, setCode] = useState<string>(initialCode);
  const [themeId, setThemeId] = useState<'vs-dark' | 'vs-light' | 'monokai'>('vs-dark');
  const [isRunning, setIsRunning] = useState<boolean>(false);
  const [output, setOutput] = useState<string>('');
  const [stderr, setStderr] = useState<string>('');
  const [parsedErrorLine, setParsedErrorLine] = useState<number | null>(null);
  const [isMatch, setIsMatch] = useState<boolean | null>(null);
  const [aiFixExplanation, setAiFixExplanation] = useState<string>('');
  const [isAnalyzingError, setIsAnalyzingError] = useState<boolean>(false);
  const [compilationEngine, setCompilationEngine] = useState<string>('');
  
  // Pending switch confirmations
  const [pendingLanguage, setPendingLanguage] = useState<Language | null>(null);
  const [showConfirmModal, setShowConfirmModal] = useState<boolean>(false);
  
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const preRef = useRef<HTMLPreElement>(null);

  // Unified Anchor-Biased Seek API and Editor Model Generator
  const getEditorModelInstance = () => {
    const el = textareaRef.current;
    if (!el) return null;

    return {
      revealLineInCenter: (lineNum: number) => {
        const linesList = el.value.replace(/\r/g, '').split('\n');
        const numLines = linesList.length;
        if (numLines === 0) return;

        const scrollHeight = el.scrollHeight;
        const lineHeight = scrollHeight / numLines;
        const targetScrollTop = (lineNum - 1) * lineHeight - (el.clientHeight / 2) + (lineHeight / 2);
        el.scrollTop = Math.max(0, targetScrollTop);
      },
      setPosition: (pos: { lineNumber: number; column: number }) => {
        const linesList = el.value.replace(/\r/g, '').split('\n');
        let offset = 0;
        for (let i = 0; i < Math.min(pos.lineNumber - 1, linesList.length); i++) {
          offset += linesList[i].length + 1;
        }
        const targetLineText = linesList[Math.min(pos.lineNumber - 1, linesList.length - 1)] || '';
        offset += Math.min(pos.column - 1, targetLineText.length);

        el.focus();
        el.setSelectionRange(offset, offset);
      },
      getModel: () => {
        return {
          getLineCount: () => {
            return el.value.split('\n').length;
          },
          getLineMaxColumn: (lineNum: number) => {
            const linesList = el.value.split('\n');
            const targetLine = linesList[lineNum - 1] || '';
            return targetLine.length + 1;
          },
          findMatches: (searchText: string) => {
            const content = el.value;
            let pos = content.indexOf(searchText);
            let matchedText = searchText;

            // Robust dynamic comments check for non-default boilerplate anchors
            if (pos === -1) {
              const pythonAnchorByLang = searchText.replace(/^\/\//, '#');
              pos = content.indexOf(pythonAnchorByLang);
              if (pos !== -1) {
                matchedText = pythonAnchorByLang;
              } else {
                // Seek alternative placeholder lines
                const alternateAnchors = [
                  '// Write your logic here',
                  '# Write your logic here',
                  '// Your code starts here',
                  '# Your code starts here',
                  '// Write your code/logic here',
                  '# Write your code/logic here'
                ];
                for (const alt of alternateAnchors) {
                  const altPos = content.indexOf(alt);
                  if (altPos !== -1) {
                    pos = altPos;
                    matchedText = alt;
                    break;
                  }
                }
              }
            }

            if (pos !== -1) {
              const textBefore = content.substring(0, pos);
              const linesBeforeList = textBefore.split('\n');
              const startLine = linesBeforeList.length;
              const startCol = linesBeforeList[linesBeforeList.length - 1].length + 1;

              const matchLines = matchedText.split('\n');
              const endLineNumber = startLine + matchLines.length - 1;
              const lastLineSegment = matchLines[matchLines.length - 1];
              const endColumn = (matchLines.length === 1 ? startCol : 1) + lastLineSegment.length;

              return [{
                range: {
                  startLineNumber: startLine,
                  startColumn: startCol,
                  endLineNumber: endLineNumber,
                  endColumn: endColumn
                }
              }];
            }
            return [];
          }
        };
      }
    };
  };

  // Helper to place cursor exactly on that line and column offset using anchor model API
  const setEditorCursorPosition = (line: number, column: number) => {
    const editor = getEditorModelInstance();
    if (editor) {
      editor.setPosition({ lineNumber: line, column: column });
    }
  };

  const autoPositionAndFocus = (codeText: string) => {
    setTimeout(() => {
      const editor = getEditorModelInstance();
      if (!editor) return;

      const matches = editor.getModel().findMatches(ANCHOR_TEXT);
      if (matches && matches.length > 0) {
        const match = matches[0];
        const endLine = match.range.endLineNumber;
        const endColumn = match.range.endColumn;
        
        console.log(`[autoPositionAndFocus] Anchor Found. Placing cursor: Line ${endLine}, Column ${endColumn}`);
        editor.revealLineInCenter(endLine);
        editor.setPosition({ lineNumber: endLine, column: endColumn });
      } else {
        const lastLineIdx = editor.getModel().getLineCount();
        const lastColIdx = editor.getModel().getLineMaxColumn(lastLineIdx);
        console.log(`[autoPositionAndFocus] Anchor NOT Found. Positioning at safe cursor EOF: Line ${lastLineIdx}, Col ${lastColIdx}`);
        editor.revealLineInCenter(lastLineIdx);
        editor.setPosition({ lineNumber: lastLineIdx, column: lastColIdx });
      }
    }, 50);
  };

  // Normalization layer to map arbitrary console coordinates perfectly to 1-indexed editor lines and columns
  const normalizeCoordinates = (rawLine: number, rawColumn: number): { line: number; column: number } => {
    const linesList = code.replace(/\r/g, '').split('\n');
    const totalLines = linesList.length;
    
    // Clamp line index within the safe bounds of the document
    const line = Math.max(1, Math.min(rawLine, totalLines));
    
    const targetLineText = linesList[line - 1] || '';
    // Clamp column index within line limits (+1 for line end offset placement)
    const column = Math.max(1, Math.min(rawColumn, targetLineText.length + 1));

    return { line, column };
  };

  // Event handler for terminal interactions to synchronize and reposition editor cursor
  const handleLineFocus = (rawLine: number, rawColumn: number) => {
    // Validation: Log 'Target Coordinates' received by the terminal component
    console.log(`[Synchronization Controller] Target Coordinates received from Terminal:`, { line: rawLine, column: rawColumn });

    const normalized = normalizeCoordinates(rawLine, rawColumn);

    // Validation: Log 'Set Coordinates' used by the editor component
    console.log(`[Synchronization Controller] Set Coordinates applied to Editor:`, { line: normalized.line, column: normalized.column });

    // Force Editor Cursor Sync and Navigation Focus
    const editor = getEditorModelInstance();
    if (!editor) return;

    // Command editor to reveal and set cursor focus instantly
    editor.revealLineInCenter(normalized.line);
    editor.setPosition({ lineNumber: normalized.line, column: normalized.column });
  };

  // Sync to outer changes
  useEffect(() => {
    setCurrentProblem(propCurrentProblem);
    setLanguage(initialLanguage);
    setCode(initialCode);
    setOutput('');
    setStderr('');
    setParsedErrorLine(null);
    setIsMatch(null);
    setAiFixExplanation('');
    setIsAnalyzingError(false);
    setCompilationEngine('');

    // Auto set editor syntax highlighting theme based on selected language
    if (initialLanguage === 'python' || initialLanguage === 'javascript') {
      setThemeId('monokai');
    } else if (initialLanguage === 'java') {
      setThemeId('vs-light');
    } else {
      setThemeId('vs-dark');
    }

    // Positions cursor exactly on the boilerplate placeholder with automatic focus
    autoPositionAndFocus(initialCode);
  }, [initialLanguage, initialCode, propCurrentProblem]);

  // Track lines count
  const lines = code.split('\n');

  // Regex compile error line parses
  const parseErrorLineNumber = (errorText: string, lang: string): number | null => {
    if (!errorText) return null;
    
    let match: RegExpMatchArray | null = null;
    
    if (lang === 'python') {
      match = errorText.match(/line\s+(\d+)/i);
    } else if (lang === 'java') {
      match = errorText.match(/Main\.java:(\d+)/i);
    } else if (lang === 'c' || lang === 'cpp') {
      match = errorText.match(/(?:main\.c|main\.cpp):(\d+)/i);
    } else if (lang === 'javascript') {
      match = errorText.match(/:(\d+)\r?\n/);
      if (!match) {
        match = errorText.match(/at\s+Object\..*:(\d+):\d+/);
      }
    }

    if (match && match[1]) {
      const lineNum = parseInt(match[1], 10);
      if (!isNaN(lineNum) && lineNum <= lines.length) {
        return lineNum;
      }
    }
    return null;
  };

  const handleExplainError = async (errorText: string) => {
    setIsAnalyzingError(true);
    setAiFixExplanation('');
    try {
      const response = await fetch('/api/explain-error', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          language,
          code,
          stderr: errorText,
        }),
      });

      if (response.ok) {
        const result = await response.json();
        setAiFixExplanation(result.explanation || '');
      } else {
        const errResult = await response.json();
        setAiFixExplanation(`*Could not generate suggestions: ${errResult.error || 'Server error'}*`);
      }
    } catch (e: any) {
      setAiFixExplanation(`*Failed to connect to AI server: ${e?.message || 'Connection lost'}*`);
    } finally {
      setIsAnalyzingError(false);
    }
  };

  const handleRun = async () => {
    setIsRunning(true);
    setOutput('');
    setStderr('');
    setParsedErrorLine(null);
    setIsMatch(null);
    setAiFixExplanation('');
    setCompilationEngine('');

    try {
      const response = await fetch('/api/compile', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          language,
          code,
        }),
      });

      if (!response.ok) {
        throw new Error(`Compiler server returned response code ${response.status}`);
      }

      const result = await response.json();
      
      const stdout = result.stdout || '';
      const runStderr = result.stderr || '';
      const engine = result.engine || 'sandbox';
      
      setOutput(stdout.trim());
      setStderr(runStderr.trim());
      setCompilationEngine(engine);

      if (runStderr.trim()) {
        const errorLine = parseErrorLineNumber(runStderr, language);
        setParsedErrorLine(errorLine);
        handleExplainError(runStderr);
      } else {
        if (expectedOutput) {
          const cleanStdout = stdout.trim();
          const cleanExpected = expectedOutput.trim();
          const matched = cleanStdout === cleanExpected;
          setIsMatch(matched);
          
          if (matched && onSuccess) {
            onSuccess(code);
          }
        }
      }
    } catch (err: any) {
      setStderr(`Inbound API execution connection error: ${err?.message || 'Check terminal'}`);
    } finally {
      setIsRunning(false);
    }
  };

  const handleReset = () => {
    setCode(initialCode);
    setOutput('');
    setStderr('');
    setParsedErrorLine(null);
    setIsMatch(null);
    setAiFixExplanation('');
    setIsAnalyzingError(false);
    setCompilationEngine('');

    // Positions cursor exactly on the boilerplate placeholder with automatic focus
    autoPositionAndFocus(initialCode);
  };

  const hasUserTypedCode = () => {
    if (!code.trim()) return false;
    // Get active boilerplate for currently selected language
    const currentBoilerplate = getBoilerplateForProblem(currentProblem, language);
    // If the user's code differs from the clean boilerplate, they have typed code!
    return code.trim() !== currentBoilerplate.trim();
  };

  const performLanguageSwitch = (targetLang: Language) => {
    setLanguage(targetLang);
    // Dynamically switch code editor syntax highlighting theme based on selected language
    if (targetLang === 'python' || targetLang === 'javascript') {
      setThemeId('monokai');
    } else if (targetLang === 'java') {
      setThemeId('vs-light');
    } else {
      setThemeId('vs-dark');
    }

    const newBoilerplate = getBoilerplateForProblem(currentProblem, targetLang);
    setCode(newBoilerplate);
    onChange?.(newBoilerplate);

    // Positions cursor exactly on the boilerplate placeholder with automatic focus
    autoPositionAndFocus(newBoilerplate);
  };

  const handleLanguageChange = (newLang: Language) => {
    if (!hasUserTypedCode()) {
      performLanguageSwitch(newLang);
    } else {
      setPendingLanguage(newLang);
      setShowConfirmModal(true);
    }
  };

  const handleConfirmSwitch = () => {
    if (pendingLanguage) {
      performLanguageSwitch(pendingLanguage);
    }
    setShowConfirmModal(false);
    setPendingLanguage(null);
  };

  const handleCancelSwitch = () => {
    setShowConfirmModal(false);
    setPendingLanguage(null);
  };

  const getNormalizedLine = (compilerLine: number): number => {
    const currentBoilerplate = getBoilerplateForProblem(currentProblem, language);
    const boilerplateLinesList = currentBoilerplate.split('\n');
    const anchorIdx = boilerplateLinesList.findIndex(l => 
      l.toLowerCase().includes('your code starts here') || 
      l.toLowerCase().includes('write your code here') || 
      l.toLowerCase().includes('write your logic here')
    );
    const offset = anchorIdx !== -1 ? anchorIdx : 0;
    return Math.max(1, compilerLine - offset);
  };

  const customCodeErrLine = useMemo(() => {
    if (parsedErrorLine !== null) {
      return getNormalizedLine(parsedErrorLine);
    }
    return null;
  }, [parsedErrorLine, code, language, currentProblem]);

  const demarcationLineIndex = useMemo(() => {
    return lines.findIndex(l => 
      l.toLowerCase().includes('your code starts here') ||
      l.toLowerCase().includes('write your code here') ||
      l.toLowerCase().includes('write your logic here')
    );
  }, [lines]);

  // High fidelity style mappings based on theme settings
  const themeStyles = {
    'vs-dark': {
      bg: 'bg-[#1e1e1e]',
      headerBg: 'bg-[#252526] border-[#1e1e1e]',
      headerText: 'text-[#d4d4d4]',
      lineBg: 'bg-[#1e1e1e] border-r border-[#2d2d2d]',
      lineNumText: 'text-[#858585]',
      lineErrBg: 'bg-red-950/30 border-r border-red-500 pr-1',
      caretColor: 'caret-[#569cd6]',
      textareaText: 'text-transparent',
      preColor: 'text-[#d4d4d4]'
    },
    'vs-light': {
      bg: 'bg-[#ffffff]',
      headerBg: 'bg-[#f3f3f3] border-[#e2e2e2]',
      headerText: 'text-[#333333]',
      lineBg: 'bg-[#f3f3f3] border-r border-[#e2e2e2]',
      lineNumText: 'text-[#a0a0a0]',
      lineErrBg: 'bg-red-100 border-r border-red-600 pr-1',
      caretColor: 'caret-[#0000ff]',
      textareaText: 'text-transparent',
      preColor: 'text-[#000000]'
    },
    'monokai': {
      bg: 'bg-[#272822]',
      headerBg: 'bg-[#1e1f1c] border-[#272822]',
      headerText: 'text-[#f8f8f2]',
      lineBg: 'bg-[#272822] border-r border-[#3e3d32]',
      lineNumText: 'text-[#75715e]',
      lineErrBg: 'bg-red-950/40 border-r border-red-500 pr-1',
      caretColor: 'caret-[#f92672]',
      textareaText: 'text-transparent',
      preColor: 'text-[#f8f8f2]'
    }
  };

  const activeTheme = themeStyles[themeId];

  // Tokenize code live with custom coloring corresponding to the active editor state
  const highlightedTokens = useMemo(() => {
    const tokens = tokenizeCode(code, language);
    return tokens.map((token, idx) => {
      let colorClass = '';

      if (themeId === 'monokai') {
        switch (token.type) {
          case 'keyword': colorClass = 'text-[#f92672] font-semibold'; break;
          case 'type': colorClass = 'text-[#66d9ef]'; break;
          case 'string': colorClass = 'text-[#e6db74]'; break;
          case 'comment': colorClass = 'text-[#75715e] italic'; break;
          case 'number': colorClass = 'text-[#ae81ff]'; break;
          case 'function': colorClass = 'text-[#a6e22e]'; break;
          default: colorClass = 'text-[#f8f8f2]'; break;
        }
      } else if (themeId === 'vs-light') {
        switch (token.type) {
          case 'keyword': colorClass = 'text-[#0000ff] font-semibold'; break;
          case 'type': colorClass = 'text-[#2e7d32]'; break;
          case 'string': colorClass = 'text-[#a31515]'; break;
          case 'comment': colorClass = 'text-[#008000] italic'; break;
          case 'number': colorClass = 'text-[#098658]'; break;
          case 'function': colorClass = 'text-[#795e26] font-medium'; break;
          default: colorClass = 'text-[#000000]'; break;
        }
      } else { // 'vs-dark' standard setup
        switch (token.type) {
          case 'keyword': colorClass = 'text-[#569cd6] font-semibold'; break;
          case 'type': colorClass = 'text-[#4ec9b0]'; break;
          case 'string': colorClass = 'text-[#ce9178]'; break;
          case 'comment': colorClass = 'text-[#6a9955] italic'; break;
          case 'number': colorClass = 'text-[#b5cea8]'; break;
          case 'function': colorClass = 'text-[#dcdcaa] font-medium'; break;
          default: colorClass = 'text-[#d4d4d4]'; break;
        }
      }

      return (
        <span key={idx} className={colorClass}>
          {token.value}
        </span>
      );
    });
  }, [code, language, themeId]);

  return (
    <div className="relative grid grid-cols-1 lg:grid-cols-5 gap-6 h-full max-h-[850px] bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden shadow-2xl">
      {/* Editor Section */}
      <div className={`lg:col-span-3 flex flex-col border-r border-slate-800 transition-colors duration-150 ${activeTheme.bg}`}>
        
        {/* Editor Controls Header with Selectors */}
        <div className={`flex flex-wrap items-center justify-between gap-3 px-4 py-3 transition-colors duration-150 border-b ${activeTheme.headerBg}`}>
          <div className="flex items-center space-x-3">
            <span className="flex h-3 w-3 rounded-full bg-red-500" />
            <span className="flex h-3 w-3 rounded-full bg-yellow-500" />
            <span className="flex h-3 w-3 rounded-full bg-green-500" />
            
            {/* Dynamic Controls indicators */}
            <div className="flex items-center space-x-2 pl-2">
              {/* Language Selector */}
              <select
                id="compiler-language-select"
                value={language}
                onChange={(e) => handleLanguageChange(e.target.value as Language)}
                className={`bg-slate-950/80 border border-slate-800 rounded-lg px-2.5 py-1 text-xs font-mono font-semibold text-slate-200 outline-none hover:border-indigo-500/50 transition cursor-pointer`}
              >
                <option value="python">Python 3</option>
                <option value="javascript">JavaScript</option>
                <option value="java">Java Main</option>
                <option value="c">C (GCC)</option>
                <option value="cpp">C++ (G++)</option>
              </select>

              {/* Theme Selector */}
              <select
                id="compiler-theme-select"
                value={themeId}
                onChange={(e) => setThemeId(e.target.value as 'vs-dark' | 'vs-light' | 'monokai')}
                className={`bg-slate-950/80 border border-slate-800 rounded-lg px-2.5 py-1 text-xs font-mono text-slate-400 outline-none hover:border-indigo-500/50 transition cursor-pointer`}
              >
                <option value="vs-dark">VS Dark</option>
                <option value="vs-light">VS Light</option>
                <option value="monokai">Monokai Theme</option>
              </select>
            </div>
          </div>

          <div className="flex items-center space-x-2">
            <button
              onClick={handleReset}
              id="compiler-reset-btn"
              className="flex items-center space-x-1 px-3 py-1.5 rounded-lg text-xs font-medium text-slate-400 bg-slate-950 border border-slate-800 hover:text-white hover:bg-slate-900 transition"
              title="Reset Code Template"
            >
              <RotateCcw className="h-3 w-3" />
              <span>Reset</span>
            </button>
            
            <button
              onClick={handleRun}
              id="compiler-run-btn"
              disabled={isRunning}
              className={`flex items-center space-x-1.5 px-4 py-1.5 rounded-lg text-xs font-semibold shadow transition ${
                isRunning 
                  ? 'bg-emerald-800/50 text-slate-400 cursor-not-allowed' 
                  : 'bg-emerald-600 hover:bg-emerald-500 text-white'
              }`}
            >
              <Play className={`h-3 w-3 ${isRunning ? 'animate-spin' : ''}`} />
              <span>{isRunning ? 'Compiling...' : 'Run Code'}</span>
            </button>
          </div>
        </div>

        {/* Text Area & Line Numbers */}
        <div
  id="compiler-editor-container"
  className="flex-1 min-h-[300px]"
>
  <Editor
    height="100%"
    language={language}
    theme="vs-dark"
    value={code}
    options={{
      minimap: { enabled: false },
      fontSize: 14,
      lineHeight: 21,
      fontFamily: "JetBrains Mono",
      automaticLayout: true,
      scrollBeyondLastLine: false,
      wordWrap: "on"
    }}
    onChange={(value) => {
      const newCode = value || "";
      setCode(newCode);
      onChange?.(newCode);
    }}
  />
</div>

      </div>

      {/* Terminal Output Console Section */}
      <TerminalConsole
        output={output}
        stderr={stderr}
        isRunning={isRunning}
        expectedOutput={expectedOutput}
        parsedErrorLine={parsedErrorLine}
        customCodeErrLine={customCodeErrLine}
        isAnalyzingError={isAnalyzingError}
        aiFixExplanation={aiFixExplanation}
        isMatch={isMatch}
        compilationEngine={compilationEngine}
        language={language}
        onLineFocus={handleLineFocus}
      />

      {/* Custom Language Switch Confirmation Modal */}
      <AnimatePresence>
        {showConfirmModal && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 bg-slate-950/85 backdrop-blur-sm flex items-center justify-center p-4 z-50 transition-all font-sans"
          >
            <motion.div 
              initial={{ scale: 0.95, y: 10 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.95, y: 10 }}
              className="bg-slate-900 border border-slate-800 rounded-2xl p-6 max-w-sm w-full space-y-4 shadow-2xl text-left"
            >
              <div className="flex items-start space-x-3">
                <div className="bg-amber-500/10 border border-amber-500/20 text-amber-500 p-2 rounded-xl flex-shrink-0">
                  <AlertTriangle className="h-5 w-5" />
                </div>
                <div className="space-y-1">
                  <h3 className="text-sm font-bold text-white">Replacing Existing Progress?</h3>
                  <p className="text-xs text-slate-400 leading-relaxed mt-1">
                    Switching to <span className="font-semibold text-indigo-400 capitalize">{pendingLanguage === 'cpp' ? 'C++' : pendingLanguage}</span> will replace the current template. Are you sure?
                  </p>
                </div>
              </div>

              <div className="pt-2 flex items-center justify-end space-x-2">
                <button
                  type="button"
                  onClick={handleCancelSwitch}
                  className="px-3.5 py-2 bg-slate-950 border border-slate-850 hover:bg-slate-900 rounded-lg text-xs font-semibold text-slate-400 hover:text-white transition cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={handleConfirmSwitch}
                  className="px-3.5 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg text-xs font-bold shadow transition cursor-pointer"
                >
                  Yes, Switch Template
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
