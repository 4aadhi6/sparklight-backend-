import React, { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { Button } from "../components/ui/Button";
import { Card } from "../components/ui/Card";
import { toast } from "sonner";
import { AlertTriangle, MapPin, Zap, Droplets, Wrench } from "lucide-react";
const API = import.meta.env.VITE_API_URL;

const schema = z.object({
  serviceType: z.enum([
    "Electrical",
    "Plumbing",
    "Home Repair",
    "Cleaning",
    "Other",
  ]),
  details: z.string().min(5, "Please describe the emergency"),
  address: z.string().min(10, "Invalid address"),
});

export const EmergencyBooking: React.FC = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(false);
  const [coords, setCoords] = useState<{ lat: number; lng: number } | null>(
    null,
  );

  const {
    register,
    handleSubmit,
    setValue,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(schema),
    defaultValues: {
      address: user?.addresses?.[0]?.address || "",
    },
  });

  const getCurrentLocation = () => {
    if (!navigator.geolocation) {
      toast.error("Geolocation is not supported by your browser");
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (position) => {
        const { latitude, longitude } = position.coords;
        setCoords({ lat: latitude, lng: longitude });
        toast.success("Location captured successfully!");
      },
      (error) => {
        toast.error("Error getting location: " + error.message);
      },
    );
  };

  const loadRazorpay = () => {
    return new Promise((resolve) => {
      const script = document.createElement("script");
      script.src = "https://checkout.razorpay.com/v1/checkout.js";
      script.onload = () => resolve(true);
      script.onerror = () => resolve(false);
      document.body.appendChild(script);
    });
  };

  const onSubmit = async (data: any) => {
    setIsLoading(true);
    try {
      // 1. Create Booking
      const bookingData = {
        ...data,
        type: "emergency",
        date: new Date(),
        advancePaid: 99,
        coordinates: coords,
      };

      const bookingRes = await axios.post(`${API}/api/bookin`, bookingData);
      const booking = bookingRes.data;

      // 2. Load Razorpay
      const sdkLoaded = await loadRazorpay();
      if (!sdkLoaded) {
        toast.error("Payment SDK failed to load. Are you online?");
        return;
      }

      // 3. Create Order
      const orderRes = await axios.post(`${API}/api/payments/create-order`, {
        amount: 99,
        bookingId: booking._id,
        userId: user.id,
      });
      const order = orderRes.data;

      // 4. Open Razorpay
      const options = {
        key: "rzp_test_SXKBlcZ3TmB0Ea",
        amount: order.amount,
        currency: order.currency,
        name: "Spark Light Emergency",
        description: "Emergency Booking Advance",
        order_id: order.id,
        handler: async (response: any) => {
          try {
            await axios.post(`${API}/api/payments/verify`, {
              ...response,
              bookingId: booking._id,
            });
            toast.success(
              "Emergency request sent! A worker will be assigned immediately.",
            );
            navigate("/dashboard");
          } catch (err) {
            toast.error("Payment verification failed");
          }
        },
        prefill: {
          name: user.name,
          contact: user.phone,
        },
        theme: {
          color: "#ef4444",
        },
        modal: {
          ondismiss: async () => {
            try {
              const res = await axios.post(`${API}/api/payments/cancel`, {
                bookingId: booking._id,
              });
              if (res.data.message.includes("actually successful")) {
                toast.success("Payment detected! Emergency request confirmed.");
                navigate("/dashboard");
              } else {
                toast.error("Emergency payment cancelled");
              }
            } catch (err) {
              console.error(err);
            }
          },
        },
      };

      const paymentObject = new (window as any).Razorpay(options);
      paymentObject.open();
    } catch (err: any) {
      toast.error(err.response?.data?.message || "Request failed");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen pt-24 pb-12 px-4 max-w-2xl mx-auto">
      <Card className="border-2 border-red-500/20">
        <div className="flex items-center gap-3 mb-6 text-red-600">
          <AlertTriangle size={32} className="animate-pulse" />
          <h1 className="text-3xl font-bold">Emergency Help</h1>
        </div>

        <p className="text-zinc-500 mb-8">
          Instant priority service for urgent issues. Our team will reach you as
          soon as possible.
        </p>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          <div className="space-y-4">
            <label className="text-sm font-bold uppercase tracking-wider text-zinc-500">
              Emergency Type
            </label>
            <div className="grid grid-cols-3 gap-4">
              {["Electrical", "Plumbing", "Home Repair"].map((type) => (
                <label key={type} className="cursor-pointer">
                  <input
                    {...register("serviceType")}
                    type="radio"
                    value={type}
                    className="hidden peer"
                  />
                  <div className="p-4 flex flex-col items-center gap-2 rounded-2xl border-2 border-zinc-100 dark:border-zinc-800 peer-checked:border-red-500 peer-checked:bg-red-50 dark:peer-checked:bg-red-900/20 transition-all">
                    <span className="text-sm font-medium">{type}</span>
                  </div>
                </label>
              ))}
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-bold uppercase tracking-wider text-zinc-500">
              What's the emergency?
            </label>
            <textarea
              {...register("details")}
              className="w-full p-4 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 focus:ring-2 focus:ring-red-500 outline-none min-h-[100px]"
              placeholder="Briefly describe the issue..."
            />
          </div>

          <div className="space-y-2">
            <div className="flex justify-between items-center">
              <label className="text-sm font-bold uppercase tracking-wider text-zinc-500">
                Current Location
              </label>
              <button
                type="button"
                onClick={getCurrentLocation}
                className="text-xs font-bold text-red-600 flex items-center gap-1 hover:underline"
              >
                <MapPin size={14} />
                {coords ? "Location Captured" : "Get Current Location"}
              </button>
            </div>
            <div className="relative">
              <MapPin
                className="absolute left-3 top-3 text-zinc-400"
                size={18}
              />
              <textarea
                {...register("address")}
                className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 focus:ring-2 focus:ring-red-500 outline-none"
                placeholder="Where should we come?"
              />
            </div>
          </div>

          <div className="pt-4">
            <div className="bg-red-50 dark:bg-red-900/20 p-4 rounded-xl mb-6 border border-red-100 dark:border-red-800">
              <div className="flex justify-between items-center mb-2">
                <span className="text-sm text-zinc-600 dark:text-zinc-400">
                  Emergency Advance
                </span>
                <span className="font-bold text-red-600">₹99.00</span>
              </div>
              <p className="text-[10px] text-zinc-500 uppercase font-bold">
                Priority dispatch fee
              </p>
            </div>
            <Button
              type="submit"
              variant="danger"
              className="w-full py-4 text-lg animate-glow"
              isLoading={isLoading}
            >
              Pay ₹99 & Request Help
            </Button>
            <p className="text-center text-xs text-zinc-400 mt-4">
              * ₹99 advance is required for emergency dispatch
            </p>
          </div>
        </form>
      </Card>
    </div>
  );
};
