import { Routes, Route } from "react-router-dom";
import Home from "./Home.jsx";
import FaceCursor from "./FaceCursor.jsx";

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<Home />} />
      <Route path="/face-cursor" element={<FaceCursor />} />
    </Routes>
  );
}
