"use client";

import TableComponent from "@/app/admin/component/table-components/attendance-list-table";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import {
  LayoutDashboard,
  User,
  Settings,
  LogOut,
  ChevronDown,
  Search,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import axios from "axios";
import { socket } from "@/lib/socket";

interface AdminData {
  id: number;
  username: string;
  password: string;
}

interface SearchResult {
  id: number;
  ref_id: string;
  fullname: string;
  schedule: string;
}

const AdminViews = () => {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [isChecking, setIsChecking] = useState(true);
  const [isOpen, setIsOpen] = useState(false);
  const router = useRouter();
  const [adminData, setAdminData] = useState<AdminData | null>(null);

  //for Search
  const [searchInput, setSearchInput] = useState("");
  //for table result
  const [search_result, setSearchResult] = useState<SearchResult[]>([]);
  const [selectedSched, setSelectedSched] = useState("all");

  useEffect(() => {
    const timeout = setTimeout(() => {
      const admin = localStorage.getItem("admin");
      if (!admin) {
        router.push("/admin");
      } else {
        const parsedAdmin = JSON.parse(admin);
        console.log("Parsed admin data:", parsedAdmin);
        setIsLoggedIn(true);
        setAdminData(parsedAdmin);
      }
      setIsChecking(false);
    }, 1000);

    return () => clearTimeout(timeout);
  }, [router]);

  const handleSignOut = () => {
    localStorage.removeItem("admin");
    router.push("/admin");
  };

  useEffect(() => {
    // fetch("http://localhost:3000/attendance")
    fetch(`${process.env.NEXT_PUBLIC_API_URL}/attendance`) // hosted backend URL from .env
      .then((res) => res.json())
      .then((data) => {
        setSearchResult(data);
      })
      .catch((err) => {
        console.error(err);
      });
  }, []);

  // Search by name
  const handleSearch = async () => {
    const query = searchInput.trim();

    if (!query) {
      const response = await axios.get(`${process.env.NEXT_PUBLIC_API_URL}/attendance`);
      setSearchResult(response.data);
      return;
    }

    try {
      const response = await axios.get(
        `${process.env.NEXT_PUBLIC_API_URL}/attendance/search`,
        { params: { input: query } },
      );
      console.log("API response:", response.data);
      if (response.data.length > 0) {
        setSearchResult(response.data);
      } else {
        setSearchResult([]);
      }
    } catch (err) {
      console.error("Search failed:", err);
    }
  };

  // Filter by schedule
  const handleFilter = async (schedule: string) => {
    try {
      setSelectedSched(schedule);

      if (schedule.toLowerCase() === "all") {
        const res = await axios.get(`${process.env.NEXT_PUBLIC_API_URL}/attendance`);
        setSearchResult(res.data);
        return;
      }

      const res = await axios.get(
        `${process.env.NEXT_PUBLIC_API_URL}/attendance/schedule/${schedule}`,
      );

      setSearchResult(res.data);
    } catch (err) {
      console.error("Filter failed:", err);
    }
  };

  // delete attendance record by id
  const handleDelete = async (id: number) => {
    try {
      await axios.post(`${process.env.NEXT_PUBLIC_API_URL}/attendance/delete/${id}`);
      setSearchResult((prev) => prev.filter((att) => att.id !== id));
    } catch (err) {
      console.error("Delete failed:", err);
    }
  }

  // websocket listeners for real-time updates
  useEffect(() => {
    socket.on("attendance_create", (payload) => {
      setSearchResult((prev) => [...prev, payload.data]);
    });

    socket.on("attendance_update", (payload) => {
      setSearchResult((prev) =>
        prev.map((att) =>
          att.id === Number(payload.data.id) ? payload.data : att,
        ),
      );
    });

    return () => {
      socket.off("attendance_create");
      socket.off("attendance_update");
    };
  }, []);

  if (isChecking)
    return (
      <div className="flex items-center justify-center h-screen">
        <p className="text-gray-500 text-lg">Checking login...</p>
      </div>
    );

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header with logo and account */}
      <div className="w-full h-20 bg-gradient-to-r from-gray-950 via-gray-400 to-gray-600 shadow-md flex items-center justify-between px-8">
        {/* Logo and title */}
        <div className="flex items-center space-x-3">
          <div className="w-8 h-8 bg-white rounded-lg flex items-center justify-center">
            <LayoutDashboard className="w-5 h-5  text-gray-800" />
          </div>
          <h1 className="text-2xl font-bold text-white">Admin Dashboard</h1>
        </div>

        {/* Account dropdown */}
        <div className="relative">
          <button
            onClick={() => setIsOpen(!isOpen)}
            className="flex items-center space-x-3 bg-white/10 hover:bg-white/20 rounded-lg px-3 py-2 transition"
          >
            <div className="w-8 h-8 bg-gray-700 rounded-full flex items-center justify-center">
              <User className="w-4 h-4 text-white" />
            </div>
            <span className="text-white text-sm hidden md:block">
              {adminData?.username || "Admin"}
            </span>
            <ChevronDown className="w-4 h-4 text-white" />
          </button>

          {/* Dropdown menu */}
          {isOpen && (
            <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg py-1">
              <button className="w-full flex items-center space-x-2 px-4 py-2 text-sm text-gray-700 rounded-lg hover:bg-gray-100">
                <User className="w-4 h-4" />
                <span>Profile</span>
              </button>
              <button className="w-full flex items-center space-x-2 px-4 py-2 text-sm text-gray-700 rounded-lg hover:bg-gray-100">
                <Settings className="w-4 h-4" />
                <span>Settings</span>
              </button>
              <hr className="my-1" />
              <button
                onClick={handleSignOut}
                className="w-full flex items-center space-x-2 px-4 py-2 text-sm text-red-600 hover:bg-red-50"
              >
                <LogOut className="w-4 h-4" />
                <span>Sign Out</span>
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Main content */}
      <div className="max-w-6xl mx-auto p-6 space-y-6">
        <div className="flex max-w-6xl items-center justify-between">
          <div>
            <h2 className="text-xl font-semibold text-gray-800">
              Overview of Attendees
            </h2>
            <p className="text-gray-500 mt-1">
              Review and manage all registered attendees.
            </p>
          </div>

          <div className="flex items-center">
            <input
              type="text"
              value={searchInput}
              onChange={(e) => {
                // Optional: live search while typing
                const query = e.target.value.trim();
                if (query === "") {
                  axios
                    .get(`${process.env.NEXT_PUBLIC_API_URL}/attendance`)
                    .then((res) => setSearchResult(res.data)) // if res.data = [], tableData = []
                    .catch((err) => {
                      console.error(err);
                    });
                }
                setSearchInput(e.target.value);
              }}
              placeholder="Search"
              className="h-10 w-64 rounded-l-lg border-gray-400 border-2 border-r-0 px-4 focus:outline-none focus:ring-1 focus:ring-gray-200"
            />
            <Button
              type="button"
              onClick={handleSearch}
              className="h-10 border-2 border-gray-400 border-l-0 rounded-l-none rounded-r-lg px-4"
            >
              <Search className="h-4 w-4" />
            </Button>
          </div>
        </div>
        {isLoggedIn && (
          <div className="bg-white rounded-lg shadow-lg p-4">
            <TableComponent
              results={search_result}
              isLoading={isChecking}
              onFilter={handleFilter}
              selectedSched={selectedSched}
              onDelete={handleDelete}
            />
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminViews;
