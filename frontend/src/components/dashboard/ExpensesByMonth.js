import React, { useMemo } from 'react';
import PropTypes from 'prop-types';
import { Bar } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
} from 'chart.js';

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend
);

const ExpensesByMonth = ({ expenses, theme }) => {
  // Process expenses by month
  const chartData = useMemo(() => {
    // Group expenses by month
    const months = {};
    const monthNames = [
      'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun',
      'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'
    ];

    expenses.forEach((expense) => {
      const date = new Date(expense.date);
      const monthYear = `${monthNames[date.getMonth()]} ${date.getFullYear()}`;
      
      if (!months[monthYear]) {
        months[monthYear] = 0;
      }
      months[monthYear] += parseFloat(expense.amount);
    });

    // Sort months chronologically
    const sortedMonths = {};
    Object.keys(months)
      .sort((a, b) => {
        const [monthA, yearA] = a.split(' ');
        const [monthB, yearB] = b.split(' ');
        const monthIndexA = monthNames.indexOf(monthA);
        const monthIndexB = monthNames.indexOf(monthB);
        
        if (yearA !== yearB) return yearA - yearB;
        return monthIndexA - monthIndexB;
      })
      .forEach((key) => {
        sortedMonths[key] = months[key];
      });

    return {
      labels: Object.keys(sortedMonths),
      datasets: [
        {
          label: 'Expenses',
          data: Object.values(sortedMonths),
          backgroundColor: 'rgba(54, 162, 235, 0.7)',
          borderColor: 'rgba(54, 162, 235, 1)',
          borderWidth: 1,
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
          color: theme === 'dark' ? '#e9ecef' : '#212529',
          callback: (value) => `$${value}`,
          font: {
            weight: 500
          }
        },
        grid: {
          color: theme === 'dark' ? 'rgba(255, 255, 255, 0.15)' : 'rgba(0, 0, 0, 0.1)',
        },
        border: {
          color: theme === 'dark' ? 'rgba(255, 255, 255, 0.3)' : 'rgba(0, 0, 0, 0.1)',
        },
      },
      x: {
        ticks: {
          color: theme === 'dark' ? '#e9ecef' : '#212529',
          font: {
            weight: 500
          }
        },
        grid: {
          display: false,
        },
        border: {
          color: theme === 'dark' ? 'rgba(255, 255, 255, 0.3)' : 'rgba(0, 0, 0, 0.1)',
        }
      },
    },
    plugins: {
      legend: {
        labels: {
          color: theme === 'dark' ? '#e9ecef' : '#212529',
          font: {
            weight: 500
          }
        },
      },
      tooltip: {
        callbacks: {
          label: (context) => `Total: $${context.raw.toFixed(2)}`,
        },
        backgroundColor: theme === 'dark' ? 'rgba(0, 0, 0, 0.8)' : 'rgba(255, 255, 255, 0.8)',
        titleColor: theme === 'dark' ? '#ffffff' : '#000000',
        bodyColor: theme === 'dark' ? '#ffffff' : '#000000',
        borderColor: theme === 'dark' ? 'rgba(255, 255, 255, 0.2)' : 'rgba(0, 0, 0, 0.2)',
        borderWidth: 1
      },
    },
  };

  return (
    <div style={{ height: '300px' }}>
      <Bar data={chartData} options={options} />
    </div>
  );
};

ExpensesByMonth.propTypes = {
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

export default ExpensesByMonth;