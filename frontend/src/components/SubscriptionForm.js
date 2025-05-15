import React, { useState } from 'react';
<<<<<<< HEAD
import PropTypes from 'prop-types';
import { Form, Button, Card, Alert } from 'react-bootstrap';
import axios from 'axios';
import API_CONFIG from '../config';

const SubscriptionForm = ({ onAddSubscription, categories }) => {
  const initialState = {
=======
import { Form, Button, Card, Alert } from 'react-bootstrap';
import PropTypes from 'prop-types';
import axios from 'axios';
import API_CONFIG from '../config';

const SubscriptionForm = ({ onAddSubscription }) => {
  const [subscription, setSubscription] = useState({
>>>>>>> merged-dashboard-theme
    name: '',
    amount: '',
    category: '',
    billing_cycle: 'monthly',
    start_date: '',
    renewal_date: ''
<<<<<<< HEAD
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
=======
  });
  
  const [validated, setValidated] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setSubscription({ ...subscription, [name]: value });
  };

  const calculateRenewalDate = (startDate, billingCycle) => {
    const date = new Date(startDate);
    
    switch (billingCycle) {
      case 'monthly':
        date.setMonth(date.getMonth() + 1);
        break;
      case 'quarterly':
        date.setMonth(date.getMonth() + 3);
        break;
      case 'semi-annual':
        date.setMonth(date.getMonth() + 6);
        break;
      case 'annual':
      case 'yearly':
        date.setFullYear(date.getFullYear() + 1);
        break;
      default:
        date.setMonth(date.getMonth() + 1);
    }
    
    return date.toISOString().split('T')[0];
  };

  const handleStartDateChange = (e) => {
    const startDate = e.target.value;
    const renewalDate = calculateRenewalDate(startDate, subscription.billing_cycle);
    
    setSubscription({
      ...subscription,
      start_date: startDate,
      renewal_date: renewalDate
    });
  };

  const handleBillingCycleChange = (e) => {
    const billingCycle = e.target.value;
    let renewalDate = subscription.renewal_date;
    
    if (subscription.start_date) {
      renewalDate = calculateRenewalDate(subscription.start_date, billingCycle);
    }
    
    setSubscription({
      ...subscription,
      billing_cycle: billingCycle,
      renewal_date: renewalDate
>>>>>>> merged-dashboard-theme
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
<<<<<<< HEAD
    
    const form = e.currentTarget;
=======
    const form = e.currentTarget;
    
>>>>>>> merged-dashboard-theme
    if (form.checkValidity() === false) {
      e.stopPropagation();
      setValidated(true);
      return;
    }
<<<<<<< HEAD

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
=======
    
    // Convert amount to number
    const formattedSubscription = {
      ...subscription,
      amount: parseFloat(subscription.amount)
    };
    
    try {
      const response = await axios.post(
        `${API_CONFIG.BASE_URL}${API_CONFIG.ENDPOINTS.SUBSCRIPTIONS}`, 
        formattedSubscription
      );
      
      // Call the parent component's callback if provided
      if (onAddSubscription) {
        onAddSubscription(response.data);
      }
      
      // Reset form
      setSubscription({
        name: '',
        amount: '',
        category: '',
        billing_cycle: 'monthly',
        start_date: '',
        renewal_date: ''
      });
      
      setValidated(false);
      setError(null);
      setSuccess(true);
      
      // Hide success message after 3 seconds
      setTimeout(() => {
        setSuccess(false);
      }, 3000);
      
    } catch (err) {
      setError('Failed to add subscription. Please check your inputs and try again.');
      console.error('Error adding subscription:', err);
      setSuccess(false);
    }
  };

  return (
    <Card className="shadow mb-4">
      <Card.Header>
        <h5 className="m-0 font-weight-bold">Add Subscription</h5>
      </Card.Header>
      <Card.Body>
        {error && <Alert variant="danger">{error}</Alert>}
        {success && <Alert variant="success">Subscription added successfully!</Alert>}
        
        <Form noValidate validated={validated} onSubmit={handleSubmit}>
          <Form.Group className="mb-3" controlId="subscriptionName">
>>>>>>> merged-dashboard-theme
            <Form.Label>Name</Form.Label>
            <Form.Control
              type="text"
              name="name"
              value={subscription.name}
              onChange={handleChange}
<<<<<<< HEAD
              placeholder="Subscription name (e.g. Netflix, Spotify)"
=======
              placeholder="Netflix, Spotify, etc."
>>>>>>> merged-dashboard-theme
              required
            />
            <Form.Control.Feedback type="invalid">
              Please provide a subscription name.
            </Form.Control.Feedback>
          </Form.Group>
<<<<<<< HEAD

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
=======
          
          <Form.Group className="mb-3" controlId="subscriptionAmount">
            <Form.Label>Amount</Form.Label>
            <Form.Control
              type="number"
              name="amount"
              value={subscription.amount}
              onChange={handleChange}
              placeholder="9.99"
              min="0.01"
              step="0.01"
              required
            />
            <Form.Control.Feedback type="invalid">
              Please provide a valid amount.
            </Form.Control.Feedback>
          </Form.Group>
          
          <Form.Group className="mb-3" controlId="subscriptionCategory">
            <Form.Label>Category</Form.Label>
            <Form.Control
              type="text"
              name="category"
              value={subscription.category}
              onChange={handleChange}
              placeholder="Entertainment, Utilities, etc."
              required
            />
            <Form.Control.Feedback type="invalid">
              Please provide a category.
            </Form.Control.Feedback>
          </Form.Group>
          
          <Form.Group className="mb-3" controlId="subscriptionBillingCycle">
>>>>>>> merged-dashboard-theme
            <Form.Label>Billing Cycle</Form.Label>
            <Form.Select
              name="billing_cycle"
              value={subscription.billing_cycle}
<<<<<<< HEAD
              onChange={handleChange}
              required
            >
              <option value="monthly">Monthly</option>
              <option value="yearly">Yearly</option>
            </Form.Select>
          </Form.Group>

          <Form.Group className="mb-3">
=======
              onChange={handleBillingCycleChange}
              required
            >
              <option value="monthly">Monthly</option>
              <option value="quarterly">Quarterly</option>
              <option value="semi-annual">Semi-Annual</option>
              <option value="annual">Annual</option>
            </Form.Select>
          </Form.Group>
          
          <Form.Group className="mb-3" controlId="subscriptionStartDate">
>>>>>>> merged-dashboard-theme
            <Form.Label>Start Date</Form.Label>
            <Form.Control
              type="date"
              name="start_date"
              value={subscription.start_date}
<<<<<<< HEAD
              onChange={handleChange}
              max={today}
              required
            />
            <Form.Control.Feedback type="invalid">
              Please select a valid start date.
            </Form.Control.Feedback>
          </Form.Group>

          <Form.Group className="mb-3">
=======
              onChange={handleStartDateChange}
              required
            />
            <Form.Control.Feedback type="invalid">
              Please provide a start date.
            </Form.Control.Feedback>
          </Form.Group>
          
          <Form.Group className="mb-3" controlId="subscriptionRenewalDate">
>>>>>>> merged-dashboard-theme
            <Form.Label>Next Renewal Date</Form.Label>
            <Form.Control
              type="date"
              name="renewal_date"
              value={subscription.renewal_date}
              onChange={handleChange}
<<<<<<< HEAD
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
=======
              required
              readOnly
            />
            <Form.Text className="text-muted">
              Auto-calculated based on start date and billing cycle.
            </Form.Text>
          </Form.Group>
          
          <Button variant="primary" type="submit" className="w-100">
            Add Subscription
>>>>>>> merged-dashboard-theme
          </Button>
        </Form>
      </Card.Body>
    </Card>
  );
};

SubscriptionForm.propTypes = {
<<<<<<< HEAD
  onAddSubscription: PropTypes.func.isRequired,
  categories: PropTypes.array
=======
  onAddSubscription: PropTypes.func
>>>>>>> merged-dashboard-theme
};

export default SubscriptionForm;