import { Queue } from "./playlist.js";
import { Song } from "./media.js";

export const DEFAULT_SAVED_ID = 10;

export class LocalQueue extends Queue {
  constructor() {
    super("local", DEFAULT_SAVED_ID, document.querySelector(".queue-saved"));
    this.toDelete = undefined;
    if (localStorage.getItem("saved") != undefined) {
      this.tracks = JSON.parse(localStorage.getItem("saved"));
      for (let i = 0; i < this.tracks.length; i++) {
        this.tracks[i] = Song.fromObject(this.tracks[i]);
      }
    } else {
      this.tracks = [];
    }
    this.render();
  }

  dump() {
    let result = [];
    for (let track of this.tracks) {
      result.push({ title: track.title, artist: track.artist, id: track.id });
    }
    localStorage.setItem("saved", JSON.stringify(result));
  }

  add(song) {
    this.tracks.push(song);
    this.dump();
    this.render();
  }

  findSong(id) {
    id = parseInt(id);
    for (let i = 0; i < this.tracks.length; i++) {
      if (this.tracks[i].id == id) {
        return this.tracks[i];
      }
    }
  }

  containsSongId(id) {
    return this.findSong(id) != undefined;
  }

  remove(song) {
    let i;
    for (i = 0; i < this.tracks.length; i++) {
      if (this.tracks[i].id == song.id) {
        break;
      }
    }
    if (i != this.tracks.length && i != undefined) {
      this.tracks.splice(i, 1);
    }
    this.dump();
    this.render();
  }

  shuffle() {
    super.shuffle();
    this.dump();
  }

  get() {
    if (this.toDelete != undefined) {
      this.remove(this.toDelete);
      this.setPointer(this.getPointer() - 2);
    }
    let song = super.get();
    this.nextSong = undefined;
    this.initState = true;
    this.toDelete = song;
    return song;
  }
}
