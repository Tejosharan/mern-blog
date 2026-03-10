# MERN Blog Platform

A full-stack blog application built with the MERN stack (MongoDB, Express.js, React, Node.js) featuring JWT authentication, CRUD operations, likes, and comments.

## Features
- User registration & login with JWT authentication
- Create, read, update, delete blog posts
- Like posts and add comments
- Search posts by title
- Filter posts by tags
- Responsive dark-themed UI

## Tech Stack
- **Frontend:** React, React Router DOM, Axios
- **Backend:** Node.js, Express.js, MongoDB, Mongoose
- **Auth:** JWT (JSON Web Tokens), bcryptjs
- **Database:** MongoDB

## Project Structure
```
mern-blog/
├── backend/
│   ├── models/         # User, Post schemas
│   ├── routes/         # auth, posts API routes
│   ├── middleware/     # JWT auth middleware
│   └── server.js
└── frontend/
    └── src/
        └── App.js
```

## Getting Started

### Backend
```bash
cd backend
npm install
# Create .env file:
# MONGO_URI=mongodb://localhost:27017/mern-blog
# JWT_SECRET=your_secret_key
npm run dev
```

### Frontend
```bash
cd frontend
npm install
npm start
```

## API Endpoints
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | /api/auth/register | Register user |
| POST | /api/auth/login | Login user |
| GET | /api/auth/me | Get current user |
| GET | /api/posts | Get all posts |
| GET | /api/posts/:id | Get single post |
| POST | /api/posts | Create post (auth) |
| PUT | /api/posts/:id | Update post (auth) |
| DELETE | /api/posts/:id | Delete post (auth) |
| POST | /api/posts/:id/like | Like/unlike post (auth) |
| POST | /api/posts/:id/comments | Add comment (auth) |
