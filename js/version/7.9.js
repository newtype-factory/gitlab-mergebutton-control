"use strict";

class GitLab extends GitLabBase {
  constructor() {
  }

  static getVersion() {
    return "7.9";
  }

  static getCommentElements() {
    return $("#notes").find("ul.main-notes-list>li:not(.system-note) .note-text>p");
  }

  static getPlusOneCount() {
    var $votes = $("#votes"), count = 0;

    if ($votes.length > 0) {
      count = Number($votes.text());
    }
    return count;
  }

  static getLoginName() {
    var $profile = $("#profile-pic"), name = "";

    if ($profile.length > 0) {
      name = $profile.attr("href").replace(/\/u\//, "");
    }
    return name;
  }

  static getAuthorName() {
    var $author = $(".creator").find("span.author"), name = "";

    if ($author.length > 0) {
      name = $author.text();
    }
    return name;

  }

  static getWidgetElement() {
    return $("div.mr-widget-body>div.can_be_merged");
  }

  static getMergeFormElement() {
    return false;
  }

  static mergeCancel() {
    var $widget = this.getWidgetElement(),
        $progress = $("div.mr-widget-body>div.merge-in-progress");

    if ($widget.length > 0) {
      $widget.css("display", "block");
    }
    if ($progress.length > 0) {
      $progress.css("display", "none");
    }
  }
}
