import React, { useState, useEffect } from 'react';
import { Container, Row, Col, Card } from 'react-bootstrap';
import axios from 'axios';
import ExpensesByCategory from './dashboard/ExpensesByCategory';
import ExpensesByMonth from './dashboard/ExpensesByMonth';
import API_CONFIG from '../config';

const DashboardPage = () => {
  const [expenses, setExpenses] = useState([]);
  const [subscriptions, setSubscriptions] = useState([]);
  const [monthlySubscriptionCost, setMonthlySubscriptionCost] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true);
      try {
        // Fetch expenses
        const expensesResponse = await axios.get(`${API_CONFIG.BASE_URL}${API_CONFIG.ENDPOINTS.EXPENSES}`);
        setExpenses(expensesResponse.data);
        
        // Fetch subscriptions
        const subscriptionsResponse = await axios.get(`${API_CONFIG.BASE_URL}${API_CONFIG.ENDPOINTS.SUBSCRIPTIONS}`);
        setSubscriptions(subscriptionsResponse.data);
        
        // Fetch monthly subscription cost
        const monthlyExpenseResponse = await axios.get(`${API_CONFIG.BASE_URL}${API_CONFIG.ENDPOINTS.MONTHLY_EXPENSE}`);
        setMonthlySubscriptionCost(monthlyExpenseResponse.data.monthly_expense);
        
        setError(null);
      } catch (err) {
        console.error('Error fetching dashboard data:', err);
        setError('Failed to load dashboard data');
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchData();
  }, []);

  // Calculate total expenses
  const calculateTotalExpenses = () => {
    return expenses.reduce((total, expense) => total + expense.amount, 0).toFixed(2);
  };
  
  // Calculate average expense
  const calculateAverageExpense = () => {
    if (expenses.length === 0) return 0;
    return (expenses.reduce((total, expense) => total + expense.amount, 0) / expenses.length).toFixed(2);
  };
  
  // Get current month expenses
  const getCurrentMonthExpenses = () => {
    const now = new Date();
    const currentMonth = now.getMonth();
    const currentYear = now.getFullYear();
    
    const currentMonthExpenses = expenses.filter(expense => {
      const expenseDate = new Date(expense.date);
      return expenseDate.getMonth() === currentMonth && expenseDate.getFullYear() === currentYear;
    });
    
    return currentMonthExpenses.reduce((total, expense) => total + expense.amount, 0).toFixed(2);
  };

  return (
    <Container fluid>
      {error && <div className="alert alert-danger">{error}</div>}
      
      {isLoading ? (
        <div className="text-center my-5">
          <div className="spinner-border text-primary" role="status">
            <span className="visually-hidden">Loading...</span>
          </div>
          <p className="mt-2">Loading dashboard data...</p>
        </div>
      ) : (
        <>
          {/* Summary Cards */}
          <Row className="mb-4">
            <Col lg={3} md={6} className="mb-4">
              <Card className="border-left-primary shadow h-100 py-2">
                <Card.Body>
                  <Row className="align-items-center">
                    <Col>
                      <div className="text-xs font-weight-bold text-primary text-uppercase mb-1">
                        Total Expenses
                      </div>
                      <div className="h5 mb-0 font-weight-bold">${calculateTotalExpenses()}</div>
                    </Col>
                    <Col xs="auto">
                      <i className="fas fa-dollar-sign fa-2x text-gray-300"></i>
                    </Col>
                  </Row>
                </Card.Body>
              </Card>
            </Col>

            <Col lg={3} md={6} className="mb-4">
              <Card className="border-left-success shadow h-100 py-2">
                <Card.Body>
                  <Row className="align-items-center">
                    <Col>
                      <div className="text-xs font-weight-bold text-success text-uppercase mb-1">
                        Current Month Expenses
                      </div>
                      <div className="h5 mb-0 font-weight-bold">${getCurrentMonthExpenses()}</div>
                    </Col>
                    <Col xs="auto">
                      <i className="fas fa-calendar fa-2x text-gray-300"></i>
                    </Col>
                  </Row>
                </Card.Body>
              </Card>
            </Col>

            <Col lg={3} md={6} className="mb-4">
              <Card className="border-left-info shadow h-100 py-2">
                <Card.Body>
                  <Row className="align-items-center">
                    <Col>
                      <div className="text-xs font-weight-bold text-info text-uppercase mb-1">
                        Monthly Subscription Cost
                      </div>
                      <div className="h5 mb-0 font-weight-bold">${monthlySubscriptionCost.toFixed(2)}</div>
                    </Col>
                    <Col xs="auto">
                      <i className="fas fa-clipboard-list fa-2x text-gray-300"></i>
                    </Col>
                  </Row>
                </Card.Body>
              </Card>
            </Col>

            <Col lg={3} md={6} className="mb-4">
              <Card className="border-left-warning shadow h-100 py-2">
                <Card.Body>
                  <Row className="align-items-center">
                    <Col>
                      <div className="text-xs font-weight-bold text-warning text-uppercase mb-1">
                        Average Expense
                      </div>
                      <div className="h5 mb-0 font-weight-bold">${calculateAverageExpense()}</div>
                    </Col>
                    <Col xs="auto">
                      <i className="fas fa-comments fa-2x text-gray-300"></i>
                    </Col>
                  </Row>
                </Card.Body>
              </Card>
            </Col>
          </Row>

          {/* Charts */}
          <Row>
            <Col lg={6}>
              <ExpensesByCategory expenses={expenses} />
            </Col>
            <Col lg={6}>
              <ExpensesByMonth expenses={expenses} />
            </Col>
          </Row>
        </>
      )}
    </Container>
  );
};

export default DashboardPage;