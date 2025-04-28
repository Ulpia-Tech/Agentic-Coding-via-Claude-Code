import React, { useState } from 'react';
import { Form, Button, Card, Alert, Spinner } from 'react-bootstrap';
import PropTypes from 'prop-types';
import axios from 'axios';
import API_CONFIG from '../config';

function ReceiptUpload({ onUploadSuccess, expenses, isExpensesLoading }) {
  const [file, setFile] = useState(null);
  const [description, setDescription] = useState('');
  const [expenseId, setExpenseId] = useState('');
  const [isUploading, setIsUploading] = useState(false);
  const [error, setError] = useState(null);
  const [preview, setPreview] = useState(null);
  const [validationErrors, setValidationErrors] = useState({});

  const validateFile = (file) => {
    const errors = {};
    
    if (!file) {
      errors.file = 'Please select a receipt image';
      return errors;
    }
    
    if (!file.type.includes('image/png')) {
      errors.file = 'Only PNG images are allowed';
    }
    
    if (file.size > 10 * 1024 * 1024) { // 10MB
      errors.file = 'File size must be less than 10MB';
    }
    
    return errors;
  };

  const handleFileChange = (e) => {
    const selectedFile = e.target.files[0];
    
    if (selectedFile) {
      const errors = validateFile(selectedFile);
      
      if (Object.keys(errors).length > 0) {
        setValidationErrors(errors);
        setError(errors.file);
        setFile(null);
        setPreview(null);
        return;
      }
      
      setFile(selectedFile);
      setError(null);
      setValidationErrors({});
      
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
    
    // Validate form
    const fileErrors = validateFile(file);
    if (Object.keys(fileErrors).length > 0) {
      setValidationErrors(fileErrors);
      setError(fileErrors.file);
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
      
      await axios.post(`${API_CONFIG.BASE_URL}${API_CONFIG.ENDPOINTS.RECEIPTS}`, formData, {
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
      setError(`Upload failed: ${err.response?.data?.error || err.message}`);
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
              isInvalid={validationErrors.file}
            />
            <Form.Text className="text-muted">
              Maximum file size: 10MB
            </Form.Text>
            {validationErrors.file && (
              <Form.Control.Feedback type="invalid">
                {validationErrors.file}
              </Form.Control.Feedback>
            )}
          </Form.Group>
          
          {preview && (
            <div className="mb-3">
              <p>Preview:</p>
              <img 
                src={preview} 
                alt="Receipt preview"
                className="receipt-preview"
                style={{ maxWidth: '100%', maxHeight: '300px' }}
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
            {isExpensesLoading ? (
              <div className="text-center py-2">
                <Spinner animation="border" size="sm" />
                <span className="ms-2">Loading expenses...</span>
              </div>
            ) : (
              <Form.Select
                value={expenseId}
                onChange={(e) => setExpenseId(e.target.value)}
                disabled={isUploading || isExpensesLoading}
              >
                <option value="">-- No linked expense --</option>
                {expenses && expenses.map(expense => (
                  <option key={expense.id} value={expense.id}>
                    {expense.category} - ${expense.amount} - {expense.description}
                  </option>
                ))}
              </Form.Select>
            )}
            <Form.Text className="text-muted">
              Optionally link this receipt to an existing expense
            </Form.Text>
          </Form.Group>
          
          <Button 
            variant="primary" 
            type="submit" 
            disabled={isUploading || !file}
          >
            {isUploading ? (
              <>
                <Spinner animation="border" size="sm" className="me-2" />
                Uploading...
              </>
            ) : 'Upload Receipt'}
          </Button>
        </Form>
      </Card.Body>
    </Card>
  );
}

ReceiptUpload.propTypes = {
  onUploadSuccess: PropTypes.func.isRequired,
  expenses: PropTypes.arrayOf(PropTypes.shape({
    id: PropTypes.number.isRequired,
    amount: PropTypes.oneOfType([PropTypes.number, PropTypes.string]).isRequired,
    category: PropTypes.string.isRequired,
    description: PropTypes.string
  })),
  isExpensesLoading: PropTypes.bool
};

ReceiptUpload.defaultProps = {
  expenses: [],
  isExpensesLoading: false
};

export default ReceiptUpload;