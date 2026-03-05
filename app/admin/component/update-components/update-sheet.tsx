'use client';

import { socket } from "@/lib/socket";
import { useEffect, useState } from "react";
type Attendance = {
  id: number;
  fullname: string;
  schedule: string;
};

type Props = {
  data: Attendance;
  onClose: () => void;
};

export default function UpdateSheetComponent({ data, onClose }: Props) {
  const [fullname, setFullname] = useState("");
  const [schedule, setSchedule] = useState(""); 
  const [updating, setUpdating] = useState(false);
  const [message, setMessage] = useState("");

    //   const { id } = useParams();
    //   const router = useRouter();

  useEffect(() => {
    setFullname(data.fullname);
    setSchedule(data.schedule);
  }, [data]);

 
  const handleUpdate = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setUpdating(true);
    setMessage("");
  

    try {
      await fetch(`http://localhost:3000/attendance/${data.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ fullname, schedule }),
      });

    
        setMessage("Updated successfully!");
        setTimeout(() => onClose(), 800);
    } catch (err) {
      setMessage("Error updating data.");
    }

    setUpdating(false);
  };

 

  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-100 p-6">
      <main className="w-full max-w-lg bg-white shadow-xl rounded-xl p-8">

        <h1 className="text-2xl font-bold text-gray-800 text-center mb-4">
          Update Attendance
        </h1>

        {message && (
          <div
            className={`mb-4 p-3 rounded-lg text-center font-medium ${
              message.startsWith("❌")
                ? "bg-red-100 text-red-700"
                : "bg-green-100 text-green-700"
            }`}
          >
            {message}
          </div>
        )}

        <form onSubmit={handleUpdate} className="space-y-4">

          {/* Full Name */}
          <div className="flex flex-col">
            <label htmlFor="fullname" className="text-gray-700 font-medium mb-1">
              Full Name
            </label>
            <input
              type="text"
              id="fullname"
              placeholder="Enter full name"
              value={fullname}
              onChange={(e) => setFullname(e.target.value)}
              className="border rounded-lg p-3 outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          {/* Schedule */}
          <div className="flex flex-col">
            <label className="text-gray-700 font-medium mb-2">
              Select Schedule
            </label>
            <select name="schedule" id="schedule" value={schedule} onChange={(e)=> setSchedule(e.target.value)} className="border rounded-lg p-2 mt-1 focus:ring-2 focus:ring-blue-400 outline-none ">
              <option value="" disabled>-- Select Day --</option>
              <option value="Day1">Day 1</option>
              <option value="Day2">Day 2</option>
            </select>
          </div>
          
          {/* Submit Button */}
          <button
            type="submit"
            disabled={updating}
            className={`w-full py-3 mt-4 rounded-lg text-white font-semibold transition ${
              updating
                ? "bg-blue-300 cursor-not-allowed"
                : "bg-blue-500 hover:bg-blue-600"
            }`}
          >
            {updating ? "Updating..." : "Update"}
          </button>
        </form>
      </main>
    </div>
  );
}
