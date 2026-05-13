// OWASP Top 10 2021 Referans Bilgileri
export interface OwaspReference {
  id: string
  title: string
  cweIds: string[]
  cvssVector: string
  references: {
    owasp: string
    cwe: string[]
  }
}

export const OWASP_REFERENCES: Record<string, OwaspReference> = {
  broken_access_control: {
    id: "A01:2021",
    title: "Erişim Kontrolünün Kötüye Kullanımı",
    cweIds: ["CWE-285", "CWE-639", "CWE-862", "CWE-863"],
    cvssVector: "AV:N/AC:L/PR:N/UI:N/S:U/C:H/I:H/A:H",
    references: {
      owasp: "https://owasp.org/Top10/A01_2021-Broken_Access_Control/",
      cwe: ["https://cwe.mitre.org/data/definitions/285.html", "https://cwe.mitre.org/data/definitions/639.html"]
    }
  },
  cryptographic_failures: {
    id: "A02:2021",
    title: "Kriptografik Hatalar",
    cweIds: ["CWE-259", "CWE-327", "CWE-330"],
    cvssVector: "AV:N/AC:L/PR:N/UI:N/S:U/C:H/I:H/A:H",
    references: {
      owasp: "https://owasp.org/Top10/A02_2021-Cryptographic_Failures/",
      cwe: ["https://cwe.mitre.org/data/definitions/259.html", "https://cwe.mitre.org/data/definitions/327.html"]
    }
  },
  injection: {
    id: "A03:2021",
    title: "Enjeksiyon",
    cweIds: ["CWE-89", "CWE-78", "CWE-79"],
    cvssVector: "AV:N/AC:L/PR:N/UI:N/S:U/C:H/I:H/A:H",
    references: {
      owasp: "https://owasp.org/Top10/A03_2021-Injection/",
      cwe: ["https://cwe.mitre.org/data/definitions/89.html", "https://cwe.mitre.org/data/definitions/78.html"]
    }
  },
  insecure_design: {
    id: "A04:2021",
    title: "Güvenli Olmayan Tasarım",
    cweIds: ["CWE-209", "CWE-213", "CWE-352"],
    cvssVector: "AV:N/AC:L/PR:N/UI:N/S:U/C:H/I:H/A:H",
    references: {
      owasp: "https://owasp.org/Top10/A04_2021-Insecure_Design/",
      cwe: ["https://cwe.mitre.org/data/definitions/209.html", "https://cwe.mitre.org/data/definitions/213.html"]
    }
  },
  security_misconfiguration: {
    id: "A05:2021",
    title: "Güvenlik Yanlış Yapılandırması",
    cweIds: ["CWE-16", "CWE-200", "CWE-209"],
    cvssVector: "AV:N/AC:L/PR:N/UI:N/S:U/C:H/I:H/A:H",
    references: {
      owasp: "https://owasp.org/Top10/A05_2021-Security_Misconfiguration/",
      cwe: ["https://cwe.mitre.org/data/definitions/16.html", "https://cwe.mitre.org/data/definitions/200.html"]
    }
  },
  vulnerable_components: {
    id: "A06:2021",
    title: "Güvenlik Açıklı ve Güncel Olmayan Bileşenler",
    cweIds: ["CWE-1104", "CWE-79", "CWE-89"],
    cvssVector: "AV:N/AC:L/PR:N/UI:N/S:U/C:H/I:H/A:H",
    references: {
      owasp: "https://owasp.org/Top10/A06_2021-Vulnerable_and_Outdated_Components/",
      cwe: ["https://cwe.mitre.org/data/definitions/1104.html", "https://cwe.mitre.org/data/definitions/79.html"]
    }
  },
  authentication_failures: {
    id: "A07:2021",
    title: "Kimlik Doğrulama Hataları",
    cweIds: ["CWE-287", "CWE-798", "CWE-522"],
    cvssVector: "AV:N/AC:L/PR:N/UI:N/S:U/C:H/I:H/A:H",
    references: {
      owasp: "https://owasp.org/Top10/A07_2021-Identification_and_Authentication_Failures/",
      cwe: ["https://cwe.mitre.org/data/definitions/287.html", "https://cwe.mitre.org/data/definitions/798.html"]
    }
  },
  software_integrity_failures: {
    id: "A08:2021",
    title: "Yazılım ve Veri Bütünlüğü Hataları",
    cweIds: ["CWE-345", "CWE-494", "CWE-502"],
    cvssVector: "AV:N/AC:L/PR:N/UI:N/S:U/C:H/I:H/A:H",
    references: {
      owasp: "https://owasp.org/Top10/A08_2021-Software_and_Data_Integrity_Failures/",
      cwe: ["https://cwe.mitre.org/data/definitions/345.html", "https://cwe.mitre.org/data/definitions/494.html"]
    }
  },
  logging_monitoring_failures: {
    id: "A09:2021",
    title: "Güvenlik Günlüğü ve İzleme Hataları",
    cweIds: ["CWE-778", "CWE-117", "CWE-532"],
    cvssVector: "AV:N/AC:L/PR:N/UI:N/S:U/C:H/I:H/A:H",
    references: {
      owasp: "https://owasp.org/Top10/A09_2021-Security_Logging_and_Monitoring_Failures/",
      cwe: ["https://cwe.mitre.org/data/definitions/778.html", "https://cwe.mitre.org/data/definitions/117.html"]
    }
  },
  ssrf: {
    id: "A10:2021",
    title: "Sunucu Taraflı İstek Sahteciliği",
    cweIds: ["CWE-918", "CWE-352", "CWE-79"],
    cvssVector: "AV:N/AC:L/PR:N/UI:N/S:U/C:H/I:H/A:H",
    references: {
      owasp: "https://owasp.org/Top10/A10_2021-Server-Side_Request_Forgery/",
      cwe: ["https://cwe.mitre.org/data/definitions/918.html", "https://cwe.mitre.org/data/definitions/352.html"]
    }
  }
}

// Yardımcı fonksiyonlar
export const getOwaspReference = (category: string): OwaspReference | null => {
  return OWASP_REFERENCES[category] || null
}

export const getCweIds = (category: string): string[] => {
  const reference = getOwaspReference(category)
  return reference ? reference.cweIds : []
}

export const getCvssVector = (category: string): string | null => {
  const reference = getOwaspReference(category)
  return reference ? reference.cvssVector : null
}
