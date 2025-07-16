# Tracker App

Tracker App is a full-stack web application built with Next.js that allows users to manage projects, daily diaries, final reports, certificates, and user profiles. It features user authentication, file uploads, and a dashboard for managing various resources. The app uses MongoDB for data storage and integrates with Cloudinary for image and file hosting.

## Features

- User registration, login, and authentication
- Project management with listing and details
- Daily diary entries management
- Upload and manage final reports
- Certificate management and display
- User profile management
- File uploads with Cloudinary integration
- Responsive dashboard interface
- API routes for all core functionalities

## Technologies Used

- Next.js (React framework)
- MongoDB with Mongoose ODM
- Cloudinary for media storage
- Multer for handling file uploads
- Tailwind CSS for styling
- JavaScript (ES6+)
- Node.js

## Installation

1. Clone the repository:

```bash
git clone <repository-url>
cd tracker-app
```

2. Install dependencies:

```bash
npm install
# or
yarn install
```

3. Set up environment variables:

Create a `.env.local` file in the root directory and add the following variables:

```
MONGODB_URI=your_mongodb_connection_string
CLOUDINARY_CLOUD_NAME=your_cloudinary_cloud_name
CLOUDINARY_API_KEY=your_cloudinary_api_key
CLOUDINARY_API_SECRET=your_cloudinary_api_secret
JWT_SECRET="supersecretkey"
NEXT_PUBLIC_BASE_URL="http://localhost:3000"
NODE_ENV=development

```

4. Run the development server:

```bash
npm run dev
# or
yarn dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser to see the app.

## Usage

- Register a new user or login with existing credentials.
- Use the dashboard to manage projects, daily diaries, final reports, and certificates.
- Upload files and images as needed.
- View and update your user profile.

## Folder Structure

- `components/` - React components for UI and pages
- `lib/` - Utility libraries for database connection, file uploads, and Cloudinary integration
- `models/` - Mongoose models for data schemas
- `pages/` - Next.js pages and API routes
- `public/` - Static assets and uploaded files
- `styles/` - Global and component-specific styles

## API Routes

- `/api/auth/` - Authentication endpoints (login, logout, register)
- `/api/project.js` - Project management endpoints
- `/api/daily-diaries.js` - Daily diary endpoints
- `/api/finalreport.js` - Final report endpoints
- `/api/user/` - User profile and certificate endpoints
- `/api/current/` - Current day related endpoints

## Deployment

The app can be deployed easily on Vercel, the platform from the creators of Next.js. See [Vercel deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for details.

## License

This project is licensed under the MIT License.

---

For more information, refer to the source code and comments within the project files.
