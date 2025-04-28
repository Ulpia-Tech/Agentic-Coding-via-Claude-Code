from flask import Flask, request, jsonify, send_from_directory, abort
from flask_cors import CORS
import sqlite3
import os
import datetime
import uuid
import mimetypes
import io

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

# File upload config
app.config['MAX_CONTENT_LENGTH'] = 10 * 1024 * 1024  # 10MB limit
app.config['ALLOWED_EXTENSIONS'] = {'png'}
app.config['DATABASE'] = os.path.join(os.path.dirname(os.path.abspath(__file__)), 'expenses.db')

# Helper function to get db connection
def get_db_connection():
    conn = sqlite3.connect(app.config.get('DATABASE', 'expenses.db'))
    conn.row_factory = sqlite3.Row
    return conn

# Helper function to validate file type
def validate_image(file_stream):
    try:
        # Save current position
        current_pos = file_stream.tell()
        
        # Check if file has PNG signature
        png_signature = b'\x89PNG\r\n\x1a\n'
        file_header = file_stream.read(8)
        file_stream.seek(current_pos)  # Reset position for later use
        
        # Simple validation by checking PNG file signature
        if file_header != png_signature:
            return None
            
        return '.png'
    except Exception:
        # Any errors indicate invalid file
        return None

# Create or update database
def init_db():
    # Create database file if it doesn't exist
    db_exists = os.path.exists(app.config['DATABASE'])
    
    conn = get_db_connection()
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
    try:
        conn = get_db_connection()
        cursor = conn.cursor()
        cursor.execute('SELECT * FROM expenses ORDER BY date DESC')
        expenses = [dict(row) for row in cursor.fetchall()]
        conn.close()
        return jsonify(expenses)
    except Exception as e:
        return jsonify({'error': 'Failed to get expenses', 'details': str(e)}), 500

@app.route('/expenses', methods=['POST'])
def add_expense():
    try:
        expense_data = request.json
        
        if not expense_data:
            return jsonify({'error': 'No data provided'}), 400
        
        if not all(k in expense_data for k in ('amount', 'category')):
            return jsonify({'error': 'Missing required fields: amount and category are required'}), 400
        
        # Validate amount is a number
        try:
            amount = float(expense_data['amount'])
            if amount <= 0:
                return jsonify({'error': 'Amount must be greater than 0'}), 400
        except ValueError:
            return jsonify({'error': 'Amount must be a valid number'}), 400
        
        # Set default date to today if not provided
        if 'date' not in expense_data or not expense_data['date']:
            expense_data['date'] = datetime.datetime.now().strftime('%Y-%m-%d')
        
        conn = get_db_connection()
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
    except Exception as e:
        return jsonify({'error': 'Failed to add expense', 'details': str(e)}), 500

@app.route('/expenses/<int:expense_id>', methods=['DELETE'])
def delete_expense(expense_id):
    try:
        conn = get_db_connection()
        cursor = conn.cursor()
        
        # First check if the expense exists
        cursor.execute('SELECT id FROM expenses WHERE id = ?', (expense_id,))
        if not cursor.fetchone():
            conn.close()
            return jsonify({'error': 'Expense not found'}), 404
            
        cursor.execute('DELETE FROM expenses WHERE id = ?', (expense_id,))
        conn.commit()
        conn.close()
        return jsonify({'message': 'Expense deleted successfully'}), 200
    except Exception as e:
        return jsonify({'error': 'Failed to delete expense', 'details': str(e)}), 500

@app.route('/categories', methods=['GET'])
def get_categories():
    try:
        conn = get_db_connection()
        cursor = conn.cursor()
        cursor.execute('SELECT DISTINCT category FROM expenses')
        categories = [row[0] for row in cursor.fetchall()]
        conn.close()
        return jsonify(categories)
    except Exception as e:
        return jsonify({'error': 'Failed to get categories', 'details': str(e)}), 500

# Receipt endpoints
@app.route('/receipts', methods=['GET'])
def get_receipts():
    try:
        conn = get_db_connection()
        cursor = conn.cursor()
        cursor.execute('''
        SELECT r.*, e.amount, e.category, e.description as expense_description
        FROM receipts r
        LEFT JOIN expenses e ON r.expense_id = e.id
        ORDER BY r.upload_date DESC
        ''')
        
        receipts = [dict(row) for row in cursor.fetchall()]
        conn.close()
        return jsonify(receipts)
    except Exception as e:
        return jsonify({'error': 'Failed to get receipts', 'details': str(e)}), 500

@app.route('/receipts', methods=['POST'])
def upload_receipt():
    try:
        # Check if the post request has the file part
        if 'receipt' not in request.files:
            return jsonify({'error': 'No file part'}), 400
        
        file = request.files['receipt']
        
        # If user does not select file, browser might submit an empty file
        if file.filename == '':
            return jsonify({'error': 'No selected file'}), 400
        
        # Secure validation of file type (not just extension)
        file_ext = validate_image(file)
        if not file_ext:
            return jsonify({'error': 'Invalid file type. Only PNG images are supported'}), 400
        
        # Get form data
        description = request.form.get('description', '')
        expense_id = request.form.get('expense_id')
        
        # Validate expense_id if provided
        if expense_id:
            try:
                expense_id = int(expense_id)
                # Check if expense exists
                conn = get_db_connection()
                cursor = conn.cursor()
                cursor.execute('SELECT id FROM expenses WHERE id = ?', (expense_id,))
                if not cursor.fetchone():
                    conn.close()
                    return jsonify({'error': f'Expense with id {expense_id} not found'}), 400
                conn.close()
            except ValueError:
                return jsonify({'error': 'Invalid expense ID format'}), 400
        
        # Generate unique filename
        unique_filename = f"{uuid.uuid4().hex}.png"
        file_path = os.path.join(app.config['UPLOAD_FOLDER'], unique_filename)
        
        # Save the file
        file.save(file_path)
        
        # Save metadata to database
        conn = get_db_connection()
        cursor = conn.cursor()
        
        upload_date = datetime.datetime.now().strftime('%Y-%m-%d %H:%M:%S')
        cursor.execute(
            'INSERT INTO receipts (filename, original_filename, expense_id, description, upload_date) VALUES (?, ?, ?, ?, ?)',
            (unique_filename, file.filename, expense_id if expense_id else None, description, upload_date)
        )
        conn.commit()
        new_id = cursor.lastrowid
        
        # Get the receipt data to return
        cursor.execute('SELECT * FROM receipts WHERE id = ?', (new_id,))
        receipt = dict(cursor.fetchone())
        conn.close()
        
        return jsonify(receipt), 201
    except Exception as e:
        return jsonify({'error': 'Failed to upload receipt', 'details': str(e)}), 500

@app.route('/receipts/<int:receipt_id>', methods=['DELETE'])
def delete_receipt(receipt_id):
    try:
        # First get the filename
        conn = get_db_connection()
        cursor = conn.cursor()
        cursor.execute('SELECT filename FROM receipts WHERE id = ?', (receipt_id,))
        result = cursor.fetchone()
        
        if not result:
            conn.close()
            return jsonify({'error': 'Receipt not found'}), 404
        
        filename = result[0]
        
        # Validate filename to prevent path traversal
        if '..' in filename or '/' in filename:
            conn.close()
            return jsonify({'error': 'Invalid filename'}), 400
        
        # Delete from database
        cursor.execute('DELETE FROM receipts WHERE id = ?', (receipt_id,))
        conn.commit()
        conn.close()
        
        # Delete file from filesystem
        file_path = os.path.join(app.config['UPLOAD_FOLDER'], filename)
        if os.path.exists(file_path):
            os.remove(file_path)
        
        return jsonify({'message': 'Receipt deleted successfully'}), 200
    except Exception as e:
        return jsonify({'error': 'Failed to delete receipt', 'details': str(e)}), 500

@app.route('/uploads/<filename>', methods=['GET'])
def uploaded_file(filename):
    try:
        # Validate filename to prevent path traversal
        if '..' in filename or '/' in filename:
            return jsonify({'error': 'Invalid filename'}), 400
            
        # Verify file exists in the database
        conn = get_db_connection()
        cursor = conn.cursor()
        cursor.execute('SELECT id FROM receipts WHERE filename = ?', (filename,))
        if not cursor.fetchone():
            conn.close()
            return jsonify({'error': 'File not found'}), 404
        conn.close()
        
        return send_from_directory(app.config['UPLOAD_FOLDER'], filename)
    except Exception as e:
        return jsonify({'error': 'Failed to retrieve file', 'details': str(e)}), 500

if __name__ == '__main__':
    app.run(host='0.0.0.0', port=5001, debug=True)