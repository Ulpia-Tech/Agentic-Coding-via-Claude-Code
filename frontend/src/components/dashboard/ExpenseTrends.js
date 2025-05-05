import React, { useMemo } from 'react';
import PropTypes from 'prop-types';
import { Line } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
} from 'chart.js';

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend
);

const ExpenseTrends = ({ expenses, theme }) => {
  // Process expenses by day for a trend line
  const chartData = useMemo(() => {
    // Sort expenses by date
    const sortedExpenses = [...expenses].sort((a, b) => new Date(a.date) - new Date(b.date));
    
    // Group expenses by date
    const dailyExpenses = {};
    
    sortedExpenses.forEach((expense) => {
      const date = expense.date;
      if (!dailyExpenses[date]) {
        dailyExpenses[date] = 0;
      }
      dailyExpenses[date] += parseFloat(expense.amount);
    });
    
    // Create running total for cumulative expenses
    const dates = Object.keys(dailyExpenses);
    const amounts = Object.values(dailyExpenses);
    const cumulativeAmounts = [];
    let runningTotal = 0;
    
    amounts.forEach((amount) => {
      runningTotal += amount;
      cumulativeAmounts.push(runningTotal);
    });
    
    // Format dates for display
    const formattedDates = dates.map(date => {
      const d = new Date(date);
      return `${d.getMonth() + 1}/${d.getDate()}/${d.getFullYear().toString().substr(-2)}`;
    });
    
    return {
      labels: formattedDates,
      datasets: [
        {
          label: 'Daily Expenses',
          data: amounts,
          borderColor: 'rgba(75, 192, 192, 1)',
          backgroundColor: 'rgba(75, 192, 192, 0.2)',
          borderWidth: 2,
          tension: 0.1,
          pointRadius: 3,
        },
        {
          label: 'Cumulative Expenses',
          data: cumulativeAmounts,
          borderColor: 'rgba(255, 99, 132, 1)',
          backgroundColor: 'rgba(255, 99, 132, 0.2)',
          borderWidth: 2,
          tension: 0.1,
          pointRadius: 3,
        },
      ],
    };
  }, [expenses]);

  // No data case
  if (expenses.length === 0) {
    return <div className="text-center p-5">No expense data available</div>;
  }

  // Chart options
  const options = {
    responsive: true,
    maintainAspectRatio: false,
    scales: {
      y: {
        beginAtZero: true,
        ticks: {
          color: theme === 'dark' ? '#f8f9fa' : '#212529',
          callback: (value) => `$${value}`,
        },
        grid: {
          color: theme === 'dark' ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.1)',
        },
      },
      x: {
        ticks: {
          color: theme === 'dark' ? '#f8f9fa' : '#212529',
          maxRotation: 45,
          minRotation: 45,
        },
        grid: {
          display: false,
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
      <Line data={chartData} options={options} />
    </div>
  );
};

ExpenseTrends.propTypes = {
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

export default ExpenseTrends;