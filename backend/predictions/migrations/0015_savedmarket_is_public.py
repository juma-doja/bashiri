# Generated migration for is_public field

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('predictions', '0014_bashiripicksnapshot'),
    ]

    operations = [
        migrations.AddField(
            model_name='savedmarket',
            name='is_public',
            field=models.BooleanField(default=False, help_text='If true, other users can see this saved market'),
        ),
    ]