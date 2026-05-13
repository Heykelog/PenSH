from sqlalchemy import Column, Integer, String, Text, DateTime, Enum, ForeignKey, Boolean
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from database import Base
import enum

class RiskLevel(enum.Enum):
    CRITICAL = "critical"
    HIGH = "high"
    MEDIUM = "medium"
    LOW = "low"
    INFO = "info"

class OwaspCategory(enum.Enum):
    BROKEN_ACCESS_CONTROL = "broken_access_control"
    CRYPTOGRAPHIC_FAILURES = "cryptographic_failures"
    INJECTION = "injection"
    INSECURE_DESIGN = "insecure_design"
    SECURITY_MISCONFIGURATION = "security_misconfiguration"
    VULNERABLE_COMPONENTS = "vulnerable_components"
    AUTHENTICATION_FAILURES = "authentication_failures"
    SOFTWARE_INTEGRITY_FAILURES = "software_integrity_failures"
    LOGGING_MONITORING_FAILURES = "logging_monitoring_failures"
    SSRF = "ssrf"

class Customer(Base):
    __tablename__ = "customers"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, nullable=False, unique=True)
    contact_person = Column(String)
    email = Column(String)
    phone = Column(String)
    address = Column(Text)
    is_default = Column(Boolean, default=False)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())

class Tester(Base):
    __tablename__ = "testers"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, nullable=False)
    email = Column(String)
    phone = Column(String)
    title = Column(String)  # e.g., "Senior Security Analyst"
    is_default = Column(Boolean, default=False)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())

class Report(Base):
    __tablename__ = "reports"

    id = Column(Integer, primary_key=True, index=True)
    title = Column(String, nullable=False)
    description = Column(Text)
    methodology = Column(Text)
    scope = Column(Text)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())
    
    # Report metadata
    client_name = Column(String)
    test_date = Column(String)
    tester_name = Column(String)
    logo_path = Column(String, nullable=True)  # Logo dosya yolu
    
    # Foreign keys for dynamic selection
    customer_id = Column(Integer, ForeignKey("customers.id"))
    tester_id = Column(Integer, ForeignKey("testers.id"))
    
    # Relationships
    customer = relationship("Customer")
    tester = relationship("Tester")
    
    # Relationships
    findings = relationship("Finding", back_populates="report", cascade="all, delete-orphan")

class Finding(Base):
    __tablename__ = "findings"

    id = Column(Integer, primary_key=True, index=True)
    title = Column(String, nullable=False)
    description = Column(Text, nullable=False)
    affected_area = Column(String)
    risk_level = Column(Enum(RiskLevel), nullable=False)
    owasp_category = Column(Enum(OwaspCategory))
    solution = Column(Text)
    steps_to_reproduce = Column(Text)
    impact = Column(Text)
    request = Column(Text, nullable=True)  # Request example
    response = Column(Text, nullable=True)  # Response example
    display_order = Column(Integer, default=0)  # Sıralama için
    
    # Technical details
    cvss_score = Column(String)
    cwe_id = Column(String)
    refs = Column(Text)  # Referans bilgileri (OWASP, CWE linkleri vs.)
    
    # Timestamps
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())
    
    # Foreign key
    report_id = Column(Integer, ForeignKey("reports.id"))
    
    # Relationships
    report = relationship("Report", back_populates="findings")
    poc_images = relationship("POCImage", back_populates="finding", cascade="all, delete-orphan")

class POCImage(Base):
    __tablename__ = "poc_images"

    id = Column(Integer, primary_key=True, index=True)
    filename = Column(String, nullable=False)
    original_filename = Column(String, nullable=False)
    file_path = Column(String, nullable=False)
    file_size = Column(Integer)
    mime_type = Column(String)
    
    # Timestamps
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    
    # Foreign key
    finding_id = Column(Integer, ForeignKey("findings.id"))
    
    # Relationships
    finding = relationship("Finding", back_populates="poc_images")

class OwaspTemplate(Base):
    __tablename__ = "owasp_templates"

    id = Column(Integer, primary_key=True, index=True)
    category = Column(Enum(OwaspCategory), nullable=False, unique=True)
    title = Column(String, nullable=False)
    description = Column(Text, nullable=False)
    impact = Column(Text)
    solution = Column(Text)
    risk_level = Column(Enum(RiskLevel), default=RiskLevel.HIGH)
    is_active = Column(Boolean, default=True)

class KnowledgeBaseTemplate(Base):
    __tablename__ = "knowledge_base_templates"

    id = Column(Integer, primary_key=True, index=True)
    title = Column(String, nullable=False)
    description = Column(Text, nullable=False)
    affected_area = Column(String)
    impact = Column(Text)
    solution = Column(Text)
    risk_level = Column(Enum(RiskLevel), nullable=False)
    owasp_category = Column(Enum(OwaspCategory))
    steps_to_reproduce = Column(Text)
    request = Column(Text, nullable=True)  # Request example
    response = Column(Text, nullable=True)  # Response example
    cvss_score = Column(String)
    cwe_id = Column(String)
    refs = Column(Text)
    is_from_finding = Column(Boolean, default=True)  # True = kullanıcı tarafından eklendi, False = OWASP
    finding_id = Column(Integer, ForeignKey("findings.id"), nullable=True)
    
    # Timestamps
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())
    
    # Relationships
    finding = relationship("Finding")
