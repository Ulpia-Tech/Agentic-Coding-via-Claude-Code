import React, { useContext } from 'react';
import { Bar } from 'react-chartjs-2';
import { ThemeContext } from '../../contexts/ThemeContext';
import { Card } from 'react-bootstrap';
import { Chart as ChartJS, CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend } from 'chart.js';

ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend);

const ExpensesByMonth = ({ expenses }) => {
  const { theme } = useContext(ThemeContext);
  
  // Process data for monthly expenses
  const processMonthlyData = () => {
    const monthlyData = {};
    const monthNames = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
    
    // Initialize all months with 0
    const currentMonth = new Date().getMonth();
    const currentYear = new Date().getFullYear();
    
    // Get data for last 6 months
    for (let i = 5; i >= 0; i--) {
      let month = currentMonth - i;
      let year = currentYear;
      
      // Adjust for previous year if needed
      if (month < 0) {
        month += 12;
        year -= 1;
      }
      
      const monthKey = `${year}-${month + 1}`;
      monthlyData[monthKey] = {
        label: `${monthNames[month]} ${year}`,
        amount: 0
      };
    }
    
    // Sum expenses by month
    expenses.forEach(expense => {
      const date = new Date(expense.date);
      const monthKey = `${date.getFullYear()}-${date.getMonth() + 1}`;
      
      if (monthlyData[monthKey]) {
        monthlyData[monthKey].amount += expense.amount;
      }
    });
    
    // Convert to arrays for chart
    return Object.values(monthlyData);
  };
  
  const monthlyData = processMonthlyData();
  
  // Chart data
  const data = {
    labels: monthlyData.map(item => item.label),
    datasets: [
      {
        label: 'Monthly Expenses',
        data: monthlyData.map(item => item.amount),
        backgroundColor: theme === 'dark' ? 'rgba(78, 115, 223, 0.8)' : 'rgba(78, 115, 223, 0.7)',
        borderColor: '#4e73df',
        borderWidth: 1,
        borderRadius: 5,
        hoverBackgroundColor: theme === 'dark' ? 'rgba(78, 115, 223, 1)' : 'rgba(78, 115, 223, 0.9)',
      }
    ]
  };
  
  // Chart options
  const options = {
    plugins: {
      legend: {
        display: false
      },
      tooltip: {
        backgroundColor: theme === 'dark' ? '#3d3d3d' : 'rgba(0, 0, 0, 0.8)',
        titleColor: theme === 'dark' ? '#ffffff' : '#ffffff',
        bodyColor: theme === 'dark' ? '#e9ecef' : '#ffffff',
        callbacks: {
          label: function(context) {
            const value = context.raw || 0;
            return `$${value.toFixed(2)}`;
          }
        }
      }
    },
    responsive: true,
    maintainAspectRatio: false,
    scales: {
      x: {
        grid: {
          display: false,
          color: theme === 'dark' ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.1)'
        },
        ticks: {
          color: theme === 'dark' ? '#e9ecef' : '#212529'
        }
      },
      y: {
        grid: {
          color: theme === 'dark' ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.1)'
        },
        ticks: {
          color: theme === 'dark' ? '#e9ecef' : '#212529',
          callback: function(value) {
            return '$' + value;
          }
        },
        beginAtZero: true
      }
    }
  };
  
  return (
    <Card className="shadow mb-4">
      <Card.Header>
        <h6 className="m-0 font-weight-bold">Monthly Expense Trend</h6>
      </Card.Header>
      <Card.Body>
        {expenses.length > 0 ? (
          <div className="chart-container" style={{ height: '300px' }}>
            <Bar data={data} options={options} />
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

export default ExpensesByMonth;