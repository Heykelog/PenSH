import React, { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { Link } from 'react-router-dom'
import { 
  FileText, 
  Plus, 
  Search, 
  Download,
  Edit,
  Trash2,
  Eye
} from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card'
import { Button } from '../components/ui/button'
import { Input } from '../components/ui/input'
import { Badge } from '../components/ui/badge'
import { 
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '../components/ui/dialog'
import { reportsAPI, exportAPI } from '../lib/api'
import { formatDate, downloadFile } from '../lib/utils'
import { Report } from '../lib/api'

export function Reports() {
  const [searchQuery, setSearchQuery] = useState('')
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [reportToDelete, setReportToDelete] = useState<Report | null>(null)
  
  const queryClient = useQueryClient()

  const { data: reports, isLoading } = useQuery({
    queryKey: ['reports'],
    queryFn: () => reportsAPI.getAll().then(res => res.data),
  })

  const { data: searchResults } = useQuery({
    queryKey: ['search-reports', searchQuery],
    queryFn: () => reportsAPI.search(searchQuery).then(res => res.data),
    enabled: searchQuery.length > 0,
  })

  const deleteMutation = useMutation({
    mutationFn: (id: number) => reportsAPI.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['reports'] })
      setDeleteDialogOpen(false)
      setReportToDelete(null)
    },
  })

  const exportMutation = useMutation({
    mutationFn: (reportId: number) => exportAPI.exportToPDF(reportId),
    onSuccess: (response, reportId) => {
      const report = displayReports?.find(r => r.id === reportId)
      const filename = `${report?.title || 'pentest-report'}.pdf`
      downloadFile(response.data, filename)
    },
  })

  const displayReports = searchQuery ? searchResults : reports
  
  const handleDelete = (report: Report) => {
    setReportToDelete(report)
    setDeleteDialogOpen(true)
  }

  const confirmDelete = () => {
    if (reportToDelete) {
      deleteMutation.mutate(reportToDelete.id)
    }
  }

  const handleExport = (reportId: number) => {
    exportMutation.mutate(reportId)
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Raporlarım</h1>
          <p className="text-muted-foreground mt-1">
            Oluşturduğunuz penetrasyon testi raporlarını görüntüleyin ve yönetin
          </p>
        </div>
        <Button asChild>
          <Link to="/create-report">
            <Plus className="h-4 w-4 mr-2" />
            Yeni Rapor
          </Link>
        </Button>
      </div>

      {/* Search */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Search className="h-5 w-5 mr-2" />
            Rapor Ara
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex space-x-2">
            <Input
              placeholder="Rapor başlığı, müşteri adı veya açıklama ile ara..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="flex-1"
            />
            {searchQuery && (
              <Button 
                variant="outline" 
                onClick={() => setSearchQuery('')}
              >
                Temizle
              </Button>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Reports List */}
      <div className="grid gap-6">
        {isLoading ? (
          <div className="space-y-4">
            {[...Array(3)].map((_, i) => (
              <Card key={i} className="animate-pulse">
                <CardContent className="p-6">
                  <div className="h-6 bg-muted rounded w-1/3 mb-2"></div>
                  <div className="h-4 bg-muted rounded w-2/3 mb-4"></div>
                  <div className="flex space-x-2">
                    <div className="h-8 bg-muted rounded w-20"></div>
                    <div className="h-8 bg-muted rounded w-20"></div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : displayReports && displayReports.length > 0 ? (
          displayReports.map((report) => (
            <Card key={report.id} className="hover:shadow-md transition-shadow">
              <CardContent className="p-6">
                <div className="flex justify-between items-start">
                  <div className="flex-1">
                    <div className="flex items-center space-x-2 mb-2">
                      <h3 className="text-xl font-semibold text-foreground">
                        {report.title}
                      </h3>
                      <Badge variant="outline">
                        {(report.findings && report.findings.length) || 0} bulgu
                      </Badge>
                    </div>
                    
                    {report.description && (
                      <p className="text-muted-foreground mb-3 line-clamp-2">
                        {report.description}
                      </p>
                    )}
                    
                    <div className="flex items-center space-x-4 text-sm text-muted-foreground">
                      {report.client_name && (
                        <span>Müşteri: {report.client_name}</span>
                      )}
                      {report.test_date && (
                        <span>Test Tarihi: {report.test_date}</span>
                      )}
                      <span>Oluşturulma: {formatDate(report.created_at)}</span>
                    </div>
                  </div>
                  
                  <div className="flex items-center space-x-2 ml-4">
                    <Button variant="outline" size="sm" asChild>
                      <Link to={`/reports/${report.id}`}>
                        <Eye className="h-4 w-4 mr-1" />
                        Görüntüle
                      </Link>
                    </Button>
                    
                    <Button variant="outline" size="sm" asChild>
                      <Link to={`/reports/${report.id}/edit`}>
                        <Edit className="h-4 w-4 mr-1" />
                        Düzenle
                      </Link>
                    </Button>
                    
                    <Button 
                      variant="outline" 
                      size="sm"
                      onClick={() => handleExport(report.id)}
                      disabled={exportMutation.isPending}
                    >
                      <Download className="h-4 w-4 mr-1" />
                      {exportMutation.isPending ? 'İndiriliyor...' : 'PDF'}
                    </Button>
                    
                    <Button 
                      variant="destructive" 
                      size="sm"
                      onClick={() => handleDelete(report)}
                    >
                      <Trash2 className="h-4 w-4 mr-1" />
                      Sil
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))
        ) : (
          <Card>
            <CardContent className="text-center py-12">
              <FileText className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-medium text-foreground mb-2">
                {searchQuery ? 'Arama sonucu bulunamadı' : 'Henüz rapor yok'}
              </h3>
              <p className="text-muted-foreground mb-6">
                {searchQuery 
                  ? 'Farklı anahtar kelimeler deneyebilirsiniz'
                  : 'İlk penetrasyon testi raporunuzu oluşturmaya başlayın'
                }
              </p>
              {!searchQuery && (
                <Button asChild>
                  <Link to="/create-report">
                    <Plus className="h-4 w-4 mr-2" />
                    Yeni Rapor Oluştur
                  </Link>
                </Button>
              )}
            </CardContent>
          </Card>
        )}
      </div>

      {/* Delete Confirmation Dialog */}
      <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Raporu Sil</DialogTitle>
            <DialogDescription>
              "{reportToDelete?.title}" raporunu silmek istediğinizden emin misiniz? 
              Bu işlem geri alınamaz ve rapordaki tüm bulgular da silinecektir.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button 
              variant="outline" 
              onClick={() => setDeleteDialogOpen(false)}
            >
              İptal
            </Button>
            <Button 
              variant="destructive" 
              onClick={confirmDelete}
              disabled={deleteMutation.isPending}
            >
              {deleteMutation.isPending ? 'Siliniyor...' : 'Sil'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
