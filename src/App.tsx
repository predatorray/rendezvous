import { Navigate, Route, Routes } from 'react-router-dom';
import HomePage from './pages/HomePage';
import MeetingPage from './pages/MeetingPage';

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<HomePage />} />
      <Route path="/m/:code" element={<MeetingPage />} />
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}
