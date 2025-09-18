/**
 * Integration Example: Frontend to Backend API
 * 
 * This file shows how to modify the existing frontend JavaScript
 * to work with the backend API instead of localStorage.
 * 
 * Replace the existing data management functions in index.html
 * with these API-based implementations.
 */

const API_BASE_URL = 'http://localhost:5000/api';

// Helper function for API calls
async function apiCall(endpoint, options = {}) {
  try {
    const response = await fetch(`${API_BASE_URL}${endpoint}`, {
      headers: {
        'Content-Type': 'application/json',
        ...options.headers
      },
      ...options
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.message || `HTTP error! status: ${response.status}`);
    }

    return data;
  } catch (error) {
    console.error('API call failed:', error);
    throw error;
  }
}

// Books API Integration
const BooksAPI = {
  // Get all books
  async getAll(params = {}) {
    const queryString = new URLSearchParams(params).toString();
    const endpoint = `/books${queryString ? '?' + queryString : ''}`;
    const response = await apiCall(endpoint);
    return response.data;
  },

  // Create a new book
  async create(bookData) {
    const response = await apiCall('/books', {
      method: 'POST',
      body: JSON.stringify(bookData)
    });
    return response.data;
  },

  // Update a book
  async update(id, bookData) {
    const response = await apiCall(`/books/${id}`, {
      method: 'PUT',
      body: JSON.stringify(bookData)
    });
    return response.data;
  },

  // Delete a book
  async delete(id) {
    const response = await apiCall(`/books/${id}`, {
      method: 'DELETE'
    });
    return response.data;
  },

  // Get book statistics
  async getStats() {
    const response = await apiCall('/books/stats/overview');
    return response.data;
  }
};

// Users API Integration
const UsersAPI = {
  async getAll(params = {}) {
    const queryString = new URLSearchParams(params).toString();
    const endpoint = `/users${queryString ? '?' + queryString : ''}`;
    const response = await apiCall(endpoint);
    return response.data;
  },

  async create(userData) {
    const response = await apiCall('/users', {
      method: 'POST',
      body: JSON.stringify(userData)
    });
    return response.data;
  },

  async update(id, userData) {
    const response = await apiCall(`/users/${id}`, {
      method: 'PUT',
      body: JSON.stringify(userData)
    });
    return response.data;
  },

  async delete(id) {
    const response = await apiCall(`/users/${id}`, {
      method: 'DELETE'
    });
    return response.data;
  },

  async getStats() {
    const response = await apiCall('/users/stats/overview');
    return response.data;
  }
};

// Loans API Integration
const LoansAPI = {
  async getAll(params = {}) {
    const queryString = new URLSearchParams(params).toString();
    const endpoint = `/loans${queryString ? '?' + queryString : ''}`;
    const response = await apiCall(endpoint);
    return response.data;
  },

  async create(loanData) {
    const response = await apiCall('/loans', {
      method: 'POST',
      body: JSON.stringify(loanData)
    });
    return response.data;
  },

  async returnBook(id, notes = '') {
    const response = await apiCall(`/loans/${id}/return`, {
      method: 'PUT',
      body: JSON.stringify({ notes })
    });
    return response.data;
  },

  async getOverdue() {
    const response = await apiCall('/loans/overdue/list');
    return response.data;
  },

  async getStats() {
    const response = await apiCall('/loans/stats/overview');
    return response.data;
  }
};

// Example: How to modify existing frontend functions

// BEFORE (localStorage):
/*
function saveBook(event) {
  event.preventDefault();
  const bookData = {
    id: currentEditId || nextBookId++,
    title: document.getElementById('book-title').value,
    author: document.getElementById('book-author').value,
    // ... other fields
  };
  
  if (currentEditId) {
    const index = books.findIndex(book => book.id === currentEditId);
    books[index] = bookData;
  } else {
    books.push(bookData);
  }
  
  closeModal('book-modal');
  renderBooks();
}
*/

// AFTER (API):
async function saveBook(event) {
  event.preventDefault();
  
  const bookData = {
    title: document.getElementById('book-title').value,
    author: document.getElementById('book-author').value,
    isbn: document.getElementById('book-isbn').value,
    publisher: document.getElementById('book-publisher').value,
    year: parseInt(document.getElementById('book-year').value) || undefined,
    category: document.getElementById('book-category').value,
    location: document.getElementById('book-location').value
  };

  try {
    if (currentEditId) {
      await BooksAPI.update(currentEditId, bookData);
    } else {
      await BooksAPI.create(bookData);
    }
    
    closeModal('book-modal');
    await renderBooks(); // Make renderBooks async too
    showMessage('Book saved successfully!', 'success');
  } catch (error) {
    showMessage('Error saving book: ' + error.message, 'error');
  }
}

// BEFORE (localStorage):
/*
function renderBooks() {
  const booksList = document.getElementById('books-list');
  if (books.length === 0) {
    booksList.innerHTML = '<div class="card"><p>No books available...</p></div>';
    return;
  }
  // ... render logic
}
*/

// AFTER (API):
async function renderBooks() {
  const booksList = document.getElementById('books-list');
  
  try {
    const books = await BooksAPI.getAll();
    
    if (books.length === 0) {
      booksList.innerHTML = '<div class="card"><p>No books available...</p></div>';
      return;
    }
    
    booksList.innerHTML = books.map(book => {
      return `<div class="card">
        <h3>${book.title}</h3>
        <p><strong>Author:</strong> ${book.author}</p>
        <p><strong>Status:</strong> 
          <span class="${book.isAvailable ? 'status-available' : 'status-borrowed'}">
            ${book.isAvailable ? 'Available' : 'On Loan'}
          </span>
        </p>
        <div style="margin-top: 15px;">
          <button class="btn btn-warning" onclick="openBookModal(${JSON.stringify(book).replace(/"/g, '&quot;')})">Edit</button>
          <button class="btn btn-danger" onclick="deleteBook('${book._id}')">Delete</button>
        </div>
      </div>`;
    }).join('');
  } catch (error) {
    booksList.innerHTML = '<div class="card"><p>Error loading books. Please try again.</p></div>';
    console.error('Error rendering books:', error);
  }
}

// Dashboard update function
async function updateDashboard() {
  try {
    const [bookStats, userStats, loanStats] = await Promise.all([
      BooksAPI.getStats(),
      UsersAPI.getStats(),
      LoansAPI.getStats()
    ]);

    document.getElementById('total-books').textContent = bookStats.totalBooks;
    document.getElementById('total-users').textContent = userStats.totalUsers;
    document.getElementById('active-loans').textContent = loanStats.activeLoans;
    document.getElementById('overdue-loans').textContent = loanStats.overdueLoans;
  } catch (error) {
    console.error('Error updating dashboard:', error);
  }
}

// Helper function to show messages
function showMessage(message, type = 'info') {
  // Create a simple message display
  const messageDiv = document.createElement('div');
  messageDiv.className = `message message-${type}`;
  messageDiv.textContent = message;
  messageDiv.style.cssText = `
    position: fixed;
    top: 20px;
    right: 20px;
    padding: 15px;
    border-radius: 5px;
    z-index: 9999;
    background: ${type === 'success' ? '#d4edda' : type === 'error' ? '#f8d7da' : '#d1ecf1'};
    color: ${type === 'success' ? '#155724' : type === 'error' ? '#721c24' : '#0c5460'};
    border: 1px solid ${type === 'success' ? '#c3e6cb' : type === 'error' ? '#f5c6cb' : '#bee5eb'};
  `;
  
  document.body.appendChild(messageDiv);
  
  setTimeout(() => {
    document.body.removeChild(messageDiv);
  }, 5000);
}

// Initialize the application
document.addEventListener('DOMContentLoaded', async function() {
  await updateDashboard();
  await renderBooks();
  // ... other initialization
});

// Export for use in other files
if (typeof module !== 'undefined' && module.exports) {
  module.exports = { BooksAPI, UsersAPI, LoansAPI, updateDashboard };
}