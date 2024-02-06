import { PageView } from "./common.js";
import { Queue } from "../entities/playlist.js";

export class SettingsView extends PageView {
  init() {
    $.ajax({
      url: `/music/api/getSettings`,
      method: "get",
      dataType: "json",
      success: function (data) {
        for (let key in data) {
          if (typeof data[key] == "boolean") {
            $(`[setting="${key}"]`).prop("checked", data[key]);
          }
        }
        $(".setting-check").change((e) => {
          let setting = e.target.getAttribute("setting");
          let obj = {};
          obj[setting] = e.target.checked;
          obj["csrfmiddlewaretoken"] = $('[name="csrfmiddlewaretoken"]').val();
          $.ajax({
            url: `/music/api/updateSettings`,
            method: "post",
            data: obj,
            dataType: "json",
            success: () => {},
          });
        });
      },
    });
  }

  fetchQueue() {
    this.player.availableQueue = new Queue("settings", 2, null);
  }
}
