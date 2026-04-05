import React, { useEffect, useState } from "react";
import { Card } from "../components/ui/Card";
import { Button } from "../components/ui/Button";
import {
  Users,
  Briefcase,
  DollarSign,
  CheckCircle,
  Clock,
  AlertCircle,
  Phone,
} from "lucide-react";
import axios from "axios";
import { formatDate, formatCurrency } from "../utils/utils";
import { toast } from "sonner";
const API = import.meta.env.VITE_API_URL;

import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  AreaChart,
  Area,
} from "recharts";

const demandData = [
  { day: "Mon", bookings: 12, emergency: 2 },
  { day: "Tue", bookings: 19, emergency: 4 },
  { day: "Wed", bookings: 15, emergency: 1 },
  { day: "Thu", bookings: 22, emergency: 5 },
  { day: "Fri", bookings: 30, emergency: 8 },
  { day: "Sat", bookings: 45, emergency: 12 },
  { day: "Sun", bookings: 38, emergency: 10 },
];

export const AdminDashboard: React.FC = () => {
  const [stats, setStats] = useState<any>(null);
  const [bookings, setBookings] = useState<any[]>([]);
  const [workers, setWorkers] = useState<any[]>([]);
  const [leaderboard, setLeaderboard] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("all");
  const [assigningId, setAssigningId] = useState<string | null>(null);
  const [selectedWorkers, setSelectedWorkers] = useState<string[]>([]);
  const [rewardingId, setRewardingId] = useState<string | null>(null);
  const [rewardForm, setRewardForm] = useState({ incentives: 0, gifts: "" });

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [statsRes, bookingsRes, workersRes, leaderboardRes] =
          await Promise.all([
            axios.get(`${API}/api/admin/stats`),
            axios.get(`${API}/api/admin/bookings`),
            axios.get(`${API}/api/admin/workers`),
            axios.get(`${API}/api/workers/leaderboard`),
          ]);
        setStats(statsRes.data);
        setBookings(bookingsRes.data);
        setWorkers(workersRes.data);
        setLeaderboard(leaderboardRes.data);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const handleAssign = async (bookingId: string) => {
    try {
      if (selectedWorkers.length === 0) {
        toast.error("Please select at least one worker");
        return;
      }
      const res = await axios.patch(
        `${API}/api/admin/bookings/${bookingId}/assign`,
        {
          workerIds: selectedWorkers,
        },
      );
      setBookings(
        bookings.map((b) =>
          b._id === bookingId ? { ...b, ...res.data.booking } : b,
        ),
      );
      setAssigningId(null);
      setSelectedWorkers([]);
      toast.success("Workers assigned successfully");
    } catch (err) {
      toast.error("Failed to assign workers");
    }
  };

  const toggleWorkerSelection = (workerId: string) => {
    setSelectedWorkers((prev) =>
      prev.includes(workerId)
        ? prev.filter((id) => id !== workerId)
        : [...prev, workerId],
    );
  };

  const calculateDistance = (
    lat1: number,
    lon1: number,
    lat2: number,
    lon2: number,
  ) => {
    const R = 6371; // km
    const dLat = ((lat2 - lat1) * Math.PI) / 180;
    const dLon = ((lon2 - lon1) * Math.PI) / 180;
    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos((lat1 * Math.PI) / 180) *
        Math.cos((lat2 * Math.PI) / 180) *
        Math.sin(dLon / 2) *
        Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c;
  };

  const getSortedWorkers = (booking: any) => {
    if (!booking.coordinates) return workers.filter((w) => w.availability);

    return [...workers]
      .filter((w) => w.availability)
      .sort((a, b) => {
        if (!a.lastLocation) return 1;
        if (!b.lastLocation) return -1;

        const distA = calculateDistance(
          booking.coordinates.lat,
          booking.coordinates.lng,
          a.lastLocation.lat,
          a.lastLocation.lng,
        );
        const distB = calculateDistance(
          booking.coordinates.lat,
          booking.coordinates.lng,
          b.lastLocation.lat,
          b.lastLocation.lng,
        );
        return distA - distB;
      });
  };

  const handleReward = async (workerId: string) => {
    try {
      const giftsArray = rewardForm.gifts
        .split(",")
        .map((g) => g.trim())
        .filter((g) => g !== "");
      const res = await axios.patch(
        `${API}/api/admin/workers/${workerId}/incentives`,
        {
          incentives: Number(rewardForm.incentives),
          gifts: giftsArray,
        },
      );
      setWorkers(
        workers.map((w) => (w._id === workerId ? { ...w, ...res.data } : w)),
      );
      setLeaderboard(
        leaderboard.map((w) =>
          w._id === workerId ? { ...w, ...res.data } : w,
        ),
      );
      setRewardingId(null);
      toast.success("Reward assigned successfully");
    } catch (err) {
      toast.error("Failed to assign reward");
    }
  };

  const filteredBookings = bookings.filter((b) => {
    if (activeTab === "all") return true;
    if (activeTab === "emergency") return b.type === "emergency";
    if (activeTab === "pending") return b.status === "pending";
    if (activeTab === "completed") return b.status === "completed";
    return true;
  });

  if (loading)
    return <div className="pt-24 text-center">Loading Admin Panel...</div>;

  return (
    <div className="min-h-screen pt-24 pb-12 px-4 max-w-7xl mx-auto">
      <h1 className="text-3xl font-bold mb-8">Admin Control Panel</h1>

      <div className="grid md:grid-cols-4 gap-6 mb-12">
        <Card className="flex items-center gap-4">
          <div className="w-12 h-12 bg-blue-100 text-blue-600 rounded-xl flex items-center justify-center">
            <Users />
          </div>
          <div>
            <p className="text-xs text-zinc-500 uppercase font-bold">Users</p>
            <h3 className="text-2xl font-bold">{stats?.totalUsers}</h3>
          </div>
        </Card>
        <Card className="flex items-center gap-4">
          <div className="w-12 h-12 bg-purple-100 text-purple-600 rounded-xl flex items-center justify-center">
            <Briefcase />
          </div>
          <div>
            <p className="text-xs text-zinc-500 uppercase font-bold">Workers</p>
            <h3 className="text-2xl font-bold">{stats?.totalWorkers}</h3>
          </div>
        </Card>
        <Card className="flex items-center gap-4">
          <div className="w-12 h-12 bg-green-100 text-green-600 rounded-xl flex items-center justify-center">
            <CheckCircle />
          </div>
          <div>
            <p className="text-xs text-zinc-500 uppercase font-bold">
              Completed
            </p>
            <h3 className="text-2xl font-bold">{stats?.completedBookings}</h3>
          </div>
        </Card>
        <Card className="flex items-center gap-4">
          <div className="w-12 h-12 bg-yellow-100 text-yellow-600 rounded-xl flex items-center justify-center">
            <DollarSign />
          </div>
          <div>
            <p className="text-xs text-zinc-500 uppercase font-bold">Revenue</p>
            <h3 className="text-2xl font-bold">
              {formatCurrency(stats?.completedBookings * 99)}
            </h3>
          </div>
        </Card>
      </div>

      <div className="grid lg:grid-cols-3 gap-8 mb-12">
        <Card className="lg:col-span-2 p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-bold">Demand Forecasting</h2>
            <div className="flex items-center gap-4 text-xs">
              <div className="flex items-center gap-1">
                <span className="w-3 h-3 bg-blue-500 rounded-full" /> Bookings
              </div>
              <div className="flex items-center gap-1">
                <span className="w-3 h-3 bg-red-500 rounded-full" /> Emergency
              </div>
            </div>
          </div>
          <div className="h-[300px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={demandData}>
                <defs>
                  <linearGradient
                    id="colorBookings"
                    x1="0"
                    y1="0"
                    x2="0"
                    y2="1"
                  >
                    <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.1} />
                    <stop offset="95%" stopColor="#3b82f6" stopOpacity={0} />
                  </linearGradient>
                  <linearGradient
                    id="colorEmergency"
                    x1="0"
                    y1="0"
                    x2="0"
                    y2="1"
                  >
                    <stop offset="5%" stopColor="#ef4444" stopOpacity={0.1} />
                    <stop offset="95%" stopColor="#ef4444" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid
                  strokeDasharray="3 3"
                  vertical={false}
                  stroke="#f1f5f9"
                />
                <XAxis
                  dataKey="day"
                  axisLine={false}
                  tickLine={false}
                  tick={{ fontSize: 12, fill: "#94a3b8" }}
                />
                <YAxis
                  axisLine={false}
                  tickLine={false}
                  tick={{ fontSize: 12, fill: "#94a3b8" }}
                />
                <Tooltip
                  contentStyle={{
                    borderRadius: "12px",
                    border: "none",
                    boxShadow: "0 10px 15px -3px rgb(0 0 0 / 0.1)",
                  }}
                />
                <Area
                  type="monotone"
                  dataKey="bookings"
                  stroke="#3b82f6"
                  strokeWidth={2}
                  fillOpacity={1}
                  fill="url(#colorBookings)"
                />
                <Area
                  type="monotone"
                  dataKey="emergency"
                  stroke="#ef4444"
                  strokeWidth={2}
                  fillOpacity={1}
                  fill="url(#colorEmergency)"
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </Card>

        <Card className="p-6 bg-zinc-900 text-white">
          <h2 className="text-xl font-bold mb-6">Admin Insights</h2>
          <div className="space-y-6">
            <div className="flex items-start gap-3">
              <div className="w-8 h-8 rounded-lg bg-blue-500/20 flex items-center justify-center text-blue-500">
                <AlertCircle size={18} />
              </div>
              <div>
                <p className="text-sm font-bold">Peak Demand Alert</p>
                <p className="text-xs text-zinc-400">
                  Demand is 40% higher on weekends. Consider incentivizing more
                  workers for Saturday shifts.
                </p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <div className="w-8 h-8 rounded-lg bg-green-500/20 flex items-center justify-center text-green-500">
                <CheckCircle size={18} />
              </div>
              <div>
                <p className="text-sm font-bold">Service Efficiency</p>
                <p className="text-xs text-zinc-400">
                  Average completion time has improved by 12 mins this week.
                </p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <div className="w-8 h-8 rounded-lg bg-purple-500/20 flex items-center justify-center text-purple-500">
                <Users size={18} />
              </div>
              <div>
                <p className="text-sm font-bold">Worker Retention</p>
                <p className="text-xs text-zinc-400">
                  Top 3 workers have maintained a 4.9+ rating for 30 consecutive
                  days.
                </p>
              </div>
            </div>
          </div>
          <Button className="w-full mt-8 bg-white text-black hover:bg-zinc-200">
            Generate Report
          </Button>
        </Card>
      </div>

      <div className="flex gap-2 mb-8 overflow-x-auto pb-2">
        {[
          "all",
          "emergency",
          "pending",
          "completed",
          "workers",
          "leaderboard",
        ].map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`px-6 py-2 rounded-xl font-bold text-sm uppercase transition-all ${activeTab === tab ? "bg-blue-600 text-white shadow-lg" : "bg-zinc-100 dark:bg-zinc-800 text-zinc-500"}`}
          >
            {tab}
          </button>
        ))}
      </div>

      <div className="space-y-4">
        {activeTab === "leaderboard" ? (
          <div className="space-y-6">
            <h2 className="text-xl font-bold">Worker Leaderboard & Rewards</h2>
            <div className="grid gap-4">
              {leaderboard.map((worker, index) => (
                <Card
                  key={worker._id}
                  className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4"
                >
                  <div className="flex items-center gap-4">
                    <div className="w-8 text-center font-black text-zinc-400">
                      {index === 0
                        ? "🥇"
                        : index === 1
                          ? "🥈"
                          : index === 2
                            ? "🥉"
                            : index + 1}
                    </div>
                    <img
                      src={
                        worker.userId?.profilePhoto ||
                        `https://api.dicebear.com/7.x/avataaars/svg?seed=${worker.userId?.name}`
                      }
                      alt={worker.userId?.name}
                      className="w-10 h-10 rounded-full bg-zinc-200"
                    />
                    <div>
                      <h4 className="font-bold">{worker.userId?.name}</h4>
                      <p className="text-xs text-zinc-500">
                        {worker.jobsCompleted} Jobs • {worker.rating} Rating •{" "}
                        {worker.points} Points
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-6">
                    <div className="text-right">
                      <p className="text-[10px] font-bold uppercase text-zinc-400">
                        Current Rewards
                      </p>
                      <p className="text-sm font-bold text-blue-600">
                        ₹{worker.incentives || 0} • {worker.gifts?.length || 0}{" "}
                        Gifts
                      </p>
                    </div>

                    {rewardingId === worker._id ? (
                      <div className="flex items-center gap-2">
                        <input
                          type="number"
                          placeholder="Incentive ₹"
                          className="w-24 px-2 py-1 rounded-lg border border-zinc-200 dark:border-zinc-800 text-sm"
                          value={rewardForm.incentives}
                          onChange={(e) =>
                            setRewardForm({
                              ...rewardForm,
                              incentives: Number(e.target.value),
                            })
                          }
                        />
                        <input
                          type="text"
                          placeholder="Gifts (comma separated)"
                          className="w-40 px-2 py-1 rounded-lg border border-zinc-200 dark:border-zinc-800 text-sm"
                          value={rewardForm.gifts}
                          onChange={(e) =>
                            setRewardForm({
                              ...rewardForm,
                              gifts: e.target.value,
                            })
                          }
                        />
                        <Button
                          size="sm"
                          onClick={() => handleReward(worker._id)}
                        >
                          Save
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => setRewardingId(null)}
                        >
                          X
                        </Button>
                      </div>
                    ) : (
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => {
                          setRewardingId(worker._id);
                          setRewardForm({
                            incentives: worker.incentives || 0,
                            gifts: worker.gifts?.join(", ") || "",
                          });
                        }}
                      >
                        Assign Reward
                      </Button>
                    )}
                  </div>
                </Card>
              ))}
            </div>
          </div>
        ) : activeTab === "workers" ? (
          <div className="grid md:grid-cols-2 gap-6">
            {workers.map((worker) => (
              <Card key={worker._id} className="space-y-4">
                <div className="flex items-center gap-4">
                  <img
                    src={
                      worker.userId?.profilePhoto ||
                      `https://api.dicebear.com/7.x/avataaars/svg?seed=${worker.userId?.name}`
                    }
                    alt={worker.userId?.name}
                    className="w-12 h-12 rounded-full bg-zinc-200"
                  />
                  <div>
                    <h4 className="font-bold text-lg">{worker.userId?.name}</h4>
                    <p className="text-sm text-zinc-500 flex items-center gap-2">
                      <Phone size={14} /> {worker.userId?.phone}
                    </p>
                  </div>
                  <span
                    className={`ml-auto px-2 py-1 rounded-md text-[10px] font-bold uppercase ${worker.availability ? "bg-green-100 text-green-600" : "bg-red-100 text-red-600"}`}
                  >
                    {worker.availability ? "Online" : "Offline"}
                  </span>
                </div>
                <div className="grid grid-cols-2 gap-4 pt-4 border-t border-zinc-100 dark:border-zinc-800">
                  <div>
                    <p className="text-[10px] font-bold uppercase text-zinc-400">
                      Skills
                    </p>
                    <p className="text-sm">
                      {worker.skills?.join(", ") || "General"}
                    </p>
                  </div>
                  <div>
                    <p className="text-[10px] font-bold uppercase text-zinc-400">
                      Experience
                    </p>
                    <p className="text-sm">{worker.experience} Years</p>
                  </div>
                  <div className="col-span-2">
                    <p className="text-[10px] font-bold uppercase text-zinc-400">
                      Address
                    </p>
                    <p className="text-sm">
                      {worker.address || "Not provided"}
                    </p>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        ) : (
          filteredBookings.map((booking) => (
            <Card
              key={booking._id}
              className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4"
            >
              <div className="flex items-center gap-4">
                <div
                  className={`w-10 h-10 rounded-lg flex items-center justify-center ${booking.type === "emergency" ? "bg-red-100 text-red-600" : "bg-blue-100 text-blue-600"}`}
                >
                  {booking.type === "emergency" ? (
                    <AlertCircle size={20} />
                  ) : (
                    <Clock size={20} />
                  )}
                </div>
                <div>
                  <h4 className="font-bold">{booking.serviceType}</h4>
                  <p className="text-sm text-zinc-500">
                    {booking.userId?.name} • {booking.userId?.phone}
                  </p>
                </div>
              </div>

              <div className="flex flex-col md:items-end">
                <p className="text-sm font-medium">
                  {formatDate(booking.date)}
                </p>
                <p className="text-xs text-zinc-400">{booking.address}</p>
              </div>

              <div className="flex items-center gap-4 w-full md:w-auto">
                <div className="flex flex-col items-end gap-1">
                  <span
                    className={`px-3 py-1 rounded-full text-xs font-bold uppercase ${
                      booking.status === "completed"
                        ? "bg-green-100 text-green-600"
                        : booking.status === "assigned"
                          ? "bg-blue-100 text-blue-600"
                          : "bg-yellow-100 text-yellow-600"
                    }`}
                  >
                    {booking.status}
                  </span>
                  {booking.status === "assigned" && (
                    <span
                      className={`px-2 py-0.5 rounded text-[10px] font-black uppercase ${
                        booking.workerStatus === "accepted"
                          ? "bg-green-500 text-white"
                          : booking.workerStatus === "rejected"
                            ? "bg-red-500 text-white"
                            : "bg-zinc-400 text-white"
                      }`}
                    >
                      {booking.workerStatus || "pending"}
                    </span>
                  )}
                </div>

                {assigningId === booking._id ? (
                  <div className="flex flex-col gap-2">
                    <div className="max-h-40 overflow-y-auto p-2 border border-zinc-200 dark:border-zinc-800 rounded-lg bg-white dark:bg-zinc-900 min-w-[200px]">
                      <p className="text-[10px] font-bold uppercase text-zinc-400 mb-2">
                        Select Workers (Smart Sorted)
                      </p>
                      {getSortedWorkers(booking).map((w, i) => (
                        <label
                          key={w._id}
                          className="flex items-center gap-2 p-1 hover:bg-zinc-50 dark:hover:bg-zinc-800 rounded cursor-pointer"
                        >
                          <input
                            type="checkbox"
                            checked={selectedWorkers.includes(w._id)}
                            onChange={() => toggleWorkerSelection(w._id)}
                            className="rounded border-zinc-300 text-blue-600 focus:ring-blue-500"
                          />
                          <div className="flex flex-col">
                            <span className="text-xs font-bold">
                              {w.userId?.name}{" "}
                              {i === 0 && booking.coordinates && (
                                <span className="text-[10px] text-green-600 ml-1">
                                  Closest
                                </span>
                              )}
                            </span>
                            {w.lastLocation && booking.coordinates && (
                              <span className="text-[10px] text-zinc-400">
                                {calculateDistance(
                                  booking.coordinates.lat,
                                  booking.coordinates.lng,
                                  w.lastLocation.lat,
                                  w.lastLocation.lng,
                                ).toFixed(1)}{" "}
                                km away
                              </span>
                            )}
                          </div>
                        </label>
                      ))}
                    </div>
                    <div className="flex gap-2">
                      <Button
                        size="sm"
                        className="flex-1"
                        onClick={() => handleAssign(booking._id)}
                      >
                        Send Invites
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => {
                          setAssigningId(null);
                          setSelectedWorkers([]);
                        }}
                      >
                        Cancel
                      </Button>
                    </div>
                  </div>
                ) : (
                  <Button
                    variant={
                      booking.workerStatus === "rejected"
                        ? "primary"
                        : "outline"
                    }
                    size="sm"
                    onClick={() => setAssigningId(booking._id)}
                  >
                    {booking.workerStatus === "rejected"
                      ? "Reassign"
                      : booking.workerId
                        ? "Change"
                        : "Assign"}
                  </Button>
                )}
              </div>
            </Card>
          ))
        )}
      </div>
    </div>
  );
};
