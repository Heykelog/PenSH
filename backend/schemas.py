from pydantic import BaseModel
from typing import List, Optional
from datetime import datetime
from models import RiskLevel, OwaspCategory

class CustomerBase(BaseModel):
    name: str
    contact_person: Optional[str] = None
    email: Optional[str] = None
    phone: Optional[str] = None
    address: Optional[str] = None
    is_default: bool = False

class CustomerCreate(CustomerBase):
    pass

class CustomerUpdate(BaseModel):
    name: Optional[str] = None
    contact_person: Optional[str] = None
    email: Optional[str] = None
    phone: Optional[str] = None
    address: Optional[str] = None
    is_default: Optional[bool] = None

class Customer(CustomerBase):
    id: int
    created_at: datetime
    updated_at: Optional[datetime] = None

    class Config:
        from_attributes = True

class TesterBase(BaseModel):
    name: str
    email: Optional[str] = None
    phone: Optional[str] = None
    title: Optional[str] = None
    is_default: bool = False

class TesterCreate(TesterBase):
    pass

class TesterUpdate(BaseModel):
    name: Optional[str] = None
    email: Optional[str] = None
    phone: Optional[str] = None
    title: Optional[str] = None
    is_default: Optional[bool] = None

class Tester(TesterBase):
    id: int
    created_at: datetime
    updated_at: Optional[datetime] = None

    class Config:
        from_attributes = True

class FindingBase(BaseModel):
    title: str
    description: str
    affected_area: Optional[str] = None
    risk_level: RiskLevel
    owasp_category: Optional[OwaspCategory] = None
    solution: Optional[str] = None
    steps_to_reproduce: Optional[str] = None
    impact: Optional[str] = None
    request: Optional[str] = None
    response: Optional[str] = None
    cvss_score: Optional[str] = None
    cwe_id: Optional[str] = None
    refs: Optional[str] = None

class FindingCreate(FindingBase):
    report_id: int

class FindingUpdate(BaseModel):
    title: Optional[str] = None
    description: Optional[str] = None
    affected_area: Optional[str] = None
    risk_level: Optional[RiskLevel] = None
    owasp_category: Optional[OwaspCategory] = None
    solution: Optional[str] = None
    steps_to_reproduce: Optional[str] = None
    impact: Optional[str] = None
    request: Optional[str] = None
    response: Optional[str] = None
    cvss_score: Optional[str] = None
    cwe_id: Optional[str] = None
    refs: Optional[str] = None

class POCImageBase(BaseModel):
    filename: str
    original_filename: str
    file_path: str
    file_size: Optional[int] = None
    mime_type: Optional[str] = None

class POCImageCreate(POCImageBase):
    finding_id: int

class POCImage(POCImageBase):
    id: int
    finding_id: int
    created_at: datetime

    class Config:
        from_attributes = True

class Finding(FindingBase):
    id: int
    report_id: int
    created_at: datetime
    updated_at: Optional[datetime] = None
    display_order: int = 0
    poc_images: List[POCImage] = []

    class Config:
        from_attributes = True

class ReportBase(BaseModel):
    title: str
    description: Optional[str] = None
    methodology: Optional[str] = None
    scope: Optional[str] = None
    client_name: Optional[str] = None
    test_date: Optional[str] = None
    tester_name: Optional[str] = None
    customer_id: Optional[int] = None
    tester_id: Optional[int] = None
    logo_path: Optional[str] = None

class ReportCreate(ReportBase):
    pass

class ReportUpdate(BaseModel):
    title: Optional[str] = None
    description: Optional[str] = None
    methodology: Optional[str] = None
    scope: Optional[str] = None
    client_name: Optional[str] = None
    test_date: Optional[str] = None
    tester_name: Optional[str] = None
    customer_id: Optional[int] = None
    tester_id: Optional[int] = None
    logo_path: Optional[str] = None

class Report(ReportBase):
    id: int
    created_at: datetime
    updated_at: Optional[datetime] = None
    findings: List[Finding] = []
    customer: Optional[Customer] = None
    tester: Optional[Tester] = None

    class Config:
        from_attributes = True

class OwaspTemplateBase(BaseModel):
    category: OwaspCategory
    title: str
    description: str
    impact: Optional[str] = None
    solution: Optional[str] = None
    risk_level: RiskLevel = RiskLevel.HIGH
    is_active: bool = True

class OwaspTemplateCreate(OwaspTemplateBase):
    pass

class OwaspTemplate(OwaspTemplateBase):
    id: int

    class Config:
        from_attributes = True

class KnowledgeBaseTemplateBase(BaseModel):
    title: str
    description: str
    affected_area: Optional[str] = None
    impact: Optional[str] = None
    solution: Optional[str] = None
    risk_level: RiskLevel
    owasp_category: Optional[OwaspCategory] = None
    steps_to_reproduce: Optional[str] = None
    request: Optional[str] = None
    response: Optional[str] = None
    cvss_score: Optional[str] = None
    cwe_id: Optional[str] = None
    refs: Optional[str] = None

class KnowledgeBaseTemplateCreate(KnowledgeBaseTemplateBase):
    finding_id: Optional[int] = None

class KnowledgeBaseTemplate(KnowledgeBaseTemplateBase):
    id: int
    is_from_finding: bool
    finding_id: Optional[int] = None
    created_at: datetime
    updated_at: Optional[datetime] = None

    class Config:
        from_attributes = True

