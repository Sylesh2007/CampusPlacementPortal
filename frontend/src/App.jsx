import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import ProtectedRoute from './components/ProtectedRoute';

// 9 Required Pages
import Home from './pages/Home';
import Register from './pages/Register';
import Login from './pages/Login';
import StudentDashboard from './pages/StudentDashboard';
import CompanyDashboard from './pages/CompanyDashboard';
import PlacementDrives from './pages/PlacementDrives';
import ApplyJob from './pages/ApplyJob';
import MyApplications from './pages/MyApplications';
import AdminDashboard from './pages/AdminDashboard';

function App() {
  return (
    <AuthProvider>
      <Router>
        <div className="flex flex-col min-h-screen bg-slate-50 text-slate-800">
          <Navbar />
          <main className="grow">
            <Routes>
              {/* Public Routes */}
              <Route path="/" element={<Home />} />
              <Route path="/register" element={<Register />} />
              <Route path="/login" element={<Login />} />
              <Route path="/drives" element={<PlacementDrives />} />

              {/* Protected Student Routes */}
              <Route element={<ProtectedRoute allowedRoles={['student']} />}>
                <Route path="/student-dashboard" element={<StudentDashboard />} />
                <Route path="/apply" element={<ApplyJob />} />
                <Route path="/apply/:driveId" element={<ApplyJob />} />
                <Route path="/my-applications" element={<MyApplications />} />
              </Route>

              {/* Protected Company Routes */}
              <Route element={<ProtectedRoute allowedRoles={['company']} />}>
                <Route path="/company-dashboard" element={<CompanyDashboard />} />
              </Route>

              {/* Protected Admin Routes */}
              <Route element={<ProtectedRoute allowedRoles={['admin']} />}>
                <Route path="/admin-dashboard" element={<AdminDashboard />} />
              </Route>

              {/* Catch-all redirect to Home */}
              <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
          </main>
          <Footer />
        </div>
      </Router>
    </AuthProvider>
  );
}

export default App;
