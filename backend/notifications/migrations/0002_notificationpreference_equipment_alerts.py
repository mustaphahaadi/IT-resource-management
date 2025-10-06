from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ("notifications", "0001_initial"),
    ]

    operations = [
        migrations.AddField(
            model_name="notificationpreference",
            name="equipment_alerts_enabled",
            field=models.BooleanField(default=True),
        ),
    ]
