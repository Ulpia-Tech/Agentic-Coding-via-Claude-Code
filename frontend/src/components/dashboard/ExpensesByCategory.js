import React, { useMemo } from 'react';
import PropTypes from 'prop-types';
import { Doughnut } from 'react-chartjs-2';
import { Chart as ChartJS, ArcElement, Tooltip, Legend } from 'chart.js';

ChartJS.register(ArcElement, Tooltip, Legend);

const ExpensesByCategory = ({ expenses, theme }) => {
  // Process expenses by category
  const chartData = useMemo(() => {
    // Generate random colors
    const generateColors = (count) => {
      const colors = [];
      for (let i = 0; i < count; i++) {
        const hue = (i * 137) % 360; // Use golden angle to spread colors
        colors.push(`hsl(${hue}, 70%, 60%)`);
      }
      return colors;
    };

    // Group expenses by category
    const categories = {};
    expenses.forEach((expense) => {
      const { category, amount } = expense;
      if (!categories[category]) {
        categories[category] = 0;
      }
      categories[category] += parseFloat(amount);
    });

    // Sort categories by amount (descending)
    const sortedCategories = Object.entries(categories)
      .sort((a, b) => b[1] - a[1])
      .reduce((acc, [key, value]) => {
        acc[key] = value;
        return acc;
      }, {});

    const labels = Object.keys(sortedCategories);
    const data = Object.values(sortedCategories);
    const backgroundColors = generateColors(labels.length);

    return {
      labels,
      datasets: [
        {
          data,
          backgroundColor: backgroundColors,
          borderColor: backgroundColors.map(color => color.replace('60%', '50%')),
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
    plugins: {
      legend: {
        position: 'right',
        labels: {
          boxWidth: 15,
          color: theme === 'dark' ? '#e9ecef' : '#212529',
          font: {
            weight: 500
          }
        },
      },
      title: {
        display: false,
        color: theme === 'dark' ? '#f8f9fa' : '#212529',
        font: {
          weight: 600,
          size: 16
        }
      },
      tooltip: {
        callbacks: {
          label: (context) => {
            const value = context.raw;
            const total = context.chart.data.datasets[0].data.reduce((a, b) => a + b, 0);
            const percentage = ((value / total) * 100).toFixed(1);
            return `${context.label}: $${value.toFixed(2)} (${percentage}%)`;
          },
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
      <Doughnut data={chartData} options={options} />
    </div>
  );
};

ExpensesByCategory.propTypes = {
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

export default ExpensesByCategory;