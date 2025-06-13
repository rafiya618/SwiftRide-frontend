import React, { useEffect, useState } from "react";
import { GoogleMap, LoadScript, Marker } from "@react-google-maps/api";
import { io } from "socket.io-client";
import axios from 'axios';
import { Link } from 'react-router-dom';
import { Car, MapPin, Users, ArrowRight, User } from "lucide-react";

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL || "http://localhost:8000";
const SOCKET_URL = BACKEND_URL;
const GOOGLE_MAPS_API_KEY = process.env.REACT_APP_GOOGLE_MAPS_API_KEY;

const statusBadge = (status) => {
  if (status === 'Completed' || status === 'completed') return <span className="bg-green-100 text-green-700 px-3 py-1 rounded-full text-xs font-medium">Completed</span>;
  if (status === 'Ongoing' || status === 'ongoing') return <span className="bg-blue-100 text-blue-700 px-3 py-1 rounded-full text-xs font-medium">Ongoing</span>;
  return <span className="bg-red-100 text-red-600 px-3 py-1 rounded-full text-xs font-medium">{status}</span>;
};

const DriverApp = ({ user }) => {
  const [location, setLocation] = useState(null);
  const [rides, setRides] = useState([]);
  const [selectedRide, setSelectedRide] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Emit driver's location via socket every 5 seconds
  useEffect(() => {
    if (!user || user.role !== "driver") return;
    const socketInstance = io(SOCKET_URL, { query: { userId: user.id } });
    let interval;
    interval = setInterval(() => {
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          const coords = { lat: pos.coords.latitude, lng: pos.coords.longitude };
          setLocation(coords);
          socketInstance.emit("driverLocation", {
            driverId: user.id,
            lat: coords.lat,
            lng: coords.lng,
          });
        }
      );
    }, 5000);

    return () => {
      if (interval) clearInterval(interval);
      socketInstance.disconnect();
    };
  }, [user]);

  // Fetch ride history
  useEffect(() => {
    const fetchRideHistory = async () => {
      try {
        const response = await axios.get(`${BACKEND_URL}/api/v1/rides/ride-history`, {
          headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
        });
        setRides(response.data);
      } catch (error) {
        console.error('Error fetching ride history:', error);
      }
    };
    fetchRideHistory();
  }, []);

  const handleSeeDetails = (ride) => {
    setSelectedRide(ride);
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setSelectedRide(null);
    setIsModalOpen(false);
  };

  const handleEndRide = async () => {
    try {
      const response = await axios.put(
        `${BACKEND_URL}/api/v1/rides/end/${selectedRide._id}`,
        {},
        {
          headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
        }
      );
      alert('Ride ended successfully');
      closeModal();
    } catch (error) {
      console.error('Error ending the ride:', error);
      alert('Failed to end the ride');
    }
  };

  const handleCancelRide = async () => {
    try {
      await axios.put(
        `${BACKEND_URL}/api/v1/rides/cancel/${selectedRide._id}`,
        {},
        {
          headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
        }
      );
      alert('Ride cancelled successfully');
      closeModal();
    } catch (error) {
      alert('Failed to cancel the ride');
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-tr from-[#e7edfb] via-[#e2e7fa] to-[#e9effc] flex flex-col items-center p-6">
      {/* Navbar / Welcome */}
      <div className='flex flex-col md:flex-row justify-between items-center w-full max-w-7xl mb-8 gap-4'>
        <div className="flex items-center gap-3">
          <Car className="text-blue-600 h-8 w-8" />
          <span className="text-3xl font-extrabold text-blue-700">Welcome, Driver</span>
        </div>
        <nav className="flex space-x-4">
          
          <Link to="/ride-history" className="px-4 py-2 rounded-lg bg-white text-blue-600 border border-blue-600 hover:bg-blue-50 font-semibold shadow transition">View Rides</Link>
        </nav>
      </div>

      {/* Two columns: Map and Rides */}
      <div className="w-full max-w-7xl grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Map Card */}
        <div className="bg-white/90 shadow-xl rounded-2xl p-6 flex flex-col">
          <h3 className="text-xl font-bold text-blue-700 flex items-center gap-2 mb-4">
            <MapPin className="h-6 w-6 text-blue-600" /> Your Current Location
          </h3>
          <div className="rounded-xl overflow-hidden border border-blue-100">
            <LoadScript googleMapsApiKey={GOOGLE_MAPS_API_KEY}>
              <GoogleMap
                center={location || { lat: 31.5204, lng: 74.3587 }}
                zoom={13}
                mapContainerStyle={{ height: '340px', width: '100%' }}
                className="rounded-xl shadow"
              >
                {location && (
                  <Marker
                    position={location}
                    icon={{
                      url: "https://maps.google.com/mapfiles/ms/icons/blue-dot.png",
                      scaledSize: window.google && window.google.maps ? new window.google.maps.Size(40, 40) : undefined,
                    }}
                  />
                )}
              </GoogleMap>
            </LoadScript>
          </div>
        </div>

        {/* Ride History Card */}
        <div className="bg-white/90 shadow-xl rounded-2xl p-6 flex flex-col">
          <h3 className="text-xl font-bold text-blue-700 mb-4 flex items-center gap-2">
            <Users className="h-6 w-6 text-indigo-600" /> Your Rides
          </h3>
          {Array.isArray(rides) && rides.length > 0 ? (
            <div className="grid grid-cols-1 gap-6 max-h-[340px] overflow-y-auto pr-1">
              {rides
                .sort((a, b) => new Date(b.departureTime) - new Date(a.departureTime))
                .map((ride) => (
                  <div
                    key={ride._id}
                    className="flex flex-col bg-gradient-to-br from-blue-50 to-indigo-50 border border-blue-100 rounded-xl p-4 shadow hover:scale-[1.02] hover:shadow-xl transition-all"
                  >
                    <div className="flex items-center justify-between mb-1">
                      <div className="flex gap-2 items-center text-sm text-gray-700 truncate">
                        <User className="h-4 w-4 text-indigo-500" />
                        <span className="font-semibold truncate">{ride.passengerName || "Passenger"}</span>
                      </div>
                      {statusBadge(ride.status)}
                    </div>
                    <div className="flex items-center gap-2 text-blue-700 font-medium truncate">
                      <MapPin className="h-4 w-4" />
                      <span className="truncate">{ride.origin?.address || "Unknown Origin"}</span>
                    </div>
                    <div className="flex items-center gap-2 text-blue-500 font-medium truncate mb-1">
                      <ArrowRight className="h-4 w-4" />
                      <span className="truncate">{ride.destination?.address || "Unknown Destination"}</span>
                    </div>
                    <div className="text-xs text-gray-500 mb-1">
                      <span className="font-semibold">Departure:</span> {new Date(ride.departureTime).toLocaleString()}
                    </div>
                    <div className="text-xs text-gray-500 mb-1">
                      <span className="font-semibold">Seats:</span> {ride.bookedSeats}
                    </div>
                    <div className="text-xs text-blue-700 font-semibold mb-2">
                      PKR {ride.price}
                    </div>
                    <div className="flex flex-row gap-2 mt-2">
                      <button
                        onClick={() => handleSeeDetails(ride)}
                        className="flex-1 px-3 py-2 rounded-lg bg-blue-600 hover:bg-blue-700 text-white font-semibold shadow transition"
                      >
                        See Details
                      </button>
                    </div>
                  </div>
                ))}
            </div>
          ) : (
            <p className="text-center text-gray-500 text-base">No rides found.</p>
          )}
        </div>
      </div>

      {/* Modal for Ride Details */}
      {isModalOpen && selectedRide && (
        <div className="fixed inset-0 flex items-center justify-center z-50 bg-black bg-opacity-40">
          <div className="bg-white rounded-2xl p-8 w-full max-w-lg shadow-2xl border border-blue-200">
            <h3 className="text-2xl font-bold text-blue-700 mb-4 flex items-center gap-2">
              <Car className="h-6 w-6 text-blue-600" /> Ride Details
            </h3>
            <div className="space-y-2 text-gray-700">
              <div className="flex items-center gap-2">
                <User className="h-5 w-5 text-indigo-500" />
                <span className="font-semibold">Driver:</span>
                <span>{selectedRide.driver?.name || "N/A"}</span>
              </div>
              <div className="flex items-center gap-2">
                <Users className="h-5 w-5 text-indigo-500" />
                <span className="font-semibold">Passengers:</span>
                <span>
                  {Array.isArray(selectedRide.passengers)
                    ? selectedRide.passengers.map(p => p.name).join(', ')
                    : 'No passengers'}
                </span>
              </div>
              <div className="flex items-center gap-2">
                <MapPin className="h-5 w-5 text-blue-600" />
                <span className="font-semibold">Origin:</span>
                <span>{selectedRide.origin?.address || "Unknown Origin"}</span>
              </div>
              <div className="flex items-center gap-2">
                <ArrowRight className="h-5 w-5 text-blue-400" />
                <span className="font-semibold">Destination:</span>
                <span>{selectedRide.destination?.address || "Unknown Destination"}</span>
              </div>
              <div>
                <span className="font-semibold">Departure Time:</span>{" "}
                <span>{selectedRide.departureTime ? new Date(selectedRide.departureTime).toLocaleString() : "N/A"}</span>
              </div>
              <div>
                <span className="font-semibold">Status:</span>{" "}
                {statusBadge(selectedRide.status)}
              </div>
              <div>
                <span className="font-semibold">Total Price:</span>{" "}
                <span className="font-bold text-blue-700">PKR {selectedRide.price}</span>
              </div>
            </div>
            <div className="flex gap-4 mt-7">
              {selectedRide.status !== 'completed' && selectedRide.status !== 'Completed' && (
                <>
                  <button
                    onClick={handleEndRide}
                    className="flex-1 px-4 py-2 rounded-lg bg-blue-600 hover:bg-blue-700 text-white font-semibold shadow transition"
                  >
                    End Ride
                  </button>
                  <button
                    onClick={handleCancelRide}
                    className="flex-1 px-4 py-2 rounded-lg bg-red-600 hover:bg-red-700 text-white font-semibold shadow transition"
                  >
                    Cancel Ride
                  </button>
                </>
              )}
              <button
                onClick={closeModal}
                className="flex-1 px-4 py-2 rounded-lg bg-white border border-blue-600 text-blue-600 font-semibold shadow hover:bg-blue-50 transition"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default DriverApp;