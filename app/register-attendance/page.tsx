'use client';

import { useState } from "react";

export default function Home() {
  const [fullname, setFullname] = useState("");
  const [schedule, setSchedule] = useState("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [messageStatus,setMessageStatus] = useState(true);

  const handleSubmitSched = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    // Basic validation
    if (!fullname.trim() || !schedule) {
      setMessage("⚠️ Please fill out all fields.");
      return;
    }

    setLoading(true);
    setMessage("");

    try {
      const res = await fetch("http://localhost:3000/attendance", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ fullname, schedule }),
      });

      if (!res.ok) throw new Error("Failed to submit");

      //created data returned from the backend
      const createdData = await res.json();
      console.log(createdData);

      setFullname("");
      setSchedule("");

      setMessage(`"Attendee registered!" NOTE THIS REFERENCE ID : ${createdData.ref_id}`);
    } catch (err) {
      console.error(err);
      setMessage("Error submitting attendance.");
    }

    setLoading(false);
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-linear-to-br from-black via-gray-500 to-gray-900 font-sans">
      <main className="w-full max-w-lg bg-black p-10 shadow-[5px_5px_10px_0_rgba(200,200,200,0.5)] rounded-xl">
        
        <h1 className="text-2xl font-bold text-center mb-6 text-white">
          Attendance Registration
        </h1>

        {message && (
          <div
            className={`mb-4 p-1 rounded-lg text-center text-sm ${
              message.startsWith("❌")
                ? " text-red-700"
                : message.startsWith("⚠️")
                ? " text-yellow-700"
                : " text-green-700"
            }`}
          >
            {message}
          </div>
        )}

        <form onSubmit={handleSubmitSched} className="space-y-4 ">

          {/* Full Name */}
          <div className="flex flex-col">
            <label htmlFor="fullname" className="text-gray-200 font-medium">
              Full Name
            </label>
            <input
              type="text"
              id="fullname"
              placeholder="e.g. Juan Dela Cruz"
              value={fullname}
              onChange={(e) => setFullname(e.target.value)}
              className="w-full rounded-lg border p-2 bg-gray-200 border-gray-500 shadow-sm placeholder:transition-opacity focus:ring-2 focus:ring-gray-500 focus:placeholder:opacity-0 text-black"
              required
            />
          </div>

          {/* Schedule */}
          <div className="flex flex-col">
            <label className="text-gray-200 font-medium mb-2">
              Select Schedule
            </label>
            <select name="schedule" id="schedule" required value={schedule} onChange={(e)=> setSchedule(e.target.value)} className="border rounded-lg p-2 mt-1 focus:ring-2 focus:ring-gray-500 outline-none w-full bg-gray-200 border-gray-500 shadow-sm placeholder:transition-opacity focus:placeholder:opacity-0 text-black">
              <option value="" disabled>-- Select Day --</option>
              <option value="Day1">Day 1</option>
              <option value="Day2">Day 2</option>
            </select>
          </div>
            <div className="justify-items-center">

            </div>
          {/* Submit Button */}
       <div className="flex justify-center">
        <button
            type="submit"
            disabled={loading}
            className={`rounded-lg shadow-lg p-2 font-semibold transition duration-300 text-white
            ${loading
                ? "bg-gray-300 cursor-not-allowed"
                : "bg-gray-700 hover:bg-gray-500 text-white"
            }`}
        >
            {loading ? "Submitting..." : "Submit Attendance"}
        </button>
        </div>

        </form>
      </main>
    </div>
  );
}
