import { TrackInfo } from "../modals/trackInfo.js";
import { AddingSong } from "../modals/songAdding.js";
import { Song } from "../entities/media.js";

export function renderView(url, new_url, callback, webView) {
  loadView(url, (data) => {
    document.querySelector(".appView").innerHTML = data;
    webView.clearInfo();
    if (callback instanceof PageView) {
      callback.as_function();
    } else {
      callback();
    }
    window.history.pushState("", "Project Music", new_url);
  });
}

export function loadView(url, callback, data) {
  if (data == undefined) {
    data = {};
  }
  $.ajax({
    url: `/music/views/${url}`,
    method: "get",
    dataType: "html",
    data: data,
    success: callback,
  });
}

export class PageView {
  player;
  webView;

  constructor(webView, player) {
    this.player = player;
    this.webView = webView;
  }

  init() {}

  fetchQueue() {}

  clearInfo() {}

  as_function() {
    this.init();
    this.fetchQueue();
    this.webView.setListenersOnSongList(this.player);
    return this;
  }
}

export class WebView {
  pageNum = -1;
  scrollEndTrigger = () => {};
  onPlayButtonInList = () => {};
  player;
  savedQueue;

  constructor(player) {
    this.player = player;
  }

  clearInfo() {
    this.pageNum = -1;
    this.scrollEndTrigger = undefined;
    this.setListenersOnSongList(this.player);
  }

  setListenersOnSongList(player) {
    $(".list-play-btn").off("click");
    $(".list-play-btn").click(this.onPlayButtonInList);
    $(".text-primary.music-text").off("click");
    $(".text-primary.music-text").click((e) => {
      TrackInfo.setTrackInfo(
        e.target.parentElement.parentElement.getAttribute("song_id")
      );
      $("#trackInfoModal").modal("toggle");
    });
    $(".track-action").off("click");
    $(".track-action").click((e) => {
      let song_id =
        e.currentTarget.parentElement.parentElement.parentElement.getAttribute(
          "song_id"
        );
      let track_row =
        e.currentTarget.parentElement.parentElement.parentElement.parentElement
          .parentElement;

      let action = e.currentTarget.getAttribute("action");
      let selectedSong = new Song(
        track_row.querySelectorAll(".music-text")[0].innerHTML,
        track_row.querySelectorAll(".music-text")[1].innerHTML,
        song_id
      );
      if (action == "playNext") {
        this.player.queue.nextSong = selectedSong;
      } else if (action == "addToPlaylist") {
        $("#addToPlaylistModal").modal("toggle");
        AddingSong.loadAddToPlaylistModal(song_id);
      } else if (action == "addToSavedQueue") {
        if (this.savedQueue != undefined) {
          if (!this.savedQueue.containsSongId(song_id)) {
            this.savedQueue.add(selectedSong);
            addToast(
              "Успешно",
              "только что",
              "Песня добавлена в список отложенных"
            );
          } else {
            this.savedQueue.remove(this.savedQueue.findSong(song_id));
            addToast(
              "Успешно",
              "только что",
              "Песня удалена из списка отложенных"
            );
          }
        }
      } else if (action == "snippet") {
        this.player.enterSnippetMode();
        $(`button[song_id=${song_id}]`).trigger("click");
      }
    });
  }
}
