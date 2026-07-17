from decimal import Decimal

def calculate_order_price(service_type, image_count, turnaround_hours, subscription_plan_name='Solo'):
    """
    Computes pricing combining subscription discounts, bulk multipliers, and turnaround expedite factors.
    """
    image_count = int(image_count)
    turnaround_hours = int(turnaround_hours)

    # 1. Base Prices
    base_prices = {
        'background_removal': Decimal('1.50'),
        'ghost_mannequin': Decimal('2.50'),
        'photo_retouching': Decimal('3.00'),
        'cgi_3d': Decimal('45.00'),
        'ai_models': Decimal('15.00'),
    }
    
    base_price = base_prices.get(service_type, Decimal('1.50'))

    # 2. Turnaround Multiplier
    if turnaround_hours <= 3:
        turnaround_multiplier = Decimal('2.00')  # 3h Rush
    elif turnaround_hours <= 24:
        turnaround_multiplier = Decimal('1.30')  # 24h Express
    else:
        turnaround_multiplier = Decimal('1.00')  # 48h Standard

    # 3. Subscription Discount
    sub_discounts = {
        'Solo': Decimal('0.00'),
        'Professional': Decimal('0.15'), # 15% discount
        'Enterprise': Decimal('0.30'),   # 30% discount
    }
    sub_discount = sub_discounts.get(subscription_plan_name, Decimal('0.00'))

    # 4. Bulk Volume Discount
    if image_count >= 200:
        bulk_discount = Decimal('0.20')  # 20% discount
    elif image_count >= 50:
        bulk_discount = Decimal('0.10')  # 10% discount
    else:
        bulk_discount = Decimal('0.00')  # 0% discount

    # Calculate final price
    price_before_discounts = base_price * image_count * turnaround_multiplier
    discount_multiplier = (Decimal('1.00') - sub_discount) * (Decimal('1.00') - bulk_discount)
    
    final_price = price_before_discounts * discount_multiplier
    unit_price = final_price / image_count if image_count > 0 else Decimal('0.00')

    return {
        'base_price': base_price,
        'turnaround_multiplier': turnaround_multiplier,
        'subscription_discount_percentage': sub_discount * 100,
        'bulk_discount_percentage': bulk_discount * 100,
        'price_before_discounts': round(price_before_discounts, 2),
        'unit_price': round(unit_price, 2),
        'total_price': round(final_price, 2)
    }
