# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

### Backend (Flask)
- Setup: `cd backend && source venv/bin/activate && pip install -r requirements.txt`
- Run: `cd backend && python app.py` (serves on http://localhost:5001)

### Frontend (React)
- Setup: `cd frontend && npm install`
- Run: `cd frontend && npm start` (serves on http://localhost:3000)
- Test: `cd frontend && npm test`
- Build: `cd frontend && npm run build`

## Code Style Guidelines

### Backend
- Follow PEP 8 style guidelines for Python
- Use Flask RESTful patterns for API endpoints
- Pin dependency versions in requirements.txt
- Error handling should include appropriate HTTP status codes

### Frontend
- Use functional components with React hooks
- Follow React Bootstrap component patterns
- Use destructuring for props
- Keep component files small and focused
- Use camelCase for variable names and PascalCase for component names
- Include PropTypes for all components