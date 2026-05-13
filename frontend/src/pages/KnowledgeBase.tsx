import React, { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { Shield, Plus, Eye, Trash2, Tag } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card'
import { Button } from '../components/ui/button'
import { Badge } from '../components/ui/badge'
import { 
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '../components/ui/dialog'
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
  SelectGroup,
  SelectLabel,
} from '../components/ui/select'
import { Input } from '../components/ui/input'
import { Textarea } from '../components/ui/textarea'
import { owaspAPI, reportsAPI, findingsAPI, knowledgeBaseAPI, OwaspTemplate, KnowledgeBaseTemplate, Report } from '../lib/api'
import { getRiskLevelColor, getRiskLevelText, getOwaspCategoryText } from '../lib/utils'

interface CombinedTemplate {
  id: number
  title: string
  description: string
  risk_level: 'critical' | 'high' | 'medium' | 'low' | 'info'
  category?: string
  owasp_category?: string
  impact?: string
  solution?: string
  is_owasp: boolean
  affected_area?: string
  steps_to_reproduce?: string
  request?: string
  response?: string
  cvss_score?: string
  cwe_id?: string
  refs?: string
}

export function KnowledgeBase() {
  const [selectedTemplate, setSelectedTemplate] = useState<CombinedTemplate | null>(null)
  const [detailDialogOpen, setDetailDialogOpen] = useState(false)
  const [addToReportDialogOpen, setAddToReportDialogOpen] = useState(false)
  const [editDialogOpen, setEditDialogOpen] = useState(false)
  const [selectedReportId, setSelectedReportId] = useState<string>('')
  const [customTitle, setCustomTitle] = useState('')
  const [customAffectedArea, setCustomAffectedArea] = useState('')
  const [editFormData, setEditFormData] = useState<{
    title: string
    description: string
    affected_area: string
    impact: string
    solution: string
    risk_level: 'critical' | 'high' | 'medium' | 'low' | 'info'
    owasp_category: string
    steps_to_reproduce: string
    request: string
    response: string
    cvss_score: string
    cwe_id: string
    refs: string
  }>({
    title: '',
    description: '',
    affected_area: '',
    impact: '',
    solution: '',
    risk_level: 'medium',
    owasp_category: '',
    steps_to_reproduce: '',
    request: '',
    response: '',
    cvss_score: '',
    cwe_id: '',
    refs: '',
  })
  const [filterType, setFilterType] = useState<'all' | 'owasp' | 'manual'>('all')
  const [currentPage, setCurrentPage] = useState(1)
  const [pageSize, setPageSize] = useState(10)
  
  const queryClient = useQueryClient()

  const { data: owaspTemplates = [], isLoading: owaspLoading } = useQuery({
    queryKey: ['owasp-templates'],
    queryFn: () => owaspAPI.getTemplates().then((res: any) => res.data),
  })

  const { data: manualTemplates = [], isLoading: manualLoading } = useQuery({
    queryKey: ['knowledge-base-templates'],
    queryFn: () => knowledgeBaseAPI.getAll().then((res: any) => res.data),
  })

  const { data: reports } = useQuery({
    queryKey: ['reports'],
    queryFn: () => reportsAPI.getAll().then((res: any) => res.data),
  })

  // Şablonları birleştir
  const combinedTemplates: CombinedTemplate[] = [
    ...owaspTemplates.map((t: any) => ({
      id: t.id,
      title: t.title,
      description: t.description,
      risk_level: t.risk_level,
      category: t.category,
      impact: t.impact,
      solution: t.solution,
      is_owasp: true,
    })),
    ...manualTemplates.map((t: any) => ({
      id: t.id,
      title: t.title,
      description: t.description,
      risk_level: t.risk_level,
      owasp_category: t.owasp_category,
      impact: t.impact,
      solution: t.solution,
      is_owasp: false,
      affected_area: t.affected_area,
      steps_to_reproduce: t.steps_to_reproduce,
      request: t.request,
      response: t.response,
      cvss_score: t.cvss_score,
      cwe_id: t.cwe_id,
      refs: t.refs,
    }))
  ]

  // Filtreyi uygula
  const filteredTemplates = combinedTemplates.filter(t => {
    if (filterType === 'owasp') return t.is_owasp
    if (filterType === 'manual') return !t.is_owasp
    return true
  })

  // Sayfalama
  const totalTemplates = filteredTemplates.length
  const totalPages = Math.max(1, Math.ceil(totalTemplates / pageSize))
  const safeCurrentPage = Math.min(currentPage, totalPages)
  const startIndex = (safeCurrentPage - 1) * pageSize
  const endIndex = startIndex + pageSize
  const paginatedTemplates = filteredTemplates.slice(startIndex, endIndex)

  const addToReportMutation = useMutation({
    mutationFn: ({ templateId, reportId, title, affectedArea, isOwasp }: {
      templateId: number
      reportId: number
      title?: string
      affectedArea?: string
      isOwasp: boolean
    }) => {
      if (isOwasp) {
        return findingsAPI.createFromOwaspTemplate(templateId, reportId, title, affectedArea)
      } else {
        // Manual (Knowledge Base) template için
        return knowledgeBaseAPI.createFromTemplate(templateId, reportId, title, affectedArea)
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['reports'] })
      setAddToReportDialogOpen(false)
      setSelectedTemplate(null)
      setCustomTitle('')
      setCustomAffectedArea('')
      setSelectedReportId('')
    },
  })

  const deleteManualTemplateMutation = useMutation({
    mutationFn: (templateId: number) => knowledgeBaseAPI.delete(templateId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['knowledge-base-templates'] })
      setDetailDialogOpen(false)
      setSelectedTemplate(null)
    },
  })

  const editTemplateMutation = useMutation({
    mutationFn: (templateId: number) => knowledgeBaseAPI.update(templateId, editFormData),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['knowledge-base-templates'] })
      setEditDialogOpen(false)
      setSelectedTemplate(null)
      alert('Şablon başarıyla güncellendi')
    },
    onError: (error: any) => {
      console.error('Edit hatası:', error)
      alert('Şablon güncellenirken hata oluştu')
    },
  })

  const showDetails = (template: CombinedTemplate) => {
    setSelectedTemplate(template)
    setDetailDialogOpen(true)
  }

  const showAddToReport = (template: CombinedTemplate) => {
    setSelectedTemplate(template)
    setCustomTitle(template.title)
    setAddToReportDialogOpen(true)
  }

  const showEditDialog = (template: CombinedTemplate) => {
    if (!template.is_owasp && template.id) {
      setSelectedTemplate(template)
      setEditFormData({
        title: template.title,
        description: template.description,
        affected_area: template.affected_area || '',
        impact: template.impact || '',
        solution: template.solution || '',
        risk_level: template.risk_level as 'critical' | 'high' | 'medium' | 'low' | 'info',
        owasp_category: template.owasp_category || '',
        steps_to_reproduce: template.steps_to_reproduce || '',
        request: template.request || '',
        response: template.response || '',
        cvss_score: template.cvss_score || '',
        cwe_id: template.cwe_id || '',
        refs: template.refs || '',
      })
      setEditDialogOpen(true)
    }
  }

  const handleAddToReport = () => {
    if (selectedTemplate && selectedReportId) {
      addToReportMutation.mutate({
        templateId: selectedTemplate.id,
        reportId: parseInt(selectedReportId),
        title: customTitle !== selectedTemplate.title ? customTitle : undefined,
        affectedArea: customAffectedArea || undefined,
        isOwasp: selectedTemplate.is_owasp,
      })
    }
  }

  const handleDeleteTemplate = () => {
    if (selectedTemplate && !selectedTemplate.is_owasp) {
      deleteManualTemplateMutation.mutate(selectedTemplate.id)
    }
  }

  const isLoading = owaspLoading || manualLoading

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-foreground flex items-center">
          <Shield className="h-8 w-8 mr-3 text-primary" />
          Bilgi Bankası
        </h1>
        <p className="text-muted-foreground mt-1">
          Hazır şablonları ve kayıtlı bulgularınızı kullanarak hızlıca yeni bulgular oluşturun
        </p>
      </div>

      {/* Filter */}
      <div className="flex flex-wrap gap-2 items-center justify-between">
        <div className="flex gap-2">
        <Button
          variant={filterType === 'all' ? 'default' : 'outline'}
          onClick={() => setFilterType('all')}
          className="gap-2"
        >
          <Shield className="h-4 w-4" />
          Tüm Şablonlar ({filteredTemplates.length})
        </Button>
        <Button
          variant={filterType === 'owasp' ? 'default' : 'outline'}
          onClick={() => setFilterType('owasp')}
          className="gap-2"
        >
          <Tag className="h-4 w-4" />
          OWASP Top 10 ({owaspTemplates.length})
        </Button>
        <Button
          variant={filterType === 'manual' ? 'default' : 'outline'}
          onClick={() => setFilterType('manual')}
          className="gap-2"
        >
          <Plus className="h-4 w-4" />
          Kayıtlı Şablonlar ({manualTemplates.length})
        </Button>
        </div>

        {/* Sayfa başına kayıt seçimi */}
        <div className="flex items-center gap-2">
          <span className="text-xs text-muted-foreground">Sayfa başına:</span>
          <Select
            value={pageSize.toString()}
            onValueChange={(value) => {
              setPageSize(parseInt(value, 10))
              setCurrentPage(1)
            }}
          >
            <SelectTrigger className="h-8 w-[90px]">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="5">5</SelectItem>
              <SelectItem value="10">10</SelectItem>
              <SelectItem value="20">20</SelectItem>
              <SelectItem value="100">100</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Templates Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {isLoading ? (
          [...Array(10)].map((_, i) => (
            <Card key={i} className="animate-pulse">
              <CardContent className="p-6">
                <div className="h-6 bg-muted rounded w-3/4 mb-2"></div>
                <div className="h-4 bg-muted rounded w-1/2 mb-4"></div>
                <div className="h-20 bg-muted rounded mb-4"></div>
                <div className="flex space-x-2">
                  <div className="h-8 bg-muted rounded w-20"></div>
                  <div className="h-8 bg-muted rounded w-20"></div>
                </div>
              </CardContent>
            </Card>
          ))
        ) : filteredTemplates.length === 0 ? (
          <Card className="col-span-full">
            <CardContent className="p-12 text-center">
              <Shield className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
              <p className="text-muted-foreground">
                {filterType === 'manual' ? 'Henüz kaydedilmiş şablon yok' : 'Şablon bulunamadı'}
              </p>
            </CardContent>
          </Card>
        ) : (
          paginatedTemplates.map((template) => (
            <Card key={`${template.is_owasp ? 'owasp' : 'manual'}-${template.id}`} className="hover:shadow-md transition-shadow">
              <CardHeader>
                <div className="flex justify-between items-start gap-2">
                  <div className="flex-1">
                    <CardTitle className="text-lg leading-tight">
                      {template.title}
                    </CardTitle>
                    {/* Tüm kartlarda aynı hizada ikinci satır */}
                    <p className="text-xs text-muted-foreground mt-1 truncate">
                      {template.affected_area
                        ? template.affected_area
                        : template.is_owasp
                          ? getOwaspCategoryText(template.category!)
                          : (template.owasp_category
                              ? getOwaspCategoryText(template.owasp_category)
                              : 'Genel')}
                    </p>
                  </div>
                  <div className="flex gap-1 flex-shrink-0 items-center">
                    <Badge>
                      {getRiskLevelText(template.risk_level)}
                    </Badge>
                    {template.is_owasp && (
                      <Badge>
                        OWASP
                      </Badge>
                    )}
                    {!template.is_owasp && (
                      <Badge>
                        Kayıtlı
                      </Badge>
                    )}
                    {!template.is_owasp && (
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-7 w-7 text-destructive hover:text-destructive"
                        onClick={() => {
                          if (window.confirm(`"${template.title}" şablonunu silmek istediğinize emin misiniz?`)) {
                            deleteManualTemplateMutation.mutate(template.id)
                          }
                        }}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    )}
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground text-sm mb-4 line-clamp-3">
                  {template.description.substring(0, 150)}...
                </p>
                
                <div className="flex items-center justify-between">
                  <Badge className="text-xs">
                    {template.is_owasp 
                      ? getOwaspCategoryText(template.category!)
                      : (template.owasp_category ? getOwaspCategoryText(template.owasp_category) : 'Genel')
                    }
                  </Badge>
                  
                  <div className="flex space-x-2">
                    <Button 
                      variant="outline" 
                      size="sm"
                      onClick={() => showDetails(template)}
                    >
                      <Eye className="h-4 w-4 mr-1" />
                      Detay
                    </Button>
                    
                    <Button 
                      size="sm"
                      onClick={() => showAddToReport(template)}
                    >
                      <Plus className="h-4 w-4 mr-1" />
                      Rapora Ekle
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>

      {/* Pagination Controls */}
      {totalTemplates > 0 && (
        <div className="flex items-center justify-between text-sm text-muted-foreground">
          <span>
            Toplam {totalTemplates} şablondan {startIndex + 1}-{Math.min(endIndex, totalTemplates)} arası gösteriliyor
          </span>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              disabled={safeCurrentPage === 1}
              onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
            >
              Önceki
            </Button>
            <span>
              Sayfa {safeCurrentPage} / {totalPages}
            </span>
            <Button
              variant="outline"
              size="sm"
              disabled={safeCurrentPage === totalPages}
              onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
            >
              Sonraki
            </Button>
          </div>
        </div>
      )}

      {/* Template Detail Dialog */}
      <Dialog open={detailDialogOpen} onOpenChange={setDetailDialogOpen}>
        <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center justify-between gap-4">
              <div className="flex-1">
                {selectedTemplate?.title}
              </div>
              <div className="flex gap-2 flex-shrink-0">
                <Badge>
                  {selectedTemplate && getRiskLevelText(selectedTemplate.risk_level)}
                </Badge>
                {selectedTemplate?.is_owasp && (
                  <Badge>
                    OWASP
                  </Badge>
                )}
                {!selectedTemplate?.is_owasp && (
                  <Badge>
                    Kayıtlı
                  </Badge>
                )}
              </div>
            </DialogTitle>
            <DialogDescription>
              {selectedTemplate?.is_owasp 
                ? getOwaspCategoryText(selectedTemplate.category!)
                : (selectedTemplate?.owasp_category ? getOwaspCategoryText(selectedTemplate.owasp_category) : 'Genel Şablon')
              }
            </DialogDescription>
          </DialogHeader>
          
          {selectedTemplate && (
            <div className="space-y-6">
              <div>
                <h4 className="font-semibold text-foreground mb-2">Bulgu Açıklaması</h4>
                <p className="text-sm text-muted-foreground whitespace-pre-line">
                  {selectedTemplate.description}
                </p>
              </div>
              
              {selectedTemplate.impact && (
                <div>
                  <h4 className="font-semibold text-foreground mb-2">Bulgu Etkisi</h4>
                  <p className="text-sm text-muted-foreground whitespace-pre-line">
                    {selectedTemplate.impact}
                  </p>
                </div>
              )}
              
              {selectedTemplate.solution && (
                <div>
                  <h4 className="font-semibold text-foreground mb-2">Bulgu Çözümü</h4>
                  <p className="text-sm text-muted-foreground whitespace-pre-line">
                    {selectedTemplate.solution}
                  </p>
                </div>
              )}

              {!selectedTemplate.is_owasp && (selectedTemplate as any).steps_to_reproduce && (
                <div>
                  <h4 className="font-semibold text-foreground mb-2">Tekrarlama Adımları</h4>
                  <p className="text-sm text-muted-foreground whitespace-pre-line">
                    {(selectedTemplate as any).steps_to_reproduce}
                  </p>
                </div>
              )}

              {(selectedTemplate as any).refs && (
                <div>
                  <h4 className="font-semibold text-foreground mb-2">Referanslar</h4>
                  <p className="text-sm text-muted-foreground whitespace-pre-line">
                    {(selectedTemplate as any).refs}
                  </p>
                </div>
              )}

              {!selectedTemplate.is_owasp && selectedTemplate.affected_area && (
                <div>
                  <h4 className="font-semibold text-foreground mb-2">Etkilenen Alan</h4>
                  <p className="text-sm text-muted-foreground">
                    {selectedTemplate.affected_area}
                  </p>
                </div>
              )}

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm text-muted-foreground">
                <div>
                  <h4 className="font-semibold text-foreground mb-1">Bulgu Seviyesi</h4>
                  <p>{getRiskLevelText(selectedTemplate.risk_level)}</p>
                </div>
                {!selectedTemplate.is_owasp && (selectedTemplate as any).cvss_score && (
                  <div>
                    <h4 className="font-semibold text-foreground mb-1">CVSS Skoru</h4>
                    <p className="font-mono">{(selectedTemplate as any).cvss_score}</p>
                  </div>
                )}
                {!selectedTemplate.is_owasp && (selectedTemplate as any).cwe_id && (
                  <div>
                    <h4 className="font-semibold text-foreground mb-1">CWE ID</h4>
                    <p>{(selectedTemplate as any).cwe_id}</p>
                  </div>
                )}
              </div>
            </div>
          )}
          
          <DialogFooter>
            {selectedTemplate && !selectedTemplate.is_owasp && (
              <>
                <Button 
                  variant="outline"
                  onClick={() => {
                    setDetailDialogOpen(false)
                    showEditDialog(selectedTemplate)
                  }}
                >
                  Düzenle
                </Button>
                <Button 
                  variant="destructive"
                  onClick={handleDeleteTemplate}
                  disabled={deleteManualTemplateMutation.isPending}
                >
                  <Trash2 className="h-4 w-4 mr-1" />
                  Şablonu Sil
                </Button>
              </>
            )}
            <Button variant="outline" onClick={() => setDetailDialogOpen(false)}>
              Kapat
            </Button>
            <Button onClick={() => {
              setDetailDialogOpen(false)
              if (selectedTemplate) showAddToReport(selectedTemplate)
            }}>
              <Plus className="h-4 w-4 mr-1" />
              Rapora Ekle
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Add to Report Dialog */}
      <Dialog open={addToReportDialogOpen} onOpenChange={setAddToReportDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Rapora Bulgu Ekle</DialogTitle>
            <DialogDescription>
              "{selectedTemplate?.title}" şablonunu hangi rapora eklemek istiyorsunuz?
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-2">Rapor Seçin</label>
              <Select value={selectedReportId} onValueChange={setSelectedReportId}>
                <SelectTrigger>
                  <SelectValue placeholder="Rapor seçin..." />
                </SelectTrigger>
                <SelectContent>
                  {reports?.map((report: any) => (
                    <SelectItem key={report.id} value={report.id.toString()}>
                      {report.title}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            
            <div>
              <label className="block text-sm font-medium mb-2">Bulgu Başlığı (İsteğe bağlı)</label>
              <Input
                value={customTitle}
                onChange={(e) => setCustomTitle(e.target.value)}
                placeholder="Varsayılan başlık kullanılacak"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium mb-2">Etkilenen Alan (İsteğe bağlı)</label>
              <Input
                value={customAffectedArea}
                onChange={(e) => setCustomAffectedArea(e.target.value)}
                placeholder="Örn: https://example.com/login"
              />
            </div>
          </div>
          
          <DialogFooter>
            <Button 
              variant="outline" 
              onClick={() => setAddToReportDialogOpen(false)}
            >
              İptal
            </Button>
            <Button 
              onClick={handleAddToReport}
              disabled={!selectedReportId || addToReportMutation.isPending}
            >
              {addToReportMutation.isPending ? 'Ekleniyor...' : 'Rapora Ekle'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Edit Knowledge Base Template Dialog */}
      <Dialog open={editDialogOpen} onOpenChange={setEditDialogOpen}>
        <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Şablonu Düzenle</DialogTitle>
            <DialogDescription>
              Bilgi Bankası şablonunun detaylarını güncelleyin
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-2">Başlık</label>
              <Input
                value={editFormData.title}
                onChange={(e) => setEditFormData({ ...editFormData, title: e.target.value })}
                placeholder="Şablon başlığı"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium mb-2">Açıklama</label>
              <Textarea
                value={editFormData.description}
                onChange={(e) => setEditFormData({ ...editFormData, description: e.target.value })}
                placeholder="Bulgu açıklaması"
                rows={3}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-2">Bulgu Seviyesi</label>
                <Select value={editFormData.risk_level} onValueChange={(value) => setEditFormData({ ...editFormData, risk_level: value as any })}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="critical">Kritik</SelectItem>
                    <SelectItem value="high">Yüksek</SelectItem>
                    <SelectItem value="medium">Orta</SelectItem>
                    <SelectItem value="low">Düşük</SelectItem>
                    <SelectItem value="info">Bilgi</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">OWASP Kategorisi</label>
                <Input
                  value={editFormData.owasp_category}
                  onChange={(e) => setEditFormData({ ...editFormData, owasp_category: e.target.value })}
                  placeholder="Örn: broken_access_control"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">Etkilenen Alan</label>
              <Input
                value={editFormData.affected_area}
                onChange={(e) => setEditFormData({ ...editFormData, affected_area: e.target.value })}
                placeholder="Örn: /admin, /api/users"
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">Bulgu Etkisi</label>
              <Textarea
                value={editFormData.impact}
                onChange={(e) => setEditFormData({ ...editFormData, impact: e.target.value })}
                placeholder="Bulgunun sistem üzerindeki etkisi"
                rows={2}
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">Çözüm Önerisi</label>
              <Textarea
                value={editFormData.solution}
                onChange={(e) => setEditFormData({ ...editFormData, solution: e.target.value })}
                placeholder="Sorunu çözmek için öneriler"
                rows={2}
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">Tekrarlama Adımları</label>
              <Textarea
                value={editFormData.steps_to_reproduce}
                onChange={(e) => setEditFormData({ ...editFormData, steps_to_reproduce: e.target.value })}
                placeholder="Açık bulguyu adım adım nasıl tekrarlayabilirim"
                rows={2}
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">Request Örneği</label>
              <Textarea
                value={editFormData.request}
                onChange={(e) => setEditFormData({ ...editFormData, request: e.target.value })}
                placeholder="HTTP request örneği veya API isteği detayları"
                rows={2}
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">Response Örneği</label>
              <Textarea
                value={editFormData.response}
                onChange={(e) => setEditFormData({ ...editFormData, response: e.target.value })}
                placeholder="HTTP response örneği veya API yanıtı detayları"
                rows={2}
              />
            </div>

            <div className="grid grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium mb-2">CVSS Skoru</label>
                <Input
                  value={editFormData.cvss_score}
                  onChange={(e) => setEditFormData({ ...editFormData, cvss_score: e.target.value })}
                  placeholder="Örn: 7.5"
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">CWE ID</label>
                <Input
                  value={editFormData.cwe_id}
                  onChange={(e) => setEditFormData({ ...editFormData, cwe_id: e.target.value })}
                  placeholder="Örn: CWE-79"
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">Referanslar</label>
                <Input
                  value={editFormData.refs}
                  onChange={(e) => setEditFormData({ ...editFormData, refs: e.target.value })}
                  placeholder="URL veya referans bilgileri"
                />
              </div>
            </div>
          </div>
          
          <DialogFooter>
            <Button variant="outline" onClick={() => setEditDialogOpen(false)}>
              İptal
            </Button>
            <Button 
              onClick={() => {
                if (selectedTemplate?.id) {
                  editTemplateMutation.mutate(selectedTemplate.id)
                }
              }}
              disabled={editTemplateMutation.isPending}
            >
              {editTemplateMutation.isPending ? 'Güncelleniyor...' : 'Şablonu Güncelle'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
