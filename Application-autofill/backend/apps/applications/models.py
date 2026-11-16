from django.db import models
from apps.profiles.models import Profile

class Application(models.Model):
    """Job application record tracked by the extension."""
    STATUS_CHOICES = [
        ('Draft', 'Draft'),
        ('Applied', 'Applied'),
        ('Reviewing', 'Reviewing'),
        ('Interviewing', 'Interviewing'),
        ('Archived', 'Archived'),
    ]

    profile = models.ForeignKey(Profile, on_delete=models.CASCADE, related_name='applications', null=True, blank=True)
    company = models.CharField(max_length=150)
    job_title = models.CharField(max_length=150)
    portal_url = models.URLField(max_length=500)
    status = models.CharField(max_length=50, choices=STATUS_CHOICES, default='Draft')
    detected_fields_count = models.IntegerField(default=0)
    autofilled_count = models.IntegerField(default=0)
    notes = models.TextField(blank=True, default='')
    applied_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"{self.job_title} at {self.company} ({self.status})"


class ApplicationAnswer(models.Model):
    """Answers entered or suggested for custom questions on this application."""
    application = models.ForeignKey(Application, on_delete=models.CASCADE, related_name='answers')
    question_text = models.TextField()
    answer_text = models.TextField()
    is_ai_generated = models.BooleanField(default=False)
    user_approved = models.BooleanField(default=True)
    created_at = models.DateTimeField(auto_now_add=True)
