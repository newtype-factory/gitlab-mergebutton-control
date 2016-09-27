"use strict";

$(function() {
  // 最初にテキストボックスにフォーカスしているとうまくvalidationできないのでおまじない
  setTimeout(function() {
    $('input[name="url"]').focus();
    $("body").focus();
  }, 0);
  // バージョン表示
  $(".version").text(chrome.runtime.getManifest().version);
  // データ取り出し
  chrome.runtime.getBackgroundPage(function(backgroundPage) {
    backgroundPage.getStorageData().then(function(data) {
      if (data) {
        console.log(data);
        $('input[name="url"]').val(data.url);
        $('select[name="version"]').val(data.version);
        $('input[name="allDisabled"]').prop('checked', data.allDisabled);
      }
    });
  });
  // フォームバリデータ設定
  $("#setting-form").submit(function(e) {
    e.preventDefault();
  }).validate({
    rules: {
      url: {
        url2: true,
        required: true
      },
      version: {
        required: true
      }
    },
    messages: {
      url: {
        url2: "URLの形式が正しくありません",
        required: "URLを入力してください"
      },
      version: {
        required: "バージョンを選択してください"
      }
    },
    errorPlacement: function(error, element) {
      var inputName = $(element)[0].name,
          $errorElement = $("#" + inputName + "-error");

      if ($errorElement.length > 0) {
        $errorElement.find(".error-text").text(error.text());
      } else {
        $.get(chrome.runtime.getURL("html/error.html"), function(data) {
          $(data).attr("id", inputName + "-error").insertAfter(element);
          $("#" + inputName + "-error").find(".error-text").text(error.text());
        });
      }
    },
    unhighlight: function(element, errorClass) {
      var inputName = $(element)[0].name,
          $errorElement = $("#" + inputName + "-error");

      if ($errorElement.length > 0) {
        $errorElement.remove();
      }
    },
    submitHandler: function() {
      saveData();
    }
  });
});

function saveData() {
  var $url = $('input[name="url"]'),
      $version = $('select[name="version"]'),
      $allDisabled = $('input[name="allDisabled"]');

  // データをsyncで保存
  chrome.runtime.getBackgroundPage(function(backgroundPage) {
    backgroundPage.setStorageData({
      "url": $url.val(),
      "version": $version.val(),
      "allDisabled": $allDisabled.prop('checked')
    });
  });
  // ポップアップを閉じる
  window.close();
}
