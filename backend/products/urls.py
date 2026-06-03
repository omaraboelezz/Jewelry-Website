from django.urls import path
from . import views

urlpatterns = [
    # 📂 SECTIONS
    path('sections/', views.section_list, name='section-list'),
    path('sections/<int:pk>/', views.section_detail, name='section-detail'),

    # 🛒 PRODUCTS
    path('products/', views.product_list, name='product-list'),
    path('products/<int:pk>/', views.product_detail, name='product-detail'),

    # 📈 PRICES
    path('metal-prices/', views.metal_prices, name='metal-prices'),

    # 🏷️ BADGES
    path('badges/', views.badge_list, name='badge-list'),
    path('badges/<int:pk>/', views.badge_detail, name='badge-detail'),
]
