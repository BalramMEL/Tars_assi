"use client";

import axios from "axios";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import toast from "react-hot-toast";
import { Eye, EyeOff, Loader } from "lucide-react";

const SignUpPage = () => {
  const router = useRouter();
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState({
    username: "",
    email: "",
    password: "",
  });

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const validateForm = () => {
    if (!formData.username.trim()) {
      toast.error("Username is required");
      return false;
    }
    if (!/\S+@\S+\.\S+/.test(formData.email)) {
      toast.error("Invalid email format");
      return false;
    }
    if (!formData.password.trim()) {
      toast.error("Password is required");
      return false;
    }
    if (formData.password.length < 8) {
      toast.error("Password must be at least 8 characters");
      return false;
    }
    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (validateForm()) {
      try {
        setIsLoading(true);
        const response = await axios.post("http://localhost:3000/api/sign-up", formData);
        setIsLoading(false);
        toast.success(response.data.message);
        router.push("/");
      } catch (error) {
        setIsLoading(false);
        toast.error(error.response?.data?.message || "Signup failed");
      }
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100">
      <div className="w-full max-w-md bg-white rounded-lg shadow-md p-8">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-800">Create your account</h2>
          <p className="text-sm text-gray-600 mt-2">Join us and start exploring today!</p>
        </div>
        <form className="space-y-4 mt-6" onSubmit={handleSubmit}>
          <div>
            <label className="block text-sm font-medium">Username</label>
            <input
              type="text"
              name="username"
              className="input input-bordered w-full px-3 py-2 rounded-lg border border-gray-300"
              placeholder="Enter your username"
              value={formData.username}
              onChange={handleChange}
            />
          </div>
          <div>
            <label className="block text-sm font-medium">Email</label>
            <input
              type="email"
              name="email"
              className="input input-bordered w-full px-3 py-2 rounded-lg border border-gray-300"
              placeholder="Enter your email"
              value={formData.email}
              onChange={handleChange}
            />
          </div>
          <div className="relative">
            <label className="block text-sm font-medium">Password</label>
            <input
              type={showPassword ? "text" : "password"}
              name="password"
              className="input input-bordered w-full px-3 py-2 rounded-lg border border-gray-300"
              placeholder="Enter your password"
              value={formData.password}
              onChange={handleChange}
            />
            <button
              type="button"
              className="absolute right-3 top-7 text-gray-600"
              onClick={() => setShowPassword(!showPassword)}
            >
              {showPassword ? <Eye /> : <EyeOff />}
            </button>
          </div>
          <div>
            <button
              type="submit"
              className={`w-full bg-blue-600 text-white py-2 rounded-lg flex justify-center items-center ${isLoading && "opacity-50"}`}
              disabled={isLoading}
            >
              {isLoading ? <Loader className="animate-spin mr-2" /> : "Sign Up"}
            </button>
          </div>
        </form>
        <div className="text-center mt-4">
          <p className="text-sm text-gray-600">
            Already have an account? <Link href="/log-in" className="text-blue-600 hover:underline">Log in</Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default SignUpPage;
