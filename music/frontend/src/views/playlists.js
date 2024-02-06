import { PageView, WebView } from "./common.js";
import { Queue } from "../entities/playlist.js";

export class PlaylistView extends PageView {
  playlists;
  checkboxExample;

  init() {
    if (PlaylistView.checkboxExample == undefined) {
      PlaylistView.checkboxExample = document
        .querySelector(".playlist-checkbox")
        .cloneNode(true);
    }
    $.ajax({
      url: `/music/api/getPlaylists`,
      method: "get",
      dataType: "json",
      success: (data) => {
        this.playlists = data;
        document.querySelector(".playlist-list").innerHTML = "";
        for (let playlist of this.playlists) {
          document.querySelector(".playlist-list").innerHTML += `
                    <a href="#" class="list-group-item list-group-item-action playlist-item" playlist_id=${playlist.id}>${playlist.name}</a>`;
        }
        $(".playlist-item").click((e) => {
          for (let playlist_item of document.querySelectorAll(
            ".playlist-item"
          )) {
            playlist_item.classList.remove("active");
            playlist_item.setAttribute("aria-current", "false");
          }
          let id = parseInt(e.target.getAttribute("playlist_id"));

          let songs = [];
          for (let playlist of this.playlists) {
            if (playlist.id == id) {
              songs = playlist.songs;
            }
          }

          this.player.availableQueue = new Queue("playlist", 2000 + id);
          this.player.availableQueue.tracks = songs;
          $.ajax({
            url: `/music/views/trackList`,
            method: "post",
            dataType: "html",
            data: {
              songs: JSON.stringify(songs),
              csrfmiddlewaretoken: $('[name="csrfmiddlewaretoken"]').val(),
            },
            success: (data) => {
              document.querySelector(".playlist-content").innerHTML = data;
              e.target.classList.add("active");
              e.target.setAttribute("aria-current", "true");
              this.webView.setListenersOnSongList();
            },
          });
        });
        document.querySelector(".playlist-item").click();
      },
    });
    $(".createBtn").off("click");
    $(".createBtn").click(() => {
      $("#addPlaylistModal").modal("toggle");
    });
    $(".removeBtn").off("click");
    $(".removeBtn").click(() => {
      let selected = document.querySelector(".playlist-item.active");
      if (selected != undefined) {
        if (parseInt(selected.getAttribute("playlist_id")) > 2) {
          $(".delete-msg").text(
            `Вы уверены в удалении плейлиста ${selected.innerHTML}?`
          );
          $("#removePlaylistModal").modal("toggle");
        }
      }
    });
    $(".createPlaylist-btn").off("click");
    $(".createPlaylist-btn").click(() => {
      this.createPlaylist();
    });
    $(".removePlaylist-btn").off("click");
    $(".removePlaylist-btn").click(() => {
      this.removePlaylist();
    });
  }

  createPlaylist() {
    $.ajax({
      url: `/music/api/createPlaylist`,
      method: "post",
      dataType: "json",
      data: {
        name: document.querySelector("#nameField").value,
        csrfmiddlewaretoken: $('[name="csrfmiddlewaretoken"]').val(),
      },
      success: (data) => {
        if (
          data["status"] == "error" &&
          data["error_type"] == "unique_required"
        ) {
          addToast("Ошибка создания", "", "Такой плейлист уже существует");
        }
      },
    });
    $("#addPlaylistModal").modal("toggle");
    window.location.reload();
  }

  removePlaylist() {
    let selected = document.querySelector(".playlist-item.active");
    $.ajax({
      url: `/music/api/removePlaylist`,
      method: "post",
      dataType: "json",
      data: {
        name: selected.innerHTML,
        csrfmiddlewaretoken: $('[name="csrfmiddlewaretoken"]').val(),
      },
      success: () => {},
    });
    $("#removePlaylistModal").modal("toggle");
    window.location.reload();
  }
}
