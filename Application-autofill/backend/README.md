# Job Application Autofill - Django Backend Service

This directory contains the production-grade Django + Django REST Framework (DRF) backend architecture specified in SRS v1.0 (Section 13, 14, 29).

## Architecture & Apps

- `apps/profiles/`: Candidate User Profile, multiple Education records, multiple Experience records, reusable Skills inventory.
- `apps/resumes/`: Multiple resume documents, default resume selector, cover letters.
- `apps/mappings/`: Learned Field Mappings, confidence scores, and domain-specific ATS website rules (Greenhouse, Lever, Workday, etc.).
- `apps/applications/`: Application tracking history, custom question answers.
- `apps/ai/`: Question classification and candidate-profile draft answer suggestions.
- `apps/accounts/`: User authentication and local session control.

## Running Locally

1. Create and activate a Python virtual environment:
```bash
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate
```

2. Install dependencies:
```bash
pip install -r requirements.txt
```

3. Run migrations:
```bash
python manage.py migrate
```

4. Start the Django development server:
```bash
python manage.py runserver 8000
```

The REST API will be accessible at `http://localhost:8000/api/v1/` and the admin panel at `http://localhost:8000/admin/`.
