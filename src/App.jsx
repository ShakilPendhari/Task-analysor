import "./App.css";
import LoginPage from "./pages/Login.jsx";
import Dashboard from "./pages/Dashboard.jsx";
import { useAuth } from "./context/authContext.jsx";

function App() {
  const { user } = useAuth();

  return user ? <Dashboard /> : <LoginPage />;
}

export default App;
