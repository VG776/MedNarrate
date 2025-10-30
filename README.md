# MedNarrate 🩺

MedNarrate is a full-stack web application that simplifies medical report interpretation, making healthcare information more accessible and understandable for everyone. It uses AI to analyze medical reports and provide clear, human-friendly explanations.

## Features 🌟

- **Medical Report Analysis**: Upload and analyze various medical reports (PDF, PNG, JPG, TXT)
- **Multi-language Support**: Get explanations in multiple languages (English, Hindi, Telugu, Malayalam, Kannada, Tamil)
- **Smart Visualization**: Interactive charts and timelines for test results
- **Secure User System**: Personal accounts with report history (optional)
- **Privacy-First**: Local processing and optional history saving
- **AI-Powered**: Uses Google's Gemini AI for accurate medical interpretation

## Project Structure 📁

```
mednarrate/
├── backend/                 # Backend server
│   ├── login/              # Authentication system
│   │   ├── authMiddleware.js
│   │   ├── authRoutes.js
│   │   ├── db.js
│   │   ├── userModel.js
│   │   └── reportModel.js
│   ├── app.js             # Auth server (Port 5001)
│   └── server.js          # Main API server (Port 5000)
└── frontend/              # React frontend
    ├── src/
    │   ├── components/    # React components
    │   ├── pages/        # Page components
    │   └── assets/       # Static assets
    └── public/           # Public assets
```

## Tech Stack 💻

### Backend
- Node.js & Express
- MongoDB (Database)
- Google Gemini AI API
- Tesseract.js (OCR)
- JWT Authentication
- PDF processing tools

### Frontend
- React + TypeScript
- Tailwind CSS
- Framer Motion
- Chart.js
- Shadcn/ui components

## Setup Instructions 🚀

### Prerequisites
- Node.js (v16+)
- MongoDB
- Google Gemini API key

### Backend Setup

1. Navigate to backend directory:
   ```bash
   cd backend
   npm install
   ```

2. Create `.env` file in backend directory:
   ```env
   MONGODB_URI=mongodb://localhost:27017/mednarrate
   JWT_SECRET=your-jwt-secret-key-here
   GEMINI_API_KEY=your-gemini-api-key-here
   ```

3. Start the servers:
   ```bash
   # Start auth server (Port 5001)
   node app.js

   # Start main API server (Port 5000)
   node server.js
   ```

### Frontend Setup

1. Navigate to frontend directory:
   ```bash
   cd frontend
   npm install
   npm run dev
   ```

The frontend will be available at `http://localhost:8080`

## API Documentation 📚

### Authentication Endpoints

#### POST `/api/auth/register`
Register a new user
- Body: `{ name, email, password }`
- Returns: User object with JWT token (in cookie)

#### POST `/api/auth/login`
Login existing user
- Body: `{ email, password }`
- Returns: User object with JWT token (in cookie)

#### POST `/api/auth/logout`
Logout user
- Requires: Valid JWT token
- Action: Clears auth cookie

#### GET `/api/auth/me`
Get current user info
- Requires: Valid JWT token
- Returns: User object

### Report Analysis Endpoints

#### POST `/analyze`
Analyze a medical report
- Method: POST
- Content-Type: multipart/form-data
- Fields:
  - `file`: PDF/PNG/JPG/TXT file
  - `language`: Language for response
- Returns: Detailed analysis JSON

#### POST `/translate`
Translate analysis to another language
- Body: `{ text, target }`
- Returns: Translated text

## Security Features 🔒

- JWT-based authentication
- HTTP-only cookies
- CORS protection
- Password hashing
- Rate limiting
- Optional report history
- Privacy controls

## Features in Detail 🔍

### Report Analysis
- Text extraction from multiple formats
- Smart test value parsing
- Range analysis
- Lifestyle recommendations
- Historical tracking
- Visualization-ready data

### User Privacy
- Optional history saving
- Local file processing
- Secure data transmission
- No third-party tracking

### Visualization
- Interactive charts
- Timeline views
- Color-coded results
- Trend analysis

## Error Handling 🛠

The application includes comprehensive error handling for:
- File uploads
- Authentication
- Database operations
- API requests
- Network issues

## Contributing 🤝

1. Fork the repository
2. Create your feature branch
3. Commit your changes
4. Push to the branch
5. Create a Pull Request

## License 📄

This project is licensed under the MIT License - see the LICENSE file for details.

## Acknowledgments 👏

- Google Gemini AI for medical text analysis
- Tesseract.js for OCR capabilities
- The open-source community for various tools and libraries

---

For more information or support, please open an issue in the repository.