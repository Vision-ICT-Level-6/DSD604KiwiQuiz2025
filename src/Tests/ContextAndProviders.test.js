import "@testing-library/jest-dom";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";

const React = require("react");

// Theme Context
const ThemeContext = React.createContext();

const ThemeProvider = ({ children }) => {
  const [theme, setTheme] = React.useState('light');
  
  const toggleTheme = () => {
    setTheme(prev => prev === 'light' ? 'dark' : 'light');
  };
  
  return (
    <ThemeContext.Provider value={{ theme, toggleTheme }}>
      {children}
    </ThemeContext.Provider>
  );
};

const useTheme = () => {
  const context = React.useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
};

// Components that use context
const ThemeButton = () => {
  const { theme, toggleTheme } = useTheme();
  
  return (
    <button 
      onClick={toggleTheme}
      style={{ 
        backgroundColor: theme === 'light' ? '#fff' : '#333',
        color: theme === 'light' ? '#333' : '#fff'
      }}
    >
      Current theme: {theme}
    </button>
  );
};

const ThemedComponent = () => {
  const { theme } = useTheme();
  
  return (
    <div 
      data-testid="themed-component"
      style={{ 
        backgroundColor: theme === 'light' ? '#f0f0f0' : '#222',
        color: theme === 'light' ? '#000' : '#fff',
        padding: '20px'
      }}
    >
      <h2>Themed Content</h2>
      <p>This component adapts to the current theme: {theme}</p>
      <ThemeButton />
    </div>
  );
};

// Authentication Context
const AuthContext = React.createContext();

const AuthProvider = ({ children }) => {
  const [user, setUser] = React.useState(null);
  const [loading, setLoading] = React.useState(false);
  
  const login = async (email, password) => {
    setLoading(true);
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 100));
      
      if (email === 'test@example.com' && password === 'password') {
        setUser({ id: 1, email, name: 'Test User' });
        return { success: true };
      } else {
        throw new Error('Invalid credentials');
      }
    } catch (error) {
      return { success: false, error: error.message };
    } finally {
      setLoading(false);
    }
  };
  
  const logout = () => {
    setUser(null);
  };
  
  return (
    <AuthContext.Provider value={{ user, login, logout, loading }}>
      {children}
    </AuthContext.Provider>
  );
};

const useAuth = () => {
  const context = React.useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

// Login component
const LoginForm = () => {
  const { login, loading } = useAuth();
  const [email, setEmail] = React.useState('');
  const [password, setPassword] = React.useState('');
  const [error, setError] = React.useState('');
  
  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    
    const result = await login(email, password);
    if (!result.success) {
      setError(result.error);
    }
  };
  
  return (
    <form onSubmit={handleSubmit}>
      <div>
        <label htmlFor="email">Email:</label>
        <input
          id="email"
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
        />
      </div>
      
      <div>
        <label htmlFor="password">Password:</label>
        <input
          id="password"
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
        />
      </div>
      
      {error && <div role="alert" data-testid="error-message">{error}</div>}
      
      <button type="submit" disabled={loading}>
        {loading ? 'Logging in...' : 'Login'}
      </button>
    </form>
  );
};

// User Profile component
const UserProfile = () => {
  const { user, logout } = useAuth();
  
  if (!user) {
    return <LoginForm />;
  }
  
  return (
    <div data-testid="user-profile">
      <h2>Welcome, {user.name}!</h2>
      <p>Email: {user.email}</p>
      <button onClick={logout}>Logout</button>
    </div>
  );
};

// App component that combines everything
const App = () => {
  return (
    <AuthProvider>
      <ThemeProvider>
        <div>
          <ThemedComponent />
          <UserProfile />
        </div>
      </ThemeProvider>
    </AuthProvider>
  );
};

// Error Boundary for testing error scenarios
class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }
  
  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }
  
  componentDidCatch(error, errorInfo) {
    console.error('Error caught by boundary:', error, errorInfo);
  }
  
  render() {
    if (this.state.hasError) {
      return (
        <div role="alert" data-testid="error-boundary">
          Something went wrong: {this.state.error?.message}
        </div>
      );
    }
    
    return this.props.children;
  }
}

// Component that will throw an error
const ErrorComponent = ({ shouldError }) => {
  if (shouldError) {
    throw new Error('Test error');
  }
  return <div>No error</div>;
};

describe("Context and Provider Testing", () => {
  
  describe("ThemeContext", () => {
    test("provides theme functionality to child components", async () => {
      const user = userEvent.setup();
      
      render(
        <ThemeProvider>
          <ThemedComponent />
        </ThemeProvider>
      );
      
      // Should start with light theme
      expect(screen.getByText("Current theme: light")).toBeInTheDocument();
      
      // Toggle theme
      await user.click(screen.getByRole("button"));
      
      // Should switch to dark theme
      expect(screen.getByText("Current theme: dark")).toBeInTheDocument();
      
      // Toggle again
      await user.click(screen.getByRole("button"));
      
      // Should switch back to light theme
      expect(screen.getByText("Current theme: light")).toBeInTheDocument();
    });
    
    test("throws error when useTheme is used outside provider", () => {
      // Mock console.error to avoid error output in tests
      const originalError = console.error;
      console.error = jest.fn();
      
      // Component that uses hook outside provider
      const ComponentWithoutProvider = () => {
        useTheme(); // This should throw
        return <div>Should not render</div>;
      };
      
      expect(() => {
        render(
          <ErrorBoundary>
            <ComponentWithoutProvider />
          </ErrorBoundary>
        );
      }).not.toThrow(); // ErrorBoundary catches it
      
      // Should show error boundary
      expect(screen.getByTestId("error-boundary")).toBeInTheDocument();
      
      console.error = originalError;
    });
  });
  
  describe("AuthContext", () => {
    const renderWithAuth = (component) => {
      return render(
        <AuthProvider>
          {component}
        </AuthProvider>
      );
    };
    
    test("shows login form when user is not authenticated", () => {
      renderWithAuth(<UserProfile />);
      
      expect(screen.getByLabelText(/email/i)).toBeInTheDocument();
      expect(screen.getByLabelText(/password/i)).toBeInTheDocument();
      expect(screen.getByRole("button", { name: /login/i })).toBeInTheDocument();
    });
    
    test("successful login shows user profile", async () => {
      const user = userEvent.setup();
      renderWithAuth(<UserProfile />);
      
      // Fill in login form
      await user.type(screen.getByLabelText(/email/i), "test@example.com");
      await user.type(screen.getByLabelText(/password/i), "password");
      
      // Submit form
      await user.click(screen.getByRole("button", { name: /login/i }));
      
      // Should show user profile
      await waitFor(() => {
        expect(screen.getByTestId("user-profile")).toBeInTheDocument();
      });
      
      expect(screen.getByText("Welcome, Test User!")).toBeInTheDocument();
      expect(screen.getByText("Email: test@example.com")).toBeInTheDocument();
    });
    
    test("failed login shows error message", async () => {
      const user = userEvent.setup();
      renderWithAuth(<UserProfile />);
      
      // Fill in login form with wrong credentials
      await user.type(screen.getByLabelText(/email/i), "wrong@example.com");
      await user.type(screen.getByLabelText(/password/i), "wrongpassword");
      
      // Submit form
      await user.click(screen.getByRole("button", { name: /login/i }));
      
      // Should show error message
      await waitFor(() => {
        expect(screen.getByTestId("error-message")).toHaveTextContent("Invalid credentials");
      });
      
      // Should still show login form
      expect(screen.getByLabelText(/email/i)).toBeInTheDocument();
    });
    
    test("logout functionality works", async () => {
      const user = userEvent.setup();
      renderWithAuth(<UserProfile />);
      
      // Login first
      await user.type(screen.getByLabelText(/email/i), "test@example.com");
      await user.type(screen.getByLabelText(/password/i), "password");
      await user.click(screen.getByRole("button", { name: /login/i }));
      
      // Wait for profile to appear
      await waitFor(() => {
        expect(screen.getByTestId("user-profile")).toBeInTheDocument();
      });
      
      // Logout
      await user.click(screen.getByText("Logout"));
      
      // Should show login form again
      expect(screen.getByLabelText(/email/i)).toBeInTheDocument();
      expect(screen.queryByTestId("user-profile")).not.toBeInTheDocument();
    });
    
    test("shows loading state during login", async () => {
      const user = userEvent.setup();
      renderWithAuth(<UserProfile />);
      
      // Fill in form
      await user.type(screen.getByLabelText(/email/i), "test@example.com");
      await user.type(screen.getByLabelText(/password/i), "password");
      
      // Submit form
      const loginButton = screen.getByRole("button", { name: /login/i });
      await user.click(loginButton);
      
      // Should show loading state briefly
      expect(screen.getByRole("button", { name: /logging in/i })).toBeDisabled();
      
      // Wait for completion
      await waitFor(() => {
        expect(screen.getByTestId("user-profile")).toBeInTheDocument();
      });
    });
  });
  
  describe("Multiple Providers", () => {
    test("can use multiple providers together", async () => {
      const user = userEvent.setup();
      
      render(<App />);
      
      // Should have both theme and auth functionality
      expect(screen.getByText("Current theme: light")).toBeInTheDocument();
      expect(screen.getByLabelText(/email/i)).toBeInTheDocument();
      
      // Can toggle theme
      await user.click(screen.getByText("Current theme: light"));
      expect(screen.getByText("Current theme: dark")).toBeInTheDocument();
      
      // Can login
      await user.type(screen.getByLabelText(/email/i), "test@example.com");
      await user.type(screen.getByLabelText(/password/i), "password");
      await user.click(screen.getByRole("button", { name: /login/i }));
      
      await waitFor(() => {
        expect(screen.getByTestId("user-profile")).toBeInTheDocument();
      });
      
      // Theme should still work after login
      expect(screen.getByText("Current theme: dark")).toBeInTheDocument();
    });
  });
  
  describe("Error Boundary Testing", () => {
    test("catches and displays errors", () => {
      // Mock console.error to avoid error output in tests
      const originalError = console.error;
      console.error = jest.fn();
      
      render(
        <ErrorBoundary>
          <ErrorComponent shouldError={true} />
        </ErrorBoundary>
      );
      
      expect(screen.getByTestId("error-boundary")).toBeInTheDocument();
      expect(screen.getByText(/something went wrong: test error/i)).toBeInTheDocument();
      
      console.error = originalError;
    });
    
    test("renders children normally when no error", () => {
      render(
        <ErrorBoundary>
          <ErrorComponent shouldError={false} />
        </ErrorBoundary>
      );
      
      expect(screen.getByText("No error")).toBeInTheDocument();
      expect(screen.queryByTestId("error-boundary")).not.toBeInTheDocument();
    });
  });
});
