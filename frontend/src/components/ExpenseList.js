import React from 'react';
import { Table, Button, Card, Spinner } from 'react-bootstrap';

const ExpenseList = ({ expenses, onDeleteExpense, isLoading }) => {
  if (isLoading) {
    return (
      <div className="text-center my-4">
        <Spinner animation="border" role="status">
          <span className="visually-hidden">Loading...</span>
        </Spinner>
      </div>
    );
  }

  return (
    <Card>
      <Card.Header as="h5">Expense History</Card.Header>
      <Card.Body>
        {expenses.length === 0 ? (
          <p className="text-center">No expenses recorded yet.</p>
        ) : (
          <Table striped hover responsive>
            <thead>
              <tr>
                <th>Date</th>
                <th>Category</th>
                <th>Description</th>
                <th>Amount</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              {expenses.map((expense) => (
                <tr key={expense.id}>
                  <td>{new Date(expense.date).toLocaleDateString()}</td>
                  <td>
                    <span className="badge bg-primary">{expense.category}</span>
                  </td>
                  <td>{expense.description || '-'}</td>
                  <td>${parseFloat(expense.amount).toFixed(2)}</td>
                  <td>
                    <Button
                      variant="danger"
                      size="sm"
                      onClick={() => onDeleteExpense(expense.id)}
                    >
                      Delete
                    </Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </Table>
        )}
      </Card.Body>
    </Card>
  );
};

export default ExpenseList;