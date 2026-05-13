import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function formatDate(date: string | Date): string {
  const d = new Date(date)
  return d.toLocaleDateString('tr-TR', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  })
}

export function getRiskLevelColor(riskLevel: string): string {
  switch (riskLevel?.toLowerCase()) {
    case 'critical':
      return 'risk-critical'
    case 'high':
      return 'risk-high'
    case 'medium':
      return 'risk-medium'
    case 'low':
      return 'risk-low'
    case 'info':
      return 'risk-info'
    default:
      return 'risk-info'
  }
}

export function getRiskLevelText(riskLevel: string): string {
  switch (riskLevel?.toLowerCase()) {
    case 'critical':
      return 'Kritik'
    case 'high':
      return 'Yüksek'
    case 'medium':
      return 'Orta'
    case 'low':
      return 'Düşük'
    case 'info':
      return 'Bilgi'
    default:
      return riskLevel
  }
}

export function getOwaspCategoryText(category: string): string {
  const categories: Record<string, string> = {
    'broken_access_control': 'Erişim Kontrolü Açıkları',
    'cryptographic_failures': 'Kriptografik Hatalar',
    'injection': 'Enjeksiyon',
    'insecure_design': 'Güvenli Olmayan Tasarım',
    'security_misconfiguration': 'Güvenlik Yanlış Yapılandırması',
    'vulnerable_components': 'Güvenlik Açıklı Bileşenler',
    'authentication_failures': 'Kimlik Doğrulama Hataları',
    'software_integrity_failures': 'Yazılım Bütünlüğü Hataları',
    'logging_monitoring_failures': 'Günlükleme ve İzleme Hataları',
    'ssrf': 'Sunucu Taraflı İstek Sahteciliği'
  }
  
  return categories[category] || category
}

export function downloadFile(blob: Blob, filename: string): void {
  const url = window.URL.createObjectURL(blob)
  const link = document.createElement('a')
  link.href = url
  link.download = filename
  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)
  window.URL.revokeObjectURL(url)
}
