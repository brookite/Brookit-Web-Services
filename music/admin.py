from django.contrib import admin

from music.models import *


class SongAdmin(admin.ModelAdmin):
    search_fields = ('title', 'artist')
    list_display = ('title', 'artist')


class RadioAdmin(admin.ModelAdmin):
    search_fields = ('name', 'stream_url', 'logo')
    list_display = ('name', 'stream_url', 'logo')


admin.site.register(Song, SongAdmin)
admin.site.register(Playlist)
admin.site.register(MusicSource)
admin.site.register(UserSettings)
admin.site.register(Radio, RadioAdmin)