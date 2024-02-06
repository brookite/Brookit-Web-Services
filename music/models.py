from django.db import models

from main.models import User


class Song(models.Model):
    title = models.CharField(max_length=128, verbose_name="Название")
    artist = models.CharField(max_length=128, verbose_name="Исполнитель")
    added_date = models.DateTimeField(auto_now_add=True, verbose_name="Дата добавления")
    source = models.OneToOneField('SongSource', null=True, on_delete=models.CASCADE)

    class Meta:
        verbose_name = "Песня"
        verbose_name_plural = "Песни"
        unique_together = ('title', 'artist',)


class SongSource(models.Model):
    url = models.CharField(max_length=512, verbose_name="Ссылка")
    service = models.CharField(max_length=128, verbose_name="Сервис")
    is_audio_only = models.BooleanField(verbose_name="Только аудио")

    class Meta:
        verbose_name = "Источник песни"
        verbose_name_plural = "Источники песен"


class Playlist(models.Model):
    name = models.CharField(max_length=128, verbose_name="Название")
    owner = models.ForeignKey(User, on_delete=models.CASCADE)
    isPublic = models.BooleanField(verbose_name="Публичный")
    creation_date = models.DateTimeField(auto_now_add=True, verbose_name="Дата создания")
    songs = models.ManyToManyField(Song, related_name="playlists")

    class Meta:
        verbose_name = "Плейлист"
        verbose_name_plural = "Плейлисты"


class Reaction(models.Model):
    song = models.ForeignKey(Song, on_delete=models.CASCADE)
    owner = models.ForeignKey(User, on_delete=models.CASCADE)
    added_date = models.DateTimeField(auto_now_add=True, verbose_name="Дата добавления")
    is_negative = models.BooleanField(null=False, verbose_name="Негативная ли реакция")

    class Meta:
        verbose_name = "Реакция пользователя"
        verbose_name_plural = "Реакции пользователей"


class MusicSource(models.Model):
    name = models.CharField(max_length=256, unique=True, verbose_name="Название")
    songs = models.ManyToManyField(Song, related_name="sources")

    class Meta:
        verbose_name = "Музыкальный источник"
        verbose_name_plural = "Музыкальные источники"


class Song_MusicSourceDate(models.Model):
    listen_date = models.DateTimeField()
    song = models.ForeignKey(Song, on_delete=models.CASCADE)
    source = models.ForeignKey(MusicSource, on_delete=models.CASCADE)


class SongListenDate(models.Model):
    listen_date = models.DateTimeField()
    song = models.ForeignKey(Song, on_delete=models.CASCADE)
    owner = models.ForeignKey(User, on_delete=models.CASCADE)


class UserSettings(models.Model):
    user = models.OneToOneField(User, on_delete=models.CASCADE)
    json = models.TextField(verbose_name="Настройки в формате JSON")

    class Meta:
        verbose_name = "Настройки пользователя"
        verbose_name_plural = "Настройки пользователей"


def radio_logo(instance, filename):
    return f"logos/{instance.pk}/{filename}"


class Radio(models.Model):
    name = models.CharField(max_length=64, verbose_name="Название")
    stream_url = models.CharField(max_length=512, verbose_name="Ссылка на поток")
    logo = models.ImageField(upload_to=radio_logo, verbose_name="Логотип", blank=True, null=True)

    class Meta:
        verbose_name = "Радио"
        verbose_name_plural = "Радио"





