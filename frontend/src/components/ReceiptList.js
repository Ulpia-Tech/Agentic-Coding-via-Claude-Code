import React, { useState } from 'react';
import { Card, Table, Button, Spinner, Badge, Alert } from 'react-bootstrap';
import PropTypes from 'prop-types';
import API_CONFIG from '../config';

function ReceiptList({ receipts, onDeleteReceipt, isLoading }) {
  const [deletingId, setDeletingId] = useState(null);
  const [error, setError] = useState(null);

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this receipt?')) {
      try {
        setDeletingId(id);
        setError(null);
        await onDeleteReceipt(id);
      } catch (err) {
        setError(`Failed to delete receipt: ${err.message}`);
      } finally {
        setDeletingId(null);
      }
    }
  };
  
  if (isLoading) {
    return (
      <div className="text-center p-4">
        <Spinner animation="border" role="status">
          <span className="visually-hidden">Loading...</span>
        </Spinner>
        <p className="mt-2">Loading receipts...</p>
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
        {error && <Alert variant="danger" className="mb-3">{error}</Alert>}
        
        <Table responsive hover striped>
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
                    href={`${API_CONFIG.BASE_URL}${API_CONFIG.ENDPOINTS.UPLOADS}/${receipt.filename}`} 
                    target="_blank" 
                    rel="noopener noreferrer"
                  >
                    <img 
                      src={`${API_CONFIG.BASE_URL}${API_CONFIG.ENDPOINTS.UPLOADS}/${receipt.filename}`} 
                      alt="Receipt thumbnail" 
                      style={{ width: '50px', height: 'auto' }}
                      className="img-thumbnail receipt-thumbnail"
                      onError={(e) => {
                        e.target.onerror = null;
                        e.target.src = 'data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIxNiIgaGVpZ2h0PSIxNiIgZmlsbD0iY3VycmVudENvbG9yIiBjbGFzcz0iYmkgYmktZmlsZS1lYXJtYXJrLXgiIHZpZXdCb3g9IjAgMCAxNiAxNiI+CiAgPHBhdGggZD0iTTkgMUg0YTIgMiAwIDAgMC0yIDJ2MTBhMiAyIDAgMCAwIDIgMmg1di0xSDRhMSAxIDAgMCAxLTEtMVYzYTEgMSAwIDAgMSAxLTFoNXYyLjVBMS41IDEuNSAwIDAgMCAxMC41IDZINEEuNSAuNSAwIDAgMCAzLjUgNnYtMWgxdjFhLjUuNSAwIDAgMCAuNS41aDYuNWExLjUgMS41IDAgMCAwIDEuNS0xLjVWNkg5VjFaIi8+CiAgPHBhdGggZD0ibTEwLjg1NCA3LjE0Ni0zLjcgMy43LTEuOTA3LTEuOTA3YS4zNS4zNSAwIDAgMC0uNDk1LjQ5NWwyLjE1NCAyLjE1M2EuMzUuMzUgMCAwIDAgLjQ5NSAwbDMuOTQ3LTMuOTQ3YS4zNS4zNSAwIDEgMC0uNDk1LS40OTRaIi8+Cjwvc3ZnPg==';
                      }}
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
                    disabled={deletingId === receipt.id}
                  >
                    {deletingId === receipt.id ? (
                      <>
                        <Spinner animation="border" size="sm" role="status" className="me-1" />
                        <span className="visually-hidden">Deleting...</span>
                      </>
                    ) : 'Delete'}
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

ReceiptList.propTypes = {
  receipts: PropTypes.arrayOf(PropTypes.shape({
    id: PropTypes.number.isRequired,
    filename: PropTypes.string.isRequired,
    original_filename: PropTypes.string.isRequired,
    description: PropTypes.string,
    upload_date: PropTypes.string.isRequired,
    expense_id: PropTypes.number,
    amount: PropTypes.oneOfType([PropTypes.number, PropTypes.string]),
    category: PropTypes.string,
    expense_description: PropTypes.string
  })),
  onDeleteReceipt: PropTypes.func.isRequired,
  isLoading: PropTypes.bool
};

ReceiptList.defaultProps = {
  receipts: [],
  isLoading: false
};

export default ReceiptList;