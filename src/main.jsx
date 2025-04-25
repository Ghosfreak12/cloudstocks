/**
 * CloudStocks: A Real-Time Stock Market Dashboard on AWS
 * Author: Rishal Khatri
 *
 * Objective:
 * CloudStocks provides real-time and historical stock data through a serverless AWS architecture.
 * It is designed to support 100 users with <500ms latency, deployed by the end of the semester.
 *
 * SMART Goals:
 * - Specific: Real-time & historical stock dashboard on AWS.
 * - Measurable: <500ms latency for 100 users.
 * - Achievable: Serverless AWS architecture.
 * - Relevant: Course-aligned AWS solution.
 * - Time-bound: Complete by semester end.
 *
 * AWS Well-Architected Integration Notes:
 * - [SEC 2] Secure API Gateway V2 with IAM Identity Center (for real use).
 * - [REL 3] Lambda, API Gateway, and DynamoDB across two regions (planned).
 * - [PERF 3] Optimized DynamoDB <500ms latency (planned).
 * - [COST 9] Serverless architecture for cost-efficiency.
 * - [OPS 8] CloudWatch alerts for latency issues (future integration).
 */

import React from 'react'
import ReactDOM from 'react-dom/client'
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { AuthProvider } from './contexts/AuthContext'
import Dashboard from './pages/Dashboard'
import Login from './components/Login'
import Signup from './components/Signup'
import Profile from './components/Profile'
import ProtectedRoute from './components/ProtectedRoute'
import Navbar from './components/Navbar'
import './index.css'

// Simple About component
const About = () => (
  <div className="max-w-4xl mx-auto p-6 bg-gray-800 rounded-lg shadow-md mt-8 text-gray-200">
    <h1 className="text-3xl font-bold mb-4">About CloudStocks</h1>
    <p className="mb-4">
      CloudStocks is a real-time stock market dashboard built on AWS, providing users with up-to-date market data and historical trends.
    </p>
    <p className="mb-4">
      Built by Rishal Khatri as part of a cloud computing course, this application leverages AWS serverless architecture for scalability and performance.
    </p>
    <h2 className="text-xl font-bold mt-6 mb-2">Technologies Used:</h2>
    <ul className="list-disc pl-6 mb-4">
      <li>React for the frontend user interface</li>
      <li>AWS Amplify for hosting and continuous deployment</li>
      <li>Amazon Cognito for user authentication</li>
      <li>Finnhub API for real-time stock data</li>
      <li>Tailwind CSS for styling</li>
    </ul>
  </div>
);

// App Layout with Navbar and Routes
const AppLayout = () => (
  <div className="min-h-screen bg-gray-900 text-white">
    <Navbar />
    <div className="container mx-auto px-4 py-4">
      <Routes>
        <Route path="/" element={<Navigate to="/dashboard" replace />} />
        <Route path="/login" element={<Login />} />
        <Route path="/signup" element={<Signup />} />
        <Route path="/about" element={<About />} />
        
        {/* Protected routes */}
        <Route element={<ProtectedRoute />}>
          <Route path="/profile" element={<Profile />} />
          <Route path="/favorites" element={<div>Favorites Page</div>} />
        </Route>
        
        {/* Dashboard is accessible to everyone */}
        <Route path="/dashboard" element={<Dashboard />} />
        
        {/* Catch-all route */}
        <Route path="*" element={<Navigate to="/dashboard" replace />} />
      </Routes>
    </div>
  </div>
);

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <BrowserRouter>
      <AuthProvider>
        <AppLayout />
      </AuthProvider>
    </BrowserRouter>
  </React.StrictMode>,
);