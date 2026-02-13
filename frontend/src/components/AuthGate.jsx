import { useSelector } from "react-redux";
import { selectIsAuthed } from "../store/authSlice.js";

export default function AuthGate({ children }) {
  const isAuthed = useSelector(selectIsAuthed);
  if (!isAuthed) return <div>Please log in to continue.</div>;
  return children;
}
