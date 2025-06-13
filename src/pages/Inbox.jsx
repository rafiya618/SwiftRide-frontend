import React, { useEffect, useState } from 'react';
import axios from 'axios';
import ChatRoom from './ChatRoom';
import { FaInbox, FaArrowLeft, FaUserTie, FaUser } from 'react-icons/fa';
import { Car } from "lucide-react";

const Inbox = () => {
  const userObj = JSON.parse(localStorage.getItem('user') || '{}');
  const userId = userObj.id;
  const userRole = userObj.role || 'passenger';
  const [chatRooms, setChatRooms] = useState([]);
  const [selectedRoom, setSelectedRoom] = useState(null);
  const [isMobile, setIsMobile] = useState(window.innerWidth <= 768);

  useEffect(() => {
    const fetchChatRooms = async () => {
      try {
        const response = await axios.get(
          `${process.env.REACT_APP_BACKEND_URL}/api/v1/chat/rooms/${userId}`
        );
        setChatRooms(response.data);
      } catch (error) {
        console.error('Failed to fetch chat rooms:', error);
      }
    };
    fetchChatRooms();
  }, [userId]);

  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth <= 768);
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const openChatRoom = (room) => setSelectedRoom(room);
  const goBackToInbox = () => setSelectedRoom(null);

  // Color scheme classes
  const gradientMain = "bg-gradient-to-tr from-[#e7edfb] via-[#e2e7fa] to-[#e9effc]";
  const navShadow = "shadow-md";

  // Helper to determine the other participant label
  function getOtherParticipant(room) {
    if (!room) return '';
    // Always show 'Passenger' for driver, 'Driver' for passenger
    if (userRole === "driver") {
      return room.passengerName || "Passenger";
    } else {
      return room.driverName || "Driver";
    }
  }
  // Helper to determine icon
  function getOtherIcon(room) {
    if (!room) return null;
    // Show icon for the other participant
    if (userRole === "driver") {
      return <FaUserTie className="h-6 w-6 text-indigo-600" />; // passenger icon
    }
    return <FaUser className="h-6 w-6 text-blue-600" />; // driver icon
  }

  // NavBar
  let fullName = userObj.fullName || '';
  return (
    <div className={`flex flex-col min-h-screen ${gradientMain}`}>
      {/* Main Content */}
      <div className="flex-1 flex h-[calc(100vh-4rem)]">
        {/* Inbox Section */}
        {!isMobile || !selectedRoom ? (
          <div className={`w-full md:w-1/3 bg-white/80 shadow-2xl p-6 overflow-y-auto ${isMobile && selectedRoom ? 'hidden' : ''}`}>
            <h2 className="text-2xl font-bold text-gray-900 flex items-center mb-6 tracking-tight">
              <FaInbox className="mr-2 text-blue-600" /> Chats
            </h2>
            {chatRooms.length === 0 ? (
              <p className="text-gray-500">No conversations yet</p>
            ) : (
              chatRooms.map((room) => (
                <div
                  key={room._id}
                  className={`p-4 mb-3 shadow cursor-pointer hover:shadow-lg transition flex items-center ${
                    selectedRoom && selectedRoom._id === room._id
                      ? 'bg-gradient-to-r from-blue-100 to-indigo-100 border-l-4 border-blue-600'
                      : 'bg-gray-50'
                  }`}
                  style={{ borderRadius: 0 }}
                  onClick={() => openChatRoom(room)}
                >
                  <div className="mr-3 flex-shrink-0">
                    {getOtherIcon(room)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-semibold text-gray-800 truncate">
                      You and {getOtherParticipant(room)}
                    </p>
                    <p className="text-sm text-gray-600 truncate">{room.latestMessage || 'No messages yet'}</p>
                    <p className="text-xs text-gray-400 truncate">
                      {room.latestCreatedAt
                        ? new Date(room.latestCreatedAt).toLocaleString()
                        : 'No recent activity'}
                    </p>
                  </div>
                </div>
              ))
            )}
          </div>
        ) : null}

        {/* Chat Room Section */}
        {!isMobile || selectedRoom ? (
          <div className={`flex-1 flex flex-col items-center justify-center bg-gradient-to-br from-[#3342a1] to-[#1a237e] p-6 min-h-screen ${isMobile && !selectedRoom ? 'hidden' : ''}`}>
            <div className="w-full max-w-2xl mx-auto">
              {selectedRoom ? (
                <>
                  {isMobile && (
                    <button
                      onClick={goBackToInbox}
                      className="mb-4 flex items-center px-4 py-2 rounded-lg bg-white text-blue-600 border border-blue-600 font-semibold hover:bg-blue-50 transition"
                    >
                      <FaArrowLeft className="mr-2" /> Back
                    </button>
                  )}
                  <ChatRoom
                    roomId={selectedRoom._id}
                    senderId={userId}
                    receiverId={selectedRoom.latestReceiverId}
                    role={userRole}
                    // Pass otherName as the opposite role
                    otherName={userRole === "driver"
                      ? (selectedRoom.passengerName || "Passenger")
                      : (selectedRoom.driverName || "Driver")
                    }
                  />
                </>
              ) : (
                <h2 className="text-xl font-bold text-white text-center mt-16">
                  Select a conversation to start chatting
                </h2>
              )}
            </div>
          </div>
        ) : null}
      </div>
    </div>
  );
};

export default Inbox;