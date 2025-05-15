import React, { useState } from 'react';
import { Form, Button, Alert } from 'react-bootstrap';
import axios from 'axios';
import API_CONFIG from '../config';
import PropTypes from 'prop-types';

const BudgetForm = ({ categories, onBudgetCreated }) => {
  const [formData, setFormData] = useState({
    category: '',
    amount: '',
    period: 'monthly',
    start_date: new Date().toISOString().split('T')[0]
  });
  
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState(null);
  const [successMessage, setSuccessMessage] = useState(null);
  
  const periodOptions = [
    { value: 'monthly', label: 'Monthly' },
    { value: 'quarterly', label: 'Quarterly' },
    { value: 'annual', label: 'Annual' }
  ];
  
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value
    });
  };
  
  const handleCategoryChange = (e) => {
    setFormData({
      ...formData,
      category: e.target.value
    });
  };
  
  const handlePeriodChange = (e) => {
    setFormData({
      ...formData,
      period: e.target.value
    });
  };
  
  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError(null);
    setSuccessMessage(null);
    
    try {
      // Validate form data
      if (!formData.category) {
        throw new Error('Please select a category');
      }
      
      if (!formData.amount || isNaN(formData.amount) || parseFloat(formData.amount) <= 0) {
        throw new Error('Please enter a valid amount');
      }
      
      // Send data to API
      const response = await axios.post(
        `${API_CONFIG.BASE_URL}${API_CONFIG.ENDPOINTS.BUDGETS}`,
        formData
      );
      
      // Reset form
      setFormData({
        category: '',
        amount: '',
        period: 'monthly',
        start_date: new Date().toISOString().split('T')[0]
      });
      
      setSuccessMessage('Budget created successfully');
      
      // Notify parent component
      if (onBudgetCreated) {
        onBudgetCreated(response.data);
      }
    } catch (err) {
      if (err.response && err.response.data && err.response.data.error) {
        setError(`Error: ${err.response.data.error}`);
      } else {
        setError(`Error: ${err.message || 'Failed to create budget'}`);
      }
      console.error('Error creating budget:', err);
    } finally {
      setIsSubmitting(false);
    }
  };
  
  return (
    <div>
      {error && <Alert variant="danger">{error}</Alert>}
      {successMessage && <Alert variant="success">{successMessage}</Alert>}
      
      <Form onSubmit={handleSubmit}>
        <Form.Group className="mb-3">
          <Form.Label>Category *</Form.Label>
          <Form.Select
            name="category"
            value={formData.category}
            onChange={handleCategoryChange}
            required
          >
            <option value="">Select a category</option>
            {categories.map((category) => (
              <option key={category} value={category}>
                {category}
              </option>
            ))}
          </Form.Select>
        </Form.Group>
        
        <Form.Group className="mb-3">
          <Form.Label>Budget Amount *</Form.Label>
          <Form.Control
            type="number"
            name="amount"
            value={formData.amount}
            onChange={handleInputChange}
            placeholder="Enter budget amount"
            min="0.01"
            step="0.01"
            required
          />
        </Form.Group>
        
        <Form.Group className="mb-3">
          <Form.Label>Period *</Form.Label>
          <Form.Select
            name="period"
            value={formData.period}
            onChange={handlePeriodChange}
            required
          >
            {periodOptions.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </Form.Select>
        </Form.Group>
        
        <Form.Group className="mb-3">
          <Form.Label>Start Date *</Form.Label>
          <Form.Control
            type="date"
            name="start_date"
            value={formData.start_date}
            onChange={handleInputChange}
            required
          />
        </Form.Group>
        
        <Button
          variant="primary"
          type="submit"
          disabled={isSubmitting}
          className="w-100"
        >
          {isSubmitting ? 'Creating...' : 'Create Budget'}
        </Button>
      </Form>
    </div>
  );
};

BudgetForm.propTypes = {
  categories: PropTypes.array.isRequired,
  onBudgetCreated: PropTypes.func
};

export default BudgetForm;