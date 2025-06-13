/* global google */
import React, { useState, useEffect, useRef } from 'react';
import { GoogleMap, Marker, DirectionsRenderer, LoadScript } from '@react-google-maps/api';
import { io } from "socket.io-client";
import { LogOut, User, MapPin, Clock, Car } from "lucide-react";
import PlacesSearch from './PlacesSearch';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL || "http://localhost:8000";
const SOCKET_URL = BACKEND_URL;
const GOOGLE_MAPS_API_KEY = process.env.REACT_APP_GOOGLE_MAPS_API_KEY;

// Color classes for consistency
const gradientMain = "bg-gradient-to-tr from-[#4753a2] to-[#6e3bbf]";
const accent = "text-orange-500";
const accentBg = "bg-orange-600 hover:bg-orange-700";

export default function BookingPage({ user }) {
  const [pickup, setPickup] = useState(null);
  const [destination, setDestination] = useState(null);
  const [directionsResponse, setDirectionsResponse] = useState(null);
  const [distance, setDistance] = useState(null);
  const [price, setPrice] = useState(null);
  const [departureTime, setDepartureTime] = useState('');
  const [selectedDriver, setSelectedDriver] = useState(null);
  const [driverLocations, setDriverLocations] = useState({});
  const [driversNearby, setDriversNearby] = useState([]);
  const [showDriversPopup, setShowDriversPopup] = useState(false);
  const [allDrivers, setAllDrivers] = useState([]);
  // Store address text for pickup/destination
  const [pickupAddress, setPickupAddress] = useState('');
  const [destinationAddress, setDestinationAddress] = useState('');

  // WebSocket for live driver locations
  useEffect(() => {
    const socket = io(SOCKET_URL);

    socket.on("locationUpdate", (locationData) => {
      const { driverId, lat, lng } = locationData;
      setDriverLocations(prev => ({
        ...prev,
        [driverId]: { lat, lng },
      }));
    });

    socket.on("driverDisconnected", ({ driverId }) => {
      setDriverLocations(prev => {
        const updated = { ...prev };
        delete updated[driverId];
        return updated;
      });
    });

    return () => {
      socket.disconnect();
    };
  }, []);

  // Get user location on mount
  useEffect(() => {
    navigator.geolocation.getCurrentPosition(
      (position) => {
        const currentLocation = {
          lat: position.coords.latitude,
          lng: position.coords.longitude,
        };
        setPickup(currentLocation);
        setPickupAddress("Your current location");
      },
      () => {
        setPickup({ lat: 31.5204, lng: 74.3587 });
        setPickupAddress("Default Location");
      },
      { enableHighAccuracy: true }
    );
  }, []);

  // Fetch all drivers for popup
  const fetchAllDrivers = async () => {
    try {
      const res = await fetch(`${BACKEND_URL}/api/v1/auth/drivers`);
      const data = await res.json();
      const onlineDrivers = data.filter(
        d =>
          (driverLocations[d._id] ||
            (d.location && d.location.coordinates && d.location.coordinates.length === 2))
      );
      setAllDrivers(onlineDrivers);
    } catch {
      setAllDrivers([]);
    }
  };

  // Calculate route and price
  useEffect(() => {
    if (pickup && destination && window.google && window.google.maps) {
      const directionsService = new window.google.maps.DirectionsService();
      directionsService.route(
        {
          origin: pickup,
          destination: destination,
          travelMode: window.google.maps.TravelMode.DRIVING,
        },
        (result, status) => {
          if (status === "OK") {
            setDirectionsResponse(result);
            const distanceInKm = result.routes[0].legs[0].distance.value / 1000;
            setDistance(distanceInKm);
            setPrice(Math.round(distanceInKm * 100));
          } else {
            setDirectionsResponse(null);
            setDistance(null);
            setPrice(null);
          }
        }
      );
    }
  }, [pickup, destination]);

  // Book ride logic: use text address, not 'Pickup Location'
  const BookRide = async () => {
    if (!pickup || !destination || !departureTime || !selectedDriver || !pickupAddress || !destinationAddress) {
      alert('Please provide all necessary details');
      return;
    }
    try {
      const response = await fetch(`${BACKEND_URL}/api/v1/rides/create`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
        body: JSON.stringify({
          driver: selectedDriver._id,
          passenger: user.id,
          origin: {
            address: pickupAddress,
            coordinates: [pickup.lng, pickup.lat],
          },
          destination: {
            address: destinationAddress,
            coordinates: [destination.lng, destination.lat],
          },
          departureTime,
          price,
        }),
      });
      const data = await response.json();
      if (response.ok) {
        localStorage.setItem('rideId', data.ride._id);
        alert('Ride Booked successfully');
      } else {
        alert(`Failed to book ride: ${data.error}`);
      }
    } catch (error) {
      alert('Error creating ride');
    }
  };

  // Handle place search: also set the address text
  const handlePlaceSearch = (place, type) => {
    const location = {
      lat: place.geometry.location.lat(),
      lng: place.geometry.location.lng(),
    };
    const address = place.formatted_address || place.name || '';
    if (type === 'pickup') {
      setPickup(location);
      setPickupAddress(address);
    } else {
      setDestination(location);
      setDestinationAddress(address);
    }
  };

  // Driver selection popup
  const DriverPopup = ({ drivers, onSelect, onClose }) => (
    <div className="fixed inset-0 flex items-center justify-center z-50 bg-black/60">
      <div className="rounded-2xl shadow-xl p-8 w-full max-w-xl bg-white relative">
        <h3 className="text-2xl font-bold mb-6 text-gray-900">Available Drivers</h3>
        <ul className="divide-y divide-gray-200 max-h-60 overflow-y-auto">
          {drivers.length > 0 ? (
            drivers.map((driver) => (
              <li key={driver._id} className="py-3 flex items-center justify-between">
                <div>
                  <span className="font-semibold text-gray-800">{driver.fullName}</span>
                  <span className="ml-2 text-gray-500">({driver.vehicle?.model || "No vehicle info"})</span>
                  {driverLocations[driver._id] && (
                    <span className="ml-3 px-2 py-1 rounded-full bg-green-100 text-green-700 text-xs font-bold">Online</span>
                  )}
                </div>
                <button
                  className="bg-blue-600 hover:bg-blue-700 text-white px-5 py-2 rounded-lg transition"
                  onClick={() => { onSelect(driver); onClose(); }}
                >
                  Select
                </button>
              </li>
            ))
          ) : (
            <p className="py-3 text-center text-gray-500">No drivers available at the moment.</p>
          )}
        </ul>
        <button
          className="absolute top-4 right-4 text-gray-400 hover:text-red-500"
          onClick={onClose}
        >
          <LogOut className="h-6 w-6" />
        </button>
      </div>
    </div>
  );

  // Get user fullName from localStorage
  let fullName = '';
  try {
    const userStr = localStorage.getItem('user');
    if (userStr) {
      const userObj = JSON.parse(userStr);
      fullName = userObj.fullName || '';
    }
  } catch {
    fullName = '';
  }

  // Wrap the entire return with LoadScript so google is defined for all children
  return (
    <LoadScript googleMapsApiKey={GOOGLE_MAPS_API_KEY} libraries={['places']}>
      <div className={`${gradientMain} min-h-screen flex flex-col`}>
        {/* Main Content: Left Form + Right Map */}
        <div className="flex flex-1 flex-col lg:flex-row items-center justify-center w-full max-w-7xl mx-auto gap-8 py-10 px-4">
          {/* Left: Selection Fields */}
          <div className="w-full max-w-md">
            <div className="rounded-2xl shadow-xl p-8 bg-white/90 backdrop-blur border border-gray-200">
              {/* Pickup Input */}
              <div className="mb-6">
                <label className="block text-gray-800 font-semibold mb-2">Pickup Location</label>
                <div className="relative">
                  <PlacesSearch
                    onPlaceSelected={(place) => handlePlaceSearch(place, 'pickup')}
                    placeholder="Enter Pickup Point"
                    className="pl-12 pr-4 py-3 rounded-lg border border-gray-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-100 outline-none shadow transition w-full text-base bg-white"
                  />
                  <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 text-blue-600 h-6 w-6 pointer-events-none" />
                </div>
                {/* Show address if selected */}
                {pickupAddress && <div className="mt-1 text-xs text-blue-700 truncate">{pickupAddress}</div>}
              </div>
              {/* Destination Input */}
              <div className="mb-6">
                <label className="block text-gray-800 font-semibold mb-2">Destination</label>
                <div className="relative">
                  <PlacesSearch
                    onPlaceSelected={(place) => handlePlaceSearch(place, 'destination')}
                    placeholder="Enter Destination"
                    className="pl-12 pr-4 py-3 rounded-lg border border-gray-200 focus:border-orange-500 focus:ring-2 focus:ring-orange-100 outline-none shadow transition w-full text-base bg-white"
                  />
                  <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 text-orange-600 h-6 w-6 pointer-events-none" />
                </div>
                {destinationAddress && <div className="mt-1 text-xs text-orange-600 truncate">{destinationAddress}</div>}
              </div>
              {/* Departure Time */}
              <div className="mb-6">
                <label className="block text-gray-800 font-semibold mb-2">Departure Time</label>
                <div className="relative">
                  <input
                    type="datetime-local"
                    value={departureTime}
                    onChange={(e) => setDepartureTime(e.target.value)}
                    className="pl-12 pr-4 py-3 rounded-lg border border-gray-200 focus:border-orange-500 focus:ring-2 focus:ring-orange-100 outline-none shadow transition w-full text-base bg-white"
                  />
                  <Clock className="absolute left-3 top-1/2 -translate-y-1/2 text-orange-500 h-6 w-6 pointer-events-none" />
                </div>
              </div>
              {/* Show Drivers Button */}
              <button
                onClick={() => {
                  fetchAllDrivers();
                  setShowDriversPopup(true);
                }}
                className="w-full flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white py-3 px-5 rounded-xl text-lg font-semibold shadow transition mb-4"
              >
                <Car className="h-6 w-6" />
                Show Available Drivers
              </button>
              {/* Selected Driver + Info */}
              <div className="mb-2">
                <span className="font-semibold text-gray-800">Selected Driver:</span>
                <div className="p-2">
                  {selectedDriver
                    ? `${selectedDriver.fullName} (${selectedDriver.vehicle?.model || "No vehicle info"})`
                    : <span className="text-gray-500">No driver selected.</span>}
                </div>
              </div>
              <div className="mb-2">
                <span className="font-semibold text-gray-800">Distance:</span>{" "}
                {distance ? (
                  <span className="text-blue-700">{distance.toFixed(2)} km</span>
                ) : (
                  <span className="text-gray-500">-</span>
                )}
              </div>
              <div className="mb-4">
                <span className="font-semibold text-gray-800">Price:</span>{" "}
                {price ? (
                  <span className={accent}>{`PKR ${price}`}</span>
                ) : (
                  <span className="text-gray-500">-</span>
                )}
              </div>
              {/* Book Ride Button */}
              <button
                className={`${accentBg} w-full text-white py-3 px-5 rounded-xl text-lg font-semibold shadow transition`}
                onClick={BookRide}
                disabled={!selectedDriver || !pickup || !destination || !departureTime}
                style={{
                  opacity: !selectedDriver || !pickup || !destination || !departureTime ? 0.5 : 1,
                  cursor: !selectedDriver || !pickup || !destination || !departureTime ? "not-allowed" : "pointer",
                }}
              >
                Book Ride
              </button>
            </div>
          </div>
          {/* Right: Map */}
          <div className="flex-1 w-full max-w-2xl min-w-[340px]">
            <div className="rounded-2xl shadow-2xl overflow-hidden border border-gray-200 bg-white">
              <GoogleMap
                center={pickup || { lat: 31.5204, lng: 74.3587 }}
                zoom={13}
                mapContainerStyle={{ height: '600px', width: '100%' }}
              >
                {pickup && <Marker position={pickup} />}
                {destination && <Marker position={destination} />}
                {Object.entries(driverLocations).map(([driverId, location]) => (
                  <Marker
                    key={driverId}
                    position={location}
                    icon={{
                      url: "https://cdn3d.iconscout.com/3d/premium/thumb/car-location-3d-icon-download-in-png-blend-fbx-gltf-file-formats--navigation-vehicle-pin-maps-and-pack-icons-10890006.png",
                      scaledSize: new window.google.maps.Size(50, 40),
                    }}
                  />
                ))}
                {driversNearby.map((driver) =>
                  driver.location && driver.location.coordinates ? (
                    <Marker
                      key={driver._id}
                      position={{
                        lat: driver.location.coordinates[1],
                        lng: driver.location.coordinates[0],
                      }}
                      icon={{
                        url: "https://cdn-icons-png.flaticon.com/512/5193/5193688.png",
                        scaledSize: new window.google.maps.Size(30, 30),
                      }}
                    />
                  ) : null
                )}
                {directionsResponse && <DirectionsRenderer directions={directionsResponse} />}
              </GoogleMap>
            </div>
          </div>
        </div>

        {/* Driver Popup */}
        {showDriversPopup && (
          <DriverPopup
            drivers={allDrivers}
            onSelect={setSelectedDriver}
            onClose={() => setShowDriversPopup(false)}
          />
        )}
      </div>
    </LoadScript>
  );
}