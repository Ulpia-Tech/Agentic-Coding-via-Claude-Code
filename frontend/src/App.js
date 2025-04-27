import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Container, Row, Col } from 'react-bootstrap';
import 'bootstrap/dist/css/bootstrap.min.css';
import ExpenseForm from './components/ExpenseForm';
import ExpenseList from './components/ExpenseList';
import ExpenseSummary from './components/ExpenseSummary';
import './App.css';

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
      const response = await axios.get('/api/expenses');
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
      const response = await axios.get('/api/categories');
      setCategories(response.data);
    } catch (err) {
      console.error('Failed to fetch categories:', err);
    }
  };

  const addExpense = async (expense) => {
    try {
      await axios.post('/api/expenses', expense);
      fetchExpenses();
      fetchCategories();
    } catch (err) {
      setError('Failed to add expense');
      console.error(err);
    }
  };

  const deleteExpense = async (id) => {
    try {
      await axios.delete(`/api/expenses/${id}`);
      fetchExpenses();
      fetchCategories();
    } catch (err) {
      setError('Failed to delete expense');
      console.error(err);
    }
  };

  return (
    <Container className="mt-4">
      <h1 className="text-center mb-4">Expense Tracker</h1>
      
      {error && <div className="alert alert-danger">{error}</div>}
      
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
    </Container>
  );
}

export default App;