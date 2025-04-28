import unittest
import os
import tempfile
import json
import sqlite3
from app import app

class AppTestCase(unittest.TestCase):
    
    def setUp(self):
        # Create a temporary file for the test database
        self.db_fd, self.db_path = tempfile.mkstemp()
        app.config['TESTING'] = True
        app.config['DATABASE'] = self.db_path
        
        # Create test client
        self.client = app.test_client()
        
        # Create test database
        conn = sqlite3.connect(self.db_path)
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
        
        # Insert test data
        cursor.execute(
            'INSERT INTO expenses (amount, category, description, date) VALUES (?, ?, ?, ?)',
            (100.00, 'Food', 'Lunch', '2023-01-01')
        )
        
        cursor.execute(
            'INSERT INTO expenses (amount, category, description, date) VALUES (?, ?, ?, ?)',
            (200.00, 'Transport', 'Uber', '2023-01-02')
        )
        
        conn.commit()
        conn.close()
    
    def tearDown(self):
        # Close and remove the temporary database
        os.close(self.db_fd)
        os.unlink(self.db_path)
    
    def test_get_expenses(self):
        # Test getting all expenses
        response = self.client.get('/expenses')
        self.assertEqual(response.status_code, 200)
        data = json.loads(response.data)
        self.assertEqual(len(data), 2)
        self.assertEqual(data[0]['category'], 'Transport')  # Most recent first
    
    def test_add_expense(self):
        # Test adding a new expense
        response = self.client.post(
            '/expenses',
            json={
                'amount': 50.00,
                'category': 'Entertainment',
                'description': 'Movie tickets'
            },
            content_type='application/json'
        )
        
        self.assertEqual(response.status_code, 201)
        data = json.loads(response.data)
        self.assertEqual(data['amount'], 50.00)
        self.assertEqual(data['category'], 'Entertainment')
        
        # Check it was added to the database
        response = self.client.get('/expenses')
        data = json.loads(response.data)
        self.assertEqual(len(data), 3)
    
    def test_add_expense_missing_fields(self):
        # Test adding an expense with missing required fields
        response = self.client.post(
            '/expenses',
            json={
                'description': 'Missing fields'
            },
            content_type='application/json'
        )
        
        self.assertEqual(response.status_code, 400)
    
    def test_delete_expense(self):
        # Test deleting an expense
        response = self.client.delete('/expenses/1')
        self.assertEqual(response.status_code, 200)
        
        # Check it was removed from the database
        response = self.client.get('/expenses')
        data = json.loads(response.data)
        self.assertEqual(len(data), 1)
    
    def test_get_categories(self):
        # Test getting unique categories
        response = self.client.get('/categories')
        self.assertEqual(response.status_code, 200)
        data = json.loads(response.data)
        self.assertEqual(len(data), 2)
        self.assertIn('Food', data)
        self.assertIn('Transport', data)


if __name__ == '__main__':
    unittest.main()