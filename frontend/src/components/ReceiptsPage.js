import React, { useState, useEffect } from 'react';
import { Row, Col, Alert } from 'react-bootstrap';
import axios from 'axios';
import ReceiptUpload from './ReceiptUpload';
import ReceiptList from './ReceiptList';

const API_URL = 'http://localhost:5001';

function ReceiptsPage() {
  const [receipts, setReceipts] = useState([]);
  const [expenses, setExpenses] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchReceipts();
    fetchExpenses();
  }, []);

  const fetchReceipts = async () => {
    try {
      setIsLoading(true);
      const response = await axios.get(`${API_URL}/receipts`);
      setReceipts(response.data);
      setError(null);
    } catch (err) {
      setError('Failed to fetch receipts');
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  const fetchExpenses = async () => {
    try {
      const response = await axios.get(`${API_URL}/expenses`);
      setExpenses(response.data);
    } catch (err) {
      console.error('Failed to fetch expenses:', err);
    }
  };

  const handleUploadSuccess = () => {
    fetchReceipts();
  };

  const deleteReceipt = async (id) => {
    try {
      await axios.delete(`${API_URL}/receipts/${id}`);
      fetchReceipts();
    } catch (err) {
      setError('Failed to delete receipt');
      console.error(err);
    }
  };

  return (
    <>
      {error && <Alert variant="danger">{error}</Alert>}
      
      <Row>
        <Col md={5}>
          <ReceiptUpload 
            onUploadSuccess={handleUploadSuccess} 
            expenses={expenses} 
          />
        </Col>
        <Col md={7}>
          <ReceiptList 
            receipts={receipts} 
            onDeleteReceipt={deleteReceipt} 
            isLoading={isLoading} 
          />
        </Col>
      </Row>
    </>
  );
}

export default ReceiptsPage;