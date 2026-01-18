"""
Views для аутентификации и работы со схемами.
"""
import logging
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from django.views.decorators.csrf import csrf_exempt
from django.utils.decorators import method_decorator
from django.http import JsonResponse

from ..services.autograph import AutoGraphService
from ..serializers import LoginSerializer

logger = logging.getLogger(__name__)
service = AutoGraphService()


@method_decorator(csrf_exempt, name='dispatch')
class LoginView(APIView):
    """
    Авторизация в AutoGRAPH API.
    POST /api/auth/login/
    """

    def post(self, request):
        # Валидация входных данных
        serializer = LoginSerializer(data=request.data)
        if not serializer.is_valid():
            return Response({
                'error': 'Invalid data',
                'details': serializer.errors
            }, status=status.HTTP_400_BAD_REQUEST)

        username = serializer.validated_data['username']
        password = serializer.validated_data['password']

        try:
            # Получаем session_id из AutoGRAPH
            session_id = service.get_session_token(username, password)

            if not session_id:
                return Response({
                    'error': 'Authentication failed'
                }, status=status.HTTP_401_UNAUTHORIZED)

            return Response({
                'success': True,
                'session_id': session_id,
                'message': 'Authentication successful'
            })

        except Exception as e:
            logger.error(f"Login error: {e}")
            return Response({
                'error': f'Login failed: {str(e)}'
            }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


@method_decorator(csrf_exempt, name='dispatch')
class SchemaListView(APIView):
    """
    Получение списка схем из AutoGRAPH.
    GET /api/schemas/?session_id=<session_id>
    """

    def get(self, request):
        session_id = request.GET.get('session_id')

        if not session_id:
            return JsonResponse({
                'error': 'session_id parameter is required'
            }, status=400)

        try:
            # Получаем схемы из AutoGRAPH
            schemas = service.get_schemas(session_id)

            # Простой ответ
            return JsonResponse({
                'success': True,
                'schemas': schemas if schemas else [],
                'count': len(schemas) if schemas else 0
            })

        except Exception as e:
            logger.error(f"Error fetching schemas: {e}")
            return JsonResponse({
                'error': f'Failed to fetch schemas: {str(e)}'
            }, status=500)