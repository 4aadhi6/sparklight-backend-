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
import {
  Zap,
  Droplets,
  Wrench,
  Calendar,
  Clock,
  MapPin,
  Sparkles,
} from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
const API = import.meta.env.VITE_API_URL;

import { SmartDiagnosis } from "../components/SmartDiagnosis";

const schema = z.object({
  serviceType: z.enum([
    "Electrical",
    "Plumbing",
    "Home Repair",
    "Cleaning",
    "Other",
  ]),
  details: z.string().min(10, "Please provide more details"),
  address: z.string().min(10, "Invalid address"),
  date: z.string(),
  timeSlot: z.string().optional(),
});

const services = [
  { id: "Electrical", icon: <Zap />, label: "Electrical" },
  { id: "Plumbing", icon: <Droplets />, label: "Plumbing" },
  { id: "Home Repair", icon: <Wrench />, label: "Home Repair" },
  { id: "Cleaning", icon: <Calendar />, label: "Cleaning" },
];

export const BookingPage: React.FC = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(false);
  const [selectedService, setSelectedService] = useState("");
  const [coords, setCoords] = useState<{ lat: number; lng: number } | null>(
    null,
  );
  const [showAI, setShowAI] = useState(false);

  const {
    register,
    handleSubmit,
    setValue,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(schema),
    defaultValues: {
      address: user?.addresses?.[0]?.address || "",
      date: new Date().toISOString().split("T")[0],
    },
  });

  const handleAIDiagnosis = (category: string, details: string) => {
    const validCategory = [
      "Electrical",
      "Plumbing",
      "Home Repair",
      "Cleaning",
    ].includes(category)
      ? category
      : "Other";

    setSelectedService(validCategory);
    setValue("serviceType", validCategory as any);
    setValue("details", details);
    setShowAI(false);
    toast.success(`AI suggested: ${category}`);
  };

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
      const bookingRes = await axios.post(`${API}/api/bookings`, {
        ...data,
        type: "pre",
        coordinates: coords,
      });
      const booking = bookingRes.data;

      // 2. Load Razorpay
      const res = await loadRazorpay();
      if (!res) {
        toast.error("Razorpay SDK failed to load. Are you online?");
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
        name: "Spark Light",
        description: "Booking Advance Payment",
        order_id: order.id,
        handler: async (response: any) => {
          try {
            await axios.post(`${API}/api/payments/verify`, {
              ...response,
              bookingId: booking._id,
            });
            toast.success("Booking confirmed successfully!");
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
          color: "#2563eb",
        },
        modal: {
          ondismiss: async () => {
            try {
              const res = await axios.post(`${API}/api/payments/cance`, {
                bookingId: booking._id,
              });
              if (res.data.message.includes("actually successful")) {
                toast.success("Payment detected! Booking confirmed.");
                navigate("/dashboard");
              } else {
                toast.error("Payment cancelled");
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
      toast.error(err.response?.data?.message || "Booking failed");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen pt-24 pb-12 px-4 max-w-3xl mx-auto">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold">Book a Service</h1>
        <Button
          variant="outline"
          className="gap-2 border-primary/50 text-primary hover:bg-primary/10"
          onClick={() => setShowAI(!showAI)}
        >
          <Sparkles className="w-4 h-4" />
          {showAI ? "Hide AI Diagnosis" : "Smart Diagnosis"}
        </Button>
      </div>

      <AnimatePresence>
        {showAI && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="overflow-hidden mb-8"
          >
            <SmartDiagnosis onSelect={handleAIDiagnosis} />
          </motion.div>
        )}
      </AnimatePresence>

      <Card className="p-8">
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-8">
          {/* Service Selection */}
          <div className="space-y-4">
            <label className="text-sm font-bold uppercase tracking-wider text-zinc-500">
              Select Service
            </label>
            <div className="grid grid-cols-3 gap-4">
              {services.map((s) => (
                <label key={s.id} className="cursor-pointer">
                  <input
                    {...register("serviceType")}
                    type="radio"
                    value={s.id}
                    className="hidden peer"
                    onChange={(e) => {
                      setSelectedService(e.target.value);
                      setValue("serviceType", e.target.value as any);
                    }}
                  />
                  <div className="p-4 flex flex-col items-center gap-2 rounded-2xl border-2 border-zinc-100 dark:border-zinc-800 peer-checked:border-blue-500 peer-checked:bg-blue-50 dark:peer-checked:bg-blue-900/20 transition-all">
                    <div className="text-2xl">{s.icon}</div>
                    <span className="text-sm font-medium">{s.label}</span>
                  </div>
                </label>
              ))}
            </div>
            {errors.serviceType && (
              <p className="text-red-500 text-xs">
                {errors.serviceType.message as string}
              </p>
            )}
          </div>

          {/* Details */}
          <div className="space-y-2">
            <label className="text-sm font-bold uppercase tracking-wider text-zinc-500">
              Service Details
            </label>
            <textarea
              {...register("details")}
              className="w-full p-4 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 focus:ring-2 focus:ring-blue-500 outline-none min-h-[120px]"
              placeholder="Describe the issue or service needed..."
            />
            {errors.details && (
              <p className="text-red-500 text-xs">
                {errors.details.message as string}
              </p>
            )}
          </div>

          {/* Address */}
          <div className="space-y-2">
            <div className="flex justify-between items-center">
              <label className="text-sm font-bold uppercase tracking-wider text-zinc-500">
                Service Address
              </label>
              <button
                type="button"
                onClick={getCurrentLocation}
                className="text-xs font-bold text-blue-600 flex items-center gap-1 hover:underline"
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
                className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 focus:ring-2 focus:ring-blue-500 outline-none"
                placeholder="Enter full address in Kannur"
              />
            </div>
            {errors.address && (
              <p className="text-red-500 text-xs">
                {errors.address.message as string}
              </p>
            )}
          </div>

          {/* Date & Time */}
          <div className="grid md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <label className="text-sm font-bold uppercase tracking-wider text-zinc-500">
                Preferred Date
              </label>
              <div className="relative">
                <Calendar
                  className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400"
                  size={18}
                />
                <input
                  {...register("date")}
                  type="date"
                  className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 focus:ring-2 focus:ring-blue-500 outline-none"
                />
              </div>
            </div>
            <div className="space-y-2">
              <label className="text-sm font-bold uppercase tracking-wider text-zinc-500">
                Time Slot
              </label>
              <div className="relative">
                <Clock
                  className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400"
                  size={18}
                />
                <select
                  {...register("timeSlot")}
                  className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 focus:ring-2 focus:ring-blue-500 outline-none appearance-none"
                >
                  <option value="Morning (9AM - 12PM)">
                    Morning (9AM - 12PM)
                  </option>
                  <option value="Afternoon (12PM - 4PM)">
                    Afternoon (12PM - 4PM)
                  </option>
                  <option value="Evening (4PM - 8PM)">
                    Evening (4PM - 8PM)
                  </option>
                </select>
              </div>
            </div>
          </div>

          <div className="pt-4">
            <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-xl mb-6 border border-blue-100 dark:border-blue-800">
              <div className="flex justify-between items-center mb-2">
                <span className="text-sm text-zinc-600 dark:text-zinc-400">
                  Booking Advance
                </span>
                <span className="font-bold">₹99.00</span>
              </div>
              <p className="text-[10px] text-zinc-500 uppercase font-bold">
                Non-refundable confirmation fee
              </p>
            </div>
            <Button type="submit" className="w-full" isLoading={isLoading}>
              Pay ₹99 & Confirm Booking
            </Button>
          </div>
        </form>
      </Card>
    </div>
  );
};
