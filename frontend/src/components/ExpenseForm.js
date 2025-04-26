import React, { useState } from 'react';
import { Form, Button, Card } from 'react-bootstrap';

const ExpenseForm = ({ onAddExpense, categories }) => {
  const [amount, setAmount] = useState('');
  const [category, setCategory] = useState('');
  const [description, setDescription] = useState('');
  const [date, setDate] = useState('');
  const [customCategory, setCustomCategory] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    
    // Validate amount
    if (!amount || isNaN(amount) || parseFloat(amount) <= 0) {
      alert('Please enter a valid amount');
      return;
    }

    // Use custom category if selected
    const finalCategory = category === 'custom' ? customCategory : category;
    
    // Validate category
    if (!finalCategory) {
      alert('Please select or enter a category');
      return;
    }

    onAddExpense({
      amount: parseFloat(amount),
      category: finalCategory,
      description,
      date: date || new Date().toISOString().split('T')[0]
    });

    // Clear form
    setAmount('');
    setCategory('');
    setDescription('');
    setDate('');
    setCustomCategory('');
  };

  const predefinedCategories = [
    'Food', 'Transport', 'Entertainment', 'Shopping', 'Housing', 'Utilities', 'Health', 'Travel', 'Other'
  ];

  // Combine predefined and existing categories without duplicates
  const allCategories = [...new Set([...predefinedCategories, ...categories])];

  return (
    <Card className="mb-4">
      <Card.Header as="h5">Add New Expense</Card.Header>
      <Card.Body>
        <Form onSubmit={handleSubmit}>
          <Form.Group className="mb-3">
            <Form.Label>Amount ($)</Form.Label>
            <Form.Control
              type="number"
              step="0.01"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              placeholder="Enter amount"
              required
            />
          </Form.Group>

          <Form.Group className="mb-3">
            <Form.Label>Category</Form.Label>
            <Form.Select
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              required
            >
              <option value="">Select category</option>
              {allCategories.map((cat) => (
                <option key={cat} value={cat}>{cat}</option>
              ))}
              <option value="custom">Add custom category</option>
            </Form.Select>
          </Form.Group>

          {category === 'custom' && (
            <Form.Group className="mb-3">
              <Form.Label>Custom Category</Form.Label>
              <Form.Control
                type="text"
                value={customCategory}
                onChange={(e) => setCustomCategory(e.target.value)}
                placeholder="Enter custom category"
                required
              />
            </Form.Group>
          )}

          <Form.Group className="mb-3">
            <Form.Label>Description (Optional)</Form.Label>
            <Form.Control
              as="textarea"
              rows={2}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Enter description"
            />
          </Form.Group>

          <Form.Group className="mb-3">
            <Form.Label>Date</Form.Label>
            <Form.Control
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
            />
          </Form.Group>

          <Button variant="primary" type="submit">
            Add Expense
          </Button>
        </Form>
      </Card.Body>
    </Card>
  );
};

export default ExpenseForm;