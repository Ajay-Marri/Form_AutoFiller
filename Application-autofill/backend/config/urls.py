"""
URL configuration for Job Application Autofill Backend.
"""
from django.contrib import admin
from django.urls import path, include
from rest_framework.routers import DefaultRouter
from apps.profiles.views import ProfileViewSet, EducationViewSet, ExperienceViewSet, SkillViewSet
from apps.resumes.views import ResumeViewSet
from apps.mappings.views import FieldMappingViewSet, WebsiteRuleViewSet
from apps.applications.views import ApplicationViewSet

router = DefaultRouter()
router.register(r'profiles', ProfileViewSet, basename='profile')
router.register(r'educations', EducationViewSet, basename='education')
router.register(r'experiences', ExperienceViewSet, basename='experience')
router.register(r'skills', SkillViewSet, basename='skill')
router.register(r'resumes', ResumeViewSet, basename='resume')
router.register(r'mappings', FieldMappingViewSet, basename='mapping')
router.register(r'website-rules', WebsiteRuleViewSet, basename='website-rule')
router.register(r'applications', ApplicationViewSet, basename='application')

urlpatterns = [
    path('admin/', admin.site.urls),
    path('api/v1/', include(router.urls)),
    path('api/v1/accounts/', include('apps.accounts.urls')),
]
