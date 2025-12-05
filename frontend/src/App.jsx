import { AuthProvider } from "./context/AuthContext";
import { RequestProvider } from "./context/RequestContext";
import { ThemeProvider } from "./context/ThemeContext";
import AppRouter from "./router/AppRouter";
import { ToastProvider } from "./context/ToastProvider";

function App() {
  return (
   <>
   {
   <AuthProvider>
      <ThemeProvider>
        <RequestProvider>
          <AppRouter />
        </RequestProvider>
      </ThemeProvider>
    </AuthProvider>
    }
     <ToastProvider />
    </>
     
  );
}

export default App;
