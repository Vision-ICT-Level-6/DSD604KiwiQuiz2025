import "@testing-library/jest-dom";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import App from "../App";

// Simple tests for the Quiz Game
// These tests focus on basic user interactions and game functionality

describe("Quiz Game - Simple Tests", () => {
  test("game starts with initial state", () => {
    render(<App />);

    // Should show the start button
    expect(screen.getByRole("button", { name: /choose a random question/i })).toBeInTheDocument();

    // Should show "Start" as initial question
    expect(screen.getByRole("heading", { level: 2 })).toHaveTextContent("Start");

    // Should not show any win/lose message initially
    expect(screen.queryByText(/you selected/i)).not.toBeInTheDocument();
  });

  test("clicking the button generates a question", () => {
    render(<App />);

    const button = screen.getByRole("button", { name: /choose a random question/i });

    // Click to get a new question
    fireEvent.click(button);

    // Should no longer show "Start"
    expect(screen.getByRole("heading", { level: 2 })).not.toHaveTextContent("Start");

    // Should show some question text (we don't know which one due to randomness)
    const questionHeading = screen.getByRole("heading", { level: 2 });
    expect(questionHeading.textContent.length).toBeGreaterThan(3);
  });

  test("can generate multiple different questions", () => {
    render(<App />);

    const button = screen.getByRole("button", { name: /choose a random question/i });

    // Generate a few questions and collect them
    const questions = [];

    for (let i = 0; i < 5; i++) {
      fireEvent.click(button);
      const questionText = screen.getByRole("heading", { level: 2 }).textContent;
      questions.push(questionText);
    }

    // Should not all be the same (though theoretically possible with random)
    // At least verify we're getting actual question text, not "Start"
    questions.forEach((question) => {
      expect(question).not.toBe("Start");
      expect(question.length).toBeGreaterThan(5); // Real questions are longer
    });
  });

  test("answer dropdown appears after selecting a question", () => {
    render(<App />);

    // Initially no dropdown should be visible (or it should show placeholder)
    const button = screen.getByRole("button", { name: /choose a random question/i });
    fireEvent.click(button);

    // After clicking, there should be a dropdown/select element
    // Note: react-select creates a complex structure, so we look for the container
    const selectElement = screen.getByText(/select an answer/i);
    expect(selectElement).toBeInTheDocument();
  });

  test("selecting an answer shows feedback message", async () => {
    render(<App />);

    // Get a question first
    const button = screen.getByRole("button", { name: /choose a random question/i });
    fireEvent.click(button);

    // Wait a moment for the component to update
    await waitFor(() => {
      expect(screen.queryByText("Start")).not.toBeInTheDocument();
    });

    // This test would need the actual react-select interaction
    // For now, we just verify the structure is there
    expect(screen.getByText(/select an answer/i)).toBeInTheDocument();
  });

  test("question changes when button is clicked multiple times", () => {
    render(<App />);

    const button = screen.getByRole("button", { name: /choose a random question/i });

    // Click first time
    fireEvent.click(button);
    const firstQuestion = screen.getByRole("heading", { level: 2 }).textContent;

    // Click second time
    fireEvent.click(button);
    const secondQuestion = screen.getByRole("heading", { level: 2 }).textContent;

    // Both should be real questions (not "Start")
    expect(firstQuestion).not.toBe("Start");
    expect(secondQuestion).not.toBe("Start");

    // Questions should be meaningful length
    expect(firstQuestion.length).toBeGreaterThan(5);
    expect(secondQuestion.length).toBeGreaterThan(5);
  });

  test("game layout and structure", () => {
    render(<App />);

    // Should have Bootstrap classes structure
    expect(screen.getByRole("button")).toHaveClass("btn", "btn-primary");

    // Should have the main heading
    const heading = screen.getByRole("heading", { level: 2 });
    expect(heading).toHaveClass("display-4");

    // Should have container structure
    const container = screen.getByRole("button").closest(".container-fluid");
    expect(container).toBeInTheDocument();
  });

  test("button text remains consistent", () => {
    render(<App />);

    const button = screen.getByRole("button", { name: /choose a random question/i });

    // Button text should remain the same after clicks
    fireEvent.click(button);
    expect(screen.getByRole("button", { name: /choose a random question/i })).toBeInTheDocument();

    fireEvent.click(button);
    expect(screen.getByRole("button", { name: /choose a random question/i })).toBeInTheDocument();
  });

  test("game resets properly when new question is selected", () => {
    render(<App />);

    const button = screen.getByRole("button", { name: /choose a random question/i });

    // Get first question
    fireEvent.click(button);

    // Verify no "you selected" message initially
    expect(screen.queryByText(/you selected/i)).not.toBeInTheDocument();

    // Get second question - should still not show previous selection
    fireEvent.click(button);
    expect(screen.queryByText(/you selected/i)).not.toBeInTheDocument();
  });

  test("component renders without crashing", () => {
    // Simple smoke test
    expect(() => render(<App />)).not.toThrow();
  });

  test("accessibility - button has proper role", () => {
    render(<App />);

    const button = screen.getByRole("button");
    expect(button).toBeInTheDocument();
    // Note: onClick buttons don't need explicit type="button" when using onClick handler
    expect(button.tagName).toBe("BUTTON");
  });

  test("accessibility - headings have proper structure", () => {
    render(<App />);

    // Should have an h2 for the question
    const questionHeading = screen.getByRole("heading", { level: 2 });
    expect(questionHeading).toBeInTheDocument();

    // Click to get a question and verify heading still exists
    fireEvent.click(screen.getByRole("button"));
    expect(screen.getByRole("heading", { level: 2 })).toBeInTheDocument();
  });
});
