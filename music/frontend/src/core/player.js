import { Song } from "../entities/media.js";
import { Queue } from "../entities/playlist.js";
import { WebView } from "../views/common.js";
import { AddingSong } from "../modals/songAdding.js";
import { randomInt } from "../utils/random.js";

const SONGS_PER_PAGE = 30;
var whilePlaying = () => {};

export class Player {
  queue;
  availableQueue; // queue provided by view, recommended for playing

  #component = undefined;
  #skipSegments = [];
  #rAF = null;
  #playBtnLock = false;
  #isVideo = true;
  #currentRequest = undefined;
  snippetMode = false;
  #pairedListButtonList = undefined; // play button in song list required for icon state change

  onQueueChanged = () => {};
  onMediaPlayed = (song) => {};

  constructor() {
    this.queue = new Queue("empty", 0);

    $(".volume-slider").val(
      localStorage.getItem("volume") == undefined
        ? 100
        : parseInt(localStorage.getItem("volume"))
    );

    let videoView = document.querySelector(".video-view");
    if (videoView != undefined) {
      this.#component = videoView;
      this.#component.addEventListener("click", (e) => {
        if (e.detail == 2) {
          this.setPause(!this.isPaused());
        }
      });
    } else {
      this.#component = new Audio();
      this.#component.autoplay = true;
      this.#isVideo = false;
    }
    this.#component.pause();
    this.#component.volume = $(".volume-slider").val() / 100;
  }

  initListeners(webView) {
    $(".volume-slider").on("input", (e) => {
      this.#component.volume = $(e.target).val() / 100;
      localStorage.setItem("volume", $(e.target).val());
    });

    $(".play-button").click((e) => {
      this.play();
    });

    $(".previous-button").click((e) => {
      this.previous();
    });

    $(".next-button").click((e) => {
      this.next();
    });

    $(".pip-button").click((e) => {
      this.#component.requestPictureInPicture();
    });

    $(".fullscreen-button").click((e) => {
      this.#component.requestFullscreen();
    });

    $(".popup-info-button").click((e) => {
      $("#infoModal").modal("toggle");
    });

    webView.onPlayButtonInList = (e) => {
      this.checkQueue(e);
      let id = e.currentTarget.getAttribute("song_id");
      this.queue.setById(id);
      this.queue.snippetQueue = this.snippetMode;
      this.play();
      this.snippetMode = false;
    };

    whilePlaying = () => {
      $(".timeline-slider").val(Math.floor(this.#component.currentTime));
      $(".timeline-slider").attr(
        "value",
        Math.floor(this.#component.currentTime)
      );
      this.#rAF = requestAnimationFrame(whilePlaying);
    };

    $(".timeline-slider").on("input", () => {
      this.calculateTime();
      if (!this.#component.paused) {
        cancelAnimationFrame(this.#rAF);
      }
    });

    $(".timeline-slider").on("change", (e) => {
      this.#component.currentTime = e.target.value;
      if (!this.#component.paused) {
        requestAnimationFrame(whilePlaying);
      }
    });

    this.#component.addEventListener("loadedmetadata", () => {
      this.calculateTime();
      $(".timeline-slider").attr("max", Math.floor(this.#component.duration));
      if (this.queue.snippetQueue) {
        for (let segment of this.calculateSnippetSize(
          this.#component.duration
        )) {
          this.#skipSegments.push(segment);
        }
      }
    });

    this.#component.addEventListener("timeupdate", () => {
      for (let segment of this.#skipSegments) {
        if (
          this.#component.currentTime >= segment[0] &&
          this.#component.currentTime < segment[1]
        ) {
          this.#component.currentTime = segment[1];
        }
      }
      this.calculateTime();
    });

    this.#component.addEventListener("ended", () => {
      this.#component.src = "";
      this.next();
    });

    navigator.mediaSession.setActionHandler("play", () => {
      this.play();
    });

    navigator.mediaSession.setActionHandler("pause", () => {
      this.play();
    });

    navigator.mediaSession.setActionHandler("previoustrack", () => {
      this.previous();
    });

    navigator.mediaSession.setActionHandler("nexttrack", () => {
      this.next();
    });

    this.#component.addEventListener("pause", () => {
      this.changeIconState();
    });

    this.#component.addEventListener("play", () => {
      this.changeIconState();
    });

    webView.setListenersOnSongList();
  }

  enterSnippetMode() {
    this.snippetMode = true;
  }

  calculateSnippetSize(duration) {
    let initValue = 0;
    if (this.#skipSegments.length > 0) {
      if (this.#skipSegments[0][0] < 5) {
        initValue = this.#skipSegments[0][1];
      }
    }

    let leftBorder = randomInt(
      initValue,
      Math.floor(duration / 1.5) + initValue
    );
    let rightBorder = leftBorder + 30;

    return [
      [0, leftBorder],
      [rightBorder + 1, duration],
    ];
  }

  getPairedListButtonList() {
    let song = this.queue.shadowGet();
    if (song != undefined) {
      let song_id = song.id;
      return document.querySelectorAll(`button[song_id="${song_id}"]`);
    }
  }

  checkQueue(event) {
    if (this.queue.name == "empty" && this.availableQueue != undefined) {
      this.loadQueue(this.availableQueue);
    }
    if (event != undefined) {
      let queue = event.currentTarget.parentElement.parentElement.parentElement;
      if (parseInt(queue.getAttribute("id")) == this.availableQueue.id) {
        this.loadQueue(this.availableQueue);
      } else {
        let id = parseInt(queue.getAttribute("id"));
        if (id == undefined) {
          id = randomInt(1001, 1000000);
        }
        let queueObj = new Queue("custom", id, queue);
        queueObj.setById(parseInt(event.currentTarget.getAttribute("song_id")));
        this.loadQueue(queueObj);
      }
    }
  }

  changeIconState() {
    let pairedListButtonList = this.getPairedListButtonList();
    if (
      this.#pairedListButtonList != pairedListButtonList &&
      this.#pairedListButtonList != undefined
    ) {
      for (let pairedListButton of this.#pairedListButtonList) {
        pairedListButton.innerHTML = '<i class="ri-play-fill"></i>';
      }
    }
    this.#pairedListButtonList = pairedListButtonList;
    if (this.#component.paused) {
      $(".play-button").html('<i class="ri-play-fill"></i>');
      if (pairedListButtonList != undefined) {
        for (let pairedListButton of pairedListButtonList) {
          pairedListButton.innerHTML = '<i class="ri-play-fill"></i>';
        }
      }
    } else {
      $(".play-button").html('<i class="ri-pause-fill"></i>');
      for (let pairedListButton of pairedListButtonList) {
        pairedListButton.innerHTML = '<i class="ri-pause-fill"></i>';
      }
    }
  }

  calculateTime() {
    let minutes = Math.floor(this.#component.currentTime / 60);
    let seconds = Math.floor(this.#component.currentTime) % 60;

    let totalMinutes = Math.floor(this.#component.duration / 60);
    let totalSeconds = Math.floor(this.#component.duration) % 60;

    totalMinutes = Number.isFinite(totalMinutes) ? totalMinutes : 0;
    totalSeconds = Number.isFinite(totalSeconds) ? totalSeconds : 0;
    minutes = Number.isFinite(minutes) ? minutes : 0;
    seconds = Number.isFinite(seconds) ? seconds : 0;

    minutes = minutes < 10 ? `0${minutes}` : `${minutes}`;
    seconds = seconds < 10 ? `0${seconds}` : `${seconds}`;

    totalMinutes = totalMinutes < 10 ? `0${totalMinutes}` : `${totalMinutes}`;
    totalSeconds = totalSeconds < 10 ? `0${totalSeconds}` : `${totalSeconds}`;

    let startTime = `${minutes}:${seconds}`;
    let endTime = `${totalMinutes}:${totalSeconds}`;
    let label = `${startTime}/${endTime}`;
    $(".time-info").text(label);

    $(".start-time").text(startTime);
    $(".end-time").text(endTime);
  }

  loadQueue(queue) {
    this.queue = queue;
    this.onQueueChanged();
    this.changeIconState();
  }

  isPaused() {
    return this.#component.paused;
  }

  play(songFor) {
    this.checkQueue();
    if (!this.queue.isNew()) {
      if (this.#playBtnLock) {
        return;
      }
      this.setPause(!this.#component.paused);
    } else {
      if (this.#currentRequest != undefined) {
        this.#currentRequest.abort();
      }
      let song;
      if (songFor != undefined) {
        song = songFor;
      } else {
        song = this.queue.get();
      }
      $(".title-info").text(song.title);
      $(".artist-info").text(song.artist);
      if (this.queue.snippetQueue) {
        $(".status-info").text("сниппет");
        $(".status-info").css({ display: "inline" });
      } else {
        $(".status-info").css({ display: "none" });
      }
      navigator.mediaSession.metadata = new MediaMetadata({
        title: song.title,
        artist: song.artist,
      });
      this.requestSongInfo(song, (song_data) => {
        AddingSong.setLikeButtonGroup(
          song_data,
          "#like-button",
          "#dislike-button"
        );
      });
      if (song.url != undefined) {
        this.#component.src = song.url;
        this.setPause(false);
      } else {
        this.setPause(true);
        this.#playBtnLock = true;
        this.requestSource(
          song,
          this.#isVideo,
          (data) => {
            this.#skipSegments = [];
            this.#playBtnLock = false;
            if (data["status"] == "ok") {
              if (!this.queue.snippetQueue) {
                for (let segment of data["skips"]) {
                  this.#skipSegments.push(segment);
                }
              }
              this.#component.src = data["url"];
              song.setUrl(data["url"]);
              this.setPause(false);
            } else {
              addToast("Ошибка", "", data["msg"]);
              this.next();
            }
            this.#currentRequest = undefined;
          },
          () => {
            this.#playBtnLock = false;
            this.#currentRequest = undefined;
          }
        );
      }
    }
  }

  requestSongInfo(song, callback, error_callback) {
    $.ajax({
      url: `/music/api/tracksInfo`,
      method: "get",
      dataType: "json",
      data: {
        ids: song.id,
      },
      success: callback,
      error: error_callback,
    });
  }

  setPause(state) {
    if (this.#component.paused == state) {
      return;
    }
    if (state) {
      cancelAnimationFrame(this.#rAF);
      this.#component.pause();
    } else {
      requestAnimationFrame(whilePlaying);
      this.#component.play();
      this.onMediaPlayed(this.queue.shadowGet());
    }
  }

  next() {
    this.checkQueue();
    this.queue.next();
    this.play();
  }

  previous() {
    this.checkQueue();
    this.queue.previous();
    this.play();
  }

  requestSource(song, isVideo, callback) {
    song["isVideo"] = isVideo;
    this.#currentRequest = $.ajax({
      url: `/music/api/getMedia`,
      method: "get",
      data: song,
      dataType: "json",
      success: callback,
    });
  }
}
