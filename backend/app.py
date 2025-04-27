from flask import Flask, request, jsonify
from flask_cors import CORS
import sqlite3
import os
import datetime

app = Flask(__name__)
# Configure CORS to explicitly allow requests from the React frontend
CORS(app, resources={r"/*": {
    "origins": "http://localhost:3000",
    "allow_headers": ["Content-Type", "Authorization"],
    "methods": ["GET", "POST", "PUT", "DELETE", "OPTIONS"]
}}, supports_credentials=True)

# Add CORS headers to all responses
@app.after_request
def add_cors_headers(response):
    response.headers['Access-Control-Allow-Origin'] = 'http://localhost:3000'
    response.headers['Access-Control-Allow-Methods'] = 'GET, POST, PUT, DELETE, OPTIONS'
    response.headers['Access-Control-Allow-Headers'] = 'Content-Type, Authorization'
    response.headers['Access-Control-Allow-Credentials'] = 'true'
    return response

# Handle preflight OPTIONS requests
@app.route('/', defaults={'path': ''}, methods=['OPTIONS'])
@app.route('/<path:path>', methods=['OPTIONS'])
def options_handler(path):
    return jsonify({'status': 'ok'})

# Create database if it doesn't exist
def init_db():
    if not os.path.exists('expenses.db'):
        conn = sqlite3.connect('expenses.db')
        cursor = conn.cursor()
        cursor.execute('''
        CREATE TABLE expenses (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            amount REAL NOT NULL,
            category TEXT NOT NULL,
            description TEXT,
            date TEXT NOT NULL
        )
        ''')
        conn.commit()
        conn.close()

init_db()

@app.route('/expenses', methods=['GET'])
def get_expenses():
    conn = sqlite3.connect('expenses.db')
    conn.row_factory = sqlite3.Row
    cursor = conn.cursor()
    cursor.execute('SELECT * FROM expenses ORDER BY date DESC')
    expenses = [dict(row) for row in cursor.fetchall()]
    conn.close()
    return jsonify(expenses)

@app.route('/expenses', methods=['POST'])
def add_expense():
    expense_data = request.json
    
    if not all(k in expense_data for k in ('amount', 'category')):
        return jsonify({'error': 'Missing required fields'}), 400
    
    # Set default date to today if not provided
    if 'date' not in expense_data or not expense_data['date']:
        expense_data['date'] = datetime.datetime.now().strftime('%Y-%m-%d')
    
    conn = sqlite3.connect('expenses.db')
    cursor = conn.cursor()
    cursor.execute(
        'INSERT INTO expenses (amount, category, description, date) VALUES (?, ?, ?, ?)',
        (expense_data['amount'], expense_data['category'], expense_data.get('description', ''), expense_data['date'])
    )
    conn.commit()
    new_id = cursor.lastrowid
    conn.close()
    
    expense_data['id'] = new_id
    return jsonify(expense_data), 201

@app.route('/expenses/<int:expense_id>', methods=['DELETE'])
def delete_expense(expense_id):
    conn = sqlite3.connect('expenses.db')
    cursor = conn.cursor()
    cursor.execute('DELETE FROM expenses WHERE id = ?', (expense_id,))
    conn.commit()
    conn.close()
    return jsonify({'message': 'Expense deleted'}), 200

@app.route('/categories', methods=['GET'])
def get_categories():
    conn = sqlite3.connect('expenses.db')
    cursor = conn.cursor()
    cursor.execute('SELECT DISTINCT category FROM expenses')
    categories = [row[0] for row in cursor.fetchall()]
    conn.close()
    return jsonify(categories)

if __name__ == '__main__':
    app.run(debug=True)