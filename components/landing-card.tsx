"use client";

import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {  useState } from "react";
import axios from "axios";
import { useRouter } from "next/navigation";


const LandingCard = () => {
  const [referenceID, setReferenceID] = useState("");
  const [message, setMessage] = useState("");
  

  const router = useRouter();

   const handleSearch = async (e: React.MouseEvent<HTMLButtonElement>) => {
    e.preventDefault();
    
  

    if (!referenceID.trim()) return;

    // Clear previous results before running new search
    try {
      const response = await axios.get(`http://localhost:3000/attendance/find/${referenceID}`);
      console.log(referenceID)

      if (response.data) {
        console.log(response.data)
        setMessage(`Attendance Found! Schedule:${response.data.schedule}`)
      } else {
        // No user found → clear state
        setMessage("Not Found")
      }

     
    } catch (err) {
      console.error(err);
      setMessage("No Attendee Found");
    }

   
  };
 
      
   

  return (
    <div className="flex justify-center items-center min-h-screen bg-linear-to-br from-black via-gray-500 to-gray-900">
      <div className="w-105 p-10 flex flex-col items-center rounded-2xl shadow-[5px_5px_10px_0_rgba(200,200,200,0.5)] bg-black">
        <div className="mb-6">
          <h1 className="text-3xl font-extrabold text-white text-center">
           Welcome Ronin!
          </h1>
          <p className="text-gray-500 text-sm text-center mt-1">
            Find your Attendance
          </p>

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
        </div>

        <div className="flex flex-col gap-5 w-full">
          <Input
            type="text"
            placeholder="Reference ID"
            value={referenceID}
            onChange={(e) => setReferenceID(e.target.value)}
            className="w-full rounded-lg border bg-gray-200 border-gray-500 shadow-sm placeholder:transition-opacity focus:placeholder:opacity-0 text-black"
          />
        <Button
          className="mt-2 w-full hover:bg-gray-700 bg-gray-500 text-white rounded-lg shadow-lg transition-all duration-300"
          disabled={!referenceID.trim()} type="button" onClick={handleSearch}
        >
          Search Attendance
        </Button>
        </div>

        <div className="flex flex-col  mt-6  w-full items-center">
           <p className="mt-4 text-sm text-gray-500 hover:text-gray-700 cursor-pointer">
          Haven&apos;t registered yet?
        </p>
        <Button
          className="mt-2 w-full bg-gray-800 text-white hover:bg-gray-700 rounded-lg shadow-lg transition-all"
          onClick={() => router.push("/register-attendance")}
        >
         Register Attendance
        </Button>


        </div>
      </div>
    </div>
  );
};
export default LandingCard;