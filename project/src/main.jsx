import { createRoot } from "react-dom/client";
import App from "./App.jsx";
import 'normalize.css';
import '../src/styles/main.scss'

createRoot(document.getElementById("root")).render(<App />);
