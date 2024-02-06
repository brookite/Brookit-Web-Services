from django.shortcuts import render
from django.http import Http404, HttpResponse
from django.contrib.auth.decorators import login_required
from django.core.paginator import Paginator, EmptyPage
from django.db.models import Q

from music.abstract import PageView
from music.models import *
from music.utils.other import enumerate
from music.constants import SONGS_PER_PAGE
from music.utils.user_settings import get_user_settings
from music.utils.playlists import create_default_playlists

import json


class MainPageView(PageView):
    template_page_name = "mainpage.html"
    template_view_name = "mainview.html"

    def context(self, request):
        settings, _ = get_user_settings(request.user)
        track_count = Song.objects.count()
        source_id = request.GET.get("source_id", 0)
        if source_id == "NaN":
            source_id = 0
        return {
            "settings": settings,
            "track_count": track_count,
            "sources": MusicSource.objects.all(),
            "source_id": int(source_id),
        }


class SourcesPageView(PageView):
    template_view_name = "sourcesview.html"
    template_page_name = "sourcepage.html"

    def context(self, request):
        settings, _ = get_user_settings(request.user)
        return {
            "sources": MusicSource.objects.all(),
            "radios": Radio.objects.all(),
            "settings": settings,
        }


class LabPageView(PageView):
    template_view_name = "labview.html"
    template_page_name = "labpage.html"

    def context(self, request):
        settings, _ = get_user_settings(request.user)
        return {"sources": MusicSource.objects.all(), "settings": settings}


class SettingsPageView(PageView):
    template_view_name = "settingsview.html"
    template_page_name = "settingspage.html"

    def context(self, request):
        settings, _ = get_user_settings(request.user)
        return {"settings": settings}


class PlaylistsPageView(PageView):
    template_page_name = "playlistspage.html"
    template_view_name = "playlistsview.html"

    def context(self, request):
        create_default_playlists(request.user)
        settings, _ = get_user_settings(request.user)
        return {"settings": settings}


class SearchPageView(PageView):
    template_view_name = "searchview.html"
    template_page_name = "searchpage.html"

    def context(self, request):
        settings, _ = get_user_settings(request.user)
        return {
            "settings": settings,
            "user": request.user,
            "sources": MusicSource.objects.all(),
        }


@login_required
def search_media(request):
    query = request.GET.get("query")
    if query is not None:
        query = query.strip()
    results = []
    if query:
        results = Song.objects.filter(Q(title__iregex=query) | Q(artist__iregex=query))[
            :50
        ]
    return render(request, "searchresult.html", {"song_list": results})


@login_required
def tracklist_render(request):
    songs = request.POST.get("songs")
    if songs:
        songs = json.loads(songs)
        return render(request, "tracklist.html", {"songs": enumerate(songs)})
    return HttpResponse()


@login_required
def source_page(request):
    if not request.GET.get("id"):
        return HttpResponse("")
    source_id = int(request.GET.get("id"))
    page = int(request.GET.get("page"))
    songs = Song.objects.filter(sources__pk=source_id).all()
    paginator = Paginator(songs, SONGS_PER_PAGE)
    try:
        return render(
            request,
            "tracklist.html",
            {
                "songs": enumerate(
                    paginator.page(page).object_list, SONGS_PER_PAGE * (page - 1) + 1
                )
            },
        )
    except EmptyPage:
        return HttpResponse("")
