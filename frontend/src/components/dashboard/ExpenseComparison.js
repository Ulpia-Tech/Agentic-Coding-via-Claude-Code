import React, { useMemo } from 'react';
import PropTypes from 'prop-types';
import { Radar } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  RadialLinearScale,
  PointElement,
  LineElement,
  Filler,
  Tooltip,
  Legend,
} from 'chart.js';

ChartJS.register(
  RadialLinearScale,
  PointElement,
  LineElement,
  Filler,
  Tooltip,
  Legend
);

const ExpenseComparison = ({ expenses, theme }) => {
  // Process expenses by category and month for radar chart
  const chartData = useMemo(() => {
    // Get unique categories and month-year combinations
    const allCategories = [...new Set(expenses.map(expense => expense.category))];
    
    // Get recent 6 months
    const now = new Date();
    const last6Months = [];
    for (let i = 0; i < 6; i++) {
      const month = new Date(now.getFullYear(), now.getMonth() - i, 1);
      last6Months.push(month);
    }
    
    // Sort categories by total amount (to prioritize major categories)
    const categoryTotals = {};
    allCategories.forEach(category => {
      categoryTotals[category] = expenses
        .filter(e => e.category === category)
        .reduce((sum, e) => sum + parseFloat(e.amount), 0);
    });
    
    const sortedCategories = allCategories
      .sort((a, b) => categoryTotals[b] - categoryTotals[a])
      .slice(0, 5); // Limit to top 5 categories for readability
    
    // Prepare datasets, one per month
    const datasets = last6Months.map((month, index) => {
      const monthYear = `${month.getMonth() + 1}/${month.getFullYear()}`;
      const monthExpenses = expenses.filter(expense => {
        const expenseDate = new Date(expense.date);
        return expenseDate.getMonth() === month.getMonth() && 
               expenseDate.getFullYear() === month.getFullYear();
      });
      
      // Calculate total for each category this month
      const data = sortedCategories.map(category => {
        return monthExpenses
          .filter(e => e.category === category)
          .reduce((sum, e) => sum + parseFloat(e.amount), 0);
      });
      
      // Generate colors based on index
      const hue = (index * 60) % 360;
      
      return {
        label: monthYear,
        data,
        backgroundColor: `hsla(${hue}, 70%, 60%, 0.2)`,
        borderColor: `hsla(${hue}, 70%, 60%, 1)`,
        borderWidth: 2,
        pointBackgroundColor: `hsla(${hue}, 70%, 60%, 1)`,
        pointRadius: 3,
      };
    });
    
    return {
      labels: sortedCategories,
      datasets,
    };
  }, [expenses]);

  // No data case or not enough categories
  if (expenses.length === 0 || chartData.labels.length < 2) {
    return (
      <div className="text-center p-5">
        {expenses.length === 0 ? 
          'No expense data available' : 
          'Need at least 2 categories for comparison chart'}
      </div>
    );
  }

  // Chart options
  const options = {
    responsive: true,
    maintainAspectRatio: false,
    scales: {
      r: {
        angleLines: {
          color: theme === 'dark' ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.1)',
        },
        grid: {
          color: theme === 'dark' ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.1)',
        },
        pointLabels: {
          color: theme === 'dark' ? '#f8f9fa' : '#212529',
        },
        ticks: {
          color: theme === 'dark' ? '#f8f9fa' : '#212529',
          backdropColor: theme === 'dark' ? '#343a40' : '#ffffff',
          callback: (value) => `$${value}`,
        },
      },
    },
    plugins: {
      legend: {
        labels: {
          color: theme === 'dark' ? '#f8f9fa' : '#212529',
        },
      },
      tooltip: {
        callbacks: {
          label: (context) => `${context.dataset.label}: $${context.raw.toFixed(2)}`,
        },
      },
    },
  };

  return (
    <div style={{ height: '300px' }}>
      <Radar data={chartData} options={options} />
    </div>
  );
};

ExpenseComparison.propTypes = {
  expenses: PropTypes.arrayOf(
    PropTypes.shape({
      id: PropTypes.number,
      amount: PropTypes.oneOfType([PropTypes.number, PropTypes.string]),
      category: PropTypes.string,
      description: PropTypes.string,
      date: PropTypes.string,
    })
  ).isRequired,
  theme: PropTypes.string.isRequired,
};

export default ExpenseComparison;