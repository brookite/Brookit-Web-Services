from music.utils.queries import form_trackname
import music.external_libraries.youtube_tools as yt
import traceback


def find_video(artist, title):
    response = yt.search(form_trackname(title, artist))
    return response[0].id, f"https://youtube.com/watch?v={response[0].id}"


def make_audio_request(video_id):
    link = yt.get_direct_audio(video_id)
    try:
        skips = yt.get_sponsorblock_skips(video_id)
    except:
        traceback.print_exc()
        skips = []
    if not link:
        return {"status": "error", "msg": "Получить ссылку на аудио не удалось"}
    else:
        return {"status": "ok", "url": link, "skips": skips}


def make_video_request(video_id):
    link = yt.get_direct_video(video_id)
    try:
        skips = yt.get_sponsorblock_skips(video_id)
    except:
        traceback.print_exc()
        skips = []
    if not link:
        return {"status": "error", "msg": "Получить ссылку на видео не удалось"}
    else:
        return {"status": "ok", "url": link, "skips": skips}


def make_search(query: str):
    results = []
    search = yt.search(query)
    for video in search:
        results.append(
            {
                "name": video.title,
                "id": video.id,
                "channel": video.author,
                "date": video.upload_date.strftime("%d.%m.%y"),
                "preview": video.preview_min,
            }
        )
    return results
