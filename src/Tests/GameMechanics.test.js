import "@testing-library/jest-dom";
import { render, screen, fireEvent } from "@testing-library/react";
import App from "../App";

// Mock the Random utility to make tests predictable
jest.mock("../Utilities/Random", () => {
  return jest.fn(() => 0); // Always return the first question
});

// Mock the quiz data with a small, controlled dataset
jest.mock("../Assets/quiz", () => ({
  quizData: [
    { Q: "What is 2 + 2?", A: "4" },
    { Q: "What color is the sky?", A: "Blue" },
  ],
  sortedListAnswers: () => [
    { value: "4", label: "4" },
    { value: "Blue", label: "Blue" },
    { value: "Red", label: "Red" },
    { value: "Green", label: "Green" },
  ],
}));

// Mock react-select to make it easier to test
jest.mock("react-select", () => {
  const React = require("react");
  return {
    __esModule: true,
    default: ({ options, onChange, placeholder }) => (
      <select
        data-testid="answer-select"
        onChange={(e) => {
          const selectedOption = options.find((opt) => opt.value === e.target.value);
          if (selectedOption && onChange) {
            onChange(selectedOption);
          }
        }}
      >
        <option value="">{placeholder}</option>
        {options.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
    ),
  };
});

// Mock the select styles
jest.mock("../Utilities/SelectReactSetting", () => ({
  selectCustomStyles: {},
}));

describe("Quiz Game - Predictable Tests", () => {
  test("displays first question when button is clicked", () => {
    render(<App />);

    // Initial state
    expect(screen.getByRole("heading", { level: 2 })).toHaveTextContent("Start");

    // Click button to get question
    fireEvent.click(screen.getByRole("button", { name: /choose a random question/i }));

    // Should show the first question from our mock data
    expect(screen.getByRole("heading", { level: 2 })).toHaveTextContent("What is 2 + 2?");
  });

  test("shows correct answer options in dropdown", () => {
    render(<App />);

    // Get a question
    fireEvent.click(screen.getByRole("button", { name: /choose a random question/i }));

    // Find the select dropdown
    const select = screen.getByTestId("answer-select");
    expect(select).toBeInTheDocument();

    // Should have our mocked options
    expect(screen.getByText("4")).toBeInTheDocument();
    expect(screen.getByText("Blue")).toBeInTheDocument();
    expect(screen.getByText("Red")).toBeInTheDocument();
    expect(screen.getByText("Green")).toBeInTheDocument();
  });

  test("shows win message when correct answer is selected", () => {
    render(<App />);

    // Get the question "What is 2 + 2?"
    fireEvent.click(screen.getByRole("button", { name: /choose a random question/i }));

    // Select the correct answer "4"
    const select = screen.getByTestId("answer-select");
    fireEvent.change(select, { target: { value: "4" } });

    // Should show win message
    expect(screen.getByText(/you selected 4/i)).toBeInTheDocument();
    expect(screen.getByText(/win/i)).toBeInTheDocument();
  });

  test("shows lose message when wrong answer is selected", () => {
    render(<App />);

    // Get the question "What is 2 + 2?"
    fireEvent.click(screen.getByRole("button", { name: /choose a random question/i }));

    // Select a wrong answer "Blue"
    const select = screen.getByTestId("answer-select");
    fireEvent.change(select, { target: { value: "Blue" } });

    // Should show lose message
    expect(screen.getByText(/you selected blue/i)).toBeInTheDocument();
    expect(screen.getByText(/lose/i)).toBeInTheDocument();
  });

  test("resets game state when new question is selected", () => {
    render(<App />);

    // Get first question and answer it
    fireEvent.click(screen.getByRole("button", { name: /choose a random question/i }));
    const select = screen.getByTestId("answer-select");
    fireEvent.change(select, { target: { value: "4" } });

    // Verify win message appears
    expect(screen.getByText(/win/i)).toBeInTheDocument();

    // Get new question
    fireEvent.click(screen.getByRole("button", { name: /choose a random question/i }));

    // Win/lose message should be cleared
    expect(screen.queryByText(/you selected/i)).not.toBeInTheDocument();
    expect(screen.queryByText(/win/i)).not.toBeInTheDocument();
    expect(screen.queryByText(/lose/i)).not.toBeInTheDocument();
  });

  test("maintains question after answer selection", () => {
    render(<App />);

    // Get question
    fireEvent.click(screen.getByRole("button", { name: /choose a random question/i }));
    expect(screen.getByRole("heading", { level: 2 })).toHaveTextContent("What is 2 + 2?");

    // Select answer
    const select = screen.getByTestId("answer-select");
    fireEvent.change(select, { target: { value: "4" } });

    // Question should still be displayed
    expect(screen.getByRole("heading", { level: 2 })).toHaveTextContent("What is 2 + 2?");
  });

  test("displays answer selection message format correctly", () => {
    render(<App />);

    // Get question and select answer
    fireEvent.click(screen.getByRole("button", { name: /choose a random question/i }));
    const select = screen.getByTestId("answer-select");
    fireEvent.change(select, { target: { value: "4" } });

    // Check the actual message format (note: no space before hyphen)
    const message = screen.getByText(/you selected 4- you win/i);
    expect(message).toBeInTheDocument();
  });

  test("handles multiple answer selections", () => {
    render(<App />);

    // Get question
    fireEvent.click(screen.getByRole("button", { name: /choose a random question/i }));
    const select = screen.getByTestId("answer-select");

    // Select wrong answer first
    fireEvent.change(select, { target: { value: "Blue" } });
    expect(screen.getByText(/lose/i)).toBeInTheDocument();

    // Select correct answer
    fireEvent.change(select, { target: { value: "4" } });
    expect(screen.getByText(/win/i)).toBeInTheDocument();
    expect(screen.queryByText(/lose/i)).not.toBeInTheDocument();
  });

  test("dropdown placeholder shows correct text", () => {
    render(<App />);

    // Before selecting a question
    fireEvent.click(screen.getByRole("button", { name: /choose a random question/i }));

    // Should show placeholder text
    expect(screen.getByText(/select an answer/i)).toBeInTheDocument();
  });

  test("game flow works end-to-end", () => {
    render(<App />);

    // 1. Start state
    expect(screen.getByText("Start")).toBeInTheDocument();

    // 2. Get question
    fireEvent.click(screen.getByRole("button", { name: /choose a random question/i }));
    expect(screen.getByText("What is 2 + 2?")).toBeInTheDocument();

    // 3. See dropdown
    expect(screen.getByTestId("answer-select")).toBeInTheDocument();

    // 4. Select answer
    fireEvent.change(screen.getByTestId("answer-select"), { target: { value: "4" } });

    // 5. See result
    expect(screen.getByText(/you selected 4- you win/i)).toBeInTheDocument();

    // 6. Get new question (resets state)
    fireEvent.click(screen.getByRole("button", { name: /choose a random question/i }));
    expect(screen.queryByText(/you selected/i)).not.toBeInTheDocument();
  });
});
