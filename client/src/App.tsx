// Main application component that sets up routing and global contexts
import { BrowserRouter as Router } from "react-router-dom";
import { AuthProvider } from "./auth/AuthContext";
import { PreferencesProvider } from "./contexts/PreferencesContext";
import AppRoutes from "./routes/AppRoutes";

// App component wraps the entire application with necessary providers:
// - Router: For handling client-side routing
// - AuthProvider: For managing authentication state
// - PreferencesProvider: For managing user preferences like theme and units
function App() {
  return (
    <Router>
      <AuthProvider>
        <PreferencesProvider>
          <AppRoutes />
        </PreferencesProvider>
      </AuthProvider>
    </Router>
  );
}

export default App;
