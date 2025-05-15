import React from 'react';
import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';
import BudgetProgress from './BudgetProgress';

describe('BudgetProgress', () => {
  const mockBudgetProgress = [
    {
      budget_id: 1,
      category: 'Food',
      period: 'monthly',
      amount: 300.00,
      start_date: '2023-05-01',
      end_date: '2023-06-01',
      actual_spending: 150.00,
      expected_spending: 200.00,
      remaining: 150.00,
      percentage_used: 50.00,
      percentage_time_elapsed: 75.00,
      status: 'on_track'
    },
    {
      budget_id: 2,
      category: 'Entertainment',
      period: 'monthly',
      amount: 100.00,
      start_date: '2023-05-01',
      end_date: '2023-06-01',
      actual_spending: 95.00,
      expected_spending: 75.00,
      remaining: 5.00,
      percentage_used: 95.00,
      percentage_time_elapsed: 75.00,
      status: 'warning'
    },
    {
      budget_id: 3,
      category: 'Transport',
      period: 'monthly',
      amount: 120.00,
      start_date: '2023-05-01',
      end_date: '2023-06-01',
      actual_spending: 130.00,
      expected_spending: 90.00,
      remaining: -10.00,
      percentage_used: 108.33,
      percentage_time_elapsed: 75.00,
      status: 'exceeded'
    }
  ];

  it('renders loading state correctly', () => {
    render(<BudgetProgress budgetProgress={[]} isLoading={true} />);
    
    expect(screen.getByText(/Loading budget progress/i)).toBeInTheDocument();
  });

  it('renders empty state correctly', () => {
    render(<BudgetProgress budgetProgress={[]} isLoading={false} />);
    
    expect(screen.getByText(/No budget data found/i)).toBeInTheDocument();
  });

  it('renders budget progress cards correctly', () => {
    render(<BudgetProgress budgetProgress={mockBudgetProgress} isLoading={false} />);
    
    // Check if all categories are displayed
    expect(screen.getByText('Food')).toBeInTheDocument();
    expect(screen.getByText('Entertainment')).toBeInTheDocument();
    expect(screen.getByText('Transport')).toBeInTheDocument();
    
    // Check if budget amounts are displayed
    expect(screen.getByText('$300.00')).toBeInTheDocument();
    expect(screen.getByText('$100.00')).toBeInTheDocument();
    expect(screen.getByText('$120.00')).toBeInTheDocument();
    
    // Check if spending amounts are displayed
    expect(screen.getByText('$150.00')).toBeInTheDocument();
    expect(screen.getByText('$95.00')).toBeInTheDocument();
    expect(screen.getByText('$130.00')).toBeInTheDocument();
    
    // Check if statuses are displayed
    expect(screen.getByText('On Track')).toBeInTheDocument();
    expect(screen.getByText('Warning')).toBeInTheDocument();
    expect(screen.getByText('Exceeded')).toBeInTheDocument();
    
    // Check if progress bars are displayed - can't directly test this without more complex querying
  });
});