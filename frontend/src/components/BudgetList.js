import React, { useState } from 'react';
import { Card, Table, Button, Spinner, Modal } from 'react-bootstrap';
import axios from 'axios';
import API_CONFIG from '../config';
import PropTypes from 'prop-types';

const BudgetList = ({ budgets, onBudgetDeleted, isLoading }) => {
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [budgetToDelete, setBudgetToDelete] = useState(null);
  const [deleteLoading, setDeleteLoading] = useState(false);
  const [deleteError, setDeleteError] = useState(null);

  const formatDate = (dateString) => {
    const options = { year: 'numeric', month: 'short', day: 'numeric' };
    return new Date(dateString).toLocaleDateString(undefined, options);
  };

  const formatPeriod = (period) => {
    switch (period) {
      case 'monthly':
        return 'Monthly';
      case 'quarterly':
        return 'Quarterly';
      case 'annual':
        return 'Annual';
      default:
        return period;
    }
  };

  const handleDeleteClick = (budget) => {
    setBudgetToDelete(budget);
    setShowDeleteModal(true);
    setDeleteError(null);
  };

  const handleConfirmDelete = async () => {
    if (!budgetToDelete) return;
    
    setDeleteLoading(true);
    setDeleteError(null);
    
    try {
      await axios.delete(
        `${API_CONFIG.BASE_URL}${API_CONFIG.ENDPOINTS.BUDGETS}/${budgetToDelete.id}`
      );
      
      setShowDeleteModal(false);
      setBudgetToDelete(null);
      
      // Notify parent component
      if (onBudgetDeleted) {
        onBudgetDeleted();
      }
    } catch (err) {
      setDeleteError('Failed to delete budget. Please try again.');
      console.error('Error deleting budget:', err);
    } finally {
      setDeleteLoading(false);
    }
  };

  const handleCloseDeleteModal = () => {
    setShowDeleteModal(false);
    setBudgetToDelete(null);
    setDeleteError(null);
  };

  return (
    <>
      <Card className="shadow mb-4">
        <Card.Header>
          <h5 className="m-0 font-weight-bold">Budget List</h5>
        </Card.Header>
        <Card.Body>
          {isLoading ? (
            <div className="text-center py-5">
              <Spinner animation="border" role="status">
                <span className="visually-hidden">Loading...</span>
              </Spinner>
              <p className="mt-2">Loading budgets...</p>
            </div>
          ) : budgets.length === 0 ? (
            <div className="text-center text-muted py-5">
              <p>No budgets found</p>
              <p>Create a budget to start tracking your spending limits</p>
            </div>
          ) : (
            <div className="table-responsive">
              <Table striped bordered hover>
                <thead>
                  <tr>
                    <th>Category</th>
                    <th>Amount</th>
                    <th>Period</th>
                    <th>Start Date</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {budgets.map((budget) => (
                    <tr key={budget.id}>
                      <td>{budget.category}</td>
                      <td>${parseFloat(budget.amount).toFixed(2)}</td>
                      <td>{formatPeriod(budget.period)}</td>
                      <td>{formatDate(budget.start_date)}</td>
                      <td>
                        <Button
                          variant="danger"
                          size="sm"
                          onClick={() => handleDeleteClick(budget)}
                        >
                          Delete
                        </Button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </Table>
            </div>
          )}
        </Card.Body>
      </Card>

      {/* Delete Confirmation Modal */}
      <Modal show={showDeleteModal} onHide={handleCloseDeleteModal}>
        <Modal.Header closeButton>
          <Modal.Title>Confirm Delete</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {deleteError && (
            <div className="alert alert-danger">{deleteError}</div>
          )}
          <p>
            Are you sure you want to delete the budget for{' '}
            <strong>{budgetToDelete?.category}</strong>?
          </p>
          <p>This action cannot be undone.</p>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={handleCloseDeleteModal}>
            Cancel
          </Button>
          <Button
            variant="danger"
            onClick={handleConfirmDelete}
            disabled={deleteLoading}
          >
            {deleteLoading ? (
              <>
                <Spinner
                  as="span"
                  animation="border"
                  size="sm"
                  role="status"
                  aria-hidden="true"
                  className="me-2"
                />
                Deleting...
              </>
            ) : (
              'Delete'
            )}
          </Button>
        </Modal.Footer>
      </Modal>
    </>
  );
};

BudgetList.propTypes = {
  budgets: PropTypes.array.isRequired,
  onBudgetDeleted: PropTypes.func,
  isLoading: PropTypes.bool
};

export default BudgetList;