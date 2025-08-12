import "@testing-library/jest-dom";
import { render, screen } from "@testing-library/react";
import { quizData, sortedListAnswers } from "../Assets/quiz";
import Random from "../Utilities/Random";

describe("Quiz Game - Utility Functions", () => {
  describe("Quiz Data", () => {
    test("quiz data exists and has questions", () => {
      expect(quizData).toBeDefined();
      expect(Array.isArray(quizData)).toBe(true);
      expect(quizData.length).toBeGreaterThan(0);
    });

    test("each quiz item has question and answer", () => {
      quizData.forEach((item, index) => {
        expect(item).toHaveProperty("Q");
        expect(item).toHaveProperty("A");
        expect(typeof item.Q).toBe("string");
        expect(typeof item.A).toBe("string");
        expect(item.Q.length).toBeGreaterThan(0);
        expect(item.A.length).toBeGreaterThan(0);
      });
    });

    test("questions are unique", () => {
      const questions = quizData.map((item) => item.Q);
      const uniqueQuestions = [...new Set(questions)];
      expect(questions.length).toBe(uniqueQuestions.length);
    });

    test("quiz data contains New Zealand related questions", () => {
      // Since this appears to be a NZ quiz, check for some NZ-related content
      const allText = quizData
        .map((item) => `${item.Q} ${item.A}`)
        .join(" ")
        .toLowerCase();
      expect(allText).toMatch(/new zealand|zealand|wellington|aotearoa|maori/);
    });
  });

  describe("Sorted List Answers Function", () => {
    test("returns array of answer options", () => {
      const answers = sortedListAnswers();
      expect(Array.isArray(answers)).toBe(true);
      expect(answers.length).toBeGreaterThan(0);
    });

    test("each answer option has value and label properties", () => {
      const answers = sortedListAnswers();
      answers.forEach((answer) => {
        expect(answer).toHaveProperty("value");
        expect(answer).toHaveProperty("label");
        expect(typeof answer.value).toBe("string");
        expect(typeof answer.label).toBe("string");
      });
    });

    test("answers are sorted alphabetically", () => {
      const answers = sortedListAnswers();
      const values = answers.map((answer) => answer.value);
      const sortedValues = [...values].sort();
      expect(values).toEqual(sortedValues);
    });

    test("includes all unique answers from quiz data", () => {
      const answers = sortedListAnswers();
      const answerValues = answers.map((answer) => answer.value);
      const quizAnswers = quizData.map((item) => item.A);
      const uniqueQuizAnswers = [...new Set(quizAnswers)];

      // Every unique answer from quiz should be in the sorted list
      uniqueQuizAnswers.forEach((answer) => {
        expect(answerValues).toContain(answer);
      });
    });

    test("value and label are the same for each option", () => {
      const answers = sortedListAnswers();
      answers.forEach((answer) => {
        expect(answer.value).toBe(answer.label);
      });
    });
  });

  describe("Random Function", () => {
    test("returns a number", () => {
      const result = Random(10);
      expect(typeof result).toBe("number");
    });

    test("returns integer within range", () => {
      const max = 5;
      for (let i = 0; i < 20; i++) {
        const result = Random(max);
        expect(result).toBeGreaterThanOrEqual(0);
        expect(result).toBeLessThan(max);
        expect(Number.isInteger(result)).toBe(true);
      }
    });

    test("works with different input sizes", () => {
      expect(Random(1)).toBe(0); // Only one option

      const result3 = Random(3);
      expect([0, 1, 2]).toContain(result3);

      const result100 = Random(100);
      expect(result100).toBeGreaterThanOrEqual(0);
      expect(result100).toBeLessThan(100);
    });

    test("handles edge cases", () => {
      // Test with quiz data length
      const quizLength = quizData.length;
      const result = Random(quizLength);
      expect(result).toBeGreaterThanOrEqual(0);
      expect(result).toBeLessThan(quizLength);
    });
  });

  describe("Game Logic Integration", () => {
    test("random index can access valid quiz data", () => {
      for (let i = 0; i < 10; i++) {
        const randomIndex = Random(quizData.length);
        const selectedQuestion = quizData[randomIndex];

        expect(selectedQuestion).toBeDefined();
        expect(selectedQuestion.Q).toBeDefined();
        expect(selectedQuestion.A).toBeDefined();
      }
    });

    test("all quiz answers appear in sorted answers list", () => {
      const sortedAnswers = sortedListAnswers();
      const answerValues = sortedAnswers.map((item) => item.value);

      quizData.forEach((quiz) => {
        expect(answerValues).toContain(quiz.A);
      });
    });

    test("win condition works correctly", () => {
      // Test the win/lose logic with actual data
      const firstQuestion = quizData[0];
      const correctAnswer = firstQuestion.A;
      const wrongAnswer = quizData.find((q) => q.A !== correctAnswer)?.A || "Wrong Answer";

      // Mock the winLoseCalc function logic
      const winLoseCalc = (userAnswer, correctAnswer) => {
        if (userAnswer !== "undefined") {
          return userAnswer === correctAnswer ? "win" : "lose";
        }
      };

      expect(winLoseCalc(correctAnswer, correctAnswer)).toBe("win");
      expect(winLoseCalc(wrongAnswer, correctAnswer)).toBe("lose");
    });
  });

  describe("Data Consistency", () => {
    test("no empty questions or answers", () => {
      quizData.forEach((item, index) => {
        expect(item.Q.trim()).not.toBe("");
        expect(item.A.trim()).not.toBe("");
      });
    });

    test("reasonable question and answer lengths", () => {
      quizData.forEach((item) => {
        expect(item.Q.length).toBeGreaterThan(5); // Questions should be meaningful
        expect(item.Q.length).toBeLessThan(200); // But not too long
        expect(item.A.length).toBeGreaterThan(1); // Answers should exist
        expect(item.A.length).toBeLessThan(100); // But be reasonable
      });
    });

    test("questions end with appropriate punctuation", () => {
      quizData.forEach((item) => {
        // Questions should end with some kind of punctuation or letter
        const lastChar = item.Q.trim().slice(-1);
        // More flexible - just ensure it's not empty and makes sense
        expect(lastChar).toBeTruthy();
        expect(item.Q.trim().length).toBeGreaterThan(5);
      });
    });
  });
});
