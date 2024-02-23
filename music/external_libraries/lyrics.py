import requests
from bs4 import BeautifulSoup as bs
from dataclasses import dataclass
import datetime
from abc import ABC
import urllib.parse
from typing import List


class HTTPError(Exception):
    pass


@dataclass
class Song:
    artist: str
    title: str
    service_id: str


@dataclass
class SongInfo:
    song: Song
    release_date: datetime.date = None
    lyrics: str = None
    translate: str = None


class LyricsService(ABC):
    def find_song(self, query: str) -> List[Song]:
        pass

    def get_translate(self, song: Song):
        pass

    def get_lyrics(self, song: Song):
        pass


class GeniusService(LyricsService):
    def find_song(self, query: str, search_scope=["song", "lyric"]) -> List[Song]:
        api_url_search = "https://genius.com/api/search/multi"
        r = requests.get(api_url_search, params={"q": query})
        if r.status_code != 200:
            raise HTTPError(r.status_code)
        result = r.json()["response"]["sections"]
        songs = []
        for section in result:
            if section["type"] in search_scope:
                for song in section["hits"]:
                    assert song["type"] == "song"
                    song = song["result"]
                    songobject = Song(
                        song["artist_names"], song["title"], song["api_path"]
                    )
                    songs.append(songobject)
        return songs

    def get_info(self, songobj: Song) -> SongInfo:
        url = "https://genius.com/api"
        r = requests.get(url + songobj.service_id)
        if r.status_code != 200:
            raise HTTPError(r.status_code)
        data = r.json()
        if data["meta"]["status"] != 200:
            raise HTTPError(data["meta"]["status"])
        song = data["response"]["song"]

        date = song["release_date_components"]
        if date:
            date = datetime.date(
                date.get("year", 0),
                date.get(date["month"], 1),
                date.get(date["day"], 1),
            )

        r = requests.get(song["url"])
        soup = bs(r.text, "lxml")
        data = soup.select('[data-lyrics-container="true"]')
        lyrics = ""
        for block in data:
            for element in block.children:
                if element.name == "br":
                    lyrics += "\n"
                else:
                    lyrics += element.text
            lyrics += "\n\n"
        return SongInfo(songobj, date, lyrics, None)
