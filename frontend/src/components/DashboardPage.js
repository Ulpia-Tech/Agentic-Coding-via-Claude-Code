import React, { useState, useEffect } from 'react';
import { Container, Row, Col, Card, ProgressBar } from 'react-bootstrap';
import axios from 'axios';
import API_CONFIG from '../config';
import { Chart as ChartJS, ArcElement, Tooltip, Legend, CategoryScale, LinearScale, PointElement, LineElement, Title, Filler } from 'chart.js';
import { Pie, Line } from 'react-chartjs-2';

// Register ChartJS components
ChartJS.register(
  ArcElement, 
  Tooltip, 
  Legend,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Filler
);

const DashboardPage = () => {
  const [expenses, setExpenses] = useState([]);
  const [subscriptions, setSubscriptions] = useState([]);
  const [budgetProgress, setBudgetProgress] = useState([]);
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
        
        // Fetch budget progress
        const budgetProgressResponse = await axios.get(`${API_CONFIG.BASE_URL}${API_CONFIG.ENDPOINTS.BUDGET_PROGRESS}`);
        setBudgetProgress(budgetProgressResponse.data);
        
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
  
  // Prepare data for Category pie chart
  const getCategoryChartData = () => {
    // Group expenses by category and sum amounts
    const categoryTotals = expenses.reduce((acc, expense) => {
      const { category, amount } = expense;
      if (!acc[category]) {
        acc[category] = 0;
      }
      acc[category] += amount;
      return acc;
    }, {});
    
    // Generate random colors for categories
    const generateColor = (index) => {
      const colors = [
        'rgba(255, 99, 132, 0.7)',
        'rgba(54, 162, 235, 0.7)',
        'rgba(255, 206, 86, 0.7)',
        'rgba(75, 192, 192, 0.7)',
        'rgba(153, 102, 255, 0.7)',
        'rgba(255, 159, 64, 0.7)',
        'rgba(199, 199, 199, 0.7)',
        'rgba(83, 102, 255, 0.7)',
        'rgba(40, 159, 64, 0.7)',
        'rgba(210, 199, 199, 0.7)',
        'rgba(78, 52, 199, 0.7)',
        'rgba(209, 73, 91, 0.7)',
        'rgba(27, 159, 119, 0.7)'
      ];
      return colors[index % colors.length];
    };
    
    const categories = Object.keys(categoryTotals);
    const amounts = categories.map(category => categoryTotals[category]);
    const backgroundColors = categories.map((_, index) => generateColor(index));
    const borderColors = backgroundColors.map(color => color.replace('0.7', '1'));
    
    return {
      labels: categories,
      datasets: [
        {
          label: 'Expense Amount',
          data: amounts,
          backgroundColor: backgroundColors,
          borderColor: borderColors,
          borderWidth: 1,
        },
      ],
    };
  };
  
  // Prepare data for Monthly Trend line chart
  const getMonthlyTrendChartData = () => {
    // Group expenses by month and sum amounts
    const monthlyData = {};
    
    // Process expenses for the last 12 months
    const today = new Date();
    const oneYearAgo = new Date();
    oneYearAgo.setFullYear(today.getFullYear() - 1);
    
    // Prefill all months in the last year to ensure all months are shown even if no expenses
    for (let i = 0; i < 12; i++) {
      const date = new Date(oneYearAgo);
      date.setMonth(oneYearAgo.getMonth() + i);
      const monthKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
      monthlyData[monthKey] = 0;
    }
    
    // Fill in actual expense data
    expenses.forEach(expense => {
      const expenseDate = new Date(expense.date);
      
      // Only include expenses from the last 12 months
      if (expenseDate >= oneYearAgo) {
        const monthKey = `${expenseDate.getFullYear()}-${String(expenseDate.getMonth() + 1).padStart(2, '0')}`;
        if (monthlyData[monthKey] !== undefined) {
          monthlyData[monthKey] += expense.amount;
        }
      }
    });
    
    // Convert to arrays for Chart.js
    const sortedMonths = Object.keys(monthlyData).sort();
    const monthLabels = sortedMonths.map(monthKey => {
      const [year, month] = monthKey.split('-');
      const date = new Date(parseInt(year), parseInt(month) - 1, 1);
      return date.toLocaleDateString(undefined, { month: 'short', year: 'numeric' });
    });
    
    const monthlySums = sortedMonths.map(month => monthlyData[month]);
    
    return {
      labels: monthLabels,
      datasets: [
        {
          label: 'Monthly Expenses',
          data: monthlySums,
          fill: true,
          backgroundColor: 'rgba(75, 192, 192, 0.2)',
          borderColor: 'rgba(75, 192, 192, 1)',
          borderWidth: 2,
          tension: 0.1,
          pointBackgroundColor: 'rgba(75, 192, 192, 1)',
          pointRadius: 4,
          pointHoverRadius: 6,
        },
      ],
    };
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
                  </Row>
                </Card.Body>
              </Card>
            </Col>
          </Row>

          {/* Budget Progress Cards */}
          <Row className="mb-4">
            <Col lg={12}>
              <Card className="shadow">
                <Card.Header>
                  <h6 className="m-0 font-weight-bold">Budget Progress</h6>
                </Card.Header>
                <Card.Body>
                  {budgetProgress.length === 0 ? (
                    <div className="text-center text-muted py-4">
                      <p>No budget data available</p>
                      <p>Create budgets to track your spending against limits</p>
                    </div>
                  ) : (
                    <Row>
                      {budgetProgress.map(budget => (
                        <Col lg={6} className="mb-4" key={budget.budget_id}>
                          <Card className="border">
                            <Card.Body>
                              <h6 className="font-weight-bold">{budget.category}</h6>
                              <div className="d-flex justify-content-between mb-1">
                                <span>
                                  ${budget.actual_spending.toFixed(2)} of ${budget.amount.toFixed(2)}
                                </span>
                                <span>
                                  {budget.percentage_used.toFixed(0)}%
                                </span>
                              </div>
                              <ProgressBar 
                                now={Math.min(budget.percentage_used, 100)} 
                                variant={
                                  budget.status === 'on_track' ? 'success' : 
                                  budget.status === 'warning' ? 'warning' : 'danger'
                                }
                                className="mb-2"
                              />
                              <div className="d-flex justify-content-between small text-muted">
                                <span>Period: {budget.period}</span>
                                <span>Remaining: ${budget.remaining.toFixed(2)}</span>
                              </div>
                            </Card.Body>
                          </Card>
                        </Col>
                      ))}
                    </Row>
                  )}
                </Card.Body>
              </Card>
            </Col>
          </Row>
          
          {/* Charts section */}
          <Row>
            <Col lg={6} className="mb-4">
              <Card className="shadow">
                <Card.Header>
                  <h6 className="m-0 font-weight-bold">Expenses by Category</h6>
                </Card.Header>
                <Card.Body style={{ height: '380px' }} className="d-flex align-items-center justify-content-center">
                  {expenses.length === 0 ? (
                    <div className="text-center text-muted">
                      <p>No expense data available</p>
                      <p>Add expenses to see category distribution</p>
                    </div>
                  ) : (
                    <div style={{ width: '100%', height: '100%', padding: '20px' }}>
                      <Pie 
                        data={getCategoryChartData()} 
                        options={{
                          responsive: true,
                          maintainAspectRatio: false,
                          plugins: {
                            legend: {
                              position: 'bottom',
                            },
                            tooltip: {
                              callbacks: {
                                label: (context) => {
                                  const value = context.parsed;
                                  const total = context.dataset.data.reduce((acc, val) => acc + val, 0);
                                  const percentage = ((value / total) * 100).toFixed(1);
                                  return `${context.label}: $${value.toFixed(2)} (${percentage}%)`;
                                }
                              }
                            }
                          }
                        }}
                      />
                    </div>
                  )}
                </Card.Body>
              </Card>
            </Col>
            <Col lg={6} className="mb-4">
              <Card className="shadow">
                <Card.Header>
                  <h6 className="m-0 font-weight-bold">Monthly Expense Trend</h6>
                </Card.Header>
                <Card.Body style={{ height: '380px' }} className="d-flex align-items-center justify-content-center">
                  {expenses.length === 0 ? (
                    <div className="text-center text-muted">
                      <p>No expense data available</p>
                      <p>Add expenses to see monthly trends</p>
                    </div>
                  ) : (
                    <div style={{ width: '100%', height: '100%', padding: '20px' }}>
                      <Line 
                        data={getMonthlyTrendChartData()}
                        options={{
                          responsive: true,
                          maintainAspectRatio: false,
                          plugins: {
                            legend: {
                              position: 'top',
                            },
                            tooltip: {
                              callbacks: {
                                label: (context) => {
                                  return `Expenses: $${context.parsed.y.toFixed(2)}`;
                                }
                              }
                            }
                          },
                          scales: {
                            y: {
                              beginAtZero: true,
                              title: {
                                display: true,
                                text: 'Amount ($)'
                              },
                              ticks: {
                                // Include a dollar sign in the ticks
                                callback: function(value) {
                                  return '$' + value;
                                }
                              }
                            },
                            x: {
                              title: {
                                display: true,
                                text: 'Month'
                              }
                            }
                          }
                        }}
                      />
                    </div>
                  )}
                </Card.Body>
              </Card>
            </Col>
          </Row>
        </>
      )}
    </Container>
  );
};

export default DashboardPage;