import React from 'react';
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
          </div>
        )}
      </Card.Body>
    </Card>
  );
};

SubscriptionList.propTypes = {
  subscriptions: PropTypes.array.isRequired,
  onDeleteSubscription: PropTypes.func.isRequired,
  isLoading: PropTypes.bool
};

SubscriptionList.defaultProps = {
  isLoading: false
};

export default SubscriptionList;