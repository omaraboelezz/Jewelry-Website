from rest_framework import serializers
from .models import Badge, Product, Section, MetalPrice


class SectionSerializer(serializers.ModelSerializer):
    """
    Serializer for Section model
    """
    products_count = serializers.SerializerMethodField()
    
    class Meta:
        model = Section
        fields = ['id', 'title_ar', 'title_en', 'order', 'is_featured', 'products_count', 'created_at']
        extra_kwargs = {
            'id': {'read_only': True},
            'created_at': {'read_only': True},
        }
    
    def get_products_count(self, obj):
        """Return the number of products in this section"""
        return obj.products.count()


class ProductSerializer(serializers.ModelSerializer):
    price = serializers.DecimalField(max_digits=10, decimal_places=2, required=False)
    # ✅ إضافة section field
    section = serializers.PrimaryKeyRelatedField(
        queryset=Section.objects.all(),
        required=False,
        allow_null=True
    )
    section_details = SectionSerializer(source='section', read_only=True)
    
    image_file = serializers.ImageField(required=False, allow_null=True)
    image_url = serializers.URLField(required=False, allow_null=True, allow_blank=True)

    class Meta:
        model = Product
        fields = [
            'id', 
            'section', 'section_details',  # ✅ إضافة section
            'name_ar', 'name_en',
            'type', 'karat',
            'weight', 'show_weight', 'manufacturing_cost',
            'price', 'badge', 'stock',
            'image_file', 'image_url',
            'description_ar', 'description_en',
            'shortDescription_ar', 'shortDescription_en'
        ]
        extra_kwargs = {
            'id': {'read_only': True},
        }

    def validate(self, data):
        instance = getattr(self, 'instance', None)
        if not instance:
            if not data.get('image_file') and not data.get('image_url'):
                raise serializers.ValidationError(
                    "Either image_file or image_url must be provided."
                )
        return data

    def to_representation(self, instance):
        data = super().to_representation(instance)
        request = self.context.get('request')
        
        if instance.image_file:
            if request:
                data['image_file'] = request.build_absolute_uri(instance.image_file.url)
            else:
                data['image_file'] = instance.image_file.url
        
        data['price'] = float(instance.price)
        return data
    

class BadgeSerializer(serializers.ModelSerializer):
    class Meta:
        model = Badge
        fields = ['id', 'name', 'created_at']


class MetalPriceSerializer(serializers.ModelSerializer):
    class Meta:
        model = MetalPrice
        # Use explicit list to ensure order and completeness
        fields = [
            'karat_24_buy', 'karat_24_sell',
            'karat_21_buy', 'karat_21_sell',
            'karat_18_buy', 'karat_18_sell',
            'fine_999_buy', 'fine_999_sell',
            'fine_925_buy', 'fine_925_sell',
            'fine_800_buy', 'fine_800_sell',
            'updated_at'
        ]