import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { Car, MapPin, User, ArrowRight } from "lucide-react";

const statusBadge = (status) => {
  if (status === 'Completed') return <span className="bg-green-100 text-green-700 px-3 py-1 rounded-full text-xs font-medium">Completed</span>;
  if (status === 'Ongoing') return <span className="bg-blue-100 text-blue-700 px-3 py-1 rounded-full text-xs font-medium">Ongoing</span>;
    if (status === 'Canceled') return <span className="bg-blue-100 text-red-400 px-3 py-1 rounded-full text-xs font-medium">Ongoing</span>;
  return <span className="bg-red-100 text-red-600 px-3 py-1 rounded-full text-xs font-medium">{status}</span>;

};

const RideHistory = () => {
  const [rides, setRides] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchRides = async () => {
      try {
        const token = localStorage.getItem('token');
        if (!token) {
          console.error('No token found in local storage');
          return;
        }
        const response = await axios.get(`${process.env.REACT_APP_BACKEND_URL}/api/v1/rides/ride-history`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        // Sort rides by departureTime (or any other criteria)
        const sortedRides = response.data.sort((a, b) => new Date(b.departureTime) - new Date(a.departureTime));
        setRides(sortedRides);
        setLoading(false);
      } catch (error) {
        console.error('Error fetching ride history:', error);
        setLoading(false);
      }
    };
    fetchRides();
  }, []);

  if (loading) return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-tr from-[#e7edfb] via-[#e2e7fa] to-[#e9effc]">
      <p className="text-center text-blue-600 text-xl font-semibold animate-pulse">Loading...</p>
    </div>
  );

  return (
    <div className="min-h-screen bg-gradient-to-tr from-[#e7edfb] via-[#e2e7fa] to-[#e9effc] px-2 py-8">
      <div className="max-w-7xl mx-auto">
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-3">
            <Car className="text-blue-600 h-7 w-7" />
            <span className="text-2xl font-bold text-blue-700 tracking-tight">Your Ride History</span>
          </div>
        </div>
        {rides.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-80">
            <p className="text-center text-gray-500 text-lg">No rides found.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {rides.map((ride) => (
              <div
                key={ride._id}
                className="flex flex-col bg-white/90 shadow-xl border border-blue-100 rounded-2xl p-6 hover:scale-[1.02] hover:shadow-2xl transition-transform duration-200"
              >
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <User className="h-5 w-5 text-indigo-500" />
                    <span className="font-semibold text-sm text-indigo-700">{ride.driverName || "Driver"}</span>
                  </div>
                  {statusBadge(ride.status)}
                </div>
                <div className="flex items-center gap-2 my-2">
                  <MapPin className="h-5 w-5 text-blue-600" />
                  <span className="truncate font-medium text-gray-700">{ride.origin ? ride.origin.address : 'Unknown Origin'}</span>
                </div>
                <div className="flex items-center gap-2 mb-3">
                  <ArrowRight className="h-5 w-5 text-blue-400" />
                  <span className="truncate font-medium text-gray-700">{ride.destination ? ride.destination.address : 'Unknown Destination'}</span>
                </div>
                <div className="flex items-center text-sm text-gray-500 mb-1">
                  <span className="font-semibold mr-1">Departure:</span>
                  {new Date(ride.departureTime).toLocaleString()}
                </div>
                <div className="flex items-center text-sm text-gray-500 mb-1">
                  <span className="font-semibold mr-1">Total Price:</span>
                  <span className="font-bold text-blue-700">PKR {ride.price}</span>
                </div>
                <div className="flex-1" />
                <div className="flex flex-row gap-3 mt-6">
                  <button
                    onClick={() =>
                      navigate('/chat', {
                        state: { driverId: ride.driver, passengerId: ride.passenger, role: ride.role },
                      })
                    }
                    className="flex-1 px-4 py-2 rounded-lg bg-blue-600 hover:bg-blue-700 text-white font-semibold shadow transition focus:ring-2 focus:ring-blue-400"
                  >
                    Message
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default RideHistory;