let memory = new Map();

export default function initLyrics(player) {
  player.onMediaPlayed = (song) => {
    if (
      document.querySelector(".video-view-modal").classList.contains("modal-lg")
    ) {
      $("#lyricsPrompt").val(`${song.artist} - ${song.title}`);
      document.querySelector(".lyrics-prompt-btn").click();
    }
  };
  $(".lyrics-button").click(() => {
    let element = document.querySelector(".video-view-modal");
    if (element.classList.contains("modal-lg")) {
      element.classList.remove("modal-lg");
      element.classList.add("modal-xl");

      let viewSection = element.querySelector(".view-section");
      viewSection.classList.remove("col-12");
      viewSection.classList.add("col-8");
      element.querySelector(".lyrics-section").classList.add("col-4");
      element.querySelector(".lyrics-section").style = "";

      let song = player.queue.shadowGet();
      if (song == undefined) {
        $("#lyricsPrompt").val("");
      } else {
        $("#lyricsPrompt").val(`${song.artist} - ${song.title}`);
      }

      $(".lyrics-section").css("height", $(".video-view").height());
      openLyrics(player);
    } else {
      element.classList.remove("modal-xl");
      element.classList.add("modal-lg");

      let viewSection = element.querySelector(".view-section");
      viewSection.classList.remove("col-8");
      viewSection.classList.add("col-12");
      element.querySelector(".lyrics-section").classList.remove("col-4");
      element.querySelector(".lyrics-section").style = "display: none";
    }
  });
  $(".lyrics-prompt-btn").click(() => {
    openLyrics(player);
  });
}

function openLyrics(player) {
  let query = $("#lyricsPrompt").val();
  if (memory.has(query)) {
    return memory.get(query);
  }
  if (query.trim() == "") {
    return;
  }
  $.ajax({
    url: `/music/api/getLyrics`,
    method: "get",
    dataType: "json",
    data: {
      q: query,
    },
    success: (data) => {
      if (data["status"] != "ok") {
        addToast("Ошибка", "", data["msg"]);
        return;
      }
      memory.set(query, data);
      let element = document.querySelector(".lyrics-section");
      element.querySelector(
        ".songName"
      ).innerHTML = `${data["artist"]} - ${data["title"]}`;
      element.querySelector(".release-date").innerHTML = data["release_date"];
      element.querySelector(".lyrics-text").innerText = data["lyrics"];
    },
    error: () => {
      addToast("Ошибка", "", "Сервис недоступен");
    },
  });
}
