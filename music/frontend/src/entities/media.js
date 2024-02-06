export class MediaObject {
  title;
  artist;
  url;

  constructor(title, artist) {
    this.title = title;
    this.artist = artist;
  }

  setUrl(url) {
    this.url = url;
    return this;
  }

  toHTML() {
    return document.createElement("dummy");
  }
}

export class Song extends MediaObject {
  id;

  constructor(title, artist, id) {
    super(title, artist);
    this.id = id;
  }

  static fromObject(obj) {
    return new Song(obj.title, obj.artist, obj.id);
  }

  toHTML(number = 1) {
    let template = document.querySelector("templates .track");
    let song = template.cloneNode(true);
    song.setAttribute("song_id", this.id);
    song.querySelector(".num").innerHTML = number;
    song.querySelector(".list-play-btn").setAttribute("song_id", this.id);
    song.querySelectorAll(".music-text")[0].innerHTML = this.title;
    song.querySelectorAll(".music-text")[1].innerHTML = this.artist;
    song.querySelector(".trackmenu-dropdown").setAttribute("song_id", this.id);
    return song;
  }
}
