import React from 'react'
import { useQuery } from '@tanstack/react-query'
import { Link } from 'react-router-dom'
import { 
  FileText, 
  Plus, 
  AlertTriangle, 
  Shield,
  TrendingUp,
  Activity
} from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card'
import { Button } from '../components/ui/button'
import { Badge } from '../components/ui/badge'
import { reportsAPI, statisticsAPI, owaspAPI, knowledgeBaseAPI } from '../lib/api'
import { getRiskLevelColor, getRiskLevelText, formatDate } from '../lib/utils'

export function Dashboard() {
  const { data: reports, isLoading: reportsLoading } = useQuery({
    queryKey: ['reports'],
    queryFn: () => reportsAPI.getAll().then(res => res.data),
  })

  const { data: statistics, isLoading: statsLoading } = useQuery({
    queryKey: ['statistics'],
    queryFn: () => statisticsAPI.get().then(res => res.data),
  })

  const { data: owaspTemplates = [], isLoading: owaspLoading } = useQuery({
    queryKey: ['owasp-templates'],
    queryFn: () => owaspAPI.getTemplates().then(res => res.data),
  })

  const { data: kbTemplates = [], isLoading: kbLoading } = useQuery({
    queryKey: ['knowledge-base-templates'],
    queryFn: () => knowledgeBaseAPI.getAll().then(res => res.data),
  })

  const templatesLoading = owaspLoading || kbLoading
  const totalTemplates = (owaspTemplates?.length || 0) + (kbTemplates?.length || 0)

  const recentReports = reports?.slice(0, 5) || []

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Dashboard</h1>
          <p className="text-muted-foreground mt-1">
            Penetrasyon testi raporlarınızı yönetin ve OWASP Top 10 şablonlarını kullanın
          </p>
        </div>
        <div className="flex space-x-3">
          <Button asChild>
            <Link to="/create-report">
              <Plus className="h-4 w-4 mr-2" />
              Yeni Rapor
            </Link>
          </Button>
        </div>
      </div>

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Toplam Rapor</CardTitle>
            <FileText className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {statsLoading ? '...' : statistics?.total_reports || 0}
            </div>
            <p className="text-xs text-muted-foreground">
              Oluşturulan tüm raporlar
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Toplam Bulgu</CardTitle>
            <AlertTriangle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {statsLoading ? '...' : statistics?.total_findings || 0}
            </div>
            <p className="text-xs text-muted-foreground">
              Tespit edilen güvenlik açıkları
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Kritik Riskler</CardTitle>
            <Activity className="h-4 w-4 text-red-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-500">
              {statsLoading ? '...' : statistics?.risk_distribution?.critical || 0}
            </div>
            <p className="text-xs text-muted-foreground">
              Acil müdahale gereken
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Bilgi Bankası Şablonları</CardTitle>
            <Shield className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {templatesLoading ? '...' : totalTemplates}
            </div>
            <p className="text-xs text-muted-foreground">
              Hazır güvenlik şablonları
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Risk Distribution Chart */}
      {statistics && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <TrendingUp className="h-5 w-5 mr-2" />
              Risk Seviyesi Dağılımı
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
              {Object.entries(statistics.risk_distribution).map(([risk, count]) => (
                <div key={risk} className="text-center">
                  <div className={`p-4 rounded-lg ${getRiskLevelColor(risk)}`}>
                    <div className="text-2xl font-bold">{count}</div>
                  </div>
                  <p className="text-sm mt-2 font-medium">
                    {getRiskLevelText(risk)}
                  </p>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Recent Reports */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <span>Son Raporlar</span>
              <Button variant="outline" size="sm" asChild>
                <Link to="/reports">Tümünü Gör</Link>
              </Button>
            </CardTitle>
          </CardHeader>
          <CardContent>
            {reportsLoading ? (
              <div className="space-y-3">
                {[...Array(3)].map((_, i) => (
                  <div key={i} className="animate-pulse">
                    <div className="h-4 bg-muted rounded w-3/4 mb-2"></div>
                    <div className="h-3 bg-muted rounded w-1/2"></div>
                  </div>
                ))}
              </div>
            ) : recentReports.length > 0 ? (
              <div className="space-y-4">
                {recentReports.map((report) => (
                  <div key={report.id} className="flex items-center justify-between p-3 border border-border rounded-lg hover:bg-accent transition-colors">
                    <div className="flex-1">
                      <Link to={`/reports/${report.id}`} className="font-medium hover:text-primary">
                        {report.title}
                      </Link>
                      <div className="flex items-center space-x-2 mt-1">
                        <span className="text-sm text-muted-foreground">
                          {formatDate(report.created_at)}
                        </span>
                        <Badge variant="outline">
                          {report.findings.length} bulgu
                        </Badge>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8">
                <FileText className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <p className="text-muted-foreground">Henüz rapor oluşturulmamış</p>
                <Button className="mt-4" asChild>
                  <Link to="/create-report">İlk Raporunuzu Oluşturun</Link>
                </Button>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Quick Actions */}
        <Card>
          <CardHeader>
            <CardTitle>Hızlı İşlemler</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <Button className="w-full justify-start" asChild>
                <Link to="/create-report">
                  <Plus className="h-4 w-4 mr-2" />
                  Yeni Rapor Oluştur
                </Link>
              </Button>
              
              <Button variant="outline" className="w-full justify-start" asChild>
                <Link to="/knowledge-base">
                  <Shield className="h-4 w-4 mr-2" />
                  Bilgi Bankası Şablonlarını Görüntüle
                </Link>
              </Button>
              
              <Button variant="outline" className="w-full justify-start" asChild>
                <Link to="/reports">
                  <FileText className="h-4 w-4 mr-2" />
                  Tüm Raporları Listele
                </Link>
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
