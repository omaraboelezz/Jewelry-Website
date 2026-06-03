from django.conf import settings
from rest_framework.decorators import api_view
from rest_framework.response import Response
from rest_framework import status
from rest_framework_simplejwt.tokens import RefreshToken

@api_view(['POST', 'GET'])
def login_view(request):
    if request.method == 'GET':
        return Response({"message": "Use POST with username and password"})
    
    username = request.data.get("username")
    password = request.data.get("password")

    if not username or not password:
        return Response(
            {"message": "Username and password required"},
            status=status.HTTP_400_BAD_REQUEST
        )

    # التحقق من بيانات الدخول
    for account in settings.ADMIN_ACCOUNTS:
        if account["username"] == username and account["password"] == password:
            # ✅ إنشاء JWT Tokens
            refresh = RefreshToken()
            refresh['username'] = username
            refresh['role'] = account['role']
            
            return Response({
                "success": True,
                "username": username,
                "role": account["role"],
                "access_token": str(refresh.access_token),
                "refresh_token": str(refresh)
            })

    return Response(
        {"success": False, "message": "Invalid credentials"},
        status=status.HTTP_401_UNAUTHORIZED
    )


# ✅ أضف الـ function الجديدة دي
@api_view(['POST'])
def refresh_token_view(request):
    refresh_token = request.data.get("refresh")
    
    if not refresh_token:
        return Response(
            {"error": "Refresh token required"},
            status=status.HTTP_400_BAD_REQUEST
        )
    
    try:
        refresh = RefreshToken(refresh_token)
        return Response({
            "access": str(refresh.access_token)
        })
    except Exception as e:
        return Response(
            {"error": "Invalid refresh token"},
            status=status.HTTP_401_UNAUTHORIZED
        )
    
    