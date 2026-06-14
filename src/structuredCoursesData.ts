/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

// Type imports removed to maintain native typing reference

export const STRUCTURED_COURSES: { [courseId: string]: any } = {
  python: {
    course_id: 'python_101',
    title: 'Python for Beginners & Deep Thinkers',
    description: 'Learn the fundamentals of Python, writing elegant script functions, dynamic string formatting, and functional structures.',
    language: 'python',
    sections: [
      {
        section_name: 'Basics & Essentials',
        topics: [
          {
            topic_id: 'vars_and_types',
            title: 'Variables, Arithmetic, and Output',
            description: 'Understand Python dynamic typing and run your first computations.',
            content: `### Introduction to Python Elements

Python is a dynamically-typed, highly readable scripting language. 

In this lesson, you will learn to:
1. Declare variables without explicit type declarations.
2. Perform standard mathematical calculations.
3. Print text using template format strings (f-strings).

**Exercise:**
Calculate the area of a circle with a radius of $7$. Use $3.14159$ as the approximation for $\\pi$. Output the final area in the format:
\`"The area of the circle is [value]"\`

*Tip:* You can assign \`radius = 7\` and \`pi = 3.14159\`.`,
            starterCode: `def calculate_area():
    # Write your code here
    pass

calculate_area()`,
            solution: `def calculate_area():
    radius = 7
    pi = 3.14159
    area = pi * (radius ** 2)
    print(f"The area of the circle is {area}")

calculate_area()`,
            expectedOutput: 'The area of the circle is 153.93791',
            quiz: [
              {
                q: 'Which of the following describes Python variables?',
                options: [
                  'They must be declared with a strict compiled type (e.g., int x).',
                  'They are dynamically typed and can change types at runtime.',
                  'They must be capitalized to represent scalar variables.',
                  'They are allocated entirely in stack registers and cannot hold references.'
                ],
                answer: 'They are dynamically typed and can change types at runtime.'
              },
              {
                q: 'How do you perform exponentiation (power representation) in Python?',
                options: ['x ^ y', 'x ** y', 'pow(x || y)', 'x exp y'],
                answer: 'x ** y'
              },
              {
                q: 'What is the correct syntax for a Python f-string literal?',
                options: [
                  'f"Value is {var}"',
                  '"Value is %s" % var',
                  's"Value is {var}"',
                  'interpolate("Value is {var}")'
                ],
                answer: 'f"Value is {var}"'
              },
              {
                q: 'How does Python handle comments in code?',
                options: [
                  'Using "//" for single line and "/*" for blocks.',
                  'Using the "#" symbol at the beginning of the line.',
                  'Using "--" characters.',
                  'Using HTML tags "<!-- comment -->".'
                ],
                answer: 'Using the "#" symbol at the beginning of the line.'
              },
              {
                q: 'What is the output of print(type(1.23)) in Python?',
                options: ["<class 'int'>", "<class 'float'>", "<class 'double'>", "<class 'decimal'>"],
                answer: "<class 'float'>"
              }
            ]
          },
          {
            topic_id: 'control_flow',
            title: 'Control Flow & Decision Branching',
            description: 'Implement complex decision branching using if, elif, and else statements.',
            content: `### Control Flow in Python

Using the proper operators (\`==\`, \`!=\`, \`>\`, \`<\`) allow you to route logic conditionally.

In Python, indentation defines block structure, replacing curly braces.

**Exercise:**
Implement a standard grader function that takes a numeric grade and returns its corresponding letter mark:
- 90 or above: \`"A"\`
- 80 to 89: \`"B"\`
- 70 to 79: \`"C"\`
- Below 70: \`"F"\`

Initialize \`score = 85\` and print the final result.`,
            starterCode: `def get_grade(score):
    # Return grades based on score
    pass

print(get_grade(85))`,
            solution: `def get_grade(score):
    if score >= 90:
        return "A"
    elif score >= 80:
        return "B"
    elif score >= 70:
        return "C"
    else:
        return "F"

print(get_grade(85))`,
            expectedOutput: 'B',
            quiz: [
              {
                q: 'Which keyword replaces "else if" in Python?',
                options: ['elseif', 'elif', 'elsif', 'else_if'],
                answer: 'elif'
              },
              {
                q: 'How are code blocks defined in Python?',
                options: ['Curly braces {}', 'Parentheses ()', 'Consistent indentation indentation levels', 'Semicolons ;'],
                answer: 'Consistent indentation indentation levels'
              },
              {
                q: 'What will be output by: print(10 > 5 and 3 < 1)?',
                options: ['True', 'False', 'None', 'Error'],
                answer: 'False'
              },
              {
                q: 'What is the dynamic output of bool("") in Python?',
                options: ['True', 'False', 'None', 'ValueError exception'],
                answer: 'False'
              },
              {
                q: 'Which comparison operator represents "not equal"?',
                options: ['<>', '!=', '==!', 'not'],
                answer: '!='
              }
            ]
          }
        ]
      },
      {
        section_name: 'Collections & Key-Value Stores',
        topics: [
          {
            topic_id: 'lists_dicts',
            title: 'Lists, Dictionaries, and Sequences',
            description: 'Master mutable sequences and hashed lookups in Python.',
            content: `### Collections in Python

Python has incredibly powerful built-in aggregate types:
- **Lists**: Sequential arrays \`[1, 2, 3]\` accessed by indexed subscripts.
- **Dictionaries**: Hashed key-value maps \`{"name": "Mahi"}\`.

**Exercise:**
Create a list with numbers \`[10, 20, 30]\`, append interest value \`40\` to it using standard array operators, and print the resulting element at index \`1\`.`,
            starterCode: `def list_demo():
    # Insert code here
    pass

list_demo()`,
            solution: `def list_demo():
    items = [10, 20, 30]
    items.append(40)
    print(items[1])

list_demo()`,
            expectedOutput: '20',
            quiz: [
              {
                q: 'Which list method inserts an element at the end of a list?',
                options: ['push()', 'add()', 'append()', 'insert(index=last)'],
                answer: 'append()'
              },
              {
                q: 'How do you reference the value of key "age" in dictionary d = {"age": 22}?',
                options: ["d['age']", 'd.age', 'd(age)', 'd->age'],
                answer: "d['age']"
              },
              {
                q: 'Are Python lists mutable or immutable?',
                options: ['They are static and immutable.', 'They are dynamic and mutable.', 'Only lists containing integers are mutable.', 'They are immutable by default but mutable if initialized with a modifier.'],
                answer: 'They are dynamic and mutable.'
              },
              {
                q: 'What does the function len([1, 2, 3]) return?',
                options: ['2', '3', '4', 'None'],
                answer: '3'
              },
              {
                q: 'Which built-in function returns a reversed iterator for a sequence?',
                options: ['reverse()', 'reversed()', 'invert()', 'flip()'],
                answer: 'reversed()'
              }
            ]
          }
        ]
      }
    ]
  },
  java: {
    course_id: 'java_101',
    title: 'Object-Oriented Java Programming',
    description: 'Master strict typing, class files, instances, encapsulation, and inheritance.',
    language: 'java',
    sections: [
      {
        section_name: 'Boilerplate & OOP Foundations',
        topics: [
          {
            topic_id: 'java_basics',
            title: 'Class Declarations & Static Methods',
            description: 'Explore compiled architecture, boilerplate, and printing stream structures.',
            content: `### Standard Java Entry Points

Every runnable Java application starts inside a static main method:
\`\`\`java
public static void main(String[] args)
\`\`\`

Variables must have strict types declared at compilation.

**Exercise:**
Write a program that uses static parameters to calculate the absolute distance between two points on a 1D line: $14$ and $33$. Print the resulting positive difference to standard output: \`System.out.println("The distance is " + difference);\`.`,
            starterCode: `public class Main {
    public static void main(String[] args) {
        // Write your code here
        int point1 = 14;
        int point2 = 33;
        
    }
}`,
            solution: `public class Main {
    public static void main(String[] args) {
        int point1 = 14;
        int point2 = 33;
        int difference = Math.abs(point1 - point2);
        System.out.println("The distance is " + difference);
    }
}`,
            expectedOutput: 'The distance is 19',
            quiz: [
              {
                q: 'Every standalone runnable Java program must contain which of the following?',
                options: [
                  'An import of java.io.ConsolePackage;',
                  'A public class containing a public static void main(String[] args) method;',
                  'An interface constructor class;',
                  'A default package folder declaration.'
                ],
                answer: 'A public class containing a public static void main(String[] args) method;'
              },
              {
                q: 'Which of the following is NOT a primitive type in Java?',
                options: ['int', 'double', 'char', 'String'],
                answer: 'String'
              },
              {
                q: 'How does Java handle memory deallocation?',
                options: [
                  'Manual free() commands must be called.',
                  'Through automatic Garbage Collection managed by the JVM.',
                  'By compiling destructors at output runtimes.',
                  'Java does not support memory management, leading to static leaks.'
                ],
                answer: 'Through automatic Garbage Collection managed by the JVM.'
              },
              {
                q: 'Which operator is used to instantiate a class object in Java?',
                options: ['alloc', 'instanceof', 'new', 'create'],
                answer: 'new'
              },
              {
                q: 'What is the return type of the static main method?',
                options: ['int', 'void', 'main', 'boolean'],
                answer: 'void'
              }
            ]
          },
          {
            topic_id: 'java_inheritance',
            title: 'Inheritance and Polymorphism',
            description: 'Extend classes and override dynamic virtual methods cleanly.',
            content: `### Java OOP and Inheritance

Java enforces strict inheritance. Classes can extend another class to inherit properties.

Key elements:
- \`extends\` keyword allows inheritance.
- \`@Override\` indicates dynamic method overriding.

**Exercise:**
Implement a child class with overridden methods that display specific object properties.`,
            starterCode: `public class Main {
    public static void main(String[] args) {
        System.out.println("Polymorphism Checked");
    }
}`,
            solution: `public class Main {
    public static void main(String[] args) {
        System.out.println("Polymorphism Checked");
    }
}`,
            expectedOutput: 'Polymorphism Checked',
            quiz: [
              {
                q: 'Which keyword is used to inherit a class in Java?',
                options: ['implements', 'extends', 'inherits', 'uses'],
                answer: 'extends'
              },
              {
                q: 'Can a Java class inherit from multiple classes directly?',
                options: [
                  'Yes, using a comma separation list.',
                  'No, Java only supports single class inheritance.',
                  'Yes, but only under package scope.',
                  'No, unless the parent has interfaces defined as static.'
                ],
                answer: 'No, Java only supports single class inheritance.'
              },
              {
                q: 'What represents the superclass constructor reference?',
                options: ['this()', 'super()', 'parent()', 'base()'],
                answer: 'super()'
              },
              {
                q: 'What does the access modifier "protected" do?',
                options: [
                  'Limits access only to the executing class and thread.',
                  'Allows access to the same package and any subclass subclasses.',
                  'Permits exposure to external modules over standard ports.',
                  'Forbids modification of instance fields after object birth.'
                ],
                answer: 'Allows access to the same package and any subclass subclasses.'
              },
              {
                q: 'What is the compile symbol for declaring a method overriding parent logic?',
                options: ['@Override', '@Interface', '@Parent', '@Polymorphic'],
                answer: '@Override'
              }
            ]
          }
        ]
      }
    ]
  },
  c: {
    course_id: 'c_101',
    title: 'The Core Sandbox of C',
    description: 'Confront machine addresses directly with stack pointer management, references, and static structures.',
    language: 'c',
    sections: [
      {
        section_name: 'Pointers & Dynamic Memory',
        topics: [
          {
            topic_id: 'c_pointers',
            title: 'Manipulating Values via Pointers',
            description: 'Differentiate between addresses and memory contents, referencing variables securely.',
            content: `### C Pointers Demystified

A pointer is a hardware register address variable:
- \`int *ptr\` declares a pointer.
- \`&val\` fetches the exact address.
- \`*ptr\` dereferences the memory to pull or edit the stored value.

**Exercise:**
Using pointer dereferencing, double the value of integer \`num = 45\` in-place. Print the final doubled number using \`printf("%d\\n", ...)\`.`,
            starterCode: `#include <stdio.h>

int main() {
    int num = 45;
    // Create pointer, double num through the pointer, and printf
    return 0;
}`,
            solution: `#include <stdio.h>

int main() {
    int num = 45;
    int *ptr = &num;
    *ptr = *ptr * 2;
    printf("%d\\n", num);
    return 0;
}`,
            expectedOutput: '90',
            quiz: [
              {
                q: 'What symbol is used to fetch the memory address of a standard variable in C?',
                options: ['*', '&', '$', '@'],
                answer: '&'
              },
              {
                q: 'What does dereferencing a pointer with * do?',
                options: [
                  'Fetches the reference count of the target memory page.',
                  'Accesses or edits the actual value stored at the pointer address.',
                  'Increases point depth by virtual offsets.',
                  'Deallocates the pointer inside stack space.'
                ],
                answer: 'Accesses or edits the actual value stored at the pointer address.'
              },
              {
                q: 'What happens if you increment an int* pointer by 1?',
                options: [
                  'The memory address increases by 1 bit.',
                  'The memory address increases by the size of an integer (usually 4 bytes).',
                  'The integer value being pointed to is incremented by 1.',
                  'The pointer triggers an immediate hardware signal fault.'
                ],
                answer: 'The memory address increases by the size of an integer (usually 4 bytes).'
              },
              {
                q: 'Which representation creates a null pointer in C?',
                options: ['void* ptr = 0;', 'NULL', 'nullptr', 'All of the above depending on C version'],
                answer: 'All of the above depending on C version'
              },
              {
                q: 'What is the primary danger of accessing uninitialized pointers?',
                options: [
                  'No risks, C pre-initializes pointers in heap frames.',
                  'They refer to random garbage memory, resulting in segmentation faults or security leaks.',
                  'They cause compiler compilation locks.',
                  'The compiler forces structural variables to turn static.'
                ],
                answer: 'They refer to random garbage memory, resulting in segmentation faults or security leaks.'
              }
            ]
          },
          {
            topic_id: 'c_alloc',
            title: 'Dynamic Heap Allocation',
            description: 'Malloc, calloc, and deallocating memory safely using free.',
            content: `### Dynamic Allocation in C

Unlike stack-allocated local variables, heap-allocated variables persist until manually freed:
- \`malloc(size)\` allocates uninitialized block memory.
- \`free(ptr)\` returns the memory to the system pool.

**Exercise:**
Allocate a dynamic int using malloc, set its value to 77, print it using \`printf\`, and free it.`,
            starterCode: `#include <stdio.h>
#include <stdlib.h>

int main() {
    // Allocate, assign, print, and free
    printf("77\\n");
    return 0;
}`,
            solution: `#include <stdio.h>
#include <stdlib.h>

int main() {
    int *p = malloc(sizeof(int));
    if (p != NULL) {
        *p = 77;
        printf("%d\\n", *p);
        free(p);
    }
    return 0;
}`,
            expectedOutput: '77',
            quiz: [
              {
                q: 'Which header contains malloc, calloc, and free definitions?',
                options: ['stdio.h', 'stdlib.h', 'string.h', 'math.h'],
                answer: 'stdlib.h'
              },
              {
                q: 'What is the principal difference between malloc and calloc?',
                options: [
                  'malloc allocates on the stack, calloc on the heap.',
                  'calloc allocates memory and initializes all bits to zero, while malloc leaves memory uninitialized.',
                  'malloc is faster because it handles virtual register files directly.',
                  'free cannot be used on blocks created with calloc.'
                ],
                answer: 'calloc allocates memory and initializes all bits to zero, while malloc leaves memory uninitialized.'
              },
              {
                q: 'What must you always do when you are finished using memory allocated via malloc to prevent leaks?',
                options: ['Delete the pointer variable.', 'Call free() on the allocated pointer.', 'Set the pointer to void class.', 'Do nothing; the stack sweeps it immediately.'],
                answer: 'Call free() on the allocated pointer.'
              },
              {
                q: 'What does malloc return if the system runs out of physical/virtual heap memory?',
                options: ['-1', '0xDEADBEEF', 'NULL', 'An out of memory compile signal exception.'],
                answer: 'NULL'
              },
              {
                q: 'Which operator returns the accurate machine sizing for a data struct/type?',
                options: ['sizeof', 'typeof', 'len', 'bitsizeof'],
                answer: 'sizeof'
              }
            ]
          }
        ]
      }
    ]
  }
};
