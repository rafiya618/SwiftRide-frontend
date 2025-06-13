import React, { useEffect, useState, useCallback, useRef } from 'react';
import { io } from 'socket.io-client';
import axios from 'axios';
import { FaPaperPlane, FaUserTie, FaUser } from 'react-icons/fa';

const ChatRoom = ({ roomId, senderId, receiverId, role, otherName }) => {
  // Use id from user object in localStorage
  const userObj = JSON.parse(localStorage.getItem('user') || '{}');
  const userId = userObj.id;
  const [socket, setSocket] = useState(null);
  const [message, setMessage] = useState('');
  const [messages, setMessages] = useState([]);
  const [otherDisplayName, setOtherDisplayName] = useState(otherName || '');

  const scrollRef = useRef();

  // Get user role from localStorage if not provided
  let localRole = role || localStorage.getItem('role') || 'passenger';

  useEffect(() => {
    const newSocket = io(process.env.REACT_APP_BACKEND_URL);
    setSocket(newSocket);

    return () => {
      if (newSocket) newSocket.disconnect();
    };
  }, []);

  useEffect(() => {
    if (!socket || !roomId) return;

    socket.emit('joinRoom', { roomId, userId });

    const handleNewMessage = (newMessage) => {
      setMessages((prevMessages) => [...prevMessages, newMessage]);
    };
    socket.on('newMessage', handleNewMessage);

    return () => {
      socket.off('newMessage', handleNewMessage);
    };
  }, [socket, roomId, userId]);

  const loadChatMessages = useCallback(async () => {
    if (!roomId) return;
    try {
      const response = await axios.get(
        `${process.env.REACT_APP_BACKEND_URL}/api/v1/chat/messages/${roomId}`
      );
      setMessages(response.data);

      // Try to get the "other" participant's name if not already supplied
      if (!otherName) {
        const otherMsg = response.data.find(msg => msg.senderId !== userId);
        if (otherMsg && otherMsg.senderName) setOtherDisplayName(otherMsg.senderName);
        else if (response.data.length && response.data[0].senderId !== userId && response.data[0].senderName)
          setOtherDisplayName(response.data[0].senderName);
      }
    } catch (error) {
      console.error('Failed to load chat messages:', error);
    }
  }, [roomId, userId, otherName]);

  useEffect(() => {
    loadChatMessages();
  }, [loadChatMessages]);

  useEffect(() => {
    // Auto scroll to bottom
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  const sendMessage = async () => {
    const trimmedMessage = message.trim();
    if (!trimmedMessage) return;

    // Infer receiverId if not provided
    let actualReceiverId = receiverId;
    if (!actualReceiverId && messages.length > 0) {
      // Find the other participant in the chat
      const otherParticipant = messages.find(
        (msg) => msg.senderId !== userId
      );
      actualReceiverId = otherParticipant
        ? otherParticipant.senderId
        : null;
    }

    if (!actualReceiverId) {
      console.error('Receiver ID could not be determined.');
      return;
    }

    const newMessage = {
      roomId,
      senderId: userId,
      receiverId: actualReceiverId,
      message: trimmedMessage,
    };

    try {
      await axios.post(`${process.env.REACT_APP_BACKEND_URL}/api/v1/chat/message`, newMessage);
      if (socket) {
        socket.emit('sendMessage', newMessage);
      }
      setMessage('');
    } catch (error) {
      console.error('Failed to send message:', error);
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter') sendMessage();
  };

  // Determine the other participant role and name for heading
  let chatWith = otherDisplayName || '';
  if (!chatWith && messages.length > 0) {
    const otherMsg = messages.find(msg => msg.senderId !== userId);
    if (otherMsg) {
      if (otherMsg.senderName) chatWith = otherMsg.senderName;
      else if (localRole === 'driver') chatWith = 'Passenger';
      else chatWith = 'Driver';
    }
  } else if (!chatWith) {
    chatWith = localRole === 'driver' ? 'Passenger' : 'Driver';
  }

  // Blue button and light purple tag
  const blueBtn = "bg-blue-600 hover:bg-blue-700 text-white";
  const purpleTag = "bg-gradient-to-tr from-indigo-100 to-blue-100 text-blue-700";

  // Show "You and Driver" or "You and Passenger"
  let chatHeading = '';
  let topTag = '';
  let oppositeRole = '';
  if (localRole === "driver") {
    chatHeading = `You and ${chatWith || 'Passenger'}`;
    topTag = "Driver";
    oppositeRole = "Passenger";
  } else {
    chatHeading = `You and ${chatWith || 'Driver'}`;
    topTag = "Passenger";
    oppositeRole = "Driver";
  }

  // Gradient colors for message bubbles
  // Passenger: purple gradient; Driver: blue gradient
  // If you are driver, your messages are blue, their messages are purple
  // If you are passenger, your messages are purple, their messages are blue
  function getBubbleGradient(isMine) {
    if (localRole === "driver") {
      // driver: own = blue, other = purple
      return isMine
        ? "bg-gradient-to-br from-blue-400 via-blue-300 to-blue-200 text-white font-semibold"
        : "bg-gradient-to-br from-indigo-400 via-purple-300 to-indigo-200 text-white font-semibold";
    } else {
      // passenger: own = purple, other = blue
      return isMine
        ? "bg-gradient-to-br from-indigo-500 via-purple-400 to-indigo-200 text-white font-semibold"
        : "bg-gradient-to-br from-blue-400 via-blue-300 to-blue-200 text-white font-semibold";
    }
  }

  function getRoleLabel(isMine) {
    if (isMine) return "You";
    return oppositeRole;
  }

  return (
    <div className="flex flex-col w-full h-[70vh] max-h-[75vh] rounded-xl shadow-xl border border-gray-200 bg-white/90">
      {/* Chat header */}
      <div className="flex items-center justify-between px-6 py-4 border-b bg-white/80 rounded-t-xl">
        <div className="flex items-center gap-3">
          {localRole === 'driver'
            ? <FaUserTie className="h-6 w-6 text-indigo-600" />
            : <FaUser className="h-6 w-6 text-blue-600" />}
          <span className="text-lg font-bold text-gray-900 tracking-tight truncate">
            {chatHeading}
          </span>
        </div>
        <span className={`px-3 py-1 rounded-full text-xs font-semibold capitalize shadow border ${purpleTag}`}>
          {topTag}
        </span>
      </div>
      {/* Chat messages */}
      <div ref={scrollRef} className="flex-grow overflow-y-auto p-6 bg-gradient-to-tr from-[#dbeafe] to-[#e0e7ff]">
        {messages.length === 0 && (
          <div className="text-center text-gray-400 pt-12">
            No messages yet. Start the conversation!
          </div>
        )}
        {messages.map((msg, index) => {
          const isMine = msg.senderId === userId;
          return (
            <div
              key={index}
              className={`mb-3 max-w-[70%] p-3 rounded-2xl shadow-md break-words ${getBubbleGradient(isMine)} ${
                isMine ? 'self-end ml-auto' : 'self-start mr-auto'
              }`}
              style={{
                alignSelf: isMine ? 'flex-end' : 'flex-start',
              }}
            >
              <div className="text-xs font-semibold text-white/80 mb-1 truncate">
                {getRoleLabel(isMine)}
              </div>
              <div className="text-base text-white break-words">{msg.message}</div>
            </div>
          );
        })}
      </div>
      {/* Chat input */}
      <div className="flex items-center px-6 py-4 border-t bg-white rounded-b-xl">
        <input
          type="text"
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          onKeyPress={handleKeyPress}
          className="flex-grow px-4 py-3 rounded-full border border-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-600 text-base bg-white shadow"
          placeholder="Type your message..."
        />
        <button
          onClick={sendMessage}
          className={`ml-3 px-5 py-3 ${blueBtn} rounded-full hover:shadow-lg flex items-center font-semibold text-base transition`}
        >
          <FaPaperPlane className="mr-2" /> Send
        </button>
      </div>
    </div>
  );
};

export default ChatRoom;