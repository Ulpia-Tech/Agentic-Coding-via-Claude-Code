import React from 'react';
import { Card, Table, Button, Spinner, Badge } from 'react-bootstrap';
import axios from 'axios';

const API_URL = 'http://localhost:5001';

function ReceiptList({ receipts, onDeleteReceipt, isLoading }) {
  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this receipt?')) {
      await onDeleteReceipt(id);
    }
  };
  
  if (isLoading) {
    return (
      <div className="text-center p-4">
        <Spinner animation="border" role="status">
          <span className="visually-hidden">Loading...</span>
        </Spinner>
      </div>
    );
  }

  if (!receipts || receipts.length === 0) {
    return (
      <Card className="mt-3">
        <Card.Body>
          <p className="text-center text-muted">No receipts found. Upload your first receipt above!</p>
        </Card.Body>
      </Card>
    );
  }

  return (
    <Card className="mt-3">
      <Card.Header as="h5">Your Receipts</Card.Header>
      <Card.Body>
        <Table responsive hover>
          <thead>
            <tr>
              <th>Receipt</th>
              <th>Description</th>
              <th>Linked Expense</th>
              <th>Date</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {receipts.map(receipt => (
              <tr key={receipt.id}>
                <td>
                  <a 
                    href={`${API_URL}/uploads/${receipt.filename}`} 
                    target="_blank" 
                    rel="noopener noreferrer"
                  >
                    <img 
                      src={`${API_URL}/uploads/${receipt.filename}`} 
                      alt="Receipt thumbnail" 
                      style={{ width: '50px', height: 'auto' }}
                      className="img-thumbnail receipt-thumbnail"
                    />
                  </a>
                </td>
                <td>{receipt.description || <span className="text-muted">No description</span>}</td>
                <td>
                  {receipt.expense_id ? (
                    <div>
                      <Badge bg="info">{receipt.category}</Badge>
                      <div>${receipt.amount}</div>
                      <small>{receipt.expense_description}</small>
                    </div>
                  ) : (
                    <span className="text-muted">No linked expense</span>
                  )}
                </td>
                <td>{new Date(receipt.upload_date).toLocaleDateString()}</td>
                <td>
                  <Button 
                    variant="danger" 
                    size="sm" 
                    onClick={() => handleDelete(receipt.id)}
                  >
                    Delete
                  </Button>
                </td>
              </tr>
            ))}
          </tbody>
        </Table>
      </Card.Body>
    </Card>
  );
}

export default ReceiptList;