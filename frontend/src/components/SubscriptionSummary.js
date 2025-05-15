import React, { useState, useEffect } from 'react';
import PropTypes from 'prop-types';
import { Card, Row, Col, Alert } from 'react-bootstrap';
import axios from 'axios';
import API_CONFIG from '../config';

const SubscriptionSummary = ({ subscriptions }) => {
  const [monthlyExpense, setMonthlyExpense] = useState(0);
  const [yearlyExpense, setYearlyExpense] = useState(0);
  const [error, setError] = useState(null);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    fetchMonthlyExpense();
  }, [subscriptions]);

  const fetchMonthlyExpense = async () => {
    setIsLoading(true);
    try {
      const response = await axios.get(
        `${API_CONFIG.BASE_URL}${API_CONFIG.ENDPOINTS.MONTHLY_EXPENSE}`
      );
      setMonthlyExpense(response.data.monthly_expense);
      setYearlyExpense(response.data.monthly_expense * 12);
      setError(null);
    } catch (err) {
      console.error('Failed to fetch monthly expense:', err);
      setError('Failed to calculate monthly expense');
    } finally {
      setIsLoading(false);
    }
  };

  // Count subscriptions by billing cycle
  const countByBillingCycle = () => {
    const counts = {
      monthly: 0,
      yearly: 0
    };

    subscriptions.forEach(sub => {
      if (sub.billing_cycle in counts) {
        counts[sub.billing_cycle]++;
      }
    });

    return counts;
  };

  const subscriptionCounts = countByBillingCycle();

  return (
    <Card className="mb-4">
      <Card.Header>Subscription Summary</Card.Header>
      <Card.Body>
        {error && <Alert variant="danger">{error}</Alert>}
        
        <Row>
          <Col md={3} className="text-center mb-3">
            <h5>Total Subscriptions</h5>
            <div className="display-4">{subscriptions.length}</div>
          </Col>
          <Col md={3} className="text-center mb-3">
            <h5>Monthly Subscriptions</h5>
            <div className="display-4">{subscriptionCounts.monthly}</div>
          </Col>
          <Col md={3} className="text-center mb-3">
            <h5>Yearly Subscriptions</h5>
            <div className="display-4">{subscriptionCounts.yearly}</div>
          </Col>
          <Col md={3} className="text-center mb-3">
            <h5>Monthly Cost</h5>
            <div className="display-4">
              ${isLoading ? '-' : parseFloat(monthlyExpense).toFixed(2)}
            </div>
          </Col>
        </Row>

        <hr />

        <Row>
          <Col md={12} className="text-center">
            <h5>Annual Cost</h5>
            <div className="display-6 text-danger">
              ${isLoading ? '-' : parseFloat(yearlyExpense).toFixed(2)}
            </div>
          </Col>
        </Row>
      </Card.Body>
    </Card>
  );
};

SubscriptionSummary.propTypes = {
  subscriptions: PropTypes.array.isRequired
};

export default SubscriptionSummary;