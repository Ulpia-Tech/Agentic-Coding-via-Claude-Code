import os
import tempfile
import unittest
import json
from datetime import datetime
import shutil
import sqlite3

from app import app

class SubscriptionTestCase(unittest.TestCase):
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
        
        # Create expenses table (required for foreign keys)
        cursor.execute('''
        CREATE TABLE expenses (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            amount REAL NOT NULL,
            category TEXT NOT NULL,
            description TEXT,
            date TEXT NOT NULL
        )
        ''')
        
        # Create subscriptions table
        cursor.execute('''
        CREATE TABLE subscriptions (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            name TEXT NOT NULL,
            amount REAL NOT NULL,
            category TEXT NOT NULL,
            billing_cycle TEXT NOT NULL,
            start_date TEXT NOT NULL,
            renewal_date TEXT NOT NULL
        )
        ''')
        
        conn.commit()
        conn.close()
        
        # Create test uploads directory if needed
        self.test_upload_dir = tempfile.mkdtemp()
        app.config['UPLOAD_FOLDER'] = self.test_upload_dir

    def tearDown(self):
        os.close(self.db_fd)
        os.unlink(self.db_path)
        shutil.rmtree(self.test_upload_dir)

    def test_empty_subscriptions_list(self):
        """Test that GET /subscriptions returns an empty list when no subscriptions exist"""
        response = self.app.get('/subscriptions')
        self.assertEqual(response.status_code, 200)
        data = json.loads(response.data)
        self.assertEqual(len(data), 0)
        self.assertEqual(data, [])

    def test_create_subscription(self):
        """Test that POST /subscriptions creates a new subscription"""
        subscription_data = {
            'name': 'Netflix',
            'amount': 15.99,
            'category': 'Entertainment',
            'billing_cycle': 'monthly',
            'start_date': '2023-01-01',
            'renewal_date': '2023-02-01'
        }
        
        response = self.app.post(
            '/subscriptions',
            data=json.dumps(subscription_data),
            content_type='application/json'
        )
        self.assertEqual(response.status_code, 201)
        
        # Verify the subscription was created
        response = self.app.get('/subscriptions')
        self.assertEqual(response.status_code, 200)
        data = json.loads(response.data)
        self.assertEqual(len(data), 1)
        self.assertEqual(data[0]['name'], 'Netflix')
        self.assertEqual(data[0]['amount'], 15.99)
        self.assertEqual(data[0]['category'], 'Entertainment')
        self.assertEqual(data[0]['billing_cycle'], 'monthly')
        self.assertEqual(data[0]['start_date'], '2023-01-01')
        self.assertEqual(data[0]['renewal_date'], '2023-02-01')

    def test_create_subscription_validation(self):
        """Test validation for creating subscriptions"""
        # Missing required fields
        subscription_data = {
            'name': 'Netflix',
            # Missing amount
            'category': 'Entertainment'
            # Missing other required fields
        }
        
        response = self.app.post(
            '/subscriptions',
            data=json.dumps(subscription_data),
            content_type='application/json'
        )
        self.assertEqual(response.status_code, 400)
        
        # Invalid amount
        subscription_data = {
            'name': 'Netflix',
            'amount': 'not-a-number',
            'category': 'Entertainment',
            'billing_cycle': 'monthly',
            'start_date': '2023-01-01',
            'renewal_date': '2023-02-01'
        }
        
        response = self.app.post(
            '/subscriptions',
            data=json.dumps(subscription_data),
            content_type='application/json'
        )
        self.assertEqual(response.status_code, 400)
        
        # Invalid date format
        subscription_data = {
            'name': 'Netflix',
            'amount': 15.99,
            'category': 'Entertainment',
            'billing_cycle': 'monthly',
            'start_date': 'invalid-date',
            'renewal_date': '2023-02-01'
        }
        
        response = self.app.post(
            '/subscriptions',
            data=json.dumps(subscription_data),
            content_type='application/json'
        )
        self.assertEqual(response.status_code, 400)
        
        # Invalid billing cycle
        subscription_data = {
            'name': 'Netflix',
            'amount': 15.99,
            'category': 'Entertainment',
            'billing_cycle': 'invalid-cycle',
            'start_date': '2023-01-01',
            'renewal_date': '2023-02-01'
        }
        
        response = self.app.post(
            '/subscriptions',
            data=json.dumps(subscription_data),
            content_type='application/json'
        )
        self.assertEqual(response.status_code, 400)

    def test_get_subscription_by_id(self):
        """Test retrieving a specific subscription by ID"""
        # Create a subscription first
        subscription_data = {
            'name': 'Netflix',
            'amount': 15.99,
            'category': 'Entertainment',
            'billing_cycle': 'monthly',
            'start_date': '2023-01-01',
            'renewal_date': '2023-02-01'
        }
        
        response = self.app.post(
            '/subscriptions',
            data=json.dumps(subscription_data),
            content_type='application/json'
        )
        self.assertEqual(response.status_code, 201, "Failed to create subscription")
        
        if response.status_code == 201:
            created_data = json.loads(response.data)
            subscription_id = created_data['id']
            
            # Get the subscription by ID
            response = self.app.get(f'/subscriptions/{subscription_id}')
            self.assertEqual(response.status_code, 200)
            
            if response.status_code == 200:
                data = json.loads(response.data)
                self.assertEqual(data['name'], 'Netflix')
                self.assertEqual(data['amount'], 15.99)
        
        # Test non-existent ID
        response = self.app.get('/subscriptions/9999')
        self.assertEqual(response.status_code, 404)

    def test_update_subscription(self):
        """Test updating an existing subscription"""
        # Create a subscription first
        subscription_data = {
            'name': 'Netflix',
            'amount': 15.99,
            'category': 'Entertainment',
            'billing_cycle': 'monthly',
            'start_date': '2023-01-01',
            'renewal_date': '2023-02-01'
        }
        
        response = self.app.post(
            '/subscriptions',
            data=json.dumps(subscription_data),
            content_type='application/json'
        )
        self.assertEqual(response.status_code, 201, "Failed to create subscription")
        
        if response.status_code == 201:
            created_data = json.loads(response.data)
            subscription_id = created_data['id']
            
            # Update the subscription
            update_data = {
                'name': 'Netflix Premium',
                'amount': 19.99,
                'category': 'Entertainment',
                'billing_cycle': 'monthly',
                'start_date': '2023-01-01',
                'renewal_date': '2023-02-01'
            }
            
            response = self.app.put(
                f'/subscriptions/{subscription_id}',
                data=json.dumps(update_data),
                content_type='application/json'
            )
            self.assertEqual(response.status_code, 200)
            
            # Verify the subscription was updated
            if response.status_code == 200:
                response = self.app.get(f'/subscriptions/{subscription_id}')
                self.assertEqual(response.status_code, 200)
                
                if response.status_code == 200:
                    data = json.loads(response.data)
                    self.assertEqual(data['name'], 'Netflix Premium')
                    self.assertEqual(data['amount'], 19.99)
        
        # Test updating non-existent ID
        update_data = {
            'name': 'Netflix Premium',
            'amount': 19.99,
            'category': 'Entertainment',
            'billing_cycle': 'monthly',
            'start_date': '2023-01-01',
            'renewal_date': '2023-02-01'
        }
        
        response = self.app.put(
            '/subscriptions/9999',
            data=json.dumps(update_data),
            content_type='application/json'
        )
        self.assertEqual(response.status_code, 404)

    def test_delete_subscription(self):
        """Test deleting a subscription"""
        # Create a subscription first
        subscription_data = {
            'name': 'Netflix',
            'amount': 15.99,
            'category': 'Entertainment',
            'billing_cycle': 'monthly',
            'start_date': '2023-01-01',
            'renewal_date': '2023-02-01'
        }
        
        response = self.app.post(
            '/subscriptions',
            data=json.dumps(subscription_data),
            content_type='application/json'
        )
        self.assertEqual(response.status_code, 201, "Failed to create subscription")
        
        if response.status_code == 201:
            created_data = json.loads(response.data)
            subscription_id = created_data['id']
            
            # Delete the subscription
            response = self.app.delete(f'/subscriptions/{subscription_id}')
            self.assertEqual(response.status_code, 200)
            
            # Verify the subscription was deleted
            if response.status_code == 200:
                response = self.app.get(f'/subscriptions/{subscription_id}')
                self.assertEqual(response.status_code, 404)
        
        # Test deleting non-existent ID
        response = self.app.delete('/subscriptions/9999')
        self.assertEqual(response.status_code, 404)

    def test_list_subscriptions_by_category(self):
        """Test retrieving subscriptions filtered by category"""
        # Create subscriptions in different categories
        self.app.post(
            '/subscriptions',
            data=json.dumps({
                'name': 'Netflix',
                'amount': 15.99,
                'category': 'Entertainment',
                'billing_cycle': 'monthly',
                'start_date': '2023-01-01',
                'renewal_date': '2023-02-01'
            }),
            content_type='application/json'
        )
        
        self.app.post(
            '/subscriptions',
            data=json.dumps({
                'name': 'Spotify',
                'amount': 9.99,
                'category': 'Entertainment',
                'billing_cycle': 'monthly',
                'start_date': '2023-01-05',
                'renewal_date': '2023-02-05'
            }),
            content_type='application/json'
        )
        
        self.app.post(
            '/subscriptions',
            data=json.dumps({
                'name': 'Microsoft 365',
                'amount': 6.99,
                'category': 'Productivity',
                'billing_cycle': 'monthly',
                'start_date': '2023-01-10',
                'renewal_date': '2023-02-10'
            }),
            content_type='application/json'
        )
        
        # Get subscriptions filtered by category
        response = self.app.get('/subscriptions?category=Entertainment')
        self.assertEqual(response.status_code, 200)
        data = json.loads(response.data)
        self.assertEqual(len(data), 2)
        self.assertEqual(data[0]['category'], 'Entertainment')
        self.assertEqual(data[1]['category'], 'Entertainment')
        
        # Check another category
        response = self.app.get('/subscriptions?category=Productivity')
        data = json.loads(response.data)
        self.assertEqual(len(data), 1)
        self.assertEqual(data[0]['name'], 'Microsoft 365')

    def test_list_subscriptions_by_billing_cycle(self):
        """Test retrieving subscriptions filtered by billing cycle"""
        # Create subscriptions with different billing cycles
        self.app.post(
            '/subscriptions',
            data=json.dumps({
                'name': 'Netflix',
                'amount': 15.99,
                'category': 'Entertainment',
                'billing_cycle': 'monthly',
                'start_date': '2023-01-01',
                'renewal_date': '2023-02-01'
            }),
            content_type='application/json'
        )
        
        self.app.post(
            '/subscriptions',
            data=json.dumps({
                'name': 'Amazon Prime',
                'amount': 119.99,
                'category': 'Shopping',
                'billing_cycle': 'yearly',
                'start_date': '2023-01-15',
                'renewal_date': '2024-01-15'
            }),
            content_type='application/json'
        )
        
        # Get subscriptions filtered by billing cycle
        response = self.app.get('/subscriptions?billing_cycle=monthly')
        self.assertEqual(response.status_code, 200)
        data = json.loads(response.data)
        self.assertEqual(len(data), 1)
        self.assertEqual(data[0]['name'], 'Netflix')
        
        # Check another billing cycle
        response = self.app.get('/subscriptions?billing_cycle=yearly')
        data = json.loads(response.data)
        self.assertEqual(len(data), 1)
        self.assertEqual(data[0]['name'], 'Amazon Prime')

    def test_calculate_monthly_expense(self):
        """Test calculating total monthly expense for all subscriptions"""
        # Create subscriptions with different billing cycles
        self.app.post(
            '/subscriptions',
            data=json.dumps({
                'name': 'Netflix',
                'amount': 15.99,
                'category': 'Entertainment',
                'billing_cycle': 'monthly',
                'start_date': '2023-01-01',
                'renewal_date': '2023-02-01'
            }),
            content_type='application/json'
        )
        
        self.app.post(
            '/subscriptions',
            data=json.dumps({
                'name': 'Spotify',
                'amount': 9.99,
                'category': 'Entertainment',
                'billing_cycle': 'monthly',
                'start_date': '2023-01-05',
                'renewal_date': '2023-02-05'
            }),
            content_type='application/json'
        )
        
        self.app.post(
            '/subscriptions',
            data=json.dumps({
                'name': 'Amazon Prime',
                'amount': 119.88,  # $9.99 per month equivalent
                'category': 'Shopping',
                'billing_cycle': 'yearly',
                'start_date': '2023-01-15',
                'renewal_date': '2024-01-15'
            }),
            content_type='application/json'
        )
        
        # Get total monthly expense
        response = self.app.get('/subscriptions/monthly-expense')
        self.assertEqual(response.status_code, 200)
        data = json.loads(response.data)
        
        # Monthly expense should be: 15.99 + 9.99 + (119.88/12)
        expected_monthly = 15.99 + 9.99 + (119.88/12)
        self.assertAlmostEqual(data['monthly_expense'], expected_monthly, places=2)

if __name__ == '__main__':
    unittest.main()