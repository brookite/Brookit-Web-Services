import { Song } from "../entities/media.js";
import { Queue } from "../entities/playlist.js";
import { PageView } from "./common.js";

export class LabView extends PageView {
  init() {
    if (localStorage.getItem("labSettings") == undefined) {
      this.object = { sources: [], popular: false };
      localStorage.setItem("labSettings", JSON.stringify(object));
    } else {
      this.object = JSON.parse(localStorage.getItem("labSettings"));
    }

    for (let source of this.object.sources) {
      document.querySelector(`#s${source}`).checked = true;
    }

    document.querySelector("#popularCheck").checked = this.object.popular;

    $(".lab-play").click(() => {
      if (this.webView.labEnabled) {
        this.webView.labEnabled = false;
        this.player.setPause(true);
      } else {
        this.sendRequest();
      }
    });

    $("#popularCheck").change((e) => {
      this.object.popular = e.target.checked;
      localStorage.setItem("labSettings", JSON.stringify(this.object));
    });

    $(".sourceCheck").change((e) => {
      if (e.target.checked) {
        this.object.sources.push(
          parseInt(e.target.getAttribute("id").slice(1))
        );
      } else {
        const index = this.object.sources.indexOf(
          parseInt(e.target.getAttribute("id").slice(1))
        );
        if (index > -1) {
          this.object.sources.splice(index, 1);
        }
      }
      localStorage.setItem("labSettings", JSON.stringify(this.object));
    });
  }

  sendRequest(async) {
    let object = JSON.parse(localStorage.getItem("labSettings"));
    $.ajax({
      url: `/music/api/labRequest`,
      method: "get",
      dataType: "json",
      success: (data) => {
        this.webView.labEnabled = true;
        let queue = new Queue();
        queue.tracks = [];
        queue.onEnded = () => {
          this.sendRequest(false);
        };
        queue.onNext = (song) => {
          $(".lab-current-music").text(
            "станет известно через несколько секунд"
          );
          setTimeout(() => {
            $(".lab-current-music").text(song.shadowName);
          }, 25000);
        };
        for (let trackInfo of data) {
          let song = new Song("Песня", "Лаборатория музыки", trackInfo.id);
          song.shadowName = trackInfo.shadowName;
          queue.tracks.push(song);
        }
        this.player.loadQueue(queue);
        this.player.play();
      },
      data: {
        popular: object.popular,
        sources: object.sources.join(";"),
      },
      async: async == undefined ? true : async,
      error: () => {},
    });
  }
}
