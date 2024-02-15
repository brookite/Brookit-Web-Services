import $ from "jquery";

export function isEditMode() {
  return $(".page").hasClass("page_edit");
}

export function isMobileView() {
  return parseInt($(document).width()) <= 900;
}
