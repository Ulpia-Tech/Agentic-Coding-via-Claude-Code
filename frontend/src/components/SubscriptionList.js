import React from 'react';
import { Table, Badge, Button, Card } from 'react-bootstrap';
import PropTypes from 'prop-types';
import { FaTrash } from 'react-icons/fa';

const SubscriptionList = ({ subscriptions, onDeleteSubscription, isLoading }) => {
  // Calculate renewal status based on date
  const getRenewalStatus = (renewalDate) => {
    const today = new Date();
    const renewal = new Date(renewalDate);
    const diffTime = renewal - today;
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    if (diffDays < 0) {
      return { status: 'Overdue', class: 'danger' };
    } else if (diffDays <= 7) {
      return { status: 'Soon', class: 'warning' };
    } else {
      return { status: 'Active', class: 'success' };
    }
  };
  
  // Format amount based on billing cycle
  const formatAmount = (amount, billingCycle) => {
    return `$${amount.toFixed(2)} / ${billingCycle.replace('ly', '').replace('al', '')}`;
  };

  return (
    <Card className="shadow mb-4">
      <Card.Header className="d-flex justify-content-between align-items-center">
        <h5 className="m-0 font-weight-bold">Your Subscriptions</h5>
        <span className="badge bg-primary">{subscriptions.length} Total</span>
      </Card.Header>
      <Card.Body>
        {isLoading ? (
          <div className="text-center py-4">
            <div className="spinner-border text-primary" role="status">
              <span className="visually-hidden">Loading...</span>
            </div>
            <p className="mt-2">Loading subscriptions...</p>
          </div>
        ) : subscriptions.length === 0 ? (
          <div className="text-center text-muted py-4">
            <p className="mb-0">No subscriptions found</p>
            <p>Add a subscription to get started</p>
          </div>
        ) : (
          <div className="table-responsive">
            <Table hover>
              <thead>
                <tr>
                  <th>Name</th>
                  <th>Amount</th>
                  <th>Category</th>
                  <th>Next Renewal</th>
                  <th>Status</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {subscriptions.map((subscription) => {
                  const renewalInfo = getRenewalStatus(subscription.renewal_date);
                  
                  return (
                    <tr key={subscription.id}>
                      <td className="fw-bold">{subscription.name}</td>
                      <td>{formatAmount(subscription.amount, subscription.billing_cycle)}</td>
                      <td>{subscription.category}</td>
                      <td>{new Date(subscription.renewal_date).toLocaleDateString()}</td>
                      <td>
                        <Badge bg={renewalInfo.class} pill>
                          {renewalInfo.status}
                        </Badge>
                      </td>
                      <td>
                        {onDeleteSubscription && (
                          <Button 
                            variant="outline-danger" 
                            size="sm"
                            onClick={() => onDeleteSubscription(subscription.id)}
                            title="Delete subscription"
                          >
                            <FaTrash />
                          </Button>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </Table>
          </div>
        )}
      </Card.Body>
    </Card>
  );
};

SubscriptionList.propTypes = {
  subscriptions: PropTypes.array.isRequired,
  onDeleteSubscription: PropTypes.func,
  isLoading: PropTypes.bool
};

SubscriptionList.defaultProps = {
  subscriptions: [],
  isLoading: false
};

export default SubscriptionList;