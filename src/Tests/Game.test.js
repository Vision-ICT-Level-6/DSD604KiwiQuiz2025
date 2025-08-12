import "@testing-library/jest-dom";
import { render, screen, fireEvent } from "@testing-library/react";
import App from "../App";

// MOCK 1: Random Number Generator
// This replaces the real Random utility with a fake version that always returns 0
// This makes tests predictable - we know exactly which question will be selected
// Without this mock, tests would be unreliable because they'd get random questions
jest.mock("../Utilities/Random", () => ({
  __esModule: true,
  default: jest.fn(() => 0), // Always return index 0 (first question)
}));

// MOCK 2: Quiz Data 
// This replaces the real quiz data with a small, controlled set of test data
// We use only 2 questions so we can predict what will happen in our tests
// The real quiz file might have hundreds of questions, making tests unpredictable
jest.mock("../Assets/quiz", () => ({
  __esModule: true,
  quizData: [
    { Q: "Capital of France?", A: "Paris" },  // Question at index 0 (will be selected)
    { Q: "2 + 2?", A: "4" },                  // Question at index 1
  ],
  sortedListAnswers: () => [
    { value: "4", label: "4" },               // Wrong answer for question 0
    { value: "Paris", label: "Paris" },       // Correct answer for question 0
  ],
}));

// MOCK 3: Select Styles
// This replaces complex styling with an empty object
// We don't need to test CSS styling, just that the component works
jest.mock("../Utilities/SelectReactSetting", () => ({
  __esModule: true,
  selectCustomStyles: {}, // Empty styles object - no styling needed for tests
}));

// MOCK 4: React-Select Component
// This replaces the complex react-select library with a simple HTML <select>
// React-select is hard to test because it has complex DOM structure and behavior
// Our fake version acts the same way but is much simpler to interact with in tests
jest.mock("react-select", () => {
  const React = require("react");
  return {
    __esModule: true,
    // This creates a fake react-select that behaves like a normal HTML select
    // It takes the same props (options, onChange, placeholder) but renders simple HTML
    // This makes it easy to test with fireEvent.change() and screen.getByTestId()
    default: ({ options, onChange, placeholder }) => (
      <select
        aria-label="answer-select"
        data-testid="answer-select"  // Test ID for easy finding in tests
        onChange={(e) => {
          // When user selects an option, find the matching option object
          const opt = options.find((o) => o.value === e.target.value);
          onChange?.(opt);  // Call the real onChange with the option object
        }}
      >
        <option value="">{placeholder}</option>
        {options.map((o) => (
          <option key={o.value} value={o.value}>
            {o.label}
          </option>
        ))}
      </select>
    ),
  };
});

describe("App", () => {
  test("renders initial UI", () => {
    render(<App />);
    // Test that the button exists and has the right text
    expect(screen.getByRole("button", { name: /choose a random question/i })).toBeInTheDocument();
    // Test that the initial heading shows "Start"
    expect(screen.getByRole("heading", { level: 2 })).toHaveTextContent("Start");
    // Test that no answer selection message is shown initially
    expect(screen.queryByText(/you selected/i)).toBeNull();
  });

  test("selects a new question on button click", () => {
    render(<App />);
    // Click the button to trigger question selection
    fireEvent.click(screen.getByRole("button", { name: /choose a random question/i }));
    // Since our Random mock always returns 0, we should get the first question
    expect(screen.getByRole("heading", { level: 2 })).toHaveTextContent("Capital of France?");
  });

  test("shows win when selecting the correct answer", () => {
    render(<App />);
    // Click button to show question (will be "Capital of France?" due to our mocks)
    fireEvent.click(screen.getByRole("button", { name: /choose a random question/i }));
    // Find the select dropdown (our mocked simple version)
    const select = screen.getByTestId("answer-select");
    // Select "Paris" which is the correct answer for "Capital of France?"
    fireEvent.change(select, { target: { value: "Paris" } });
    // Test that both the selection message and win message appear
    expect(screen.getByText(/you selected paris/i)).toBeInTheDocument();
    expect(screen.getByText(/win/i)).toBeInTheDocument();
  });

  test("shows lose when selecting the wrong answer", () => {
    render(<App />);
    // Click button to show question (will be "Capital of France?" due to our mocks)
    fireEvent.click(screen.getByRole("button", { name: /choose a random question/i }));
    // Find the select dropdown (our mocked simple version)
    const select = screen.getByTestId("answer-select");
    // Select "4" which is wrong for "Capital of France?" (correct for "2 + 2?" though)
    fireEvent.change(select, { target: { value: "4" } });
    // Test that both the selection message and lose message appear
    expect(screen.getByText(/you selected 4/i)).toBeInTheDocument();
    expect(screen.getByText(/lose/i)).toBeInTheDocument();
  });
});
