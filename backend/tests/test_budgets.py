import os
import tempfile
import unittest
import json
from datetime import datetime, timedelta
import sqlite3

from app import app

class BudgetTestCase(unittest.TestCase):
    def setUp(self):
        # Create a temporary file for the test database
        self.db_fd, self.db_path = tempfile.mkstemp()
        app.config['TESTING'] = True
        app.config['DATABASE'] = self.db_path
        
        # Create test client
        self.app = app.test_client()
        
        # Create test database
        conn = sqlite3.connect(self.db_path)
        cursor = conn.cursor()
        
        # Create expenses table (required for budget progress calculation)
        cursor.execute('''
        CREATE TABLE expenses (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            amount REAL NOT NULL,
            category TEXT NOT NULL,
            description TEXT,
            date TEXT NOT NULL
        )
        ''')
        
        # Create budgets table
        cursor.execute('''
        CREATE TABLE budgets (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            category TEXT NOT NULL,
            amount REAL NOT NULL,
            period TEXT NOT NULL,
            start_date TEXT NOT NULL,
            created_at TEXT NOT NULL,
            updated_at TEXT NOT NULL
        )
        ''')
        
        # Insert test expenses data
        today = datetime.now().date()
        one_month_ago = today - timedelta(days=30)
        
        cursor.execute(
            'INSERT INTO expenses (amount, category, description, date) VALUES (?, ?, ?, ?)',
            (100.00, 'Food', 'Groceries', one_month_ago.strftime('%Y-%m-%d'))
        )
        
        cursor.execute(
            'INSERT INTO expenses (amount, category, description, date) VALUES (?, ?, ?, ?)',
            (50.00, 'Food', 'Restaurant', today.strftime('%Y-%m-%d'))
        )
        
        cursor.execute(
            'INSERT INTO expenses (amount, category, description, date) VALUES (?, ?, ?, ?)',
            (200.00, 'Transport', 'Uber', today.strftime('%Y-%m-%d'))
        )
        
        # Insert test budget data
        one_month_ago_str = one_month_ago.strftime('%Y-%m-%d')
        now_str = datetime.now().strftime('%Y-%m-%d %H:%M:%S')
        
        cursor.execute(
            '''INSERT INTO budgets 
               (category, amount, period, start_date, created_at, updated_at) 
               VALUES (?, ?, ?, ?, ?, ?)''',
            ('Food', 200.00, 'monthly', one_month_ago_str, now_str, now_str)
        )
        
        conn.commit()
        conn.close()

    def tearDown(self):
        os.close(self.db_fd)
        os.unlink(self.db_path)

    def test_get_budgets(self):
        """Test retrieving all budgets"""
        response = self.app.get('/budgets')
        self.assertEqual(response.status_code, 200)
        data = json.loads(response.data)
        self.assertEqual(len(data), 1)
        self.assertEqual(data[0]['category'], 'Food')
        self.assertEqual(data[0]['amount'], 200.00)
        self.assertEqual(data[0]['period'], 'monthly')

    def test_create_budget(self):
        """Test creating a new budget"""
        budget_data = {
            'category': 'Entertainment',
            'amount': 100.00,
            'period': 'monthly',
            'start_date': datetime.now().strftime('%Y-%m-%d')
        }
        
        response = self.app.post(
            '/budgets',
            data=json.dumps(budget_data),
            content_type='application/json'
        )
        self.assertEqual(response.status_code, 201)
        
        # Verify budget was created
        data = json.loads(response.data)
        self.assertEqual(data['category'], 'Entertainment')
        self.assertEqual(data['amount'], 100.00)
        
        # Check it's in the database
        response = self.app.get('/budgets')
        data = json.loads(response.data)
        self.assertEqual(len(data), 2)

    def test_create_budget_validation(self):
        """Test validation for creating budgets"""
        # Missing required fields
        budget_data = {
            'category': 'Entertainment',
            # Missing amount and other fields
        }
        
        response = self.app.post(
            '/budgets',
            data=json.dumps(budget_data),
            content_type='application/json'
        )
        self.assertEqual(response.status_code, 400)
        
        # Invalid amount
        budget_data = {
            'category': 'Entertainment',
            'amount': 'not-a-number',
            'period': 'monthly',
            'start_date': datetime.now().strftime('%Y-%m-%d')
        }
        
        response = self.app.post(
            '/budgets',
            data=json.dumps(budget_data),
            content_type='application/json'
        )
        self.assertEqual(response.status_code, 400)
        
        # Invalid period
        budget_data = {
            'category': 'Entertainment',
            'amount': 100.00,
            'period': 'invalid-period',
            'start_date': datetime.now().strftime('%Y-%m-%d')
        }
        
        response = self.app.post(
            '/budgets',
            data=json.dumps(budget_data),
            content_type='application/json'
        )
        self.assertEqual(response.status_code, 400)
        
        # Duplicate category and period
        budget_data = {
            'category': 'Food',  # Already exists
            'amount': 100.00,
            'period': 'monthly',  # Already exists for Food
            'start_date': datetime.now().strftime('%Y-%m-%d')
        }
        
        response = self.app.post(
            '/budgets',
            data=json.dumps(budget_data),
            content_type='application/json'
        )
        self.assertEqual(response.status_code, 409)  # Conflict

    def test_get_budget_by_id(self):
        """Test retrieving a budget by ID"""
        # Get the existing budget ID
        response = self.app.get('/budgets')
        data = json.loads(response.data)
        budget_id = data[0]['id']
        
        # Get the budget by ID
        response = self.app.get(f'/budgets/{budget_id}')
        self.assertEqual(response.status_code, 200)
        data = json.loads(response.data)
        self.assertEqual(data['category'], 'Food')
        self.assertEqual(data['amount'], 200.00)
        
        # Test non-existent ID
        response = self.app.get('/budgets/9999')
        self.assertEqual(response.status_code, 404)

    def test_update_budget(self):
        """Test updating an existing budget"""
        # Get the existing budget ID
        response = self.app.get('/budgets')
        data = json.loads(response.data)
        budget_id = data[0]['id']
        
        # Update the budget
        update_data = {
            'amount': 300.00,  # Increase the budget
        }
        
        response = self.app.put(
            f'/budgets/{budget_id}',
            data=json.dumps(update_data),
            content_type='application/json'
        )
        self.assertEqual(response.status_code, 200)
        
        # Verify the budget was updated
        response = self.app.get(f'/budgets/{budget_id}')
        data = json.loads(response.data)
        self.assertEqual(data['amount'], 300.00)
        self.assertEqual(data['category'], 'Food')  # Should remain the same
        
        # Test updating non-existent ID
        response = self.app.put(
            '/budgets/9999',
            data=json.dumps(update_data),
            content_type='application/json'
        )
        self.assertEqual(response.status_code, 404)

    def test_delete_budget(self):
        """Test deleting a budget"""
        # Get the existing budget ID
        response = self.app.get('/budgets')
        data = json.loads(response.data)
        budget_id = data[0]['id']
        
        # Delete the budget
        response = self.app.delete(f'/budgets/{budget_id}')
        self.assertEqual(response.status_code, 200)
        
        # Verify the budget was deleted
        response = self.app.get(f'/budgets/{budget_id}')
        self.assertEqual(response.status_code, 404)
        
        # Test deleting non-existent ID
        response = self.app.delete('/budgets/9999')
        self.assertEqual(response.status_code, 404)

    def test_budget_progress(self):
        """Test calculating budget progress"""
        # Get the existing budget ID
        response = self.app.get('/budgets')
        data = json.loads(response.data)
        budget_id = data[0]['id']
        
        # Get progress for the specific budget
        response = self.app.get(f'/budgets/progress/{budget_id}')
        self.assertEqual(response.status_code, 200)
        
        data = json.loads(response.data)
        self.assertEqual(data['category'], 'Food')
        self.assertEqual(data['amount'], 200.00)
        self.assertEqual(data['actual_spending'], 150.00)  # 100 + 50 from test data
        self.assertTrue('percentage_used' in data)
        self.assertTrue('status' in data)
        
        # Test progress endpoint for all budgets
        response = self.app.get('/budgets/progress')
        self.assertEqual(response.status_code, 200)
        data = json.loads(response.data)
        self.assertEqual(len(data), 1)
        
        # Test progress endpoint for a category
        response = self.app.get('/budgets/progress/category/Food')
        self.assertEqual(response.status_code, 200)
        data = json.loads(response.data)
        self.assertEqual(len(data), 1)
        self.assertEqual(data[0]['category'], 'Food')
        
        # Test progress for non-existent category
        response = self.app.get('/budgets/progress/category/NonExistent')
        self.assertEqual(response.status_code, 404)

if __name__ == '__main__':
    unittest.main()