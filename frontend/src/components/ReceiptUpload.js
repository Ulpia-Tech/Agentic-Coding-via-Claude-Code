import React, { useState } from 'react';
import { Form, Button, Card, Alert } from 'react-bootstrap';
import axios from 'axios';

const API_URL = 'http://localhost:5001';

function ReceiptUpload({ onUploadSuccess, expenses }) {
  const [file, setFile] = useState(null);
  const [description, setDescription] = useState('');
  const [expenseId, setExpenseId] = useState('');
  const [isUploading, setIsUploading] = useState(false);
  const [error, setError] = useState(null);
  const [preview, setPreview] = useState(null);

  const handleFileChange = (e) => {
    const selectedFile = e.target.files[0];
    
    if (selectedFile) {
      if (!selectedFile.type.includes('image/png')) {
        setError('Only PNG images are allowed');
        setFile(null);
        setPreview(null);
        return;
      }
      
      setFile(selectedFile);
      setError(null);
      
      // Create a preview
      const reader = new FileReader();
      reader.onloadend = () => {
        setPreview(reader.result);
      };
      reader.readAsDataURL(selectedFile);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!file) {
      setError('Please select a receipt image');
      return;
    }
    
    setIsUploading(true);
    setError(null);
    
    try {
      const formData = new FormData();
      formData.append('receipt', file);
      formData.append('description', description);
      if (expenseId) {
        formData.append('expense_id', expenseId);
      }
      
      await axios.post(`${API_URL}/receipts`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      });
      
      // Reset form
      setFile(null);
      setDescription('');
      setExpenseId('');
      setPreview(null);
      
      // Notify parent component
      if (onUploadSuccess) {
        onUploadSuccess();
      }
    } catch (err) {
      console.error('Error uploading receipt:', err);
      setError('Failed to upload receipt. Please try again.');
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <Card className="mb-4">
      <Card.Header as="h5">Upload Receipt</Card.Header>
      <Card.Body>
        {error && <Alert variant="danger">{error}</Alert>}
        
        <Form onSubmit={handleSubmit}>
          <Form.Group className="mb-3">
            <Form.Label>Receipt Image (PNG only)</Form.Label>
            <Form.Control 
              type="file" 
              accept=".png" 
              onChange={handleFileChange}
              disabled={isUploading}
            />
          </Form.Group>
          
          {preview && (
            <div className="mb-3">
              <p>Preview:</p>
              <img 
                src={preview} 
                alt="Receipt preview"
                className="receipt-preview"
              />
            </div>
          )}
          
          <Form.Group className="mb-3">
            <Form.Label>Description</Form.Label>
            <Form.Control
              type="text"
              placeholder="Enter receipt description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              disabled={isUploading}
            />
          </Form.Group>
          
          <Form.Group className="mb-3">
            <Form.Label>Link to Expense (Optional)</Form.Label>
            <Form.Select
              value={expenseId}
              onChange={(e) => setExpenseId(e.target.value)}
              disabled={isUploading}
            >
              <option value="">-- No linked expense --</option>
              {expenses && expenses.map(expense => (
                <option key={expense.id} value={expense.id}>
                  {expense.category} - ${expense.amount} - {expense.description}
                </option>
              ))}
            </Form.Select>
            <Form.Text className="text-muted">
              Optionally link this receipt to an existing expense
            </Form.Text>
          </Form.Group>
          
          <Button 
            variant="primary" 
            type="submit" 
            disabled={isUploading || !file}
          >
            {isUploading ? 'Uploading...' : 'Upload Receipt'}
          </Button>
        </Form>
      </Card.Body>
    </Card>
  );
}

export default ReceiptUpload;