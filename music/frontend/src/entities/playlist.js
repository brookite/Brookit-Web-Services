import { Song } from "./media.js";
import { shuffle } from "../utils/random.js";

export class Queue {
  static onRender = () => {};
  queueName;
  id;
  tracks;
  #pointer = -1;
  nextSong;
  element;
  snippetQueue = false;
  initState = false;

  onEnded = () => {};
  onNext = () => {};

  constructor(queueName, id, element) {
    this.queueName = queueName;
    this.id = id;
    if (element == null) {
      this.element = document.createElement("tbody");
    } else if (element != undefined) {
      this.element = element;
    } else {
      this.element = document.querySelector(".queue");
    }
    this.element.setAttribute("id", id);
    this.fill();
  }

  setPointer(i) {
    this.#pointer = i;
    this.initState = false;
  }

  getPointer() {
    return this.#pointer;
  }

  fill() {
    this.clear();
    if (this.element == undefined) {
      return;
    }
    for (let track of this.element.children) {
      let title = track
        .querySelector(".text-primary")
        .innerHTML.trim()
        .replaceAll("&amp;", "&");
      let artist = track
        .querySelector(".text-secondary")
        .innerHTML.trim()
        .replaceAll("&amp;", "&");
      let id = track.getAttribute("song_id");
      let song = new Song(title, artist, id);
      this.tracks.push(song);
    }
  }

  isNew() {
    return !this.initState;
  }

  get() {
    this.initState = true;
    if (this.#pointer == -1 && this.tracks.length > 0) {
      this.onNext(this.tracks[this.#pointer + 1]);
    }
    let result = this.shadowGet();
    this.nextSong = undefined;
    return result;
  }

  shadowGet() {
    if (this.nextSong != undefined) {
      let nextSong = this.nextSong;
      return nextSong;
    }
    if (this.#pointer == -1) {
      return this.tracks[0];
    }
    return this.tracks[this.#pointer];
  }

  next() {
    if (this.#pointer + 1 == this.tracks.length) {
      this.onEnded();
    }
    this.#pointer = (this.#pointer + 1) % this.tracks.length;
    this.onNext(this.shadowGet());
    this.initState = false;
  }

  previous() {
    if (this.#pointer == 0) {
      this.#pointer = this.tracks.length - 1;
    } else {
      this.#pointer = (this.#pointer - 1) % this.tracks.length;
    }
    this.initState = false;
  }

  setById(id) {
    let oldPointer = this.#pointer;
    let i = 0;
    for (let song of this.tracks) {
      if (song.id == id) {
        this.#pointer = i;
        break;
      }
      i++;
    }
    if (oldPointer != this.#pointer) {
      this.initState = false;
    }
  }

  shuffle() {
    let currentSong =
      this.#pointer != -1 ? this.tracks[this.#pointer] : undefined;
    if (currentSong != undefined) {
      this.tracks.splice(this.#pointer, 1);
    }
    this.tracks = shuffle(this.tracks);
    if (currentSong != undefined) {
      this.tracks.splice(0, 0, currentSong);
    }
    this.render();
    this.#pointer = 0;
  }

  render(element) {
    let el = element;
    if (el == undefined) {
      el = this.element;
    }
    let counter = 1;

    el.innerHTML = "";
    for (let track of this.tracks) {
      el.appendChild(track.toHTML(counter));
      counter++;
    }
    Queue.onRender();
  }

  sub(queue) {
    this.tracks = queue.tracks;
    this.id = queue.id;
    this.setPointer(queue.getPointer());
    this.nextSong = queue.nextSong;
    this.initState = queue.initState;
    this.element.setAttribute("id", queue.id);
    return this;
  }

  clear() {
    this.tracks = [];
    this.initState = false;
  }
}
