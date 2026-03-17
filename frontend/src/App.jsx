import { Routes, Route, Navigate } from "react-router-dom";
import Layout from "./components/Layout.jsx";
import AuthGate from "./components/AuthGate.jsx";
import Home from "./pages/Home.jsx";
import Login from "./pages/Login.jsx";
import Signup from "./pages/Signup.jsx";
import OtpVerify from "./pages/OtpVerify.jsx";
import Topics from "./pages/Topics.jsx";
import Rooms from "./pages/Rooms.jsx";
import CreateRoom from "./pages/CreateRoom.jsx";
import JoinInvite from "./pages/JoinInvite.jsx";
import RoomDetails from "./pages/RoomDetails.jsx";

export default function App() {
  return (
    <Layout>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/login" element={<Login />} />
        <Route path="/signup" element={<Signup />} />
        <Route path="/verify" element={<OtpVerify />} />
        <Route path="/topics" element={<AuthGate><Topics /></AuthGate>} />
        <Route path="/rooms" element={<AuthGate><Rooms /></AuthGate>} />
        <Route path="/rooms/:roomId" element={<AuthGate><RoomDetails /></AuthGate>} />
        <Route path="/rooms/create" element={<AuthGate><CreateRoom /></AuthGate>} />
        <Route path="/rooms/join" element={<AuthGate><JoinInvite /></AuthGate>} />
        <Route path="/protected" element={<AuthGate><div>Protected content</div></AuthGate>} />
        <Route path="*" element={<Navigate to="/" />} />
      </Routes>
    </Layout>
  );
}
