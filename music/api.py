from django.http import (
    Http404,
    HttpResponseBadRequest,
    HttpResponseForbidden,
    JsonResponse,
    HttpResponse,
)
from django.urls import path
from django.utils import timezone
from django.contrib.auth.decorators import login_required
from music.models import *
from django.contrib.admin.views.decorators import staff_member_required
from django.db.models import Count

from datetime import datetime
from music.utils.queries import form_trackname
from music.external_libraries.lyrics import GeniusService

from music.utils.user_settings import get_user_settings, update_user_settings
from music.utils.video_loader import (
    find_video,
    make_audio_request,
    make_video_request,
    make_search,
)


@login_required
def get_media(http_request):
    song_id = http_request.GET.get("id")
    is_video = True if http_request.GET.get("isVideo") == "true" else False
    request = None
    if not song_id:
        artist = http_request.GET.get("artist")
        title = http_request.GET.get("title")
    else:
        song = Song.objects.get(id=int(song_id))
        artist = song.artist
        title = song.title
        if song.source:
            request = song.source.url
    if artist and title:
        if not request:
            video_id, _ = find_video(artist, title)
            source = SongSource.objects.create(
                service="yt", url=video_id, is_audio_only=False
            )
            song.source = source
            song.save()
            SongListenDate.objects.create(
                owner=http_request.user,
                song=song,
                listen_date=datetime.now(tz=timezone.utc),
            )
            if is_video:
                return JsonResponse(make_video_request(video_id))
            else:
                return JsonResponse(make_audio_request(video_id))
        else:
            if is_video:
                return JsonResponse(make_video_request(request))
            else:
                return JsonResponse(make_audio_request(request))
    else:
        return JsonResponse(
            {"status": "error", "msg": "Неверно указаны входные данные"}
        )


@login_required
def get_lyrics(request):
    q = request.GET.get("q", "")
    if not q:
        return JsonResponse({"status": "error", "msg": "Пустой запрос"})
    service = GeniusService()
    songs = service.find_song(q)
    if not len(songs):
        return JsonResponse({"status": "error", "msg": "Ничего не найдено"})
    info = service.get_info(songs[0])
    return JsonResponse(
        {
            "status": "ok",
            "artist": info.song.artist,
            "title": info.song.title,
            "lyrics": info.lyrics,
            "release_date": (
                info.release_date.strftime("%d.%m.%Y") if info.release_date else None
            ),
        }
    )


@login_required
def get_settings(request):
    return JsonResponse(get_user_settings(request.user)[0])


@login_required
def update_settings(request):
    data = dict(request.POST)
    for key in data:
        data[key] = data[key][0]
        if data[key] == "true":
            data[key] = True
        elif data[key] == "false":
            data[key] = False
        elif data[key].isdigit():
            data[key] = int(data[key])
    update_user_settings(request.user, data)
    return HttpResponse("")


@login_required
def lab_request(request):
    sources = request.GET.get("sources", "").split(";")
    if "" in sources:
        sources.remove("")
    sources = list(map(int, sources))
    popular = request.GET.get("popular") == "true"
    sources = MusicSource.objects.filter(pk__in=sources)
    if popular:
        songs = list(
            map(
                lambda x: Song.objects.get(pk=x["song"]),
                (
                    Song_MusicSourceDate.objects.filter(song__sources__in=sources)
                    .values("song")
                    .annotate(listen_count=Count("listen_date"))
                    .order_by("listen_count")
                    .order_by("?")[:7]
                ),
            )
        )
    else:
        songs = Song.objects.filter(sources__in=sources).order_by("?")[:7]
    result = []
    for song in songs:
        result.append({"shadowName": f"{song.artist} - {song.title}", "id": song.pk})
    return JsonResponse(result, safe=False)


@login_required
def tracks_info(request):
    if "ids" not in request.GET:
        return JsonResponse([], safe=False)
    song_ids = list(map(int, request.GET.get("ids").split(",")))
    songs = list(Song.objects.filter(pk__in=song_ids))
    for i, song in enumerate(songs):
        is_liked = bool(
            Reaction.objects.filter(song=song, owner=request.user, is_negative=False)
        )
        is_disliked = bool(
            Reaction.objects.filter(song=song, owner=request.user, is_negative=True)
        )
        trackname = form_trackname(song.title, song.artist)
        playlists = []
        for playlist in Playlist.objects.filter(owner=request.user):
            if song in playlist.songs.all():
                playlists.append(playlist.pk)

        songs[i] = {
            "id": song.pk,
            "pk": song.pk,
            "title": song.title,
            "artist": song.artist,
            "addedDate": song.added_date.strftime("%d.%m.%y %H:%M:%S"),
            "liked": is_liked,
            "disliked": is_disliked,
            "playlists": playlists,
            "trackname": trackname,
        }

        listen = SongListenDate.objects.filter(song=song, owner=request.user)
        played = Song_MusicSourceDate.objects.filter(song=song)
        if song.source:
            if song.source.service == "yt":
                songsource = "https://youtube.com/watch?v=" + song.source.url
                songs[i]["url"] = songsource
        songs[i]["listenDates"] = []
        for elem in sorted(listen, key=lambda x: x.listen_date):
            songs[i]["listenDates"].append(
                elem.listen_date.strftime("%d.%m.%y %H:%M:%S")
            )
        songs[i]["playDates"] = []
        for elem in sorted(played, key=lambda x: x.listen_date):
            songs[i]["playDates"].append(
                {
                    "date": elem.listen_date.strftime("%d.%m.%y %H:%M:%S"),
                    "source": elem.source.name,
                }
            )
    return JsonResponse(songs, safe=False)


@staff_member_required
def edit_song(request):
    song_id = int(request.POST.get("song_id"))
    source_url = request.POST.get("source_url")
    song = Song.objects.get(id=song_id)
    if song.source:
        song.source.url = source_url
    else:
        song_source = SongSource.objects.create(
            service="yt", url=source_url, is_audio_only=False
        )
        song.source = song_source
    song.save()
    song.source.save()
    return JsonResponse({"status": "ok"})


@staff_member_required
def add_song(request):
    artist = request.POST.get("artist")
    title = request.POST.get("title")
    sources = request.POST.get("sources")
    song = Song.objects.create(artist=artist, title=title)
    for source in sources.split(";"):
        if source.strip():
            song.sources.add(MusicSource.objects.get(id=int(source)))
    song.save()
    return JsonResponse({"status": "ok", "id": song.pk})


@login_required
def yt_search(request):
    query = request.GET.get("q")
    results = []
    if query:
        results = make_search(query)
    return JsonResponse(results, safe=False)


@login_required
def get_playlists(request):
    playlists = Playlist.objects.filter(owner=request.user)
    reactions = Reaction.objects.filter(owner=request.user, is_negative=False)

    result = []
    pid_count = 100
    for playlist in playlists:
        if playlist.name == "Добавленные":
            pid = 1
        else:
            pid = pid_count
        songs = list(
            map(
                lambda x: {
                    "title": x.title,
                    "artist": x.artist,
                    "id": x.pk,
                    "pk": x.pk,
                },
                playlist.songs.all(),
            )
        )
        result.append({"id": pid, "name": playlist.name, "songs": songs})
        pid_count += 1

    songs = list(
        map(
            lambda x: {
                "title": x.song.title,
                "artist": x.song.artist,
                "id": x.song.pk,
                "pk": x.song.pk,
            },
            reactions,
        )
    )
    result.append({"id": 2, "name": "Понравившиеся", "songs": songs})
    result.sort(key=lambda x: x["id"])
    return JsonResponse(result, safe=False)


@login_required
def create_playlist(request):
    name = request.POST.get("name")
    public = True if request.POST.get("public") == "true" else False
    if not Playlist.objects.filter(owner=request.user, name=name):
        Playlist.objects.create(name=name, owner=request.user, isPublic=public)
        return JsonResponse({"status": "ok"})
    return JsonResponse({"status": "error", "error_type": "unique_required"})


@login_required
def remove_playlist(request):
    Playlist.objects.filter(owner=request.user, name=request.POST.get("name")).delete()
    return JsonResponse({"status": "ok"})


@login_required
def get_user_playlists(request):
    playlists = list(Playlist.objects.filter(owner=request.user))
    for i, playlist in enumerate(playlists):
        playlists[i] = {"id": playlist.pk, "name": playlist.name}
    return JsonResponse(playlists, safe=False)


@login_required
def save_to_playlists(request):
    if request.POST.get("playlist_ids"):
        ids = list(map(int, request.POST.get("playlist_ids").split(";")))
    else:
        ids = []
    song_id = int(request.POST.get("song_id"))
    song = Song.objects.get(id=song_id)
    playlists = Playlist.objects.filter(owner=request.user)
    for playlist in playlists:
        if playlist.pk in ids:
            if not playlist.songs.filter(pk=song.pk).exists():
                playlist.songs.add(song)
                playlist.save()
        else:
            if playlist.songs.filter(pk=song.pk).exists():
                playlist.songs.remove(song)
                playlist.save()
    return JsonResponse({"status": "ok"})


@login_required
def set_reaction(request):
    song_id = int(request.POST.get("song_id"))
    is_negative = True if request.POST.get("is_negative") == "true" else False
    set = True if request.POST.get("set") == "true" else False
    if song_id:
        if set:
            Reaction.objects.get_or_create(
                song=Song.objects.get(id=song_id),
                owner=request.user,
                is_negative=is_negative,
            )
        else:
            Reaction.objects.filter(
                song=Song.objects.get(id=song_id),
                owner=request.user,
                is_negative=is_negative,
            ).delete()
    return JsonResponse({"status": "ok"})


urls = [
    path("api/getMedia", get_media),
    path("api/getSettings", get_settings),
    path("api/updateSettings", update_settings),
    path("api/tracksInfo", tracks_info),
    path("api/ytSearch", yt_search),
    path("api/editSong", edit_song),
    path("api/addSong", add_song),
    path("api/getPlaylists", get_playlists),
    path("api/createPlaylist", create_playlist),
    path("api/removePlaylist", remove_playlist),
    path("api/getUserPlaylistNames", get_user_playlists),
    path("api/savePlaylist", save_to_playlists),
    path("api/setReaction", set_reaction),
    path("api/labRequest", lab_request),
    path("api/getLyrics", get_lyrics),
]
