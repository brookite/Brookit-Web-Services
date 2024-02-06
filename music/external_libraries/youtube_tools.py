from pathlib import Path
import requests
from dataclasses import dataclass
import datetime
from typing import List, Tuple
import dateparser
import re
import subprocess
import warnings
import json

with open(Path(__file__).parent.resolve() / "youtube_token.txt", "r") as fobj:
    YT_API_KEY = fobj.read()
HEADERS = {
    "User-Agent": "Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/121.0.0.0 Safari/537.36"
}
VIDEO_REGEX = re.compile(
    r"^(?:http(?:s)?:\/\/)?(?:www\.)?(?:m\.)?(?:youtu\.be\/|youtube\.com\/(?:(?:watch)?\?(?:.*&)?v(?:i)?=|(?:embed|v|vi|user|shorts)\/))([^\?&\"'>]+)$"
)


class YouTubeAPIError(Exception):
    pass


@dataclass
class Video:
    id: str
    author: str
    title: str
    preview_min: str
    preview_standard: str
    preview_max: str
    upload_date: datetime.datetime


def search(query: str, count: int = 15) -> List[Video]:
    req = requests.get(
        "https://www.googleapis.com/youtube/v3/search",
        params={
            "max_results": count,
            "q": query,
            "part": "snippet",
            "type": "video",
            "key": YT_API_KEY,
        },
        headers=HEADERS,
    ).json()
    videos = []
    items = req.get("items")
    if not items:
        raise YouTubeAPIError(req)
    for item in items:
        snippet = item.get("snippet")

        videoId = item.get("id").get("videoId")
        published = dateparser.parse(snippet.get("publishedAt"))
        title = snippet.get("title")
        preview_min = snippet.get("thumbnails").get("default").get("url")
        preview_standard = snippet.get("thumbnails").get("medium").get("url")
        preview_max = snippet.get("thumbnails").get("high").get("url") or snippet.get(
            "thumbnails"
        ).get("maxres").get("url")
        author = snippet.get("channelTitle")
        video = Video(
            videoId,
            author,
            title,
            preview_min,
            preview_standard,
            preview_max,
            published,
        )
        videos.append(video)
    return videos


def get_video_by_id(video_id) -> Video:
    req = requests.get(
        "https://www.googleapis.com/youtube/v3/videos",
        params={"id": video_id, "part": "snippet", "key": YT_API_KEY},
        headers=HEADERS,
    ).json()
    items = req.get("items")
    if not items:
        raise YouTubeAPIError(req)
    item = items[0]
    videoId = item.get("id")
    snippet = item.get("snippet")
    published = dateparser.parse(snippet.get("publishedAt"))
    title = snippet.get("title")
    preview_min = snippet.get("thumbnails").get("default").get("url")
    preview_standard = snippet.get("thumbnails").get("medium").get("url")
    preview_max = snippet.get("thumbnails").get("high").get("url") or snippet.get(
        "thumbnails"
    ).get("maxres").get("url")
    author = snippet.get("channelTitle")
    return Video(
        videoId, author, title, preview_min, preview_standard, preview_max, published
    )


def get_id_by_source(url) -> str:
    match = VIDEO_REGEX.match(url)
    if match:
        id = match.group(1)
        return id


def _dispatch_ytdlp(video_id, *args):
    url = f"https://youtube.com/watch?v={video_id}"
    command = ["yt-dlp", url, *args]
    result = subprocess.run(
        command, stdout=subprocess.PIPE, stderr=subprocess.PIPE, universal_newlines=True
    )
    if result.stderr and result.stdout:
        warnings.warn(result.stderr)
    elif result.stderr and not result.stdout:
        raise YouTubeAPIError(str(result.stderr))
    return str(result.stdout)


def get_direct_video(video_id: str) -> str:
    return _dispatch_ytdlp(video_id, "--get-url", "-f", "b")


def get_direct_audio(video_id: str) -> str:
    return _dispatch_ytdlp(video_id, "--get-url", "-f", "ba")


def get_sponsorblock_skips(video_id) -> List[Tuple[float]]:
    cats = json.dumps("intro,sponsor,preview,music_offtopic".split(","))
    req = requests.get(
        "https://sponsor.ajay.app/api/skipSegments",
        params={"videoID": video_id, "categories": cats},
        headers=HEADERS,
    )
    if req.text == "Not Found":
        return []
    req = req.json()
    if not len(req):
        return []
    if len(req) == 1:
        if isinstance(req[0], str):
            warnings.warn(req[0])
            return []
    results = []
    for fragment in req:
        results.append(tuple(fragment["segment"]))
    return results
