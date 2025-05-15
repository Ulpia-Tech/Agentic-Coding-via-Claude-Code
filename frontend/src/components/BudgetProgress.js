import React from 'react';
import { Card, Row, Col, ProgressBar, Spinner } from 'react-bootstrap';
import PropTypes from 'prop-types';

const BudgetProgress = ({ budgetProgress, isLoading }) => {
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

  const getProgressBarVariant = (status) => {
    switch (status) {
      case 'on_track':
        return 'success';
      case 'warning':
        return 'warning';
      case 'exceeded':
        return 'danger';
      default:
        return 'primary';
    }
  };

  return (
    <div className="budget-progress">
      {isLoading ? (
        <div className="text-center py-5">
          <Spinner animation="border" role="status">
            <span className="visually-hidden">Loading...</span>
          </Spinner>
          <p className="mt-2">Loading budget progress...</p>
        </div>
      ) : budgetProgress.length === 0 ? (
        <div className="text-center text-muted py-5">
          <p>No budget data found</p>
          <p>Create a budget to start tracking your spending</p>
        </div>
      ) : (
        <>
          <Row className="mb-4">
            <Col>
              <Card className="shadow-sm">
                <Card.Header>
                  <h5 className="m-0 font-weight-bold">Budget Progress</h5>
                </Card.Header>
                <Card.Body>
                  <p className="mb-3">
                    Track your spending against your budget limits. The progress bars show 
                    your current spending as a percentage of your budget amount.
                  </p>
                </Card.Body>
              </Card>
            </Col>
          </Row>

          <Row xs={1} md={2} className="g-4">
            {budgetProgress.map((budget) => (
              <Col key={budget.budget_id}>
                <Card className="h-100 shadow-sm">
                  <Card.Header>
                    <h5 className="m-0">{budget.category}</h5>
                  </Card.Header>
                  <Card.Body>
                    <div className="budget-details mb-3">
                      <Row className="mb-1">
                        <Col xs={5}>Budget:</Col>
                        <Col xs={7} className="text-end fw-bold">
                          ${parseFloat(budget.amount).toFixed(2)}
                        </Col>
                      </Row>
                      <Row className="mb-1">
                        <Col xs={5}>Period:</Col>
                        <Col xs={7} className="text-end">
                          {formatPeriod(budget.period)}
                        </Col>
                      </Row>
                      <Row className="mb-1">
                        <Col xs={5}>Period:</Col>
                        <Col xs={7} className="text-end">
                          {formatDate(budget.start_date)} - {formatDate(budget.end_date)}
                        </Col>
                      </Row>
                      <Row className="mb-1">
                        <Col xs={5}>Spent:</Col>
                        <Col xs={7} className="text-end">
                          ${parseFloat(budget.actual_spending).toFixed(2)}
                        </Col>
                      </Row>
                      <Row className="mb-1">
                        <Col xs={5}>Remaining:</Col>
                        <Col xs={7} className="text-end fw-bold">
                          ${parseFloat(budget.remaining).toFixed(2)}
                        </Col>
                      </Row>
                    </div>

                    <div className="usage-progress mb-2">
                      <div className="d-flex justify-content-between mb-1">
                        <span>Spending Progress</span>
                        <span>{budget.percentage_used.toFixed(0)}%</span>
                      </div>
                      <ProgressBar
                        variant={getProgressBarVariant(budget.status)}
                        now={Math.min(budget.percentage_used, 100)}
                        className="mb-3"
                      />

                      <div className="d-flex justify-content-between mb-1">
                        <span>Time Elapsed</span>
                        <span>{budget.percentage_time_elapsed.toFixed(0)}%</span>
                      </div>
                      <ProgressBar
                        variant="info"
                        now={Math.min(budget.percentage_time_elapsed, 100)}
                      />
                    </div>

                    <div className="budget-status mt-3">
                      <span>Status: </span>
                      <span className={`badge bg-${getProgressBarVariant(budget.status)} ms-2`}>
                        {budget.status === 'on_track'
                          ? 'On Track'
                          : budget.status === 'warning'
                          ? 'Warning'
                          : 'Exceeded'}
                      </span>
                    </div>
                  </Card.Body>
                </Card>
              </Col>
            ))}
          </Row>
        </>
      )}
    </div>
  );
};

BudgetProgress.propTypes = {
  budgetProgress: PropTypes.array.isRequired,
  isLoading: PropTypes.bool
};

export default BudgetProgress;