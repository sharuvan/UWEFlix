# Generated by Django 5.0.6 on 2024-07-09 14:47

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('cinema', '0005_remove_screen_capacity_screen_seat_columns_and_more'),
    ]

    operations = [
        migrations.AddField(
            model_name='showing',
            name='discount',
            field=models.DecimalField(decimal_places=2, default=0.0, max_digits=5),
        ),
    ]
