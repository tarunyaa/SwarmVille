---
version: 1.0.0
lastUpdated: 2025-9-15
author: tarunyaas & claude-4-opus
dependencies: N/A
description: Security rules for preventing sensitive data exposure in code repositories, including API keys, passwords, and pricing information.
alwaysAllow: false
---
# Safety Rules - Protecting Sensitive Information

## Core Principle
**NEVER commit sensitive information to version control.** Once committed, sensitive data remains in Git history even if deleted later.

## 1. API Keys and Tokens

### What NOT to Commit:
- API keys (OpenAI, AWS, Azure, GCP, etc.)
- Authentication tokens
- OAuth credentials
- Service account keys

### Safe Practices:
```python
# BAD: Never hardcode secrets
api_key = "sk-1234567890abcdef"
openai.api_key = "sk-real-key-here"

# BEST PRACTICE: Use python-dotenv with .env files
from dotenv import load_dotenv
import os

# Load .env file
load_dotenv()

# Access the API key
api_key = os.getenv('OPENAI_API_KEY')
if not api_key:
    raise ValueError("OPENAI_API_KEY not found in .env file")

# Setup .env file (example):
# .env
# OPENAI_API_KEY=your-actual-api-key-here
# DATABASE_URL=postgresql://user:pass@localhost/db

# ALTERNATIVE: Direct environment variables (less convenient for development)
api_key = os.environ.get('OPENAI_API_KEY')
```

## 2. Passwords and Credentials

### What NOT to Commit:
- Database passwords
- Admin credentials
- SSH private keys
- Certificate private keys
- Any form of authentication credentials

### Safe Practices:
```python
# BAD: Hardcoded database credentials
connection = psycopg2.connect(
    host="localhost",
    database="mydb",
    user="admin",
    password="mysecretpassword"
)

# BEST PRACTICE: Use .env files with python-dotenv
from dotenv import load_dotenv
import os
import psycopg2

# Load environment variables from .env file
load_dotenv()

# Connect using environment variables
connection = psycopg2.connect(
    host=os.getenv('DB_HOST', 'localhost'),
    database=os.getenv('DB_NAME'),
    user=os.getenv('DB_USER'),
    password=os.getenv('DB_PASSWORD')
)

# Your .env file should contain:
# DB_HOST=localhost
# DB_NAME=mydb
# DB_USER=admin
# DB_PASSWORD=your-actual-password
```

## 3. Pricing and Financial Information

### What NOT to Commit to Public Repos:
- Internal pricing strategies
- Cost calculations
- Profit margins
- Vendor pricing agreements
- Customer-specific pricing
- Financial projections
- Proprietary business metrics

### Examples to Avoid:
```python
# BAD: Never expose pricing logic in public repos
PROFIT_MARGIN = 0.45  # 45% margin
VENDOR_COST = 10.50
CUSTOMER_PRICE = VENDOR_COST * (1 + PROFIT_MARGIN)

# BAD: Internal cost structures
AWS_INTERNAL_DISCOUNT = 0.3  # 30% partner discount
COST_PER_GPU_HOUR = 2.48
```

## 4. Implementation Guidelines

### Use .gitignore Appropriately:

**IMPORTANT**: Only add files to .gitignore when they:
1. Actually exist in your project
2. Contain real sensitive information
3. Should not be tracked in version control

**DO NOT** blindly add files to .gitignore just because:
- The filename sounds sensitive (e.g., "config.py")
- It's in a template or example

### Example .gitignore entries (add ONLY if these files exist and contain secrets):
```gitignore
# Environment files
.env
.env.local
.env.*.local
env/
venv/

# Config files with secrets
config/secrets.py
config/api_keys.json
*.key
*.pem
```

## Remember
- **Always use .env files with python-dotenv for API keys**
- **When in doubt, don't commit it**
- **Secrets in Git history are compromised forever**
- **Only add files to .gitignore when they exist and contain secrets**
