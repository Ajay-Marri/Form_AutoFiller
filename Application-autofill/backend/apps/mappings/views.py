from rest_framework import serializers, viewsets
from .models import FieldMapping, WebsiteRule


class FieldMappingSerializer(serializers.ModelSerializer):
    class Meta:
        model = FieldMapping
        fields = '__all__'


class WebsiteRuleSerializer(serializers.ModelSerializer):
    class Meta:
        model = WebsiteRule
        fields = '__all__'


class FieldMappingViewSet(viewsets.ModelViewSet):
    queryset = FieldMapping.objects.all().order_by('-times_used')
    serializer_class = FieldMappingSerializer


class WebsiteRuleViewSet(viewsets.ModelViewSet):
    queryset = WebsiteRule.objects.all()
    serializer_class = WebsiteRuleSerializer
