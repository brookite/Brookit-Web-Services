import { ModalView } from "./common.js";

var checkboxExample = document
  .querySelector(".playlist-checkbox")
  .cloneNode(true);

export class AddingSong extends ModalView {
  initListeners() {}

  static addSong() {
    $("#addSongModal").modal("toggle");
  }

  static saveSong() {
    let sources = [];
    for (let source of document.querySelectorAll(".musicSourceCheckbox")) {
      if (source.checked) {
        let source_id = source.getAttribute("musicSource_id");
        sources.push(source_id);
      }
    }

    $.ajax({
      url: `/music/api/addSong`,
      method: "post",
      dataType: "json",
      data: {
        artist: $("#artistField").val(),
        title: $("#titleField").val(),
        sources: sources.join(";"),
        csrfmiddlewaretoken: $('[name="csrfmiddlewaretoken"]').val(),
      },
      success: (data) => {
        if (data["status"] != "ok") {
          addToast("Ошибка добавления", "", data["msg"]);
        }
      },
    });
    $("#addSongModal").modal("toggle");
  }

  static addToPlaylist() {
    let elements = document.querySelectorAll(".playlist-checkbox");
    let results = [];
    let song_id = elements[0].getAttribute("song_id");
    for (let element of elements) {
      if (element.querySelector(".playlist-input-checkbox").checked) {
        results.push(element.getAttribute("playlist_id"));
      }
    }
    $.ajax({
      url: `/music/api/savePlaylist`,
      method: "post",
      dataType: "json",
      data: {
        playlist_ids: results.join(";"),
        song_id: song_id,
        csrfmiddlewaretoken: $('[name="csrfmiddlewaretoken"]').val(),
      },
      success: () => {
        $("#addToPlaylistModal").modal("toggle");
        // Todo: update
      },
    });
  }

  static setLikeButtonGroup(song_data, like_button_id, dislike_button_id) {
    $(like_button_id).removeClass();
    $(dislike_button_id).removeClass();

    $(like_button_id).addClass("btn");
    $(dislike_button_id).addClass("btn");

    if (song_data.length > 0 && song_data[0].liked) {
      $(like_button_id).addClass("btn-primary");
    } else {
      $(like_button_id).addClass("btn-secondary");
    }

    if (song_data.length > 0 && song_data[0].disliked) {
      $(dislike_button_id).addClass("btn-primary");
    } else {
      $(dislike_button_id).addClass("btn-secondary");
    }

    $(like_button_id)
      .off("click")
      .on("click", () => {
        let reaction = true;
        if (song_data.length == 0) {
          return;
        }
        if (song_data[0].liked) {
          reaction = false;
          $(like_button_id).removeClass("btn-primary");
          $(like_button_id).addClass("btn-secondary");
        } else {
          $(like_button_id).removeClass("btn-secondary");
          $(like_button_id).addClass("btn-primary");
        }
        $.ajax({
          url: `/music/api/setReaction`,
          method: "post",
          dataType: "json",
          data: {
            song_id: song_data[0]["id"],
            is_negative: false,
            set: reaction,
            csrfmiddlewaretoken: $('[name="csrfmiddlewaretoken"]').val(),
          },
          success: () => {
            song_data[0].liked = reaction;
          },
        });
      });

    $(dislike_button_id)
      .off("click")
      .on("click", () => {
        let reaction = true;
        if (song_data.length == 0) {
          return;
        }
        if (song_data[0].disliked) {
          reaction = false;
          $(dislike_button_id).removeClass("btn-primary");
          $(dislike_button_id).addClass("btn-secondary");
        } else {
          $(dislike_button_id).removeClass("btn-secondary");
          $(dislike_button_id).addClass("btn-primary");
        }
        $.ajax({
          url: `/music/api/setReaction`,
          method: "post",
          dataType: "json",
          data: {
            song_id: song_data[0]["id"],
            is_negative: true,
            set: reaction,
            csrfmiddlewaretoken: $('[name="csrfmiddlewaretoken"]').val(),
          },
          success: () => {
            song_data[0].disliked = reaction;
          },
        });
      });
  }

  static loadAddToPlaylistModal(song_id) {
    document.querySelector(".playlists-checkboxes").innerHTML = "";

    $.ajax({
      url: `/music/api/tracksInfo`,
      method: "get",
      data: {
        ids: song_id,
      },
      dataType: "json",
      success: (song_data) => {
        AddingSong.setLikeButtonGroup(
          song_data,
          "#like-playlist-btn",
          "#dislike-playlist-btn"
        );
        let callback = (data) => {
          for (let playlist of data) {
            let element = checkboxExample.cloneNode(true);
            element.setAttribute("song_id", song_id);
            element.querySelector(".playlistName").innerHTML = playlist["name"];
            element.setAttribute("playlist_id", playlist["id"]);
            if (song_data[0]["playlists"].includes(playlist["id"])) {
              element.querySelector(".playlist-input-checkbox").checked = true;
            } else {
              element.querySelector(".playlist-input-checkbox").checked = false;
            }
            document.querySelector(".playlists-checkboxes").append(element);
          }
        };
        $.ajax({
          url: `/music/api/getUserPlaylistNames`,
          method: "get",
          dataType: "json",
          success: callback,
        });
      },
    });
  }
}
