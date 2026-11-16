from django.db import models

class FieldMapping(models.Model):
    """Learned or defined mapping between DOM field identifier and profile attribute."""
    site_domain = models.CharField(max_length=255, default='*')
    field_identifier = models.CharField(max_length=255)
    profile_field = models.CharField(max_length=100)
    confidence = models.IntegerField(default=95)
    times_used = models.IntegerField(default=1)
    is_active = models.BooleanField(default=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return f"[{self.site_domain}] {self.field_identifier} -> {self.profile_field}"


class WebsiteRule(models.Model):
    """Specific scraping and filling strategies for major ATS portals."""
    domain_pattern = models.CharField(max_length=255, unique=True)
    name = models.CharField(max_length=150)
    is_multistep = models.BooleanField(default=False)
    custom_selector_overrides = models.JSONField(default=dict, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"{self.name} ({self.domain_pattern})"
