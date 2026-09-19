from feed.models import Card

# Delete all AI Pick cards
ai_pick_cards = Card.objects.filter(type='AI_PICK')
count = ai_pick_cards.count()
ai_pick_cards.delete()
print(f'Deleted {count} AI Pick cards from feed')