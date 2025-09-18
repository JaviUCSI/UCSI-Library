# UCSI Library Management System - Backend API

A Node.js backend API for the UCSI Library Management System using Express.js and MongoDB.

## Features

- **RESTful API** for managing books, users, and loans
- **MongoDB** integration with Mongoose ODM
- **Data validation** using express-validator
- **Error handling** with custom error classes
- **Security** features including CORS, Helmet, and rate limiting
- **Comprehensive endpoints** for CRUD operations
- **Statistics and reporting** endpoints
- **Search and filtering** capabilities
- **Pagination** support

## Prerequisites

- Node.js 16.0.0 or higher
- MongoDB Atlas account (or local MongoDB instance)
- npm or yarn package manager

## Installation

1. **Navigate to the server directory:**
   ```bash
   cd server
   ```

2. **Install dependencies:**
   ```bash
   npm install
   ```

3. **Set up environment variables:**
   ```bash
   cp .env.example .env
   ```
   
   Edit the `.env` file with your configuration:
   ```env
   MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/ucsi-library?retryWrites=true&w=majority
   PORT=5000
   NODE_ENV=development
   JWT_SECRET=your-super-secret-jwt-key-change-this-in-production
   JWT_EXPIRE=7d
   FRONTEND_URL=http://localhost:3000
   ```

4. **Start the server:**
   ```bash
   # Development mode with auto-reload
   npm run dev
   
   # Production mode
   npm start
   ```

## MongoDB Atlas Setup

1. **Create a MongoDB Atlas account** at [https://www.mongodb.com/cloud/atlas](https://www.mongodb.com/cloud/atlas)

2. **Create a new cluster:**
   - Choose the free tier (M0)
   - Select your preferred cloud provider and region

3. **Create a database user:**
   - Go to "Database Access" in the left sidebar
   - Click "Add New Database User"
   - Choose "Password" authentication
   - Set username and password
   - Grant "Atlas admin" privileges

4. **Configure network access:**
   - Go to "Network Access" in the left sidebar
   - Click "Add IP Address"
   - Either add your current IP or use "0.0.0.0/0" for development (less secure)

5. **Get your connection string:**
   - Go to "Clusters" and click "Connect"
   - Choose "Connect your application"
   - Copy the connection string and replace `<password>` with your database user password

## API Endpoints

### Health Check
- `GET /api/health` - API health check

### Books
- `GET /api/books` - Get all books (with pagination, search, filtering)
- `GET /api/books/:id` - Get a specific book
- `POST /api/books` - Create a new book
- `PUT /api/books/:id` - Update a book
- `DELETE /api/books/:id` - Delete a book
- `GET /api/books/stats/overview` - Get book statistics

### Users
- `GET /api/users` - Get all users (with pagination, search, filtering)
- `GET /api/users/:id` - Get a specific user
- `POST /api/users` - Create a new user
- `PUT /api/users/:id` - Update a user
- `DELETE /api/users/:id` - Delete a user
- `GET /api/users/:id/loans` - Get user's loan history
- `GET /api/users/stats/overview` - Get user statistics

### Loans
- `GET /api/loans` - Get all loans (with pagination, filtering)
- `GET /api/loans/:id` - Get a specific loan
- `POST /api/loans` - Create a new loan
- `PUT /api/loans/:id` - Update a loan
- `PUT /api/loans/:id/return` - Return a book
- `DELETE /api/loans/:id` - Delete a loan
- `GET /api/loans/overdue/list` - Get overdue loans
- `GET /api/loans/stats/overview` - Get loan statistics

## Request/Response Examples

### Create a Book
```bash
curl -X POST http://localhost:5000/api/books \
  -H "Content-Type: application/json" \
  -d '{
    "title": "The Great Gatsby",
    "author": "F. Scott Fitzgerald",
    "isbn": "9780743273565",
    "publisher": "Scribner",
    "year": 1925,
    "category": "Fiction",
    "location": "A1-001"
  }'
```

### Create a User
```bash
curl -X POST http://localhost:5000/api/users \
  -H "Content-Type: application/json" \
  -d '{
    "name": "John Doe",
    "email": "john.doe@ucsi.edu.my",
    "type": "student",
    "phone": "+60123456789",
    "department": "Computer Science"
  }'
```

### Create a Loan
```bash
curl -X POST http://localhost:5000/api/loans \
  -H "Content-Type: application/json" \
  -d '{
    "book": "BOOK_ID_HERE",
    "user": "USER_ID_HERE",
    "dueDate": "2024-01-15"
  }'
```

### Get Books with Filtering
```bash
# Get available books in Fiction category
curl "http://localhost:5000/api/books?category=Fiction&available=true&page=1&limit=10"

# Search for books
curl "http://localhost:5000/api/books?search=gatsby"
```

## Data Models

### Book Model
```javascript
{
  title: String (required, max: 200),
  author: String (required, max: 100),
  isbn: String (unique, 10 or 13 digits),
  publisher: String (max: 100),
  year: Number (min: 1000, max: current year + 1),
  category: String (max: 50),
  location: String (max: 100),
  isAvailable: Boolean (default: true),
  timestamps: true
}
```

### User Model
```javascript
{
  name: String (required, max: 100),
  email: String (required, unique, valid email),
  type: String (required, enum: ['student', 'teacher', 'staff']),
  phone: String (valid phone number format),
  department: String (max: 100),
  isActive: Boolean (default: true),
  password: String (optional, min: 6, hashed),
  timestamps: true
}
```

### Loan Model
```javascript
{
  book: ObjectId (required, ref: 'Book'),
  user: ObjectId (required, ref: 'User'),
  loanDate: Date (default: now),
  dueDate: Date (required, must be after loanDate),
  returnDate: Date,
  returned: Boolean (default: false),
  isOverdue: Boolean (default: false),
  notes: String (max: 500),
  timestamps: true
}
```

## Query Parameters

### Pagination
- `page` - Page number (default: 1)
- `limit` - Items per page (default: 10, max: 100)

### Sorting
- `sortBy` - Field to sort by (default: 'createdAt')
- `sortOrder` - Sort direction: 'asc' or 'desc' (default: 'desc')

### Filtering
- `search` - Text search across relevant fields
- `category` - Filter books by category
- `available` - Filter books by availability (true/false)
- `type` - Filter users by type (student/teacher/staff)
- `active` - Filter users by active status (true/false)
- `status` - Filter loans by status (active/returned)
- `overdue` - Filter loans by overdue status (true/false)

## Error Responses

All endpoints return consistent error responses:

```json
{
  "success": false,
  "message": "Error description",
  "errors": [
    {
      "field": "fieldName",
      "message": "Validation error message",
      "value": "invalid value"
    }
  ]
}
```

## Integration with Frontend

The API is designed to be easily integrated with the existing frontend. To connect:

1. **Update the frontend JavaScript** to make API calls instead of using local storage
2. **Replace data arrays** with API fetch calls
3. **Handle async operations** with promises or async/await
4. **Update CORS settings** to allow your frontend domain

Example integration for getting books:
```javascript
// Replace this:
// let books = [];

// With this:
async function fetchBooks() {
  try {
    const response = await fetch('http://localhost:5000/api/books');
    const data = await response.json();
    return data.data; // Array of books
  } catch (error) {
    console.error('Error fetching books:', error);
    return [];
  }
}
```

## Development

### Project Structure
```
server/
├── config/
│   └── database.js          # MongoDB connection
├── middleware/
│   ├── errorHandler.js      # Error handling middleware
│   └── validation.js        # Validation middleware
├── models/
│   ├── Book.js             # Book model
│   ├── User.js             # User model
│   └── Loan.js             # Loan model
├── routes/
│   ├── books.js            # Book routes
│   ├── users.js            # User routes
│   └── loans.js            # Loan routes
├── .env.example            # Environment variables template
├── package.json            # Dependencies and scripts
├── README.md              # This file
└── server.js              # Main application file
```

### Adding New Features

1. **Create new models** in the `models/` directory
2. **Add routes** in the `routes/` directory
3. **Update validation** in middleware as needed
4. **Register routes** in `server.js`

## Security Features

- **Helmet.js** - Sets various HTTP headers for security
- **CORS** - Configurable cross-origin resource sharing
- **Rate limiting** - Prevents abuse with request rate limits
- **Input validation** - Validates and sanitizes all input data
- **Password hashing** - Uses bcrypt for secure password storage
- **Error handling** - Prevents sensitive information leakage

## Production Deployment

1. **Set environment variables:**
   ```env
   NODE_ENV=production
   MONGODB_URI=your-production-mongodb-uri
   JWT_SECRET=your-secure-jwt-secret
   FRONTEND_URL=https://your-frontend-domain.com
   ```

2. **Use PM2 for process management:**
   ```bash
   npm install -g pm2
   pm2 start server.js --name "ucsi-library-api"
   ```

3. **Use a reverse proxy** (nginx/Apache) for better performance and security

## Support

For questions or issues related to the backend API:

1. Check the console logs for detailed error messages
2. Verify your MongoDB connection string and credentials
3. Ensure all required environment variables are set
4. Check that your IP address is whitelisted in MongoDB Atlas

## License

This project is part of the UCSI Library Management System and is intended for educational use.