/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { Language, DSAProblem } from '../types';

/**
 * Normalizes input arguments to match syntax target (comma-separated variables/values)
 */
function parseTestArgs(inputStr: string): string {
  return inputStr || '';
}

/**
 * Guesses a suitable primitive type for C/C++/Java based on expected output or variable names
 */
function estimateType(expected: string, varName: string = ''): string {
  const cleanExp = expected?.trim();
  if (!cleanExp) return 'int';
  
  if (cleanExp.toLowerCase() === 'true' || cleanExp.toLowerCase() === 'false') {
    return 'bool'; // boolean for Java
  }
  
  if (/^-?\d+$/.test(cleanExp)) {
    return 'int';
  }
  
  if (/^-?\d+\.\d+$/.test(cleanExp)) {
    return 'double'; // float for C/C++
  }
  
  return 'string'; // String for Java, const char* or string for C++
}

/**
 * Centralized boilerplate mapping generator
 */
export function getBoilerplateForProblem(problem: DSAProblem | undefined, targetLang: Language): string {
  if (!problem) {
    // Standard default configurations
    const fallbackCodes: Record<Language, string> = {
      python: `# Python Execution Sandbox\n# Your code starts here\n\ndef solve():\n    print("Hello, DSA Sandbox!")\n\nsolve()\n`,
      javascript: `// JavaScript Execution Sandbox\n// Your code starts here\n\nfunction solve() {\n    console.log("Hello, DSA Sandbox!");\n}\n\nsolve();\n`,
      java: `// Java Execution Sandbox\n// Your code starts here\n\npublic class Main {\n    public static void main(String[] args) {\n        System.out.println("Hello, DSA Sandbox!");\n    }\n}\n`,
      c: `// C Execution Sandbox\n// Your code starts here\n\n#include <stdio.h>\n\nint main() {\n    printf("Hello, DSA Sandbox!\\n");\n    return 0;\n}\n`,
      cpp: `// C++ Execution Sandbox\n// Your code starts here\n\n#include <iostream>\nusing namespace std;\n\nint main() {\n    cout << "Hello, DSA Sandbox!" << endl;\n    return 0;\n}\n`
    };
    return fallbackCodes[targetLang];
  }

  // 1. If target match problem's original natural language, return its starterCode with demarcation added
  if (problem.language === targetLang) {
    const code = problem.starterCode;
    // Inject demarcation comment if not present
    if (!code.includes('Your code starts here')) {
      const firstDefIndex = code.indexOf('def ');
      const firstFuncIndex = code.indexOf('function ');
      if (firstDefIndex !== -1) {
        return code.slice(0, firstDefIndex) + `# Your code starts here\n` + code.slice(firstDefIndex);
      } else if (firstFuncIndex !== -1) {
        return code.slice(0, firstFuncIndex) + `// Your code starts here\n` + code.slice(firstFuncIndex);
      } else {
        const commentChar = targetLang === 'python' ? '#' : '//';
        return `${commentChar} ${problem.title}\n${commentChar} Your code starts here\n\n${code}`;
      }
    }
    return code;
  }

  // 2. Parse existing function signature from python/javascript template
  let funcName = 'solve';
  let rawParams = 'n';
  const pyMatch = problem.starterCode.match(/def\s+([a-zA-Z_][a-zA-Z0-9_]*)\s*\(([^)]*)\)/);
  const jsMatch = problem.starterCode.match(/function\s+([a-zA-Z_][a-zA-Z0-9_]*)\s*\(([^)]*)\)/);

  if (pyMatch) {
    funcName = pyMatch[1];
    rawParams = pyMatch[2];
  } else if (jsMatch) {
    funcName = jsMatch[1];
    rawParams = jsMatch[2];
  }

  const firstTestCase = problem.testCases?.[0] || { input: '10', expected: '0' };
  const testInput = parseTestArgs(firstTestCase.input);
  const guessedRetType = estimateType(firstTestCase.expected, funcName);

  // 3. Centralized static lookup list override for specific problem structures if needed
  // (We use dynamic constructor as a very high fidelity general fallback)
  
  switch (targetLang) {
    case 'python': {
      return `# Python - ${problem.title}\n# Your code starts here\n\ndef ${funcName}(${rawParams}):\n    # Write your logic here\n    pass\n\nprint(${funcName}(${testInput}))\n`;
    }
    case 'javascript': {
      return `// JavaScript - ${problem.title}\n// Your code starts here\n\nfunction ${funcName}(${rawParams}) {\n    // Write your logic here\n    \n}\n\nconsole.log(${funcName}(${testInput}));\n`;
    }
    case 'java': {
      const javaRetType = guessedRetType === 'bool' ? 'boolean' : guessedRetType === 'string' ? 'String' : guessedRetType;
      const paramList = rawParams.split(',').map((p, i) => {
        const argVal = testInput.split(',')[i]?.trim() || '';
        const pType = /^-?\d+$/.test(argVal) ? 'int' : /^-?\d+\.\d+$/.test(argVal) ? 'double' : 'String';
        return `${pType} ${p.trim()}`;
      }).join(', ') || 'int n';

      return `// Java - ${problem.title}\n// Your code starts here\n\npublic class Main {\n    public static ${javaRetType} ${funcName}(${paramList}) {\n        // Write your logic here\n        \n        return ${guessedRetType === 'int' || guessedRetType === 'double' ? '0' : guessedRetType === 'bool' ? 'false' : '""'};\n    }\n\n    public static void main(String[] args) {\n        System.out.println(${funcName}(${testInput}));\n    }\n}\n`;
    }
    case 'cpp': {
      const cppRetType = guessedRetType === 'bool' ? 'bool' : guessedRetType === 'string' ? 'string' : guessedRetType;
      const paramList = rawParams.split(',').map((p, i) => {
        const argVal = testInput.split(',')[i]?.trim() || '';
        const pType = /^-?\d+$/.test(argVal) ? 'int' : /^-?\d+\.\d+$/.test(argVal) ? 'double' : 'string';
        return `${pType} ${p.trim()}`;
      }).join(', ') || 'int n';

      return `// C++ - ${problem.title}\n#include <iostream>\n#include <string>\n#include <vector>\nusing namespace std;\n\n// Your code starts here\n${cppRetType} ${funcName}(${paramList}) {\n    // Write your logic here\n    \n    return ${guessedRetType === 'int' || guessedRetType === 'double' ? '0' : guessedRetType === 'bool' ? 'false' : '""'};\n}\n\nint main() {\n    cout << ${funcName}(${testInput}) << endl;\n    return 0;\n}\n`;
    }
    case 'c': {
      const cRetType = guessedRetType === 'bool' ? 'int' : guessedRetType === 'string' ? 'const char*' : guessedRetType;
      const paramList = rawParams.split(',').map((p, i) => {
        const argVal = testInput.split(',')[i]?.trim() || '';
        const pType = /^-?\d+$/.test(argVal) ? 'int' : /^-?\d+\.\d+$/.test(argVal) ? 'double' : 'const char*';
        return `${pType} ${p.trim()}`;
      }).join(', ') || 'int n';

      const printFormat = guessedRetType === 'int' ? '%d' : guessedRetType === 'double' ? '%f' : '%s';

      return `// C - ${problem.title}\n#include <stdio.h>\n#include <stdlib.h>\n\n// Your code starts here\n${cRetType} ${funcName}(${paramList}) {\n    // Write your logic here\n    \n    return ${guessedRetType === 'int' || guessedRetType === 'double' ? '0' : guessedRetType === 'bool' ? '0' : 'NULL'};\n}\n\nint main() {\n    printf("${printFormat}\\n", ${funcName}(${testInput}));\n    return 0;\n}\n`;
    }
    default:
      return problem.starterCode;
  }
}
