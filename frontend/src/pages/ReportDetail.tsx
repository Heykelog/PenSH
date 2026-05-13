import React, { useState, useMemo } from 'react'
import { useParams, Link } from 'react-router-dom'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { 
  ArrowLeft, 
  Plus, 
  Download, 
  Edit, 
  Trash2,
  AlertTriangle,
  FileText,
  Eye,
  FileSpreadsheet,
  ArrowUp,
  ArrowDown,
  Upload
} from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card'
import { Button } from '../components/ui/button'
import { Badge } from '../components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../components/ui/tabs'
import { 
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '../components/ui/dialog'
import { reportsAPI, findingsAPI, exportAPI, Finding } from '../lib/api'
import { getRiskLevelText, getOwaspCategoryText, formatDate, downloadFile } from '../lib/utils'

export function ReportDetail() {
  const { id } = useParams<{ id: string }>()
  const reportId = parseInt(id!)
  
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [findingToDelete, setFindingToDelete] = useState<Finding | null>(null)
  
  const queryClient = useQueryClient()

  const { data: report, isLoading } = useQuery({
    queryKey: ['report', reportId],
    queryFn: () => reportsAPI.getById(reportId).then(res => res.data),
    enabled: !!reportId,
  })

  const deleteFindingMutation = useMutation({
    mutationFn: (findingId: number) => findingsAPI.delete(findingId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['report', reportId] })
      setDeleteDialogOpen(false)
      setFindingToDelete(null)
    },
  })

  const reorderFindingsMutation = useMutation({
    mutationFn: (data: { report_id: number; orderedIds: number[] }) =>
      findingsAPI.reorder(data.report_id, data.orderedIds),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['report', reportId] })
    },
    onError: (error: any) => {
      console.error('Sıralama hatası:', error)
      alert('Bulgular sıralanırken hata oluştu')
    },
  })

  const uploadLogoMutation = useMutation({
    mutationFn: (file: File) => reportsAPI.uploadLogo(reportId, file),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['report', reportId] })
      alert('Logo başarıyla yüklendi')
    },
    onError: (error: any) => {
      console.error('Logo upload hatası:', error)
      alert('Logo yükleme sırasında hata oluştu')
    },
  })

  const handleLogoUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (file) {
      uploadLogoMutation.mutate(file)
    }
    // Reset input
    event.target.value = ''
  }

  // Sort findings by display_order
  const sortedFindings = useMemo(() => {
    if (!report?.findings) return []
    return [...report.findings].sort((a, b) => (a.display_order || 0) - (b.display_order || 0))
  }, [report?.findings])

  const handleRepositionFinding = (findingId: number, direction: 'up' | 'down') => {
    const currentIndex = sortedFindings.findIndex(f => f.id === findingId)
    if (
      (direction === 'up' && currentIndex === 0) ||
      (direction === 'down' && currentIndex === sortedFindings.length - 1)
    ) {
      return // Can't move beyond boundaries
    }

    const newIndex = direction === 'up' ? currentIndex - 1 : currentIndex + 1
    const reordered = [...sortedFindings]
    const [removed] = reordered.splice(currentIndex, 1)
    reordered.splice(newIndex, 0, removed)

    const orderedIds = reordered.map(f => f.id)
    reorderFindingsMutation.mutate({
      report_id: reportId,
      orderedIds,
    })
  }


  const exportPDFMutation = useMutation({
    mutationFn: () => exportAPI.exportToPDF(reportId),
    onSuccess: (response) => {
      console.log('PDF export başarılı!', response)
      const filename = `${report?.title || 'pentest-report'}.pdf`
      downloadFile(response.data, filename)
    },
    onError: (error) => {
      console.error('PDF export hatası:', error)
      alert('PDF oluşturulurken hata oluştu: ' + error.message)
    },
  })

  const exportXLSXMutation = useMutation({
    mutationFn: () => exportAPI.exportToXLSX(reportId),
    onSuccess: (response) => {
      const filename = `${report?.title || 'pentest-report'}.xlsx`
      downloadFile(response.data, filename)
    },
    onError: (error) => {
      console.error('XLSX export hatası:', error)
      alert('Excel oluşturulurken hata oluştu: ' + error.message)
    },
  })

  const exportDOCXMutation = useMutation({
    mutationFn: () => exportAPI.exportToDOCX(reportId),
    onSuccess: (response) => {
      const filename = `${report?.title || 'pentest-report'}.docx`
      downloadFile(response.data, filename)
    },
    onError: (error) => {
      console.error('DOCX export hatası:', error)
      alert('Word oluşturulurken hata oluştu: ' + error.message)
    },
  })

  const handleDeleteFinding = (finding: Finding) => {
    setFindingToDelete(finding)
    setDeleteDialogOpen(true)
  }

  const confirmDeleteFinding = () => {
    if (findingToDelete) {
      deleteFindingMutation.mutate(findingToDelete.id)
    }
  }

  const handleExportPDF = () => {
    exportPDFMutation.mutate()
  }

  const handleExportXLSX = () => {
    exportXLSXMutation.mutate()
  }

  const handleExportDOCX = () => {
    exportDOCXMutation.mutate()
  }

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="animate-pulse">
          <div className="h-8 bg-muted rounded w-1/3 mb-4"></div>
          <div className="h-4 bg-muted rounded w-2/3 mb-8"></div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="h-32 bg-muted rounded"></div>
            ))}
          </div>
        </div>
      </div>
    )
  }

  if (!report) {
    return (
      <div className="text-center py-12">
        <FileText className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
        <h3 className="text-lg font-medium text-foreground mb-2">Rapor bulunamadı</h3>
        <p className="text-muted-foreground mb-6">
          Aradığınız rapor mevcut değil veya silinmiş olabilir.
        </p>
        <Button asChild>
          <Link to="/reports">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Raporlara Dön
          </Link>
        </Button>
      </div>
    )
  }

  // Risk distribution
  const riskCounts = report.findings.reduce((acc, finding) => {
    acc[finding.risk_level] = (acc[finding.risk_level] || 0) + 1
    return acc
  }, {} as Record<string, number>)

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-start">
        <div>
          <div className="flex items-center space-x-2 mb-2">
            <Button variant="ghost" size="sm" asChild>
              <Link to="/reports">
                <ArrowLeft className="h-4 w-4 mr-1" />
                Geri
              </Link>
            </Button>
          </div>
          <h1 className="text-3xl font-bold text-foreground">{report.title}</h1>
          {report.description && (
            <p className="text-muted-foreground mt-1">{report.description}</p>
          )}
        </div>
        
        <div className="flex items-center space-x-2">
          <Button 
            variant="outline"
            onClick={handleExportPDF}
            disabled={exportPDFMutation.isPending}
          >
            <Download className="h-4 w-4 mr-2" />
            {exportPDFMutation.isPending ? 'İndiriliyor...' : 'PDF İndir'}
          </Button>

          <Button 
            variant="outline"
            onClick={handleExportXLSX}
            disabled={exportXLSXMutation.isPending}
          >
            <FileSpreadsheet className="h-4 w-4 mr-2" />
            {exportXLSXMutation.isPending ? 'İndiriliyor...' : 'Excel İndir'}
          </Button>

          <Button 
            variant="outline"
            onClick={handleExportDOCX}
            disabled={exportDOCXMutation.isPending}
          >
            <FileText className="h-4 w-4 mr-2" />
            {exportDOCXMutation.isPending ? 'İndiriliyor...' : 'Word İndir'}
          </Button>
          
          <Button asChild>
            <Link to="/knowledge-base">
              <Plus className="h-4 w-4 mr-2" />
              Şablondan Bulgu Ekle
            </Link>
          </Button>
          
          <Button 
            variant="outline"
            disabled={uploadLogoMutation.isPending}
            onClick={() => document.getElementById('logo-upload')?.click()}
          >
            <Upload className="h-4 w-4 mr-2" />
            {uploadLogoMutation.isPending ? 'Yükleniyor...' : 'Logo Yükle'}
          </Button>
          <input
            id="logo-upload"
            type="file"
            accept="image/*"
            onChange={handleLogoUpload}
            className="hidden"
          />
        </div>
      </div>

      {/* Report Info */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Rapor Bilgileri</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            {report.client_name && (
              <div>
                <span className="text-sm text-muted-foreground">Müşteri:</span>
                <p className="font-medium">{report.client_name}</p>
              </div>
            )}
            {report.test_date && (
              <div>
                <span className="text-sm text-muted-foreground">Test Tarihi:</span>
                <p className="font-medium">{report.test_date}</p>
              </div>
            )}
            {report.tester_name && (
              <div>
                <span className="text-sm text-muted-foreground">Test Uzmanı:</span>
                <p className="font-medium">{report.tester_name}</p>
              </div>
            )}
            <div>
              <span className="text-sm text-muted-foreground">Oluşturulma:</span>
              <p className="font-medium">{formatDate(report.created_at)}</p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-base">Bulgu İstatistikleri</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold mb-2">{report.findings.length}</div>
            <p className="text-sm text-muted-foreground mb-4">Toplam bulgu</p>
            
            <div className="space-y-2">
              {Object.entries(riskCounts).map(([risk, count]) => (
                <div key={risk} className="flex justify-between items-center">
                  <Badge variant={risk as any} className="text-xs">
                    {getRiskLevelText(risk)}
                  </Badge>
                  <span className="text-sm font-medium">{count}</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-base">Hızlı İşlemler</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            <Button className="w-full justify-start" size="sm" asChild>
              <Link to={`/create-finding/${reportId}`}>
                <Plus className="h-4 w-4 mr-2" />
                Yeni Bulgu Ekle
              </Link>
            </Button>
            
            <Button variant="outline" className="w-full justify-start" size="sm" asChild>
              <Link to="/knowledge-base">
                <Eye className="h-4 w-4 mr-2" />
                Bilgi Bankası Şablonları
              </Link>
            </Button>
          </CardContent>
        </Card>
      </div>

      {/* Content Tabs */}
      <Tabs defaultValue="findings" className="space-y-6">
        <TabsList>
          <TabsTrigger value="findings">
            Bulgular ({report.findings.length})
          </TabsTrigger>
          <TabsTrigger value="scope">Kapsam</TabsTrigger>
          <TabsTrigger value="methodology">Metodoloji</TabsTrigger>
        </TabsList>

        <TabsContent value="findings" className="space-y-4">
          {report.findings.length > 0 ? (
            sortedFindings.map((finding, index) => (
              <Card key={finding.id} className="hover:shadow-md transition-shadow">
                <CardContent className="p-6">
                  <div className="flex justify-between items-start mb-4">
                    <div className="flex-1">
                      <div className="flex items-center space-x-2 mb-2">
                        <h3 className="text-lg font-semibold text-foreground">
                          {finding.title}
                        </h3>
                        <Badge variant={finding.risk_level as any}>
                          {getRiskLevelText(finding.risk_level)}
                        </Badge>
                        {finding.owasp_category && (
                          <Badge variant="outline" className="text-xs">
                            {getOwaspCategoryText(finding.owasp_category)}
                          </Badge>
                        )}
                      </div>
                      
                      {finding.affected_area && (
                        <p className="text-sm text-muted-foreground mb-2">
                          <strong>Etkilenen Alan:</strong> {finding.affected_area}
                        </p>
                      )}
                      
                      <p className="text-muted-foreground line-clamp-3">
                        {finding.description}
                      </p>
                    </div>
                    
                    <div className="flex items-center space-x-2 ml-4">
                      <Button 
                        variant="outline" 
                        size="sm"
                        onClick={() => handleRepositionFinding(finding.id, 'up')}
                        disabled={index === 0 || reorderFindingsMutation.isPending}
                        title="Yukarı taşı"
                      >
                        <ArrowUp className="h-4 w-4" />
                      </Button>
                      <Button 
                        variant="outline" 
                        size="sm"
                        onClick={() => handleRepositionFinding(finding.id, 'down')}
                        disabled={index === sortedFindings.length - 1 || reorderFindingsMutation.isPending}
                        title="Aşağı taşı"
                      >
                        <ArrowDown className="h-4 w-4" />
                      </Button>
                      <Button 
                        variant="outline" 
                        size="sm"
                        asChild
                      >
                        <Link to={`/findings/${finding.id}/edit`}>
                          <Edit className="h-4 w-4" />
                        </Link>
                      </Button>
                      <Button 
                        variant="destructive" 
                        size="sm"
                        onClick={() => handleDeleteFinding(finding)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                  
                  {(finding.impact || finding.solution) && (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-4 border-t border-border">
                      {finding.impact && (
                        <div>
                          <h4 className="font-medium text-foreground mb-1">Etki</h4>
                          <p className="text-sm text-muted-foreground line-clamp-3">
                            {finding.impact}
                          </p>
                        </div>
                      )}
                      
                      {finding.solution && (
                        <div>
                          <h4 className="font-medium text-foreground mb-1">Çözüm</h4>
                          <p className="text-sm text-muted-foreground line-clamp-3">
                            {finding.solution}
                          </p>
                        </div>
                      )}
                    </div>
                  )}
                </CardContent>
              </Card>
            ))
          ) : (
            <Card>
              <CardContent className="text-center py-12">
                <AlertTriangle className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-lg font-medium text-foreground mb-2">
                  Henüz bulgu eklenmemiş
                </h3>
                <p className="text-muted-foreground mb-6">
                  Bu raporda henüz hiçbir güvenlik bulgusuna rastlanmamış.
                </p>
                <Button asChild>
                  <Link to={`/create-finding/${reportId}`}>
                    <Plus className="h-4 w-4 mr-2" />
                    İlk Bulguyu Ekle
                  </Link>
                </Button>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        <TabsContent value="scope">
          <Card>
            <CardHeader>
              <CardTitle>Test Kapsamı</CardTitle>
            </CardHeader>
            <CardContent>
              {report.scope ? (
                <div className="prose prose-sm dark:prose-invert max-w-none">
                  <pre className="whitespace-pre-wrap text-sm">{report.scope}</pre>
                </div>
              ) : (
                <p className="text-muted-foreground">Test kapsamı belirtilmemiş.</p>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="methodology">
          <Card>
            <CardHeader>
              <CardTitle>Test Metodolojisi</CardTitle>
            </CardHeader>
            <CardContent>
              {report.methodology ? (
                <div className="prose prose-sm dark:prose-invert max-w-none">
                  <pre className="whitespace-pre-wrap text-sm">{report.methodology}</pre>
                </div>
              ) : (
                <p className="text-muted-foreground">Test metodolojisi belirtilmemiş.</p>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Delete Finding Dialog */}
      <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Bulguyu Sil</DialogTitle>
            <DialogDescription>
              "{findingToDelete?.title}" bulgusunu silmek istediğinizden emin misiniz? 
              Bu işlem geri alınamaz.
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
              onClick={confirmDeleteFinding}
              disabled={deleteFindingMutation.isPending}
            >
              {deleteFindingMutation.isPending ? 'Siliniyor...' : 'Sil'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
