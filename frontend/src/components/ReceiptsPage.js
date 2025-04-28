import React, { useState, useEffect } from 'react';
import { Row, Col, Alert, Spinner } from 'react-bootstrap';
import PropTypes from 'prop-types';
import axios from 'axios';
import ReceiptUpload from './ReceiptUpload';
import ReceiptList from './ReceiptList';
import API_CONFIG from '../config';

function ReceiptsPage() {
  const [receipts, setReceipts] = useState([]);
  const [expenses, setExpenses] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isExpensesLoading, setIsExpensesLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchReceipts();
    fetchExpenses();
  }, []);

  const fetchReceipts = async () => {
    try {
      setIsLoading(true);
      const response = await axios.get(`${API_CONFIG.BASE_URL}${API_CONFIG.ENDPOINTS.RECEIPTS}`);
      setReceipts(response.data);
      setError(null);
    } catch (err) {
      setError(`Failed to fetch receipts: ${err.response?.data?.error || err.message}`);
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  const fetchExpenses = async () => {
    try {
      setIsExpensesLoading(true);
      const response = await axios.get(`${API_CONFIG.BASE_URL}${API_CONFIG.ENDPOINTS.EXPENSES}`);
      setExpenses(response.data);
    } catch (err) {
      console.error('Failed to fetch expenses:', err);
      setError(`Failed to fetch expenses: ${err.response?.data?.error || err.message}`);
    } finally {
      setIsExpensesLoading(false);
    }
  };

  const handleUploadSuccess = () => {
    fetchReceipts();
  };

  const deleteReceipt = async (id) => {
    try {
      await axios.delete(`${API_CONFIG.BASE_URL}${API_CONFIG.ENDPOINTS.RECEIPTS}/${id}`);
      fetchReceipts();
    } catch (err) {
      setError(`Failed to delete receipt: ${err.response?.data?.error || err.message}`);
      console.error(err);
    }
  };

  if (isLoading && isExpensesLoading) {
    return (
      <div className="text-center my-5">
        <Spinner animation="border" role="status">
          <span className="visually-hidden">Loading...</span>
        </Spinner>
        <p className="mt-2">Loading receipts and expenses...</p>
      </div>
    );
  }

  return (
    <>
      {error && <Alert variant="danger">{error}</Alert>}
      
      <Row>
        <Col md={5}>
          <ReceiptUpload 
            onUploadSuccess={handleUploadSuccess} 
            expenses={expenses}
            isExpensesLoading={isExpensesLoading}
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

// PropTypes for ReceiptsPage would be defined here if it had props

export default ReceiptsPage;