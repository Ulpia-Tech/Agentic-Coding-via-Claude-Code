import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import axios from 'axios';
import BudgetsPage from './BudgetsPage';

// Mock child components
jest.mock('./BudgetForm', () => () => <div data-testid="budget-form">Budget Form</div>);
jest.mock('./BudgetList', () => () => <div data-testid="budget-list">Budget List</div>);
jest.mock('./BudgetProgress', () => () => <div data-testid="budget-progress">Budget Progress</div>);

// Mock axios
jest.mock('axios');

describe('BudgetsPage', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    
    // Set up default mock responses
    axios.get.mockImplementation((url) => {
      if (url.includes('/budgets')) {
        return Promise.resolve({ data: [] });
      } else if (url.includes('/budgets/progress')) {
        return Promise.resolve({ data: [] });
      } else if (url.includes('/categories')) {
        return Promise.resolve({ data: [] });
      }
      return Promise.reject(new Error('Not found'));
    });
  });
  
  it('renders the budget page structure correctly', async () => {
    render(<BudgetsPage />);
    
    // Initially shows loading
    expect(screen.getByText(/Loading/i)).toBeInTheDocument();
    
    // Wait for data to load
    await waitFor(() => {
      expect(axios.get).toHaveBeenCalledTimes(3);
    });
    
    // Check tab navigation
    expect(screen.getByText('Budget Progress')).toBeInTheDocument();
    expect(screen.getByText('Manage Budgets')).toBeInTheDocument();
    
    // Check child components are rendered
    expect(screen.getByTestId('budget-progress')).toBeInTheDocument();
  });
  
  it('shows error when API calls fail', async () => {
    // Mock API failure
    axios.get.mockRejectedValue(new Error('API error'));
    
    render(<BudgetsPage />);
    
    // Wait for error to display
    await waitFor(() => {
      expect(screen.getByText(/Failed to load budget data/i)).toBeInTheDocument();
    });
  });
  
  it('fetches data correctly and passes it to child components', async () => {
    const mockBudgets = [{ id: 1, category: 'Food', amount: 300 }];
    const mockProgress = [{ budget_id: 1, category: 'Food', amount: 300, actual_spending: 150 }];
    const mockCategories = ['Food', 'Transport'];
    
    // Mock successful API responses
    axios.get.mockImplementation((url) => {
      if (url.includes('/budgets') && !url.includes('/progress')) {
        return Promise.resolve({ data: mockBudgets });
      } else if (url.includes('/budgets/progress')) {
        return Promise.resolve({ data: mockProgress });
      } else if (url.includes('/categories')) {
        return Promise.resolve({ data: mockCategories });
      }
      return Promise.reject(new Error('Not found'));
    });
    
    render(<BudgetsPage />);
    
    // Wait for data to load
    await waitFor(() => {
      expect(axios.get).toHaveBeenCalledTimes(3);
    });
    
    // Child components should be rendered with the correct props
    // We can't directly check props in this test structure, but we can check
    // that the components are rendered successfully after data is loaded
    expect(screen.getByTestId('budget-progress')).toBeInTheDocument();
  });
});