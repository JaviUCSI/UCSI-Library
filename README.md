# UCSI Library Management System

A modern, full-stack library management system with a clean HTML frontend and Node.js backend powered by MongoDB Atlas.

## 🚀 Features

- **Complete Library Management**: Books, Users, and Loans tracking
- **Real-time Data**: Persistent storage with MongoDB Atlas
- **Modern UI**: Clean, responsive design with dashboard analytics
- **REST API**: Complete backend API for all operations
- **Analytics**: Popular books, active borrowers, and overdue tracking
- **Import/Export**: Excel/CSV support for bulk operations
- **Search & Filter**: Advanced search capabilities
- **Reports**: Comprehensive reporting system

## 📋 Prerequisites

- **Node.js** (v14 or higher)
- **MongoDB Atlas** account (free tier available)
- **Modern web browser**
- **Python 3** (for serving frontend) or any static file server

## 🛠️ Installation & Setup

### 1. Clone the Repository
```bash
git clone https://github.com/JaviUCSI/UCSI-Library.git
cd UCSI-Library
```

### 2. Backend Setup

#### Install Dependencies
```bash
cd server
npm install
```

#### Configure Environment
```bash
cp .env.example .env
```

Edit the `.env` file with your MongoDB Atlas credentials:
```env
MONGODB_URI=mongodb+srv://your_username:your_password@your_cluster.mongodb.net/ucsi-library?retryWrites=true&w=majority
PORT=3000
NODE_ENV=development
FRONTEND_URL=http://localhost:8080
```

#### Set Up MongoDB Atlas
1. Go to [MongoDB Atlas](https://www.mongodb.com/cloud/atlas)
2. Create a free account and cluster
3. Create a database user
4. Whitelist your IP address
5. Get your connection string
6. Replace the placeholder in your `.env` file

#### Start the Backend Server
```bash
npm start
# Or for development with auto-restart:
npm run dev
```

The backend will be available at `http://localhost:3000`

### 3. Frontend Setup

#### Option 1: Using Python (Recommended)
```bash
# From the root directory
python3 -m http.server 8080
```

#### Option 2: Using Node.js
```bash
npx http-server -p 8080
```

#### Option 3: Using any web server
Serve the root directory files on port 8080 or update the FRONTEND_URL in your `.env` file.

The frontend will be available at `http://localhost:8080`

## 🔧 Configuration

### MongoDB Atlas Setup Guide

1. **Create MongoDB Atlas Account**
   - Visit [MongoDB Atlas](https://www.mongodb.com/cloud/atlas)
   - Sign up for a free account

2. **Create a Cluster**
   - Choose "Build a Database"
   - Select "Free" shared cluster
   - Choose your preferred cloud provider and region
   - Create cluster

3. **Configure Database Access**
   - Go to "Database Access" in the left menu
   - Click "Add New Database User"
   - Choose "Password" authentication
   - Create username and password
   - Set user privileges to "Atlas Admin" (for development)

4. **Configure Network Access**
   - Go to "Network Access" in the left menu
   - Click "Add IP Address"
   - Add your current IP or use "0.0.0.0/0" for all IPs (development only)

5. **Get Connection String**
   - Go to "Databases" and click "Connect"
   - Choose "Connect your application"
   - Copy the connection string
   - Replace `<password>` with your database user password
   - Replace `<dbname>` with `ucsi-library`

### Environment Variables

| Variable | Description | Default |
|----------|-------------|---------|
| `MONGODB_URI` | MongoDB Atlas connection string | Required |
| `PORT` | Backend server port | 3000 |
| `NODE_ENV` | Environment mode | development |
| `FRONTEND_URL` | Frontend URL for CORS | http://localhost:8080 |

## 📡 API Endpoints

### Books
- `GET /api/books` - Get all books
- `POST /api/books` - Create a new book
- `GET /api/books/:id` - Get specific book
- `PUT /api/books/:id` - Update book
- `DELETE /api/books/:id` - Delete book
- `GET /api/books/popular` - Get popular books

### Users
- `GET /api/users` - Get all users
- `POST /api/users` - Create a new user
- `GET /api/users/:id` - Get specific user
- `PUT /api/users/:id` - Update user
- `DELETE /api/users/:id` - Delete user

### Loans
- `GET /api/loans` - Get all loans
- `POST /api/loans` - Create a new loan
- `GET /api/loans/:id` - Get specific loan
- `PUT /api/loans/:id/return` - Mark loan as returned
- `GET /api/loans/overdue` - Get overdue loans

### Utility
- `GET /api/health` - Health check
- `GET /` - API documentation

## 🗃️ Data Models

### Book
```json
{
  "title": "String (required)",
  "author": "String (required)", 
  "identifier": "String (ISBN/ID)",
  "publisher": "String",
  "publicationYear": "Number",
  "category": "String",
  "location": "String",
  "tags": ["String"]
}
```

### User
```json
{
  "name": "String (required)",
  "class": "String",
  "email": "String (optional, validated)",
  "type": "Teacher|Student|Staff|Manager",
  "phone": "String",
  "department": "String"
}
```

### Loan
```json
{
  "user": "ObjectId (User reference)",
  "book": "ObjectId (Book reference)",
  "loanDate": "Date",
  "dueDate": "Date",
  "returnDate": "Date",
  "returned": "Boolean",
  "isOverdue": "Boolean"
}
```

## 💻 Usage

1. **Start the Backend**: Run `npm start` in the `server` directory
2. **Start the Frontend**: Serve the root directory on port 8080
3. **Open Browser**: Navigate to `http://localhost:8080`
4. **Add Data**: Start by adding books and users
5. **Create Loans**: Manage book borrowing and returns
6. **View Reports**: Check analytics and popular books

## 🔒 Security Notes

- **Never commit `.env` files** to version control
- **Use environment variables** for all sensitive data
- **Whitelist specific IPs** in production (not 0.0.0.0/0)
- **Use strong passwords** for database users
- **Consider implementing authentication** for production use

## 🛠️ Development

### Project Structure
```
UCSI-Library/
├── index.html          # Frontend application
├── server/             # Backend application
│   ├── models/         # Mongoose data models
│   ├── routes/         # API route handlers
│   ├── server.js       # Main server file
│   ├── package.json    # Dependencies
│   └── .env           # Environment variables
├── .gitignore         # Git ignore rules
└── README.md          # This file
```

### Adding New Features

1. **Backend**: Add routes in `server/routes/`
2. **Frontend**: Update JavaScript in `index.html`
3. **Models**: Modify schemas in `server/models/`
4. **API**: Update the LibraryAPI class

### Testing API Endpoints

```bash
# Test health endpoint
curl http://localhost:3000/api/health

# Create a book
curl -X POST http://localhost:3000/api/books \
  -H "Content-Type: application/json" \
  -d '{"title":"Test Book","author":"Test Author"}'

# Get all books
curl http://localhost:3000/api/books
```

## 🐛 Troubleshooting

### Common Issues

1. **MongoDB Connection Fails**
   - Verify your connection string in `.env`
   - Check if your IP is whitelisted in MongoDB Atlas
   - Ensure database user has correct permissions

2. **CORS Errors**
   - Make sure `FRONTEND_URL` in `.env` matches your frontend URL
   - Check that both servers are running

3. **Port Already in Use**
   - Change the PORT in `.env` file
   - Kill existing processes: `lsof -ti:3000 | xargs kill -9`

4. **Frontend Can't Connect to Backend**
   - Verify backend is running on http://localhost:3000
   - Check browser console for error messages
   - Ensure API_BASE_URL in frontend matches backend URL

### Error Messages

- **"Operation buffering timed out"**: MongoDB connection issue
- **"CORS error"**: Frontend/backend URL mismatch
- **"Cannot delete with active loans"**: Data integrity protection working correctly

## 📄 License

This project is licensed under the MIT License - see the LICENSE file for details.

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch: `git checkout -b new-feature`
3. Commit changes: `git commit -am 'Add new feature'`
4. Push to branch: `git push origin new-feature`
5. Submit a pull request

## 📞 Support

If you encounter any issues:

1. Check the troubleshooting section above
2. Verify your MongoDB Atlas setup
3. Check that all environment variables are correctly set
4. Ensure both frontend and backend servers are running

For additional help, please create an issue in the GitHub repository.

---

**Happy Library Management! 📚**