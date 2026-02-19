import React, { useState, useEffect } from 'react'
import { useForm, Controller } from 'react-hook-form'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { useNavigate } from 'react-router-dom'
import { Calendar, CalendarDays, Users, UserCheck } from 'lucide-react'
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

export function CreateReport() {
  const navigate = useNavigate()
  const queryClient = useQueryClient()
  const [selectedRange, setSelectedRange] = useState<DateRange | undefined>(undefined)
  
  const { register, handleSubmit, formState: { errors }, control, setValue, watch } = useForm<CreateReportData>({
    defaultValues: {
      customer_id: undefined,
      tester_id: undefined,
    }
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

  const { data: defaultCustomer } = useQuery({
    queryKey: ['default-customer'],
    queryFn: () => customersAPI.getDefault().then(res => res.data),
    enabled: !!customers,
  })

  const { data: defaultTester } = useQuery({
    queryKey: ['default-tester'],
    queryFn: () => testersAPI.getDefault().then(res => res.data),
    enabled: !!testers,
  })

  // Set default values when loaded
  useEffect(() => {
    if (defaultCustomer) {
      setValue('customer_id', defaultCustomer.id)
      setValue('client_name', defaultCustomer.name)
    }
  }, [defaultCustomer, setValue])

  useEffect(() => {
    if (defaultTester) {
      setValue('tester_id', defaultTester.id)
      setValue('tester_name', defaultTester.name)
    }
  }, [defaultTester, setValue])

  const createMutation = useMutation({
    mutationFn: (data: CreateReportData) => reportsAPI.create(data),
    onSuccess: (response) => {
      queryClient.invalidateQueries({ queryKey: ['reports'] })
      navigate(`/reports/${response.data.id}`)
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
    createMutation.mutate(data)
  }

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-foreground">Yeni Rapor Oluştur</h1>
        <p className="text-muted-foreground mt-1">
          Yeni bir penetrasyon testi raporu oluşturun ve bulgular eklemeye başlayın
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
              <label className="block text-sm font-medium mb-2">
                Müşteri Seçimi
              </label>
              <Controller
                name="customer_id"
                control={control}
                render={({ field }) => (
                  <Select
                    value={field.value?.toString() || ""}
                    onValueChange={(value) => {
                      const customerId = value ? parseInt(value) : undefined
                      field.onChange(customerId)
                      
                      // Update client_name when customer is selected
                      const selectedCustomer = customers?.find(c => c.id === customerId)
                      if (selectedCustomer) {
                        setValue('client_name', selectedCustomer.name)
                      }
                    }}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Müşteri seçin" />
                    </SelectTrigger>
                    <SelectContent>
                      {customersLoading ? (
                        <SelectItem value="loading" disabled>Yükleniyor...</SelectItem>
                      ) : customers?.length === 0 ? (
                        <SelectItem value="no-customers" disabled>Müşteri bulunamadı</SelectItem>
                      ) : (
                        customers?.map((customer) => (
                          <SelectItem key={customer.id} value={customer.id.toString()}>
                            <div className="flex items-center justify-between w-full">
                              <span>{customer.name}</span>
                              {customer.is_default && (
                                <span className="text-xs text-muted-foreground ml-2">(Varsayılan)</span>
                              )}
                            </div>
                          </SelectItem>
                        ))
                      )}
                    </SelectContent>
                  </Select>
                )}
              />
            </div>

            {/* Manual Client Name Input */}
            <div>
              <label htmlFor="client_name" className="block text-sm font-medium mb-2">
                Müşteri Adı (Manuel)
              </label>
              <Input
                id="client_name"
                {...register('client_name')}
                placeholder="Örn: ABC Teknoloji A.Ş."
              />
            </div>

            {/* Test Date Range with Calendar */}
            <div>
              <label className="block text-sm font-medium mb-2">
                Test Tarihi
              </label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className="w-full justify-start text-left font-normal"
                  >
                    <CalendarDays className="mr-2 h-4 w-4" />
                    {selectedRange?.from && selectedRange?.to
                      ? `${format(selectedRange.from, 'dd/MM/yyyy', { locale: tr })} - ${format(selectedRange.to, 'dd/MM/yyyy', { locale: tr })}`
                      : selectedRange?.from
                        ? format(selectedRange.from, 'dd/MM/yyyy', { locale: tr })
                        : <span className="text-muted-foreground">Tarih aralığı seçin</span>}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <CalendarComponent
                    mode="range"
                    selected={selectedRange}
                    onSelect={setSelectedRange}
                    initialFocus
                    locale={tr}
                  />
                </PopoverContent>
              </Popover>
            </div>

            {/* Tester Selection */}
            <div>
              <label className="block text-sm font-medium mb-2">
                Test Uzmanı Seçimi
              </label>
              <Controller
                name="tester_id"
                control={control}
                render={({ field }) => (
                  <Select
                    value={field.value?.toString() || ""}
                    onValueChange={(value) => {
                      const testerId = value ? parseInt(value) : undefined
                      field.onChange(testerId)
                      
                      // Update tester_name when tester is selected
                      const selectedTester = testers?.find(t => t.id === testerId)
                      if (selectedTester) {
                        setValue('tester_name', selectedTester.name)
                      }
                    }}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Test uzmanı seçin" />
                    </SelectTrigger>
                    <SelectContent>
                      {testersLoading ? (
                        <SelectItem value="loading" disabled>Yükleniyor...</SelectItem>
                      ) : testers?.length === 0 ? (
                        <SelectItem value="no-testers" disabled>Test uzmanı bulunamadı</SelectItem>
                      ) : (
                        testers?.map((tester) => (
                          <SelectItem key={tester.id} value={tester.id.toString()}>
                            <div className="flex items-center justify-between w-full">
                              <span>{tester.name}</span>
                              {tester.is_default && (
                                <span className="text-xs text-muted-foreground ml-2">(Varsayılan)</span>
                              )}
                            </div>
                          </SelectItem>
                        ))
                      )}
                    </SelectContent>
                  </Select>
                )}
              />
            </div>

            {/* Manual Tester Name Input */}
            <div>
              <label htmlFor="tester_name" className="block text-sm font-medium mb-2">
                Test Uzmanı Adı (Manuel)
              </label>
              <Input
                id="tester_name"
                {...register('tester_name')}
                placeholder="Örn: Ahmet Yılmaz, CISSP"
              />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Test Kapsamı ve Metodoloji</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <label htmlFor="scope" className="block text-sm font-medium mb-2">
                Test Kapsamı
              </label>
              <Textarea
                id="scope"
                {...register('scope')}
                placeholder="Test kapsamında yer alan sistemler, IP aralıkları, domain'ler..."
                rows={4}
              />
            </div>

            <div>
              <label htmlFor="methodology" className="block text-sm font-medium mb-2">
                Test Metodolojisi
              </label>
              <Textarea
                id="methodology"
                {...register('methodology')}
                placeholder="Kullanılan metodoloji, standartlar ve araçlar..."
                rows={6}
                defaultValue={`Bu penetrasyon testi aşağıdaki metodoloji ve standartlar kullanılarak gerçekleştirilmiştir:

• OWASP Testing Guide v4.2
• NIST SP 800-115 Teknik Güvenlik Testi ve Değerlendirme Kılavuzu
• PTES (Penetration Testing Execution Standard)

Test Aşamaları:
1. Planlama ve Hazırlık
2. Keşif (Information Gathering)
3. Zafiyet Tespiti (Vulnerability Assessment)
4. Sömürü (Exploitation)
5. Post-Exploitation
6. Raporlama

Kullanılan Araçlar:
• Nmap - Port tarama ve servis tespiti
• Burp Suite Professional - Web uygulama güvenlik testi
• OWASP ZAP - Otomatik güvenlik taraması
• Nessus - Zafiyet taraması
• Metasploit Framework - Exploit geliştirme ve test
• Custom Scripts - Özel test senaryoları`}
              />
            </div>
          </CardContent>
        </Card>

        <div className="flex justify-end space-x-4">
          <Button 
            type="button" 
            variant="outline" 
            onClick={() => navigate('/reports')}
          >
            İptal
          </Button>
          <Button 
            type="submit"
            disabled={createMutation.isPending}
          >
            {createMutation.isPending ? 'Oluşturuluyor...' : 'Rapor Oluştur'}
          </Button>
        </div>
      </form>
    </div>
  )
}
