import { ModalView } from "./common.js";

var ytcardExample = document.querySelector(".yt-video").cloneNode(true);

export class YoutubeSearch extends ModalView {
  initListeners() {
    $(".yt-search-btn").click(() => {
      let name = document.querySelector(".trackinfo-name").innerHTML;
      $.ajax({
        url: `/music/api/ytSearch`,
        method: "get",
        dataType: "json",
        data: {
          q: name,
        },
        success: (data) => {
          YoutubeSearch.viewYtSearch(data);
        },
      });
    });

    $(".save-song-btn").click(() => {
      $.ajax({
        url: `/music/api/editSong`,
        method: "post",
        dataType: "json",
        data: {
          song_id: $(".trackinfo-name").attr("song_id"),
          source_url: document.querySelector("#sourceURL").value.split("=")[1],
          csrfmiddlewaretoken: $('[name="csrfmiddlewaretoken"]').val(),
        },
        success: (data) => {},
      });
    });
  }

  static viewYtSearch(data) {
    let ytList = document.querySelector(".yt-videos");
    let selectedId = document.querySelector("#sourceURL").value.split("=")[1];
    ytList.style.visibility = "visible";
    for (let obj of data) {
      let elem = ytcardExample.cloneNode(true);
      elem.setAttribute("video_id", obj["id"]);
      if (obj["id"] != selectedId) {
        elem.classList.remove("active");
      }
      elem.querySelector(".yt-video-name").innerHTML = obj["name"];
      elem.querySelector(".yt-video-channel").innerHTML = obj["channel"];
      elem.querySelector(".yt-video-date").innerHTML = obj["date"];
      elem.addEventListener("click", (e) => {
        for (let element of document.querySelector(".yt-videos").childNodes) {
          if (element.classList.contains("active")) {
            element.classList.remove("active");
          }
        }
        e.currentTarget.classList.add("active");
        $("#sourceURL").val(
          "https://youtube.com/watch?v=" +
            e.currentTarget.getAttribute("video_id")
        );
      });
      ytList.appendChild(elem);
    }
  }
}
