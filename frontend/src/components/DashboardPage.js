import React, { useState, useEffect } from 'react';
import { Container, Row, Col, Card, Spinner, Alert } from 'react-bootstrap';
import axios from 'axios';
import ExpensesByCategory from './dashboard/ExpensesByCategory';
import ExpensesByMonth from './dashboard/ExpensesByMonth';
import ExpenseTrends from './dashboard/ExpenseTrends';
import ExpenseComparison from './dashboard/ExpenseComparison';
import API_CONFIG from '../config';
import { useTheme } from '../contexts/ThemeContext';

const DashboardPage = () => {
  const [expenses, setExpenses] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const { theme } = useTheme();

  useEffect(() => {
    fetchExpenses();
  }, []);

  const fetchExpenses = async () => {
    try {
      setIsLoading(true);
      const response = await axios.get(`${API_CONFIG.BASE_URL}${API_CONFIG.ENDPOINTS.EXPENSES}`);
      setExpenses(response.data);
      setError(null);
    } catch (err) {
      setError(`Failed to fetch expenses: ${err.response?.data?.error || err.message}`);
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading) {
    return (
      <div className="text-center my-5">
        <Spinner animation="border" role="status">
          <span className="visually-hidden">Loading...</span>
        </Spinner>
        <p className="mt-2">Loading dashboard data...</p>
      </div>
    );
  }

  if (error) {
    return <Alert variant="danger">{error}</Alert>;
  }

  return (
    <Container fluid>
      <h2 className="mb-4">Analytics Dashboard</h2>
      
      <Row className="mb-4">
        <Col md={6} lg={3} className="mb-4 mb-lg-0">
          <Card className="h-100 dashboard-card">
            <Card.Body>
              <Card.Title>Total Expenses</Card.Title>
              <h2 className="display-4 text-center my-3">
                ${expenses.reduce((sum, expense) => sum + parseFloat(expense.amount), 0).toFixed(2)}
              </h2>
              <Card.Text className="text-muted text-center">
                From {expenses.length} expense{expenses.length !== 1 ? 's' : ''}
              </Card.Text>
            </Card.Body>
          </Card>
        </Col>
        
        <Col md={6} lg={3} className="mb-4 mb-lg-0">
          <Card className="h-100 dashboard-card">
            <Card.Body>
              <Card.Title>Average Expense</Card.Title>
              <h2 className="display-4 text-center my-3">
                ${expenses.length ? (expenses.reduce((sum, expense) => sum + parseFloat(expense.amount), 0) / expenses.length).toFixed(2) : '0.00'}
              </h2>
              <Card.Text className="text-muted text-center">
                Per expense
              </Card.Text>
            </Card.Body>
          </Card>
        </Col>
        
        <Col md={6} lg={3} className="mb-4 mb-lg-0">
          <Card className="h-100 dashboard-card">
            <Card.Body>
              <Card.Title>Largest Expense</Card.Title>
              <h2 className="display-4 text-center my-3">
                ${expenses.length ? Math.max(...expenses.map(expense => parseFloat(expense.amount))).toFixed(2) : '0.00'}
              </h2>
              <Card.Text className="text-muted text-center">
                Highest individual amount
              </Card.Text>
            </Card.Body>
          </Card>
        </Col>
        
        <Col md={6} lg={3}>
          <Card className="h-100 dashboard-card">
            <Card.Body>
              <Card.Title>Categories</Card.Title>
              <h2 className="display-4 text-center my-3">
                {[...new Set(expenses.map(expense => expense.category))].length}
              </h2>
              <Card.Text className="text-muted text-center">
                Unique expense categories
              </Card.Text>
            </Card.Body>
          </Card>
        </Col>
      </Row>
      
      <Row>
        <Col lg={6} className="mb-4">
          <Card className="dashboard-card">
            <Card.Header as="h5">Expenses by Category</Card.Header>
            <Card.Body>
              <ExpensesByCategory expenses={expenses} theme={theme} />
            </Card.Body>
          </Card>
        </Col>
        
        <Col lg={6} className="mb-4">
          <Card className="dashboard-card">
            <Card.Header as="h5">Expenses by Month</Card.Header>
            <Card.Body>
              <ExpensesByMonth expenses={expenses} theme={theme} />
            </Card.Body>
          </Card>
        </Col>
      </Row>
      
      <Row>
        <Col lg={6} className="mb-4">
          <Card className="dashboard-card">
            <Card.Header as="h5">Expense Trends</Card.Header>
            <Card.Body>
              <ExpenseTrends expenses={expenses} theme={theme} />
            </Card.Body>
          </Card>
        </Col>
        
        <Col lg={6} className="mb-4">
          <Card className="dashboard-card">
            <Card.Header as="h5">Category Comparison</Card.Header>
            <Card.Body>
              <ExpenseComparison expenses={expenses} theme={theme} />
            </Card.Body>
          </Card>
        </Col>
      </Row>
    </Container>
  );
};

export default DashboardPage;