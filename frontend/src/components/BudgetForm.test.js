import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import axios from 'axios';
import BudgetForm from './BudgetForm';

// Mock axios
jest.mock('axios');

describe('BudgetForm', () => {
  const mockCategories = ['Food', 'Transport', 'Entertainment'];
  const mockOnBudgetCreated = jest.fn();
  
  beforeEach(() => {
    jest.clearAllMocks();
  });
  
  it('renders the budget form correctly', () => {
    render(<BudgetForm categories={mockCategories} onBudgetCreated={mockOnBudgetCreated} />);
    
    // Check form elements exist
    expect(screen.getByLabelText(/Category/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/Budget Amount/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/Period/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/Start Date/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Create Budget/i })).toBeInTheDocument();
    
    // Check categories are rendered
    const categorySelect = screen.getByLabelText(/Category/i);
    expect(categorySelect).toBeInTheDocument();
    
    mockCategories.forEach(category => {
      expect(screen.getByText(category)).toBeInTheDocument();
    });
  });
  
  it('shows validation errors for empty required fields', async () => {
    render(<BudgetForm categories={mockCategories} onBudgetCreated={mockOnBudgetCreated} />);
    
    // Submit the form without filling required fields
    fireEvent.click(screen.getByRole('button', { name: /Create Budget/i }));
    
    // Wait for validation to complete
    await waitFor(() => {
      expect(screen.getByText(/Please select a category/i)).toBeInTheDocument();
    });
    
    // Check axios was not called
    expect(axios.post).not.toHaveBeenCalled();
  });
  
  it('submits the form with valid data', async () => {
    axios.post.mockResolvedValue({ data: { id: 1, category: 'Food', amount: 200 } });
    
    render(<BudgetForm categories={mockCategories} onBudgetCreated={mockOnBudgetCreated} />);
    
    // Fill in the form
    fireEvent.change(screen.getByLabelText(/Category/i), { target: { value: 'Food' } });
    fireEvent.change(screen.getByLabelText(/Budget Amount/i), { target: { value: '200' } });
    
    // Submit the form
    fireEvent.click(screen.getByRole('button', { name: /Create Budget/i }));
    
    // Wait for submission to complete
    await waitFor(() => {
      expect(axios.post).toHaveBeenCalled();
      expect(mockOnBudgetCreated).toHaveBeenCalled();
      expect(screen.getByText(/Budget created successfully/i)).toBeInTheDocument();
    });
  });
  
  it('handles API error correctly', async () => {
    // Mock axios to reject with an error
    axios.post.mockRejectedValue({
      response: { data: { error: 'Budget for this category already exists' } }
    });
    
    render(<BudgetForm categories={mockCategories} onBudgetCreated={mockOnBudgetCreated} />);
    
    // Fill in the form
    fireEvent.change(screen.getByLabelText(/Category/i), { target: { value: 'Food' } });
    fireEvent.change(screen.getByLabelText(/Budget Amount/i), { target: { value: '200' } });
    
    // Submit the form
    fireEvent.click(screen.getByRole('button', { name: /Create Budget/i }));
    
    // Wait for error to display
    await waitFor(() => {
      expect(screen.getByText(/Budget for this category already exists/i)).toBeInTheDocument();
    });
    
    // Check callback wasn't called
    expect(mockOnBudgetCreated).not.toHaveBeenCalled();
  });
});