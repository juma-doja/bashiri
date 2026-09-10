import os
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'config.settings')
import django
django.setup()

from accounts.models import User
from gamification.models import Referral, UserProgress

referrer = User.objects.get(username='lastmateru')
referee = User.objects.filter(username='jujuuu').first()

print('Referrer:', referrer.username)
print('Referee:', referee.username if referee else 'None')

if referee:
    referral = Referral.objects.filter(referrer=referrer, referred_user=referee).first()
    print('Existing referral:', referral)
    
    # Test referral completion
    if referral and referral.status == 'PENDING':
        print('Testing referral completion...')
        try:
            referral.complete_referral(referee)
            print('Referral completed successfully!')
            
            # Check referrer progress
            progress = UserProgress.objects.get(user=referrer)
            print('Referrer XP:', progress.experience_points)
            print('Referral count:', progress.referral_count)
        except Exception as e:
            print('Error completing referral:', e)
