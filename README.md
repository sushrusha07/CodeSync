# CodeSync – Real-Time Collaborative Code Editor

## Overview

CodeSync is a web-based real-time collaborative code editor that allows multiple users to join a shared room and work on code simultaneously. It enables seamless collaboration through instant code synchronization, integrated chat, and in-browser code execution.

The application is designed to simulate a lightweight pair-programming environment where users can write, test, and discuss code together in real time.

---

## Features

* Real-time collaborative editing using WebSockets
* Room-based architecture for isolated sessions
* Live synchronization of code across all connected users
* Integrated chat system within each room
* Code execution support via external API
* File upload with preview and editor integration
* Syntax highlighting for multiple languages
* Theme selection for editor customization
* Join/leave notifications for active users

---

## Tech Stack

**Frontend**

* React.js
* Recoil (state management)
* CodeMirror (code editor)

**Backend**

* Node.js
* Express.js
* Socket.IO

**Other Integrations**

* Judge0 API for code execution

---

## Project Structure

CodeSync/
│
├── src/                # Frontend (React)
├── server.js           # Backend server (Socket.IO + Express)
├── public/             # Static assets
└── package.json

---

## Installation and Setup

### Clone the repository

git clone https://github.com/sushrusha07/CodeSync.git
cd CodeSync

### Install dependencies

npm install

### Run the backend server

node server.js

### Run the frontend

npm start

### Open in browser

http://localhost:3000

---

## Usage

1. Enter a username and create or join a room
2. Share the room ID with others
3. Collaborate in real time
4. Use chat for communication
5. Execute code directly in the editor

---

## Key Implementation Details

* WebSocket communication handled using Socket.IO
* Room-based user management with socket mapping
* Real-time broadcasting of code changes and messages
* State synchronization across multiple clients
* API-based code execution integrated into frontend

---

## Known Limitations

* No authentication system
* No persistent storage of sessions
* Limited language support in execution
* No cursor tracking for multiple users

---

## Future Improvements

* Authentication and user profiles
* Persistent session storage
* Cursor position tracking for users
* Voice/video communication
* Deployment for public access

---

## Author

Sushrusha Palla
GitHub: https://github.com/sushrusha07

---

## License

This project is for educational purposes.
