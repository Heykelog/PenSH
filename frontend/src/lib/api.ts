import axios from 'axios'

export const API_BASE_URL = process.env.REACT_APP_API_URL || '/api'

export const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
})

// Types
export interface Customer {
  id: number
  name: string
  contact_person?: string
  email?: string
  phone?: string
  address?: string
  is_default: boolean
  created_at: string
  updated_at?: string
}

export interface Tester {
  id: number
  name: string
  email?: string
  phone?: string
  title?: string
  is_default: boolean
  created_at: string
  updated_at?: string
}

export interface Report {
  id: number
  title: string
  description?: string
  methodology?: string
  scope?: string
  client_name?: string
  test_date?: string
  tester_name?: string
  customer_id?: number
  tester_id?: number
  logo_path?: string
  created_at: string
  updated_at?: string
  findings: Finding[]
  customer?: Customer
  tester?: Tester
}

export interface POCImage {
  id: number
  filename: string
  original_filename: string
  file_path: string
  file_size?: number
  mime_type?: string
  finding_id: number
  created_at: string
}

export interface Finding {
  id: number
  title: string
  description: string
  affected_area?: string
  risk_level: 'critical' | 'high' | 'medium' | 'low' | 'info'
  owasp_category?: string
  solution?: string
  steps_to_reproduce?: string
  impact?: string
  request?: string
  response?: string
  cvss_score?: string
  cwe_id?: string
  refs?: string
  report_id: number
  display_order?: number
  created_at: string
  updated_at?: string
  poc_images?: POCImage[]
}

export interface OwaspTemplate {
  id: number
  category: string
  title: string
  description: string
  impact?: string
  solution?: string
  risk_level: 'critical' | 'high' | 'medium' | 'low' | 'info'
  is_active: boolean
}

export interface KnowledgeBaseTemplate {
  id: number
  title: string
  description: string
  affected_area?: string
  impact?: string
  solution?: string
  risk_level: 'critical' | 'high' | 'medium' | 'low' | 'info'
  owasp_category?: string
  steps_to_reproduce?: string
  request?: string
  response?: string
  cvss_score?: string
  cwe_id?: string
  refs?: string
  is_from_finding: boolean
  finding_id?: number
  created_at: string
  updated_at?: string
}

export interface CreateReportData {
  title: string
  description?: string
  methodology?: string
  scope?: string
  client_name?: string
  test_date?: string
  tester_name?: string
  customer_id?: number
  tester_id?: number
}

export interface CreateFindingData {
  title: string
  description: string
  affected_area?: string
  risk_level: 'critical' | 'high' | 'medium' | 'low' | 'info'
  owasp_category?: string
  solution?: string
  steps_to_reproduce?: string
  impact?: string
  request?: string
  response?: string
  cvss_score?: string
  cwe_id?: string
  refs?: string
  report_id: number
}

export interface Statistics {
  total_reports: number
  total_findings: number
  risk_distribution: Record<string, number>
  owasp_distribution: Record<string, number>
}

// API functions
export const reportsAPI = {
  getAll: () => api.get<Report[]>('/reports'),
  getById: (id: number) => api.get<Report>(`/reports/${id}`),
  create: (data: CreateReportData) => api.post<Report>('/reports', data),
  update: (id: number, data: Partial<CreateReportData>) => api.put<Report>(`/reports/${id}`, data),
  delete: (id: number) => api.delete(`/reports/${id}`),
  search: (query: string) => api.get<Report[]>(`/search/reports?q=${encodeURIComponent(query)}`),
  uploadLogo: (reportId: number, file: File) => {
    const formData = new FormData()
    formData.append('file', file)
    return api.post(`/reports/${reportId}/upload-logo`, formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    })
  },
}

export const findingsAPI = {
  getAll: (params?: { 
    report_id?: number
    risk_level?: string
    owasp_category?: string
    skip?: number
    limit?: number
  }) => api.get<Finding[]>('/findings', { params }),
  getById: (id: number) => api.get<Finding>(`/findings/${id}`),
  create: (data: CreateFindingData) => api.post<Finding>('/findings', data),
  update: (id: number, data: Partial<CreateFindingData>) => api.put<Finding>(`/findings/${id}`, data),
  delete: (id: number) => api.delete(`/findings/${id}`),
  search: (query: string, reportId?: number) => {
    const params = new URLSearchParams({ q: query })
    if (reportId) params.append('report_id', reportId.toString())
    return api.get<Finding[]>(`/search/findings?${params}`)
  },
  createFromOwaspTemplate: (templateId: number, reportId: number, customTitle?: string, customAffectedArea?: string) =>
    api.post<Finding>('/findings/from-owasp-template', {}, {
      params: {
        template_id: templateId,
        report_id: reportId,
        custom_title: customTitle,
        custom_affected_area: customAffectedArea,
      }
    }),
  saveToKnowledgeBase: (findingId: number) =>
    api.post<KnowledgeBaseTemplate>(`/findings/${findingId}/save-to-knowledge-base`),
  reorder: (reportId: number, orderedIds: number[]) =>
    api.post(`/findings/reorder`, { report_id: reportId, orderedIds }),
}

export const owaspAPI = {
  getTemplates: () => api.get<OwaspTemplate[]>('/owasp-templates'),
  getTemplate: (id: number) => api.get<OwaspTemplate>(`/owasp-templates/${id}`),
}

export const knowledgeBaseAPI = {
  getAll: () => api.get<KnowledgeBaseTemplate[]>('/knowledge-base-templates'),
  getById: (id: number) => api.get<KnowledgeBaseTemplate>(`/knowledge-base-templates/${id}`),
  create: (data: Partial<KnowledgeBaseTemplate>) => api.post<KnowledgeBaseTemplate>('/knowledge-base-templates', data),
  update: (id: number, data: Partial<KnowledgeBaseTemplate>) => api.put<KnowledgeBaseTemplate>(`/knowledge-base-templates/${id}`, data),
  delete: (id: number) => api.delete(`/knowledge-base-templates/${id}`),
  createFromTemplate: (templateId: number, reportId: number, customTitle?: string, customAffectedArea?: string) =>
    api.post<Finding>('/findings/from-knowledge-base-template', {}, {
      params: {
        template_id: templateId,
        report_id: reportId,
        custom_title: customTitle,
        custom_affected_area: customAffectedArea,
      }
    }),
}

export const exportAPI = {
  exportToPDF: (reportId: number, includeLogo: boolean = false) => 
    api.post(`/export/pdf/${reportId}`, {}, { 
      params: { include_logo: includeLogo },
      responseType: 'blob'
    }),
  exportToXLSX: (reportId: number) => 
    api.get(`/export/xlsx/${reportId}`, { 
      responseType: 'blob'
    }),
  exportToDOCX: (reportId: number) => 
    api.get(`/export/docx/${reportId}`, {
      responseType: 'blob'
    }),
  uploadLogo: (file: File) => {
    const formData = new FormData()
    formData.append('file', file)
    return api.post('/upload/logo', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    })
  },
}

export const statisticsAPI = {
  get: () => api.get<Statistics>('/statistics'),
}

export const customersAPI = {
  getAll: () => api.get<Customer[]>('/customers'),
  getById: (id: number) => api.get<Customer>(`/customers/${id}`),
  create: (data: Partial<Customer>) => api.post<Customer>('/customers', data),
  update: (id: number, data: Partial<Customer>) => api.put<Customer>(`/customers/${id}`, data),
  delete: (id: number) => api.delete(`/customers/${id}`),
  getDefault: () => api.get<Customer>('/customers/default'),
}

export const testersAPI = {
  getAll: () => api.get<Tester[]>('/testers'),
  getById: (id: number) => api.get<Tester>(`/testers/${id}`),
  create: (data: Partial<Tester>) => api.post<Tester>('/testers', data),
  update: (id: number, data: Partial<Tester>) => api.put<Tester>(`/testers/${id}`, data),
  delete: (id: number) => api.delete(`/testers/${id}`),
  getDefault: () => api.get<Tester>('/testers/default'),
}

// Error handler
api.interceptors.response.use(
  (response) => response,
  (error) => {
    console.error('API Error:', error)
    return Promise.reject(error)
  }
)
