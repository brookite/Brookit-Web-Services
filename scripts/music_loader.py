from music.models import *
import csv
import os
import datetime
import warnings


warnings.filterwarnings("ignore")


def run():
    root = os.path.split(__file__)[0]
    songs = set()
    sources = set()
    songs_sources = set()
    airdate = set()
    for file in os.listdir(root):
        if os.path.splitext(file)[-1] == ".csv":
            
            with open(os.path.join(root, file), "r", encoding="utf-8") as fobj:
                reader = csv.reader(fobj, delimiter=",")
                
                for row in reader:
                    dt = datetime.datetime.fromtimestamp(int(row[2]))
                    print(dt)
                    if len(row) <= 4:
                        song = (row[1], row[0])
                    else:
                        song = (row[1], row[0], row[4])
                    songs.add(song)
                    sources.add(row[3])
                    songs_sources.add((song, row[3]))
                    airdate.add((dt, song, row[3]))

    Song.objects.bulk_create(
        list(map(lambda song: Song(title=song[0], artist=song[1]), songs))
    , ignore_conflicts=True)
    for song in songs:
        if len(song) == 3:
            Song.objects.filter(title=song[0], artist=song[1]).update(added_date=datetime.datetime.fromtimestamp(int(song[2])))
    MusicSource.objects.bulk_create(
        list(map(lambda name: MusicSource(name=name), sources))
    , ignore_conflicts=True)
    objs = []
    i = 1
    for song, source in songs_sources:
        print(f"{i}/{len(songs_sources)}")
        song = Song.objects.filter(title=song[0], artist=song[1]).first().pk
        sourceobj = MusicSource.objects.filter(name=source).first().pk
        obj = MusicSource.songs.through(song_id=song, musicsource_id=sourceobj)
        objs.append(obj)
        i += 1
    MusicSource.songs.through.objects.bulk_create(objs, ignore_conflicts=True)
    objs = []
    i = 1
    for dt, song, source in airdate:
        print(f"{i}/{len(airdate)}")
        song = Song.objects.filter(title=song[0], artist=song[1]).first()
        sourceobj = MusicSource.objects.filter(name=source).first()
        objs.append(Song_MusicSourceDate(listen_date=dt, song=song, source=sourceobj))
        i += 1
    Song_MusicSourceDate.objects.bulk_create(objs, ignore_conflicts=True)
