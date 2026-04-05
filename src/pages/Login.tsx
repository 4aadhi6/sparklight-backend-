import React from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Link, useNavigate } from "react-router-dom";
import axios from "axios";
import { useAuth } from "../context/AuthContext";
import { Button } from "../components/ui/Button";
import { Card } from "../components/ui/Card";
import { toast } from "sonner";
import { Phone, Lock, ArrowRight } from "lucide-react";
const API = import.meta.env.VITE_API_URL;

const schema = z.object({
  phone: z.string().min(10, "Invalid phone number"),
  password: z.string().min(6, "Password must be at least 6 characters"),
});

export const Login: React.FC = () => {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = React.useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(schema),
  });

  const onSubmit = async (data: any) => {
    setIsLoading(true);
    try {
      const res = await axios.post(`${API}/api/auth/login`, data);
      login(res.data);
      toast.success("Login successful!");
      const role = res.data.user.role;
      if (role === "admin") navigate("/admin");
      else if (role === "worker") navigate("/worker");
      else navigate("/dashboard");
    } catch (err: any) {
      toast.error(err.response?.data?.message || "Login failed");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen pt-24 pb-12 px-4 flex items-center justify-center">
      <Card className="w-full max-w-md p-8">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold mb-2">Welcome Back</h1>
          <p className="text-zinc-500">Login to manage your bookings</p>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          <div className="space-y-2">
            <label className="text-sm font-medium text-zinc-700 dark:text-zinc-300">
              Phone Number
            </label>
            <div className="relative">
              <Phone
                className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400"
                size={18}
              />
              <input
                {...register("phone")}
                type="tel"
                className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 focus:ring-2 focus:ring-blue-500 outline-none transition-all"
                placeholder="Enter phone number"
              />
            </div>
            {errors.phone && (
              <p className="text-red-500 text-xs">
                {errors.phone.message as string}
              </p>
            )}
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium text-zinc-700 dark:text-zinc-300">
              Password
            </label>
            <div className="relative">
              <Lock
                className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400"
                size={18}
              />
              <input
                {...register("password")}
                type="password"
                className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 focus:ring-2 focus:ring-blue-500 outline-none transition-all"
                placeholder="Enter password"
              />
            </div>
            {errors.password && (
              <p className="text-red-500 text-xs">
                {errors.password.message as string}
              </p>
            )}
          </div>

          <Button type="submit" className="w-full" isLoading={isLoading}>
            Login <ArrowRight size={18} />
          </Button>
        </form>

        <p className="text-center mt-8 text-zinc-500 text-sm">
          Don't have an account?{" "}
          <Link
            to="/register"
            className="text-blue-600 font-semibold hover:underline"
          >
            Register Now
          </Link>
        </p>

        <div className="mt-8 p-4 bg-zinc-50 dark:bg-zinc-900/50 rounded-xl border border-zinc-100 dark:border-zinc-800">
          <p className="text-[10px] font-bold uppercase text-zinc-400 mb-2">
            Admin Demo Access
          </p>
          <p className="text-xs text-zinc-500">
            Phone:{" "}
            <span className="font-mono text-zinc-900 dark:text-zinc-100">
              9999999999
            </span>
          </p>
          <p className="text-xs text-zinc-500">
            Pass:{" "}
            <span className="font-mono text-zinc-900 dark:text-zinc-100">
              admin123
            </span>
          </p>
        </div>
      </Card>
    </div>
  );
};
