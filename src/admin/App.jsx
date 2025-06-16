import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import LoginPage from './pages/LoginPage';
import Dashboard from './pages/Dashboard';
import ABCDPage from './pages/ABCDPage';
import IndexPage from './pages/IndexPage';
import Rule1Page from './pages/Rule1Page';
import Rule2Page from './pages/Rule2Page';

export default function App() {
  return (
    <Router>
      <Routes>
        <Route path="/admin/login" element={<LoginPage />} />
        <Route path="/admin/dashboard" element={<Dashboard />} />
        <Route path="/admin/user/:id" element={<ABCDPage />} />
        <Route path="/admin/user/:id/index" element={<IndexPage />} />
        <Route path="/admin/user/:id/rule1" element={<Rule1Page />} />
        <Route path="/admin/user/:id/rule2" element={<Rule2Page />} />
        <Route path="*" element={<Navigate to="/admin/login" replace />} />
      </Routes>
    </Router>
  );
}
