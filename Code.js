function addShiftsToCalendar() {
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  var sheets = ss.getSheets(); // すべてのシートを取得
  var workInfoSheet = ss.getSheetByName("勤務先情報");

  // 「勤務先情報」シートの B列から CaféExample の勤務先名を取得
  var cafeWorkplaceValues = workInfoSheet.getRange("B2:B").getValues().flat().filter(String); // B列の2行目から取得

  // 「勤務先情報」シートから SchoolExample の勤務先名を取得 (A列のパターン名でフィルタ)
  var schoolWorkplaceValues = workInfoSheet.getRange("A2:B").getValues()
    .filter(row => row[0] === "SchoolExample") // A列が "SchoolExample" の行を抽出
    .map(row => row[1]) // 抽出した行の B列の値（勤務先名）を取得
    .filter(String); // 空の文字列を除外

  var calendarCafeExampleId = "cafeexample@group.calendar.google.com"; // CaféExampleカレンダーのID（ダミー）
  var calendarSchoolExampleId = "schoolexample@group.calendar.google.com"; // SchoolExampleカレンダーのID（ダミー）

  var calendarCafeExample;
  var calendarSchoolExample;

  try {
    calendarCafeExample = CalendarApp.getCalendarById(calendarCafeExampleId);
    if (!calendarCafeExample) {
      Logger.log("エラー: CaféExample のカレンダーが見つかりません。IDを確認してください: " + calendarCafeExampleId);
      return; // カレンダーが見つからない場合は処理を中断
    }
  } catch (e) {
    Logger.log("エラー: CaféExample のカレンダーへのアクセス中にエラーが発生しました: " + e);
    return; // エラーが発生した場合は処理を中断
  }

  try {
    calendarSchoolExample = CalendarApp.getCalendarById(calendarSchoolExampleId);
    if (!calendarSchoolExample) {
      Logger.log("エラー: SchoolExample のカレンダーが見つかりません。IDを確認してください: " + calendarSchoolExampleId);
      return; // カレンダーが見つからない場合は処理を中断
    }
  } catch (e) {
    Logger.log("エラー: SchoolExample のカレンダーへのアクセス中にエラーが発生しました: " + e);
    return; // エラーが発生した場合は処理を中断
  }

    for (var s = 0; s < sheets.length; s++) {
    var sheet = sheets[s];
    var sheetName = sheet.getName();

    if (!/^\d{4}_\d{2}$/.test(sheetName)) {
      continue;
    }

    var lastRow = sheet.getLastRow();
    var data = sheet.getRange(2, 1, lastRow - 1, 15).getValues();

    for (var i = 0; i < data.length; i++) {
      var date = new Date(data[i][0]);

      // CaféExample のシフト処理
      var cafeWorkplace = data[i][2]; // C列（CaféExample 勤務先）
      if (cafeWorkplaceValues.includes(cafeWorkplace)) {
        var startTimeCafe = data[i][3];
        var endTimeCafe = data[i][4];
        var titleCafe = cafeWorkplace;
        var descriptionCafe = data[i][15];

        if (startTimeCafe && endTimeCafe) {
          var startDateTimeCafe = new Date(date);
          startDateTimeCafe.setHours(startTimeCafe.getHours(), startTimeCafe.getMinutes());

          var endDateTimeCafe = new Date(date);
          endDateTimeCafe.setHours(endTimeCafe.getHours(), endTimeCafe.getMinutes());

          // CaféExample のカレンダーにある同じイベントを削除
          try {
            var eventsCafe = calendarCafeExample.getEvents(startDateTimeCafe, endDateTimeCafe);
            for (var e = 0; e < eventsCafe.length; e++) {
              eventsCafe[e].deleteEvent();
            }
          } catch (e) {
            Logger.log("エラー: CaféExample のイベント削除中にエラーが発生しました: " + e);
          }

          // CaféExample カレンダーにイベントを追加
          try {
            calendarCafeExample.createEvent(titleCafe, startDateTimeCafe, endDateTimeCafe, {
              description: descriptionCafe,
              reminders: [] // 通知なし
            });
          } catch (e) {
            Logger.log("エラー: CaféExample のイベント作成中にエラーが発生しました: " + e);
          }
        }
      }
      // SchoolExample のシフト処理
      var schoolWorkplace = data[i][8]; // I列（SchoolExample 勤務先）
      if (schoolWorkplaceValues.includes(schoolWorkplace)) {
        var startTimeSchool = data[i][9];
        var endTimeSchool = data[i][10];
        var titleSchool = schoolWorkplace;

        if (startTimeSchool && endTimeSchool) {
          var startDateTimeSchool = new Date(date);
          startDateTimeSchool.setHours(startTimeSchool.getHours(), startTimeSchool.getMinutes());

          var endDateTimeSchool = new Date(date);
          endDateTimeSchool.setHours(endTimeSchool.getHours(), endTimeSchool.getMinutes());

          // SchoolExample カレンダーにある同じイベントを削除
          try {
            var eventsSchool = calendarSchoolExample.getEvents(startDateTimeSchool, endDateTimeSchool);
            for (var e = 0; e < eventsSchool.length; e++) {
              eventsSchool[e].deleteEvent();
            }
          } catch (e) {
            Logger.log("エラー: SchoolExample のイベント削除中にエラーが発生しました: " + e);
          }

          // SchoolExample カレンダーにイベントを追加
          try {
            calendarSchoolExample.createEvent(titleSchool, startDateTimeSchool, endDateTimeSchool, {
              reminders: [] // 通知なし
            });
          } catch (e) {
            Logger.log("エラー: SchoolExample のイベント作成中にエラーが発生しました: " + e);
          }
        }
      }
    }
  }

  Logger.log("CaféExample と SchoolExample のシフトをカレンダーに更新しました！");
}
