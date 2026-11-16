from rest_framework import serializers, viewsets
from .models import Application, ApplicationAnswer

class ApplicationAnswerSerializer(serializers.ModelSerializer):
    class Meta:
        model = ApplicationAnswer
        fields = '__all__'

class ApplicationSerializer(serializers.ModelSerializer):
    answers = ApplicationAnswerSerializer(many=True, read_only=True)

    class Meta:
        model = Application
        fields = '__all__'

class ApplicationViewSet(viewsets.ModelViewSet):
    queryset = Application.objects.all().order_by('-applied_at')
    serializer_class = ApplicationSerializer
