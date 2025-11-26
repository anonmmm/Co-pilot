# Comprehensive Financial Model Workflow Guide
## Excel Model Architecture, Agent Workflow, and Capital Structure Analysis

---

## Table of Contents
1. [Excel Model Architecture](#excel-model-architecture)
2. [Agent Workflow Process](#agent-workflow-process)
3. [Tab-by-Tab Breakdown](#tab-by-tab-breakdown)
4. [Linking Methodology](#linking-methodology)
5. [Capital Structure & Waterfall Analysis](#capital-structure--waterfall-analysis)
6. [Data Collection Workflow](#data-collection-workflow)
7. [Formula Reference Library](#formula-reference-library)

---

## Excel Model Architecture

### Color Coding Standards (Industry Best Practice)
```
BLUE CELLS (#0000FF):    Input cells - user enters data
BLACK TEXT (#000000):    Formulas and calculations
GREEN CELLS (#008000):   Links from other worksheets
RED TEXT (#FF0000):      External links or warnings
GRAY CELLS (#808080):    Historical/actual data
YELLOW CELLS (#FFFF00):  Key outputs and returns
```

### Model Structure Overview
```
Dashboard (Executive Summary)
    ↓
Assumptions (All Inputs)
    ↓
Revenue Build → P&L → Balance Sheet → Cash Flow
    ↓
Debt Schedule & Capital Structure
    ↓
Returns Analysis & Waterfall
```

---

## Tab-by-Tab Breakdown

### 1. DASHBOARD TAB
**Purpose:** Executive summary with key metrics and visualizations

**Contents:**
```excel
A. Company Overview Section (Rows 1-10)
   - Company Name: =Assumptions!B2
   - Sector/Industry: =Assumptions!B3
   - Investment Date: =Assumptions!B4
   - Investment Amount: =Assumptions!B5

B. Key Metrics Summary (Rows 12-25)
   - Current Revenue: =P&L!E6
   - Current EBITDA: =P&L!E20
   - EBITDA Margin: =P&L!E20/P&L!E6
   - Debt/EBITDA: =DebtSchedule!E30/P&L!E20
   - Interest Coverage: =P&L!E20/DebtSchedule!E15
   - DSCR: =(P&L!E20-CashFlow!E25)/DebtSchedule!E18

C. Investment Returns (Rows 27-35)
   - IRR: =IRR(CashFlow!E50:J50)
   - MOIC: =SUM(CashFlow!F50:J50)/ABS(CashFlow!E50)
   - NPV: =NPV(Assumptions!B20,CashFlow!F50:J50)+CashFlow!E50

D. Charts Section (Rows 37-60)
   - Revenue Growth Chart
   - EBITDA Margin Trend
   - Debt Service Coverage
   - Cash Flow Waterfall
```

### 2. ASSUMPTIONS TAB
**Purpose:** Central location for all model inputs

**Contents:**
```excel
A. Company Information (Rows 1-15)
   - Company Name [INPUT]
   - Sector [INPUT]
   - Jurisdiction [INPUT]
   - Currency [INPUT]
   - Model Start Date [INPUT]
   - Fiscal Year End [INPUT]

B. Transaction Structure (Rows 17-30)
   - Investment Amount [INPUT]
   - Debt Amount [INPUT]
   - Interest Rate [INPUT]
   - Loan Term (Years) [INPUT]
   - Amortization Schedule [INPUT]
   - Exit Fee % [INPUT]
   - Origination Fee % [INPUT]

C. Revenue Assumptions (Rows 32-50)
   - Base Year Revenue [INPUT]
   - Growth Rate Year 1-5 [INPUT]
   - Customer Count [INPUT]
   - Average Revenue per User [INPUT]
   - Churn Rate % [INPUT]
   - Market Size [INPUT]
   - Market Share % [INPUT]

D. Operating Assumptions (Rows 52-80)
   - Gross Margin % [INPUT]
   - SG&A as % of Revenue [INPUT]
   - R&D as % of Revenue [INPUT]
   - Capex as % of Revenue [INPUT]
   - Working Capital Days:
     - Accounts Receivable Days [INPUT]
     - Inventory Days [INPUT]
     - Accounts Payable Days [INPUT]
   - Tax Rate % [INPUT]

E. Scenario Inputs (Rows 82-95)
   - Base Case / Bull Case / Bear Case
   - Revenue Growth Adjustment [INPUT]
   - Margin Adjustment [INPUT]
   - Exit Multiple [INPUT]
```

### 3. REVENUE BUILD TAB
**Purpose:** Detailed revenue calculation with multiple methodologies

**Contents:**
```excel
A. Revenue Methodology Selection (Rows 1-5)
   - Method: [Dropdown: Growth Rate / Bottom-Up / Cohort]

B. Growth Rate Method (Rows 7-20)
   Year 0    Year 1    Year 2    Year 3    Year 4    Year 5
   Base Rev  =E7*(1+   =F7*(1+   =G7*(1+   =H7*(1+   =I7*(1+
             Growth%)  Growth%)  Growth%)  Growth%)  Growth%)

C. Bottom-Up Method (Rows 22-40)
   - Starting Customers: =Assumptions!C40
   - New Customers: =ROUND(E22*Assumptions!C41,0)
   - Churned Customers: =ROUND(E22*Assumptions!C42,0)
   - Ending Customers: =E22+E23-E24
   - ARPU: =Assumptions!C43*(1+Assumptions!C44)^(COLUMN()-5)
   - Revenue: =E25*E26

D. Cohort Analysis (Rows 42-70)
   [Complex cohort retention matrix]
   - Cohort 1: =IF($B43<=E$42,$C43*VLOOKUP(E$42-$B43,RetentionCurve,2,TRUE),0)
   - Total Revenue: =SUM(E43:E70)

E. Segment Analysis (Rows 72-90)
   - Segment A Revenue: =Assumptions!D50*E25*0.6
   - Segment B Revenue: =Assumptions!D51*E25*0.3
   - Segment C Revenue: =Assumptions!D52*E25*0.1
   - Total: =SUM(E72:E74)
```

### 4. P&L TAB
**Purpose:** Income statement with detailed margin analysis

**Contents:**
```excel
A. Revenue Section (Rows 1-10)
   - Gross Revenue: =RevenueBuild!E35
   - Discounts & Returns: =-E5*Assumptions!C55
   - Net Revenue: =E5+E6

B. Cost of Goods Sold (Rows 12-20)
   - Direct Labor: =E8*Assumptions!C60
   - Materials: =E8*Assumptions!C61
   - Other Direct Costs: =E8*Assumptions!C62
   - Total COGS: =SUM(E13:E15)
   - Gross Profit: =E8-E16
   - Gross Margin %: =E17/E8

C. Operating Expenses (Rows 22-35)
   - Sales & Marketing: =E8*Assumptions!C65
   - General & Admin: =E8*Assumptions!C66
   - Research & Development: =E8*Assumptions!C67
   - Total OpEx: =SUM(E23:E25)
   - EBITDA: =E17-E26
   - EBITDA Margin %: =E27/E8

D. Below EBITDA (Rows 37-50)
   - Depreciation: =BalanceSheet!E45/Assumptions!C70
   - Amortization: =BalanceSheet!E50/Assumptions!C71
   - EBIT: =E27-E30-E31
   - Interest Expense: =DebtSchedule!E15
   - EBT: =E32-E33
   - Tax: =MAX(0,E34*Assumptions!C75)
   - Net Income: =E34-E35
```

### 5. BALANCE SHEET TAB
**Purpose:** Complete balance sheet with working capital dynamics

**Contents:**
```excel
A. Assets Section (Rows 1-30)
   Current Assets:
   - Cash: =CashFlow!E60
   - Accounts Receivable: =P&L!E8/365*Assumptions!C80
   - Inventory: =P&L!E16/365*Assumptions!C81
   - Prepaid Expenses: =P&L!E26/12
   - Total Current Assets: =SUM(E5:E8)
   
   Fixed Assets:
   - PP&E Opening: =D15
   - Capex Additions: =P&L!E8*Assumptions!C85
   - Depreciation: =-P&L!E30
   - PP&E Closing: =E15+E16+E17
   
   Other Assets:
   - Intangibles: =IF(E3=StartYear,Assumptions!C90,D20)
   - Goodwill: =IF(E3=StartYear,Assumptions!C91,D21)
   - Total Assets: =E10+E18+E20+E21

B. Liabilities Section (Rows 32-50)
   Current Liabilities:
   - Accounts Payable: =P&L!E16/365*Assumptions!C82
   - Accrued Expenses: =P&L!E26/12
   - Current Portion LTD: =DebtSchedule!E20
   - Total Current Liabs: =SUM(E33:E35)
   
   Long-Term Debt:
   - Opening Balance: =DebtSchedule!D30
   - New Borrowings: =DebtSchedule!E31
   - Repayments: =-DebtSchedule!E20
   - Closing Balance: =E38+E39+E40

C. Equity Section (Rows 52-60)
   - Share Capital: =IF(E3=StartYear,Assumptions!C95,D53)
   - Retained Earnings: =D54+P&L!E37
   - Total Equity: =E53+E54
   - Total Liab & Equity: =E37+E41+E55
   
D. Balance Check:
   - Check: =E23-E56 [Should equal 0]
```

### 6. CASH FLOW TAB
**Purpose:** Cash flow statement linking P&L and balance sheet

**Contents:**
```excel
A. Operating Cash Flow (Rows 1-20)
   - Net Income: =P&L!E37
   - Add: Depreciation: =P&L!E30
   - Add: Amortization: =P&L!E31
   - Working Capital Changes:
     - (Increase) in AR: =-(BalanceSheet!E6-BalanceSheet!D6)
     - (Increase) in Inventory: =-(BalanceSheet!E7-BalanceSheet!D7)
     - Increase in AP: =BalanceSheet!E33-BalanceSheet!D33
   - Operating Cash Flow: =SUM(E5:E10)

B. Investing Cash Flow (Rows 22-30)
   - Capex: =-BalanceSheet!E16
   - Acquisitions: =-Assumptions!C100*(E3=StartYear)
   - Asset Sales: =Assumptions!C101
   - Investing Cash Flow: =SUM(E23:E25)

C. Financing Cash Flow (Rows 32-45)
   - Debt Drawdown: =DebtSchedule!E31
   - Debt Repayment: =-DebtSchedule!E20
   - Interest Paid: =-DebtSchedule!E15
   - Dividends: =-MAX(0,P&L!E37*Assumptions!C105)
   - Equity Investment: =Assumptions!C95*(E3=StartYear)
   - Financing Cash Flow: =SUM(E33:E37)

D. Cash Reconciliation (Rows 47-55)
   - Beginning Cash: =D50
   - Total Cash Flow: =E11+E26+E38
   - Ending Cash: =E50+E51
   - Min Cash Balance: =MAX(E52,Assumptions!C110)
```

### 7. DEBT SCHEDULE TAB
**Purpose:** Detailed debt modeling with covenants

**Contents:**
```excel
A. Debt Terms (Rows 1-15)
   - Facility Size: =Assumptions!B18
   - Interest Rate: =Assumptions!B19
   - Term (Years): =Assumptions!B20
   - Amortization Type: =Assumptions!B21

B. Debt Schedule (Rows 17-35)
   - Beginning Balance: =IF(E3=StartYear,0,D30)
   - Drawdown: =IF(E3=StartYear,Assumptions!B18,0)
   - Scheduled Amortization: =IF(Assumptions!B21="Bullet",0,E18/Assumptions!B20)
   - Mandatory Prepayment: =MAX(0,CashFlow!E52-Assumptions!C110)*0.5
   - Total Repayment: =E20+E21
   - Ending Balance: =E18+E19-E22
   
   - Interest Expense: =AVERAGE(E18,E23)*Assumptions!B19
   - Origination Fee: =E19*Assumptions!B23*(E3=StartYear)
   - Exit Fee: =E23*Assumptions!B24*(E3=EndYear)
   - Total Debt Service: =E22+E25+E26+E27

C. Covenant Testing (Rows 37-50)
   - EBITDA: =P&L!E27
   - Debt/EBITDA: =E23/E30
   - Max Allowed: =VLOOKUP(E3,CovenantSchedule,2,TRUE)
   - Headroom %: =(E32-E31)/E32
   - PASS/FAIL: =IF(E31<=E32,"PASS","FAIL")
   
   - Interest Coverage: =E30/E25
   - Min Required: =VLOOKUP(E3,CovenantSchedule,3,TRUE)
   - PASS/FAIL: =IF(E36>=E37,"PASS","FAIL")
   
   - DSCR: =(E30-CashFlow!E10)/E28
   - Min Required: =VLOOKUP(E3,CovenantSchedule,4,TRUE)
   - PASS/FAIL: =IF(E40>=E41,"PASS","FAIL")
```

### 8. RETURNS TAB
**Purpose:** Investment returns and exit analysis

**Contents:**
```excel
A. Investment Cash Flows (Rows 1-15)
   - Initial Investment: =-Assumptions!B17
   - Interest Received: =DebtSchedule!E25
   - Fees Received: =DebtSchedule!E26+DebtSchedule!E27
   - Principal Repayment: =DebtSchedule!E22
   - Exit Proceeds: =IF(E3=EndYear,DebtSchedule!E23,0)
   - Net Cash Flow: =SUM(E5:E9)

B. Returns Metrics (Rows 17-25)
   - IRR: =IRR(E10:J10)
   - MOIC: =SUM(F10:J10)/ABS(E10)
   - NPV @10%: =NPV(0.1,F10:J10)+E10
   - Payback Period: [Complex formula to find breakeven]

C. Scenario Analysis (Rows 27-45)
   Base Case:
   - Recovery %: 100%
   - IRR: =IRR(BaseCase)
   - MOIC: =SUM(BaseCase)/Initial
   
   Bull Case (120% recovery):
   - IRR: =IRR(BullCase)
   - MOIC: =SUM(BullCase)/Initial
   
   Bear Case (50% recovery):
   - IRR: =IRR(BearCase)
   - MOIC: =SUM(BearCase)/Initial
```

### 9. CAPITAL STRUCTURE TAB
**Purpose:** Complete capital structure and waterfall analysis

**Contents:**
```excel
A. Sources & Uses (Rows 1-20)
   Sources:
   - Senior Debt: =DebtSchedule!E19
   - Mezzanine Debt: =Assumptions!C120
   - Preferred Equity: =Assumptions!C121
   - Common Equity: =Assumptions!C122
   - Total Sources: =SUM(E5:E8)
   
   Uses:
   - Purchase Price: =Assumptions!C125
   - Transaction Fees: =Assumptions!C126
   - Working Capital: =Assumptions!C127
   - Cash to Balance: =E9-SUM(E11:E13)
   - Total Uses: =SUM(E11:E14)

B. Capital Structure (Rows 22-40)
   - Senior Debt: Amount, %, Rate, Annual Interest
   - Mezzanine: Amount, %, Rate, Annual Interest
   - Preferred: Amount, %, Dividend Rate, Annual Dividend
   - Common: Amount, %
   - Total: =SUM(amounts)

C. Pro Forma Metrics (Rows 42-55)
   - Total Debt/EBITDA: =(E23+E24)/P&L!F27
   - Senior Debt/EBITDA: =E23/P&L!F27
   - EBITDA/Interest: =P&L!F27/(E23*E25+E24*E26)
   - Equity Cushion %: =(E27+E28)/E30
```

### 10. WATERFALL TAB
**Purpose:** Distribution waterfall in various exit scenarios

**Contents:**
```excel
A. Exit Assumptions (Rows 1-10)
   - Exit Year: =Assumptions!C130
   - Exit Multiple: =Assumptions!C131
   - Enterprise Value: =P&L!J27*E6
   - Less: Net Debt: =DebtSchedule!J23-BalanceSheet!J5
   - Equity Value: =E7-E8

B. Distribution Waterfall (Rows 12-50)
   Scenario: Liquidation (50% recovery)
   - Gross Proceeds: =E9*0.5
   - Transaction Costs: =-E13*0.02
   - Available for Distribution: =E13+E14
   
   Priority 1: Senior Debt
   - Outstanding Principal: =DebtSchedule!J23
   - Accrued Interest: =DebtSchedule!J25*0.25
   - Exit Fee: =E17*Assumptions!B24
   - Total Senior Claim: =SUM(E17:E19)
   - Amount Distributed: =MIN(E15,E20)
   - Remaining: =E15-E21
   
   Priority 2: Mezzanine Debt
   - Outstanding + PIK: =CapStructure!E24*(1+CapStructure!E26)^5
   - Amount Distributed: =MIN(E22,E24)
   - Remaining: =E22-E25
   
   Priority 3: Preferred Equity
   - Liquidation Preference: =CapStructure!E27*1.5
   - Accrued Dividends: =CapStructure!E27*CapStructure!E29*5
   - Amount Distributed: =MIN(E26,E28+E29)
   - Remaining: =E26-E30
   
   Priority 4: Common Equity
   - Amount Distributed: =E31
   - % to Investors: =CapStructure!E28/CapStructure!E30
   - % to Management: =1-E33
   - Investor Proceeds: =E32*E33
   - Management Proceeds: =E32*E34

C. Returns by Security (Rows 52-65)
   Senior Debt:
   - Invested: =CapStructure!E23
   - Returned: =E21
   - MOIC: =E38/E37
   - IRR: =(E38/E37)^(1/5)-1
   
   [Repeat for each security class]

D. Sensitivity Analysis (Rows 67-85)
   Exit Multiple Sensitivity:
   - Creates matrix of returns at different exit multiples
   - Row headers: 3.0x to 7.0x
   - Column headers: Different leverage scenarios
   - Returns calculated for each intersection
```

---

## Agent Workflow Process

### Phase 1: Data Collection Workflow
```python
# 1. Research Agent Tasks
research_tasks = {
    "market_data": {
        "search_queries": [
            f"{company_name} revenue financial results",
            f"{industry} market size growth rate {country}",
            f"{industry} gross margins industry average",
            f"interest rates {country} corporate loans {year}"
        ],
        "sources": ["web_search", "company_website", "regulatory_filings"],
        "outputs": ["revenue_history", "growth_rates", "market_size", "peer_margins"]
    },
    
    "regulatory_data": {
        "authorities": {
            "sweden": ["Bolagsverket", "IVO", "Finansinspektionen"],
            "usa": ["SEC", "State_Registry", "IRS"],
            "uk": ["Companies_House", "FCA", "HMRC"]
        },
        "documents": ["annual_reports", "licenses", "permits"],
        "compliance_checks": ["registration_status", "tax_compliance", "regulatory_violations"]
    },
    
    "credit_data": {
        "providers": {
            "sweden": ["UC", "Creditsafe", "Bisnode"],
            "usa": ["Experian", "D&B", "Equifax"],
            "uk": ["Experian_UK", "Creditsafe_UK", "D&B_UK"]
        },
        "metrics": ["credit_score", "payment_history", "outstanding_debt", "legal_actions"]
    }
}

# 2. Data Validation Rules
validation_rules = {
    "revenue": {
        "min": 0,
        "max": market_size * 0.5,  # No more than 50% market share
        "growth_rate_max": 1.0,  # 100% max annual growth
        "consistency_check": "year_over_year_variance < 2.0"
    },
    
    "margins": {
        "gross_margin": {"min": 0, "max": 1.0},
        "ebitda_margin": {"min": -0.5, "max": 0.5},
        "net_margin": {"min": -0.5, "max": 0.3}
    },
    
    "leverage": {
        "debt_to_ebitda_max": 10.0,
        "interest_coverage_min": 1.0,
        "dscr_min": 1.0
    }
}
```

### Phase 2: Model Building Workflow
```python
# 3. Excel Model Creation Process
def create_financial_model(company_data):
    """
    Step-by-step process for building the Excel model
    """
    
    # Step 1: Create workbook structure
    workbook = create_workbook()
    tabs = [
        "Dashboard", "Assumptions", "RevenueBuild", "P&L", 
        "BalanceSheet", "CashFlow", "DebtSchedule", "Returns",
        "CapitalStructure", "Waterfall"
    ]
    
    for tab in tabs:
        workbook.add_worksheet(tab)
    
    # Step 2: Populate Assumptions
    assumptions = {
        # Company Info
        "company_name": company_data["name"],
        "sector": company_data["industry"],
        "currency": company_data["currency"],
        
        # Historical Data (from research)
        "base_revenue": company_data["last_year_revenue"],
        "historical_growth": calculate_cagr(company_data["revenue_history"]),
        "current_ebitda": company_data["last_year_ebitda"],
        "current_margin": company_data["ebitda_margin"],
        
        # Market Data
        "market_size": research_data["market_size"],
        "market_growth": research_data["market_cagr"],
        
        # Transaction Structure
        "loan_amount": proposed_loan_amount,
        "interest_rate": market_rate + credit_spread,
        "term_years": 5,
        
        # Projections (calculated)
        "revenue_growth": min(
            historical_growth,
            market_growth * 1.5,
            0.30  # Cap at 30%
        ),
        
        # Operating Assumptions (from comparables)
        "gross_margin": peer_average_gross_margin,
        "opex_percent": peer_average_opex_ratio,
        "capex_percent": industry_average_capex,
        
        # Working Capital (industry standards)
        "ar_days": industry_avg_ar_days,
        "ap_days": industry_avg_ap_days,
        "inventory_days": industry_avg_inventory_days
    }
    
    # Step 3: Build Revenue Projections
    revenue_projections = build_revenue_forecast(
        base=assumptions["base_revenue"],
        growth_rates=calculate_growth_trajectory(assumptions),
        method="conservative"  # Given distressed situation
    )
    
    # Step 4: Create P&L with checks
    pl_projections = {
        "revenue": revenue_projections,
        "cogs": revenue_projections * (1 - assumptions["gross_margin"]),
        "gross_profit": revenue_projections * assumptions["gross_margin"],
        "opex": revenue_projections * assumptions["opex_percent"],
        "ebitda": lambda r, gm, op: r * gm - r * op,
        
        # Validation
        "margin_check": ensure_positive_ebitda_by_year_3,
        "growth_check": ensure_reasonable_growth_rates
    }
    
    # Step 5: Link Balance Sheet
    balance_sheet_links = {
        "ar": "=P&L!Revenue / 365 * Assumptions!AR_Days",
        "inventory": "=P&L!COGS / 365 * Assumptions!Inventory_Days",
        "ap": "=P&L!COGS / 365 * Assumptions!AP_Days",
        "ppe": "=Prior_PPE + Capex - Depreciation",
        
        # Debt linking
        "current_portion": "=DebtSchedule!Current_Year_Principal",
        "long_term_debt": "=DebtSchedule!Ending_Balance - Current_Portion"
    }
    
    # Step 6: Cash Flow with circular reference handling
    cash_flow_construction = {
        "operating_cf": {
            "net_income": "=P&L!Net_Income",
            "add_back_da": "=P&L!Depreciation + P&L!Amortization",
            "working_capital": "=-∆AR - ∆Inventory + ∆AP"
        },
        
        "investing_cf": {
            "capex": "=-Revenue * Assumptions!Capex_Percent"
        },
        
        "financing_cf": {
            "debt_proceeds": "=IF(Year=1, Loan_Amount, 0)",
            "debt_repayment": "=-DebtSchedule!Principal_Payment",
            "interest": "=-DebtSchedule!Interest_Payment"
        },
        
        # Circular reference resolution
        "iterative_calc": True,
        "max_iterations": 100
    }
    
    # Step 7: Debt Schedule with Covenants
    debt_schedule = {
        "outstanding_balance": track_principal_balance(),
        "interest_calculation": "=Average_Balance * Interest_Rate",
        
        "covenant_tests": {
            "leverage_test": {
                "actual": "=Debt / EBITDA",
                "maximum": stepped_leverage_covenant(),
                "headroom": "=(Maximum - Actual) / Maximum",
                "status": "=IF(Actual <= Maximum, 'PASS', 'FAIL')"
            },
            
            "coverage_test": {
                "actual": "=EBITDA / Interest",
                "minimum": 1.25,
                "status": "=IF(Actual >= Minimum, 'PASS', 'FAIL')"
            },
            
            "dscr_test": {
                "actual": "=(EBITDA - Capex) / Total_Debt_Service",
                "minimum": 1.10,
                "status": "=IF(Actual >= Minimum, 'PASS', 'FAIL')"
            }
        }
    }
    
    return workbook
```

### Phase 3: Capital Structure & Waterfall Implementation
```python
# 4. Capital Structure Analysis
def build_capital_structure(transaction_data):
    """
    Creates comprehensive capital structure with multiple security types
    """
    
    capital_structure = {
        "senior_secured": {
            "amount": transaction_data["senior_debt"],
            "rate": base_rate + 2.5,
            "security": "First lien on all assets",
            "covenants": ["leverage", "coverage", "dscr"],
            "amortization": "5% annual",
            "maturity": 5
        },
        
        "mezzanine": {
            "amount": transaction_data.get("mezz_debt", 0),
            "rate": base_rate + 8.0,
            "pik_toggle": True,
            "security": "Second lien",
            "covenants": ["leverage"],
            "maturity": 6
        },
        
        "preferred_equity": {
            "amount": transaction_data.get("preferred", 0),
            "dividend_rate": 0.10,
            "cumulative": True,
            "liquidation_preference": 1.5,
            "conversion_option": False
        },
        
        "common_equity": {
            "amount": transaction_data.get("common", 0),
            "ownership_split": {
                "investors": 0.80,
                "management": 0.20
            }
        }
    }
    
    return capital_structure

# 5. Waterfall Analysis Implementation
def calculate_waterfall(exit_value, capital_structure, scenario="base"):
    """
    Calculates distribution waterfall based on priority
    """
    
    waterfall = {
        "gross_proceeds": exit_value,
        "transaction_costs": exit_value * 0.02,
        "available_for_distribution": exit_value * 0.98
    }
    
    remaining = waterfall["available_for_distribution"]
    
    # Priority 1: Senior Secured Debt
    senior_claim = (
        capital_structure["senior_secured"]["amount"] +
        calculate_accrued_interest(capital_structure["senior_secured"]) +
        calculate_exit_fee(capital_structure["senior_secured"])
    )
    
    waterfall["senior_distribution"] = min(remaining, senior_claim)
    remaining -= waterfall["senior_distribution"]
    
    # Priority 2: Mezzanine Debt (if any)
    if capital_structure.get("mezzanine"):
        mezz_claim = (
            capital_structure["mezzanine"]["amount"] +
            calculate_pik_interest(capital_structure["mezzanine"])
        )
        
        waterfall["mezz_distribution"] = min(remaining, mezz_claim)
        remaining -= waterfall["mezz_distribution"]
    
    # Priority 3: Preferred Equity (if any)
    if capital_structure.get("preferred_equity"):
        pref_claim = (
            capital_structure["preferred_equity"]["amount"] * 
            capital_structure["preferred_equity"]["liquidation_preference"] +
            calculate_cumulative_dividends(capital_structure["preferred_equity"])
        )
        
        waterfall["preferred_distribution"] = min(remaining, pref_claim)
        remaining -= waterfall["preferred_distribution"]
    
    # Priority 4: Common Equity
    if remaining > 0:
        waterfall["common_distribution"] = remaining
        waterfall["investor_proceeds"] = (
            remaining * capital_structure["common_equity"]["ownership_split"]["investors"]
        )
        waterfall["management_proceeds"] = (
            remaining * capital_structure["common_equity"]["ownership_split"]["management"]
        )
    else:
        waterfall["common_distribution"] = 0
        waterfall["investor_proceeds"] = 0
        waterfall["management_proceeds"] = 0
    
    # Calculate Returns
    waterfall["returns"] = calculate_security_returns(waterfall, capital_structure)
    
    return waterfall

def calculate_security_returns(waterfall, capital_structure):
    """
    Calculates IRR and MOIC for each security class
    """
    
    returns = {}
    
    # Senior Debt Returns
    if "senior_secured" in capital_structure:
        cash_flows = build_cash_flow_schedule(
            initial=-capital_structure["senior_secured"]["amount"],
            periodic_interest=calculate_quarterly_interest(capital_structure["senior_secured"]),
            final_payment=waterfall["senior_distribution"]
        )
        
        returns["senior_debt"] = {
            "irr": calculate_irr(cash_flows),
            "moic": sum(cash_flows[1:]) / abs(cash_flows[0]),
            "recovery": waterfall["senior_distribution"] / capital_structure["senior_secured"]["amount"]
        }
    
    # Similar calculations for other securities...
    
    return returns
```

### Phase 4: Validation and Error Checking
```python
# 6. Model Validation Framework
def validate_model(workbook):
    """
    Comprehensive validation of all model components
    """
    
    validation_checks = {
        "balance_sheet_balances": {
            "test": "Assets = Liabilities + Equity",
            "formula": "=ABS(Total_Assets - Total_Liabs_Equity) < 0.01",
            "all_periods": True
        },
        
        "cash_flow_reconciliation": {
            "test": "Beginning + Flow = Ending",
            "formula": "=ABS(Beginning_Cash + Total_CF - Ending_Cash) < 0.01",
            "all_periods": True
        },
        
        "debt_schedule_integrity": {
            "test": "Opening + Draw - Repay = Closing",
            "formula": "=ABS(Opening + Drawdown - Repayment - Closing) < 0.01",
            "all_periods": True
        },
        
        "returns_calculation": {
            "test": "IRR calculation matches manual",
            "formula": "=ABS(IRR(Cash_Flows) - Manual_IRR) < 0.0001"
        },
        
        "covenant_calculations": {
            "leverage": "=Debt/EBITDA calculated correctly",
            "coverage": "=EBITDA/Interest calculated correctly",
            "dscr": "=(EBITDA-Capex-Tax)/Debt_Service calculated correctly"
        },
        
        "waterfall_total": {
            "test": "Sum of distributions = Available proceeds",
            "formula": "=SUM(All_Distributions) = Available_For_Distribution"
        }
    }
    
    errors = []
    for check_name, check_details in validation_checks.items():
        if not perform_check(workbook, check_details):
            errors.append(f"FAILED: {check_name} - {check_details['test']}")
    
    return errors

# 7. Error Resolution Procedures
def resolve_common_errors():
    """
    Common Excel model errors and fixes
    """
    
    error_fixes = {
        "#REF!": {
            "cause": "Broken cell reference",
            "fix": "Trace precedents and update formulas"
        },
        
        "#DIV/0!": {
            "cause": "Division by zero",
            "fix": "Add IF(denominator=0, 0, formula) wrapper"
        },
        
        "#CIRCULAR!": {
            "cause": "Circular reference",
            "fix": "Enable iterative calculation or break circular logic"
        },
        
        "Balance_Sheet_Imbalance": {
            "cause": "Missing or incorrect linking",
            "fix": "Check all BS items link to CF and P&L"
        },
        
        "Negative_Cash": {
            "cause": "Insufficient funding or aggressive assumptions",
            "fix": "Add revolver or adjust working capital"
        },
        
        "Covenant_Breach": {
            "cause": "Aggressive projections",
            "fix": "Adjust growth/margin assumptions or covenant levels"
        }
    }
    
    return error_fixes
```

---

## Linking Methodology

### Best Practices for Formula Linking
```excel
1. ALWAYS link forward, never backward
   Good: BalanceSheet references P&L
   Bad: P&L references BalanceSheet

2. Create clear reference paths
   Dashboard → Assumptions → Operating Sheets → Analysis

3. Use named ranges for key inputs
   Name: "Initial_Revenue" = Assumptions!$B$15
   Usage: =Initial_Revenue * (1 + Growth_Rate)

4. Avoid hardcoding
   Bad: =E5 * 1.15
   Good: =E5 * (1 + Assumptions!$B$20)

5. Document complex formulas
   =E5 * (1 + $B$20) ' Base Revenue * (1 + Growth Rate)

6. Use error checking
   =IFERROR(E5/E6, 0) ' Prevents #DIV/0! errors

7. Maintain consistency
   All currency in same units (thousands, millions)
   All percentages in decimal format (0.15 not 15%)
```

---

## Formula Reference Library

### Key Financial Formulas
```excel
# Growth Calculations
CAGR = ((Ending_Value/Beginning_Value)^(1/Years)) - 1
YoY_Growth = (Current_Year/Prior_Year) - 1

# Profitability Metrics
Gross_Margin = Gross_Profit / Revenue
EBITDA_Margin = EBITDA / Revenue
Net_Margin = Net_Income / Revenue

# Leverage Metrics
Debt_to_EBITDA = Total_Debt / EBITDA
Net_Debt_to_EBITDA = (Total_Debt - Cash) / EBITDA
Interest_Coverage = EBITDA / Interest_Expense
DSCR = (EBITDA - Capex) / (Principal + Interest)

# Returns Calculations
IRR = IRR(Cash_Flow_Range)
MOIC = SUM(Positive_Cash_Flows) / ABS(Initial_Investment)
NPV = NPV(Discount_Rate, Future_Cash_Flows) + Initial_Cash_Flow

# Working Capital
NWC = Current_Assets - Current_Liabilities
Change_in_NWC = NWC_Current - NWC_Prior
Cash_Conversion_Cycle = AR_Days + Inventory_Days - AP_Days

# Valuation
EV = Equity_Value + Net_Debt
EV_to_EBITDA = Enterprise_Value / EBITDA
P/E_Ratio = Share_Price / EPS
```

---

## Implementation Checklist

### Pre-Model Setup
- [ ] Gather 3 years historical financials
- [ ] Research industry comparables
- [ ] Obtain market growth rates
- [ ] Verify regulatory compliance
- [ ] Check credit reports

### Model Construction
- [ ] Create all 10 worksheets
- [ ] Input assumptions with sources
- [ ] Build revenue projections
- [ ] Complete P&L with margins
- [ ] Link balance sheet items
- [ ] Create cash flow statement
- [ ] Build debt schedule with covenants
- [ ] Calculate returns metrics
- [ ] Construct capital structure
- [ ] Implement waterfall analysis

### Validation Steps
- [ ] Balance sheet balances (all periods)
- [ ] Cash flow reconciliation
- [ ] Debt schedule integrity
- [ ] Returns calculation accuracy
- [ ] Covenant calculations
- [ ] Waterfall distribution totals
- [ ] Scenario analysis sensitivities

### Documentation
- [ ] Note all assumptions
- [ ] Document data sources
- [ ] Explain complex formulas
- [ ] Create user guide
- [ ] Include validation checks

---

## Automated Workflow Script

```python
def complete_financial_model_workflow(company_name, loan_amount, country="sweden"):
    """
    End-to-end automated financial modeling workflow
    """
    
    # Phase 1: Research
    print(f"Phase 1: Researching {company_name}...")
    research_data = conduct_research(company_name, country)
    
    # Phase 2: Data Validation
    print("Phase 2: Validating data...")
    validated_data = validate_research_data(research_data)
    
    # Phase 3: Model Creation
    print("Phase 3: Building financial model...")
    excel_model = create_financial_model(validated_data)
    
    # Phase 4: Capital Structure
    print("Phase 4: Structuring transaction...")
    capital_structure = build_capital_structure({
        "senior_debt": loan_amount,
        "company_data": validated_data
    })
    
    # Phase 5: Returns Analysis
    print("Phase 5: Calculating returns...")
    returns = calculate_investment_returns(excel_model, capital_structure)
    
    # Phase 6: Stress Testing
    print("Phase 6: Running stress tests...")
    scenarios = run_scenario_analysis(excel_model, capital_structure)
    
    # Phase 7: Waterfall Analysis
    print("Phase 7: Building waterfall...")
    waterfall_results = {}
    for scenario in ["liquidation", "restructuring", "base_case", "upside"]:
        exit_value = calculate_exit_value(validated_data, scenario)
        waterfall_results[scenario] = calculate_waterfall(
            exit_value, 
            capital_structure, 
            scenario
        )
    
    # Phase 8: Validation
    print("Phase 8: Validating model...")
    errors = validate_model(excel_model)
    if errors:
        print(f"Validation errors found: {errors}")
        excel_model = fix_errors(excel_model, errors)
    
    # Phase 9: Output Generation
    print("Phase 9: Generating outputs...")
    outputs = {
        "excel_model": excel_model,
        "investment_memo": generate_investment_memo(validated_data, returns),
        "credit_package": prepare_credit_package(validated_data, capital_structure),
        "dashboard": create_executive_dashboard(excel_model)
    }
    
    print(f"Workflow complete for {company_name}")
    return outputs

# Execute the workflow
if __name__ == "__main__":
    results = complete_financial_model_workflow(
        company_name="Almis Hemtjänst Service AB",
        loan_amount=5000000,
        country="sweden"
    )
```

---

## Notes for Generalization

To apply this model to any company:

1. **Adjust Industry Metrics**: Replace healthcare-specific assumptions with relevant industry metrics
2. **Modify Revenue Build**: Use appropriate revenue model (SaaS=MRR, Retail=SSS, Manufacturing=Volume×Price)
3. **Update Regulations**: Change regulatory authorities and compliance requirements by jurisdiction
4. **Scale Complexity**: Add/remove tranches in capital structure based on deal size
5. **Customize Covenants**: Adjust covenant levels based on industry norms and risk profile
6. **Tailor Scenarios**: Create industry-specific stress scenarios (pandemic for healthcare, recession for retail)

This framework provides a complete, institutional-grade financial model that can be adapted to any company or industry with appropriate modifications to assumptions and structural elements.