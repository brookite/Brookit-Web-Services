# Generated by Django 4.2.2 on 2023-07-13 09:52

from django.db import migrations, models


class Migration(migrations.Migration):
    dependencies = [
        ("music", "0001_initial"),
    ]

    operations = [
        migrations.AlterModelOptions(
            name="song",
            options={"verbose_name": "Песня", "verbose_name_plural": ("Песни",)},
        ),
        migrations.AlterField(
            model_name="songsource",
            name="url",
            field=models.CharField(max_length=512, unique=True, verbose_name="Ссылка"),
        ),
        migrations.AlterUniqueTogether(
            name="song",
            unique_together={("title", "artist")},
        ),
    ]
