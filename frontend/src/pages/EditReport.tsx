import React, { useState, useEffect } from 'react'
import { useForm, Controller } from 'react-hook-form'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { useNavigate, useParams } from 'react-router-dom'
import { ArrowLeft, Calendar, CalendarDays, Users, UserCheck } from 'lucide-react'
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
import { 
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '../components/ui/popover'
import { Calendar as CalendarComponent } from '../components/ui/calendar'
import { DateRange } from 'react-day-picker'
import { format } from 'date-fns'
import { tr } from 'date-fns/locale'
import { reportsAPI, customersAPI, testersAPI, CreateReportData, Customer, Tester } from '../lib/api'

export function EditReport() {
  const { id } = useParams<{ id: string }>()
  const reportId = parseInt(id!)
  const navigate = useNavigate()
  const queryClient = useQueryClient()
  const [selectedRange, setSelectedRange] = useState<DateRange | undefined>(undefined)
  
  const { register, handleSubmit, formState: { errors }, control, setValue, watch } = useForm<CreateReportData>({
    defaultValues: {
      customer_id: undefined,
      tester_id: undefined,
    }
  })

  // Get report data
  const { data: report, isLoading: reportLoading } = useQuery({
    queryKey: ['report', reportId],
    queryFn: () => reportsAPI.getById(reportId).then(res => res.data),
    enabled: !!reportId,
  })

  // Queries
  const { data: customers, isLoading: customersLoading } = useQuery({
    queryKey: ['customers'],
    queryFn: () => customersAPI.getAll().then(res => res.data),
  })

  const { data: testers, isLoading: testersLoading } = useQuery({
    queryKey: ['testers'],
    queryFn: () => testersAPI.getAll().then(res => res.data),
  })

  // Load report data into form
  useEffect(() => {
    if (report) {
      setValue('title', report.title)
      setValue('description', report.description || '')
      setValue('methodology', report.methodology || '')
      setValue('scope', report.scope || '')
      setValue('client_name', report.client_name || '')
      setValue('test_date', report.test_date || '')
      setValue('tester_name', report.tester_name || '')
      if (report.customer_id) setValue('customer_id', report.customer_id)
      if (report.tester_id) setValue('tester_id', report.tester_id)
    }
  }, [report, setValue])

  const updateMutation = useMutation({
    mutationFn: (data: CreateReportData) => reportsAPI.update(reportId, data),
    onSuccess: (response) => {
      queryClient.invalidateQueries({ queryKey: ['reports'] })
      queryClient.invalidateQueries({ queryKey: ['report', reportId] })
      navigate(`/reports/${reportId}`)
    },
  })

  const onSubmit = (data: CreateReportData) => {
    // Include selected date range in test_date
    if (selectedRange?.from && selectedRange?.to) {
      const from = format(selectedRange.from, 'dd/MM/yyyy', { locale: tr })
      const to = format(selectedRange.to, 'dd/MM/yyyy', { locale: tr })
      data.test_date = `${from} - ${to}`
    } else if (selectedRange?.from) {
      data.test_date = format(selectedRange.from, 'dd/MM/yyyy', { locale: tr })
    }
    updateMutation.mutate(data)
  }

  if (reportLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-muted-foreground">Rapor yükleniyor...</div>
      </div>
    )
  }

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div className="flex items-center gap-2">
        <Button 
          variant="ghost" 
          size="sm"
          onClick={() => navigate(-1)}
        >
          <ArrowLeft className="h-4 w-4 mr-1" />
          Geri
        </Button>
      </div>

      <div>
        <h1 className="text-3xl font-bold text-foreground">Raporu Düzenle</h1>
        <p className="text-muted-foreground mt-1">
          Rapor bilgilerini güncelleyin
        </p>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle>Rapor Bilgileri</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <label htmlFor="title" className="block text-sm font-medium mb-2">
                Rapor Başlığı *
              </label>
              <Input
                id="title"
                {...register('title', { required: 'Rapor başlığı gereklidir' })}
                placeholder="Örn: ABC Şirketi Web Uygulaması Penetrasyon Testi"
              />
              {errors.title && (
                <p className="text-sm text-destructive mt-1">{errors.title.message}</p>
              )}
            </div>

            <div>
              <label htmlFor="description" className="block text-sm font-medium mb-2">
                Açıklama
              </label>
              <Textarea
                id="description"
                {...register('description')}
                placeholder="Rapor hakkında kısa açıklama..."
                rows={3}
              />
            </div>

            <div>
              <label htmlFor="methodology" className="block text-sm font-medium mb-2">
                Metodoloji
              </label>
              <Textarea
                id="methodology"
                {...register('methodology')}
                placeholder="Kullanılan test metodolojisini açıklayın..."
                rows={3}
              />
            </div>

            <div>
              <label htmlFor="scope" className="block text-sm font-medium mb-2">
                Kapsam (Scope)
              </label>
              <Textarea
                id="scope"
                {...register('scope')}
                placeholder="Testin kapsamını belirtin..."
                rows={3}
              />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Users className="h-5 w-5" />
              Müşteri ve Test Bilgileri
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Customer Selection */}
            <div>
              <label htmlFor="customer" className="block text-sm font-medium mb-2">
                Müşteri
              </label>
              <Select 
                value={watch('customer_id')?.toString() || ''} 
                onValueChange={(value) => {
                  const customer = customers?.find(c => c.id === parseInt(value))
                  setValue('customer_id', parseInt(value))
                  if (customer) setValue('client_name', customer.name)
                }}
              >
                <SelectTrigger id="customer">
                  <SelectValue placeholder="Müşteri seçin..." />
                </SelectTrigger>
                <SelectContent>
                  {customers?.map((customer) => (
                    <SelectItem key={customer.id} value={customer.id.toString()}>
                      {customer.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Client Name */}
            <div>
              <label htmlFor="client_name" className="block text-sm font-medium mb-2">
                Müşteri Adı
              </label>
              <Input
                id="client_name"
                {...register('client_name')}
                placeholder="Müşteri adı veya şirket adı"
              />
            </div>

            {/* Tester Selection */}
            <div>
              <label htmlFor="tester" className="block text-sm font-medium mb-2">
                Test Uzmanı
              </label>
              <Select 
                value={watch('tester_id')?.toString() || ''} 
                onValueChange={(value) => {
                  const tester = testers?.find(t => t.id === parseInt(value))
                  setValue('tester_id', parseInt(value))
                  if (tester) setValue('tester_name', tester.name)
                }}
              >
                <SelectTrigger id="tester">
                  <SelectValue placeholder="Test uzmanı seçin..." />
                </SelectTrigger>
                <SelectContent>
                  {testers?.map((tester) => (
                    <SelectItem key={tester.id} value={tester.id.toString()}>
                      {tester.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Tester Name */}
            <div>
              <label htmlFor="tester_name" className="block text-sm font-medium mb-2">
                Test Uzmanı Adı
              </label>
              <Input
                id="tester_name"
                {...register('tester_name')}
                placeholder="Test uzmanının adı"
              />
            </div>

            {/* Test Date */}
            <div>
              <label htmlFor="test_date" className="block text-sm font-medium mb-2">
                Test Tarihi
              </label>
              <Input
                id="test_date"
                {...register('test_date')}
                placeholder="Örn: 15/01/2024 - 20/01/2024"
              />
            </div>
          </CardContent>
        </Card>

        <div className="flex justify-end gap-4">
          <Button 
            variant="outline"
            onClick={() => navigate(`/reports/${reportId}`)}
          >
            İptal
          </Button>
          <Button 
            type="submit"
            disabled={updateMutation.isPending}
          >
            {updateMutation.isPending ? 'Güncelleniyor...' : 'Raporu Güncelle'}
          </Button>
        </div>
      </form>
    </div>
  )
}
