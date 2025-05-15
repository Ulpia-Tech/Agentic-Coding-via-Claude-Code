import React from 'react';
<<<<<<< HEAD
import PropTypes from 'prop-types';
import { Table, Button, Badge, Card, Spinner } from 'react-bootstrap';

const SubscriptionList = ({ subscriptions, onDeleteSubscription, isLoading }) => {
  // Helper to format dates
  const formatDate = (dateString) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    return date.toLocaleDateString();
  };

  // Calculate days until renewal
  const daysUntilRenewal = (renewalDateString) => {
    const today = new Date();
    today.setHours(0, 0, 0, 0); // Reset time part to compare just dates
    
    const renewalDate = new Date(renewalDateString);
    const timeDiff = renewalDate - today;
    const daysDiff = Math.ceil(timeDiff / (1000 * 60 * 60 * 24));
    
    return daysDiff;
  };

  // Get badge variant based on days until renewal
  const getRenewalBadgeVariant = (renewalDateString) => {
    const days = daysUntilRenewal(renewalDateString);
    
    if (days < 0) return 'danger';   // Overdue
    if (days <= 7) return 'warning';  // Due soon (within a week)
    return 'success';                 // Due later
  };

  // Get readable text for renewal status
  const getRenewalStatus = (renewalDateString) => {
    const days = daysUntilRenewal(renewalDateString);
    
    if (days < 0) return `Overdue by ${Math.abs(days)} days`;
    if (days === 0) return 'Due today';
    if (days === 1) return 'Due tomorrow';
    return `Renews in ${days} days`;
  };

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
    <Card className="mb-4">
      <Card.Header>Your Subscriptions</Card.Header>
      <Card.Body>
        {subscriptions && subscriptions.length > 0 ? (
          <Table responsive hover>
            <thead>
              <tr>
                <th>Name</th>
                <th>Amount</th>
                <th>Category</th>
                <th>Billing</th>
                <th>Start Date</th>
                <th>Renewal</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {subscriptions.map(subscription => (
                <tr key={subscription.id}>
                  <td>{subscription.name}</td>
                  <td>${parseFloat(subscription.amount).toFixed(2)}</td>
                  <td>{subscription.category}</td>
                  <td>
                    <Badge bg="info">
                      {subscription.billing_cycle.charAt(0).toUpperCase() + subscription.billing_cycle.slice(1)}
                    </Badge>
                  </td>
                  <td>{formatDate(subscription.start_date)}</td>
                  <td>
                    <Badge bg={getRenewalBadgeVariant(subscription.renewal_date)}>
                      {getRenewalStatus(subscription.renewal_date)}
                    </Badge>
                  </td>
                  <td>
                    <Button 
                      variant="danger" 
                      size="sm"
                      onClick={() => onDeleteSubscription(subscription.id)}
                    >
                      Delete
                    </Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </Table>
        ) : (
          <div className="text-center p-3">
            <p className="mb-0">No subscriptions found</p>
            <p className="text-muted">Add your first subscription using the form</p>
=======
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
>>>>>>> merged-dashboard-theme
          </div>
        )}
      </Card.Body>
    </Card>
  );
};

SubscriptionList.propTypes = {
  subscriptions: PropTypes.array.isRequired,
<<<<<<< HEAD
  onDeleteSubscription: PropTypes.func.isRequired,
=======
  onDeleteSubscription: PropTypes.func,
>>>>>>> merged-dashboard-theme
  isLoading: PropTypes.bool
};

SubscriptionList.defaultProps = {
<<<<<<< HEAD
=======
  subscriptions: [],
>>>>>>> merged-dashboard-theme
  isLoading: false
};

export default SubscriptionList;