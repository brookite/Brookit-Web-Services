from django import template
from music.models import *
from music.utils.other import enumerate

register = template.Library()


@register.inclusion_tag("tracklist.html")
def get_tracklist(argument, obj):
    ctx = {}
    if argument == "random":
        if obj:
            ctx["songs"] = enumerate(
                Song.objects.filter(sources__pk=obj).order_by("?")[:150]
            )
        else:
            ctx["songs"] = enumerate(Song.objects.order_by("?")[:100])
    elif argument == "custom":
        ctx["songs"] = enumerate(obj)
    return ctx


@register.inclusion_tag("mainview.html")
def main_view(track_count, source_id, sources):
    return {"track_count": track_count, "sources": sources, "source_id": source_id}


@register.inclusion_tag("settingsview.html")
def settings_view():
    return {}


@register.inclusion_tag("playlistsview.html")
def playlists_view(playlists):
    return {}


@register.inclusion_tag("searchview.html")
def search_view(user):
    return {"user": user, "sources": MusicSource.objects.all()}


@register.inclusion_tag("sourcesview.html")
def source_view(sources, radios):
    return {"sources": sources, "radios": radios}


@register.inclusion_tag("labview.html")
def lab_view(sources):
    return {"sources": sources}
