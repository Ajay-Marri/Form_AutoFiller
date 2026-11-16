from django.urls import path
from rest_framework.views import APIView
from rest_framework.response import Response

class CurrentUserView(APIView):
    def get(self, request):
        return Response({
            'username': 'alex_morgan',
            'email': 'alex.morgan@example.com',
            'is_local_user': True
        })

urlpatterns = [
    path('me/', CurrentUserView.as_view(), name='account-me'),
]
