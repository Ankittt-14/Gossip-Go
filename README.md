# 🦅 Gossip-Go

![License](https://img.shields.io/badge/license-MIT-blue.svg)
![MERN](https://img.shields.io/badge/stack-MERN-green.svg)
![Socket.io](https://img.shields.io/badge/realtime-Socket.io-black.svg)
![Tailwind](https://img.shields.io/badge/style-TailwindCSS-06B6D4.svg)

**Gossip-Go** is a modern, feature-rich real-time financing application built to connect friends and groups seamlessly. Experience instant messaging with a sleek, responsive interface designed for the modern web.

---

## ✨ Features

### 💬 Real-Time Messaging & Collaboration
*   **Instant Chat**: Powered by Socket.io for zero-latency messaging.
*   **Group Chats**: Create groups, invite friends, and manage members with ease.
*   **Typing Indicators**: See when your friends are typing in 1-on-1 and Group chats.
*   **Online Status**: Real-time "Online" and "Offline" status updates.

### 🔔 Smart Notifications
*   **Ready Receipts**: Know when your message is Sent, Delivered, and Seen.
*   **Unread Badges**: Never miss a beat with red dot indicators for new messages and group invites.
*   **System Messages**: clear notifications for group events (joins, leaves, invites).

### 🤝 Social Features
*   **Friend System**: Send, accept, and reject friend requests.
*   **User Profiles**: Customizable avatars and statuses.

### 🎨 Modern UI/UX
*   **Responsive Design**: Fully optimized for Desktop, Tablet, and Mobile devices (using Dynamic Viewport Height).
*   **Dark Mode**: Sleek dark-themed interface for reduced eye strain.
*   **Glassmorphism & Gradients**: Aesthetic visual touches using TailwindCSS.

---

## 🛠️ Tech Stack

*   **Frontend**: React.js, Redux Toolkit, TailwindCSS, DaisyUI
*   **Backend**: Node.js, Express.js
*   **Database**: MongoDB
*   **Real-Time**: Socket.io
*   **Authentication**: JWT (JSON Web Tokens)

---

## 🚀 Getting Started

Follow these steps to get the project running on your local machine.

### Prerequisites
*   Node.js (v14+)
*   MongoDB (Local or Atlas URL)

### Installation

1.  **Clone the repository**
    ```bash
    git clone https://github.com/yourusername/Gossip-go.git
    cd Gossip-go
    ```

2.  **Setup Backend**
    ```bash
    cd server
    npm install
    ```
    *   Create a `.env` file in the `server` directory:
        ```env
        PORT=5000
        MONGO_DB_URL=your_mongodb_connection_string
        JWT_SECRET=your_jwt_secret
        CLIENT_URL=http://localhost:3000
        ```
    *   Start the server:
        ```bash
        npm run dev
        ```

3.  **Setup Frontend**
    ```bash
    cd client
    npm install
    ```
    *   Create a `.env` file in the `client` directory:
        ```env
        VITE_API_URL=http://localhost:5000
        ```
    *   Start the client:
        ```bash
        npm run dev
        ```

4.  **Open your browser**
    Visit `http://localhost:3000` (or the port shown in your terminal).

---

## 🤝 Contributing

Contributions are what make the open-source community such an amazing place to learn, inspire, and create. Any contributions you make are **greatly appreciated**.

1.  Fork the Project
2.  Create your Feature Branch (`git checkout -b feature/AmazingFeature`)
3.  Commit your Changes (`git commit -m 'Add some AmazingFeature'`)
4.  Push to the Branch (`git push origin feature/AmazingFeature`)
5.  Open a Pull Request

---

## 📧 Contact

**Maintainer** - [Ankit]

Project Link: https://gossip-go-zf2g.vercel.app/
GitHub: [Ankittt-14](https://github.com/Ankittt-14)
Repository: [https://github.com/Ankittt-14/Gossip-Go](https://github.com/Ankittt-14/Gossip-Go)


---

<div align="center">
  <sub>Built with ❤️ by the Gossip-Go Team</sub>
</div>