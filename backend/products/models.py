from django.db import models
from django.contrib.auth.hashers import make_password, check_password
import secrets
from datetime import datetime, timedelta


# ==================== EXISTING MODELS ====================

class Section(models.Model):
    """
    Section model for organizing products into custom sections
    """
    title_ar = models.CharField(max_length=200, verbose_name="Arabic Title")
    title_en = models.CharField(max_length=200, verbose_name="English Title")
    order = models.IntegerField(default=0, verbose_name="Display Order")
    is_featured = models.BooleanField(default=False, verbose_name="Is Featured Section")
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ['order', '-created_at']

    def __str__(self):
        return f"{self.title_ar} / {self.title_en}"


class Product(models.Model):
    """
    Product model for jewelry items - Bilingual support
    """
    section = models.ForeignKey(
        Section, 
        on_delete=models.SET_NULL, 
        null=True, 
        blank=True,
        related_name='products',
        verbose_name="Section"
    )
    
    name_ar = models.CharField(max_length=200, verbose_name="Arabic Name", blank=True, default='')
    name_en = models.CharField(max_length=200, verbose_name="English Name", blank=True, default='')


    TYPE_CHOICES = [
        ('gold', 'Gold / ذهب'),
        ('silver', 'Silver / فضة'),
        ('accessories', 'Accessories / إكسسوارات'),
    ]
    
    # ✨ NEW: Type field
    type = models.CharField(
        max_length=20, 
        choices=TYPE_CHOICES, 
        default='silver', 
        verbose_name="Product Type"
    )


    weight = models.DecimalField(
        max_digits=6, 
        decimal_places=2, 
        default=0,
        verbose_name="Weight in grams"
    )

    show_weight = models.BooleanField(
        default=True,
        verbose_name="Show Weight"
    )

    manufacturing_cost = models.DecimalField(
        max_digits=10, 
        decimal_places=2, 
        default=0,
        verbose_name="Manufacturing Cost per Gram (المصنعية)"
)
    
    price = models.DecimalField(max_digits=10, decimal_places=2)
    badge = models.CharField(max_length=100, null=True, blank=True)
    stock = models.CharField(max_length=50)
    
    image_file = models.ImageField(upload_to='products/', blank=True, null=True)
    image_url = models.URLField(max_length=500, blank=True, null=True)
    
    description_ar = models.TextField(verbose_name="Arabic Description", blank=True, default='')
    description_en = models.TextField(verbose_name="English Description", blank=True, default='')
    
    shortDescription_ar = models.CharField(max_length=200, verbose_name="Arabic Short Description", blank=True, default='')
    shortDescription_en = models.CharField(max_length=200, verbose_name="English Short Description", blank=True, default='')
    
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ['-created_at']

    def __str__(self):
        return f"{self.name_ar or 'N/A'} / {self.name_en or 'N/A'}"
    
    def calculate_price(self):
        if self.type == 'accessories':
            return self.price

        metal_prices = MetalPrice.get_current_prices()
        
        if self.type == 'gold':
            price_per_gram = metal_prices.gold_price_per_gram
        else:  # silver
            price_per_gram = metal_prices.silver_price_per_gram
        
        if self.weight < 3:
            # 🔵 وزن خفيف: مصنعية ثابتة للقطعة
            final_price = (price_per_gram * self.weight) + self.manufacturing_cost
        else:
            # 🟢 وزن تقيل: مصنعية per gram
            final_price = (price_per_gram + self.manufacturing_cost) * self.weight
        
        return final_price

    def save(self, *args, **kwargs):
        # حساب السعر قبل الحفظ
        self.price = self.calculate_price()
        super().save(*args, **kwargs)

# ==================== METAL PRICES MODEL ====================

class MetalPrice(models.Model):
    """
    💰 تخزين أسعار الذهب والفضة اليومية
    """
    gold_price_per_gram = models.DecimalField(
        max_digits=10, 
        decimal_places=2, 
        default=0,
        verbose_name="Gold Price per Gram ($)"
    )
    
    silver_price_per_gram = models.DecimalField(
        max_digits=10, 
        decimal_places=2, 
        default=0,
        verbose_name="Silver Price per Gram ($)"
    )
    
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        db_table = 'metal_prices'
        verbose_name = 'Metal Price'
        verbose_name_plural = 'Metal Prices'
    
    def __str__(self):
        return f"Gold: ${self.gold_price_per_gram}/g | Silver: ${self.silver_price_per_gram}/g"
    
    @staticmethod
    def get_current_prices():
        """جلب آخر أسعار محفوظة"""
        price_obj, created = MetalPrice.objects.get_or_create(id=1)
        return price_obj


def update_all_products(self):
    """
    🔄 تحديث أسعار كل المنتجات بعد تغيير أسعار الذهب/الفضة
    """
    # تحديث منتجات الذهب
    gold_products = Product.objects.filter(type='gold')
    for product in gold_products:
        product.price = product.calculate_price()
        product.save(update_fields=['price', 'updated_at'])
    
    # تحديث منتجات الفضة
    silver_products = Product.objects.filter(type='silver')
    for product in silver_products:
        product.price = product.calculate_price()
        product.save(update_fields=['price', 'updated_at'])
    
    return {
        'gold_updated': gold_products.count(),
        'silver_updated': silver_products.count()
    }
# ==================== ADMIN AUTHENTICATION MODELS ====================

class AdminUser(models.Model):
    """
    🔐 Custom Admin User model for secure authentication
    """
    ROLE_CHOICES = [
        ('admin', 'Admin'),
        ('owner', 'Owner'),
        ('moderator', 'Moderator'),
    ]
    
    username = models.CharField(max_length=50, unique=True)
    password_hash = models.CharField(max_length=255)
    role = models.CharField(max_length=20, choices=ROLE_CHOICES, default='admin')
    email = models.EmailField(blank=True, null=True)
    is_active = models.BooleanField(default=True)
    created_at = models.DateTimeField(auto_now_add=True)
    last_login = models.DateTimeField(blank=True, null=True)
    
    class Meta:
        db_table = 'admin_users'
        verbose_name = 'Admin User'
        verbose_name_plural = 'Admin Users'
    
    def __str__(self):
        return f"{self.username} ({self.role})"
    
    def set_password(self, raw_password):
        """Hash and set password"""
        self.password_hash = make_password(raw_password)
    
    def check_password(self, raw_password):
        """Verify password"""
        return check_password(raw_password, self.password_hash)
    
    def update_last_login(self):
        """Update last login timestamp"""
        from django.utils import timezone
        self.last_login = timezone.now()
        self.save(update_fields=['last_login'])


class AdminSession(models.Model):
    """
    🔑 Store admin sessions in database (more secure than in-memory)
    """
    token = models.CharField(max_length=64, unique=True, primary_key=True)
    admin_user = models.ForeignKey(AdminUser, on_delete=models.CASCADE, related_name='sessions')
    created_at = models.DateTimeField(auto_now_add=True)
    expires_at = models.DateTimeField()
    ip_address = models.GenericIPAddressField(blank=True, null=True)
    user_agent = models.TextField(blank=True, null=True)
    
    class Meta:
        db_table = 'admin_sessions'
        verbose_name = 'Admin Session'
        verbose_name_plural = 'Admin Sessions'
    
    def __str__(self):
        return f"Session for {self.admin_user.username}"
    
    @staticmethod
    def create_session(admin_user, ip_address=None, user_agent=None, hours=24):
        """Create a new session"""
        from django.utils import timezone
        token = secrets.token_urlsafe(32)
        session = AdminSession.objects.create(
            token=token,
            admin_user=admin_user,
            expires_at=timezone.now() + timedelta(hours=hours),
            ip_address=ip_address,
            user_agent=user_agent
        )
        return session
    
    def is_valid(self):
        """Check if session is still valid"""
        from django.utils import timezone
        return timezone.now() < self.expires_at
    
    @staticmethod
    def cleanup_expired():
        """Remove expired sessions"""
        from django.utils import timezone
        expired_sessions = AdminSession.objects.filter(expires_at__lt=timezone.now())
        count = expired_sessions.count()
        expired_sessions.delete()
        return count


class LoginAttempt(models.Model):
    """
    🛡️ Track login attempts for security (prevent brute force)
    """
    username = models.CharField(max_length=50)
    ip_address = models.GenericIPAddressField()
    success = models.BooleanField(default=False)
    attempted_at = models.DateTimeField(auto_now_add=True)
    user_agent = models.TextField(blank=True, null=True)
    
    class Meta:
        db_table = 'admin_login_attempts'
        ordering = ['-attempted_at']
        verbose_name = 'Login Attempt'
        verbose_name_plural = 'Login Attempts'
    
    def __str__(self):
        status = '✅ Success' if self.success else '❌ Failed'
        return f"{self.username} - {status} at {self.attempted_at}"
    
    @staticmethod
    def check_rate_limit(ip_address, minutes=5, max_attempts=5):
        """
        Check if IP has exceeded max failed login attempts
        Returns True if rate limit exceeded
        """
        from django.utils import timezone
        time_threshold = timezone.now() - timedelta(minutes=minutes)
        recent_failures = LoginAttempt.objects.filter(
            ip_address=ip_address,
            success=False,
            attempted_at__gte=time_threshold
        ).count()
        
        return recent_failures >= max_attempts

class Badge(models.Model):
    name_ar = models.CharField(max_length=50, verbose_name="Arabic Name")
    name_en = models.CharField(max_length=50, verbose_name="English Name")
    color = models.CharField(max_length=20, default='#667eea', verbose_name="Badge Color")
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        db_table = 'badges'

    def __str__(self):
        return f"{self.name_ar} / {self.name_en}"