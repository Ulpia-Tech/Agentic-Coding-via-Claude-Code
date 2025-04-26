# Expense Tracker

A simple expense tracker application with Python Flask backend and React.js frontend.

## Features

- Manual expense entry with amount, category, description and date
- Expense categorization
- Visual summary with pie chart
- Expense history with delete functionality

## Setup and Running

### Backend (Flask)

1. Navigate to the backend directory:
   ```
   cd expense-tracker/backend
   ```

2. Create a virtual environment:
   ```
   python -m venv venv
   ```

3. Activate the virtual environment:
   - On Windows:
     ```
     venv\Scripts\activate
     ```
   - On macOS/Linux:
     ```
     source venv/bin/activate
     ```

4. Install dependencies:
   ```
   pip install -r requirements.txt
   ```

5. Run the backend server:
   ```
   python app.py
   ```

The backend will be available at http://localhost:5000

### Frontend (React)

1. Navigate to the frontend directory:
   ```
   cd expense-tracker/frontend
   ```

2. Install dependencies:
   ```
   npm install
   ```

3. Start the development server:
   ```
   npm start
   ```

The application will be available at http://localhost:3000

## Database

The application uses SQLite for simplicity. The database file (`expenses.db`) will be created automatically when you run the backend application for the first time.

## API Endpoints

- `GET /expenses` - Get all expenses
- `POST /expenses` - Add a new expense
- `DELETE /expenses/:id` - Delete an expense
- `GET /categories` - Get all unique categories