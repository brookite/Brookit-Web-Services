from django.urls import path, include

from music.views import *
from music.api import urls as apiurls

try:
    from music.streams.radios import radio_urls
except ImportError:
    radio_urls = []


urlpatterns = [
    path("", MainPageView().page()),
    path("views/main", MainPageView().view()),
    path("views/sources", SourcesPageView().view()),
    path("views/settings", SettingsPageView().view()),
    path("views/search", SearchPageView().view()),
    path("views/lab", LabPageView().view()),
    path("views/sourceTrackList", source_page),
    path("sources", SourcesPageView().page()),
    path("settings", SettingsPageView().page()),
    path("lab", LabPageView().page()),
    path("search", SearchPageView().page()),
    path("views/searchMedia", search_media),
    path("views/playlists", PlaylistsPageView().view()),
    path("playlists", PlaylistsPageView().page()),
    path("views/trackList", tracklist_render),
    *apiurls,
    *radio_urls,
]
