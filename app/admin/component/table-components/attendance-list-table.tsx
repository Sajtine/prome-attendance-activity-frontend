"use client";

import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
  TableCaption,
} from "@/components/ui/table";
import UpdateSheetComponent from "@/app/admin/component/update-components/update-sheet";
import { socket } from "@/lib/socket";
import { use, useEffect, useState } from "react";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import axios from "axios";

type Attendance = {
  id: number;
  fullname: string;
  schedule: string;
};

export default function TableComponent() {
  const [attendance, setAttendance] = useState<Attendance[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [open, setOpen] = useState(false);
  const [selected, setSelected] = useState<Attendance | null>(null);

  const [selectedSched, setSelectedSched] = useState("all");

  useEffect(() => {
    fetch("http://localhost:3000/attendance")
      .then((res) => res.json())
      .then((data) => {
        setAttendance(data);
        setIsLoading(false);
      })
      .catch((err) => {
        console.error(err);
        setIsLoading(false);
      });
  }, []);

  // Handle filtering by schedule
  const handleFilter = async ( schedule: string ) => {
    try{
      const response = await axios.get(`http://localhost:3000/attendance/schedule/${schedule}`);

      if (schedule.toLocaleLowerCase() === "all") {
        const allResponse = await axios.get("http://localhost:3000/attendance");
        console.log("All attendance data:", allResponse.data);
        setAttendance(allResponse.data);
        setSelectedSched(schedule);
        return;
      }

      console.log("Filtered attendance data:", response.data);

      setSelectedSched(schedule);
      setAttendance(response.data);
    } catch(err){
      console.log(err);
    }
  }

  // Listen to the websocket for real-time updates
  useEffect(() => {
    // Listen for attendance creation
    socket.on("attendance_create", (payload) => {
      console.log("Received websocket event:", payload);

      setAttendance((prev) => [...prev, payload.data]);
    });

    // Listen for attendance updates
    socket.on("attendance_update", (payload) => {
      console.log("Received websocket update event:", payload);

      setAttendance((prev) =>
        prev.map((att) =>
          att.id === Number(payload.data.id) ? payload.data : att,
        ),
      );
    });

    // Cleanup on unmount
    return () => {
      socket.off("attendance_create");
      socket.off("attendance_update");
    };
  }, []);

  if (isLoading)
    return (
      <div className="flex items-center justify-center h-64">
        <p className="text-gray-500 text-lg">Loading attendance data...</p>
      </div>
    );
  return (
    <div className="min-h-screen flex flex-col items-center justify-start p-6 bg-gray-50">
      <div className="w-full max-w-6xl bg-white rounded-lg shadow-lg p-6 space-y-4">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-bold text-gray-800">
            Registered Attendees
          </h1>
          {/* <Button onClick={()=>router.push("/attendance/add")} className="bg-blue-600 hover:bg-blue-700 text-white">
                        Add Attendee
                    </Button> */}

          <div className="flex items-center gap-4">
            <Select onValueChange={handleFilter} value={selectedSched}>
              <SelectTrigger
                className="
                w-[140px] 
                border-2 
                border-teal-500 
                text-gray-800 
                focus:outline-none 
                focus:ring-0
                data-[placeholder]:text-gray-400
                data-[state=open]:border-teal-500
                data-[state=closed]:border-teal-500
              "
              >
                <SelectValue placeholder="Select schedule" />
              </SelectTrigger>

              <SelectContent className="bg-white text-gray-800 border border-green-600">
                <SelectGroup>
                  <SelectLabel>Schedule</SelectLabel>
                  <SelectItem value="all" className="hover:bg-green-100">
                    All
                  </SelectItem>
                  <SelectItem value="Day1" className="hover:bg-green-100">
                    Day 1
                  </SelectItem>
                  <SelectItem value="Day2" className="hover:bg-green-100">
                    Day 2
                  </SelectItem>
                </SelectGroup>
              </SelectContent>
            </Select>
          </div>
        </div>

        <div className="overflow-x-auto">
          <Table className="w-full min-w-[600px] border border-gray-200">
            <TableCaption className="text-left text-gray-500 font-medium">
              List of all attendees and schedules
            </TableCaption>

            <TableHeader>
              <TableRow className="bg-gray-100 text-gray-700 uppercase text-sm">
                <TableHead className="px-4 py-3 text-center">ID</TableHead>
                <TableHead className="px-4 py-3 text-left">Fullname</TableHead>
                <TableHead className="px-4 py-3 text-center">
                  Schedule Picked
                </TableHead>
                <TableHead className="px-4 py-3 text-center">Action</TableHead>
              </TableRow>
            </TableHeader>

            <TableBody>
              {attendance.map((data) => (
                <TableRow
                  key={data.id}
                  className="hover:bg-gray-50 transition-colors"
                >
                  <TableCell className="px-4 py-3 text-center text-gray-700">
                    {data.id}
                  </TableCell>
                  <TableCell className="px-4 py-3 text-gray-700">
                    {data.fullname}
                  </TableCell>
                  <TableCell className="px-4 py-3 text-center text-gray-700">
                    {data.schedule}
                  </TableCell>
                  <TableCell className="px-4 py-3 text-center">
                    <Button
                      onClick={() => {
                        setSelected(data);
                        setOpen(true);
                      }}
                      className="bg-green-600 hover:bg-green-700 text-white"
                    >
                      Update
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>

          <Sheet open={open} onOpenChange={setOpen}>
            <SheetContent>
              <SheetHeader>
                <SheetTitle>Update Attendance</SheetTitle>
              </SheetHeader>

              {selected && (
                <UpdateSheetComponent
                  data={selected}
                  onClose={() => setOpen(false)}
                />
              )}
            </SheetContent>
          </Sheet>
        </div>
      </div>
    </div>
  );
}
