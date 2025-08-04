# Microvid Backend

A robust backend for a YouTube-like video sharing platform, built with Node.js, Express, MongoDB, and Cloudinary. This project demonstrates scalable REST API design, secure authentication, file uploads, and modular code.

---

## 🚀 Features

- **User Authentication:** JWT-based login, registration, password change, and secure session management.
- **Video Upload & Management:** Upload videos and images to Cloudinary, manage user content, and track watch history.
- **Profile Management:** Update avatars, cover images, and user details.
- **RESTful API:** Clean, versioned endpoints with clear separation of concerns.
- **Error Handling:** Centralized error and response utilities for consistent API output.
- **Scalable Structure:** Modular folders for controllers, models, routes, middlewares, and utilities.

---

## 🛠️ Technologies Used

- **Node.js** & **Express.js**
- **MongoDB** with **Mongoose**
- **Cloudinary** (media storage)
- **JWT** (authentication)
- **Multer** (file uploads)
- **bcrypt** (password hashing)
- **cookie-parser**, **cors**, **dotenv**

---

## 📁 Project Structure

```
Microvid/
├── index.js
├── package.json
├── .env
├── public/
│   └── temp/
├── src/
│   ├── app.js
│   ├── constants.js
│   ├── index.js
│   ├── controllers/
│   │   └── user_controller.js
│   ├── db/
│   │   └── connection.js
│   ├── middlewares/
│   │   ├── multer.js
│   │   └── auth.middleware.js
│   ├── models/
│   │   ├── user.model.js
│   │   └── video.model.js
│   ├── routes/
│   │   └── user.route.js
│   └── utils/
│       ├── Apierror.js
│       ├── Apiresponse.js
│       ├── asyncHandler.js
│       └── cloudinary.js
```

---

## 📚 API Routes & Controllers

### User Routes (`/api/v1/users`)

- `POST /register` — Register a new user (with avatar/cover image upload)
- `POST /login` — User login
- `POST /logout` — Logout (JWT required)
- `POST /refreshToken` — Refresh access token
- `POST /change-password` — Change current password
- `GET /get-user` — Get current user profile
- `PATCH /update-user-details` — Update user details
- `PATCH /update-avatar` — Update avatar image
- `PATCH /update-coverimage` — Update cover image
- `GET /c/:username` — Get user channel profile
- `GET /watchhistory` — Get user watch history

### Controllers

- **registerUser:** Handles registration, validation, and file upload to Cloudinary.
- **loginUser:** Authenticates user and issues JWT tokens.
- **logoutUser:** Invalidates session.
- **refreshAccessToken:** Issues new access tokens using refresh tokens.
- **changeCurrentPassword:** Allows users to change their password securely.
- **getUser, getUserChannelProfile, getWatchHistory:** Fetch user/channel data and history.
- **updateAvatar, updateCoverImage, updateUserDetails:** Manage user profile and images.

---

## 🗄️ Database Models

### User Model

- `username`, `email`, `fullName`, `avatar`, `coverImage`, `password`, `refreshToken`, `watchHistory`
- Passwords are hashed with bcrypt.
- JWT tokens are generated for authentication.

### Video Model

- `videoFile`, `thumbnail`, `owner`, `title`, `description`, `views`, `duration`, `isPublished`
- Supports aggregate pagination for scalable video listing.

---

## ⚙️ Environment Variables (`.env`)

- `CLOUDINARY_CLOUD_NAME`, `CLOUDINARY_API_KEY`, `CLOUDINARY_API_SECRET`
- `PORT`, `MONGODB_URI`, `CORS_ORIGIN`
- `ACCESS_TOKEN_SECRET`, `ACCESS_TOKEN_PUBLIC_KEY`, `REFRESH_TOKEN_SECRET`, `REFRESH_TOKEN_PUBLIC_KEY`

---

## 🧑‍💻 How to Run

1. Clone the repo and install dependencies:
   ```bash
   git clone <repo-url>
   cd Microvid
   npm install
   ```
2. Set up your `.env` file (see above).
3. Start the server:
   ```bash
   npm run dev
   ```
4. Use Postman or similar tools to test the API endpoints.

---

## 📄 License

Licensed under the [#chaiaurcode](https://github.com/chaiaurcode) license.
