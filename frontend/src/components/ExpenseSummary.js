import React, { useMemo } from 'react';
import { Card, Row, Col } from 'react-bootstrap';
import { Chart as ChartJS, ArcElement, Tooltip, Legend } from 'chart.js';
import { Pie } from 'react-chartjs-2';

ChartJS.register(ArcElement, Tooltip, Legend);

const ExpenseSummary = ({ expenses }) => {
  // Calculate total expenses
  const totalExpenses = useMemo(() => {
    return expenses.reduce((sum, expense) => sum + parseFloat(expense.amount), 0);
  }, [expenses]);

  // Calculate expenses by category
  const expensesByCategory = useMemo(() => {
    const categories = {};
    
    expenses.forEach(expense => {
      const category = expense.category;
      if (!categories[category]) {
        categories[category] = 0;
      }
      categories[category] += parseFloat(expense.amount);
    });
    
    return categories;
  }, [expenses]);

  // Prepare data for pie chart
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

    const categories = Object.keys(expensesByCategory);
    const backgroundColors = generateColors(categories.length);
    
    return {
      labels: categories,
      datasets: [
        {
          data: categories.map(category => expensesByCategory[category]),
          backgroundColor: backgroundColors,
          borderWidth: 1,
        },
      ],
    };
  }, [expensesByCategory]);

  return (
    <Card className="mb-4">
      <Card.Header as="h5">Expense Summary</Card.Header>
      <Card.Body>
        <Row>
          <Col md={4}>
            <div className="text-center mb-4">
              <h6>Total Expenses</h6>
              <h2>${totalExpenses.toFixed(2)}</h2>
            </div>
          </Col>
          <Col md={8}>
            {Object.keys(expensesByCategory).length > 0 ? (
              <div style={{ height: '250px' }}>
                <Pie 
                  data={chartData} 
                  options={{ 
                    maintainAspectRatio: false,
                    plugins: {
                      legend: {
                        position: 'right',
                        labels: {
                          boxWidth: 15
                        }
                      }
                    }
                  }} 
                />
              </div>
            ) : (
              <p className="text-center mt-5">No data to display</p>
            )}
          </Col>
        </Row>
      </Card.Body>
    </Card>
  );
};

export default ExpenseSummary;