import React from 'react';
import { render, screen } from '@testing-library/react';
import DashboardPage from './DashboardPage';

// Mock the Chart.js components to avoid canvas rendering issues
jest.mock('chart.js');
jest.mock('react-chartjs-2', () => ({
  Pie: () => <div data-testid="pie-chart">Pie Chart</div>,
  Line: () => <div data-testid="line-chart">Line Chart</div>
}));

// Mock the API calls
jest.mock('axios', () => ({
  get: jest.fn(() => Promise.resolve({ data: [] }))
}));

describe('DashboardPage Component', () => {
  test('renders dashboard loading state', () => {
    render(<DashboardPage />);
    expect(screen.getByText(/loading dashboard data/i)).toBeInTheDocument();
  });
});