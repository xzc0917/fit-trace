import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Layout from './components/Layout';
import ProtectedRoute from './components/ProtectedRoute';
import Login from './pages/login';
import Register from './pages/Register';
import Dashboard from './pages/Dashboard';
import RecordWorkout from './pages/RecordWorkout';
import DietLog from './pages/DietLog';
import WeightLog from './pages/WeightLog';
import ExerciseLibrary from './pages/ExerciseLibrary';
import Templates from './pages/Templates';
import Friends from './pages/Friends';
import Profile from './pages/Profile';

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route
          path="/*"
          element={
            <ProtectedRoute>
              <Layout>
                <Routes>
                  <Route path="/" element={<Dashboard />} />
                  <Route path="/record" element={<RecordWorkout />} />
                  <Route path="/diet" element={<DietLog />} />
                  <Route path="/weight" element={<WeightLog />} />
                  <Route path="/exercises" element={<ExerciseLibrary />} />
                  <Route path="/templates" element={<Templates />} />
                  <Route path="/friends" element={<Friends />} />
                  <Route path="/profile" element={<Profile />} />
                  <Route path="*" element={<Navigate to="/" replace />} />
                </Routes>
              </Layout>
            </ProtectedRoute>
          }
        />
      </Routes>
    </Router>
  );
}

export default App;