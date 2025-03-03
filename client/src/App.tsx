import { BrowserRouter as Router } from "react-router-dom";
import { AuthProvider } from "./auth/AuthContext";
import { PreferencesProvider } from "./contexts/PreferencesContext";
import AppRoutes from "./routes/AppRoutes";

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
