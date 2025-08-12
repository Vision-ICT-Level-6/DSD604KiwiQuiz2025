import "@testing-library/jest-dom";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";

const React = require("react");

// Form Component for testing
const ContactForm = ({ onSubmit }) => {
  const [formData, setFormData] = React.useState({
    name: "",
    email: "",
    message: "",
    newsletter: false,
  });
  const [errors, setErrors] = React.useState({});
  const [isSubmitting, setIsSubmitting] = React.useState(false);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value
    }));
    
    // Clear error when user starts typing
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: "" }));
    }
  };

  const validate = () => {
    const newErrors = {};
    
    if (!formData.name.trim()) {
      newErrors.name = "Name is required";
    }
    
    if (!formData.email.trim()) {
      newErrors.email = "Email is required";
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = "Email is invalid";
    }
    
    if (!formData.message.trim()) {
      newErrors.message = "Message is required";
    }
    
    return newErrors;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    const newErrors = validate();
    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }
    
    setIsSubmitting(true);
    
    try {
      await new Promise(resolve => setTimeout(resolve, 1000)); // Simulate API call
      onSubmit?.(formData);
      setFormData({ name: "", email: "", message: "", newsletter: false });
      setErrors({});
    } catch (error) {
      setErrors({ submit: "Failed to submit form" });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} data-testid="contact-form">
      <div>
        <label htmlFor="name">Name *</label>
        <input
          id="name"
          name="name"
          type="text"
          value={formData.name}
          onChange={handleChange}
          aria-describedby={errors.name ? "name-error" : undefined}
        />
        {errors.name && <div id="name-error" role="alert">{errors.name}</div>}
      </div>

      <div>
        <label htmlFor="email">Email *</label>
        <input
          id="email"
          name="email"
          type="email"
          value={formData.email}
          onChange={handleChange}
          aria-describedby={errors.email ? "email-error" : undefined}
        />
        {errors.email && <div id="email-error" role="alert">{errors.email}</div>}
      </div>

      <div>
        <label htmlFor="message">Message *</label>
        <textarea
          id="message"
          name="message"
          value={formData.message}
          onChange={handleChange}
          aria-describedby={errors.message ? "message-error" : undefined}
        />
        {errors.message && <div id="message-error" role="alert">{errors.message}</div>}
      </div>

      <div>
        <label>
          <input
            type="checkbox"
            name="newsletter"
            checked={formData.newsletter}
            onChange={handleChange}
          />
          Subscribe to newsletter
        </label>
      </div>

      {errors.submit && <div role="alert">{errors.submit}</div>}

      <button type="submit" disabled={isSubmitting}>
        {isSubmitting ? "Submitting..." : "Submit"}
      </button>
    </form>
  );
};

// Todo List Component for testing
const TodoList = () => {
  const [todos, setTodos] = React.useState([]);
  const [inputValue, setInputValue] = React.useState("");

  const addTodo = () => {
    if (inputValue.trim()) {
      setTodos(prev => [...prev, {
        id: Date.now(),
        text: inputValue.trim(),
        completed: false
      }]);
      setInputValue("");
    }
  };

  const toggleTodo = (id) => {
    setTodos(prev => prev.map(todo =>
      todo.id === id ? { ...todo, completed: !todo.completed } : todo
    ));
  };

  const deleteTodo = (id) => {
    setTodos(prev => prev.filter(todo => todo.id !== id));
  };

  return (
    <div>
      <div>
        <input
          type="text"
          value={inputValue}
          onChange={(e) => setInputValue(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && addTodo()}
          placeholder="Add a todo..."
          aria-label="New todo"
        />
        <button onClick={addTodo}>Add Todo</button>
      </div>
      
      <ul data-testid="todo-list">
        {todos.map(todo => (
          <li key={todo.id} data-testid={`todo-${todo.id}`}>
            <input
              type="checkbox"
              checked={todo.completed}
              onChange={() => toggleTodo(todo.id)}
              aria-label={`Mark "${todo.text}" as ${todo.completed ? 'incomplete' : 'complete'}`}
            />
            <span style={{ textDecoration: todo.completed ? 'line-through' : 'none' }}>
              {todo.text}
            </span>
            <button onClick={() => deleteTodo(todo.id)}>Delete</button>
          </li>
        ))}
      </ul>
      
      {todos.length === 0 && <p>No todos yet. Add one above!</p>}
    </div>
  );
};

describe("Form Testing Examples", () => {
  describe("ContactForm", () => {
    test("renders all form fields", () => {
      render(<ContactForm />);
      
      expect(screen.getByLabelText(/name/i)).toBeInTheDocument();
      expect(screen.getByLabelText(/email/i)).toBeInTheDocument();
      expect(screen.getByLabelText(/message/i)).toBeInTheDocument();
      expect(screen.getByLabelText(/subscribe to newsletter/i)).toBeInTheDocument();
      expect(screen.getByRole("button", { name: /submit/i })).toBeInTheDocument();
    });

    test("shows validation errors for empty required fields", async () => {
      const user = userEvent.setup();
      render(<ContactForm />);
      
      // Try to submit empty form
      await user.click(screen.getByRole("button", { name: /submit/i }));
      
      // Check for validation errors
      expect(screen.getByText("Name is required")).toBeInTheDocument();
      expect(screen.getByText("Email is required")).toBeInTheDocument();
      expect(screen.getByText("Message is required")).toBeInTheDocument();
    });

    // Note: This test demonstrates email validation, but the component's regex might
    // accept some patterns that look invalid. In a real app, you'd want robust
    // email validation library like validator.js
    test("shows email validation error for clearly invalid email", async () => {
      const user = userEvent.setup();
      render(<ContactForm />);
      
      // Fill in clearly invalid email (empty after clearing default)
      await user.type(screen.getByLabelText(/name/i), "John Doe");
      const emailInput = screen.getByLabelText(/email/i);
      await user.clear(emailInput);
      await user.type(emailInput, "a"); // Single character, clearly invalid
      await user.type(screen.getByLabelText(/message/i), "Hello world");
      
      await user.click(screen.getByRole("button", { name: /submit/i }));
      
      // Wait for validation error to appear
      await waitFor(() => {
        expect(screen.getByText("Email is invalid")).toBeInTheDocument();
      });
    });

    test("clears errors when user starts typing", async () => {
      const user = userEvent.setup();
      render(<ContactForm />);
      
      // Submit empty form to show errors
      await user.click(screen.getByRole("button", { name: /submit/i }));
      expect(screen.getByText("Name is required")).toBeInTheDocument();
      
      // Start typing in name field
      await user.type(screen.getByLabelText(/name/i), "J");
      
      // Error should be cleared
      expect(screen.queryByText("Name is required")).not.toBeInTheDocument();
    });

    test("submits form with valid data", async () => {
      const user = userEvent.setup();
      const mockOnSubmit = jest.fn();
      render(<ContactForm onSubmit={mockOnSubmit} />);
      
      // Fill in valid form data
      await user.type(screen.getByLabelText(/name/i), "John Doe");
      await user.type(screen.getByLabelText(/email/i), "john@example.com");
      await user.type(screen.getByLabelText(/message/i), "Hello, this is a test message.");
      await user.click(screen.getByLabelText(/subscribe to newsletter/i));
      
      // Submit form
      await user.click(screen.getByRole("button", { name: /submit/i }));
      
      // Wait for async submission
      await waitFor(() => {
        expect(mockOnSubmit).toHaveBeenCalledWith({
          name: "John Doe",
          email: "john@example.com",
          message: "Hello, this is a test message.",
          newsletter: true
        });
      });
      
      // Form should be cleared after successful submission
      expect(screen.getByLabelText(/name/i)).toHaveValue("");
      expect(screen.getByLabelText(/email/i)).toHaveValue("");
      expect(screen.getByLabelText(/message/i)).toHaveValue("");
      expect(screen.getByLabelText(/subscribe to newsletter/i)).not.toBeChecked();
    });

    test("shows loading state during submission", async () => {
      const user = userEvent.setup();
      render(<ContactForm />);
      
      // Fill in valid form data
      await user.type(screen.getByLabelText(/name/i), "John Doe");
      await user.type(screen.getByLabelText(/email/i), "john@example.com");
      await user.type(screen.getByLabelText(/message/i), "Hello world");
      
      // Submit form
      await user.click(screen.getByRole("button", { name: /submit/i }));
      
      // Should show loading state
      expect(screen.getByRole("button", { name: /submitting/i })).toBeDisabled();
      
      // Wait for submission to complete
      await waitFor(() => {
        expect(screen.getByRole("button", { name: /submit/i })).not.toBeDisabled();
      });
    });
  });

  describe("TodoList", () => {
    test("adds a new todo", async () => {
      const user = userEvent.setup();
      render(<TodoList />);
      
      const input = screen.getByLabelText(/new todo/i);
      const addButton = screen.getByRole("button", { name: /add todo/i });
      
      // Add a todo
      await user.type(input, "Learn React Testing Library");
      await user.click(addButton);
      
      // Check that todo was added
      expect(screen.getByText("Learn React Testing Library")).toBeInTheDocument();
      expect(input).toHaveValue(""); // Input should be cleared
    });

    test("adds todo by pressing Enter", async () => {
      const user = userEvent.setup();
      render(<TodoList />);
      
      const input = screen.getByLabelText(/new todo/i);
      
      // Add a todo by pressing Enter
      await user.type(input, "Write tests{enter}");
      
      expect(screen.getByText("Write tests")).toBeInTheDocument();
      expect(input).toHaveValue("");
    });

    test("toggles todo completion", async () => {
      const user = userEvent.setup();
      render(<TodoList />);
      
      // Add a todo first
      await user.type(screen.getByLabelText(/new todo/i), "Test todo{enter}");
      
      const checkbox = screen.getByLabelText(/mark "test todo" as complete/i);
      const todoText = screen.getByText("Test todo");
      
      // Initially not completed
      expect(checkbox).not.toBeChecked();
      expect(todoText).not.toHaveStyle("text-decoration: line-through");
      
      // Toggle completion
      await user.click(checkbox);
      
      expect(checkbox).toBeChecked();
      expect(todoText).toHaveStyle("text-decoration: line-through");
      
      // Toggle back
      await user.click(checkbox);
      
      expect(checkbox).not.toBeChecked();
      expect(todoText).not.toHaveStyle("text-decoration: line-through");
    });

    test("deletes a todo", async () => {
      const user = userEvent.setup();
      render(<TodoList />);
      
      // Add a todo first
      await user.type(screen.getByLabelText(/new todo/i), "Todo to delete{enter}");
      
      expect(screen.getByText("Todo to delete")).toBeInTheDocument();
      
      // Delete the todo
      await user.click(screen.getByRole("button", { name: /delete/i }));
      
      expect(screen.queryByText("Todo to delete")).not.toBeInTheDocument();
      expect(screen.getByText("No todos yet. Add one above!")).toBeInTheDocument();
    });

    test("does not add empty todos", async () => {
      const user = userEvent.setup();
      render(<TodoList />);
      
      const addButton = screen.getByRole("button", { name: /add todo/i });
      
      // Try to add empty todo
      await user.click(addButton);
      
      // Should still show "No todos" message
      expect(screen.getByText("No todos yet. Add one above!")).toBeInTheDocument();
      
      // Try with whitespace only
      await user.type(screen.getByLabelText(/new todo/i), "   ");
      await user.click(addButton);
      
      expect(screen.getByText("No todos yet. Add one above!")).toBeInTheDocument();
    });
  });
});
