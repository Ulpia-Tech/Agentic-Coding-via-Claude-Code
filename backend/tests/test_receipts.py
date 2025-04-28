import unittest
import os
import tempfile
import shutil
import json
import io
from app import app, init_db
import sqlite3

class ReceiptEndpointsTestCase(unittest.TestCase):
    
    def setUp(self):
        # Create temporary test directory
        self.test_dir = tempfile.mkdtemp()
        self.upload_folder = os.path.join(self.test_dir, 'uploads')
        os.makedirs(self.upload_folder)
        
        # Configure app for testing
        app.config['TESTING'] = True
        app.config['UPLOAD_FOLDER'] = self.upload_folder
        app.config['DATABASE'] = os.path.join(self.test_dir, 'test_expenses.db')
        
        # Create test client
        self.client = app.test_client()
        
        # Create test database
        conn = sqlite3.connect(app.config['DATABASE'])
        cursor = conn.cursor()
        
        # Create expenses table
        cursor.execute('''
        CREATE TABLE expenses (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            amount REAL NOT NULL,
            category TEXT NOT NULL,
            description TEXT,
            date TEXT NOT NULL
        )
        ''')
        
        # Create receipts table
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
        
        # Add test expense
        cursor.execute(
            'INSERT INTO expenses (amount, category, description, date) VALUES (?, ?, ?, ?)',
            (100.00, 'Test Category', 'Test Description', '2023-01-01')
        )
        
        conn.commit()
        conn.close()
    
    def tearDown(self):
        # Remove the test directory and contents
        shutil.rmtree(self.test_dir)
    
    def test_get_receipts_empty(self):
        # Test getting receipts when none exist
        response = self.client.get('/receipts')
        self.assertEqual(response.status_code, 200)
        data = json.loads(response.data)
        self.assertEqual(len(data), 0)
    
    def test_upload_receipt_valid(self):
        # Create a valid test PNG file
        test_png = io.BytesIO(b'\x89PNG\r\n\x1a\n\x00\x00\x00\rIHDR\x00\x00\x00\x01\x00\x00\x00\x01\x08\x06\x00\x00\x00\x1f\x15\xc4\x89\x00\x00\x00\nIDATx\x9cc\x00\x01\x00\x00\x05\x00\x01\r\n-\xb4\x00\x00\x00\x00IEND\xaeB`\x82')
        
        # Test uploading a valid receipt
        response = self.client.post(
            '/receipts',
            data={
                'receipt': (test_png, 'test.png'),
                'description': 'Test Receipt',
                'expense_id': '1'
            },
            content_type='multipart/form-data'
        )
        
        self.assertEqual(response.status_code, 201)
        data = json.loads(response.data)
        self.assertIn('id', data)
        self.assertIn('filename', data)
        self.assertEqual(data['description'], 'Test Receipt')
        self.assertEqual(data['expense_id'], 1)
        
        # Check that the file was saved
        self.assertTrue(os.path.exists(os.path.join(self.upload_folder, data['filename'])))
        
        # Now test getting receipts
        response = self.client.get('/receipts')
        self.assertEqual(response.status_code, 200)
        data = json.loads(response.data)
        self.assertEqual(len(data), 1)
    
    def test_upload_receipt_invalid_file(self):
        # Test uploading an invalid file type
        test_file = io.BytesIO(b'This is not a PNG file')
        
        response = self.client.post(
            '/receipts',
            data={
                'receipt': (test_file, 'test.txt'),
                'description': 'Test Receipt'
            },
            content_type='multipart/form-data'
        )
        
        self.assertEqual(response.status_code, 400)
        data = json.loads(response.data)
        self.assertIn('error', data)
    
    def test_delete_receipt(self):
        # First upload a receipt
        test_png = io.BytesIO(b'\x89PNG\r\n\x1a\n\x00\x00\x00\rIHDR\x00\x00\x00\x01\x00\x00\x00\x01\x08\x06\x00\x00\x00\x1f\x15\xc4\x89\x00\x00\x00\nIDATx\x9cc\x00\x01\x00\x00\x05\x00\x01\r\n-\xb4\x00\x00\x00\x00IEND\xaeB`\x82')
        
        response = self.client.post(
            '/receipts',
            data={
                'receipt': (test_png, 'test.png'),
                'description': 'Test Receipt'
            },
            content_type='multipart/form-data'
        )
        
        receipt_id = json.loads(response.data)['id']
        filename = json.loads(response.data)['filename']
        
        # Check the file exists
        self.assertTrue(os.path.exists(os.path.join(self.upload_folder, filename)))
        
        # Delete the receipt
        response = self.client.delete(f'/receipts/{receipt_id}')
        self.assertEqual(response.status_code, 200)
        
        # Check the file was deleted
        self.assertFalse(os.path.exists(os.path.join(self.upload_folder, filename)))
        
        # Check receipt was removed from database
        response = self.client.get('/receipts')
        data = json.loads(response.data)
        self.assertEqual(len(data), 0)
    
    def test_delete_nonexistent_receipt(self):
        # Try to delete a receipt that doesn't exist
        response = self.client.delete('/receipts/999')
        self.assertEqual(response.status_code, 404)
    
    def test_invalid_upload_no_file(self):
        # Test uploading with no file
        response = self.client.post(
            '/receipts',
            data={'description': 'Test Receipt'},
            content_type='multipart/form-data'
        )
        
        self.assertEqual(response.status_code, 400)


if __name__ == '__main__':
    unittest.main()