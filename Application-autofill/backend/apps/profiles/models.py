from django.db import models
from django.contrib.auth.models import User

class Profile(models.Model):
    """Personal and professional profile of the job applicant."""
    user = models.OneToOneField(User, on_delete=models.CASCADE, related_name='profile', null=True, blank=True)
    first_name = models.CharField(max_length=100, default='')
    middle_name = models.CharField(max_length=100, blank=True, default='')
    last_name = models.CharField(max_length=100, default='')
    preferred_name = models.CharField(max_length=100, blank=True, default='')
    email = models.EmailField(default='')
    phone = models.CharField(max_length=50, default='')
    address = models.CharField(max_length=255, blank=True, default='')
    city = models.CharField(max_length=100, blank=True, default='')
    state = models.CharField(max_length=100, blank=True, default='')
    country = models.CharField(max_length=100, blank=True, default='')
    postal_code = models.CharField(max_length=30, blank=True, default='')

    # Professional Info
    current_title = models.CharField(max_length=150, blank=True, default='')
    current_company = models.CharField(max_length=150, blank=True, default='')
    years_experience = models.CharField(max_length=50, blank=True, default='')
    professional_summary = models.TextField(blank=True, default='')
    notice_period = models.CharField(max_length=100, blank=True, default='')
    expected_salary = models.CharField(max_length=100, blank=True, default='')
    current_salary = models.CharField(max_length=100, blank=True, default='')
    preferred_job_title = models.CharField(max_length=150, blank=True, default='')
    work_authorization = models.CharField(max_length=255, blank=True, default='')
    require_sponsorship = models.CharField(max_length=10, default='No')
    willing_to_relocate = models.CharField(max_length=10, default='Yes')

    # Professional Links
    linkedin_url = models.URLField(blank=True, default='')
    github_url = models.URLField(blank=True, default='')
    portfolio_url = models.URLField(blank=True, default='')
    personal_website = models.URLField(blank=True, default='')

    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return f"{self.first_name} {self.last_name} ({self.current_title})"


class Education(models.Model):
    """Educational records of the applicant."""
    profile = models.ForeignKey(Profile, on_delete=models.CASCADE, related_name='educations', null=True, blank=True)
    degree = models.CharField(max_length=200)
    institution = models.CharField(max_length=200)
    field_of_study = models.CharField(max_length=200, blank=True, default='')
    start_date = models.CharField(max_length=50, blank=True, default='')
    end_date = models.CharField(max_length=50, blank=True, default='')
    grade_gpa = models.CharField(max_length=50, blank=True, default='')

    def __str__(self):
        return f"{self.degree} at {self.institution}"


class Experience(models.Model):
    """Employment history records."""
    profile = models.ForeignKey(Profile, on_delete=models.CASCADE, related_name='experiences', null=True, blank=True)
    company = models.CharField(max_length=200)
    title = models.CharField(max_length=200)
    location = models.CharField(max_length=200, blank=True, default='')
    start_date = models.CharField(max_length=50, blank=True, default='')
    end_date = models.CharField(max_length=50, blank=True, default='Present')
    is_current = models.BooleanField(default=False)
    responsibilities = models.TextField(blank=True, default='')

    def __str__(self):
        return f"{self.title} at {self.company}"


class Skill(models.Model):
    """Technical and soft skills."""
    profile = models.ForeignKey(Profile, on_delete=models.CASCADE, related_name='skills', null=True, blank=True)
    name = models.CharField(max_length=100)
    level = models.CharField(max_length=50, default='Advanced') # Beginner, Intermediate, Advanced, Expert
    category = models.CharField(max_length=100, default='General')

    def __str__(self):
        return f"{self.name} ({self.level})"
