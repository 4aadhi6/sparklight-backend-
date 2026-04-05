import React, { useEffect, useState } from "react";
import { useAuth } from "../context/AuthContext";
import { Card } from "../components/ui/Card";
import { Button } from "../components/ui/Button";
import {
  CheckCircle,
  Clock,
  MapPin,
  Phone,
  Star,
  TrendingUp,
  CheckCircle2,
} from "lucide-react";
import axios from "axios";
import { formatDate, formatCurrency } from "../utils/utils";
import { toast } from "sonner";
const API = import.meta.env.VITE_API_URL;
export const WorkerDashboard: React.FC = () => {
  const { user } = useAuth();
  const [worker, setWorker] = useState<any>(null);
  const [jobs, setJobs] = useState<any[]>([]);
  const [leaderboard, setLeaderboard] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const [editForm, setEditForm] = useState({
    skills: "",
    experience: 0,
    address: "",
  });

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [workerRes, jobsRes, leaderboardRes] = await Promise.all([
          axios.get(`${API}/api/workers/profile`),
          axios.get(`${API}/api/workers/jobs`),
          axios.get(`${API}/api/workers/leaderboard`),
        ]);
        setWorker(workerRes.data);
        setJobs(jobsRes.data);
        setLeaderboard(leaderboardRes.data);
        setEditForm({
          skills: workerRes.data?.skills?.join(", ") || "",
          experience: workerRes.data?.experience || 0,
          address: workerRes.data?.address || "",
        });
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const toggleAvailability = async () => {
    try {
      const res = await axios.patch(`${API}/api/workers/availability`, {
        availability: !worker.availability,
      });
      setWorker(res.data);
      toast.success(
        `Availability updated to ${!worker.availability ? "Online" : "Offline"}`,
      );
    } catch (err) {
      toast.error("Failed to update availability");
    }
  };

  const handleUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const skillsArray = editForm.skills
        .split(",")
        .map((s) => s.trim())
        .filter((s) => s !== "");
      const res = await axios.patch(`${API}/api/workers/profile`, {
        skills: skillsArray,
        experience: Number(editForm.experience),
        address: editForm.address,
      });
      setWorker(res.data);
      setIsEditing(false);
      toast.success("Profile updated successfully");
    } catch (err) {
      toast.error("Failed to update profile");
    }
  };

  const updateJobStatus = async (
    jobId: string,
    status: "accepted" | "rejected",
  ) => {
    try {
      const res = await axios.patch(`${API}/api/workers/jobs/${jobId}/status`, {
        status,
      });
      setJobs(jobs.map((j) => (j._id === jobId ? res.data : j)));
      toast.success(`Job ${status} successfully`);
    } catch (err) {
      toast.error(`Failed to ${status} job`);
    }
  };

  const completeJob = async (jobId: string) => {
    try {
      await axios.patch(`${API}/api/bookings/${jobId}/status`, {
        status: "completed",
      });
      setJobs(
        jobs.map((j) => (j._id === jobId ? { ...j, status: "completed" } : j)),
      );
      toast.success("Job marked as completed");
    } catch (err) {
      toast.error("Failed to update job status");
    }
  };

  if (loading) return <div className="pt-24 text-center">Loading...</div>;

  return (
    <div className="min-h-screen pt-24 pb-12 px-4 max-w-7xl mx-auto">
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="text-3xl font-bold">Worker Portal</h1>
          <p className="text-zinc-500">Manage your jobs and availability</p>
        </div>
        <div className="flex items-center gap-4">
          <Button onClick={() => setIsEditing(!isEditing)} variant="outline">
            {isEditing ? "Cancel Editing" : "Edit Profile"}
          </Button>
          <div className="flex items-center gap-2">
            <span
              className={`w-3 h-3 rounded-full ${worker?.availability ? "bg-green-500" : "bg-red-500"}`}
            />
            <span className="text-sm font-medium">
              {worker?.availability ? "Online" : "Offline"}
            </span>
          </div>
          <Button
            onClick={toggleAvailability}
            variant={worker?.availability ? "outline" : "primary"}
          >
            Go {worker?.availability ? "Offline" : "Online"}
          </Button>
        </div>
      </div>

      {isEditing && (
        <Card className="mb-8 p-6">
          <h2 className="text-xl font-bold mb-4">Edit Professional Profile</h2>
          <form
            onSubmit={handleUpdateProfile}
            className="grid md:grid-cols-2 gap-6"
          >
            <div className="space-y-2">
              <label className="text-sm font-medium">
                Skills (comma separated)
              </label>
              <input
                type="text"
                value={editForm.skills}
                onChange={(e) =>
                  setEditForm({ ...editForm, skills: e.target.value })
                }
                className="w-full px-4 py-2 rounded-lg border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900"
                placeholder="e.g. Electrical, Wiring, Repairs"
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Experience (Years)</label>
              <input
                type="number"
                value={editForm.experience}
                onChange={(e) =>
                  setEditForm({
                    ...editForm,
                    experience: Number(e.target.value),
                  })
                }
                className="w-full px-4 py-2 rounded-lg border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900"
              />
            </div>
            <div className="space-y-2 md:col-span-2">
              <label className="text-sm font-medium">
                Professional Address
              </label>
              <textarea
                value={editForm.address}
                onChange={(e) =>
                  setEditForm({ ...editForm, address: e.target.value })
                }
                className="w-full px-4 py-2 rounded-lg border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900"
                placeholder="Enter your professional address"
              />
            </div>
            <div className="md:col-span-2">
              <Button type="submit">Save Changes</Button>
            </div>
          </form>
        </Card>
      )}

      <div className="grid lg:grid-cols-4 gap-8 mb-12">
        <Card className="text-center">
          <TrendingUp className="mx-auto mb-2 text-blue-600" />
          <h3 className="text-2xl font-bold">{worker?.jobsCompleted || 0}</h3>
          <p className="text-xs text-zinc-500 uppercase font-bold">Jobs Done</p>
        </Card>
        <Card className="text-center">
          <Star className="mx-auto mb-2 text-yellow-500" />
          <h3 className="text-2xl font-bold">{worker?.rating || 5.0}</h3>
          <p className="text-xs text-zinc-500 uppercase font-bold">Rating</p>
        </Card>
        <Card className="text-center">
          <CheckCircle className="mx-auto mb-2 text-green-500" />
          <h3 className="text-2xl font-bold">Active</h3>
          <p className="text-xs text-zinc-500 uppercase font-bold">Status</p>
        </Card>
        <Card className="text-center">
          <Clock className="mx-auto mb-2 text-purple-600" />
          <h3 className="text-2xl font-bold">{worker?.experience || 0} Yrs</h3>
          <p className="text-xs text-zinc-500 uppercase font-bold">
            Experience
          </p>
        </Card>
      </div>

      {worker?.badges && worker.badges.length > 0 && (
        <div className="flex flex-wrap gap-2 mb-8">
          {worker.badges.map((badge: string) => (
            <span
              key={badge}
              className="px-3 py-1 bg-yellow-100 text-yellow-700 rounded-full text-xs font-bold border border-yellow-200 flex items-center gap-1"
            >
              🏆 {badge}
            </span>
          ))}
        </div>
      )}

      <div className="grid lg:grid-cols-3 gap-8 mb-12">
        <div className="lg:col-span-2 space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-bold">Worker Leaderboard</h2>
            <span className="text-xs font-bold text-blue-600 uppercase tracking-widest">
              Top Performers
            </span>
          </div>
          <Card className="p-0 overflow-hidden border-none bg-zinc-50 dark:bg-zinc-900/50">
            <div className="divide-y divide-zinc-100 dark:divide-zinc-800">
              {leaderboard.map((item, index) => (
                <div
                  key={item._id}
                  className={`flex items-center gap-4 p-4 ${item.userId?._id === user?.id ? "bg-blue-500/10 border-l-4 border-blue-500" : ""}`}
                >
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
                      item.userId?.profilePhoto ||
                      `https://api.dicebear.com/7.x/avataaars/svg?seed=${item.userId?.name}`
                    }
                    alt={item.userId?.name}
                    className="w-10 h-10 rounded-full bg-zinc-200"
                  />
                  <div className="flex-1">
                    <p className="font-bold text-sm">
                      {item.userId?.name}{" "}
                      {item.userId?._id === user?.id && (
                        <span className="text-[10px] bg-blue-600 text-white px-1.5 py-0.5 rounded ml-2">
                          YOU
                        </span>
                      )}
                    </p>
                    <p className="text-xs text-zinc-500">
                      {item.jobsCompleted} Jobs • {item.rating} Rating
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="font-black text-blue-600">
                      {item.points} pts
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </Card>
        </div>

        <div className="space-y-6">
          <h2 className="text-xl font-bold">My Rewards</h2>
          <Card className="bg-gradient-to-br from-blue-600 to-purple-600 text-white border-none p-6 relative overflow-hidden">
            <div className="absolute top-0 right-0 p-4 opacity-20">
              <Star size={80} />
            </div>
            <div className="relative z-10">
              <p className="text-xs font-bold uppercase tracking-widest mb-1 opacity-80">
                Current Incentives
              </p>
              <h3 className="text-4xl font-black mb-6">
                ₹{worker?.incentives || 0}
              </h3>

              <p className="text-xs font-bold uppercase tracking-widest mb-3 opacity-80">
                Earned Gifts
              </p>
              <div className="space-y-2">
                {worker?.gifts && worker.gifts.length > 0 ? (
                  worker.gifts.map((gift: string, i: number) => (
                    <div
                      key={i}
                      className="flex items-center gap-2 bg-white/10 p-2 rounded-lg text-sm"
                    >
                      <CheckCircle2 size={16} className="text-green-300" />{" "}
                      {gift}
                    </div>
                  ))
                ) : (
                  <p className="text-sm opacity-60 italic">
                    No gifts earned yet. Reach the top 3 to win!
                  </p>
                )}
              </div>
            </div>
          </Card>
          <Card className="p-4 bg-zinc-50 dark:bg-zinc-900/50 border-dashed border-2 border-zinc-200 dark:border-zinc-800">
            <p className="text-xs text-zinc-500 leading-relaxed text-center">
              Complete more jobs and maintain a high rating to climb the
              leaderboard and earn special incentives and gifts!
            </p>
          </Card>
        </div>
      </div>

      <div className="space-y-6">
        <h2 className="text-xl font-bold">Assigned Jobs</h2>
        {jobs.length > 0 ? (
          <div className="grid md:grid-cols-2 gap-6">
            {jobs.map((job) => (
              <Card key={job._id} className="space-y-4">
                <div className="flex justify-between items-start">
                  <div>
                    <span
                      className={`px-2 py-1 rounded-md text-[10px] font-bold uppercase ${job.type === "emergency" ? "bg-red-100 text-red-600" : "bg-blue-100 text-blue-600"}`}
                    >
                      {job.type}
                    </span>
                    <h3 className="text-lg font-bold mt-2">
                      {job.serviceType}
                    </h3>
                  </div>
                  <span
                    className={`text-sm font-medium capitalize px-2 py-1 rounded-lg ${
                      job.status === "completed"
                        ? "bg-green-100 text-green-600"
                        : "bg-zinc-100 dark:bg-zinc-800"
                    }`}
                  >
                    {job.status}
                  </span>
                </div>
                <p className="text-sm text-zinc-500">{job.details}</p>

                <div className="p-4 bg-zinc-50 dark:bg-zinc-900/50 rounded-xl border border-zinc-100 dark:border-zinc-800 space-y-3">
                  <p className="text-xs font-bold uppercase text-zinc-400">
                    Customer Details
                  </p>
                  <div className="flex items-center gap-3">
                    <img
                      src={
                        job.userId?.profilePhoto ||
                        `https://api.dicebear.com/7.x/avataaars/svg?seed=${job.userId?.name}`
                      }
                      alt={job.userId?.name}
                      className="w-10 h-10 rounded-full bg-zinc-200"
                    />
                    <div>
                      <p className="text-sm font-bold">{job.userId?.name}</p>
                      <p className="text-xs text-zinc-500">
                        {job.userId?.phone}
                      </p>
                    </div>
                  </div>
                  <div className="space-y-2 pt-2 border-t border-zinc-100 dark:border-zinc-800">
                    <p className="text-sm flex items-center gap-2">
                      <MapPin size={16} className="text-zinc-400" />{" "}
                      {job.address}
                    </p>
                    {job.coordinates && (
                      <a
                        href={`https://www.google.com/maps?q=${job.coordinates.lat},${job.coordinates.lng}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-xs font-bold text-blue-600 flex items-center gap-1 hover:underline"
                      >
                        <MapPin size={14} /> View Exact Location on Google Maps
                      </a>
                    )}
                    <p className="text-sm flex items-center gap-2">
                      <Clock size={16} className="text-zinc-400" />{" "}
                      {formatDate(job.date)} {job.timeSlot}
                    </p>
                  </div>
                </div>

                <div className="flex gap-4 pt-2">
                  {job.workerStatus === "pending" ? (
                    <>
                      <Button
                        className="flex-1 bg-green-600 hover:bg-green-700"
                        size="sm"
                        onClick={() => updateJobStatus(job._id, "accepted")}
                      >
                        Accept Job
                      </Button>
                      <Button
                        className="flex-1 bg-red-600 hover:bg-red-700"
                        size="sm"
                        onClick={() => updateJobStatus(job._id, "rejected")}
                      >
                        Reject Job
                      </Button>
                    </>
                  ) : job.workerStatus === "accepted" &&
                    job.status !== "completed" ? (
                    <Button
                      className="flex-1"
                      size="sm"
                      onClick={() => completeJob(job._id)}
                    >
                      Complete Job
                    </Button>
                  ) : job.workerStatus === "rejected" ? (
                    <p className="text-sm font-bold text-red-600 bg-red-50 px-3 py-1 rounded-lg w-full text-center">
                      You rejected this job
                    </p>
                  ) : job.status === "completed" ? (
                    <p className="text-sm font-bold text-green-600 bg-green-50 px-3 py-1 rounded-lg w-full text-center">
                      Job Completed
                    </p>
                  ) : null}

                  {job.workerStatus === "accepted" && (
                    <a
                      href={`tel:${job.userId?.phone}`}
                      className="inline-flex items-center justify-center p-2 rounded-lg border border-zinc-200 dark:border-zinc-800 hover:bg-zinc-50 dark:hover:bg-zinc-900 transition-colors"
                    >
                      <Phone size={18} className="text-blue-600" />
                    </a>
                  )}
                </div>
              </Card>
            ))}
          </div>
        ) : (
          <Card className="text-center py-12">
            <p className="text-zinc-500">
              No jobs assigned yet. Stay online to receive requests!
            </p>
          </Card>
        )}
      </div>
    </div>
  );
};
