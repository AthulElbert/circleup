import { useEffect, useState } from "react";
import { useSelector } from "react-redux";
import { listRooms } from "../lib/api.js";
import RoomList from "../components/RoomList.jsx";

export default function Rooms() {
  const token = useSelector((state) => state.auth.token);
  const [rooms, setRooms] = useState([]);
  const [error, setError] = useState("");

  async function loadRooms() {
    try {
      setError("");
      setRooms(await listRooms(token));
    } catch (err) {
      setError(err.message);
    }
  }

  useEffect(() => {
    loadRooms();
  }, []);

  return (
    <section className="grid gap-6">
      <div>
        <h2 className="text-2xl font-semibold">Rooms</h2>
        <p className="text-white/70">Browse available circles.</p>
      </div>
      {error ? <p className="text-red-400">{error}</p> : null}
      <RoomList rooms={rooms} />
    </section>
  );
}
