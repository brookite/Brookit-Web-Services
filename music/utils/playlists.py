from music.models import *


def create_default_playlists(user):
    Playlist.objects.get_or_create(
        name="Добавленные",
        owner=user,
        isPublic=False)