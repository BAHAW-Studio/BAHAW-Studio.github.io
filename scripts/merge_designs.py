"""
Analyze products.js and create the A/B pair mapping.
Adds design_b field to Design A products, marks Design B as hidden.
"""
import json
import re
import os

PRODUCTS_FILE = os.path.join(os.path.dirname(__file__), '..', 'data', 'products.js')

# Read products.js
with open(PRODUCTS_FILE) as f:
    content = f.read()

# Extract JSON array
json_str = re.search(r'var PRODUCTS_DATA = (\[.*\]);', content, re.DOTALL).group(1)
products = json.loads(json_str)

# Separate Design A and Design B
design_a = []
design_b = []

for p in products:
    if '(Design B)' in p['name'] or '(DESIGN B)' in p['name']:
        design_b.append(p)
    else:
        design_a.append(p)

print(f"Design A products: {len(design_a)}")
print(f"Design B products: {len(design_b)}")
print()

# Extract base phrase and product type from name
def get_base_info(name):
    # Remove "(Design B)" and "BAHAW" and "Bahaw" extras
    clean = re.sub(r'\s*\(Design B\)', '', name, flags=re.IGNORECASE)
    clean = re.sub(r'\s*-\s*BAHAW\s+', ' - ', clean, flags=re.IGNORECASE)
    clean = re.sub(r'\s*-\s*Bahaw\s+', ' - ', clean)

    # Extract phrase (before the dash)
    match = re.match(r'^(.+?)\s*-\s*(.+)$', clean)
    if match:
        phrase = match.group(1).strip().upper()
        product_type = match.group(2).strip().lower()
        # Normalize product type
        product_type = re.sub(r'^bisaya\s+', '', product_type)
        return phrase, product_type
    return clean.upper(), ''

# Build pairs
pairs = []
unmatched_b = []

for b in design_b:
    b_phrase, b_type = get_base_info(b['name'])
    found = False
    for a in design_a:
        a_phrase, a_type = get_base_info(a['name'])
        if a_phrase == b_phrase and a_type == b_type:
            pairs.append((a, b))
            found = True
            break
    if not found:
        # Try looser match - just phrase + category
        for a in design_a:
            a_phrase, a_type = get_base_info(a['name'])
            if a_phrase == b_phrase and a['category'] == b['category']:
                pairs.append((a, b))
                found = True
                break
    if not found:
        unmatched_b.append(b)

print("=== MATCHED PAIRS ===")
for a, b in pairs:
    print(f"  A: id={a['id']} | {a['name']}")
    print(f"  B: id={b['id']} | {b['name']}")
    print(f"  Category: {a['category']}")
    print()

if unmatched_b:
    print("=== UNMATCHED DESIGN B (no Design A found) ===")
    for b in unmatched_b:
        b_phrase, b_type = get_base_info(b['name'])
        print(f"  id={b['id']} | {b['name']} | phrase={b_phrase} type={b_type} cat={b['category']}")
    print()

# Now restructure: add design_b to A products, mark B as hidden
paired_b_ids = set()
for a, b in pairs:
    a['design_b'] = {
        'id': b['id'],
        'name': b['name'],
        'photo_url': b['photo_url'],
        'etsy_url': b['etsy_url'],
        'price': b['price']
    }
    paired_b_ids.add(b['id'])

# For unmatched B products, they stay as standalone (no A exists)
# But we should create placeholder A entries for them or keep them visible

# Mark paired B products as hidden
for p in products:
    if p['id'] in paired_b_ids:
        p['_hidden'] = True

# Build final list: only non-hidden products
final = [p for p in products if not p.get('_hidden')]

# Clean up temp fields
for p in final:
    if '_hidden' in p:
        del p['_hidden']

print(f"\n=== FINAL ===")
print(f"Total products shown: {len(final)} (was {len(products)})")
print(f"Products with Design B toggle: {len(pairs)}")

# Write new products.js
output = '/* BAHAW STUDIO — Product Data (grouped by design with colors) */\nvar PRODUCTS_DATA = ' + json.dumps(final, indent=4) + ';\n'

with open(PRODUCTS_FILE, 'w') as f:
    f.write(output)

print(f"\nUpdated {PRODUCTS_FILE}")
