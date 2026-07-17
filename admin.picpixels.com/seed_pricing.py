import django, os
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'core.settings')
django.setup()
from cms.models import PricingConfigSection, PricingConfigDropdownOption, PricingConfigCard, PricingConfigCardPrice, PricingConfigCTA

sec = PricingConfigSection.objects.create(
    is_active=True,
    subtitle='SIMPLE PRICING OF 3D CONTENT FOR E-COMMERCE',
    title='Create your product detail page',
    description='Choose the pricing tier and card type that fits your product visualization needs. All plans include unlimited revisions.'
)
option_labels = ['1-10 units', '10-50 units', '50-199 units', '200+ units']
options = []
for label in option_labels:
    opt = PricingConfigDropdownOption.objects.create(section=sec, label=label, order=len(options))
    options.append(opt)

cards_data = [
    {'title': 'Simple', 'description': 'Basic 3D product rendering for simple geometry items.', 'button_text': 'Select Simple', 'image': 'pricing_config/simple-card.jpg'},
    {'title': 'Medium', 'description': 'Detailed rendering with texture mapping for complex products.', 'button_text': 'Select Medium', 'image': 'pricing_config/medium-card.png'},
    {'title': 'Complex', 'description': 'Full 3D scene with lighting, reflections, and post-processing.', 'button_text': 'Select Complex', 'image': 'pricing_config/complex-card.jpg'},
]
cards = []
for i, cd in enumerate(cards_data):
    card = PricingConfigCard.objects.create(section=sec, sort_order=i, **cd)
    cards.append(card)

# Price table: cards x unit ranges
# [card_index][option_index] = (price, old_price)
price_table = [
    [('$150', '$180'), ('$120', '$145'), ('$100', '$120'), ('$80',  '$95')],
    [('$250', '$300'), ('$200', '$240'), ('$160', '$190'), ('$130', '$155')],
    [('$500', '$580'), ('$450', '$520'), ('$380', '$450'), ('$300', '$360')],
]
for ci, card in enumerate(cards):
    for oi, opt in enumerate(options):
        p, op = price_table[ci][oi]
        PricingConfigCardPrice.objects.create(section=sec, card=card, unit_range=opt, price=p, old_price=op)

PricingConfigCTA.objects.create(section=sec, button_text='Continue to Order', url='/free-trial')
print('Seed data created successfully')
print('Cards:', PricingConfigCard.objects.count())
print('Card prices:', PricingConfigCardPrice.objects.count())
print('Dropdown options:', PricingConfigDropdownOption.objects.count())
