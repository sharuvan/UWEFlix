# Generated by Django 5.0.6 on 2024-07-09 13:44

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('cinema', '0004_alter_film_poster_image'),
    ]

    operations = [
        migrations.RemoveField(
            model_name='screen',
            name='capacity',
        ),
        migrations.AddField(
            model_name='screen',
            name='seat_columns',
            field=models.IntegerField(default=10),
            preserve_default=False,
        ),
        migrations.AddField(
            model_name='screen',
            name='seat_rows',
            field=models.IntegerField(default=10),
            preserve_default=False,
        ),
    ]
