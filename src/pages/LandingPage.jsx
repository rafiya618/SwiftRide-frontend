import React, { useState } from "react";
import { Car, MapPin, Shield, Clock, Star, Users, CreditCard, Menu, X } from "lucide-react";
import { useNavigate } from "react-router-dom";

export default function LandingPage({ user }) {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const navigate = useNavigate();

  const features = [
    {
      icon: <Car className="h-8 w-8 text-blue-600" />,
      title: "Easy Booking",
      description: "Book your ride in just a few taps with our intuitive interface",
    },
    {
      icon: <MapPin className="h-8 w-8 text-green-600" />,
      title: "Real-time Tracking",
      description: "Track your driver's location in real-time with GPS integration",
    },
    {
      icon: <Shield className="h-8 w-8 text-purple-700" />, // deeper purple
      title: "Safe & Secure",
      description: "All drivers are verified and rides are insured for your safety",
    },
    {
      icon: <Clock className="h-8 w-8 text-orange-600" />,
      title: "24/7 Service",
      description: "Available round the clock for all your transportation needs",
    },
    {
      icon: <Star className="h-8 w-8 text-yellow-600" />,
      title: "Rated Drivers",
      description: "Choose from highly rated and reviewed professional drivers",
    },
    {
      icon: <CreditCard className="h-8 w-8 text-red-600" />,
      title: "Flexible Payment",
      description: "Multiple payment options including cash and digital payments",
    },
  ];

  const stats = [
    { number: "10K+", label: "Happy Customers" },
    { number: "500+", label: "Verified Drivers" },
    { number: "50+", label: "Cities Covered" },
    { number: "4.8", label: "Average Rating" },
  ];

  return (
    <div className="min-h-screen bg-white">
      {/* Navigation */}
      <nav className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center">
              <Car className="h-8 w-8 text-blue-600" />
              <span className="ml-2 text-xl font-bold text-gray-900">RideShare</span>
            </div>
            <div className="hidden md:block">
              <div className="ml-10 flex items-baseline space-x-4">
                <button onClick={() => document.getElementById("features").scrollIntoView({behavior: "smooth"})} className="text-gray-600 hover:text-blue-600 px-3 py-2 text-sm font-medium bg-transparent border-none">
                  Features
                </button>
                <button onClick={() => document.getElementById("how-it-works").scrollIntoView({behavior: "smooth"})} className="text-gray-600 hover:text-blue-600 px-3 py-2 text-sm font-medium bg-transparent border-none">
                  How it Works
                </button>
                <button onClick={() => document.getElementById("contact").scrollIntoView({behavior: "smooth"})} className="text-gray-600 hover:text-blue-600 px-3 py-2 text-sm font-medium bg-transparent border-none">
                  Contact
                </button>
              </div>
            </div>
            <div className="hidden md:flex items-center space-x-4">
              {user ? (
                <div className="flex items-center space-x-4">
                  <span className="bg-gray-100 text-gray-700 px-2 py-1 rounded text-xs font-semibold">{user.role}</span>
                  <span className="text-sm text-gray-700">Welcome, {user.fullName}</span>
                  <button
                    onClick={() => navigate(user.role === "driver" ? "/driver" : "/booking")}
                    className="bg-blue-600 text-white px-4 py-2 rounded-md font-semibold hover:bg-blue-700 transition"
                  >
                    Dashboard
                  </button>
                </div>
              ) : (
                <>
                  <button
                    onClick={() => navigate("/login")}
                    className="border border-blue-600 text-blue-600 px-4 py-2 rounded-md font-semibold bg-white hover:bg-blue-50"
                  >
                    Login
                  </button>
                  <button
                    onClick={() => navigate("/signup")}
                    className="bg-blue-600 text-white px-4 py-2 rounded-md font-semibold hover:bg-blue-700 transition"
                  >
                    Sign Up
                  </button>
                </>
              )}
            </div>
            {/* Mobile menu button */}
            <div className="md:hidden">
              <button
                onClick={() => setIsMenuOpen(!isMenuOpen)}
                className="text-gray-600 hover:text-blue-600 bg-transparent border-none"
              >
                {isMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
              </button>
            </div>
          </div>
        </div>
        {/* Mobile Navigation */}
        {isMenuOpen && (
          <div className="md:hidden">
            <div className="px-2 pt-2 pb-3 space-y-1 sm:px-3 bg-white border-t">
              <button onClick={() => {document.getElementById("features").scrollIntoView({behavior: "smooth"}); setIsMenuOpen(false);}} className="block px-3 py-2 text-base font-medium text-gray-600 hover:text-blue-600 bg-transparent border-none">
                Features
              </button>
              <button onClick={() => {document.getElementById("how-it-works").scrollIntoView({behavior: "smooth"}); setIsMenuOpen(false);}} className="block px-3 py-2 text-base font-medium text-gray-600 hover:text-blue-600 bg-transparent border-none">
                How it Works
              </button>
              <button onClick={() => {document.getElementById("contact").scrollIntoView({behavior: "smooth"}); setIsMenuOpen(false);}} className="block px-3 py-2 text-base font-medium text-gray-600 hover:text-blue-600 bg-transparent border-none">
                Contact
              </button>
              <div className="pt-4 pb-3 border-t border-gray-200">
                {user ? (
                  <div className="space-y-2">
                    <div className="px-3 py-2">
                      <span className="bg-gray-100 text-gray-700 px-2 py-1 rounded text-xs font-semibold">{user.role}</span>
                      <p className="text-sm text-gray-700 mt-1">Welcome, {user.fullName}</p>
                    </div>
                    <button
                      onClick={() => {navigate(user.role === "driver" ? "/driver" : "/booking"); setIsMenuOpen(false);}}
                      className="w-full bg-blue-600 text-white px-4 py-2 rounded-md font-semibold hover:bg-blue-700 transition"
                    >
                      Dashboard
                    </button>
                  </div>
                ) : (
                  <div className="space-y-2 px-3">
                    <button
                      onClick={() => {navigate("/login"); setIsMenuOpen(false);}}
                      className="w-full border border-blue-600 text-blue-600 px-4 py-2 rounded-md font-semibold bg-white hover:bg-blue-50"
                    >
                      Login
                    </button>
                    <button
                      onClick={() => {navigate("/signup"); setIsMenuOpen(false);}}
                      className="w-full bg-blue-600 text-white px-4 py-2 rounded-md font-semibold hover:bg-blue-700 transition"
                    >
                      Sign Up
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
      </nav>

      {/* Hero Section */}
      <section
        className="py-20"
        style={{
          background: "linear-gradient(90deg, #4753a2 0%, #6e3bbf 100%)" // darker, richer purple gradient
        }}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-white text-center">
          <h1 className="text-4xl md:text-6xl font-bold mb-6">Your Ride, Your Way</h1>
          <p className="text-xl md:text-2xl mb-8 text-blue-100">
            Connect with trusted drivers and enjoy safe, comfortable rides anywhere, anytime
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            {!user && (
              <>
                <button
                  onClick={() => navigate("/signup")}
                  className="bg-white text-blue-600 hover:bg-gray-100 px-8 py-3 text-lg font-semibold rounded transition"
                >
                  Get Started
                </button>
                <button
                  onClick={() => navigate("/login")}
                  className="border border-white text-white hover:bg-white hover:text-blue-600 px-8 py-3 text-lg font-semibold rounded transition"
                >
                  Login
                </button>
              </>
            )}
            {user && (
              <button
                onClick={() => navigate("/booking")}
                className="bg-white text-blue-600 hover:bg-gray-100 px-8 py-3 text-lg font-semibold rounded flex items-center justify-center transition"
              >
                <Car className="mr-2 h-5 w-5" />
                Book a Ride
              </button>
            )}
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-16 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {stats.map((stat, index) => (
              <div key={index} className="text-center">
                <div className="text-3xl md:text-4xl font-bold text-blue-600 mb-2">{stat.number}</div>
                <div className="text-gray-600">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">Why Choose RideShare?</h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Experience the future of transportation with our cutting-edge features designed for your comfort and convenience
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {features.map((feature, index) => (
              <div key={index} className="bg-white rounded-xl shadow-lg p-6 flex flex-col items-start">
                <div className="mb-4">{feature.icon}</div>
                <h3 className="text-xl font-semibold mb-2">{feature.title}</h3>
                <p className="text-gray-600">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* How it Works Section */}
      <section id="how-it-works" className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">How It Works</h2>
            <p className="text-xl text-gray-600">Getting your ride is as easy as 1-2-3</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="text-center">
              <div className="bg-blue-600 text-white rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4 text-2xl font-bold">
                1
              </div>
              <h3 className="text-xl font-semibold mb-2">Book Your Ride</h3>
              <p className="text-gray-600">
                Enter your pickup and destination locations to find available drivers nearby
              </p>
            </div>
            <div className="text-center">
              <div className="bg-green-600 text-white rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4 text-2xl font-bold">
                2
              </div>
              <h3 className="text-xl font-semibold mb-2">Choose Your Driver</h3>
              <p className="text-gray-600">
                Select from verified drivers based on ratings, vehicle type, and estimated arrival time
              </p>
            </div>
            <div className="text-center">
              <div className="bg-purple-700 text-white rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4 text-2xl font-bold">
                3
              </div>
              <h3 className="text-xl font-semibold mb-2">Enjoy Your Ride</h3>
              <p className="text-gray-600">
                Track your ride in real-time and communicate with your driver through our chat feature
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section
        className="py-20"
        style={{
          background: "linear-gradient(90deg, #4753a2 0%, #6e3bbf 100%)"
        }}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center text-white">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">Ready to Start Your Journey?</h2>
          <p className="text-xl mb-8 text-blue-100">
            Join thousands of satisfied customers who trust RideShare for their daily commute
          </p>
          {!user ? (
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <button
                onClick={() => navigate("/booking")}
                className="bg-white text-blue-600 hover:bg-gray-100 px-8 py-3 font-semibold rounded flex items-center justify-center"
              >
                <Users className="mr-2 h-5 w-5" />
                Join as Passenger
              </button>
              <button
                onClick={() => navigate("/signup")}
                className="border border-white text-white hover:bg-white hover:text-blue-600 px-8 py-3 font-semibold rounded flex items-center justify-center"
              >
                <Car className="mr-2 h-5 w-5" />
                Become a Driver
              </button>
            </div>
          ) : (
            <button
              onClick={() => navigate("/booking")}
              className="bg-white text-blue-600 hover:bg-gray-100 px-8 py-3 font-semibold rounded flex items-center justify-center"
            >
              <Car className="mr-2 h-5 w-5" />
              Book Your Next Ride
            </button>
          )}
        </div>
      </section>

      {/* Footer */}
      <footer id="contact" className="bg-gray-900 text-white py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div>
              <div className="flex items-center mb-4">
                <Car className="h-8 w-8 text-blue-400" />
                <span className="ml-2 text-xl font-bold">RideShare</span>
              </div>
              <p className="text-gray-400">Your trusted partner for safe and comfortable rides across the city.</p>
            </div>
            <div>
              <h3 className="text-lg font-semibold mb-4">Quick Links</h3>
              <ul className="space-y-2 text-gray-400">
                <li>
                  <button onClick={() => document.getElementById("features").scrollIntoView({behavior: "smooth"})} className="hover:text-white bg-transparent border-none">
                    Features
                  </button>
                </li>
                <li>
                  <button onClick={() => document.getElementById("how-it-works").scrollIntoView({behavior: "smooth"})} className="hover:text-white bg-transparent border-none">
                    How it Works
                  </button>
                </li>
                <li>
                  <button onClick={() => navigate("/signup")} className="hover:text-white bg-transparent border-none">
                    Sign Up
                  </button>
                </li>
                <li>
                  <button onClick={() => navigate("/login")} className="hover:text-white bg-transparent border-none">
                    Login
                  </button>
                </li>
              </ul>
            </div>
            <div>
              <h3 className="text-lg font-semibold mb-4">Support</h3>
              <ul className="space-y-2 text-gray-400">
                <li>
                  <span className="hover:text-white">Help Center</span>
                </li>
                <li>
                  <span className="hover:text-white">Safety</span>
                </li>
                <li>
                  <span className="hover:text-white">Terms of Service</span>
                </li>
                <li>
                  <span className="hover:text-white">Privacy Policy</span>
                </li>
              </ul>
            </div>
            <div>
              <h3 className="text-lg font-semibold mb-4">Contact</h3>
              <ul className="space-y-2 text-gray-400">
                <li>Email: support@rideshare.com</li>
                <li>Phone: +1 (555) 123-4567</li>
                <li>24/7 Customer Support</li>
              </ul>
            </div>
          </div>
          <div className="border-t border-gray-800 mt-8 pt-8 text-center text-gray-400">
            <p>&copy; {new Date().getFullYear()} RideShare. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}