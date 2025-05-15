import React, { useState, useEffect } from 'react';
import { Row, Col, Alert } from 'react-bootstrap';
import axios from 'axios';
import API_CONFIG from '../config';
import SubscriptionForm from './SubscriptionForm';
import SubscriptionList from './SubscriptionList';
import SubscriptionSummary from './SubscriptionSummary';

const SubscriptionsPage = () => {
  const [subscriptions, setSubscriptions] = useState([]);
  const [categories, setCategories] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchSubscriptions();
    fetchCategories();
  }, []);

  const fetchSubscriptions = async () => {
    try {
      setIsLoading(true);
      const response = await axios.get(
        `${API_CONFIG.BASE_URL}${API_CONFIG.ENDPOINTS.SUBSCRIPTIONS}`
      );
      setSubscriptions(response.data);
      setError(null);
    } catch (err) {
      setError('Failed to fetch subscriptions. Please try again later.');
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  const fetchCategories = async () => {
    try {
      const response = await axios.get(
        `${API_CONFIG.BASE_URL}${API_CONFIG.ENDPOINTS.CATEGORIES}`
      );
      setCategories(response.data);
    } catch (err) {
      console.error('Failed to fetch categories:', err);
    }
  };

  const addSubscription = async (subscription) => {
    try {
      // The actual API call is handled in the form component
      // Here we're just refreshing the data
      fetchSubscriptions();
    } catch (err) {
      setError('Failed to add subscription');
      console.error(err);
    }
  };

  const deleteSubscription = async (id) => {
    try {
      await axios.delete(
        `${API_CONFIG.BASE_URL}${API_CONFIG.ENDPOINTS.SUBSCRIPTIONS}/${id}`
      );
      fetchSubscriptions();
    } catch (err) {
      setError('Failed to delete subscription');
      console.error(err);
    }
  };

  return (
    <div>
      {error && <Alert variant="danger">{error}</Alert>}
      
      <SubscriptionSummary subscriptions={subscriptions} />
      
      <Row>
        <Col md={4}>
          <SubscriptionForm 
            onAddSubscription={addSubscription} 
            categories={categories} 
          />
        </Col>
        <Col md={8}>
          <SubscriptionList 
            subscriptions={subscriptions} 
            onDeleteSubscription={deleteSubscription} 
            isLoading={isLoading} 
          />
        </Col>
      </Row>
    </div>
  );
};

export default SubscriptionsPage;