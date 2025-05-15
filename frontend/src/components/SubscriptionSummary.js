import React, { useState, useEffect, useContext } from 'react';
import { Card, Row, Col } from 'react-bootstrap';
import { Pie } from 'react-chartjs-2';
import { ThemeContext } from '../contexts/ThemeContext';
import axios from 'axios';
import API_CONFIG from '../config';
import { Chart as ChartJS, ArcElement, Tooltip, Legend } from 'chart.js';

ChartJS.register(ArcElement, Tooltip, Legend);

const SubscriptionSummary = () => {
  const [monthlyTotal, setMonthlyTotal] = useState(0);
  const [subscriptions, setSubscriptions] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const { theme } = useContext(ThemeContext);

  useEffect(() => {
    const fetchData = async () => {
      try {
        // Get subscriptions
        const subscriptionsResponse = await axios.get(
          `${API_CONFIG.BASE_URL}${API_CONFIG.ENDPOINTS.SUBSCRIPTIONS}`
        );
        setSubscriptions(subscriptionsResponse.data);
        
        // Get monthly expense
        const monthlyResponse = await axios.get(
          `${API_CONFIG.BASE_URL}${API_CONFIG.ENDPOINTS.MONTHLY_EXPENSE}`
        );
        setMonthlyTotal(monthlyResponse.data.monthly_expense);
        
        setError(null);
      } catch (err) {
        console.error('Error fetching subscription data:', err);
        setError('Failed to load subscription data');
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchData();
  }, []);

  // Process data for chart
  const getCategoryData = () => {
    const categoryTotals = {};
    
    subscriptions.forEach(subscription => {
      const { category, amount, billing_cycle } = subscription;
      
      // Normalize to monthly amount
      let monthlyAmount = amount;
      if (billing_cycle === 'quarterly') monthlyAmount = amount / 3;
      if (billing_cycle === 'semi-annual') monthlyAmount = amount / 6;
      if (billing_cycle === 'annual' || billing_cycle === 'yearly') monthlyAmount = amount / 12;
      
      if (categoryTotals[category]) {
        categoryTotals[category] += monthlyAmount;
      } else {
        categoryTotals[category] = monthlyAmount;
      }
    });
    
    return {
      labels: Object.keys(categoryTotals),
      data: Object.values(categoryTotals)
    };
  };

  const categoryData = getCategoryData();
  
  // Chart colors
  const chartColors = [
    '#4e73df', '#1cc88a', '#36b9cc', '#f6c23e', '#e74a3b',
    '#6f42c1', '#5a5c69', '#858796', '#2e59d9', '#17a673'
  ];
  
  // Chart data
  const data = {
    labels: categoryData.labels,
    datasets: [
      {
        data: categoryData.data,
        backgroundColor: chartColors,
        borderColor: theme === 'dark' ? '#2d2d2d' : '#ffffff',
        borderWidth: 1,
      }
    ]
  };
  
  // Chart options
  const options = {
    plugins: {
      legend: {
        position: 'bottom',
        labels: {
          color: theme === 'dark' ? '#e9ecef' : '#212529',
          font: {
            size: 12
          }
        }
      },
      tooltip: {
        backgroundColor: theme === 'dark' ? '#3d3d3d' : 'rgba(0, 0, 0, 0.8)',
        titleColor: theme === 'dark' ? '#ffffff' : '#ffffff',
        bodyColor: theme === 'dark' ? '#e9ecef' : '#ffffff',
        callbacks: {
          label: function(context) {
            const label = context.label || '';
            const value = context.raw || 0;
            const percentage = (value / monthlyTotal * 100).toFixed(1);
            return `${label}: $${value.toFixed(2)} (${percentage}%)`;
          }
        }
      }
    },
    maintainAspectRatio: false,
    responsive: true
  };

  // Group by billing cycle
  const getBillingCycleCounts = () => {
    const counts = {
      monthly: 0,
      quarterly: 0,
      'semi-annual': 0,
      annual: 0
    };
    
    subscriptions.forEach(subscription => {
      const cycle = subscription.billing_cycle === 'yearly' ? 'annual' : subscription.billing_cycle;
      counts[cycle] = (counts[cycle] || 0) + 1;
    });
    
    return counts;
  };
  
  const cycleCounts = getBillingCycleCounts();

  return (
    <Card className="shadow mb-4">
      <Card.Header>
        <h5 className="m-0 font-weight-bold">Subscription Summary</h5>
      </Card.Header>
      <Card.Body>
        {isLoading ? (
          <div className="text-center my-4">
            <div className="spinner-border text-primary" role="status">
              <span className="visually-hidden">Loading...</span>
            </div>
            <p className="mt-2">Loading subscription data...</p>
          </div>
        ) : error ? (
          <div className="alert alert-danger">{error}</div>
        ) : (
          <Row>
            {/* Financial Summary */}
            <Col md={6} className="mb-4">
              <Row className="text-center">
                <Col sm={6} className="mb-3">
                  <div className="border-left-primary py-2">
                    <div className="text-xs font-weight-bold text-primary text-uppercase mb-1">
                      Monthly Cost
                    </div>
                    <div className="h5 mb-0 font-weight-bold">
                      ${monthlyTotal.toFixed(2)}
                    </div>
                  </div>
                </Col>
                <Col sm={6} className="mb-3">
                  <div className="border-left-success py-2">
                    <div className="text-xs font-weight-bold text-success text-uppercase mb-1">
                      Annual Cost
                    </div>
                    <div className="h5 mb-0 font-weight-bold">
                      ${(monthlyTotal * 12).toFixed(2)}
                    </div>
                  </div>
                </Col>
                <Col sm={6} className="mb-3">
                  <div className="border-left-info py-2">
                    <div className="text-xs font-weight-bold text-info text-uppercase mb-1">
                      Total Subscriptions
                    </div>
                    <div className="h5 mb-0 font-weight-bold">
                      {subscriptions.length}
                    </div>
                  </div>
                </Col>
                <Col sm={6} className="mb-3">
                  <div className="border-left-warning py-2">
                    <div className="text-xs font-weight-bold text-warning text-uppercase mb-1">
                      Categories
                    </div>
                    <div className="h5 mb-0 font-weight-bold">
                      {categoryData.labels.length}
                    </div>
                  </div>
                </Col>
              </Row>
              
              <div className="mt-3">
                <h6 className="font-weight-bold">Billing Cycles</h6>
                <ul className="list-group">
                  <li className="list-group-item d-flex justify-content-between align-items-center">
                    Monthly
                    <span className="badge bg-primary rounded-pill">{cycleCounts.monthly}</span>
                  </li>
                  <li className="list-group-item d-flex justify-content-between align-items-center">
                    Quarterly
                    <span className="badge bg-primary rounded-pill">{cycleCounts.quarterly}</span>
                  </li>
                  <li className="list-group-item d-flex justify-content-between align-items-center">
                    Semi-Annual
                    <span className="badge bg-primary rounded-pill">{cycleCounts['semi-annual']}</span>
                  </li>
                  <li className="list-group-item d-flex justify-content-between align-items-center">
                    Annual
                    <span className="badge bg-primary rounded-pill">{cycleCounts.annual}</span>
                  </li>
                </ul>
              </div>
            </Col>
            
            {/* Chart */}
            <Col md={6}>
              <div className="chart-container" style={{ height: '300px' }}>
                {subscriptions.length > 0 ? (
                  <Pie data={data} options={options} />
                ) : (
                  <div className="text-center text-muted h-100 d-flex align-items-center justify-content-center">
                    <div>
                      <p>No subscription data available</p>
                      <p className="small">Add subscriptions to see the breakdown</p>
                    </div>
                  </div>
                )}
              </div>
            </Col>
          </Row>
        )}
      </Card.Body>
    </Card>
  );
};

export default SubscriptionSummary;