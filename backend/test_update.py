import os
import django
os.environ.setdefault("DJANGO_SETTINGS_MODULE", "saudi_silver.settings")
django.setup()

from products.models import MetalPrice, Product

try:
    price_obj = MetalPrice.get_current_prices()
    price_obj.karat_21_buy = 10000
    price_obj.karat_21_sell = 10500
    price_obj.save()
    
    print("MetalPrice saved.")
    
    stats = price_obj.update_all_products()
    print("Update stats:", stats)
    
except Exception as e:
    import traceback
    traceback.print_exc()

