import "@testing-library/jest-dom";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";

// Simple component for testing - we'll define it inline for this example
const SimpleButton = ({ onClick, children, disabled = false }) => (
  <button onClick={onClick} disabled={disabled}>
    {children}
  </button>
);

const Counter = () => {
  const [count, setCount] = React.useState(0);

  return (
    <div>
      <h1>Count: {count}</h1>
      <button onClick={() => setCount(count + 1)}>Increment</button>
      <button onClick={() => setCount(count - 1)}>Decrement</button>
      <button onClick={() => setCount(0)}>Reset</button>
    </div>
  );
};

const AsyncComponent = () => {
  const [data, setData] = React.useState(null);
  const [loading, setLoading] = React.useState(false);

  const fetchData = async () => {
    setLoading(true);
    // Simulate API call
    setTimeout(() => {
      setData("Data loaded!");
      setLoading(false);
    }, 100);
  };

  return (
    <div>
      <button onClick={fetchData}>Load Data</button>
      {loading && <div>Loading...</div>}
      {data && <div data-testid="data">{data}</div>}
    </div>
  );
};

const React = require("react");

describe("Basic React Testing Library Examples", () => {
  // 1. BASIC RENDERING AND QUERIES
  describe("Basic Rendering and Queries", () => {
    test("renders a simple button", () => {
      render(<SimpleButton>Click me</SimpleButton>);

      // Query by role (most accessible)
      expect(screen.getByRole("button", { name: "Click me" })).toBeInTheDocument();

      // Query by text
      expect(screen.getByText("Click me")).toBeInTheDocument();
    });

    test("different query methods", () => {
      render(
        <div>
          <h1>Welcome</h1>
          <label htmlFor="username">Username:</label>
          <input id="username" placeholder="Enter username" />
          <img src="logo.png" alt="Company logo" />
        </div>
      );

      // By role (preferred method)
      expect(screen.getByRole("heading", { level: 1 })).toHaveTextContent("Welcome");
      expect(screen.getByRole("textbox", { name: "Username:" })).toBeInTheDocument();

      // By label text (for form elements)
      expect(screen.getByLabelText("Username:")).toBeInTheDocument();

      // By placeholder text
      expect(screen.getByPlaceholderText("Enter username")).toBeInTheDocument();

      // By alt text (for images)
      expect(screen.getByAltText("Company logo")).toBeInTheDocument();

      // By text content
      expect(screen.getByText("Welcome")).toBeInTheDocument();
    });
  });

  // 2. USER INTERACTIONS WITH EVENTS
  describe("User Interactions", () => {
    test("handles button clicks with fireEvent", () => {
      const mockOnClick = jest.fn();
      render(<SimpleButton onClick={mockOnClick}>Click me</SimpleButton>);

      const button = screen.getByRole("button");
      fireEvent.click(button);

      expect(mockOnClick).toHaveBeenCalledTimes(1);
    });

    test("handles button clicks with userEvent (preferred)", async () => {
      const user = userEvent.setup();
      const mockOnClick = jest.fn();
      render(<SimpleButton onClick={mockOnClick}>Click me</SimpleButton>);

      const button = screen.getByRole("button");
      await user.click(button);

      expect(mockOnClick).toHaveBeenCalledTimes(1);
    });

    test("counter component interactions", async () => {
      const user = userEvent.setup();
      render(<Counter />);

      // Initial state
      expect(screen.getByText("Count: 0")).toBeInTheDocument();

      // Increment
      await user.click(screen.getByText("Increment"));
      expect(screen.getByText("Count: 1")).toBeInTheDocument();

      // Increment again
      await user.click(screen.getByText("Increment"));
      expect(screen.getByText("Count: 2")).toBeInTheDocument();

      // Decrement
      await user.click(screen.getByText("Decrement"));
      expect(screen.getByText("Count: 1")).toBeInTheDocument();

      // Reset
      await user.click(screen.getByText("Reset"));
      expect(screen.getByText("Count: 0")).toBeInTheDocument();
    });
  });

  // 3. ASYNC TESTING
  describe("Async Testing", () => {
    test("handles async operations with waitFor", async () => {
      render(<AsyncComponent />);

      // Initially no data
      expect(screen.queryByTestId("data")).not.toBeInTheDocument();

      // Click load button
      fireEvent.click(screen.getByText("Load Data"));

      // Should show loading
      expect(screen.getByText("Loading...")).toBeInTheDocument();

      // Wait for data to appear
      await waitFor(() => {
        expect(screen.getByTestId("data")).toHaveTextContent("Data loaded!");
      });

      // Loading should be gone
      expect(screen.queryByText("Loading...")).not.toBeInTheDocument();
    });

    test("using findBy queries for async elements", async () => {
      render(<AsyncComponent />);

      // Click load button
      fireEvent.click(screen.getByText("Load Data"));

      // findBy automatically waits for the element to appear
      const dataElement = await screen.findByTestId("data");
      expect(dataElement).toHaveTextContent("Data loaded!");
    });
  });

  // 4. ACCESSIBILITY TESTING
  describe("Accessibility Testing", () => {
    test("button has proper accessibility attributes", () => {
      render(<SimpleButton disabled>Disabled Button</SimpleButton>);

      const button = screen.getByRole("button");
      expect(button).toBeDisabled();
      expect(button).toHaveTextContent("Disabled Button");
    });

    test("form has proper labels", () => {
      render(
        <form>
          <label htmlFor="email">Email Address</label>
          <input id="email" type="email" required />
          <button type="submit">Submit</button>
        </form>
      );

      // Check that the input is properly labeled
      const emailInput = screen.getByLabelText("Email Address");
      expect(emailInput).toBeRequired();
      expect(emailInput).toHaveAttribute("type", "email");
    });
  });

  // 5. CUSTOM MATCHERS AND ASSERTIONS
  describe("Custom Matchers", () => {
    test("using jest-dom matchers", () => {
      render(
        <div>
          <input value="test value" readOnly />
          <button className="primary-btn" style={{ color: "blue" }}>
            Styled Button
          </button>
        </div>
      );

      const input = screen.getByRole("textbox");
      const button = screen.getByRole("button");

      // jest-dom custom matchers
      expect(input).toHaveValue("test value");
      expect(button).toHaveClass("primary-btn");
      expect(button).toHaveStyle("color: rgb(0, 0, 255)"); // Note: colors are normalized to rgb values
    });
  });
});
