import "@testing-library/jest-dom";
import { render, screen, fireEvent, waitFor, act } from "@testing-library/react";
import userEvent from "@testing-library/user-event";

const React = require("react");

// Mock API service
const apiService = {
  fetchUsers: async () => {
    const response = await fetch('/api/users');
    if (!response.ok) throw new Error('Failed to fetch users');
    return response.json();
  },
  
  createUser: async (userData) => {
    const response = await fetch('/api/users', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(userData)
    });
    if (!response.ok) throw new Error('Failed to create user');
    return response.json();
  }
};

// Component that uses the API service
const UserList = () => {
  const [users, setUsers] = React.useState([]);
  const [loading, setLoading] = React.useState(false);
  const [error, setError] = React.useState(null);

  React.useEffect(() => {
    const loadUsers = async () => {
      setLoading(true);
      setError(null);
      try {
        const userData = await apiService.fetchUsers();
        setUsers(userData);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    loadUsers();
  }, []);

  if (loading) return <div>Loading users...</div>;
  if (error) return <div role="alert">Error: {error}</div>;

  return (
    <ul data-testid="user-list">
      {users.map(user => (
        <li key={user.id} data-testid={`user-${user.id}`}>
          {user.name} ({user.email})
        </li>
      ))}
    </ul>
  );
};

// Component with timer functionality
const Timer = ({ onTick }) => {
  const [seconds, setSeconds] = React.useState(0);
  const [isRunning, setIsRunning] = React.useState(false);

  React.useEffect(() => {
    let interval = null;
    if (isRunning) {
      interval = setInterval(() => {
        setSeconds(prev => {
          const newValue = prev + 1;
          onTick?.(newValue);
          return newValue;
        });
      }, 1000);
    }
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [isRunning, onTick]);

  const start = () => setIsRunning(true);
  const stop = () => setIsRunning(false);
  const reset = () => {
    setSeconds(0);
    setIsRunning(false);
  };

  return (
    <div>
      <h2>Timer: {seconds}s</h2>
      <button onClick={start} disabled={isRunning}>Start</button>
      <button onClick={stop} disabled={!isRunning}>Stop</button>
      <button onClick={reset}>Reset</button>
    </div>
  );
};

// Component that uses localStorage
const Settings = () => {
  const [theme, setTheme] = React.useState(() => {
    return localStorage.getItem('theme') || 'light';
  });

  const [notifications, setNotifications] = React.useState(() => {
    return localStorage.getItem('notifications') === 'true';
  });

  React.useEffect(() => {
    localStorage.setItem('theme', theme);
  }, [theme]);

  React.useEffect(() => {
    localStorage.setItem('notifications', notifications.toString());
  }, [notifications]);

  return (
    <div>
      <h2>Settings</h2>
      <div>
        <label htmlFor="theme-select">Theme:</label>
        <select
          id="theme-select"
          value={theme}
          onChange={(e) => setTheme(e.target.value)}
        >
          <option value="light">Light</option>
          <option value="dark">Dark</option>
          <option value="auto">Auto</option>
        </select>
      </div>
      
      <div>
        <label>
          <input
            type="checkbox"
            checked={notifications}
            onChange={(e) => setNotifications(e.target.checked)}
          />
          Enable notifications
        </label>
      </div>
      
      <p data-testid="current-theme">Current theme: {theme}</p>
      <p data-testid="notifications-status">
        Notifications: {notifications ? 'enabled' : 'disabled'}
      </p>
    </div>
  );
};

// Note: In a real app, you would mock external services like this:
// jest.mock('../services/apiService', () => ({
//   fetchUsers: jest.fn(),
//   createUser: jest.fn(),
// }));

describe("Mocking and Advanced Testing Patterns", () => {
  
  describe("API Mocking", () => {
    // Mock global fetch
    beforeEach(() => {
      global.fetch = jest.fn();
    });

    afterEach(() => {
      jest.restoreAllMocks();
    });

    test("fetches and displays users successfully", async () => {
      const mockUsers = [
        { id: 1, name: "John Doe", email: "john@example.com" },
        { id: 2, name: "Jane Smith", email: "jane@example.com" }
      ];

      // Mock successful API response
      global.fetch.mockResolvedValueOnce({
        ok: true,
        json: async () => mockUsers
      });

      render(<UserList />);

      // Should show loading initially
      expect(screen.getByText("Loading users...")).toBeInTheDocument();

      // Wait for users to load
      await waitFor(() => {
        expect(screen.getByTestId("user-list")).toBeInTheDocument();
      });

      // Check that users are displayed
      expect(screen.getByText("John Doe (john@example.com)")).toBeInTheDocument();
      expect(screen.getByText("Jane Smith (jane@example.com)")).toBeInTheDocument();

      // Verify fetch was called correctly
      expect(global.fetch).toHaveBeenCalledWith('/api/users');
    });

    test("handles API error gracefully", async () => {
      // Mock failed API response
      global.fetch.mockResolvedValueOnce({
        ok: false,
        status: 500
      });

      render(<UserList />);

      // Wait for error to appear
      await waitFor(() => {
        expect(screen.getByRole("alert")).toHaveTextContent("Error: Failed to fetch users");
      });

      // Should not show loading or user list
      expect(screen.queryByText("Loading users...")).not.toBeInTheDocument();
      expect(screen.queryByTestId("user-list")).not.toBeInTheDocument();
    });

    test("handles network error", async () => {
      // Mock network error
      global.fetch.mockRejectedValueOnce(new Error("Network error"));

      render(<UserList />);

      // Wait for error to appear
      await waitFor(() => {
        expect(screen.getByRole("alert")).toHaveTextContent("Error: Network error");
      });
    });
  });

  describe("Timer Mocking", () => {
    beforeEach(() => {
      jest.useFakeTimers();
    });

    afterEach(() => {
      jest.runOnlyPendingTimers();
      jest.useRealTimers();
    });

    test("timer starts and increments", async () => {
      const user = userEvent.setup({ advanceTimers: jest.advanceTimersByTime });
      const mockOnTick = jest.fn();
      
      render(<Timer onTick={mockOnTick} />);

      expect(screen.getByText(/Timer:\s*0\s*s/)).toBeInTheDocument();

      // Start the timer
      await user.click(screen.getByText("Start"));

      // Advance time by 3 seconds - wrap in act to handle state updates
      await act(async () => {
        jest.advanceTimersByTime(3000);
      });

      expect(screen.getByText(/Timer:\s*3\s*s/)).toBeInTheDocument();
      expect(mockOnTick).toHaveBeenCalledTimes(3);
      expect(mockOnTick).toHaveBeenLastCalledWith(3);
    });

    test("timer stops and resets", async () => {
      const user = userEvent.setup({ advanceTimers: jest.advanceTimersByTime });
      
      render(<Timer />);

      // Start timer
      await user.click(screen.getByText("Start"));
      
      // Advance time
      await act(async () => {
        jest.advanceTimersByTime(2000);
      });
      expect(screen.getByText(/Timer:\s*2\s*s/)).toBeInTheDocument();

      // Stop timer
      await user.click(screen.getByText("Stop"));
      
      // Advance more time - should not increment
      await act(async () => {
        jest.advanceTimersByTime(2000);
      });
      expect(screen.getByText(/Timer:\s*2\s*s/)).toBeInTheDocument();

      // Reset timer
      await user.click(screen.getByText("Reset"));
      expect(screen.getByText(/Timer:\s*0\s*s/)).toBeInTheDocument();
    });
  });

  describe("localStorage Mocking", () => {
    const localStorageMock = (() => {
      let store = {};
      return {
        getItem: (key) => store[key] || null,
        setItem: (key, value) => {
          store[key] = value.toString();
        },
        removeItem: (key) => {
          delete store[key];
        },
        clear: () => {
          store = {};
        }
      };
    })();

    beforeEach(() => {
      Object.defineProperty(window, 'localStorage', {
        value: localStorageMock
      });
      localStorageMock.clear();
    });

    test("loads settings from localStorage", () => {
      // Set initial localStorage values
      localStorageMock.setItem('theme', 'dark');
      localStorageMock.setItem('notifications', 'true');

      render(<Settings />);

      // Should load saved values - check by the selected option and text content
      expect(screen.getByRole('combobox')).toHaveValue('dark');
      expect(screen.getByRole('checkbox')).toBeChecked();
      expect(screen.getByTestId('current-theme')).toHaveTextContent('Current theme: dark');
      expect(screen.getByTestId('notifications-status')).toHaveTextContent('Notifications: enabled');
    });

    test("saves theme changes to localStorage", async () => {
      const user = userEvent.setup();
      render(<Settings />);

      const themeSelect = screen.getByLabelText(/theme/i);
      
      // Change theme
      await user.selectOptions(themeSelect, 'dark');

      // Should update UI and localStorage
      expect(screen.getByTestId('current-theme')).toHaveTextContent('Current theme: dark');
      expect(localStorageMock.getItem('theme')).toBe('dark');
    });

    test("saves notification preference to localStorage", async () => {
      const user = userEvent.setup();
      render(<Settings />);

      const notificationsCheckbox = screen.getByRole('checkbox');
      
      // Toggle notifications
      await user.click(notificationsCheckbox);

      // Should update UI and localStorage
      expect(screen.getByTestId('notifications-status')).toHaveTextContent('Notifications: enabled');
      expect(localStorageMock.getItem('notifications')).toBe('true');

      // Toggle back
      await user.click(notificationsCheckbox);
      expect(screen.getByTestId('notifications-status')).toHaveTextContent('Notifications: disabled');
      expect(localStorageMock.getItem('notifications')).toBe('false');
    });

    test("uses default values when localStorage is empty", () => {
      render(<Settings />);

      // Should use defaults
      expect(screen.getByRole('combobox')).toHaveValue('light');
      expect(screen.getByRole('checkbox')).not.toBeChecked();
      expect(screen.getByTestId('current-theme')).toHaveTextContent('Current theme: light');
      expect(screen.getByTestId('notifications-status')).toHaveTextContent('Notifications: disabled');
    });
  });

  describe("Custom Hooks Testing", () => {
    // Custom hook for testing
    const useCounter = (initialValue = 0) => {
      const [count, setCount] = React.useState(initialValue);
      
      const increment = React.useCallback(() => setCount(prev => prev + 1), []);
      const decrement = React.useCallback(() => setCount(prev => prev - 1), []);
      const reset = React.useCallback(() => setCount(initialValue), [initialValue]);
      
      return { count, increment, decrement, reset };
    };

    // Test component for the hook
    const CounterTestComponent = ({ initialValue }) => {
      const { count, increment, decrement, reset } = useCounter(initialValue);
      
      return (
        <div>
          <span data-testid="count">{count}</span>
          <button onClick={increment}>Increment</button>
          <button onClick={decrement}>Decrement</button>
          <button onClick={reset}>Reset</button>
        </div>
      );
    };

    test("custom hook works correctly", async () => {
      const user = userEvent.setup();
      render(<CounterTestComponent initialValue={5} />);

      expect(screen.getByTestId("count")).toHaveTextContent("5");

      await user.click(screen.getByText("Increment"));
      expect(screen.getByTestId("count")).toHaveTextContent("6");

      await user.click(screen.getByText("Decrement"));
      expect(screen.getByTestId("count")).toHaveTextContent("5");

      await user.click(screen.getByText("Reset"));
      expect(screen.getByTestId("count")).toHaveTextContent("5");
    });
  });
});
