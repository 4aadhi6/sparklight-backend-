import React, { useEffect, useState } from "react";
import { useAuth } from "../context/AuthContext";
import { Card } from "../components/ui/Card";
import { Button } from "../components/ui/Button";
import { Plus, Clock, CheckCircle, AlertCircle, MapPin } from "lucide-react";
import axios from "axios";
import { formatDate, formatCurrency } from "../utils/utils";
import { Link } from "react-router-dom";
const API = import.meta.env.VITE_API_URL;
import { WorkerTracker } from "../components/WorkerTracker";

export const Dashboard: React.FC = () => {
  const { user } = useAuth();
  const [bookings, setBookings] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchBookings = async () => {
      try {
        const res = await axios.get(`${API}/api/bookings/my-bookings`);
        setBookings(res.data);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchBookings();
  }, []);

  const getStatusIcon = (status: string, paymentStatus: string) => {
    if (paymentStatus === "failed")
      return <AlertCircle className="text-red-500" size={18} />;
    if (paymentStatus === "pending")
      return <Clock className="text-yellow-500" size={18} />;

    switch (status) {
      case "completed":
        return <CheckCircle className="text-green-500" size={18} />;
      case "pending":
        return <Clock className="text-yellow-500" size={18} />;
      case "assigned":
        return <AlertCircle className="text-blue-500" size={18} />;
      case "on-the-way":
        return <MapPin className="text-blue-500 animate-bounce" size={18} />;
      case "cancelled":
        return <AlertCircle className="text-red-500" size={18} />;
      default:
        return <Clock className="text-zinc-400" size={18} />;
    }
  };

  return (
    <div className="min-h-screen pt-24 pb-12 px-4 max-w-7xl mx-auto">
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="text-3xl font-bold">Hello, {user?.name}</h1>
          <p className="text-zinc-500">
            Manage your service bookings and profile
          </p>
        </div>
        <div className="flex items-center gap-4">
          <Link to="/emergency">
            <Button
              variant="danger"
              className="flex items-center gap-2 animate-pulse"
            >
              <AlertCircle size={20} /> Emergency Help
            </Button>
          </Link>
          <Link to="/book">
            <Button className="flex items-center gap-2">
              <Plus size={20} /> New Booking
            </Button>
          </Link>
        </div>
      </div>

      <div className="grid lg:grid-cols-3 gap-8">
        {/* Active Tracking */}
        {bookings.filter((b) => b.status === "on-the-way").length > 0 && (
          <div className="lg:col-span-3 space-y-4">
            <h2 className="text-xl font-bold flex items-center gap-2">
              <MapPin className="text-primary" /> Active Tracking
            </h2>
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {bookings
                .filter((b) => b.status === "on-the-way")
                .map((b) => (
                  <WorkerTracker
                    key={b._id}
                    userLocation={
                      b.coordinates || { lat: 12.9716, lng: 77.5946 }
                    }
                    workerName={b.workerId?.name || "Worker"}
                  />
                ))}
            </div>
          </div>
        )}

        {/* Recent Bookings */}
        <div className="lg:col-span-2 space-y-6">
          <h2 className="text-xl font-bold">Recent Bookings</h2>
          {loading ? (
            <div className="space-y-4">
              {[1, 2, 3].map((i) => (
                <div key={i} className="h-24 glass rounded-2xl animate-pulse" />
              ))}
            </div>
          ) : bookings.length > 0 ? (
            bookings.map((booking) => (
              <Card
                key={booking._id}
                className="flex items-center justify-between gap-4"
              >
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-blue-100 dark:bg-blue-900/30 rounded-xl flex items-center justify-center text-blue-600">
                    {booking.serviceType === "Electrical"
                      ? "⚡"
                      : booking.serviceType === "Plumbing"
                        ? "💧"
                        : "🛠️"}
                  </div>
                  <div>
                    <h3 className="font-bold">{booking.serviceType}</h3>
                    <p className="text-sm text-zinc-500 flex items-center gap-1">
                      <MapPin size={14} /> {booking.address}
                    </p>
                    <p className="text-xs text-zinc-400 mt-1">
                      {formatDate(booking.date)}
                    </p>
                  </div>
                </div>
                <div className="text-right">
                  <div className="flex items-center gap-2 justify-end mb-1">
                    {getStatusIcon(booking.status, booking.paymentStatus)}
                    <span className="text-sm font-medium capitalize">
                      {booking.status === "cancelled"
                        ? "Cancelled"
                        : booking.paymentStatus === "paid"
                          ? booking.status
                          : booking.paymentStatus === "failed"
                            ? "Payment Failed"
                            : `Payment ${booking.paymentStatus}`}
                    </span>
                  </div>
                  <p className="text-sm font-bold text-blue-600">
                    {formatCurrency(booking.advancePaid)}
                  </p>
                  {booking.status === "completed" && (
                    <Link
                      to={`/invoice/${booking._id}`}
                      className="text-xs text-blue-600 hover:underline mt-2 block"
                    >
                      View Invoice
                    </Link>
                  )}
                </div>
              </Card>
            ))
          ) : (
            <Card className="text-center py-12">
              <p className="text-zinc-500 mb-4">No bookings found</p>
              <Link to="/book">
                <Button variant="outline" size="sm">
                  Book your first service
                </Button>
              </Link>
            </Card>
          )}
        </div>

        {/* Sidebar Info */}
        <div className="space-y-8">
          <Card>
            <h3 className="font-bold mb-4">Profile Info</h3>
            <div className="space-y-4">
              <div className="flex items-center gap-4 mb-4">
                <img
                  src={
                    user?.profilePhoto ||
                    `https://api.dicebear.com/7.x/avataaars/svg?seed=${user?.name}`
                  }
                  alt={user?.name}
                  className="w-12 h-12 rounded-full bg-zinc-200"
                />
                <div>
                  <p className="font-bold">{user?.name}</p>
                  <p className="text-xs text-zinc-500">{user?.phone}</p>
                </div>
              </div>
              <div>
                <p className="text-xs text-zinc-500 uppercase font-bold tracking-wider">
                  Default Address
                </p>
                <p className="font-medium text-sm line-clamp-2">
                  {user?.addresses?.[0]?.address || "No address added"}
                </p>
              </div>
              <Link to="/profile" className="block">
                <Button variant="outline" size="sm" className="w-full">
                  Edit Profile
                </Button>
              </Link>
            </div>
          </Card>

          <Card className="bg-gradient-to-br from-blue-600 to-purple-600 text-white border-none">
            <h3 className="font-bold mb-2">Need Help?</h3>
            <p className="text-sm text-white/80 mb-4">
              Our support team is available 24/7 for any queries.
            </p>
            <Button className="w-full bg-white text-blue-600 hover:bg-zinc-100">
              Contact Support
            </Button>
          </Card>
        </div>
      </div>
    </div>
  );
};
