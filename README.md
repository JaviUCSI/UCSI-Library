# UCSI International School Library Management System

A comprehensive library management system for UCSI International School, featuring both a modern web frontend and a robust backend API.

## 🚀 Features

### Frontend (Web Interface)
- **Modern, responsive design** optimized for all devices
- **Dashboard** with real-time statistics and recent activity
- **Book management** with import/export capabilities (CSV/Excel)
- **User management** for students, teachers, and staff
- **Loan tracking** with due date monitoring and overdue alerts
- **Advanced search and filtering** across all data
- **Reports generation** with popular books and user statistics
- **Data persistence** using localStorage (frontend) or MongoDB (with backend)

### Backend API
- **RESTful API** built with Node.js and Express.js
- **MongoDB integration** for persistent data storage
- **Comprehensive validation** and error handling
- **Security features** including rate limiting and CORS protection
- **Statistics and reporting** endpoints
- **Search and pagination** support
- **User authentication** capabilities (optional)

## 📁 Project Structure

```
UCSI-Library/
├── index.html              # Main frontend application
├── README.md              # Main project documentation
└── server/                # Backend API
    ├── config/
    │   └── database.js    # MongoDB connection
    ├── middleware/
    │   ├── errorHandler.js
    │   └── validation.js
    ├── models/
    │   ├── Book.js
    │   ├── User.js
    │   └── Loan.js
    ├── routes/
    │   ├── books.js
    │   ├── users.js
    │   └── loans.js
    ├── .env.example       # Environment variables template
    ├── .gitignore
    ├── package.json
    ├── README.md          # Backend documentation
    └── server.js          # Main server file
```

## 🏃‍♂️ Quick Start

### Frontend Only (Using Local Storage)

1. **Open the application:**
   Simply open `index.html` in your web browser. The application will work immediately with local storage for data persistence.

### With Backend API (Recommended for Production)

1. **Set up the backend:**
   ```bash
   cd server
   npm install
   cp .env.example .env
   # Edit .env with your MongoDB connection details
   npm run dev
   ```

2. **Open the frontend:**
   Open `index.html` in your browser and optionally modify it to connect to the backend API.

## 🗄️ Backend Setup (Detailed)

### Prerequisites
- Node.js 16.0.0 or higher
- MongoDB Atlas account (free tier available)

### Installation Steps

1. **Navigate to server directory:**
   ```bash
   cd server
   ```

2. **Install dependencies:**
   ```bash
   npm install
   ```

3. **Configure environment variables:**
   ```bash
   cp .env.example .env
   ```
   
   Edit `.env` file with your settings:
   ```env
   MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/ucsi-library
   PORT=5000
   NODE_ENV=development
   JWT_SECRET=your-super-secret-jwt-key
   FRONTEND_URL=http://localhost:3000
   ```

4. **Set up MongoDB Atlas:**
   - Create account at [MongoDB Atlas](https://www.mongodb.com/cloud/atlas)
   - Create a new cluster (free M0 tier)
   - Create database user with read/write permissions
   - Whitelist your IP address
   - Get connection string and update `MONGODB_URI` in `.env`

5. **Start the server:**
   ```bash
   # Development mode (auto-reload)
   npm run dev
   
   # Production mode
   npm start
   ```

6. **Verify installation:**
   Visit `http://localhost:5000/api/health` to confirm the API is running.

## 📡 API Endpoints

### Books
- `GET /api/books` - List all books (with pagination & search)
- `POST /api/books` - Create new book
- `GET /api/books/:id` - Get specific book
- `PUT /api/books/:id` - Update book
- `DELETE /api/books/:id` - Delete book
- `GET /api/books/stats/overview` - Book statistics

### Users
- `GET /api/users` - List all users
- `POST /api/users` - Create new user
- `GET /api/users/:id` - Get specific user
- `PUT /api/users/:id` - Update user
- `DELETE /api/users/:id` - Delete user
- `GET /api/users/:id/loans` - User's loan history
- `GET /api/users/stats/overview` - User statistics

### Loans
- `GET /api/loans` - List all loans
- `POST /api/loans` - Create new loan
- `GET /api/loans/:id` - Get specific loan
- `PUT /api/loans/:id` - Update loan
- `PUT /api/loans/:id/return` - Return book
- `DELETE /api/loans/:id` - Delete loan
- `GET /api/loans/overdue/list` - Overdue loans
- `GET /api/loans/stats/overview` - Loan statistics

## 🔧 Configuration

### Environment Variables
```env
# MongoDB Configuration
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/ucsi-library

# Server Configuration
PORT=5000
NODE_ENV=development

# Security
JWT_SECRET=your-secure-secret-key
FRONTEND_URL=http://localhost:3000
```

### CORS Configuration
The backend is configured to accept requests from your frontend. Update `FRONTEND_URL` in your `.env` file to match your frontend's URL.

## 🔗 Frontend Integration

To connect the existing frontend to the backend API:

1. **Replace localStorage calls** with API fetch calls
2. **Handle async operations** with promises/async-await
3. **Update data management** functions

Example transformation:
```javascript
// Before (localStorage):
let books = JSON.parse(localStorage.getItem('books')) || [];

// After (API):
async function fetchBooks() {
  try {
    const response = await fetch('http://localhost:5000/api/books');
    const data = await response.json();
    return data.data;
  } catch (error) {
    console.error('Error fetching books:', error);
    return [];
  }
}
```

## 📊 Data Models

### Book
- Title, Author, ISBN
- Publisher, Publication Year
- Category, Location
- Availability status

### User
- Name, Email, User Type
- Phone, Department/Class
- Active status
- Optional password for authentication

### Loan
- Book and User references
- Loan date, Due date, Return date
- Return status, Overdue tracking
- Optional notes

## 🛡️ Security Features

- **Helmet.js** for HTTP header security
- **CORS** protection with configurable origins
- **Rate limiting** to prevent API abuse
- **Input validation** and sanitization
- **Password hashing** with bcrypt
- **Error handling** without information leakage

## 🚀 Deployment

### Frontend
Deploy `index.html` to any static hosting service:
- GitHub Pages
- Netlify
- Vercel
- AWS S3

### Backend
Deploy to cloud platforms:
- Heroku
- Railway
- DigitalOcean
- AWS Elastic Beanstalk

## 📈 Usage Statistics

The system provides comprehensive statistics including:
- Total books, users, and active loans
- Overdue items tracking
- Popular books and categories
- User activity patterns
- Loan trends and patterns

## 🎯 Use Cases

- **School Libraries** - Complete library management
- **Classroom Collections** - Teacher book tracking
- **Reading Programs** - Student reading progress
- **Resource Centers** - Educational material management
- **Book Clubs** - Community book sharing

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch: `git checkout -b feature-name`
3. Make your changes and test thoroughly
4. Commit your changes: `git commit -m 'Add feature'`
5. Push to the branch: `git push origin feature-name`
6. Submit a pull request

## 📄 License

This project is created for educational purposes as part of the UCSI International School Library Management System.

## 🆘 Support

For technical support or questions:

1. **Check the documentation** in `/server/README.md` for detailed API information
2. **Review console logs** for error messages
3. **Verify environment configuration** and database connectivity
4. **Ensure proper network setup** for MongoDB Atlas

## 🔄 Future Enhancements

- **Mobile app** integration
- **Barcode scanning** for books
- **Email notifications** for due dates
- **Advanced reporting** and analytics
- **Integration with school systems**
- **Multi-language support**

---

**UCSI International School Library Management System** - Empowering education through efficient library management.