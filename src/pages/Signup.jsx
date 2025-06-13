import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { FaCar, FaUser } from "react-icons/fa";

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL || "http://localhost:8000";

export default function Signup({ setUser }) {
  const [form, setForm] = useState({
    fullName: "",
    email: "",
    password: "",
    phone: "",
    role: "",
    vehicle: {
      make: "",
      model: "",
      licensePlate: "",
      color: "",
    },
  });
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [err, setErr] = useState("");
  const navigate = useNavigate();

  const handleChange = (e) => {
    const { name, value } = e.target;
    if (name.startsWith("vehicle.")) {
      const key = name.split(".")[1];
      setForm((prev) => ({
        ...prev,
        vehicle: { ...prev.vehicle, [key]: value },
      }));
    } else {
      setForm((prev) => ({ ...prev, [name]: value }));
    }
  };

  const handleRoleChange = (e) => {
    setForm((prev) => ({
      ...prev,
      role: e.target.value,
    }));
  };

  const handleSignup = async (e) => {
    e.preventDefault();
    setErr("");
    setIsLoading(true);
    try {
      const res = await fetch(`${BACKEND_URL}/api/v1/auth/register`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      const data = await res.json();
      if (res.ok) {
        setUser(data.user);
        localStorage.setItem("token", data.token);
        if (data.user.role === "driver") {
          navigate("/driver");
        } else {
          navigate("/booking");
        }
      } else {
        setErr(data.message || "Signup failed");
      }
    } catch {
      setErr("Network error");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <span className="inline-flex items-center text-2xl font-bold text-blue-600">
            <FaCar className="h-8 w-8 mr-2" />
            RideShare
          </span>
        </div>
        <div className="bg-white rounded-xl shadow-xl">
          <div className="px-8 pt-8 pb-4">
            <h2 className="text-2xl font-bold text-center mb-1">
              Create Account
            </h2>
            <p className="text-center text-gray-500 mb-6">
              Join RideShare and start your journey today
            </p>
            <form onSubmit={handleSignup} className="space-y-4">
              {err && (
                <div className="bg-red-100 text-red-700 px-4 py-2 rounded text-sm mb-2 text-center">
                  {err}
                </div>
              )}
              <div>
                <label className="block font-medium mb-1">Full Name</label>
                <input
                  className="input"
                  name="fullName"
                  placeholder="Enter your full name"
                  value={form.fullName}
                  onChange={handleChange}
                  required
                />
              </div>
              <div>
                <label className="block font-medium mb-1">Email</label>
                <input
                  className="input"
                  name="email"
                  type="email"
                  placeholder="Enter your email"
                  value={form.email}
                  onChange={handleChange}
                  required
                />
              </div>
              <div>
                <label className="block font-medium mb-1">Phone Number</label>
                <input
                  className="input"
                  name="phone"
                  placeholder="Enter your phone number"
                  value={form.phone}
                  onChange={handleChange}
                  required
                />
              </div>
              <div>
                <label className="block font-medium mb-1">Password</label>
                <div className="relative">
                  <input
                    className="input pr-10"
                    name="password"
                    type={showPassword ? "text" : "password"}
                    placeholder="Create a password"
                    value={form.password}
                    onChange={handleChange}
                    required
                  />
                  <button
                    type="button"
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500"
                    onClick={() => setShowPassword((v) => !v)}
                    tabIndex={-1}
                  >
                    {showPassword ? (
                      <svg
                        className="h-5 w-5"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth={2}
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          d="M13.875 18.825A10.05 10.05 0 0112 19c-5.523 0-10-4.477-10-10 0-1.657.336-3.234.938-4.675M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                        />
                      </svg>
                    ) : (
                      <svg
                        className="h-5 w-5"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth={2}
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                        />
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          d="M2.458 12C3.732 7.943 7.523 5 12 5c4.477 0 8.268 2.943 9.542 7-.274.822-.642 1.603-1.09 2.325M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                        />
                      </svg>
                    )}
                  </button>
                </div>
              </div>
              <div>
                <label className="block font-medium mb-1">I want to</label>
                <div className="relative">
                  <select
                    className="input appearance-none pr-10"
                    name="role"
                    value={form.role}
                    onChange={handleRoleChange}
                    required
                  >
                    <option value="">Select your role</option>
                    <option value="passenger">
                      Book rides as a Passenger
                    </option>
                    <option value="driver">
                      Drive and earn as a Driver
                    </option>
                  </select>
                  <span className="pointer-events-none absolute right-3 top-1/2 transform -translate-y-1/2 text-blue-500 text-lg">
                    {form.role === "driver" ? (
                      <FaCar />
                    ) : form.role === "passenger" ? (
                      <FaUser />
                    ) : (
                      <FaUser />
                    )}
                  </span>
                </div>
              </div>
              {form.role === "driver" && (
                <div className="space-y-4 p-6 bg-gray-50 rounded-lg border border-gray-200">
                  <h3 className="font-semibold text-lg text-gray-900 mb-4">
                    Vehicle Information
                  </h3>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block font-medium mb-1">Make</label>
                      <input
                        className="input"
                        name="vehicle.make"
                        placeholder="Toyota"
                        value={form.vehicle.make}
                        onChange={handleChange}
                        required
                      />
                    </div>
                    <div>
                      <label className="block font-medium mb-1">Model</label>
                      <input
                        className="input"
                        name="vehicle.model"
                        placeholder="Camry"
                        value={form.vehicle.model}
                        onChange={handleChange}
                        required
                      />
                    </div>
                  </div>
                  <div>
                    <label className="block font-medium mb-1">License Plate</label>
                    <input
                      className="input"
                      name="vehicle.licensePlate"
                      placeholder="ABC-1234"
                      value={form.vehicle.licensePlate}
                      onChange={handleChange}
                      required
                    />
                  </div>
                  <div>
                    <label className="block font-medium mb-1">Color</label>
                    <input
                      className="input"
                      name="vehicle.color"
                      placeholder="White"
                      value={form.vehicle.color}
                      onChange={handleChange}
                    />
                  </div>
                </div>
              )}
              <button
                className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-lg py-3 mt-2 transition"
                type="submit"
                disabled={isLoading}
              >
                {isLoading ? "Creating Account..." : "Create Account"}
              </button>
            </form>
            <div className="mt-6 text-center">
              <p className="text-sm text-gray-600">
                Already have an account?{" "}
                <span
                  className="text-blue-600 hover:underline font-medium cursor-pointer"
                  onClick={() => navigate("/login")}
                >
                  Sign in
                </span>
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
