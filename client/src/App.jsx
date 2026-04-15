import { BrowserRouter } from "react-router-dom";
import "./App.css";
import "./index.css";
import AppContent from "./AppContent";
function App() {
  return (
    <>
      <BrowserRouter>
        <AppContent />
      </BrowserRouter>
    </>
  );
}

export default App;
