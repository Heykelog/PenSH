import React, { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { useForm, Controller } from 'react-hook-form'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { ArrowLeft, Upload, X, ExternalLink, Info } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card'
import { Button } from '../components/ui/button'
import { Input } from '../components/ui/input'
import { Textarea } from '../components/ui/textarea'
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '../components/ui/select'
import { findingsAPI, reportsAPI, CreateFindingData, POCImage, API_BASE_URL } from '../lib/api'
import { getOwaspReference, getCweIds, getCvssVector } from '../lib/owasp-references'

const riskLevels = [
  { value: 'critical', label: 'Kritik' },
  { value: 'high', label: 'Yüksek' },
  { value: 'medium', label: 'Orta' },
  { value: 'low', label: 'Düşük' },
  { value: 'info', label: 'Bilgi' },
] as const

const owaspCategories = [
  { value: 'broken_access_control', label: 'A01:2021 - Erişim Kontrolünün Kötüye Kullanımı' },
  { value: 'cryptographic_failures', label: 'A02:2021 - Kriptografik Hatalar' },
  { value: 'injection', label: 'A03:2021 - Enjeksiyon' },
  { value: 'insecure_design', label: 'A04:2021 - Güvenli Olmayan Tasarım' },
  { value: 'security_misconfiguration', label: 'A05:2021 - Güvenlik Yanlış Yapılandırması' },
  { value: 'vulnerable_components', label: 'A06:2021 - Güvenlik Açıklı ve Güncel Olmayan Bileşenler' },
  { value: 'authentication_failures', label: 'A07:2021 - Kimlik Doğrulama Hataları' },
  { value: 'software_integrity_failures', label: 'A08:2021 - Yazılım ve Veri Bütünlüğü Hataları' },
  { value: 'logging_monitoring_failures', label: 'A09:2021 - Güvenlik Günlüğü ve İzleme Hataları' },
  { value: 'ssrf', label: 'A10:2021 - Sunucu Taraflı İstek Sahteciliği' },
] as const

export function EditFinding() {
  const { findingId } = useParams<{ findingId: string }>()
  const navigate = useNavigate()
  const queryClient = useQueryClient()
  const [uploadedImages, setUploadedImages] = useState<File[]>([])
  const [existingImages, setExistingImages] = useState<POCImage[]>([])
  const [uploadingImages, setUploadingImages] = useState(false)
  
  const { register, handleSubmit, formState: { errors }, setValue, watch, control, reset } = useForm<CreateFindingData>({
    defaultValues: {
      risk_level: 'medium',
    }
  })

  const selectedOwaspCategory = watch('owasp_category')

  // OWASP referans bilgilerini al
  const owaspReference = selectedOwaspCategory ? getOwaspReference(selectedOwaspCategory) : null

  // Fetch finding data
  const { data: finding, isLoading: findingLoading } = useQuery({
    queryKey: ['finding', findingId],
    queryFn: () => findingsAPI.getById(parseInt(findingId!)).then(res => res.data),
    enabled: !!findingId,
  })

  // Fetch report data
  const { data: report, isLoading: reportLoading } = useQuery({
    queryKey: ['report', finding?.report_id],
    queryFn: () => reportsAPI.getById(finding!.report_id).then(res => res.data),
    enabled: !!finding?.report_id,
  })

  // Load existing POC images
  useEffect(() => {
    if (finding?.poc_images) {
      setExistingImages(finding.poc_images)
    }
  }, [finding])

  // Populate form when finding data is loaded
  useEffect(() => {
    if (finding) {
      reset({
        title: finding.title,
        description: finding.description,
        affected_area: finding.affected_area || '',
        risk_level: finding.risk_level,
        owasp_category: finding.owasp_category || '',
        solution: finding.solution || '',
        steps_to_reproduce: finding.steps_to_reproduce || '',
        impact: finding.impact || '',
        request: finding.request || '',
        response: finding.response || '',
        cvss_score: finding.cvss_score || '',
        cwe_id: finding.cwe_id || '',
        refs: finding.refs || '',
        report_id: finding.report_id,
      })
    }
  }, [finding, reset])

  const updateMutation = useMutation({
    mutationFn: (data: CreateFindingData) => findingsAPI.update(parseInt(findingId!), data),
    onSuccess: () => {
      // Upload new POC images after finding is updated
      if (uploadedImages.length > 0) {
        uploadPOCImages(parseInt(findingId!))
      } else {
        queryClient.invalidateQueries({ queryKey: ['finding', findingId] })
        queryClient.invalidateQueries({ queryKey: ['report', finding?.report_id] })
        navigate(`/reports/${finding?.report_id}`)
      }
    },
  })

  const uploadPOCImages = async (findingId: number) => {
    setUploadingImages(true)
    try {
      const uploadPromises = uploadedImages.map(async (file) => {
        const formData = new FormData()
        formData.append('file', file)
        
        const response = await fetch(`${API_BASE_URL}/findings/${findingId}/poc-images`, {
          method: 'POST',
          body: formData,
        })
        
        if (!response.ok) {
          throw new Error('Image upload failed')
        }
        
        return response.json()
      })
      
      await Promise.all(uploadPromises)
      queryClient.invalidateQueries({ queryKey: ['finding', findingId] })
      queryClient.invalidateQueries({ queryKey: ['report', finding?.report_id] })
      navigate(`/reports/${finding?.report_id}`)
    } catch (error) {
      console.error('Error uploading images:', error)
      alert('Resim yükleme sırasında hata oluştu')
    } finally {
      setUploadingImages(false)
    }
  }

  const handleImageUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(event.target.files || [])
    const imageFiles = files.filter(file => file.type.startsWith('image/'))
    setUploadedImages(prev => [...prev, ...imageFiles])
  }

  const removeImage = (index: number) => {
    setUploadedImages(prev => prev.filter((_, i) => i !== index))
  }

  // OWASP kategorisi seçildiğinde otomatik doldur
  const handleOwaspCategoryChange = (category: string) => {
    setValue('owasp_category', category)
    
    // Otomatik CWE ID ve CVSS Vector doldur
    const cweIds = getCweIds(category)
    const cvssVector = getCvssVector(category)
    
    if (cweIds.length > 0) {
      setValue('cwe_id', cweIds[0]) // İlk CWE ID'yi doldur
    }
    
    if (cvssVector) {
      setValue('cvss_score', cvssVector)
    }
  }

  const removeExistingImage = async (imageId: number) => {
    try {
      await fetch(`${API_BASE_URL}/poc-images/${imageId}`, {
        method: 'DELETE',
      })
      setExistingImages(prev => prev.filter(img => img.id !== imageId))
    } catch (error) {
      console.error('Error deleting image:', error)
      alert('Resim silme sırasında hata oluştu')
    }
  }

  const onSubmit = (data: CreateFindingData) => {
    // Clean up empty strings to undefined for optional fields
    const cleanedData = {
      ...data,
      report_id: finding!.report_id,
      affected_area: data.affected_area || undefined,
      owasp_category: data.owasp_category || undefined,
      solution: data.solution || undefined,
      steps_to_reproduce: data.steps_to_reproduce || undefined,
      impact: data.impact || undefined,
      request: data.request || undefined,
      response: data.response || undefined,
      cvss_score: data.cvss_score || undefined,
      cwe_id: data.cwe_id || undefined,
      refs: data.refs || undefined,
    }
    
    updateMutation.mutate(cleanedData)
  }

  if (findingLoading || reportLoading) {
    return <div className="text-center py-12">Yükleniyor...</div>
  }

  if (!finding || !report) {
    return (
      <div className="text-center py-12">
        <p className="text-muted-foreground mb-4">Bulgu bulunamadı</p>
        <Button onClick={() => navigate('/reports')}>Raporlara Dön</Button>
      </div>
    )
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Header */}
      <div>
        <div className="flex items-center space-x-2 mb-2">
          <Button variant="ghost" size="sm" onClick={() => navigate(`/reports/${finding.report_id}`)}>
            <ArrowLeft className="h-4 w-4 mr-1" />
            Geri
          </Button>
        </div>
        <h1 className="text-3xl font-bold text-foreground">Bulgu Düzenle</h1>
        <p className="text-muted-foreground mt-1">
          "{report.title}" raporundaki "{finding.title}" bulgusunu düzenleyin
        </p>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        {/* Basic Information */}
        <Card>
          <CardHeader>
            <CardTitle>Temel Bilgiler</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <label htmlFor="title" className="block text-sm font-medium mb-2">
                Bulgu Başlığı *
              </label>
              <Input
                id="title"
                {...register('title', { required: 'Bulgu başlığı gereklidir' })}
                placeholder="Örn: SQL Injection Zafiyeti"
              />
              {errors.title && (
                <p className="text-sm text-destructive mt-1">{errors.title.message}</p>
              )}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label htmlFor="risk_level" className="block text-sm font-medium mb-2">
                  Risk Seviyesi *
                </label>
                <Controller
                  name="risk_level"
                  control={control}
                  render={({ field }) => (
                    <Select
                      {...field}
                      onValueChange={field.onChange}
                      defaultValue={field.value}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Risk seviyesi seçin" />
                      </SelectTrigger>
                      <SelectContent>
                        {riskLevels.map((level) => (
                          <SelectItem key={level.value} value={level.value}>
                            {level.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  )}
                />
              </div>

              <div>
                <label htmlFor="owasp_category" className="block text-sm font-medium mb-2">
                  OWASP Kategorisi
                </label>
                <Controller
                  name="owasp_category"
                  control={control}
                  render={({ field }) => (
                                          <Select
                        {...field}
                        onValueChange={(value) => {
                          field.onChange(value)
                          handleOwaspCategoryChange(value)
                        }}
                        value={field.value ?? ""}
                      >
                      <SelectTrigger>
                        <SelectValue placeholder="OWASP kategorisi seçin (isteğe bağlı)" />
                      </SelectTrigger>
                      <SelectContent>
                        {owaspCategories.map((category) => (
                          <SelectItem key={category.value} value={category.value}>
                            {category.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  )}
                />
              </div>
            </div>

            <div>
              <label htmlFor="affected_area" className="block text-sm font-medium mb-2">
                Etkilenen Alan
              </label>
              <Input
                id="affected_area"
                {...register('affected_area')}
                placeholder="Örn: https://example.com/login, /api/users endpoint"
              />
            </div>
                      </CardContent>
          </Card>

          {/* OWASP Reference Information */}
          {owaspReference && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Info className="h-5 w-5" />
                  OWASP Referans Bilgileri
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="bg-blue-50 dark:bg-blue-950/20 p-4 rounded-lg">
                  <h4 className="font-semibold text-blue-900 dark:text-blue-100 mb-2">
                    {owaspReference.id} - {owaspReference.title}
                  </h4>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                    <div>
                      <strong className="text-blue-900 dark:text-blue-100">CWE ID'leri:</strong>
                      <div className="flex flex-wrap gap-1 mt-1">
                        {owaspReference.cweIds.map((cweId) => (
                          <span key={cweId} className="bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200 px-2 py-1 rounded text-xs">
                            {cweId}
                          </span>
                        ))}
                      </div>
                    </div>
                    
                    <div>
                      <strong className="text-blue-900 dark:text-blue-100">CVSS Vector:</strong>
                      <p className="text-blue-800 dark:text-blue-200 font-mono text-xs mt-1">
                        {owaspReference.cvssVector}
                      </p>
                    </div>
                  </div>

                  <div className="mt-4">
                    <strong className="text-blue-900 dark:text-blue-100">Referanslar:</strong>
                    <div className="flex flex-wrap gap-2 mt-2">
                      <a 
                        href={owaspReference.references.owasp} 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1 text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-200 text-sm"
                      >
                        <ExternalLink className="h-3 w-3" />
                        OWASP
                      </a>
                      <a 
                        href={owaspReference.references.cwe[0]} 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1 text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-200 text-sm"
                      >
                        <ExternalLink className="h-3 w-3" />
                        CWE
                      </a>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Description */}
        <Card>
          <CardHeader>
            <CardTitle>Açıklama ve Detaylar</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <label htmlFor="description" className="block text-sm font-medium mb-2">
                Bulgu Açıklaması *
              </label>
              <Textarea
                id="description"
                {...register('description', { required: 'Bulgu açıklaması gereklidir' })}
                placeholder="Güvenlik açığının detaylı açıklaması..."
                rows={6}
              />
              {errors.description && (
                <p className="text-sm text-destructive mt-1">{errors.description.message}</p>
              )}
            </div>

            <div>
              <label htmlFor="impact" className="block text-sm font-medium mb-2">
                Etki
              </label>
              <Textarea
                id="impact"
                {...register('impact')}
                placeholder="Bu zafiyetin sisteme ve organizasyona olan etkisi..."
                rows={4}
              />
            </div>

            <div>
              <label htmlFor="steps_to_reproduce" className="block text-sm font-medium mb-2">
                Tekrarlama Adımları
              </label>
              <Textarea
                id="steps_to_reproduce"
                {...register('steps_to_reproduce')}
                placeholder="1. Web sitesine gidin&#10;2. Login sayfasını açın&#10;3. SQL injection payload'ı deneyin..."
                rows={6}
              />
              <p className="text-xs text-muted-foreground mt-2">
                💡 İpucu: Adımlarına resim eklemek istiyorsanız, adımın sonuna resim dosya adını yazabilirsiniz. Örn: "1- uygulamaya giriş yapılır /screenshot1.png"
              </p>
            </div>

            <div>
              <label htmlFor="request" className="block text-sm font-medium mb-2">
                Request Örneği
              </label>
              <Textarea
                id="request"
                {...register('request')}
                placeholder="HTTP request örneğini yazın (GET, POST vb)..."
                rows={4}
              />
            </div>

            <div>
              <label htmlFor="response" className="block text-sm font-medium mb-2">
                Response Örneği
              </label>
              <Textarea
                id="response"
                {...register('response')}
                placeholder="HTTP response örneğini yazın..."
                rows={4}
              />
            </div>
          </CardContent>
        </Card>

        {/* Solution */}
        <Card>
          <CardHeader>
            <CardTitle>Çözüm ve Teknik Bilgiler</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <label htmlFor="solution" className="block text-sm font-medium mb-2">
                Çözüm Önerisi
              </label>
              <Textarea
                id="solution"
                {...register('solution')}
                placeholder="Bu zafiyetin nasıl giderileceğine dair öneriler..."
                rows={6}
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label htmlFor="cvss_score" className="block text-sm font-medium mb-2">
                  CVSS Skoru
                </label>
                                  <Input
                    id="cvss_score"
                    {...register('cvss_score')}
                    placeholder="Örn: 7.5 (AV:N/AC:L/PR:N/UI:N/S:U/C:H/I:N/A:N)"
                  />
                  {owaspReference && (
                    <p className="text-xs text-muted-foreground mt-1">
                      Otomatik dolduruldu: {owaspReference.cvssVector}
                    </p>
                  )}
              </div>

              <div>
                <label htmlFor="cwe_id" className="block text-sm font-medium mb-2">
                  CWE ID
                </label>
                                  <Input
                    id="cwe_id"
                    {...register('cwe_id')}
                    placeholder="Örn: CWE-89"
                  />
                  {owaspReference && (
                    <p className="text-xs text-muted-foreground mt-1">
                      Otomatik dolduruldu: {owaspReference.cweIds[0]}
                    </p>
                  )}
              </div>
            </div>

            <div>
              <label htmlFor="refs" className="block text-sm font-medium mb-2">
                Referanslar
              </label>
              <Textarea
                id="refs"
                {...register('refs')}
                placeholder="OWASP, CWE, NIST ve diğer referans linkleri..."
                rows={4}
              />
              {owaspReference && (
                <div className="mt-2 p-3 bg-blue-50 dark:bg-blue-950/20 rounded-lg">
                  <p className="text-xs text-blue-600 dark:text-blue-400 mb-1">
                    <strong>Önerilen referanslar:</strong>
                  </p>
                  <p className="text-xs text-blue-800 dark:text-blue-200">
                    OWASP: {owaspReference.references.owasp}
                  </p>
                  <p className="text-xs text-blue-800 dark:text-blue-200">
                    CWE: {owaspReference.references.cwe[0]}
                  </p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* POC Images */}
        <Card>
          <CardHeader>
            <CardTitle>POC Ekran Görüntüleri</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <label htmlFor="poc-images" className="block text-sm font-medium mb-2">
                Yeni Kanıt Ekran Görüntüleri Ekle
              </label>
              <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
                <input
                  id="poc-images"
                  type="file"
                  multiple
                  accept="image/*"
                  onChange={handleImageUpload}
                  className="hidden"
                />
                <label htmlFor="poc-images" className="cursor-pointer">
                  <Upload className="h-8 w-8 mx-auto mb-2 text-gray-400" />
                  <p className="text-sm text-gray-600">
                    Resim dosyalarını seçin veya buraya sürükleyin
                  </p>
                  <p className="text-xs text-gray-500 mt-1">
                    PNG, JPG, JPEG formatları desteklenir
                  </p>
                </label>
              </div>
            </div>

            {/* Existing Images */}
            {existingImages.length > 0 && (
              <div>
                <h4 className="text-sm font-medium mb-2">Mevcut Resimler ({existingImages.length})</h4>
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                  {existingImages.map((image, index) => (
                    <div key={image.id} className="relative group">
                      <div className="bg-gray-100 rounded-lg overflow-hidden flex items-center justify-center" style={{maxHeight: '200px'}}>
                        <img
                          src={`${API_BASE_URL}/poc-images/${image.id}/download`}
                          alt={`POC ${index + 1}`}
                          className="max-w-full max-h-full object-contain"
                        />
                      </div>
                      <button
                        type="button"
                        onClick={() => removeExistingImage(image.id)}
                        className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity"
                      >
                        <X className="h-3 w-3" />
                      </button>
                      <p className="text-xs text-gray-600 mt-1 truncate">
                        {image.original_filename}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* New Uploaded Images Preview */}
            {uploadedImages.length > 0 && (
              <div>
                <h4 className="text-sm font-medium mb-2">Yeni Eklenen Resimler ({uploadedImages.length})</h4>
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                  {uploadedImages.map((file, index) => (
                    <div key={index} className="relative group">
                      <div className="bg-gray-100 rounded-lg overflow-hidden flex items-center justify-center" style={{maxHeight: '200px'}}>
                        <img
                          src={URL.createObjectURL(file)}
                          alt={`POC ${index + 1}`}
                          className="max-w-full max-h-full object-contain"
                        />
                      </div>
                      <button
                        type="button"
                        onClick={() => removeImage(index)}
                        className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity"
                      >
                        <X className="h-3 w-3" />
                      </button>
                      <p className="text-xs text-gray-600 mt-1 truncate">
                        {file.name}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Submit */}
        <div className="flex justify-end space-x-4">
          <Button 
            type="button" 
            variant="outline" 
            onClick={() => navigate(`/reports/${finding.report_id}`)}
          >
            İptal
          </Button>
          <Button 
            type="submit"
            disabled={updateMutation.isPending || uploadingImages}
          >
            {updateMutation.isPending || uploadingImages ? 'Güncelleniyor...' : 'Bulgu Güncelle'}
          </Button>
        </div>
      </form>
    </div>
  )
}
