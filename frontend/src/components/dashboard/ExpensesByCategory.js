import React, { useContext } from 'react';
import { Doughnut } from 'react-chartjs-2';
import { ThemeContext } from '../../contexts/ThemeContext';
import { Card } from 'react-bootstrap';
import { Chart as ChartJS, ArcElement, Tooltip, Legend } from 'chart.js';

ChartJS.register(ArcElement, Tooltip, Legend);

const ExpensesByCategory = ({ expenses }) => {
  const { theme } = useContext(ThemeContext);
  
  // Process data for chart
  const processCategoryData = () => {
    const categoryMap = {};
    
    // Group expenses by category and sum amounts
    expenses.forEach(expense => {
      if (categoryMap[expense.category]) {
        categoryMap[expense.category] += expense.amount;
      } else {
        categoryMap[expense.category] = expense.amount;
      }
    });
    
    // Sort categories by amount (descending)
    const sortedCategories = Object.keys(categoryMap).sort(
      (a, b) => categoryMap[b] - categoryMap[a]
    );
    
    return {
      labels: sortedCategories,
      values: sortedCategories.map(cat => categoryMap[cat])
    };
  };
  
  const categoryData = processCategoryData();
  
  // Chart colors (adapted based on theme)
  const chartColors = [
    '#4e73df', '#1cc88a', '#36b9cc', '#f6c23e', '#e74a3b',
    '#6f42c1', '#5a5c69', '#858796', '#2e59d9', '#17a673'
  ];
  
  // Chart data
  const data = {
    labels: categoryData.labels,
    datasets: [
      {
        data: categoryData.values,
        backgroundColor: chartColors,
        borderColor: theme === 'dark' ? '#2d2d2d' : '#ffffff',
        borderWidth: 2,
        hoverOffset: 4
      }
    ]
  };
  
  // Chart options
  const options = {
    plugins: {
      legend: {
        position: 'bottom',
        labels: {
          color: theme === 'dark' ? '#e9ecef' : '#212529',
          font: {
            size: 12
          }
        }
      },
      tooltip: {
        backgroundColor: theme === 'dark' ? '#3d3d3d' : 'rgba(0, 0, 0, 0.8)',
        titleColor: theme === 'dark' ? '#ffffff' : '#ffffff',
        bodyColor: theme === 'dark' ? '#e9ecef' : '#ffffff',
        displayColors: true,
        callbacks: {
          label: function(context) {
            const label = context.label || '';
            const value = context.raw || 0;
            return `${label}: $${value.toFixed(2)}`;
          }
        }
      }
    },
    maintainAspectRatio: false,
    cutout: '60%',
    responsive: true
  };

  return (
    <Card className="shadow mb-4">
      <Card.Header>
        <h6 className="m-0 font-weight-bold">Expenses by Category</h6>
      </Card.Header>
      <Card.Body>
        {expenses.length > 0 ? (
          <div className="chart-container" style={{ height: '300px' }}>
            <Doughnut data={data} options={options} />
          </div>
        ) : (
          <div className="text-center text-muted py-5">
            No expense data available
          </div>
        )}
      </Card.Body>
    </Card>
  );
};

export default ExpensesByCategory;