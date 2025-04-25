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
import Dashboard from './pages/Dashboard'
import './index.css'

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <Dashboard />
  </React.StrictMode>,
)