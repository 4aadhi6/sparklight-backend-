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
import { User, Phone, Lock, Briefcase } from "lucide-react";
const API = import.meta.env.VITE_API_URL;

const schema = z.object({
  name: z.string().min(2, "Name is too short"),
  phone: z.string().min(10, "Invalid phone number"),
  password: z.string().min(6, "Password must be at least 6 characters"),
  role: z.enum(["user", "worker"]),
});

export const Register: React.FC = () => {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = React.useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(schema),
    defaultValues: { role: "user" },
  });

  const onSubmit = async (data: any) => {
    setIsLoading(true);
    try {
      const res = await axios.post(`${API}/api/auth/register`, data);
      login(res.data);
      toast.success("Registration successful!");
      navigate(data.role === "worker" ? "/worker" : "/dashboard");
    } catch (err: any) {
      toast.error(err.response?.data?.message || "Registration failed");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen pt-24 pb-12 px-4 flex items-center justify-center">
      <Card className="w-full max-w-md p-8">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold mb-2">Create Account</h1>
          <p className="text-zinc-500">Join Spark Light for 24/7 services</p>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          <div className="space-y-2">
            <label className="text-sm font-medium text-zinc-700 dark:text-zinc-300">
              Full Name
            </label>
            <div className="relative">
              <User
                className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400"
                size={18}
              />
              <input
                {...register("name")}
                className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 focus:ring-2 focus:ring-blue-500 outline-none transition-all"
                placeholder="Enter full name"
              />
            </div>
            {errors.name && (
              <p className="text-red-500 text-xs">
                {errors.name.message as string}
              </p>
            )}
          </div>

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

          <div className="space-y-2">
            <label className="text-sm font-medium text-zinc-700 dark:text-zinc-300">
              Register As
            </label>
            <div className="grid grid-cols-2 gap-4">
              <label className="cursor-pointer">
                <input
                  {...register("role")}
                  type="radio"
                  value="user"
                  className="hidden peer"
                />
                <div className="p-3 text-center rounded-xl border border-zinc-200 dark:border-zinc-800 peer-checked:border-blue-500 peer-checked:bg-blue-50 dark:peer-checked:bg-blue-900/20 transition-all">
                  User
                </div>
              </label>
              <label className="cursor-pointer">
                <input
                  {...register("role")}
                  type="radio"
                  value="worker"
                  className="hidden peer"
                />
                <div className="p-3 text-center rounded-xl border border-zinc-200 dark:border-zinc-800 peer-checked:border-blue-500 peer-checked:bg-blue-50 dark:peer-checked:bg-blue-900/20 transition-all">
                  Worker
                </div>
              </label>
            </div>
          </div>

          <Button type="submit" className="w-full" isLoading={isLoading}>
            Register Now
          </Button>
        </form>

        <p className="text-center mt-8 text-zinc-500 text-sm">
          Already have an account?{" "}
          <Link
            to="/login"
            className="text-blue-600 font-semibold hover:underline"
          >
            Login Now
          </Link>
        </p>
      </Card>
    </div>
  );
};
