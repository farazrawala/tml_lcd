import { BrowserRouter, Navigate, Route, Routes } from "react-router-dom"
import { Slideshow } from "./components/Slideshow"
import { AdminPage } from "./components/AdminPage"
import { ScreenSession } from "./lib/screenSession"

export default function App() {
  return (
    <BrowserRouter>
      <ScreenSession />
      <Routes>
        <Route path="/" element={<Navigate to="/lcd-display" replace />} />
        <Route path="/lcd-display" element={<Slideshow />} />
        <Route path="/admin" element={<AdminPage />} />
        <Route path="/upload" element={<Navigate to="/admin" replace />} />
        <Route path="*" element={<Navigate to="/lcd-display" replace />} />
      </Routes>
    </BrowserRouter>
  )
}
