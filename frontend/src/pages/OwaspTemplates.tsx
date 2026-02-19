import React, { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { Shield, Plus, Eye, Copy } from 'lucide-react'
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
} from '../components/ui/select'
import { Input } from '../components/ui/input'
import { owaspAPI, reportsAPI, findingsAPI, OwaspTemplate, Report } from '../lib/api'
import { getRiskLevelColor, getRiskLevelText, getOwaspCategoryText } from '../lib/utils'

export function OwaspTemplates() {
  const [selectedTemplate, setSelectedTemplate] = useState<OwaspTemplate | null>(null)
  const [detailDialogOpen, setDetailDialogOpen] = useState(false)
  const [addToReportDialogOpen, setAddToReportDialogOpen] = useState(false)
  const [selectedReportId, setSelectedReportId] = useState<string>('')
  const [customTitle, setCustomTitle] = useState('')
  const [customAffectedArea, setCustomAffectedArea] = useState('')
  
  const queryClient = useQueryClient()

  const { data: templates, isLoading: templatesLoading } = useQuery({
    queryKey: ['owasp-templates'],
    queryFn: () => owaspAPI.getTemplates().then(res => res.data),
  })

  const { data: reports } = useQuery({
    queryKey: ['reports'],
    queryFn: () => reportsAPI.getAll().then(res => res.data),
  })

  const addToReportMutation = useMutation({
    mutationFn: ({ templateId, reportId, title, affectedArea }: {
      templateId: number
      reportId: number
      title?: string
      affectedArea?: string
    }) => findingsAPI.createFromOwaspTemplate(templateId, reportId, title, affectedArea),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['reports'] })
      setAddToReportDialogOpen(false)
      setSelectedTemplate(null)
      setCustomTitle('')
      setCustomAffectedArea('')
      setSelectedReportId('')
    },
  })

  const showDetails = (template: OwaspTemplate) => {
    setSelectedTemplate(template)
    setDetailDialogOpen(true)
  }

  const showAddToReport = (template: OwaspTemplate) => {
    setSelectedTemplate(template)
    setCustomTitle(template.title)
    setAddToReportDialogOpen(true)
  }

  const handleAddToReport = () => {
    if (selectedTemplate && selectedReportId) {
      addToReportMutation.mutate({
        templateId: selectedTemplate.id,
        reportId: parseInt(selectedReportId),
        title: customTitle !== selectedTemplate.title ? customTitle : undefined,
        affectedArea: customAffectedArea || undefined,
      })
    }
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-foreground flex items-center">
          <Shield className="h-8 w-8 mr-3 text-primary" />
          OWASP Top 10 - 2021
        </h1>
        <p className="text-muted-foreground mt-1">
          Hazır güvenlik şablonlarını kullanarak hızlıca bulgular oluşturun
        </p>
      </div>

      {/* Templates Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {templatesLoading ? (
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
        ) : (
          templates?.map((template) => (
            <Card key={template.id} className="hover:shadow-md transition-shadow">
              <CardHeader>
                <div className="flex justify-between items-start">
                  <CardTitle className="text-lg leading-tight">
                    {template.title}
                  </CardTitle>
                  <Badge variant={template.risk_level as any}>
                    {getRiskLevelText(template.risk_level)}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground text-sm mb-4 line-clamp-3">
                  {template.description.substring(0, 150)}...
                </p>
                
                <div className="flex items-center justify-between">
                  <Badge variant="outline" className="text-xs">
                    {getOwaspCategoryText(template.category)}
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

      {/* Template Detail Dialog */}
      <Dialog open={detailDialogOpen} onOpenChange={setDetailDialogOpen}>
        <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center justify-between">
              {selectedTemplate?.title}
              <Badge variant={selectedTemplate?.risk_level as any}>
                {selectedTemplate && getRiskLevelText(selectedTemplate.risk_level)}
              </Badge>
            </DialogTitle>
            <DialogDescription>
              {selectedTemplate && getOwaspCategoryText(selectedTemplate.category)}
            </DialogDescription>
          </DialogHeader>
          
          {selectedTemplate && (
            <div className="space-y-6">
              <div>
                <h4 className="font-semibold text-foreground mb-2">Açıklama</h4>
                <p className="text-sm text-muted-foreground whitespace-pre-line">
                  {selectedTemplate.description}
                </p>
              </div>
              
              {selectedTemplate.impact && (
                <div>
                  <h4 className="font-semibold text-foreground mb-2">Etki</h4>
                  <p className="text-sm text-muted-foreground whitespace-pre-line">
                    {selectedTemplate.impact}
                  </p>
                </div>
              )}
              
              {selectedTemplate.solution && (
                <div>
                  <h4 className="font-semibold text-foreground mb-2">Çözüm Önerisi</h4>
                  <p className="text-sm text-muted-foreground whitespace-pre-line">
                    {selectedTemplate.solution}
                  </p>
                </div>
              )}
            </div>
          )}
          
          <DialogFooter>
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
                  {reports?.map((report) => (
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
    </div>
  )
}
