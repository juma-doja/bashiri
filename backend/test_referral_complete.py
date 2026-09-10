import os
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'config.settings')
import django
django.setup()

from accounts.models import User
from gamification.models import Referral, UserProgress
from django.utils import timezone
from datetime import timedelta

referrer = User.objects.get(username='lastmateru')
referee = User.objects.filter(username='jujuuu').first()

print('Testing referral completion logic...')

# Get existing referral code for referrer
from gamification.services import generate_referral_code as gen_code
referral_obj = gen_code(referrer)
code = referral_obj.referral_code  # Use the actual code string
print('Using existing referral code:', code)

# Get the existing referral (don't create new)
referral = Referral.objects.filter(referrer=referrer, referral_code=code).first()
print('Found referral:', referral)

# Test completion
print('Testing referral completion...')
try:
    referral.complete_referral(referee)
    print('Referral completed successfully!')
    
    # Check referrer progress
    progress = UserProgress.objects.get(user=referrer)
    print('Referrer XP:', progress.experience_points)
    print('Referral count:', progress.referral_count)
    print('Referral status:', referral.status)
except Exception as e:
    print('Error completing referral:', e)
    import traceback
    traceback.print_exc()
