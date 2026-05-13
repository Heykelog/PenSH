import React, { useState } from 'react'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { Plus, Edit, Trash2, Calendar, Users, UserCheck } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card'
import { Button } from '../components/ui/button'
import { Input } from '../components/ui/input'
import { Textarea } from '../components/ui/textarea'
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
import { customersAPI, testersAPI, Customer, Tester } from '../lib/api'

export function CustomerManagement() {
  const queryClient = useQueryClient()
  
  // Customer state
  const [customerDialogOpen, setCustomerDialogOpen] = useState(false)
  const [editingCustomer, setEditingCustomer] = useState<Customer | null>(null)
  const [customerForm, setCustomerForm] = useState({
    name: '',
    contact_person: '',
    email: '',
    phone: '',
    address: '',
    is_default: false
  })

  // Tester state
  const [testerDialogOpen, setTesterDialogOpen] = useState(false)
  const [editingTester, setEditingTester] = useState<Tester | null>(null)
  const [testerForm, setTesterForm] = useState({
    name: '',
    email: '',
    phone: '',
    title: '',
    is_default: false
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

  // Customer mutations
  const createCustomerMutation = useMutation({
    mutationFn: (data: Partial<Customer>) => customersAPI.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['customers'] })
      setCustomerDialogOpen(false)
      resetCustomerForm()
    },
  })

  const updateCustomerMutation = useMutation({
    mutationFn: ({ id, data }: { id: number; data: Partial<Customer> }) => 
      customersAPI.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['customers'] })
      setCustomerDialogOpen(false)
      setEditingCustomer(null)
      resetCustomerForm()
    },
  })

  const deleteCustomerMutation = useMutation({
    mutationFn: (id: number) => customersAPI.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['customers'] })
    },
  })

  // Tester mutations
  const createTesterMutation = useMutation({
    mutationFn: (data: Partial<Tester>) => testersAPI.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['testers'] })
      setTesterDialogOpen(false)
      resetTesterForm()
    },
  })

  const updateTesterMutation = useMutation({
    mutationFn: ({ id, data }: { id: number; data: Partial<Tester> }) => 
      testersAPI.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['testers'] })
      setTesterDialogOpen(false)
      setEditingTester(null)
      resetTesterForm()
    },
  })

  const deleteTesterMutation = useMutation({
    mutationFn: (id: number) => testersAPI.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['testers'] })
    },
  })

  // Form handlers
  const resetCustomerForm = () => {
    setCustomerForm({
      name: '',
      contact_person: '',
      email: '',
      phone: '',
      address: '',
      is_default: false
    })
  }

  const resetTesterForm = () => {
    setTesterForm({
      name: '',
      email: '',
      phone: '',
      title: '',
      is_default: false
    })
  }

  const handleEditCustomer = (customer: Customer) => {
    setEditingCustomer(customer)
    setCustomerForm({
      name: customer.name,
      contact_person: customer.contact_person || '',
      email: customer.email || '',
      phone: customer.phone || '',
      address: customer.address || '',
      is_default: customer.is_default
    })
    setCustomerDialogOpen(true)
  }

  const handleEditTester = (tester: Tester) => {
    setEditingTester(tester)
    setTesterForm({
      name: tester.name,
      email: tester.email || '',
      phone: tester.phone || '',
      title: tester.title || '',
      is_default: tester.is_default
    })
    setTesterDialogOpen(true)
  }

  const handleSubmitCustomer = () => {
    if (editingCustomer) {
      updateCustomerMutation.mutate({ id: editingCustomer.id, data: customerForm })
    } else {
      createCustomerMutation.mutate(customerForm)
    }
  }

  const handleSubmitTester = () => {
    if (editingTester) {
      updateTesterMutation.mutate({ id: editingTester.id, data: testerForm })
    } else {
      createTesterMutation.mutate(testerForm)
    }
  }

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-foreground">Müşteri ve Test Uzmanı Yönetimi</h1>
        <p className="text-muted-foreground mt-1">
          Müşteri bilgilerini ve test uzmanlarını yönetin
        </p>
      </div>

      <Tabs defaultValue="customers" className="space-y-6">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="customers" className="flex items-center gap-2">
            <Users className="h-4 w-4" />
            Müşteriler
          </TabsTrigger>
          <TabsTrigger value="testers" className="flex items-center gap-2">
            <UserCheck className="h-4 w-4" />
            Test Uzmanları
          </TabsTrigger>
        </TabsList>

        {/* Customers Tab */}
        <TabsContent value="customers" className="space-y-6">
          <div className="flex justify-between items-center">
            <h2 className="text-2xl font-semibold">Müşteriler</h2>
            <Button onClick={() => {
              setEditingCustomer(null)
              resetCustomerForm()
              setCustomerDialogOpen(true)
            }}>
              <Plus className="h-4 w-4 mr-2" />
              Yeni Müşteri
            </Button>
          </div>

          {customersLoading ? (
            <div className="text-center py-12">Yükleniyor...</div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {customers?.map((customer) => (
                <Card key={customer.id} className="hover:shadow-md transition-shadow">
                  <CardHeader className="pb-3">
                    <div className="flex items-start justify-between">
                      <div>
                        <CardTitle className="text-lg">{customer.name}</CardTitle>
                        {customer.is_default && (
                          <Badge variant="default" className="mt-1">Varsayılan</Badge>
                        )}
                      </div>
                      <div className="flex space-x-1">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleEditCustomer(customer)}
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => deleteCustomerMutation.mutate(customer.id)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-2">
                    {customer.contact_person && (
                      <p className="text-sm text-muted-foreground">
                        <strong>İletişim:</strong> {customer.contact_person}
                      </p>
                    )}
                    {customer.email && (
                      <p className="text-sm text-muted-foreground">
                        <strong>E-posta:</strong> {customer.email}
                      </p>
                    )}
                    {customer.phone && (
                      <p className="text-sm text-muted-foreground">
                        <strong>Telefon:</strong> {customer.phone}
                      </p>
                    )}
                    {customer.address && (
                      <p className="text-sm text-muted-foreground">
                        <strong>Adres:</strong> {customer.address}
                      </p>
                    )}
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>

        {/* Testers Tab */}
        <TabsContent value="testers" className="space-y-6">
          <div className="flex justify-between items-center">
            <h2 className="text-2xl font-semibold">Test Uzmanları</h2>
            <Button onClick={() => {
              setEditingTester(null)
              resetTesterForm()
              setTesterDialogOpen(true)
            }}>
              <Plus className="h-4 w-4 mr-2" />
              Yeni Test Uzmanı
            </Button>
          </div>

          {testersLoading ? (
            <div className="text-center py-12">Yükleniyor...</div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {testers?.map((tester) => (
                <Card key={tester.id} className="hover:shadow-md transition-shadow">
                  <CardHeader className="pb-3">
                    <div className="flex items-start justify-between">
                      <div>
                        <CardTitle className="text-lg">{tester.name}</CardTitle>
                        {tester.is_default && (
                          <Badge variant="default" className="mt-1">Varsayılan</Badge>
                        )}
                      </div>
                      <div className="flex space-x-1">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleEditTester(tester)}
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => deleteTesterMutation.mutate(tester.id)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-2">
                    {tester.title && (
                      <p className="text-sm text-muted-foreground">
                        <strong>Ünvan:</strong> {tester.title}
                      </p>
                    )}
                    {tester.email && (
                      <p className="text-sm text-muted-foreground">
                        <strong>E-posta:</strong> {tester.email}
                      </p>
                    )}
                    {tester.phone && (
                      <p className="text-sm text-muted-foreground">
                        <strong>Telefon:</strong> {tester.phone}
                      </p>
                    )}
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>
      </Tabs>

      {/* Customer Dialog */}
      <Dialog open={customerDialogOpen} onOpenChange={setCustomerDialogOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>
              {editingCustomer ? 'Müşteri Düzenle' : 'Yeni Müşteri'}
            </DialogTitle>
            <DialogDescription>
              Müşteri bilgilerini girin
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-2">Müşteri Adı *</label>
              <Input
                value={customerForm.name}
                onChange={(e) => setCustomerForm({ ...customerForm, name: e.target.value })}
                placeholder="Müşteri adı"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-2">İletişim Kişisi</label>
              <Input
                value={customerForm.contact_person}
                onChange={(e) => setCustomerForm({ ...customerForm, contact_person: e.target.value })}
                placeholder="İletişim kişisi"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-2">E-posta</label>
              <Input
                type="email"
                value={customerForm.email}
                onChange={(e) => setCustomerForm({ ...customerForm, email: e.target.value })}
                placeholder="E-posta adresi"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-2">Telefon</label>
              <Input
                value={customerForm.phone}
                onChange={(e) => setCustomerForm({ ...customerForm, phone: e.target.value })}
                placeholder="Telefon numarası"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-2">Adres</label>
              <Textarea
                value={customerForm.address}
                onChange={(e) => setCustomerForm({ ...customerForm, address: e.target.value })}
                placeholder="Adres"
                rows={3}
              />
            </div>
            <div className="flex items-center space-x-2">
              <input
                type="checkbox"
                id="customer-default"
                checked={customerForm.is_default}
                onChange={(e) => setCustomerForm({ ...customerForm, is_default: e.target.checked })}
                className="rounded"
              />
              <label htmlFor="customer-default" className="text-sm font-medium">
                Varsayılan müşteri olarak ayarla
              </label>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setCustomerDialogOpen(false)}>
              İptal
            </Button>
            <Button 
              onClick={handleSubmitCustomer}
              disabled={!customerForm.name || createCustomerMutation.isPending || updateCustomerMutation.isPending}
            >
              {editingCustomer ? 'Güncelle' : 'Oluştur'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Tester Dialog */}
      <Dialog open={testerDialogOpen} onOpenChange={setTesterDialogOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>
              {editingTester ? 'Test Uzmanı Düzenle' : 'Yeni Test Uzmanı'}
            </DialogTitle>
            <DialogDescription>
              Test uzmanı bilgilerini girin
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-2">Ad Soyad *</label>
              <Input
                value={testerForm.name}
                onChange={(e) => setTesterForm({ ...testerForm, name: e.target.value })}
                placeholder="Ad soyad"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-2">Ünvan</label>
              <Input
                value={testerForm.title}
                onChange={(e) => setTesterForm({ ...testerForm, title: e.target.value })}
                placeholder="Örn: Senior Security Analyst"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-2">E-posta</label>
              <Input
                type="email"
                value={testerForm.email}
                onChange={(e) => setTesterForm({ ...testerForm, email: e.target.value })}
                placeholder="E-posta adresi"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-2">Telefon</label>
              <Input
                value={testerForm.phone}
                onChange={(e) => setTesterForm({ ...testerForm, phone: e.target.value })}
                placeholder="Telefon numarası"
              />
            </div>
            <div className="flex items-center space-x-2">
              <input
                type="checkbox"
                id="tester-default"
                checked={testerForm.is_default}
                onChange={(e) => setTesterForm({ ...testerForm, is_default: e.target.checked })}
                className="rounded"
              />
              <label htmlFor="tester-default" className="text-sm font-medium">
                Varsayılan test uzmanı olarak ayarla
              </label>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setTesterDialogOpen(false)}>
              İptal
            </Button>
            <Button 
              onClick={handleSubmitTester}
              disabled={!testerForm.name || createTesterMutation.isPending || updateTesterMutation.isPending}
            >
              {editingTester ? 'Güncelle' : 'Oluştur'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
