import React, { useState, useEffect } from 'react';
import { Container, Row, Col, Card } from 'react-bootstrap';
import axios from 'axios';
import API_CONFIG from '../config';

const SubscriptionsPage = () => {
  const [subscriptions, setSubscriptions] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [monthlyTotal, setMonthlyTotal] = useState(0);

  useEffect(() => {
    const fetchSubscriptions = async () => {
      setIsLoading(true);
      try {
        const response = await axios.get(`${API_CONFIG.BASE_URL}${API_CONFIG.ENDPOINTS.SUBSCRIPTIONS}`);
        setSubscriptions(response.data);
        
        // Get monthly expense
        const monthlyResponse = await axios.get(`${API_CONFIG.BASE_URL}${API_CONFIG.ENDPOINTS.MONTHLY_EXPENSE}`);
        setMonthlyTotal(monthlyResponse.data.monthly_expense);
        
        setError(null);
      } catch (err) {
        console.error('Error fetching subscriptions:', err);
        setError('Failed to load subscriptions');
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchSubscriptions();
  }, []);

  // Calculate renewal status based on date
  const getRenewalStatus = (renewalDate) => {
    const today = new Date();
    const renewal = new Date(renewalDate);
    const diffTime = renewal - today;
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    if (diffDays < 0) {
      return { status: 'Overdue', class: 'danger' };
    } else if (diffDays <= 7) {
      return { status: 'Soon', class: 'warning' };
    } else {
      return { status: 'Active', class: 'success' };
    }
  };

  return (
    <Container fluid className="p-0">
      {error && <div className="alert alert-danger">{error}</div>}
      
      <Row className="mb-4">
        <Col lg={12}>
          <Card className="shadow">
            <Card.Header>
              <h5 className="m-0 font-weight-bold">Subscription Summary</h5>
            </Card.Header>
            <Card.Body>
              <Row>
                <Col md={4}>
                  <div className="text-xs font-weight-bold text-primary text-uppercase mb-1">
                    Total Subscriptions
                  </div>
                  <div className="h5 mb-0 font-weight-bold">
                    {subscriptions.length}
                  </div>
                </Col>
                <Col md={4}>
                  <div className="text-xs font-weight-bold text-success text-uppercase mb-1">
                    Monthly Cost
                  </div>
                  <div className="h5 mb-0 font-weight-bold">
                    ${monthlyTotal.toFixed(2)}
                  </div>
                </Col>
                <Col md={4}>
                  <div className="text-xs font-weight-bold text-info text-uppercase mb-1">
                    Yearly Cost
                  </div>
                  <div className="h5 mb-0 font-weight-bold">
                    ${(monthlyTotal * 12).toFixed(2)}
                  </div>
                </Col>
              </Row>
            </Card.Body>
          </Card>
        </Col>
      </Row>
      
      <Card className="shadow mb-4">
        <Card.Header>
          <h5 className="m-0 font-weight-bold">Active Subscriptions</h5>
        </Card.Header>
        <Card.Body>
          {isLoading ? (
            <div className="text-center my-5">
              <div className="spinner-border text-primary" role="status">
                <span className="visually-hidden">Loading...</span>
              </div>
              <p className="mt-2">Loading subscriptions...</p>
            </div>
          ) : subscriptions.length === 0 ? (
            <div className="text-center text-muted py-5">
              <p>No subscriptions found</p>
              <p>Add subscriptions to track your recurring expenses</p>
            </div>
          ) : (
            <div className="table-responsive">
              <table className="table table-bordered">
                <thead>
                  <tr>
                    <th>Name</th>
                    <th>Amount</th>
                    <th>Category</th>
                    <th>Billing Cycle</th>
                    <th>Next Renewal</th>
                    <th>Status</th>
                  </tr>
                </thead>
                <tbody>
                  {subscriptions.map((subscription) => {
                    const renewalInfo = getRenewalStatus(subscription.renewal_date);
                    
                    return (
                      <tr key={subscription.id}>
                        <td>{subscription.name}</td>
                        <td>${subscription.amount.toFixed(2)}</td>
                        <td>{subscription.category}</td>
                        <td>{subscription.billing_cycle}</td>
                        <td>{subscription.renewal_date}</td>
                        <td>
                          <span className={`badge bg-${renewalInfo.class}`}>
                            {renewalInfo.status}
                          </span>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </Card.Body>
      </Card>
      
      <div className="text-muted text-center mt-3">
        <p>
          <small>
            Use the backend API to add, update, or delete subscriptions.
          </small>
        </p>
      </div>
    </Container>
  );
};

export default SubscriptionsPage;