from rest_framework import viewsets
from rest_framework.decorators import action
from rest_framework.response import Response
from .models import Profile, Education, Experience, Skill
from .serializers import ProfileSerializer, EducationSerializer, ExperienceSerializer, SkillSerializer

class ProfileViewSet(viewsets.ModelViewSet):
    queryset = Profile.objects.all()
    serializer_class = ProfileSerializer

    @action(detail=False, methods=['get', 'put'])
    def me(self, request):
        profile = Profile.objects.first()
        if not profile:
            profile = Profile.objects.create(
                first_name='Alex',
                last_name='Morgan',
                email='alex.morgan@example.com',
                phone='+1 (555) 382-9012',
                current_title='Senior Full Stack Engineer'
            )
        if request.method == 'PUT':
            serializer = self.get_serializer(profile, data=request.data, partial=True)
            serializer.is_valid(raise_exception=True)
            serializer.save()
            return Response(serializer.data)
        serializer = self.get_serializer(profile)
        return Response(serializer.data)


class EducationViewSet(viewsets.ModelViewSet):
    queryset = Education.objects.all()
    serializer_class = EducationSerializer


class ExperienceViewSet(viewsets.ModelViewSet):
    queryset = Experience.objects.all()
    serializer_class = ExperienceSerializer


class SkillViewSet(viewsets.ModelViewSet):
    queryset = Skill.objects.all()
    serializer_class = SkillSerializer
