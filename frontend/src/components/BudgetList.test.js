import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import axios from 'axios';
import BudgetList from './BudgetList';

// Mock axios
jest.mock('axios');

describe('BudgetList', () => {
  const mockBudgets = [
    {
      id: 1,
      category: 'Food',
      amount: 300.00,
      period: 'monthly',
      start_date: '2023-05-01',
      created_at: '2023-05-01T10:00:00',
      updated_at: '2023-05-01T10:00:00'
    },
    {
      id: 2,
      category: 'Entertainment',
      amount: 100.00,
      period: 'monthly',
      start_date: '2023-05-01',
      created_at: '2023-05-01T10:00:00',
      updated_at: '2023-05-01T10:00:00'
    }
  ];
  
  const mockOnBudgetDeleted = jest.fn();
  
  beforeEach(() => {
    jest.clearAllMocks();
  });
  
  it('renders loading state correctly', () => {
    render(
      <BudgetList 
        budgets={[]} 
        onBudgetDeleted={mockOnBudgetDeleted} 
        isLoading={true} 
      />
    );
    
    expect(screen.getByText(/Loading budgets/i)).toBeInTheDocument();
  });
  
  it('renders empty state correctly', () => {
    render(
      <BudgetList 
        budgets={[]} 
        onBudgetDeleted={mockOnBudgetDeleted} 
        isLoading={false} 
      />
    );
    
    expect(screen.getByText(/No budgets found/i)).toBeInTheDocument();
  });
  
  it('renders budget list correctly', () => {
    render(
      <BudgetList 
        budgets={mockBudgets} 
        onBudgetDeleted={mockOnBudgetDeleted} 
        isLoading={false} 
      />
    );
    
    // Check if categories are displayed
    expect(screen.getByText('Food')).toBeInTheDocument();
    expect(screen.getByText('Entertainment')).toBeInTheDocument();
    
    // Check if amounts are displayed
    expect(screen.getByText('$300.00')).toBeInTheDocument();
    expect(screen.getByText('$100.00')).toBeInTheDocument();
    
    // Check if periods are displayed
    expect(screen.getAllByText('Monthly').length).toBe(2);
    
    // Check if delete buttons are displayed
    expect(screen.getAllByRole('button', { name: /Delete/i }).length).toBe(2);
  });
  
  it('opens delete confirmation modal when delete button is clicked', () => {
    render(
      <BudgetList 
        budgets={mockBudgets} 
        onBudgetDeleted={mockOnBudgetDeleted} 
        isLoading={false} 
      />
    );
    
    // Click the first delete button
    fireEvent.click(screen.getAllByRole('button', { name: /Delete/i })[0]);
    
    // Check if confirmation modal is displayed
    expect(screen.getByText(/Are you sure you want to delete the budget for/i)).toBeInTheDocument();
    expect(screen.getByText(/Food/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Cancel/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Delete/i })).toBeInTheDocument();
  });
  
  it('deletes budget when confirmation is given', async () => {
    // Mock successful deletion
    axios.delete.mockResolvedValue({});
    
    render(
      <BudgetList 
        budgets={mockBudgets} 
        onBudgetDeleted={mockOnBudgetDeleted} 
        isLoading={false} 
      />
    );
    
    // Click the first delete button
    fireEvent.click(screen.getAllByRole('button', { name: /Delete/i })[0]);
    
    // Confirm deletion
    fireEvent.click(screen.getByRole('button', { name: /Delete/i }));
    
    // Wait for deletion to complete
    await waitFor(() => {
      expect(axios.delete).toHaveBeenCalledWith(expect.stringContaining('/budgets/1'));
      expect(mockOnBudgetDeleted).toHaveBeenCalled();
    });
  });
  
  it('shows error when deletion fails', async () => {
    // Mock failed deletion
    axios.delete.mockRejectedValue(new Error('Failed to delete'));
    
    render(
      <BudgetList 
        budgets={mockBudgets} 
        onBudgetDeleted={mockOnBudgetDeleted} 
        isLoading={false} 
      />
    );
    
    // Click the first delete button
    fireEvent.click(screen.getAllByRole('button', { name: /Delete/i })[0]);
    
    // Confirm deletion
    fireEvent.click(screen.getByRole('button', { name: /Delete/i }));
    
    // Wait for error to display
    await waitFor(() => {
      expect(screen.getByText(/Failed to delete budget/i)).toBeInTheDocument();
    });
    
    // Callback should not have been called
    expect(mockOnBudgetDeleted).not.toHaveBeenCalled();
  });
});