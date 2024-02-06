from django.db import models

from django.contrib.auth.models import AbstractUser


def avatar_file(instance, filename):
    return f"avatars/{instance.pk}/{filename}"


class User(AbstractUser):
    birthday = models.DateField(verbose_name="Дата рождения", blank=True, null=True)
    middle_name = models.CharField(max_length=64, blank=True, null=True, verbose_name="Отчество")
    status = models.TextField(verbose_name="Статус", blank=True, null=True)
    avatar = models.ImageField(upload_to=avatar_file, verbose_name="Аватар", blank=True, null=True)

    class Meta:
        verbose_name = "Профиль пользователя"
        verbose_name_plural = "Профили пользователя"


class UserEmail(models.Model):
    email = models.CharField(max_length=64)
    user = models.ForeignKey(User, on_delete=models.CASCADE)


class UserPhone(models.Model):
    phone = models.CharField(max_length=48)
    user = models.ForeignKey(User, on_delete=models.CASCADE)
    is_main = models.BooleanField()


class Post(models.Model):
    content = models.TextField(verbose_name="Содержимое")
    title = models.CharField(max_length=128, verbose_name="Заголовок")
    owner = models.ForeignKey(User, on_delete=models.CASCADE, verbose_name="Владелец")
    publish_date = models.DateTimeField(auto_now_add=True, verbose_name="Дата публикации")

    class Meta:
        verbose_name = "Запись в блоге"
        verbose_name_plural = "Записи в блоге"
