import { Routes, Route, Navigate } from "react-router-dom";
import Layout from "./components/Layout.jsx";
import AuthGate from "./components/AuthGate.jsx";
import Home from "./pages/Home.jsx";
import Login from "./pages/Login.jsx";
import Signup from "./pages/Signup.jsx";
import OtpVerify from "./pages/OtpVerify.jsx";

export default function App() {
  return (
    <Layout>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/login" element={<Login />} />
        <Route path="/signup" element={<Signup />} />
        <Route path="/verify" element={<OtpVerify />} />
        <Route
          path="/protected"
          element={
            <AuthGate>
              <div>Protected content</div>
            </AuthGate>
          }
        />
        <Route path="*" element={<Navigate to="/" />} />
      </Routes>
    </Layout>
  );
}
