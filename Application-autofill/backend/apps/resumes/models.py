from django.db import models
from apps.profiles.models import Profile

class Resume(models.Model):
    profile = models.ForeignKey(Profile, on_delete=models.CASCADE, related_name='resumes', null=True, blank=True)
    title = models.CharField(max_length=200)
    file = models.FileField(upload_to='resumes/', null=True, blank=True)
    file_name = models.CharField(max_length=255, default='resume.pdf')
    file_size = models.CharField(max_length=50, default='140 KB')
    is_default = models.BooleanField(default=False)
    parsed_text = models.TextField(blank=True, default='')
    uploaded_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        status = 'Default' if self.is_default else 'Secondary'
        return f"{self.title} ({status})"


class CoverLetter(models.Model):
    profile = models.ForeignKey(Profile, on_delete=models.CASCADE, related_name='cover_letters', null=True, blank=True)
    title = models.CharField(max_length=200)
    content = models.TextField()
    target_company = models.CharField(max_length=150, blank=True, default='')
    target_role = models.CharField(max_length=150, blank=True, default='')
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"Cover Letter: {self.title}"
