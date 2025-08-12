# React Testing Library Examples

This project demonstrates comprehensive React Testing Library setup and testing patterns for React applications.

## 🚀 Setup

The project is already configured with React Testing Library and includes:

- **@testing-library/react** - Core React Testing Library
- **@testing-library/jest-dom** - Additional matchers for Jest
- **@testing-library/user-event** - Better user interaction testing
- **Jest** - Testing framework
- **jsdom** - DOM environment for testing

## 📁 Test Files Overview

### 1. `Game.test.js` - Original Quiz Game Tests
Tests the main quiz application with comprehensive mocking:
- Mock external dependencies (Random utility, quiz data, react-select)
- Test user interactions with game logic
- Verify win/lose conditions

### 2. `BasicComponent.test.js` - Fundamental Testing Patterns
- **Basic rendering and queries** - Different ways to find elements
- **User interactions** - Both `fireEvent` and `userEvent` examples
- **Async testing** - Handling asynchronous operations
- **Accessibility testing** - Testing for proper ARIA attributes
- **Custom matchers** - Using jest-dom matchers

### 3. `FormAndInteraction.test.js` - Form Testing
- **Contact Form Tests** - Validation, error handling, submission
- **Todo List Tests** - CRUD operations, state management
- **Form validation** - Required fields, email validation
- **User input testing** - Typing, clicking, form submission

### 4. `MockingAndAdvanced.test.js` - Advanced Mocking Patterns
- **API mocking** - Mock fetch calls and handle responses
- **Timer mocking** - Test components that use setInterval/setTimeout
- **localStorage mocking** - Test components that persist data
- **Custom hooks testing** - Testing reusable logic

### 5. `ContextAndProviders.test.js` - Context and Error Boundary Testing
- **React Context testing** - Theme provider, authentication
- **Multiple providers** - Testing components with multiple contexts
- **Error boundaries** - Testing error handling
- **Provider integration** - Testing components that use context

## 🎯 Key Testing Patterns

### Query Methods Priority
1. **getByRole** - Most accessible, preferred method
2. **getByLabelText** - For form elements
3. **getByPlaceholderText** - For inputs with placeholders
4. **getByText** - For text content
5. **getByTestId** - Last resort, when semantic queries don't work

### User Interactions
```javascript
// Preferred method with userEvent
const user = userEvent.setup();
await user.click(button);
await user.type(input, "text");

// Alternative with fireEvent
fireEvent.click(button);
fireEvent.change(input, { target: { value: "text" } });
```

### Async Testing
```javascript
// Wait for element to appear
await waitFor(() => {
  expect(screen.getByText("Data loaded")).toBeInTheDocument();
});

// Use findBy for automatic waiting
const element = await screen.findByText("Data loaded");
```

### Mocking Patterns
```javascript
// Mock modules
jest.mock('../services/api', () => ({
  fetchData: jest.fn(),
}));

// Mock timers
jest.useFakeTimers();
jest.advanceTimersByTime(1000);

// Mock localStorage
const localStorageMock = {
  getItem: jest.fn(),
  setItem: jest.fn(),
  removeItem: jest.fn(),
  clear: jest.fn(),
};
Object.defineProperty(window, 'localStorage', { value: localStorageMock });
```

## 🧪 Running Tests

```bash
# Run all tests
npm test

# Run tests in watch mode
npm run test:watch

# Run tests with coverage
npm test -- --coverage

# Run specific test file
npm test BasicComponent.test.js

# Run tests matching a pattern
npm test -- --testNamePattern="form"
```

## 📊 Test Organization

### Describe Blocks
- Group related tests together
- Nested describes for component features
- Clear, descriptive names

### Test Naming
- Use descriptive test names
- Follow pattern: "should [expected behavior] when [condition]"
- Examples:
  - "shows validation error for invalid email"
  - "submits form with valid data"
  - "toggles theme when button is clicked"

### Setup and Cleanup
```javascript
describe("Component", () => {
  beforeEach(() => {
    // Setup before each test
  });

  afterEach(() => {
    // Cleanup after each test
    jest.restoreAllMocks();
  });
});
```

## 🛠️ Best Practices

### 1. Test User Behavior, Not Implementation
- Test what users see and do
- Avoid testing internal state directly
- Focus on component outputs

### 2. Use Semantic Queries
- Prefer queries that reflect how users interact
- Use roles, labels, and text content
- Avoid test IDs when possible

### 3. Mock External Dependencies
- Mock API calls
- Mock complex third-party libraries
- Keep mocks simple and focused

### 4. Test Accessibility
- Ensure components work with screen readers
- Test keyboard navigation
- Verify ARIA attributes

### 5. Keep Tests Focused
- One concept per test
- Clear arrange-act-assert structure
- Descriptive test names

## 🔧 Configuration Files

### `jest.config.js`
- Test environment: jsdom
- Setup file: setupTests.js
- Module name mapping for CSS/assets
- Transform configuration for JSX

### `src/setupTests.js`
- Import jest-dom matchers
- Global test setup
- Custom matchers or utilities

## 📚 Additional Resources

- [React Testing Library Docs](https://testing-library.com/docs/react-testing-library/intro/)
- [Common Mistakes](https://kentcdodds.com/blog/common-mistakes-with-react-testing-library)
- [Testing Best Practices](https://testing-library.com/docs/guiding-principles)
- [Jest Matchers](https://jestjs.io/docs/expect)

## 🎨 Example Component Structure for Testing

```javascript
// Component to test
const MyComponent = ({ onSubmit, initialValue = "" }) => {
  const [value, setValue] = useState(initialValue);
  
  return (
    <form onSubmit={(e) => { e.preventDefault(); onSubmit(value); }}>
      <label htmlFor="input">Enter value:</label>
      <input 
        id="input"
        value={value}
        onChange={(e) => setValue(e.target.value)}
      />
      <button type="submit">Submit</button>
    </form>
  );
};

// Test structure
describe("MyComponent", () => {
  test("submits the form with entered value", async () => {
    const user = userEvent.setup();
    const mockOnSubmit = jest.fn();
    
    render(<MyComponent onSubmit={mockOnSubmit} />);
    
    await user.type(screen.getByLabelText("Enter value:"), "test value");
    await user.click(screen.getByRole("button", { name: "Submit" }));
    
    expect(mockOnSubmit).toHaveBeenCalledWith("test value");
  });
});
```

This comprehensive setup provides you with all the tools and patterns needed for effective React component testing!
