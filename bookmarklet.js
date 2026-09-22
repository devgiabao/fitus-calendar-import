(function () {
  'use strict';

  var MODAL_ID = 'hcmus-gcal-exporter-modal';
  var oldModal = document.getElementById(MODAL_ID);
  if (oldModal) {
    oldModal.remove();
  }

  function getStudentInfo() {
    var text = document.body.innerText;
    var match = text.match(/\b(\d{7,10})\s*[-–:]\s*([A-ZÀ-Ỹ\s]{3,40})\b/u);
    if (match) {
      return { id: match[1].trim(), name: match[2].trim(), full: match[1].trim() + ' - ' + match[2].trim() };
    }
    return { id: '', name: '', full: '' };
  }

  function findCourseTable() {
    var tables = Array.from(document.querySelectorAll('table'));
    for (var i = 0; i < tables.length; i++) {
      var txt = tables[i].innerText;
      if ((txt.indexOf('Mã MH') >= 0 || txt.indexOf('Mã môn') >= 0) && (txt.indexOf('Lịch LT') >= 0 || txt.indexOf('Lịch TH') >= 0 || txt.indexOf('Lớp HP') >= 0)) {
        return tables[i];
      }
    }
    return null;
  }

  function parseSchedule(text) {
    if (!text || typeof text !== 'string') return [];
    var clean = text.replace(/<br\s*\/?>/gi, '\n');
    var regex = /(?:(T[2-7]|Thứ\s*[2-7]|Thứ\s*(?:Hai|Ba|Tư|Bốn|Năm|Sáu|Bảy)|CN|Chủ\s*nhật))\s*[:\-\s]?\s*(\d{1,2})[h:](\d{2})\s*[-–—~đến\s]+\s*(\d{1,2})[h:](\d{2})(?:[^\n\r,;]*?(?:[\(\[]\s*([^()\[\]]+)\s*[\)\]]|[-–—:]\s*([A-Za-z0-9\.\-_]+)|\b(?:phòng|p\.?)\s*([A-Za-z0-9\.\-_]+)))?/gi;
    var res = [];
    var m;
    while ((m = regex.exec(clean)) !== null) {
      var rawDay = m[1];
      var startH = m[2].padStart(2, '0');
      var startM = m[3];
      var endH = m[4].padStart(2, '0');
      var endM = m[5];
      var room = (m[6] || m[7] || m[8] || '').trim();

      var dow = 1;
      var dLower = rawDay.toLowerCase().replace(/\s+/g, '');
      if (dLower.indexOf('2') >= 0 || dLower.indexOf('hai') >= 0) dow = 1;
      else if (dLower.indexOf('3') >= 0 || dLower.indexOf('ba') >= 0) dow = 2;
      else if (dLower.indexOf('4') >= 0 || dLower.indexOf('tư') >= 0 || dLower.indexOf('bốn') >= 0) dow = 3;
      else if (dLower.indexOf('5') >= 0 || dLower.indexOf('năm') >= 0) dow = 4;
      else if (dLower.indexOf('6') >= 0 || dLower.indexOf('sáu') >= 0) dow = 5;
      else if (dLower.indexOf('7') >= 0 || dLower.indexOf('bảy') >= 0) dow = 6;
      else if (dLower.indexOf('cn') >= 0 || dLower.indexOf('chủ') >= 0 || dLower.indexOf('chu') >= 0) dow = 0;

      var offset = dow === 0 ? 6 : dow - 1;
      res.push({
        rawDay: rawDay,
        dow: dow,
        offset: offset,
        startTime: startH + ':' + startM,
        endTime: endH + ':' + endM,
        room: room
      });
    }
    return res;
  }

  function extractCourses(table) {
    var trs = Array.from(table.querySelectorAll('tr'));
    var headerRow = null;
    for (var i = 0; i < trs.length; i++) {
      var txt = trs[i].innerText;
      if (txt.indexOf('Mã MH') >= 0 || txt.indexOf('Tên MH') >= 0) {
        headerRow = trs[i];
        break;
      }
    }

    var col = { code: 1, name: 2, credits: 3, classCode: 4, sem: 5, lt: 9, th: 10, gvLt: 11, gvTh: 12 };
    if (headerRow) {
      Array.from(headerRow.querySelectorAll('th, td')).forEach(function (c, idx) {
        var t = c.innerText.trim().toLowerCase();
        if (t.indexOf('mã mh') >= 0 || t.indexOf('mã môn') >= 0) col.code = idx;
        else if (t.indexOf('tên mh') >= 0 || t.indexOf('tên môn') >= 0) col.name = idx;
        else if (t === 'tc' || t.indexOf('tín chỉ') >= 0) col.credits = idx;
        else if (t.indexOf('lớp hp') >= 0 || t.indexOf('lớp') >= 0) col.classCode = idx;
        else if (t.indexOf('học kỳ') >= 0 || t.indexOf('học kì') >= 0) col.sem = idx;
        else if (t.indexOf('lịch lt') >= 0 || t.indexOf('lý thuyết') >= 0) col.lt = idx;
        else if (t.indexOf('lịch th') >= 0 || t.indexOf('thực hành') >= 0) col.th = idx;
        else if (t.indexOf('gv-lt') >= 0 || t.indexOf('gv lt') >= 0) col.gvLt = idx;
        else if (t.indexOf('gv-th') >= 0 || t.indexOf('gv th') >= 0) col.gvTh = idx;
      });
    }

    var list = [];
    var start = headerRow ? trs.indexOf(headerRow) + 1 : 1;
    for (var r = start; r < trs.length; r++) {
      var cells = Array.from(trs[r].querySelectorAll('td, th'));
      if (cells.length < 5) continue;
      var getVal = function (idx) { return (idx >= 0 && cells[idx]) ? cells[idx].innerText.trim() : ''; };

      var code = getVal(col.code);
      var name = getVal(col.name);
      if (!code && !name) continue;

      var credits = getVal(col.credits);
      var classCode = getVal(col.classCode);
      var sem = getVal(col.sem);
      var ltRaw = getVal(col.lt);
      var thRaw = getVal(col.th);
      var gvLt = getVal(col.gvLt);
      var gvTh = getVal(col.gvTh);

      var lt = parseSchedule(ltRaw);
      var th = parseSchedule(thRaw);

      if (lt.length > 0 || th.length > 0 || name) {
        list.push({
          id: 'c_' + r,
          code: code,
          name: name,
          credits: credits,
          classCode: classCode,
          sem: sem,
          gvLt: gvLt,
          gvTh: gvTh,
          lt: lt,
          th: th,
          selected: true
        });
      }
    }
    return list;
  }

  function getDefaultMonday() {
    var d = new Date();
    var day = d.getDay();
    var diff = (day === 0 ? -6 : 1) - day;
    d.setDate(d.getDate() + diff);
    return d.toISOString().split('T')[0];
  }

  function makeICS(courses, startStr, weeks, alarmMins, student) {
    var parts = startStr.split('-').map(Number);
    var baseMon = new Date(parts[0], parts[1] - 1, parts[2]);
    var pad = function (n) { return String(n).padStart(2, '0'); };
    var now = new Date();
    var dtstamp = now.getUTCFullYear() + pad(now.getUTCMonth() + 1) + pad(now.getUTCDate()) + 'T' + pad(now.getUTCHours()) + pad(now.getUTCMinutes()) + pad(now.getUTCSeconds()) + 'Z';
    var calName = (student && student.full) ? ('TKB HCMUS - ' + student.full) : 'Thời khóa biểu HCMUS';

    var lines = [
      'BEGIN:VCALENDAR',
      'VERSION:2.0',
      'PRODID:-//HCMUS CTDB//Schedule to Google Calendar//VI',
      'CALSCALE:GREGORIAN',
      'METHOD:PUBLISH',
      'X-WR-CALNAME:' + calName,
      'X-WR-TIMEZONE:Asia/Ho_Chi_Minh',
      'BEGIN:VTIMEZONE',
      'TZID:Asia/Ho_Chi_Minh',
      'X-LIC-LOCATION:Asia/Ho_Chi_Minh',
      'BEGIN:STANDARD',
      'TZOFFSETFROM:+0700',
      'TZOFFSETTO:+0700',
      'TZNAME:+07',
      'DTSTART:19700101T000000',
      'END:STANDARD',
      'END:VTIMEZONE'
    ];

    var evCount = 0;
    courses.filter(function (c) { return c.selected; }).forEach(function (course) {
      var sessions = [];
      course.lt.forEach(function (s) { sessions.push(Object.assign({}, s, { typeName: 'Lý thuyết', pfx: '[LT]', teacher: course.gvLt })); });
      course.th.forEach(function (s) { sessions.push(Object.assign({}, s, { typeName: 'Thực hành', pfx: '[TH]', teacher: course.gvTh })); });

      sessions.forEach(function (s) {
        evCount++;
        var sDate = new Date(baseMon);
        sDate.setDate(baseMon.getDate() + s.offset);

        var shm = s.startTime.split(':').map(Number);
        var ehm = s.endTime.split(':').map(Number);

        var sDt = new Date(sDate); sDt.setHours(shm[0], shm[1], 0, 0);
        var eDt = new Date(sDate); eDt.setHours(ehm[0], ehm[1], 0, 0);

        var sStr = sDt.getFullYear() + pad(sDt.getMonth() + 1) + pad(sDt.getDate()) + 'T' + pad(sDt.getHours()) + pad(sDt.getMinutes()) + '00';
        var eStr = eDt.getFullYear() + pad(eDt.getMonth() + 1) + pad(eDt.getDate()) + 'T' + pad(eDt.getHours()) + pad(eDt.getMinutes()) + '00';

        var summary = s.pfx + ' ' + course.name + ' - ' + course.classCode;
        var loc = s.room ? ('Phòng ' + s.room + ', HCMUS') : 'ĐH Khoa học Tự nhiên ĐHQG-HCM';

        var desc = 'Môn học: ' + course.name + '\\nMã môn: ' + course.code + '\\nLớp HP: ' + course.classCode + '\\nLoại lớp: ' + s.typeName;
        if (course.credits) desc += '\\nSố tín chỉ: ' + course.credits;
        if (course.sem) desc += '\\nHọc kỳ: ' + course.sem;
        if (s.teacher) desc += '\\nGiảng viên: ' + s.teacher;
        if (s.room) desc += '\\nPhòng học: ' + s.room;
        if (student && student.full) desc += '\\nSinh viên: ' + student.full;
        desc += '\\nNguồn: portal.ctdb.hcmus.edu.vn';

        var uid = 'hcmus-' + (course.code || 'mh') + '-' + s.pfx.replace(/[^A-Z]/g, '') + '-' + s.dow + '-' + evCount + '-' + Date.now() + '@ctdb.hcmus.edu.vn';

        lines.push('BEGIN:VEVENT');
        lines.push('UID:' + uid);
        lines.push('DTSTAMP:' + dtstamp);
        lines.push('DTSTART;TZID=Asia/Ho_Chi_Minh:' + sStr);
        lines.push('DTEND;TZID=Asia/Ho_Chi_Minh:' + eStr);
        lines.push('RRULE:FREQ=WEEKLY;COUNT=' + weeks);
        lines.push('SUMMARY:' + summary);
        lines.push('LOCATION:' + loc);
        lines.push('DESCRIPTION:' + desc);
        lines.push('STATUS:CONFIRMED');
        lines.push('TRANSP:OPAQUE');

        if (alarmMins > 0) {
          lines.push('BEGIN:VALARM');
          lines.push('ACTION:DISPLAY');
          lines.push('DESCRIPTION:Nhắc nhở: Sắp tới giờ học ' + course.name);
          lines.push('TRIGGER:-PT' + alarmMins + 'M');
          lines.push('END:VALARM');
        }

        lines.push('END:VEVENT');
      });
    });

    lines.push('END:VCALENDAR');
    return { content: lines.join('\r\n'), count: evCount };
  }

  function makeGCalUrl(course, s, startStr, weeks) {
    var parts = startStr.split('-').map(Number);
    var baseMon = new Date(parts[0], parts[1] - 1, parts[2]);
    var sDate = new Date(baseMon);
    sDate.setDate(baseMon.getDate() + s.offset);

    var pad = function (n) { return String(n).padStart(2, '0'); };
    var shm = s.startTime.split(':').map(Number);
    var ehm = s.endTime.split(':').map(Number);

    var sDt = new Date(sDate); sDt.setHours(shm[0], shm[1], 0, 0);
    var eDt = new Date(sDate); eDt.setHours(ehm[0], ehm[1], 0, 0);

    var sStr = sDt.getFullYear() + pad(sDt.getMonth() + 1) + pad(sDt.getDate()) + 'T' + pad(sDt.getHours()) + pad(sDt.getMinutes()) + '00';
    var eStr = eDt.getFullYear() + pad(eDt.getMonth() + 1) + pad(eDt.getDate()) + 'T' + pad(eDt.getHours()) + pad(eDt.getMinutes()) + '00';

    var title = s.pfx + ' ' + course.name + ' - ' + course.classCode;
    var loc = s.room ? ('Phòng ' + s.room + ', HCMUS') : 'ĐH Khoa học Tự nhiên ĐHQG-HCM';
    var desc = 'Mã MH: ' + course.code + ' | Lớp: ' + course.classCode + ' | Loại: ' + s.typeName;

    var u = new URL('https://calendar.google.com/calendar/render');
    u.searchParams.set('action', 'TEMPLATE');
    u.searchParams.set('text', title);
    u.searchParams.set('dates', sStr + '/' + eStr);
    u.searchParams.set('details', desc);
    u.searchParams.set('location', loc);
    u.searchParams.set('recur', 'RRULE:FREQ=WEEKLY;COUNT=' + weeks);
    u.searchParams.set('ctz', 'Asia/Ho_Chi_Minh');
    return u.toString();
  }

  var student = getStudentInfo();
  var table = findCourseTable();

  if (!table) {
    alert('❌ Không tìm thấy bảng kết quả ĐKHP trên trang này!\n\nVui lòng kiểm tra lại bạn đang ở trang:\nhttps://portal.ctdb.hcmus.edu.vn/sinh-vien/ket-qua-dkhp');
    return;
  }

  var courses = extractCourses(table);
  if (courses.length === 0) {
    alert('⚠️ Đã tìm thấy bảng nhưng không phát hiện môn học nào được đăng ký.');
    return;
  }

  var defMon = getDefaultMonday();

  var modal = document.createElement('div');
  modal.id = MODAL_ID;

  var styleStr = '#' + MODAL_ID + '{position:fixed;inset:0;z-index:999999;background:rgba(15,23,42,0.65);backdrop-filter:blur(4px);display:flex;align-items:center;justify-content:center;font-family:-apple-system,BlinkMacSystemFont,"Segoe UI",Roboto,sans-serif;color:#1e293b;}' +
    '#' + MODAL_ID + ' *{box-sizing:border-box;}' +
    '#' + MODAL_ID + ' .box{background:#fff;width:94%;max-width:860px;max-height:90vh;border-radius:16px;box-shadow:0 25px 50px -12px rgba(0,0,0,0.35);display:flex;flex-direction:column;overflow:hidden;}' +
    '#' + MODAL_ID + ' .hdr{background:linear-gradient(135deg,#0f4c81,#0284c7);color:#fff;padding:16px 22px;display:flex;justify-content:space-between;align-items:center;}' +
    '#' + MODAL_ID + ' .hdr h2{margin:0;font-size:1.2rem;font-weight:700;}' +
    '#' + MODAL_ID + ' .hdr .sub{font-size:0.84rem;opacity:0.9;margin-top:3px;}' +
    '#' + MODAL_ID + ' .btn-x{background:rgba(255,255,255,0.2);border:none;color:#fff;width:32px;height:32px;border-radius:50%;font-size:1.1rem;cursor:pointer;}' +
    '#' + MODAL_ID + ' .btn-x:hover{background:rgba(255,255,255,0.35);}' +
    '#' + MODAL_ID + ' .bdy{padding:18px 22px;overflow-y:auto;flex:1;}' +
    '#' + MODAL_ID + ' .grid{display:grid;grid-template-columns:repeat(auto-fit,minmax(190px,1fr));gap:12px;background:#f8fafc;border:1px solid #e2e8f0;padding:14px;border-radius:10px;margin-bottom:16px;}' +
    '#' + MODAL_ID + ' .item label{display:block;font-size:0.8rem;font-weight:600;color:#475569;margin-bottom:5px;}' +
    '#' + MODAL_ID + ' .item input,#' + MODAL_ID + ' .item select{width:100%;padding:7px 10px;border:1px solid #cbd5e1;border-radius:7px;font-size:0.88rem;background:#fff;outline:none;}' +
    '#' + MODAL_ID + ' .tbl-w{border:1px solid #e2e8f0;border-radius:9px;overflow-x:auto;}' +
    '#' + MODAL_ID + ' table{width:100%;border-collapse:collapse;font-size:0.86rem;text-align:left;}' +
    '#' + MODAL_ID + ' th{background:#f1f5f9;padding:9px 11px;font-weight:600;color:#334155;border-bottom:1px solid #cbd5e1;}' +
    '#' + MODAL_ID + ' td{padding:9px 11px;border-bottom:1px solid #f1f5f9;vertical-align:middle;}' +
    '#' + MODAL_ID + ' tr:hover td{background:#f8fafc;}' +
    '#' + MODAL_ID + ' .badge{display:inline-block;padding:2px 6px;border-radius:5px;font-size:0.74rem;font-weight:600;}' +
    '#' + MODAL_ID + ' .badge-c{background:#e0f2fe;color:#0369a1;}' +
    '#' + MODAL_ID + ' .badge-lt{background:#dbeafe;color:#1e40af;margin:2px 0;display:block;}' +
    '#' + MODAL_ID + ' .badge-th{background:#dcfce7;color:#15803d;margin:2px 0;display:block;}' +
    '#' + MODAL_ID + ' .ftr{background:#f8fafc;border-top:1px solid #e2e8f0;padding:13px 22px;display:flex;flex-wrap:wrap;justify-content:space-between;align-items:center;gap:10px;}' +
    '#' + MODAL_ID + ' .actions{display:flex;flex-wrap:wrap;gap:8px;}' +
    '#' + MODAL_ID + ' .btn{padding:8px 16px;border-radius:7px;font-size:0.88rem;font-weight:600;cursor:pointer;display:inline-flex;align-items:center;gap:6px;text-decoration:none;border:none;}' +
    '#' + MODAL_ID + ' .btn-pri{background:#0284c7;color:#fff;}' +
    '#' + MODAL_ID + ' .btn-pri:hover{background:#0369a1;}' +
    '#' + MODAL_ID + ' .btn-sec{background:#f1f5f9;color:#334155;border:1px solid #cbd5e1;}' +
    '#' + MODAL_ID + ' .btn-sec:hover{background:#e2e8f0;}' +
    '#' + MODAL_ID + ' .q-btn{font-size:0.7rem;padding:2px 5px;border-radius:4px;background:#f1f5f9;color:#0369a1;text-decoration:none;border:1px solid #cbd5e1;display:inline-block;margin:1px;}' +
    '#' + MODAL_ID + ' .q-btn:hover{background:#e0f2fe;}' +
    '#' + MODAL_ID + ' .tip{margin-top:12px;background:#eff6ff;border-left:4px solid #3b82f6;padding:9px 12px;border-radius:0 7px 7px 0;font-size:0.8rem;color:#1e3a8a;}' +
    '#' + MODAL_ID + ' .tip ol{margin:3px 0 0 16px;padding:0;}';

  var rowsHtml = '';
  courses.forEach(function (c) {
    var ltBadges = c.lt.length > 0 ? c.lt.map(function (s) { return '<div class="badge badge-lt">📘 ' + s.rawDay + ' ' + s.startTime + '-' + s.endTime + (s.room ? ' (' + s.room + ')' : '') + '</div>'; }).join('') : '<small style="color:#94a3b8;">Không có</small>';
    var thBadges = c.th.length > 0 ? c.th.map(function (s) { return '<div class="badge badge-th">🔬 ' + s.rawDay + ' ' + s.startTime + '-' + s.endTime + (s.room ? ' (' + s.room + ')' : '') + '</div>'; }).join('') : '<small style="color:#94a3b8;">Không có</small>';
    var ltLinks = c.lt.map(function (s) { return '<a href="#" class="q-btn hcmus-lnk" data-cid="' + c.id + '" data-tp="LT">+LT (' + s.rawDay + ')</a>'; }).join('');
    var thLinks = c.th.map(function (s) { return '<a href="#" class="q-btn hcmus-lnk" data-cid="' + c.id + '" data-tp="TH">+TH (' + s.rawDay + ')</a>'; }).join('');

    rowsHtml += '<tr>' +
      '<td style="text-align:center;"><input type="checkbox" class="hcmus-chk" data-id="' + c.id + '" checked></td>' +
      '<td><div style="font-weight:600;">' + c.name + '</div><div><span class="badge badge-c">' + c.code + '</span> <small style="color:#64748b;">(' + c.credits + ' TC)</small></div></td>' +
      '<td><b>' + c.classCode + '</b></td>' +
      '<td>' + ltBadges + '</td>' +
      '<td>' + thBadges + '</td>' +
      '<td>' + ltLinks + thLinks + '</td>' +
      '</tr>';
  });

  var studentHeader = student.full ? ('SV: <b>' + student.full + '</b> | ') : '';
  var semHeader = courses[0] && courses[0].sem ? courses[0].sem : '1/26-27';

  modal.innerHTML = '<style>' + styleStr + '</style>' +
    '<div class="box">' +
      '<div class="hdr">' +
        '<div>' +
          '<h2>📅 Xuất TKB sang Google Calendar</h2>' +
          '<div class="sub">' + studentHeader + 'HK: ' + semHeader + ' | Phát hiện <b>' + courses.length + '</b> môn học</div>' +
        '</div>' +
        '<button class="btn-x" id="hcmus-x">✕</button>' +
      '</div>' +
      '<div class="bdy">' +
        '<div class="grid">' +
          '<div class="item">' +
            '<label>📅 Thứ Hai tuần 1 (Bắt đầu kỳ):</label>' +
            '<input type="date" id="hcmus-sdate" value="' + defMon + '">' +
          '</div>' +
          '<div class="item">' +
            '<label>⏳ Số tuần học:</label>' +
            '<select id="hcmus-weeks">' +
              '<option value="15" selected>15 tuần (Chuẩn HK)</option>' +
              '<option value="16">16 tuần</option>' +
              '<option value="10">10 tuần (HK Hè)</option>' +
              '<option value="12">12 tuần</option>' +
              '<option value="8">8 tuần</option>' +
            '</select>' +
          '</div>' +
          '<div class="item">' +
            '<label>🔔 Thông báo trước giờ học:</label>' +
            '<select id="hcmus-alarm">' +
              '<option value="15" selected>Trước 15 phút</option>' +
              '<option value="30">Trước 30 phút</option>' +
              '<option value="60">Trước 1 tiếng</option>' +
              '<option value="0">Không thông báo</option>' +
            '</select>' +
          '</div>' +
        '</div>' +
        '<div class="tbl-w">' +
          '<table>' +
            '<thead>' +
              '<tr>' +
                '<th style="width:32px; text-align:center;"><input type="checkbox" id="hcmus-all" checked></th>' +
                '<th>Môn học</th>' +
                '<th style="width:75px;">Lớp HP</th>' +
                '<th>Lịch Lý thuyết</th>' +
                '<th>Lịch Thực hành</th>' +
                '<th style="width:95px;">Thêm nhanh</th>' +
              '</tr>' +
            '</thead>' +
            '<tbody>' + rowsHtml + '</tbody>' +
          '</table>' +
        '</div>' +
        '<div class="tip">' +
          '<b>💡 Hướng dẫn nhập vào Google Calendar:</b>' +
          '<ol>' +
            '<li>Bấm <b>"📥 Tải file .ICS"</b> bên dưới để lưu file lịch về máy tính.</li>' +
            '<li>Bấm <b>"🌐 Mở Google Calendar Import"</b> (hoặc vào Google Calendar -> ⚙️ Cài đặt -> <b>Nhập & Xuất</b>).</li>' +
            '<li>Chọn file <code>.ics</code> vừa tải, chọn Calendar muốn thêm (nên tạo lịch riêng tên <i>TKB HK1</i>) rồi bấm <b>Nhập</b> là xong!</li>' +
          '</ol>' +
        '</div>' +
      '</div>' +
      '<div class="ftr">' +
        '<div style="font-size:0.82rem; color:#64748b;" id="hcmus-count">Đang chọn: <b>' + courses.length + '/' + courses.length + '</b> môn</div>' +
        '<div class="actions">' +
          '<button class="btn btn-sec" id="hcmus-cp">📋 Sao chép ICS</button>' +
          '<a class="btn btn-sec" href="https://calendar.google.com/calendar/u/0/r/settings/export" target="_blank">🌐 Mở Google Calendar Import</a>' +
          '<button class="btn btn-pri" id="hcmus-dl">📥 Tải file .ICS (Khuyên dùng)</button>' +
        '</div>' +
      '</div>' +
    '</div>';

  document.body.appendChild(modal);

  var close = function () { modal.remove(); };
  var xBtn = modal.querySelector('#hcmus-x');
  if (xBtn) xBtn.onclick = close;
  modal.onclick = function (e) { if (e.target === modal) close(); };
  document.onkeydown = function (e) { if (e.key === 'Escape') close(); };

  var chkAll = modal.querySelector('#hcmus-all');
  var chks = Array.from(modal.querySelectorAll('.hcmus-chk'));
  var cnt = modal.querySelector('#hcmus-count');

  function updateCnt() {
    var sel = courses.filter(function (c) { return c.selected; }).length;
    if (cnt) cnt.innerHTML = 'Đang chọn: <b>' + sel + '/' + courses.length + '</b> môn';
    if (chkAll) chkAll.checked = sel === courses.length;
  }

  if (chkAll) {
    chkAll.onchange = function () {
      chks.forEach(function (c) {
        c.checked = chkAll.checked;
        var o = courses.find(function (x) { return x.id === c.getAttribute('data-id'); });
        if (o) o.selected = chkAll.checked;
      });
      updateCnt();
    };
  }

  chks.forEach(function (c) {
    c.onchange = function () {
      var o = courses.find(function (x) { return x.id === c.getAttribute('data-id'); });
      if (o) o.selected = c.checked;
      updateCnt();
    };
  });

  var sDateEl = modal.querySelector('#hcmus-sdate');
  var weeksEl = modal.querySelector('#hcmus-weeks');
  var alarmEl = modal.querySelector('#hcmus-alarm');

  var getOpts = function () {
    return {
      start: (sDateEl && sDateEl.value) ? sDateEl.value : defMon,
      weeks: (weeksEl && weeksEl.value) ? (parseInt(weeksEl.value, 10) || 15) : 15,
      alarm: (alarmEl && alarmEl.value) ? (parseInt(alarmEl.value, 10) || 0) : 0
    };
  };

  var dlBtn = modal.querySelector('#hcmus-dl');
  if (dlBtn) {
    dlBtn.onclick = function () {
      var opts = getOpts();
      var res = makeICS(courses, opts.start, opts.weeks, opts.alarm, student);
      if (res.count === 0) return alert('Vui lòng chọn ít nhất 1 môn có lịch học!');

      var blob = new Blob([res.content], { type: 'text/calendar;charset=utf-8' });
      var a = document.createElement('a');
      var sId = (student && student.id) ? ('_' + student.id) : '';
      var sem = (courses[0] && courses[0].sem) ? ('_HK' + courses[0].sem.replace(/[^a-zA-Z0-9]/g, '_')) : '';
      a.href = URL.createObjectURL(blob);
      a.download = 'TKB_HCMUS' + sId + sem + '.ics';
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(a.href);

      dlBtn.innerText = '✅ Đã tải xong!';
      setTimeout(function () { dlBtn.innerText = '📥 Tải file .ICS (Khuyên dùng)'; }, 2000);
    };
  }

  var cpBtn = modal.querySelector('#hcmus-cp');
  if (cpBtn) {
    cpBtn.onclick = function () {
      var opts = getOpts();
      var res = makeICS(courses, opts.start, opts.weeks, opts.alarm, student);
      navigator.clipboard.writeText(res.content).then(function () {
        cpBtn.innerText = '✅ Đã sao chép!';
        setTimeout(function () { cpBtn.innerText = '📋 Sao chép ICS'; }, 2000);
      });
    };
  }

  modal.querySelectorAll('.hcmus-lnk').forEach(function (lnk) {
    lnk.onclick = function (e) {
      e.preventDefault();
      var course = courses.find(function (x) { return x.id === lnk.getAttribute('data-cid'); });
      if (!course) return;
      var isLT = lnk.getAttribute('data-tp') === 'LT';
      var list = isLT ? course.lt : course.th;
      if (!list || !list[0]) return;
      var opts = getOpts();
      var u = makeGCalUrl(course, Object.assign({}, list[0], {
        typeName: isLT ? 'Lý thuyết' : 'Thực hành',
        pfx: '[' + (isLT ? 'LT' : 'TH') + ']'
      }), opts.start, opts.weeks);
      window.open(u, '_blank');
    };
  });
})();