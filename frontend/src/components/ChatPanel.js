import React, { useState, useEffect, useRef } from "react";
import { useSocket } from "../context/SocketContext";
import "./ChatPanel.css";

const ChatPanel = ({ role, studentName, onClose }) => {
  const { socket } = useSocket();
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState("");
  const messagesEndRef = useRef(null);

  useEffect(() => {
    if (!socket) return;

    socket.on("chat-message", (message) => {
      setMessages((prev) => [...prev, message]);
    });

    socket.on("chat-history", (history) => {
      setMessages(history);
    });

    // Request chat history
    socket.emit("get-chat-history");

    return () => {
      socket.off("chat-message");
      socket.off("chat-history");
    };
  }, [socket]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const sendMessage = (e) => {
    e.preventDefault();

    if (!newMessage.trim()) return;

    const message = {
      text: newMessage.trim(),
      sender: role === "teacher" ? "Teacher" : studentName,
      role: role,
      timestamp: new Date(),
    };

    socket.emit("send-message", message);
    setNewMessage("");
  };

  return (
    <div className="chat-panel">
      <div className="chat-header">
        <h3>💬 Chat</h3>
        <button onClick={onClose} className="close-chat">
          ✕
        </button>
      </div>

      <div className="chat-messages">
        {messages.map((message, index) => (
          <div
            key={index}
            className={`message ${message.role} ${
              message.role === role ? "own" : ""
            }`}
          >
            <div className="message-sender">{message.sender}</div>
            <div className="message-text">{message.text}</div>
            <div className="message-time">
              {new Date(message.timestamp).toLocaleTimeString()}
            </div>
          </div>
        ))}
        <div ref={messagesEndRef} />
      </div>

      <form onSubmit={sendMessage} className="chat-input">
        <input
          type="text"
          value={newMessage}
          onChange={(e) => setNewMessage(e.target.value)}
          placeholder="Type a message..."
          maxLength={200}
        />
        <button type="submit" disabled={!newMessage.trim()}>
          Send
        </button>
      </form>
    </div>
  );
};

export default ChatPanel;
