// كود Google Apps Script للتعامل مع البيانات في Google Sheets

function doPost(e) {
  try {
    const sheet = SpreadsheetApp.getActiveSpreadsheet().getActiveSheet();
    const data = JSON.parse(e.postData.contents);
    
    // إضافة البيانات إلى الجدول
    const row = [
      data.timestamp,
      data.employeeId,
      data.employeeName,
      data.latitude,
      data.longitude,
      data.photo
    ];
    
    sheet.appendRow(row);
    
    // إرجاع استجابة نجاح
    return createResponse({
      status: 'success',
      message: 'تم تسجيل البيانات بنجاح'
    });
    
  } catch (error) {
    // إرجاع استجابة خطأ
    return createResponse({
      status: 'error',
      message: error.toString()
    });
  }
}

// دالة لإنشاء الاستجابة
function createResponse(data) {
  return ContentService.createTextOutput(JSON.stringify(data))
    .setMimeType(ContentService.MimeType.JSON);
}

// دالة لإعداد جدول البيانات
function setupSheet() {
  const sheet = SpreadsheetApp.getActiveSpreadsheet().getActiveSheet();
  
  // تعيين عناوين الأعمدة
  const headers = [
    'التاريخ والوقت',
    'رقم الموظف',
    'اسم الموظف',
    'خط العرض',
    'خط الطول',
    'الصورة'
  ];
  
  // إضافة الصف الأول (العناوين)
  sheet.getRange(1, 1, 1, headers.length).setValues([headers]);
  
  // تنسيق العناوين
  const headerRange = sheet.getRange(1, 1, 1, headers.length);
  headerRange.setBackground('#4CAF50')
             .setFontColor('white')
             .setFontWeight('bold')
             .setHorizontalAlignment('center');
  
  // ضبط عرض الأعمدة
  sheet.setColumnWidths(1, headers.length, 150);
  
  // تجميد الصف الأول
  sheet.setFrozenRows(1);
  
  // إضافة التحقق من صحة البيانات للأعمدة المهمة
  sheet.getRange('B2:B').setDataValidation(
    SpreadsheetApp.newDataValidation()
      .requireTextIsNonEmpty()
      .setAllowInvalid(false)
      .build()
  );
}