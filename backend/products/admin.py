from django.contrib import admin
from .models import Product


@admin.register(Product)
class ProductAdmin(admin.ModelAdmin):
    # ✅ تحديث list_display للحقول الجديدة
    list_display = [
        'id',
        'name_ar',           # بدل 'name'
        'name_en',           # جديد
        'price', 
        'badge',
        'stock', 
        'created_at'
    ]
    
    # ✅ تحديث الفلاتر
    list_filter = [ 'stock', 'badge', 'created_at']
    
    # ✅ تحديث البحث للحقول الجديدة
    search_fields = [
        'name_ar', 
        'name_en', 
        'description_ar', 
        'description_en',
    ]
    
    # ترتيب حسب الأحدث
    ordering = ['-created_at']
    
    # الحقول للقراءة فقط
    readonly_fields = ['id', 'created_at', 'updated_at']
    
    # ✅ تنظيم الحقول في صفحة التعديل
    fieldsets = (
        ('🔤 Product Names', {
            'fields': ('name_ar', 'name_en')
        }),
        ('💰 Pricing', {
            'fields': ('price', 'badge', 'stock')
        }),
        ('🖼️ Images', {
            'fields': ('image_file', 'image_url'),
            'description': 'Upload an image file OR provide an image URL (at least one is required)'
        }),
        ('📝 Descriptions', {
            'fields': (
                'shortDescription_ar',
                'shortDescription_en',
                'description_ar', 
                'description_en'
            )
        }),
        ('⏰ Timestamps', {
            'fields': ('id', 'created_at', 'updated_at'),
            'classes': ('collapse',)  # مطوية بشكل افتراضي
        }),
    )
    
    # ✅ عرض preview للصورة في الـ admin
    def image_preview(self, obj):
        if obj.image_file:
            return f'<img src="{obj.image_file.url}" width="50" height="50" />'
        elif obj.image_url:
            return f'<img src="{obj.image_url}" width="50" height="50" />'
        return "No Image"
    
    image_preview.allow_tags = True
    image_preview.short_description = 'Image'
    
    # يمكنك إضافة image_preview للـ list_display لو عايز تشوف الصور في القائمة
    # list_display = ['id', 'name_ar', 'name_en', 'image_preview', 'price', ...]