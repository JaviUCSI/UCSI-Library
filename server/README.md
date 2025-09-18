# UCSI Library Backend Server

A Node.js backend server for the UCSI Library Management System with MongoDB Atlas integration.

## Features

- **RESTful API** for books, users, and loans management
- **MongoDB Atlas** integration for persistent data storage
- **Data validation** using Mongoose schemas
- **CORS support** for frontend integration
- **Popular books analytics** endpoint
- **Overdue loans tracking**

## Prerequisites

- Node.js (v14 or higher)
- MongoDB Atlas account
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
   
   Edit the `.env` file with your MongoDB Atlas credentials:
   ```
   MONGODB_URI=mongodb+srv://your_username:your_password@your_cluster.mongodb.net/ucsi-library?retryWrites=true&w=majority
   PORT=3000
   NODE_ENV=development
   FRONTEND_URL=http://localhost:8080
   ```

## Running the Server

### Development Mode (with auto-restart)
```bash
npm run dev
```

### Production Mode
```bash
npm start
```

The server will start on `http://localhost:3000` (or your configured PORT).

## API Endpoints

### Books
- `GET /api/books` - Get all books
- `POST /api/books` - Create a new book
- `GET /api/books/:id` - Get a specific book
- `PUT /api/books/:id` - Update a book
- `DELETE /api/books/:id` - Delete a book
- `GET /api/books/popular` - Get popular books (most loaned)

### Users
- `GET /api/users` - Get all users
- `POST /api/users` - Create a new user
- `GET /api/users/:id` - Get a specific user
- `PUT /api/users/:id` - Update a user
- `DELETE /api/users/:id` - Delete a user

### Loans
- `GET /api/loans` - Get all loans
- `POST /api/loans` - Create a new loan
- `GET /api/loans/:id` - Get a specific loan
- `PUT /api/loans/:id/return` - Mark a loan as returned
- `GET /api/loans/overdue` - Get overdue loans
- `DELETE /api/loans/:id` - Delete a loan

### Utility
- `GET /api/health` - Health check endpoint
- `GET /` - API documentation

## Data Models

### Book Schema
```javascript
{
  title: String (required),
  author: String (required),
  identifier: String, // ISBN or library ID
  publisher: String,
  publicationYear: Number,
  category: String,
  location: String,
  tags: [String]
}
```

### User Schema
```javascript
{
  name: String (required),
  class: String,
  email: String (optional, validated),
  type: String (Teacher/Student/Staff/Manager),
  phone: String,
  department: String
}
```

### Loan Schema
```javascript
{
  user: ObjectId (ref: User),
  book: ObjectId (ref: Book),
  loanDate: Date,
  dueDate: Date,
  returnDate: Date,
  returned: Boolean,
  isOverdue: Boolean
}
```

## Frontend Integration

The frontend application should make AJAX requests to these endpoints. Update your frontend JavaScript to replace in-memory data operations with API calls.

### Example API Usage

```javascript
// Create a new book
async function createBook(bookData) {
  const response = await fetch('/api/books', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(bookData)
  });
  return response.json();
}

// Get all books
async function getBooks() {
  const response = await fetch('/api/books');
  return response.json();
}

// Create a loan
async function createLoan(loanData) {
  const response = await fetch('/api/loans', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(loanData)
  });
  return response.json();
}
```

## Security Notes

- Keep your `.env` file private and never commit it to version control
- The `.env.example` file provides a template for required environment variables
- MongoDB Atlas credentials should be stored securely
- Consider implementing authentication for production use

## Troubleshooting

1. **MongoDB Connection Issues:**
   - Verify your MongoDB Atlas credentials
   - Check if your IP address is whitelisted in MongoDB Atlas
   - Ensure your connection string is correct

2. **Port Already in Use:**
   - Change the PORT in your `.env` file
   - Kill the process using the port: `lsof -ti:3000 | xargs kill -9`

3. **CORS Issues:**
   - Update the FRONTEND_URL in your `.env` file
   - Ensure your frontend is running on the correct port

## Contributing

1. Make sure to follow the existing code style
2. Add appropriate error handling
3. Update documentation for new endpoints
4. Test all changes thoroughly

## License

MIT License - See LICENSE file for details