# 🗳️ Live Polling System

A real-time polling application that enables teachers to create live polls and students to participate with instant results. Built with React, Express.js, and Socket.io for seamless real-time communication.

![Live Polling Demo](https://via.placeholder.com/800x400/007bff/ffffff?text=Live+Polling+System)

## ✨ Features

### 🎓 Teacher Dashboard
- Create polls with multiple options
- View live polling results with real-time updates
- Smart poll creation logic (only when no active poll OR all students answered)
- Student management and removal capabilities
- Poll history and analytics
- Real-time chat with students

### 📱 Student Interface
- Simple name entry system (unique to each browser tab)
- Submit answers to active polls
- View live results after submission
- 60-second timer with automatic poll ending
- Real-time result updates
- Interactive chat with teacher

### 🚀 Technical Features
- **Real-time Communication**: Bidirectional Socket.io connections
- **Responsive Design**: Works on desktop, tablet, and mobile
- **Live Charts**: Interactive data visualization with Chart.js
- **Progressive Web App**: Service worker and offline capabilities
- **Production Ready**: Rate limiting, input validation, CORS protection

## 🛠️ Tech Stack

**Frontend:**
- React 18+
- Socket.io Client
- React Router
- Chart.js & React Chart.js 2
- CSS3 with Flexbox/Grid

**Backend:**
- Node.js & Express.js
- Socket.io Server
- CORS middleware
- In-memory data storage

**DevOps:**
- Heroku (Backend deployment)
- Netlify (Frontend deployment)

