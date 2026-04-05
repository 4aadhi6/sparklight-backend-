import React, { useState } from "react";
import { useAuth } from "../context/AuthContext";
import { Card } from "../components/ui/Card";
import { Button } from "../components/ui/Button";
import { User, Phone, MapPin, Camera, Save, Plus, Trash2 } from "lucide-react";
import axios from "axios";
import { toast } from "sonner";
const API = import.meta.env.VITE_API_URL;

export const Profile: React.FC = () => {
  const { user, login } = useAuth();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: user?.name || "",
    phone: user?.phone || "",
    profilePhoto: user?.profilePhoto || "",
    addresses: user?.addresses || [{ label: "Home", address: "" }],
  });

  const handleAddAddress = () => {
    setFormData({
      ...formData,
      addresses: [...formData.addresses, { label: "Other", address: "" }],
    });
  };

  const handleRemoveAddress = (index: number) => {
    const newAddresses = formData.addresses.filter(
      (_: any, i: number) => i !== index,
    );
    setFormData({ ...formData, addresses: newAddresses });
  };

  const handleAddressChange = (index: number, field: string, value: string) => {
    const newAddresses = [...formData.addresses];
    newAddresses[index] = { ...newAddresses[index], [field]: value };
    setFormData({ ...formData, addresses: newAddresses });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await axios.patch(`${API}/api/auth/profile`, formData);
      // Update local auth state
      const token = localStorage.getItem("token");
      login({ token, user: res.data });
      toast.success("Profile updated successfully");
    } catch (err: any) {
      toast.error(err.response?.data?.message || "Failed to update profile");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen pt-24 pb-12 px-4 max-w-4xl mx-auto">
      <div className="mb-8">
        <h1 className="text-3xl font-bold">My Profile</h1>
        <p className="text-zinc-500">
          Manage your personal information and addresses
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-8">
        <div className="grid md:grid-cols-3 gap-8">
          {/* Profile Photo Section */}
          <Card className="md:col-span-1 flex flex-col items-center p-6 text-center">
            <div className="relative mb-4">
              <img
                src={
                  formData.profilePhoto ||
                  `https://api.dicebear.com/7.x/avataaars/svg?seed=${formData.name}`
                }
                alt="Profile"
                className="w-32 h-32 rounded-full object-cover border-4 border-blue-500/10"
              />
              <div className="absolute bottom-0 right-0 p-2 bg-blue-600 text-white rounded-full shadow-lg">
                <Camera size={18} />
              </div>
            </div>
            <div className="w-full space-y-2">
              <label className="text-xs font-bold uppercase text-zinc-400">
                Photo URL
              </label>
              <input
                type="text"
                value={formData.profilePhoto}
                onChange={(e) =>
                  setFormData({ ...formData, profilePhoto: e.target.value })
                }
                className="w-full px-3 py-2 text-xs rounded-lg border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900"
                placeholder="https://example.com/photo.jpg"
              />
            </div>
          </Card>

          {/* Basic Info Section */}
          <Card className="md:col-span-2 p-6 space-y-6">
            <h2 className="text-xl font-bold flex items-center gap-2">
              <User size={20} className="text-blue-600" /> Basic Information
            </h2>
            <div className="grid sm:grid-cols-2 gap-6">
              <div className="space-y-2">
                <label className="text-sm font-medium">Full Name</label>
                <div className="relative">
                  <User
                    className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400"
                    size={18}
                  />
                  <input
                    type="text"
                    value={formData.name}
                    onChange={(e) =>
                      setFormData({ ...formData, name: e.target.value })
                    }
                    className="w-full pl-10 pr-4 py-2 rounded-lg border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900"
                    required
                  />
                </div>
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Phone Number</label>
                <div className="relative">
                  <Phone
                    className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400"
                    size={18}
                  />
                  <input
                    type="tel"
                    value={formData.phone}
                    onChange={(e) =>
                      setFormData({ ...formData, phone: e.target.value })
                    }
                    className="w-full pl-10 pr-4 py-2 rounded-lg border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900"
                    required
                  />
                </div>
              </div>
            </div>
          </Card>
        </div>

        {/* Addresses Section */}
        <Card className="p-6 space-y-6">
          <div className="flex justify-between items-center">
            <h2 className="text-xl font-bold flex items-center gap-2">
              <MapPin size={20} className="text-blue-600" /> Saved Addresses
            </h2>
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={handleAddAddress}
              className="gap-2"
            >
              <Plus size={16} /> Add Address
            </Button>
          </div>

          <div className="space-y-4">
            {formData.addresses.map((addr: any, index: number) => (
              <div
                key={index}
                className="p-4 rounded-xl border border-zinc-100 dark:border-zinc-800 space-y-4"
              >
                <div className="flex justify-between items-center">
                  <input
                    type="text"
                    value={addr.label}
                    onChange={(e) =>
                      handleAddressChange(index, "label", e.target.value)
                    }
                    className="font-bold bg-transparent border-none focus:ring-0 p-0 text-sm"
                    placeholder="Address Label (e.g. Home, Office)"
                  />
                  {formData.addresses.length > 1 && (
                    <button
                      type="button"
                      onClick={() => handleRemoveAddress(index)}
                      className="text-red-500 hover:bg-red-50 p-1 rounded-lg transition-colors"
                    >
                      <Trash2 size={18} />
                    </button>
                  )}
                </div>
                <textarea
                  value={addr.address}
                  onChange={(e) =>
                    handleAddressChange(index, "address", e.target.value)
                  }
                  className="w-full p-3 rounded-lg border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 text-sm"
                  placeholder="Enter full address"
                  rows={2}
                  required
                />
              </div>
            ))}
          </div>
        </Card>

        <div className="flex justify-end">
          <Button type="submit" className="gap-2" isLoading={loading}>
            <Save size={18} /> Save Profile Changes
          </Button>
        </div>
      </form>
    </div>
  );
};
