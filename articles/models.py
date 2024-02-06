from django.db import models

from main.models import User


class Article(models.Model):
    title = models.CharField(max_length=128, verbose_name="Название")
    author_title = models.CharField(max_length=64, verbose_name="Подпись автора")
    owner = models.ForeignKey(User, null=True, on_delete=models.SET_NULL)
    created = models.DateTimeField(auto_now_add=True, verbose_name="Дата написания")
    edited = models.DateTimeField(auto_now_add=True, verbose_name="Дата изменения")
    is_edit_public = models.BooleanField(
        default=True, verbose_name="Публичное редактирование"
    )
    is_view_public = models.BooleanField(
        default=True, verbose_name="Публичный просмотр"
    )
    text = models.TextField(default="", verbose_name="Исходный текст")
