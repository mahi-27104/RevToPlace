/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { DSAProblem } from './types';

export const CATEGORIES = [
  'Core Programming',
  'Star Patterns',
  'Number Patterns',
  'Arrays & Sorting',
  'Strings',
  'Searches & Sorts',
  'Recursion',
  'Advanced DSA'
];

export const DSA_PROBLEMS: DSAProblem[] = [
  // CATEGORY 1: Core Programming
  {
    id: 'dsa-01',
    title: 'Even / Odd Check',
    difficulty: 'Easy',
    category: 'Core Programming',
    description: 'Determine whether a given integer is even or odd. Print "Even" or "Odd" accordingly.',
    starterCode: `def is_even_odd(num):
    # Write your logic here to return "Even" or "Odd"
    if num % 2 == 0:
        return "Even"
    return "Odd"

print(is_even_odd(15))`,
    solution: `def is_even_odd(num):
    return "Even" if num % 2 == 0 else "Odd"

print(is_even_odd(15))`,
    language: 'python',
    testCases: [{ input: '15', expected: 'Odd' }]
  },
  {
    id: 'dsa-02',
    title: 'Positive / Negative / Zero',
    difficulty: 'Easy',
    category: 'Core Programming',
    description: 'Classify an integer as "Positive", "Negative", or "Zero".',
    starterCode: `def check_sign(num):
    # Write logic returning "Positive", "Negative", or "Zero"
    pass

print(check_sign(-23))`,
    solution: `def check_sign(num):
    if num > 0: return "Positive"
    elif num < 0: return "Negative"
    return "Zero"

print(check_sign(-23))`,
    language: 'python',
    testCases: [{ input: '-23', expected: 'Negative' }]
  },
  {
    id: 'dsa-03',
    title: 'Largest of 2 Numbers',
    difficulty: 'Easy',
    category: 'Core Programming',
    description: 'Given two numbers, find and return the larger one.',
    starterCode: `def max_of_two(a, b):
    # Return larger of a and b
    pass

print(max_of_two(45, 99))`,
    solution: `def max_of_two(a, b):
    return max(a, b)

print(max_of_two(45, 99))`,
    language: 'python',
    testCases: [{ input: '45, 99', expected: '99' }]
  },
  {
    id: 'dsa-04',
    title: 'Largest of 3 Numbers',
    difficulty: 'Easy',
    category: 'Core Programming',
    description: 'Find and return the maximum value among three input integers.',
    starterCode: `def max_of_three(a, b, c):
    # Return maximum
    pass

print(max_of_three(12, 89, 45))`,
    solution: `def max_of_three(a, b, c):
    return max(a, b, c)

print(max_of_three(12, 89, 45))`,
    language: 'python',
    testCases: [{ input: '12, 89, 45', expected: '89' }]
  },
  {
    id: 'dsa-05',
    title: 'Leap Year',
    difficulty: 'Easy',
    category: 'Core Programming',
    description: 'Determine if a given year is a leap year. Returns true or false.',
    starterCode: `function isLeapYear(year) {
    // A leap year is divisible by 4, but not by 100 unless divisible by 400
    return false;
}

console.log(isLeapYear(2024));`,
    solution: `function isLeapYear(year) {
    return (year % 4 === 0 && year % 100 !== 0) || (year % 400 === 0);
}

console.log(isLeapYear(2024));`,
    language: 'javascript',
    testCases: [{ input: '2024', expected: 'true' }]
  },
  {
    id: 'dsa-06',
    title: 'Swap Two Numbers',
    difficulty: 'Easy',
    category: 'Core Programming',
    description: 'Swap the values of two variables with or without using a temporary/third variable.',
    starterCode: `def swap_numbers(a, b):
    # Swap variables inside Python
    a, b = b, a
    return f"{a}, {b}"

print(swap_numbers(5, 10))`,
    solution: `def swap_numbers(a, b):
    a, b = b, a
    return f"{a}, {b}"

print(swap_numbers(5, 10))`,
    language: 'python',
    testCases: [{ input: '5, 10', expected: '10, 5' }]
  },
  {
    id: 'dsa-07',
    title: 'Reverse a Number',
    difficulty: 'Easy',
    category: 'Core Programming',
    description: 'Reverse the digits of a given integer (e.g., 1234 -> 4321).',
    starterCode: `def reverse_number(n):
    # Reverse incoming digits
    pass

print(reverse_number(9876))`,
    solution: `def reverse_number(n):
    return int(str(n)[::-1])

print(reverse_number(9876))`,
    language: 'python',
    testCases: [{ input: '9876', expected: '6789' }]
  },
  {
    id: 'dsa-08',
    title: 'Sum of Digits',
    difficulty: 'Easy',
    category: 'Core Programming',
    description: 'Calculate the sum of all digits in a positive integer.',
    starterCode: `def sum_of_digits(val):
    # Calculate sum of digits
    pass

print(sum_of_digits(5462))`,
    solution: `def sum_of_digits(val):
    return sum(int(d) for d in str(val))

print(sum_of_digits(5462))`,
    language: 'python',
    testCases: [{ input: '5462', expected: '17' }]
  },
  {
    id: 'dsa-09',
    title: 'Count Digits',
    difficulty: 'Easy',
    category: 'Core Programming',
    description: 'Find the total count of digits in a given integer.',
    starterCode: `function countDigits(num) {
    // Write code to find count
    return 0;
}

console.log(countDigits(100523));`,
    solution: `function countDigits(num) {
    return Math.abs(num).toString().length;
}

console.log(countDigits(100523));`,
    language: 'javascript',
    testCases: [{ input: '100523', expected: '6' }]
  },
  {
    id: 'dsa-10',
    title: 'Power of a Number',
    difficulty: 'Easy',
    category: 'Core Programming',
    description: 'Compute the result of base raised to power exponent: base^exp.',
    starterCode: `def power_of(base, exp):
    # Calculate base ** exp
    pass

print(power_of(2, 10))`,
    solution: `def power_of(base, exp):
    return base ** exp

print(power_of(2, 10))`,
    language: 'python',
    testCases: [{ input: '2, 10', expected: '1024' }]
  },
  {
    id: 'dsa-11',
    title: 'Multiplication Table',
    difficulty: 'Easy',
    category: 'Core Programming',
    description: 'Generate the multiplication numbers sequence for a given number up to 5 multiples (e.g. n*1, n*2, n*3, n*4, n*5).',
    starterCode: `def table(n):
    # Return formatted space separated string of first 5 multiples
    # e.g., for 5: "5 10 15 20 25"
    pass

print(table(5))`,
    solution: `def table(n):
    return " ".join(str(n * i) for i in range(1, 6))

print(table(5))`,
    language: 'python',
    testCases: [{ input: '5', expected: '5 10 15 20 25' }]
  },
  {
    id: 'dsa-12',
    title: 'Simple Calculator',
    difficulty: 'Medium',
    category: 'Core Programming',
    description: 'Perform basic arithmetic calculations ("add", "subtract", "multiply", "divide") based on input arguments.',
    starterCode: `function calculate(op, a, b) {
    // Return the correct output representingop, e.g. "add", 10, 2
    return 0;
}

console.log(calculate("multiply", 7, 6));`,
    solution: `function calculate(op, a, b) {
    if (op === "add") return a + b;
    if (op === "subtract") return a - b;
    if (op === "multiply") return a * b;
    if (op === "divide") return a / b;
    return 0;
}

console.log(calculate("multiply", 7, 6));`,
    language: 'javascript',
    testCases: [{ input: '"multiply", 7, 6', expected: '42' }]
  },
  {
    id: 'dsa-13',
    title: 'Prime Number Check',
    difficulty: 'Easy',
    category: 'Core Programming',
    description: 'Detect whether a positive integer is prime (divisible only by 1 and itself).',
    starterCode: `def is_prime(n):
    # Return True or False
    if n < 2: return False
    for i in range(2, int(n**0.5) + 1):
        if n % i == 0: return False
    return True

print(is_prime(29))`,
    solution: `def is_prime(n):
    if n < 2: return False
    for i in range(2, int(n**0.5) + 1):
        if n % i == 0: return False
    return True

print(is_prime(29))`,
    language: 'python',
    testCases: [{ input: '29', expected: 'True' }]
  },
  {
    id: 'dsa-14',
    title: 'Print Primes in Range',
    difficulty: 'Medium',
    category: 'Core Programming',
    description: 'Find and format all prime numbers situated relative to a given range [start, end] enclosed in space borders.',
    starterCode: `def primes_in_range(start, end):
    # Return primes as space-separated string
    pass

print(primes_in_range(10, 30))`,
    solution: `def primes_in_range(start, end):
    primes = []
    for num in range(start, end + 1):
        if num < 2: continue
        is_p = True
        for i in range(2, int(num**0.5) + 1):
            if num % i == 0:
                is_p = False
                break
        if is_p:
            primes.append(str(num))
    return " ".join(primes)

print(primes_in_range(10, 30))`,
    language: 'python',
    testCases: [{ input: '10, 30', expected: '11 13 17 19 23 29' }]
  },
  {
    id: 'dsa-15',
    title: 'Factorial (Loop & Recursion)',
    difficulty: 'Easy',
    category: 'Core Programming',
    description: 'Compute the factorial of a positive integer (e.g. 5! = 120).',
    starterCode: `def factorial_num(n):
    # Return factorial product
    pass

print(factorial_num(6))`,
    solution: `def factorial_num(n):
    if n <= 1: return 1
    return n * factorial_num(n - 1)

print(factorial_num(6))`,
    language: 'python',
    testCases: [{ input: '6', expected: '720' }]
  },
  {
    id: 'dsa-16',
    title: 'Fibonacci Series',
    difficulty: 'Easy',
    category: 'Core Programming',
    description: 'Generate the first N Fibonacci sequence numbers as index-ordered listings.',
    starterCode: `function fibSeries(n) {
    // return space separated string of first N terms
    return "";
}

console.log(fibSeries(7));`,
    solution: `function fibSeries(n) {
    let arr = [0, 1];
    for(let i=2; i<n; i++) {
        arr.push(arr[i-1] + arr[i-2]);
    }
    return arr.slice(0, n).join(" ");
}

console.log(fibSeries(7));`,
    language: 'javascript',
    testCases: [{ input: '7', expected: '0 1 1 2 3 5 8' }]
  },
  {
    id: 'dsa-17',
    title: 'Armstrong Number Check',
    difficulty: 'Medium',
    category: 'Core Programming',
    description: 'Check if a positive integer is an Armstrong number (an N-digit number equal to the sum of the Nth powers of its digits).',
    starterCode: `def is_armstrong(n):
    # returns True or False
    # e.g. 153: 1^3 + 5^3 + 3^3 = 153
    pass

print(is_armstrong(153))`,
    solution: `def is_armstrong(n):
    s = str(n)
    power = len(s)
    tot = sum(int(char) ** power for char in s)
    return tot == n

print(is_armstrong(153))`,
    language: 'python',
    testCases: [{ input: '153', expected: 'True' }]
  },
  {
    id: 'dsa-18',
    title: 'Palindrome Number',
    difficulty: 'Easy',
    category: 'Core Programming',
    description: 'Check if a number reads the same backward as forward (e.g. 121 -> True).',
    starterCode: `def is_palindrome_num(n):
    # Return True or False
    pass

print(is_palindrome_num(1331))`,
    solution: `def is_palindrome_num(n):
    return str(n) == str(n)[::-1]

print(is_palindrome_num(1331))`,
    language: 'python',
    testCases: [{ input: '1331', expected: 'True' }]
  },
  {
    id: 'dsa-19',
    title: 'Perfect Number check',
    difficulty: 'Medium',
    category: 'Core Programming',
    description: 'A perfect number is a positive integer equal to the sum of its proper positive divisors (excluding itself). check if n is perfect.',
    starterCode: `def is_perfect(n):
    # 6: proper divisors are 1, 2, 3. Sum = 6. Perfect!
    pass

print(is_perfect(28))`,
    solution: `def is_perfect(n):
    if n <= 1: return False
    tot = 1
    for i in range(2, int(n**0.5) + 1):
        if n % i == 0:
            tot += i
            if i != n // i:
                tot += n // i
    return tot == n

print(is_perfect(28))`,
    language: 'python',
    testCases: [{ input: '28', expected: 'True' }]
  },
  {
    id: 'dsa-20',
    title: 'Strong Number Check',
    difficulty: 'Medium',
    category: 'Core Programming',
    description: 'Check if a number is a Strong number (the sum of factorials of its digits equals the number itself; e.g. 145 = 1! + 4! + 5!).',
    starterCode: `def is_strong(n):
    # returns True or False
    pass

print(is_strong(145))`,
    solution: `import math
def is_strong(n):
    return sum(math.factorial(int(x)) for x in str(n)) == n

print(is_strong(145))`,
    language: 'python',
    testCases: [{ input: '145', expected: 'True' }]
  },
  {
    id: 'dsa-21',
    title: 'GCD & LCM',
    difficulty: 'Medium',
    category: 'Core Programming',
    description: 'Find the Greatest Common Divisor (GCD) and Least Common Multiple (LCM) of two numbers. Output as string: "[gcd],[lcm]".',
    starterCode: `def gcd_lcm(a, b):
    # Return string formatted: "gcd,lcm"
    pass

print(gcd_lcm(12, 18))`,
    solution: `import math
def gcd_lcm(a, b):
    g = math.gcd(a, b)
    l = (a * b) // g
    return f"{g},{l}"

print(gcd_lcm(12, 18))`,
    language: 'python',
    testCases: [{ input: '12, 18', expected: '6,36' }]
  },
  {
    id: 'dsa-22',
    title: 'HCF using Euclid Algorithm',
    difficulty: 'Medium',
    category: 'Core Programming',
    description: 'Compute the Highest Common Factor (HCF) of two integers using the classic recursive Euclidean division algorithm.',
    starterCode: `function getHCF(a, b) {
    // Write recursive Euclidean algorithm
    return b === 0 ? a : getHCF(b, a % b);
}

console.log(getHCF(64, 48));`,
    solution: `function getHCF(a, b) {
    return b === 0 ? a : getHCF(b, a % b);
}

console.log(getHCF(64, 48));`,
    language: 'javascript',
    testCases: [{ input: '64, 48', expected: '16' }]
  },
  {
    id: 'dsa-23',
    title: 'Base Conversion',
    difficulty: 'Medium',
    category: 'Core Programming',
    description: 'Convert a binary string representation into standard octal and hexadecimal outputs combined with spaces: "Octal Hex".',
    starterCode: `def binary_convert(bin_str):
    # e.g: "10110" -> "26 16"
    pass

print(binary_convert("10110"))`,
    solution: `def binary_convert(bin_str):
    val = int(bin_str, 2)
    oct_str = oct(val)[2:]
    hex_str = hex(val)[2:].upper()
    return f"{oct_str} {hex_str}"

print(binary_convert("10110"))`,
    language: 'python',
    testCases: [{ input: '"10110"', expected: '26 16' }]
  },

  // CATEGORY 2: Star Patterns
  {
    id: 'dsa-24',
    title: 'Right Triangle Star Pattern',
    difficulty: 'Easy',
    category: 'Star Patterns',
    description: 'Generate N rows of right-aligned asterisks where each row n contains n stars up to N total rows.',
    starterCode: `def draw_triangle(n):
    # Return lines of stars joined by newlines
    lines = []
    for i in range(1, n + 1):
        lines.append("*" * i)
    return "\\n".join(lines)

print(draw_triangle(4))`,
    solution: `def draw_triangle(n):
    return "\\n".join("*" * i for i in range(1, n + 1))

print(draw_triangle(4))`,
    language: 'python',
    testCases: [{ input: '4', expected: "*\n**\n***\n****" }]
  },
  {
    id: 'dsa-25',
    title: 'Inverted Right Triangle',
    difficulty: 'Easy',
    category: 'Star Patterns',
    description: 'Generate an inverted right triangle star program with decreasing asterisk sizes from N down to 1.',
    starterCode: `def draw_inverted_triangle(n):
    # return joined star lines
    pass

print(draw_inverted_triangle(4))`,
    solution: `def draw_inverted_triangle(n):
    return "\\n".join("*" * i for i in range(n, 0, -1))

print(draw_inverted_triangle(4))`,
    language: 'python',
    testCases: [{ input: '4', expected: "****\n***\n**\n*" }]
  },
  {
    id: 'dsa-26',
    title: 'Pyramid Star Pattern',
    difficulty: 'Medium',
    category: 'Star Patterns',
    description: 'Print a synchronized space-padded symmetric pyramid of height N with (2i-1) stars on row i.',
    starterCode: `def pyramid(n):
    # Generate pyramid of stars centered properly
    # For N=3:
    # "  *  " -> space width is n - i
    # " *** "
    # "*****"
    pass

print(pyramid(3))`,
    solution: `def pyramid(n):
    result = []
    for i in range(1, n + 1):
        spaces = " " * (n - i)
        stars = "*" * (2 * i - 1)
        result.append(f"{spaces}{stars}")
    return "\\n".join(result)

print(pyramid(3))`,
    language: 'python',
    testCases: [{ input: '3', expected: "  *\n ***\n*****" }]
  },
  {
    id: 'dsa-27',
    title: 'Inverted Pyramid',
    difficulty: 'Medium',
    category: 'Star Patterns',
    description: 'Generate N rows of an inverted pyramid, decreasing the star count and padding centered with spaces.',
    starterCode: `def inverted_pyramid(n):
    pass

print(inverted_pyramid(3))`,
    solution: `def inverted_pyramid(n):
    result = []
    for i in range(n, 0, -1):
        spaces = " " * (n - i)
        stars = "*" * (2 * i - 1)
        result.append(f"{spaces}{stars}")
    return "\\n".join(result)

print(inverted_pyramid(3))`,
    language: 'python',
    testCases: [{ input: '3', expected: "*****\n ***\n  *" }]
  },
  {
    id: 'dsa-28',
    title: 'Diamond Pattern',
    difficulty: 'Medium',
    category: 'Star Patterns',
    description: 'Generate N lines of a complete star diamond pattern (N stands for upper pyramid height).',
    starterCode: `def diamond(n):
    # Print high quality diamond star pattern
    pass

print(diamond(3))`,
    solution: `def diamond(n):
    result = []
    # top half
    for i in range(1, n + 1):
        spaces = " " * (n - i)
        stars = "*" * (2 * i - 1)
        result.append(f"{spaces}{stars}")
    # bottom half
    for i in range(n - 1, 0, -1):
        spaces = " " * (n - i)
        stars = "*" * (2 * i - 1)
        result.append(f"{spaces}{stars}")
    return "\\n".join(result)

print(diamond(3))`,
    language: 'python',
    testCases: [{ input: '3', expected: "  *\n ***\n*****\n ***\n  *" }]
  },
  {
    id: 'dsa-29',
    title: 'Hollow Square Pattern',
    difficulty: 'Medium',
    category: 'Star Patterns',
    description: 'Render a hollow square of size N where stars populate boundaries and inner parts remain blank spaces.',
    starterCode: `def hollow_square(n):
    pass

print(hollow_square(4))`,
    solution: `def hollow_square(n):
    result = []
    for i in range(n):
        if i == 0 or i == n - 1:
            result.append("*" * n)
        else:
            result.append("*" + " " * (n - 2) + "*")
    return "\\n".join(result)

print(hollow_square(4))`,
    language: 'python',
    testCases: [{ input: '4', expected: "****\n*  *\n*  *\n****" }]
  },
  {
    id: 'dsa-30',
    title: 'Hollow Pyramid',
    difficulty: 'Hard',
    category: 'Star Patterns',
    description: 'Draw a centered hollow star pyramid where stars outline only the outer borders.',
    starterCode: `def hollow_pyramid(n):
    pass

print(hollow_pyramid(4))`,
    solution: `def hollow_pyramid(n):
    result = []
    for i in range(1, n + 1):
        spaces = " " * (n - i)
        if i == 1:
            result.append(f"{spaces}*")
        elif i == n:
            result.append("*" * (2 * n - 1))
        else:
            mid_spaces = " " * (2 * i - 3)
            result.append(f"{spaces}*{mid_spaces}*")
    return "\\n".join(result)

print(hollow_pyramid(4))`,
    language: 'python',
    testCases: [{ input: '4', expected: "   *\n  * *\n *   *\n*******" }]
  },

  // CATEGORY 3: Number Patterns
  {
    id: 'dsa-31',
    title: 'Incremental Number Grid',
    difficulty: 'Easy',
    category: 'Number Patterns',
    description: 'Print triangular incremental lists up to N rows of numbers (row 1: "1", row 2: "12", row 3: "123").',
    starterCode: `def number_tri(n):
    pass

print(number_tri(4))`,
    solution: `def number_tri(n):
    return "\\n".join("".join(str(j) for j in range(1, i + 1)) for i in range(1, n + 1))

print(number_tri(4))`,
    language: 'python',
    testCases: [{ input: '4', expected: "1\n12\n123\n1234" }]
  },
  {
    id: 'dsa-32',
    title: 'Pascal Triangle',
    difficulty: 'Medium',
    category: 'Number Patterns',
    description: 'Generate the first N rows of Pascal\'s triangle, printing coefficients with spaces.',
    starterCode: `def pascal_triangle(n):
    # returns rows of pascal numbers
    pass

print(pascal_triangle(4))`,
    solution: `def pascal_triangle(n):
    res = []
    for i in range(n):
        row = [1]
        if res:
            prev = res[-1]
            for j in range(len(prev) - 1):
                row.append(prev[j] + prev[j+1])
            row.append(1)
        res.append(row)
    return "\\n".join(" ".join(str(x) for x in r) for r in res)

print(pascal_triangle(4))`,
    language: 'python',
    testCases: [{ input: '4', expected: "1\n1 1\n1 2 1\n1 3 3 1" }]
  },
  {
    id: 'dsa-33',
    title: 'Floyd Triangle',
    difficulty: 'Medium',
    category: 'Number Patterns',
    description: 'Construct a triangle with contiguous incrementing numbers starting from 1 up to N rows.',
    starterCode: `def floyd_triangle(n):
    pass

print(floyd_triangle(4))`,
    solution: `def floyd_triangle(n):
    res = []
    curr = 1
    for i in range(1, n + 1):
        row = []
        for _ in range(i):
            row.append(str(curr))
            curr += 1
        res.append(" ".join(row))
    return "\\n".join(res)

print(floyd_triangle(4))`,
    language: 'python',
    testCases: [{ input: '4', expected: "1\n2 3\n4 5 6\n7 8 9 10" }]
  },

  // CATEGORY 4: Arrays & Sorting
  {
    id: 'dsa-34',
    title: 'Find Largest & Smallest Element',
    difficulty: 'Easy',
    category: 'Arrays & Sorting',
    description: 'Find and return the smallest and largest elements in an array. Output format: "[small],[large]"',
    starterCode: `def min_max(arr):
    pass

print(min_max([5, 12, 1, 9, 21]))`,
    solution: `def min_max(arr):
    return f"{min(arr)},{max(arr)}"

print(min_max([5, 12, 1, 9, 21]))`,
    language: 'python',
    testCases: [{ input: '[5, 12, 1, 9, 21]', expected: '1,21' }]
  },
  {
    id: 'dsa-35',
    title: 'Second Largest Element',
    difficulty: 'Medium',
    category: 'Arrays & Sorting',
    description: 'Determine the second largest distinct element inside an array of numbers.',
    starterCode: `function getSecondLargest(arr) {
    // Write logic returning value or -1 if none
    return -1;
}

console.log(getSecondLargest([12, 35, 1, 10, 34, 1]));`,
    solution: `function getSecondLargest(arr) {
    const s = Array.from(new Set(arr)).sort((a, b) => b - a);
    return s.length > 1 ? s[1] : -1;
}

console.log(getSecondLargest([12, 35, 1, 10, 34, 1]));`,
    language: 'javascript',
    testCases: [{ input: '[12, 35, 1, 10, 34, 1]', expected: '34' }]
  },
  {
    id: 'dsa-36',
    title: 'Reverse Array',
    difficulty: 'Easy',
    category: 'Arrays & Sorting',
    description: 'Reverse the order of elements in an array. Return the new array printed with spaces.',
    starterCode: `def reverse_array(arr):
    pass

print(" ".join(map(str, reverse_array([1, 2, 3, 4, 5]))))`,
    solution: `def reverse_array(arr):
    return arr[::-1]

print(" ".join(map(str, reverse_array([1, 2, 3, 4, 5]))))`,
    language: 'python',
    testCases: [{ input: '[1, 2, 3, 4, 5]', expected: '5 4 3 2 1' }]
  },
  {
    id: 'dsa-37',
    title: 'Bubble Sort Check',
    difficulty: 'Medium',
    category: 'Arrays & Sorting',
    description: 'Perform standard inline bubble sorting on an array. Return a space separated string showing sorting.',
    starterCode: `def bubble_sort(arr):
    # Bubble sorting
    n = len(arr)
    for i in range(n):
        for j in range(0, n-i-1):
            if arr[j] > arr[j+1]:
                arr[j], arr[j+1] = arr[j+1], arr[j]
    return arr

print(" ".join(map(str, bubble_sort([64, 34, 25, 12, 22]))))`,
    solution: `def bubble_sort(arr):
    n = len(arr)
    for i in range(n):
        for j in range(0, n-i-1):
            if arr[j] > arr[j+1]:
                arr[j], arr[j+1] = arr[j+1], arr[j]
    return arr

print(" ".join(map(str, bubble_sort([64, 34, 25, 12, 22]))))`,
    language: 'python',
    testCases: [{ input: '[64, 34, 25, 12, 22]', expected: '12 22 25 34 64' }]
  },
  {
    id: 'dsa-38',
    title: 'Remove Duplicates',
    difficulty: 'Easy',
    category: 'Arrays & Sorting',
    description: 'Remove duplicates from a sorted array in-place, returning the unique elements space-separated.',
    starterCode: `def remove_dup(arr):
    pass

print(" ".join(map(str, remove_dup([1, 1, 2, 2, 3, 4]))))`,
    solution: `def remove_dup(arr):
    return sorted(list(set(arr)))

print(" ".join(map(str, remove_dup([1, 1, 2, 2, 3, 4]))))`,
    language: 'python',
    testCases: [{ input: '[1, 1, 2, 2, 3, 4]', expected: '1 2 3 4' }]
  },
  {
    id: 'dsa-39',
    title: 'Frequency of Elements',
    difficulty: 'Medium',
    category: 'Arrays & Sorting',
    description: 'Find the frequency of occurrence of each element in an array. Output in format "[val]:[freq],[val]:[freq]" ordered by value ascending.',
    starterCode: `def frequencies(arr):
    pass

print(frequencies([2, 3, 2, 4, 5, 4]))`,
    solution: `from collections import Counter
def frequencies(arr):
    cnt = Counter(arr)
    items = sorted(list(cnt.items()))
    return ",".join(f"{k}:{v}" for k, v in items)

print(frequencies([2, 3, 2, 4, 5, 4]))`,
    language: 'python',
    testCases: [{ input: '[2, 3, 2, 4, 5, 4]', expected: '2:2,3:1,4:2,5:1' }]
  },
  {
    id: 'dsa-40',
    title: 'Merge Two Sorted Arrays',
    difficulty: 'Easy',
    category: 'Arrays & Sorting',
    description: 'Merge two presorted arrays into a single sorted array. Print space separated values.',
    starterCode: `def merge_sorted(arr1, arr2):
    pass

print(" ".join(map(str, merge_sorted([1, 3, 5], [2, 4, 6]))))`,
    solution: `def merge_sorted(arr1, arr2):
    return sorted(arr1 + arr2)

print(" ".join(map(str, merge_sorted([1, 3, 5], [2, 4, 6]))))`,
    language: 'python',
    testCases: [{ input: '[1, 3, 5], [2, 4, 6]', expected: '1 2 3 4 5 6' }]
  },
  {
    id: 'dsa-41',
    title: 'Rotate Array',
    difficulty: 'Medium',
    category: 'Arrays & Sorting',
    description: 'Left rotate an array by K steps. Print resulting array values space bordered.',
    starterCode: `def rotate_array(arr, k):
    pass

print(" ".join(map(str, rotate_array([1, 2, 3, 4, 5], 2))))`,
    solution: `def rotate_array(arr, k):
    n = len(arr)
    k = k % n
    return arr[k:] + arr[:k]

print(" ".join(map(str, rotate_array([1, 2, 3, 4, 5], 2))))`,
    language: 'python',
    testCases: [{ input: '[1, 2, 3, 4, 5], 2', expected: '3 4 5 1 2' }]
  },
  {
    id: 'dsa-42',
    title: 'Missing Number',
    difficulty: 'Easy',
    category: 'Arrays & Sorting',
    description: 'Find the single missing number inside an array comprising unique elements spanning from 1 to N.',
    starterCode: `function getMissing(arr, n) {
    // Sum from 1..N subtract sum(arr)
    return 0;
}

console.log(getMissing([1, 2, 4, 5, 6], 6));`,
    solution: `function getMissing(arr, n) {
    const total = (n * (n + 1)) / 2;
    const s = arr.reduce((x, y) => x + y, 0);
    return total - s;
}

console.log(getMissing([1, 2, 4, 5, 6], 6));`,
    language: 'javascript',
    testCases: [{ input: '[1, 2, 4, 5, 6], 6', expected: '3' }]
  },
  {
    id: 'dsa-43',
    title: 'Move Zeros to End',
    difficulty: 'Medium',
    category: 'Arrays & Sorting',
    description: 'Move all zeroes present inside an array to the rightmost trailing slots while maintaining absolute relative ordering of non-zero elements.',
    starterCode: `def move_zeroes(arr):
    pass

print(" ".join(map(str, move_zeroes([0, 1, 0, 3, 12]))))`,
    solution: `def move_zeroes(arr):
    non_zeros = [x for x in arr if x != 0]
    zeros = [0] * (len(arr) - len(non_zeros))
    return non_zeros + zeros

print(" ".join(map(str, move_zeroes([0, 1, 0, 3, 12]))))`,
    language: 'python',
    testCases: [{ input: '[0, 1, 0, 3, 12]', expected: '1 3 12 0 0' }]
  },
  {
    id: 'dsa-44',
    title: 'Leaders in Array',
    difficulty: 'Medium',
    category: 'Arrays & Sorting',
    description: 'Find leaders (an element is a leader if it is greater than all the elements to its right side). Print leaders space separated.',
    starterCode: `def find_leaders(arr):
    pass

print(" ".join(map(str, find_leaders([16, 17, 4, 3, 5, 2]))))`,
    solution: `def find_leaders(arr):
    leaders = []
    max_val = float('-inf')
    for x in reversed(arr):
        if x > max_val:
            leaders.append(x)
            max_val = x
    return list(reversed(leaders))

print(" ".join(map(str, find_leaders([16, 17, 4, 3, 5, 2]))))`,
    language: 'python',
    testCases: [{ input: '[16, 17, 4, 3, 5, 2]', expected: '17 5 2' }]
  },

  // CATEGORY 5: Strings
  {
    id: 'dsa-45',
    title: 'Reverse String Check',
    difficulty: 'Easy',
    category: 'Strings',
    description: 'Reverse standard input characters list backwards returning string.',
    starterCode: `def reverse_str(s):
    return s[::-1]

print(reverse_str("developer"))`,
    solution: `def reverse_str(s):
    return s[::-1]

print(reverse_str("developer"))`,
    language: 'python',
    testCases: [{ input: '"developer"', expected: 'repoleved' }]
  },
  {
    id: 'dsa-46',
    title: 'Palindrome String',
    difficulty: 'Easy',
    category: 'Strings',
    description: 'Check if a string is a palindrome. Return true or false.',
    starterCode: `function isPalindromeStr(s) {
    // Check if alphanumeric characters read forward match backward
    return false;
}

console.log(isPalindromeStr("radar"));`,
    solution: `function isPalindromeStr(s) {
    const clean = s.toLowerCase().replace(/[^a-z0-9]/g, '');
    return clean === clean.split('').reverse().join('');
}

console.log(isPalindromeStr("radar"));`,
    language: 'javascript',
    testCases: [{ input: '"radar"', expected: 'true' }]
  },
  {
    id: 'dsa-47',
    title: 'Count Classes',
    difficulty: 'Easy',
    category: 'Strings',
    description: 'Count total occurrences of Vowels (v), Consonants (c), and Digits (d) in string. Output format: "v:[val],c:[val],d:[val]"',
    starterCode: `def count_items(s):
    pass

print(count_items("Python 3.10"))`,
    solution: `def count_items(s):
    s = s.lower()
    vowels = set('aeiou')
    v, c, d = 0, 0, 0
    for char in s:
        if char.isdigit():
            d += 1
        elif char.isalpha():
            if char in vowels:
                v += 1
            else:
                c += 1
    return f"v:{v},c:{c},d:{d}"

print(count_items("Python 3.10"))`,
    language: 'python',
    testCases: [{ input: '"Python 3.10"', expected: 'v:1,c:5,d:3' }]
  },
  {
    id: 'dsa-48',
    title: 'Remove Spaces',
    difficulty: 'Easy',
    category: 'Strings',
    description: 'Strip all empty blank string spaces out from character arrays.',
    starterCode: `def remove_spaces(s):
    pass

print(remove_spaces("C o d e S a n d b o x"))`,
    solution: `def remove_spaces(s):
    return s.replace(" ", "")

print(remove_spaces("C o d e S a n d b o x"))`,
    language: 'python',
    testCases: [{ input: '"C o d e S a n d b o x"', expected: 'CodeSandbox' }]
  },
  {
    id: 'dsa-49',
    title: 'Remove Duplicate Characters',
    difficulty: 'Medium',
    category: 'Strings',
    description: 'Filter unique letters out from string, retaining correct layout sequence ordering.',
    starterCode: `def rem_duplicate_chars(s):
    pass

print(rem_duplicate_chars("programming"))`,
    solution: `def rem_duplicate_chars(s):
    seen = set()
    result = []
    for char in s:
        if char not in seen:
            seen.add(char)
            result.append(char)
    return "".join(result)

print(rem_duplicate_chars("programming"))`,
    language: 'python',
    testCases: [{ input: '"programming"', expected: 'progamin' }]
  },
  {
    id: 'dsa-50',
    title: 'Anagram Check',
    difficulty: 'Easy',
    category: 'Strings',
    description: 'Verify if two words or lists are anagrams of each other (rearranged identical letter subsets).',
    starterCode: `def is_anagram(s1, s2):
    pass

print(is_anagram("listen", "silent"))`,
    solution: `def is_anagram(s1, s2):
    return sorted(s1) == sorted(s2)

print(is_anagram("listen", "silent"))`,
    language: 'python',
    testCases: [{ input: '"listen", "silent"', expected: 'True' }]
  },
  {
    id: 'dsa-51',
    title: 'First Non-Repeating Character',
    difficulty: 'Medium',
    category: 'Strings',
    description: 'Find and return the first character inside a string that does not recur. If none, return "_".',
    starterCode: `def first_unique(s):
    pass

print(first_unique("leetcode"))`,
    solution: `from collections import Counter
def first_unique(s):
    cnt = Counter(s)
    for char in s:
        if cnt[char] == 1:
            return char
    return "_"

print(first_unique("leetcode"))`,
    language: 'python',
    testCases: [{ input: '"leetcode"', expected: 'l' }]
  },
  {
    id: 'dsa-52',
    title: 'Most Repeated Character',
    difficulty: 'Medium',
    category: 'Strings',
    description: 'Locate the letter recurring with peak counts inside standard strings.',
    starterCode: `def peak_recur(s):
    pass

print(peak_recur("testcase"))`,
    solution: `from collections import Counter
def peak_recur(s):
    cnt = Counter(s)
    return cnt.most_common(1)[0][0]

print(peak_recur("testcase"))`,
    language: 'python',
    testCases: [{ input: '"testcase"', expected: 'e' }]
  },
  {
    id: 'dsa-53',
    title: 'String Compression',
    difficulty: 'Medium',
    category: 'Strings',
    description: 'Compress repetitive letters into character-count markers (e.g. "aaabb" -> "a3b2").',
    starterCode: `def compress(s):
    # Returns compressed string
    pass

print(compress("aaabbccc"))`,
    solution: `def compress(s):
    if not s: return ""
    res = []
    curr = s[0]
    cnt = 1
    for char in s[1:]:
        if char == curr:
            cnt += 1
        else:
            res.append(f"{curr}{cnt}")
            curr = char
            cnt = 1
    res.append(f"{curr}{cnt}")
    return "".join(res)

print(compress("aaabbccc"))`,
    language: 'python',
    testCases: [{ input: '"aaabbccc"', expected: 'a3b2c3' }]
  },
  {
    id: 'dsa-54',
    title: 'Check String Rotation',
    difficulty: 'Medium',
    category: 'Strings',
    description: 'Determine if a second string is a rotation of the original string (e.g., "waterbottle" -> True for "erbottlewat").',
    starterCode: `def is_rotated(s1, s2):
    pass

print(is_rotated("waterbottle", "erbottlewat"))`,
    solution: `def is_rotated(s1, s2):
    return len(s1) == len(s2) and s2 in (s1 + s1)

print(is_rotated("waterbottle", "erbottlewat"))`,
    language: 'python',
    testCases: [{ input: '"waterbottle", "erbottlewat"', expected: 'True' }]
  },

  // CATEGORY 6: Searches & Sorts
  {
    id: 'dsa-55',
    title: 'Linear Search',
    difficulty: 'Easy',
    category: 'Searches & Sorts',
    description: 'Find the index of target elements. If target not present return -1.',
    starterCode: `def linear_search(arr, target):
    pass

print(linear_search([4, 2, 9, 7, 5], 7))`,
    solution: `def linear_search(arr, target):
    try:
        return arr.index(target)
    except ValueError:
        return -1

print(linear_search([4, 2, 9, 7, 5], 7))`,
    language: 'python',
    testCases: [{ input: '[4, 2, 9, 7, 5], 7', expected: '3' }]
  },
  {
    id: 'dsa-56',
    title: 'Binary Search',
    difficulty: 'Medium',
    category: 'Searches & Sorts',
    description: 'Perform optimized logarithmic search looking for target pointers in a presorted array.',
    starterCode: `def binary_search(arr, target):
    pass

print(binary_search([1, 3, 5, 7, 9, 11], 9))`,
    solution: `def binary_search(arr, target):
    l, r = 0, len(arr) - 1
    while l <= r:
        mid = (l + r) // 2
        if arr[mid] == target: return mid
        elif arr[mid] < target: l = mid + 1
        else: r = mid - 1
    return -1

print(binary_search([1, 3, 5, 7, 9, 11], 9))`,
    language: 'python',
    testCases: [{ input: '[1, 3, 5, 7, 9, 11], 9', expected: '4' }]
  },
  {
    id: 'dsa-57',
    title: 'Sort Check (Bubble)',
    difficulty: 'Easy',
    category: 'Searches & Sorts',
    description: 'Implement a short Bubble Sort function returning the array sorting representation.',
    starterCode: `def basic_bubble(arr):
    # Sort
    pass

print(" ".join(map(str, basic_bubble([5, 1, 4, 2, 8]))))`,
    solution: `def basic_bubble(arr):
    return sorted(arr)

print(" ".join(map(str, basic_bubble([5, 1, 4, 2, 8]))))`,
    language: 'python',
    testCases: [{ input: '[5, 1, 4, 2, 8]', expected: '1 2 4 5 8' }]
  },
  {
    id: 'dsa-58',
    title: 'Selection Sort',
    difficulty: 'Medium',
    category: 'Searches & Sorts',
    description: 'Implement Selection Sort on an array of integers.',
    starterCode: `def selection_sort(arr):
    pass

print(" ".join(map(str, selection_sort([29, 10, 14, 37, 25]))))`,
    solution: `def selection_sort(arr):
    n = len(arr)
    for i in range(n):
        min_idx = i
        for j in range(i+1, n):
            if arr[j] < arr[min_idx]:
                min_idx = j
        arr[i], arr[min_idx] = arr[min_idx], arr[i]
    return arr

print(" ".join(map(str, selection_sort([29, 10, 14, 37, 25]))))`,
    language: 'python',
    testCases: [{ input: '[29, 10, 14, 37, 25]', expected: '10 14 25 29 37' }]
  },
  {
    id: 'dsa-59',
    title: 'Insertion Sort',
    difficulty: 'Medium',
    category: 'Searches & Sorts',
    description: 'Implement Insertion Sort step logic.',
    starterCode: `def insertion_sort(arr):
    pass

print(" ".join(map(str, insertion_sort([12, 11, 13, 5, 6]))))`,
    solution: `def insertion_sort(arr):
    for i in range(1, len(arr)):
        key = arr[i]
        j = i-1
        while j >= 0 and key < arr[j]:
            arr[j+1] = arr[j]
            j -= 1
        arr[j+1] = key
    return arr

print(" ".join(map(str, insertion_sort([12, 11, 13, 5, 6]))))`,
    language: 'python',
    testCases: [{ input: '[12, 11, 13, 5, 6]', expected: '5 6 11 12 13' }]
  },
  {
    id: 'dsa-60',
    title: 'Merge Sort',
    difficulty: 'Hard',
    category: 'Searches & Sorts',
    description: 'Implement stable Merge Sort ($O(N \\log N)$).',
    starterCode: `def merge_sort(arr):
    pass

print(" ".join(map(str, merge_sort([38, 27, 43, 3, 9, 82]))))`,
    solution: `def merge_sort(arr):
    return sorted(arr)

print(" ".join(map(str, merge_sort([38, 27, 43, 3, 9, 82]))))`,
    language: 'python',
    testCases: [{ input: '[38, 27, 43, 3, 9, 82]', expected: '3 9 27 38 43 82' }]
  },
  {
    id: 'dsa-61',
    title: 'Quick Sort',
    difficulty: 'Hard',
    category: 'Searches & Sorts',
    description: 'Implement efficient Pivot-led Quick Sort recursion algorithms.',
    starterCode: `def quick_sort(arr):
    pass

print(" ".join(map(str, quick_sort([10, 80, 30, 90, 40, 50, 70]))))`,
    solution: `def quick_sort(arr):
    return sorted(arr)

print(" ".join(map(str, quick_sort([10, 80, 30, 90, 40, 50, 70]))))`,
    language: 'python',
    testCases: [{ input: '[10, 80, 30, 90, 40, 50, 70]', expected: '10 30 40 50 70 80 90' }]
  },

  // CATEGORY 7: Recursion
  {
    id: 'dsa-62',
    title: 'Fibonacci Recursion',
    difficulty: 'Easy',
    category: 'Recursion',
    description: 'Return the N-th Fibonacci sequence value calculated via strict recursive call stacks.',
    starterCode: `def fibRecursive(n):
    # base and recurrence steps
    if n <= 0: return 0
    if n == 1: return 1
    return fibRecursive(n-1) + fibRecursive(n-2)

print(fibRecursive(10))`,
    solution: `def fibRecursive(n):
    if n <= 0: return 0
    if n == 1: return 1
    return fibRecursive(n-1) + fibRecursive(n-2)

print(fibRecursive(10))`,
    language: 'python',
    testCases: [{ input: '10', expected: '55' }]
  },
  {
    id: 'dsa-63',
    title: 'Tower of Hanoi',
    difficulty: 'Hard',
    category: 'Recursion',
    description: 'Return total moves count required to transition N rings sequentially.',
    starterCode: `def hanoi_moves(n):
    # recurrence formula: 2^n - 1
    return (2 ** n) - 1

print(hanoi_moves(4))`,
    solution: `def hanoi_moves(n):
    return (2 ** n) - 1

print(hanoi_moves(4))`,
    language: 'python',
    testCases: [{ input: '4', expected: '15' }]
  },
  {
    id: 'dsa-64',
    title: 'Sum of Array (Recursive)',
    difficulty: 'Easy',
    category: 'Recursion',
    description: 'Calculate array values sum recursively.',
    starterCode: `def recursive_sum(arr):
    pass

print(recursive_sum([1, 2, 3, 4, 10]))`,
    solution: `def recursive_sum(arr):
    if not arr: return 0
    return arr[0] + recursive_sum(arr[1:])

print(recursive_sum([1, 2, 3, 4, 10]))`,
    language: 'python',
    testCases: [{ input: '[1, 2, 3, 4, 10]', expected: '20' }]
  },
  {
    id: 'dsa-65',
    title: 'Reverse String Recursively',
    difficulty: 'Easy',
    category: 'Recursion',
    description: 'Invert character elements string recursively.',
    starterCode: `def reverse_recursive(s):
    pass

print(reverse_recursive("interview"))`,
    solution: `def reverse_recursive(s):
    if len(s) == 0: return ""
    return s[-1] + reverse_recursive(s[:-1])

print(reverse_recursive("interview"))`,
    language: 'python',
    testCases: [{ input: '"interview"', expected: 'weivretni' }]
  },
  {
    id: 'dsa-66',
    title: 'Power Recursive',
    difficulty: 'Medium',
    category: 'Recursion',
    description: 'Return calculation for exponent raises recursively.',
    starterCode: `def recursive_pow(base, exp):
    pass

print(recursive_pow(3, 4))`,
    solution: `def recursive_pow(base, exp):
    if exp == 0: return 1
    return base * recursive_pow(base, exp - 1)

print(recursive_pow(3, 4))`,
    language: 'python',
    testCases: [{ input: '3, 4', expected: '81' }]
  },
  {
    id: 'dsa-67',
    title: 'Subset Generation',
    difficulty: 'Hard',
    category: 'Recursion',
    description: 'Generate power set combinations. returns count of subsets generated for list depth.',
    starterCode: `def count_subsets(arr):
    # Subset counts always equal 2^N
    return 2 ** len(arr)

print(count_subsets([1, 2, 3, 4]))`,
    solution: `def count_subsets(arr):
    return 1 << len(arr)

print(count_subsets([1, 2, 3, 4]))`,
    language: 'python',
    testCases: [{ input: '[1, 2, 3, 4]', expected: '16' }]
  },
  {
    id: 'dsa-68',
    title: 'Permutations of String',
    difficulty: 'Hard',
    category: 'Recursion',
    description: 'Find unique string permutation sequence orders. returns count of unique permutations.',
    starterCode: `def count_permutations(s):
    import math
    return math.factorial(len(s))

print(count_permutations("codes"))`,
    solution: `import math
def count_permutations(s):
    return math.factorial(len(s))

print(count_permutations("codes"))`,
    language: 'python',
    testCases: [{ input: '"codes"', expected: '120' }]
  },

  // CATEGORY 8: Advanced DSA Problems
  {
    id: 'dsa-69',
    title: 'Two Sum Problem',
    difficulty: 'Medium',
    category: 'Advanced DSA',
    description: 'Return index pairs summing specifically to Target constraints.',
    starterCode: `def two_sum(nums, target):
    seen = {}
    for i, num in enumerate(nums):
        compl = target - num
        if compl in seen:
            return [seen[compl], i]
        seen[num] = i
    return []

print(two_sum([2, 7, 11, 15], 9))`,
    solution: `def two_sum(nums, target):
    seen = {}
    for i, num in enumerate(nums):
        compl = target - num
        if compl in seen:
            return [seen[compl], i]
        seen[num] = i
    return []

print(two_sum([2, 7, 11, 15], 9))`,
    language: 'python',
    testCases: [{ input: '[2, 7, 11, 15], 9', expected: '[0, 1]' }]
  },
  {
    id: 'dsa-70',
    title: 'Kadane\'s Algorithm',
    difficulty: 'Medium',
    category: 'Advanced DSA',
    description: 'Given an integer array, find the contiguous subarray (containing at least one number) which has the largest sum and return its sum.',
    starterCode: `def max_subarray(arr):
    # Write optimized subarray Kadane search
    pass

print(max_subarray([-2, 1, -3, 4, -1, 2, 1, -5, 4]))`,
    solution: `def max_subarray(arr):
    max_so_far = arr[0]
    curr_max = arr[0]
    for x in arr[1:]:
        curr_max = max(x, curr_max + x)
        max_so_far = max(max_so_far, curr_max)
    return max_so_far

print(max_subarray([-2, 1, -3, 4, -1, 2, 1, -5, 4]))`,
    language: 'python',
    testCases: [{ input: '[-2, 1, -3, 4, -1, 2, 1, -5, 4]', expected: '6' }]
  },
  {
    id: 'dsa-71',
    title: 'Majority Element',
    difficulty: 'Medium',
    category: 'Advanced DSA',
    description: 'Locate the majority array integer recurring strictly exceeding N/2 times.',
    starterCode: `def get_majority(arr):
    # Boyer-Moore Voting Algorithm
    pass

print(get_majority([2, 2, 1, 1, 1, 2, 2]))`,
    solution: `def get_majority(arr):
    cand = None
    count = 0
    for num in arr:
        if count == 0:
            cand = num
        count += (1 if num == cand else -1)
    return cand

print(get_majority([2, 2, 1, 1, 1, 2, 2]))`,
    language: 'python',
    testCases: [{ input: '[2, 2, 1, 1, 1, 2, 2]', expected: '2' }]
  },
  {
    id: 'dsa-72',
    title: 'Stock Buy & Sell Profit',
    difficulty: 'Medium',
    category: 'Advanced DSA',
    description: 'Find top gain potential choosing optimal timestamps resolving purchase points.',
    starterCode: `def max_profit(prices):
    pass

print(max_profit([7, 1, 5, 3, 6, 4]))`,
    solution: `def max_profit(prices):
    if not prices: return 0
    min_price = float('inf')
    max_prof = 0
    for price in prices:
        if price < min_price:
            min_price = price
        elif price - min_price > max_prof:
            max_prof = price - min_price
    return max_prof

print(max_profit([7, 1, 5, 3, 6, 4]))`,
    language: 'python',
    testCases: [{ input: '[7, 1, 5, 3, 6, 4]', expected: '5' }]
  },
  {
    id: 'dsa-73',
    title: 'Longest Substring Without Repeating characters',
    difficulty: 'Hard',
    category: 'Advanced DSA',
    description: 'Determine peak widths of distinct substrings devoid of repeating entities.',
    starterCode: `def len_longest_substr(s):
    pass

print(len_longest_substr("abcabcbb"))`,
    solution: `def len_longest_substr(s):
    used = {}
    start = max_len = 0
    for i, char in enumerate(s):
        if char in used and start <= used[char]:
            start = used[char] + 1
        else:
            max_len = max(max_len, i - start + 1)
        used[char] = i
    return max_len

print(len_longest_substr("abcabcbb"))`,
    language: 'python',
    testCases: [{ input: '"abcabcbb"', expected: '3' }]
  },
  {
    id: 'dsa-74',
    title: 'Valid Parentheses',
    difficulty: 'Medium',
    category: 'Advanced DSA',
    description: 'Compute matching stack constraints verifying that opening symbols cleanly close chronologically.',
    starterCode: `function checkParentheses(s) {
    const stack = [];
    const map = { ')': '(', '}': '{', ']': '[' };
    for (let char of s) {
        if (char in map) {
            if (stack.pop() !== map[char]) return false;
        } else {
            stack.push(char);
        }
    }
    return stack.length === 0;
}

console.log(checkParentheses("()[]{}"));`,
    solution: `function checkParentheses(s) {
    const stack = [];
    const map = { ')': '(', '}': '{', ']': '[' };
    for (let char of s) {
        if (char in map) {
            if (stack.pop() !== map[char]) return false;
        } else {
            stack.push(char);
        }
    }
    return stack.length === 0;
}

console.log(checkParentheses("()[]{}"));`,
    language: 'javascript',
    testCases: [{ input: '"()[]{}"', expected: 'true' }]
  },
  {
    id: 'dsa-75',
    title: 'Intersection of Arrays',
    difficulty: 'Easy',
    category: 'Advanced DSA',
    description: 'Extract common intersecting elements between two numerical array inputs.',
    starterCode: `def get_intersection(arr1, arr2):
    pass

print(" ".join(map(str, get_intersection([1, 2, 2, 1], [2, 2]))))`,
    solution: `def get_intersection(arr1, arr2):
    return sorted(list(set(arr1) & set(arr2)))

print(" ".join(map(str, get_intersection([1, 2, 2, 1], [2, 2]))))`,
    language: 'python',
    testCases: [{ input: '[1, 2, 2, 1], [2, 2]', expected: '2' }]
  },
  {
    id: 'dsa-76',
    title: 'Rotate Matrix 90 degrees',
    difficulty: 'Hard',
    category: 'Advanced DSA',
    description: 'Transpose and invert matrix coordinates, resulting in 90 degree clockwise rotation.',
    starterCode: `def rotate_matrix(mat):
    # mat is 2D list of size 2x2. e.g. [[1,2],[3,4]]
    # Outputs rotated list mapped to string flat "1,2,3...":
    pass

print(rotate_matrix([[1, 2], [3, 4]]))`,
    solution: `def rotate_matrix(mat):
    # Rotate [[1,2],[3,4]] -> [[3,1],[4,2]] -> flat "3,1,4,2" or join
    # Let's do standard matrix rotation
    n = len(mat)
    for i in range(n):
        for j in range(i, n):
            mat[i][j], mat[j][i] = mat[j][i], mat[i][j]
    for i in range(n):
        mat[i].reverse()
    # Flatten output
    return ",".join(str(x) for r in mat for x in r)

print(rotate_matrix([[1, 2], [3, 4]]))`,
    language: 'python',
    testCases: [{ input: '[[1, 2], [3, 4]]', expected: '3,1,4,2' }]
  },
  {
    id: 'dsa-77',
    title: 'Spiral Matrix Print',
    difficulty: 'Hard',
    category: 'Advanced DSA',
    description: 'Iterate through 2D array matrix tracking items spiraling clockwise. Output values flat.',
    starterCode: `def draw_spiral(mat):
    pass

print(draw_spiral([[1, 2], [3, 4]]))`,
    solution: `def draw_spiral(mat):
    if not mat: return ""
    res = []
    r1, r2 = 0, len(mat) - 1
    c1, c2 = 0, len(mat[0]) - 1
    while r1 <= r2 and c1 <= c2:
        for c in range(c1, c2 + 1): res.append(mat[r1][c])
        for r in range(r1 + 1, r2 + 1): res.append(mat[r][c2])
        if r1 < r2 and c1 < c2:
            for c in range(c2 - 1, c1, -1): res.append(mat[r2][c])
            for r in range(r2, r1, -1): res.append(mat[r][c1])
        r1 += 1
        r2 -= 1
        c1 += 1
        c2 -= 1
    return " ".join(map(str, res))

print(draw_spiral([[1, 2], [3, 4]]))`,
    language: 'python',
    testCases: [{ input: '[[1, 2], [3, 4]]', expected: '1 2 4 3' }]
  },
  {
    id: 'dsa-78',
    title: 'Trapping Rain Water',
    difficulty: 'Hard',
    category: 'Advanced DSA',
    description: 'Calculate overall trapping volumes situated relative to height structures on a grid.',
    starterCode: `def trap_water(h):
    pass

print(trap_water([0, 1, 0, 2, 1, 0, 1, 3, 2, 1, 2, 1]))`,
    solution: `def trap_water(h):
    if not h: return 0
    l, r = 0, len(h) - 1
    l_max, r_max = h[l], h[r]
    ans = 0
    while l < r:
        if h[l] < h[r]:
            if h[l] >= l_max: l_max = h[l]
            else: ans += l_max - h[l]
            l += 1
        else:
            if h[r] >= r_max: r_max = h[r]
            else: ans += r_max - h[r]
            r -= 1
    return ans

print(trap_water([0, 1, 0, 2, 1, 0, 1, 3, 2, 1, 2, 1]))`,
    language: 'python',
    testCases: [{ input: '[0, 1, 0, 2, 1, 0, 1, 3, 2, 1, 2, 1]', expected: '6' }]
  }
];
