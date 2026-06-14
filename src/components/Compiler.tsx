/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

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

  const demarcationLineIndex = useMemo(() => {
    return lines.findIndex(l => l.toLowerCase().includes('your code starts here'));
  }, [lines]);

  const customCodeErrLine = useMemo(() => {
    if (parsedErrorLine !== null && demarcationLineIndex !== -1 && parsedErrorLine > demarcationLineIndex + 1) {
      return parsedErrorLine - (demarcationLineIndex + 1);
    }
    return null;
  }, [parsedErrorLine, demarcationLineIndex]);

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
                <option value="vs-[#ffffff]">VS Light</option>
                <option value="vs-light">VS Code Light</option>
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
        <div id="compiler-editor-container" className="flex-1 flex overflow-y-auto min-h-[300px]">
          {/* Numbers Column */}
          <div className={`text-right select-none pr-4 text-xs font-mono flex flex-col space-y-0.5 pt-0.5 min-w-10 ${activeTheme.lineBg}`}>
            {lines.map((_, i) => {
              const isDemarcation = i === demarcationLineIndex;
              return (
                <div 
                  key={i} 
                  className={`h-[21px] flex items-center justify-end w-6 font-semibold transition-all ${
                    isDemarcation 
                      ? 'text-indigo-400 bg-indigo-500/15 border-r-2 border-indigo-500 pr-0.5' 
                      : parsedErrorLine === i + 1 
                        ? activeTheme.lineErrBg 
                        : activeTheme.lineNumText
                  }`}
                  title={isDemarcation ? "Your customized code starts here" : undefined}
                >
                  {i + 1}
                </div>
              );
            })}
          </div>

          {/* Interactive Tokenized TextArea */}
          <div className={`flex-1 relative pl-4 bg-transparent`}>
            {/* Syntax Highlighting Fake Backdrop under the transparent layer */}
            <pre 
              className={`pointer-events-none select-none text-sm leading-relaxed whitespace-pre px-4 pt-0.5 font-mono ${activeTheme.preColor}`}
              style={{ lineHeight: '21px', fontFamily: '"JetBrains Mono", Courier, monospace' }}
            >
              {highlightedTokens}
            </pre>

            {/* Absolute overlaying Textarea matching the dimensions exactly */}
            <textarea
              ref={textareaRef}
              id="compiler-code-input"
              value={code}
              onChange={(e) => {
                setCode(e.target.value);
                onChange?.(e.target.value);
              }}
              className={`absolute inset-0 w-full h-full bg-transparent ${activeTheme.textareaText} ${activeTheme.caretColor} font-mono text-sm leading-relaxed outline-none border-none resize-none px-4 pt-0.5 overflow-hidden focus:ring-0 select-text`}
              placeholder="Write your execution routine here..."
              spellCheck={false}
              style={{ lineHeight: '21px', fontFamily: '"JetBrains Mono", Courier, monospace' }}
            />
          </div>
        </div>

      </div>

      {/* Terminal Output Console Section */}
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
                  <div className="flex items-start space-x-3 p-3 bg-red-950/40 border border-red-900/50 rounded-xl">
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

                <div className="p-4 bg-red-950/20 border border-red-950 text-red-400 rounded-xl text-xs overflow-x-auto whitespace-pre leading-relaxed font-mono">
                  {stderr}
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
                <div className="p-4 bg-slate-900 border border-slate-800 text-slate-200 rounded-xl text-xs overflow-x-auto whitespace-pre leading-relaxed">
                  {output}
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
