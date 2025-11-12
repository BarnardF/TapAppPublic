import { BrowserRouter, Route, Routes, Navigate  } from "react-router-dom";
import React from "react";

//import HomePage from "./pages/HomePage";
import Dashboard from "./pages/dashboard";
import TapForm from "./pages/TapForm";
import Login from "./pages/Login";
import Register from "./pages/Register";
import UserManagement from './pages/UserManagement';


function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const token = localStorage.getItem("token");
  const role = localStorage.getItem("role");

  if (!token) {
    return <Navigate to ="/login" replace/>;
  }

  return <>{children}</>;
}

function SuperAdminRoute({ children }: { children: React.ReactNode }) {
  const token = localStorage.getItem("token");
  const role = localStorage.getItem("role");

  if (!token || role!== "SuperAdmin") {
    return <Navigate to="/dashboard" replace/>
  }

  return <>{children}</>
}

function PublicRoute({ children }: { children: React.ReactNode }) {
  const token = localStorage.getItem("token");
  
  if (token) {
    return <Navigate to ="/dashboard" replace/>;
  }

  return <>{children}</>
}


function App() {
  return (
      <BrowserRouter>
        <Routes>
          {/* public routes */}
          {/* <Route path="/" element={<HomePage />} /> */}
          <Route path="/" element={<Navigate to="/register" replace />} />
          <Route path="/login" element={<PublicRoute> <Login /> </PublicRoute>}/>
          <Route path="/register" element={<PublicRoute><Register /></PublicRoute>} />

          {/* protected routes */}
          <Route path="/dashboard" element={<ProtectedRoute> <Dashboard /> </ProtectedRoute>}/>
          <Route path="/form" element={<ProtectedRoute> <TapForm /> </ProtectedRoute>}/>

          {/*SuperAdmin-only Route */}
          <Route path="/users" element={<SuperAdminRoute> <UserManagement /> </SuperAdminRoute>}/>

          {/*Fallback*/}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </BrowserRouter> 
  );
}

export default App;
