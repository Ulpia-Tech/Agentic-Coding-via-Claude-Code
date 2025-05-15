import React, { useState, useEffect } from 'react';
import { Container, Row, Col, Card, Tab, Nav } from 'react-bootstrap';
import axios from 'axios';
import API_CONFIG from '../config';
import BudgetForm from './BudgetForm';
import BudgetList from './BudgetList';
import BudgetProgress from './BudgetProgress';

const BudgetsPage = () => {
  const [budgets, setBudgets] = useState([]);
  const [budgetProgress, setBudgetProgress] = useState([]);
  const [categories, setCategories] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchData = async () => {
    setIsLoading(true);
    try {
      // Fetch budgets
      const budgetsResponse = await axios.get(
        `${API_CONFIG.BASE_URL}${API_CONFIG.ENDPOINTS.BUDGETS}`
      );
      setBudgets(budgetsResponse.data);

      // Fetch budget progress
      const progressResponse = await axios.get(
        `${API_CONFIG.BASE_URL}${API_CONFIG.ENDPOINTS.BUDGET_PROGRESS}`
      );
      setBudgetProgress(progressResponse.data);

      // Fetch categories for budget form
      const categoriesResponse = await axios.get(
        `${API_CONFIG.BASE_URL}${API_CONFIG.ENDPOINTS.CATEGORIES}`
      );
      setCategories(categoriesResponse.data);

      setError(null);
    } catch (err) {
      console.error('Error fetching budget data:', err);
      setError('Failed to load budget data');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleBudgetCreated = () => {
    fetchData();
  };

  const handleBudgetDeleted = () => {
    fetchData();
  };

  return (
    <Container fluid className="p-0">
      {error && <div className="alert alert-danger">{error}</div>}

      <Tab.Container defaultActiveKey="progress">
        <Row className="mb-3">
          <Col lg={12}>
            <Nav variant="pills" className="mb-3">
              <Nav.Item>
                <Nav.Link eventKey="progress">Budget Progress</Nav.Link>
              </Nav.Item>
              <Nav.Item>
                <Nav.Link eventKey="manage">Manage Budgets</Nav.Link>
              </Nav.Item>
            </Nav>
          </Col>
        </Row>

        <Tab.Content>
          <Tab.Pane eventKey="progress">
            <BudgetProgress 
              budgetProgress={budgetProgress} 
              isLoading={isLoading} 
            />
          </Tab.Pane>
          <Tab.Pane eventKey="manage">
            <Row>
              <Col md={4}>
                <Card className="shadow mb-4">
                  <Card.Header>
                    <h5 className="m-0 font-weight-bold">Create Budget</h5>
                  </Card.Header>
                  <Card.Body>
                    <BudgetForm 
                      categories={categories} 
                      onBudgetCreated={handleBudgetCreated} 
                    />
                  </Card.Body>
                </Card>
              </Col>
              <Col md={8}>
                <BudgetList 
                  budgets={budgets} 
                  onBudgetDeleted={handleBudgetDeleted} 
                  isLoading={isLoading} 
                />
              </Col>
            </Row>
          </Tab.Pane>
        </Tab.Content>
      </Tab.Container>
    </Container>
  );
};

export default BudgetsPage;