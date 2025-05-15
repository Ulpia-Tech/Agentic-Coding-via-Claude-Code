import React, { useState } from 'react';
import PropTypes from 'prop-types';
import { Form, Button, Card, Alert } from 'react-bootstrap';
import axios from 'axios';
import API_CONFIG from '../config';

const SubscriptionForm = ({ onAddSubscription, categories }) => {
  const initialState = {
    name: '',
    amount: '',
    category: '',
    billing_cycle: 'monthly',
    start_date: '',
    renewal_date: ''
  };

  const [subscription, setSubscription] = useState(initialState);
  const [validated, setValidated] = useState(false);
  const [error, setError] = useState(null);
  const [submitting, setSubmitting] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setSubscription({
      ...subscription,
      [name]: value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    const form = e.currentTarget;
    if (form.checkValidity() === false) {
      e.stopPropagation();
      setValidated(true);
      return;
    }

    setSubmitting(true);
    setError(null);

    try {
      const response = await axios.post(
        `${API_CONFIG.BASE_URL}${API_CONFIG.ENDPOINTS.SUBSCRIPTIONS}`,
        subscription
      );
      
      if (response.status === 201) {
        setSubscription(initialState);
        setValidated(false);
        if (onAddSubscription) {
          onAddSubscription(response.data);
        }
      }
    } catch (err) {
      const errorMessage = err.response?.data?.error || 'Failed to add subscription';
      setError(errorMessage);
      console.error(err);
    } finally {
      setSubmitting(false);
    }
  };

  const today = new Date().toISOString().split('T')[0];

  return (
    <Card className="mb-4">
      <Card.Header>Add New Subscription</Card.Header>
      <Card.Body>
        {error && <Alert variant="danger">{error}</Alert>}
        
        <Form noValidate validated={validated} onSubmit={handleSubmit}>
          <Form.Group className="mb-3">
            <Form.Label>Name</Form.Label>
            <Form.Control
              type="text"
              name="name"
              value={subscription.name}
              onChange={handleChange}
              placeholder="Subscription name (e.g. Netflix, Spotify)"
              required
            />
            <Form.Control.Feedback type="invalid">
              Please provide a subscription name.
            </Form.Control.Feedback>
          </Form.Group>

          <Form.Group className="mb-3">
            <Form.Label>Amount</Form.Label>
            <Form.Control
              type="number"
              step="0.01"
              name="amount"
              value={subscription.amount}
              onChange={handleChange}
              placeholder="Amount"
              required
              min="0.01"
            />
            <Form.Control.Feedback type="invalid">
              Please provide a valid amount greater than 0.
            </Form.Control.Feedback>
          </Form.Group>

          <Form.Group className="mb-3">
            <Form.Label>Category</Form.Label>
            {categories && categories.length > 0 ? (
              <Form.Select
                name="category"
                value={subscription.category}
                onChange={handleChange}
                required
              >
                <option value="">Select category</option>
                {categories.map((category, index) => (
                  <option key={index} value={category}>
                    {category}
                  </option>
                ))}
              </Form.Select>
            ) : (
              <Form.Control
                type="text"
                name="category"
                value={subscription.category}
                onChange={handleChange}
                placeholder="Category (e.g. Entertainment, Utilities)"
                required
              />
            )}
            <Form.Control.Feedback type="invalid">
              Please select or provide a category.
            </Form.Control.Feedback>
          </Form.Group>

          <Form.Group className="mb-3">
            <Form.Label>Billing Cycle</Form.Label>
            <Form.Select
              name="billing_cycle"
              value={subscription.billing_cycle}
              onChange={handleChange}
              required
            >
              <option value="monthly">Monthly</option>
              <option value="yearly">Yearly</option>
            </Form.Select>
          </Form.Group>

          <Form.Group className="mb-3">
            <Form.Label>Start Date</Form.Label>
            <Form.Control
              type="date"
              name="start_date"
              value={subscription.start_date}
              onChange={handleChange}
              max={today}
              required
            />
            <Form.Control.Feedback type="invalid">
              Please select a valid start date.
            </Form.Control.Feedback>
          </Form.Group>

          <Form.Group className="mb-3">
            <Form.Label>Next Renewal Date</Form.Label>
            <Form.Control
              type="date"
              name="renewal_date"
              value={subscription.renewal_date}
              onChange={handleChange}
              min={today}
              required
            />
            <Form.Control.Feedback type="invalid">
              Please select a valid renewal date.
            </Form.Control.Feedback>
          </Form.Group>

          <Button 
            variant="primary" 
            type="submit"
            disabled={submitting}
          >
            {submitting ? 'Adding...' : 'Add Subscription'}
          </Button>
        </Form>
      </Card.Body>
    </Card>
  );
};

SubscriptionForm.propTypes = {
  onAddSubscription: PropTypes.func.isRequired,
  categories: PropTypes.array
};

export default SubscriptionForm;