import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Container, Row, Col, Nav, Tab } from 'react-bootstrap';
import { BrowserRouter as Router, Routes, Route, Link, Navigate } from 'react-router-dom';
import 'bootstrap/dist/css/bootstrap.min.css';
import ExpenseForm from './components/ExpenseForm';
import ExpenseList from './components/ExpenseList';
import ExpenseSummary from './components/ExpenseSummary';
import ReceiptsPage from './components/ReceiptsPage';
import SubscriptionsPage from './components/SubscriptionsPage';
import './App.css';

const API_URL = 'http://localhost:5001';

// Configure axios defaults
axios.defaults.headers.post['Content-Type'] = 'application/json';

function App() {
  const [expenses, setExpenses] = useState([]);
  const [categories, setCategories] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchExpenses();
    fetchCategories();
  }, []);

  const fetchExpenses = async () => {
    try {
      setIsLoading(true);
      const response = await axios.get(`${API_URL}/expenses`);
      setExpenses(response.data);
      setError(null);
    } catch (err) {
      setError('Failed to fetch expenses');
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  const fetchCategories = async () => {
    try {
      const response = await axios.get(`${API_URL}/categories`);
      setCategories(response.data);
    } catch (err) {
      console.error('Failed to fetch categories:', err);
    }
  };

  const addExpense = async (expense) => {
    try {
      await axios.post(`${API_URL}/expenses`, expense);
      fetchExpenses();
      fetchCategories();
    } catch (err) {
      setError('Failed to add expense');
      console.error(err);
    }
  };

  const deleteExpense = async (id) => {
    try {
      await axios.delete(`${API_URL}/expenses/${id}`);
      fetchExpenses();
      fetchCategories();
    } catch (err) {
      setError('Failed to delete expense');
      console.error(err);
    }
  };

  return (
    <Router>
      <Container className="mt-4">
        <h1 className="text-center mb-4">Expense Tracker</h1>
        
        {error && <div className="alert alert-danger">{error}</div>}
        
        <Nav variant="tabs" className="mb-3">
          <Nav.Item>
            <Nav.Link as={Link} to="/expenses">Expenses</Nav.Link>
          </Nav.Item>
          <Nav.Item>
            <Nav.Link as={Link} to="/receipts">Receipts</Nav.Link>
          </Nav.Item>
          <Nav.Item>
            <Nav.Link as={Link} to="/subscriptions">Subscriptions</Nav.Link>
          </Nav.Item>
        </Nav>
        
        <Routes>
          <Route path="/expenses" element={
            <Row>
              <Col md={4}>
                <ExpenseForm onAddExpense={addExpense} categories={categories} />
              </Col>
              <Col md={8}>
                <ExpenseSummary expenses={expenses} />
                <ExpenseList 
                  expenses={expenses} 
                  onDeleteExpense={deleteExpense} 
                  isLoading={isLoading} 
                />
              </Col>
            </Row>
          } />
          <Route path="/receipts" element={<ReceiptsPage />} />
          <Route path="/subscriptions" element={<SubscriptionsPage />} />
          <Route path="/" element={<Navigate to="/expenses" replace />} />
        </Routes>
      </Container>
    </Router>
  );
}

export default App;