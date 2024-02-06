import { ModalView } from "./common.js";

var listenTimeExample = document
  .querySelector(".trackinfo-listentime")
  .cloneNode(true);
var playTimeExample = document
  .querySelector(".trackinfo-playtime")
  .cloneNode(true);

export class TrackInfo extends ModalView {
  initListeners() {}

  static setTrackInfo(song_id) {
    $.ajax({
      url: `/music/api/tracksInfo`,
      method: "get",
      dataType: "json",
      data: {
        ids: song_id,
      },
      success: (data) => {
        if (data.length == 0) {
          addToast(
            "Ошибка открытия",
            "",
            data["msg"],
            Math.floor(Math.random() * 1000)
          );
          return;
        }
        data = data[0];
        $(".trackinfo-name").text(data["trackname"]);
        $(".trackinfo-addeddate").text(data["addedDate"]);
        $(".trackinfo-name").attr("song_id", song_id);

        let listenList = document.querySelector(".tracklist-list.listenlist");
        listenList.innerHTML = "";
        for (let obj of data["listenDates"]) {
          let elem = listenTimeExample.cloneNode(true);
          elem.innerHTML = obj;
          listenList.appendChild(elem);
        }

        let playList = document.querySelector(".tracklist-list.playlist");
        playList.innerHTML = "";
        for (let obj of data["playDates"]) {
          let elem = playTimeExample.cloneNode(true);
          elem.childNodes[0].nodeValue = obj["date"];
          elem.querySelector(".trackinfo-source").innerHTML = obj["source"];
          playList.appendChild(elem);
        }

        if ("url" in data) {
          $("#sourceURL").val(data["url"]);
        }

        let ytList = document.querySelector(".yt-videos");
        if (ytList != undefined) {
          ytList.innerHTML = "";
        }
      },
    });
  }
}
