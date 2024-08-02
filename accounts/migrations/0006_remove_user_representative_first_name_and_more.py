# Generated by Django 5.0.6 on 2024-07-09 06:39

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('accounts', '0005_user_date_of_birth_user_email_address_and_more'),
    ]

    operations = [
        migrations.RemoveField(
            model_name='user',
            name='representative_first_name',
        ),
        migrations.RemoveField(
            model_name='user',
            name='representative_last_name',
        ),
        migrations.AlterField(
            model_name='user',
            name='first_name',
            field=models.CharField(blank=True, max_length=30, null=True),
        ),
        migrations.AlterField(
            model_name='user',
            name='last_name',
            field=models.CharField(blank=True, max_length=30, null=True),
        ),
    ]
