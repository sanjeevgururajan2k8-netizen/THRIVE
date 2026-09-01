from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List

from app.core.database import get_db
from app.models.member5 import Employee
from app.schemas.member5_schemas import EmployeeCreate, EmployeeResponse, RiskProfileResponse
from app.services.victim_risk_engine import calculate_exposure_score, calculate_business_impact_score

router = APIRouter(prefix="/api/employees", tags=["Employees"])

@router.post("", response_model=EmployeeResponse, status_code=status.HTTP_201_CREATED)
def create_employee(employee_in: EmployeeCreate, db: Session = Depends(get_db)):
    db_emp = db.query(Employee).filter(
        (Employee.employee_id == employee_in.employee_id) | 
        (Employee.email == employee_in.email)
    ).first()
    if db_emp:
        raise HTTPException(status_code=400, detail="Employee with this ID or email already exists")
    
    new_employee = Employee(**employee_in.model_dump())
    db.add(new_employee)
    db.commit()
    db.refresh(new_employee)
    return new_employee

@router.get("", response_model=List[EmployeeResponse])
def get_employees(skip: int = 0, limit: int = 100, db: Session = Depends(get_db)):
    employees = db.query(Employee).offset(skip).limit(limit).all()
    return employees

@router.get("/{employee_id}", response_model=EmployeeResponse)
def get_employee(employee_id: str, db: Session = Depends(get_db)):
    emp = db.query(Employee).filter(Employee.employee_id == employee_id).first()
    if not emp:
        raise HTTPException(status_code=404, detail="Employee not found")
    return emp

@router.put("/{employee_id}", response_model=EmployeeResponse)
def update_employee(employee_id: str, employee_in: EmployeeCreate, db: Session = Depends(get_db)):
    emp = db.query(Employee).filter(Employee.employee_id == employee_id).first()
    if not emp:
        raise HTTPException(status_code=404, detail="Employee not found")
    
    for key, value in employee_in.model_dump().items():
        setattr(emp, key, value)
        
    db.commit()
    db.refresh(emp)
    return emp

@router.delete("/{employee_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_employee(employee_id: str, db: Session = Depends(get_db)):
    emp = db.query(Employee).filter(Employee.employee_id == employee_id).first()
    if not emp:
        raise HTTPException(status_code=404, detail="Employee not found")
    db.delete(emp)
    db.commit()
    return None

@router.get("/{employee_id}/risk-profile", response_model=RiskProfileResponse)
def get_employee_risk_profile(employee_id: str, db: Session = Depends(get_db)):
    emp = db.query(Employee).filter(Employee.employee_id == employee_id).first()
    if not emp:
        raise HTTPException(status_code=404, detail="Employee not found")
        
    exposure = calculate_exposure_score(emp)
    impact = calculate_business_impact_score(emp)
    
    return RiskProfileResponse(
        employee_id=emp.employee_id,
        role=emp.role,
        department=emp.department,
        privilege_level=emp.privilege_level,
        system_access=emp.system_access,
        financial_access=emp.financial_access,
        data_sensitivity=emp.data_sensitivity,
        business_criticality=emp.business_criticality,
        exposure_score=exposure,
        business_impact_score=impact
    )
