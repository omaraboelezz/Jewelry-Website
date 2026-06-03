from rest_framework import status
from rest_framework.decorators import api_view, parser_classes
from rest_framework.response import Response
from .models import Badge, Product, Section, AdminUser, AdminSession, LoginAttempt, MetalPrice
from .serializers import BadgeSerializer, ProductSerializer, SectionSerializer, MetalPriceSerializer
from rest_framework.parsers import MultiPartParser, FormParser
import json



# ==================== HELPER FUNCTIONS ====================

def get_client_ip(request):
    """Get client IP address"""
    x_forwarded_for = request.META.get('HTTP_X_FORWARDED_FOR')
    if x_forwarded_for:
        ip = x_forwarded_for.split(',')[0]
    else:
        ip = request.META.get('REMOTE_ADDR')
    return ip


def verify_admin_token(request):
    auth_header = request.headers.get('Authorization', '')
    if not auth_header.startswith('Bearer '):
        return None
    
    token = auth_header[7:]
    
    # 1. جرب البحث في الجلسات (AdminSession)
    try:
        session = AdminSession.objects.select_related('admin_user').get(token=token)
        if session.is_valid():
            return session
    except AdminSession.DoesNotExist:
        pass

    # 2. جرب التحقق كـ JWT (لأنك تستخدم SimpleJWT في الواجهة)
    try:
        from rest_framework_simplejwt.authentication import JWTAuthentication
        jwt_authenticator = JWTAuthentication()
        validated_token = jwt_authenticator.get_validated_token(token)
        user = jwt_authenticator.get_user(validated_token)
        
        if user:
            # ننشئ كائن وهمي (Mock) لكي لا يتعطل الكود في ملف views.py
            class MockSession:
                def __init__(self, user):
                    self.admin_user = user
            return MockSession(user)
    except:
        return None

    return None


# ==================== ADMIN AUTHENTICATION VIEWS ====================

@api_view(['POST'])
def admin_login(request):
    try:
        data = request.data
        username = data.get('username', '').strip()
        password = data.get('password', '')
        
        ip_address = get_client_ip(request)
        user_agent = request.META.get('HTTP_USER_AGENT', '')
        
        if not username or not password:
            return Response({
                'success': False,
                'message': 'Username and password are required',
                'message_ar': 'اسم المستخدم وكلمة المرور مطلوبان',
                'message_en': 'Username and password are required'
            }, status=status.HTTP_400_BAD_REQUEST)
        
        if LoginAttempt.check_rate_limit(ip_address):
            return Response({
                'success': False,
                'message': 'Too many failed attempts. Please try again later.',
                'message_ar': 'محاولات كثيرة فاشلة. حاول مرة أخرى لاحقاً.',
                'message_en': 'Too many failed attempts. Please try again later.'
            }, status=status.HTTP_429_TOO_MANY_REQUESTS)
        
        try:
            admin_user = AdminUser.objects.get(username=username)
            
            if not admin_user.is_active:
                LoginAttempt.objects.create(
                    username=username,
                    ip_address=ip_address,
                    success=False,
                    user_agent=user_agent
                )
                return Response({
                    'success': False,
                    'message': 'Account is disabled',
                    'message_ar': 'الحساب معطل',
                    'message_en': 'Account is disabled'
                }, status=status.HTTP_403_FORBIDDEN)
            
            if admin_user.check_password(password):
                session = AdminSession.create_session(
                    admin_user=admin_user,
                    ip_address=ip_address,
                    user_agent=user_agent,
                    hours=24
                )
                
                admin_user.update_last_login()
                
                LoginAttempt.objects.create(
                    username=username,
                    ip_address=ip_address,
                    success=True,
                    user_agent=user_agent
                )
                
                return Response({
                    'success': True,
                    'message': 'Login successful',
                    'message_ar': 'تم تسجيل الدخول بنجاح',
                    'message_en': 'Login successful',
                    'token': session.token,
                    'username': admin_user.username,
                    'role': admin_user.role
                }, status=status.HTTP_200_OK)
            else:
                LoginAttempt.objects.create(
                    username=username,
                    ip_address=ip_address,
                    success=False,
                    user_agent=user_agent
                )
                return Response({
                    'success': False,
                    'message': 'Invalid username or password',
                    'message_ar': 'اسم المستخدم أو كلمة المرور غير صحيحة',
                    'message_en': 'Invalid username or password'
                }, status=status.HTTP_401_UNAUTHORIZED)
                
        except AdminUser.DoesNotExist:
            LoginAttempt.objects.create(
                username=username,
                ip_address=ip_address,
                success=False,
                user_agent=user_agent
            )
            return Response({
                'success': False,
                'message': 'Invalid username or password',
                'message_ar': 'اسم المستخدم أو كلمة المرور غير صحيحة',
                'message_en': 'Invalid username or password'
            }, status=status.HTTP_401_UNAUTHORIZED)
            
    except Exception as e:
        print(f"❌ Login error: {str(e)}")
        return Response({
            'success': False,
            'message': 'Server error',
            'error': str(e)
        }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


@api_view(['POST'])
def admin_logout(request):
    auth_header = request.headers.get('Authorization', '')
    if auth_header.startswith('Bearer '):
        token = auth_header[7:]
        
        try:
            session = AdminSession.objects.get(token=token)
            session.delete()
            
            return Response({
                'success': True,
                'message': 'Logged out successfully',
                'message_ar': 'تم تسجيل الخروج بنجاح',
                'message_en': 'Logged out successfully'
            })
        except AdminSession.DoesNotExist:
            pass
    
    return Response({
        'success': False,
        'message': 'Invalid token'
    }, status=status.HTTP_401_UNAUTHORIZED)


@api_view(['GET'])
def admin_verify(request):
    session = verify_admin_token(request)
    
    if not session:
        return Response({
            'success': False,
            'message': 'Unauthorized - Please login',
            'message_ar': 'غير مصرح - يرجى تسجيل الدخول',
            'message_en': 'Unauthorized - Please login'
        }, status=status.HTTP_401_UNAUTHORIZED)
    
    return Response({
        'success': True,
        'username': session.admin_user.username,
        'role': session.admin_user.role,
        'message': 'Token is valid'
    })


@api_view(['POST'])
def cleanup_sessions(request):
    session = verify_admin_token(request)
    
    if not session or session.admin_user.role != 'admin':
        return Response({
            'success': False,
            'message': 'Unauthorized'
        }, status=status.HTTP_401_UNAUTHORIZED)
    
    count = AdminSession.cleanup_expired()
    return Response({
        'success': True,
        'message': f'Cleaned up {count} expired sessions',
        'count': count
    })


# ==================== SECTION VIEWS ====================

@api_view(['GET', 'POST'])
def section_list(request):
    """
    GET: List all sections
    POST: Create a new section (requires authentication)
    """
    try:
        if request.method == 'GET':
            # ✅ ترتيب الـ sections بالـ order تلقائياً (Featured أول لأن order=0)
            sections = Section.objects.all().order_by('order')
            serializer = SectionSerializer(sections, many=True)
            return Response(serializer.data)

        elif request.method == 'POST':
            # 🔐 Verify admin authentication
            session = verify_admin_token(request)
            if not session:
                return Response({
                    'success': False,
                    'message': 'Unauthorized - Please login'
                }, status=status.HTTP_401_UNAUTHORIZED)

            serializer = SectionSerializer(data=request.data)

            if serializer.is_valid():
                # ✅ منع إنشاء أكثر من Featured Section واحد
                if serializer.validated_data.get('is_featured', False):
                    if Section.objects.filter(is_featured=True).exists():
                        return Response({
                            'error': 'A featured section already exists. Only one featured section is allowed.',
                            'error_ar': 'يوجد قسم مميز بالفعل. يسمح بقسم مميز واحد فقط.',
                            'error_en': 'A featured section already exists. Only one featured section is allowed.'
                        }, status=status.HTTP_400_BAD_REQUEST)

                # ✅ منع استخدام order=0 للـ sections العادية
                new_order = serializer.validated_data.get('order', None)
                if new_order is not None and int(new_order) == 0:
                    if not serializer.validated_data.get('is_featured', False):
                        return Response({
                            'error': 'Order 0 is reserved for the featured section',
                            'error_ar': 'الترتيب 0 محجوز للقسم المميز فقط',
                            'error_en': 'Order 0 is reserved for the featured section only'
                        }, status=status.HTTP_400_BAD_REQUEST)

                # ✅ منع تكرار الـ order
                if new_order is not None:
                    if Section.objects.filter(order=new_order).exists():
                        return Response({
                            'error': f'Order {new_order} is already used by another section',
                            'error_ar': f'الترتيب {new_order} مستخدم بالفعل في قسم آخر',
                            'error_en': f'Order {new_order} is already used by another section'
                        }, status=status.HTTP_400_BAD_REQUEST)

                serializer.save()
                return Response({
                    'message': 'Section created successfully',
                    'section': serializer.data
                }, status=status.HTTP_201_CREATED)

            return Response({'error': serializer.errors}, status=status.HTTP_400_BAD_REQUEST)

    except Exception as e:
        return Response(
            {'error': str(e)},
            status=status.HTTP_500_INTERNAL_SERVER_ERROR
        )


@api_view(['GET', 'PUT', 'PATCH', 'DELETE'])
def section_detail(request, pk):
    """
    GET: Retrieve a section
    PUT/PATCH: Update a section (requires authentication)
    DELETE: Delete a section (requires authentication)
    """
    try:
        section = Section.objects.get(pk=pk)
    except Section.DoesNotExist:
        return Response(
            {'error': 'Section not found'},
            status=status.HTTP_404_NOT_FOUND
        )

    if request.method == 'GET':
        serializer = SectionSerializer(section)
        return Response(serializer.data)

    elif request.method == 'DELETE':
        # 🔐 Verify admin authentication
        session = verify_admin_token(request)
        if not session:
            return Response({
                'success': False,
                'message': 'Unauthorized - Please login'
            }, status=status.HTTP_401_UNAUTHORIZED)

        # ✅ منع حذف الـ Featured Section نهائياً
        if section.is_featured:
            return Response(
                {
                    'error': 'Cannot delete featured section',
                    'message_ar': 'لا يمكن حذف القسم المميز - هذا القسم أساسي للموقع',
                    'message_en': 'Cannot delete featured section - This is an essential section for the website',
                },
                status=status.HTTP_403_FORBIDDEN
            )

        section.delete()
        return Response(
            {'message': 'Section deleted successfully'},
            status=status.HTTP_204_NO_CONTENT
        )

    elif request.method in ['PUT', 'PATCH']:
        # 🔐 Verify admin authentication
        session = verify_admin_token(request)
        if not session:
            return Response({
                'success': False,
                'message': 'Unauthorized - Please login'
            }, status=status.HTTP_401_UNAUTHORIZED)

        # ✅ منع تغيير order الـ Featured Section - دايماً يبقى أول
        if section.is_featured and 'order' in request.data:
            return Response({
                'error': 'Cannot change order of featured section',
                'error_ar': 'لا يمكن تغيير ترتيب القسم المميز، دايماً بيظهر أول',
                'error_en': 'Cannot change the order of the featured section, it always appears first'
            }, status=status.HTTP_400_BAD_REQUEST)

        # ✅ التحقق من الـ order الجديد
        new_order = request.data.get('order')
        if new_order is not None:
            new_order_int = int(new_order)

            # ✅ منع استخدام order=0 للـ sections العادية
            if new_order_int == 0 and not section.is_featured:
                return Response({
                    'error': 'Order 0 is reserved for the featured section',
                    'error_ar': 'الترتيب 0 محجوز للقسم المميز فقط',
                    'error_en': 'Order 0 is reserved for the featured section only'
                }, status=status.HTTP_400_BAD_REQUEST)

            # ✅ منع تكرار الـ order مع sections تانية
            if Section.objects.filter(order=new_order_int).exclude(pk=section.pk).exists():
                return Response({
                    'error': f'Order {new_order_int} is already used by another section',
                    'error_ar': f'الترتيب {new_order_int} مستخدم بالفعل في قسم آخر، اختر رقم مختلف',
                    'error_en': f'Order {new_order_int} is already used by another section'
                }, status=status.HTTP_400_BAD_REQUEST)

        serializer = SectionSerializer(
            section,
            data=request.data,
            partial=True
        )
        if serializer.is_valid():
            # ✅ منع إزالة صفة is_featured من القسم المميز الأساسي
            if section.is_featured and 'is_featured' in serializer.validated_data:
                if not serializer.validated_data['is_featured']:
                    return Response({
                        'error': 'Cannot remove featured status from the main featured section',
                        'error_ar': 'لا يمكن إزالة صفة "مميز" من القسم المميز الأساسي',
                        'error_en': 'Cannot remove featured status from the main featured section'
                    }, status=status.HTTP_400_BAD_REQUEST)

            # ✅ منع تحويل section عادي إلى featured إذا كان يوجد featured بالفعل
            if serializer.validated_data.get('is_featured', False) and not section.is_featured:
                if Section.objects.filter(is_featured=True).exists():
                    return Response({
                        'error': 'A featured section already exists',
                        'error_ar': 'يوجد قسم مميز بالفعل',
                        'error_en': 'A featured section already exists'
                    }, status=status.HTTP_400_BAD_REQUEST)

            serializer.save()
            return Response({
                'message': 'Section updated successfully',
                'section': serializer.data
            })
        return Response({'error': serializer.errors}, status=status.HTTP_400_BAD_REQUEST)


# ==================== PRODUCT VIEWS ====================

@api_view(['GET', 'POST'])
@parser_classes([MultiPartParser, FormParser])
def product_list(request):
    """
    GET: List all products
    POST: Create a new product (requires authentication)
    """
    try:
        if request.method == 'GET':
            products = Product.objects.all()
            serializer = ProductSerializer(products, many=True, context={'request': request})
            return Response(serializer.data)

        elif request.method == 'POST':
            # 🔐 Verify admin authentication
            session = verify_admin_token(request)
            if not session:
                return Response({
                    'success': False,
                    'message': 'Unauthorized - Please login'
                }, status=status.HTTP_401_UNAUTHORIZED)

            serializer = ProductSerializer(data=request.data, context={'request': request})

            if serializer.is_valid():
                serializer.save()
                return Response({
                    'message': 'Product added successfully',
                    'product': serializer.data
                }, status=status.HTTP_201_CREATED)

            return Response({'error': serializer.errors}, status=status.HTTP_400_BAD_REQUEST)

    except Exception as e:
        return Response(
            {'error': str(e)},
            status=status.HTTP_500_INTERNAL_SERVER_ERROR
        )


@api_view(['GET', 'PUT', 'PATCH', 'DELETE'])
@parser_classes([MultiPartParser, FormParser])
def product_detail(request, pk):
    """
    GET: Retrieve a product
    PUT/PATCH: Update a product (requires authentication)
    DELETE: Delete a product (requires authentication)
    """
    try:
        product = Product.objects.get(pk=pk)
    except Product.DoesNotExist:
        return Response(
            {'error': 'Product not found'},
            status=status.HTTP_404_NOT_FOUND
        )

    if request.method == 'GET':
        serializer = ProductSerializer(product, context={'request': request})
        return Response(serializer.data)

    elif request.method == 'DELETE':
        # 🔐 Verify admin authentication
        session = verify_admin_token(request)
        if not session:
            return Response({
                'success': False,
                'message': 'Unauthorized - Please login'
            }, status=status.HTTP_401_UNAUTHORIZED)

        product.delete()
    elif request.method in ['PUT', 'PATCH']:
        # 🔐 Verify admin authentication
        session = verify_admin_token(request)
        if not session:
            return Response({
                'success': False,
                'message': 'Unauthorized - Please login'
            }, status=status.HTTP_401_UNAUTHORIZED)

        serializer = ProductSerializer(
            product,
            data=request.data,
            partial=True,
            context={'request': request}
        )
        if serializer.is_valid():
            serializer.save()
            return Response({
                'message': 'Product updated successfully',
                'product': serializer.data
            })
        return Response({'error': serializer.errors}, status=status.HTTP_400_BAD_REQUEST)


@api_view(['GET', 'PUT'])
def metal_prices(request):
    """
    GET: List current prices for all 6 karats
    PUT: Update prices for a metal (gold or silver)
         Expects: { "metal": "gold"|"silver", "base_buy_price": int, "spread": int }
    """
    try:
        price_obj = MetalPrice.get_current_prices()

        if request.method == 'GET':
            serializer = MetalPriceSerializer(price_obj)
            return Response(serializer.data)

        elif request.method == 'PUT':
            # 🔐 Verify admin authentication
            session = verify_admin_token(request)
            if not session:
                return Response({
                    'success': False,
                    'message': 'Unauthorized - Please login'
                }, status=status.HTTP_401_UNAUTHORIZED)

            data = request.data
            metal = data.get('metal')
            base_buy = data.get('base_buy_price')
            spread = data.get('spread')

            if metal not in ['gold', 'silver'] or base_buy is None or spread is None:
                return Response({
                    'success': False,
                    'message': 'Missing or invalid data. Requires metal, base_buy_price, and spread.'
                }, status=status.HTTP_400_BAD_REQUEST)

            try:
                base_buy = int(base_buy)
                spread = int(spread)
            except (ValueError, TypeError):
                return Response({
                    'success': False,
                    'message': 'Prices and spread must be integers.'
                }, status=status.HTTP_400_BAD_REQUEST)

            if metal == 'gold':
                # Base is 21K
                price_obj.karat_21_buy = base_buy
                price_obj.karat_21_sell = base_buy + spread
                
                # Derive 24K and 18K
                price_obj.karat_24_buy = int(round(base_buy * (24 / 21)))
                price_obj.karat_24_sell = price_obj.karat_24_buy + spread
                
                price_obj.karat_18_buy = int(round(base_buy * (18 / 21)))
                price_obj.karat_18_sell = price_obj.karat_18_buy + spread
            
            else:  # silver
                # Base is 999
                price_obj.fine_999_buy = base_buy
                price_obj.fine_999_sell = base_buy + spread
                
                # Derive 925 and 800
                price_obj.fine_925_buy = int(round(base_buy * (925 / 999)))
                price_obj.fine_925_sell = price_obj.fine_925_buy + spread
                
                price_obj.fine_800_buy = int(round(base_buy * (800 / 999)))
                price_obj.fine_800_sell = price_obj.fine_800_buy + spread

            price_obj.save()

            # 🔄 Update all products prices after price change
            try:
                update_stats = price_obj.update_all_products()
            except Exception as e:
                print(f"⚠️ Error updating products: {str(e)}")
                update_stats = {'error': str(e)}

            serializer = MetalPriceSerializer(price_obj)
            return Response({
                'success': True,
                'message': f'{metal.capitalize()} prices updated successfully',
                'prices': serializer.data,
                'updated_products': update_stats
            })

    except Exception as e:
        return Response({'success': False, 'error': str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
    


@api_view(['GET', 'POST'])
def badge_list(request):
    try:
        if request.method == 'GET':
            badges = Badge.objects.all().order_by('-created_at')
            serializer = BadgeSerializer(badges, many=True)
            return Response(serializer.data)

        elif request.method == 'POST':
            serializer = BadgeSerializer(data=request.data)
            if serializer.is_valid():
                serializer.save()
                return Response(serializer.data, status=status.HTTP_201_CREATED)
            return Response({'error': serializer.errors}, status=status.HTTP_400_BAD_REQUEST)

    except Exception as e:
        return Response({'error': str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


@api_view(['DELETE'])
def badge_detail(request, pk):
    try:
        badge = Badge.objects.get(pk=pk)
        badge.delete()
        return Response({'message': 'Badge deleted'}, status=status.HTTP_204_NO_CONTENT)
    except Badge.DoesNotExist:
        return Response({'error': 'Badge not found'}, status=status.HTTP_404_NOT_FOUND)