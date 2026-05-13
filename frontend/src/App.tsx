// @ts-ignore-next-line
import React from 'react'
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { Layout } from './components/Layout'
import { Dashboard } from './pages/Dashboard'
import { Reports } from './pages/Reports'
import { ReportDetail } from './pages/ReportDetail'
import { CreateReport } from './pages/CreateReport'
import { EditReport } from './pages/EditReport'
import { CreateFinding } from './pages/CreateFinding'
import { EditFinding } from './pages/EditFinding'
import { CustomerManagement } from './pages/CustomerManagement'
import { KnowledgeBase } from './pages/KnowledgeBase'
import './index.css'

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 1,
      refetchOnWindowFocus: false,
    },
  },
})

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <Router>
        <div className="min-h-screen bg-background text-foreground">
          <Layout>
            <Routes>
              <Route path="/" element={<Dashboard />} />
              <Route path="/reports" element={<Reports />} />
              <Route path="/reports/:id" element={<ReportDetail />} />
              <Route path="/reports/:id/edit" element={<EditReport />} />
              <Route path="/create-report" element={<CreateReport />} />
              <Route path="/create-finding/:reportId" element={<CreateFinding />} />
              <Route path="/findings/:findingId/edit" element={<EditFinding />} />
              <Route path="/customer-management" element={<CustomerManagement />} />
              <Route path="/knowledge-base" element={<KnowledgeBase />} />
            </Routes>
          </Layout>
        </div>
      </Router>
    </QueryClientProvider>
  )
}

export default App

