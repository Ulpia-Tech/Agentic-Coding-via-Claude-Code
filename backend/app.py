from flask import Flask, request, jsonify, send_from_directory
from flask_cors import CORS
import sqlite3
import os
import datetime
import uuid

app = Flask(__name__)

# Enable CORS for all routes and all origins
CORS(app, resources={r"/*": {"origins": "*"}}, 
     methods=["GET", "POST", "PUT", "DELETE", "OPTIONS"],
     allow_headers=["Content-Type", "Authorization", "X-Requested-With", "Accept"])

# Handle preflight OPTIONS requests
@app.route('/', defaults={'path': ''}, methods=['OPTIONS'])
@app.route('/<path:path>', methods=['OPTIONS'])
def options_handler(path):
    return jsonify({'status': 'ok'})

# Create uploads directory if it doesn't exist
UPLOAD_FOLDER = os.path.join(os.path.dirname(os.path.abspath(__file__)), 'uploads')
if not os.path.exists(UPLOAD_FOLDER):
    os.makedirs(UPLOAD_FOLDER)
app.config['UPLOAD_FOLDER'] = UPLOAD_FOLDER

# Create or update database
def init_db():
    # Create database file if it doesn't exist
    db_exists = os.path.exists('expenses.db')
    
    conn = sqlite3.connect('expenses.db')
    cursor = conn.cursor()
    
    if not db_exists:
        # Create tables for a new database
        cursor.execute('''
        CREATE TABLE expenses (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            amount REAL NOT NULL,
            category TEXT NOT NULL,
            description TEXT,
            date TEXT NOT NULL
        )
        ''')
        cursor.execute('''
        CREATE TABLE receipts (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            filename TEXT NOT NULL,
            original_filename TEXT NOT NULL,
            expense_id INTEGER,
            description TEXT,
            upload_date TEXT NOT NULL,
            FOREIGN KEY (expense_id) REFERENCES expenses (id) ON DELETE SET NULL
        )
        ''')
    else:
        # Check if receipts table exists and create it if it doesn't
        cursor.execute("SELECT name FROM sqlite_master WHERE type='table' AND name='receipts'")
        if not cursor.fetchone():
            cursor.execute('''
            CREATE TABLE receipts (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                filename TEXT NOT NULL,
                original_filename TEXT NOT NULL,
                expense_id INTEGER,
                description TEXT,
                upload_date TEXT NOT NULL,
                FOREIGN KEY (expense_id) REFERENCES expenses (id) ON DELETE SET NULL
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
    response = jsonify(expenses)
    return response

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
    response = jsonify(expense_data)
    return response, 201

@app.route('/expenses/<int:expense_id>', methods=['DELETE'])
def delete_expense(expense_id):
    conn = sqlite3.connect('expenses.db')
    cursor = conn.cursor()
    cursor.execute('DELETE FROM expenses WHERE id = ?', (expense_id,))
    conn.commit()
    conn.close()
    response = jsonify({'message': 'Expense deleted'})
    return response, 200

@app.route('/categories', methods=['GET'])
def get_categories():
    conn = sqlite3.connect('expenses.db')
    cursor = conn.cursor()
    cursor.execute('SELECT DISTINCT category FROM expenses')
    categories = [row[0] for row in cursor.fetchall()]
    conn.close()
    response = jsonify(categories)
    return response

# Receipt endpoints
@app.route('/receipts', methods=['GET'])
def get_receipts():
    conn = sqlite3.connect('expenses.db')
    conn.row_factory = sqlite3.Row
    cursor = conn.cursor()
    cursor.execute('''
    SELECT r.*, e.amount, e.category, e.description as expense_description
    FROM receipts r
    LEFT JOIN expenses e ON r.expense_id = e.id
    ORDER BY r.upload_date DESC
    ''')
    
    receipts = [dict(row) for row in cursor.fetchall()]
    conn.close()
    response = jsonify(receipts)
    return response

@app.route('/receipts', methods=['POST'])
def upload_receipt():
    # Check if the post request has the file part
    if 'receipt' not in request.files:
        return jsonify({'error': 'No file part'}), 400
    
    file = request.files['receipt']
    
    # If user does not select file, browser might submit an empty file
    if file.filename == '':
        return jsonify({'error': 'No selected file'}), 400
    
    # Check if the file is a PNG
    if not file.filename.lower().endswith('.png'):
        return jsonify({'error': 'Only PNG files are supported'}), 400
    
    # Get form data
    description = request.form.get('description', '')
    expense_id = request.form.get('expense_id')
    
    # Generate unique filename
    unique_filename = f"{uuid.uuid4().hex}.png"
    file_path = os.path.join(app.config['UPLOAD_FOLDER'], unique_filename)
    
    # Save the file
    file.save(file_path)
    
    # Save metadata to database
    conn = sqlite3.connect('expenses.db')
    cursor = conn.cursor()
    
    cursor.execute(
        'INSERT INTO receipts (filename, original_filename, expense_id, description, upload_date) VALUES (?, ?, ?, ?, ?)',
        (unique_filename, file.filename, expense_id if expense_id else None, description, datetime.datetime.now().strftime('%Y-%m-%d %H:%M:%S'))
    )
    conn.commit()
    new_id = cursor.lastrowid
    
    # Get the receipt data to return
    conn.row_factory = sqlite3.Row
    cursor = conn.cursor()
    cursor.execute('SELECT * FROM receipts WHERE id = ?', (new_id,))
    receipt = dict(cursor.fetchone())
    conn.close()
    
    return jsonify(receipt), 201

@app.route('/receipts/<int:receipt_id>', methods=['DELETE'])
def delete_receipt(receipt_id):
    # First get the filename
    conn = sqlite3.connect('expenses.db')
    cursor = conn.cursor()
    cursor.execute('SELECT filename FROM receipts WHERE id = ?', (receipt_id,))
    result = cursor.fetchone()
    
    if not result:
        conn.close()
        return jsonify({'error': 'Receipt not found'}), 404
    
    filename = result[0]
    
    # Delete from database
    cursor.execute('DELETE FROM receipts WHERE id = ?', (receipt_id,))
    conn.commit()
    conn.close()
    
    # Delete file from filesystem
    file_path = os.path.join(app.config['UPLOAD_FOLDER'], filename)
    if os.path.exists(file_path):
        os.remove(file_path)
    
    return jsonify({'message': 'Receipt deleted'}), 200

@app.route('/uploads/<filename>', methods=['GET'])
def uploaded_file(filename):
    return send_from_directory(app.config['UPLOAD_FOLDER'], filename)

if __name__ == '__main__':
    app.run(host='0.0.0.0', port=5001, debug=True)