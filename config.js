// المتغيرات العامة
let latitude, longitude;
let photoData = '';
let stream = null;

// تهيئة التطبيق
document.addEventListener('DOMContentLoaded', initializeApp);

async function initializeApp() {
    await initializeCamera();
    initializeLocationTracking();
    initializeFormSubmission();
}

// تهيئة الكاميرا
async function initializeCamera() {
    try {
        const video = document.getElementById('video');
        stream = await navigator.mediaDevices.getUserMedia({ 
            video: CONFIG.CAMERA 
        });
        video.srcObject = stream;
    } catch (error) {
        console.error(MESSAGES.CAMERA_ERROR, error);
        showError(MESSAGES.CAMERA_ERROR);
    }
}

// التقاط الصورة
document.getElementById('captureBtn').addEventListener('click', capturePhoto);

function capturePhoto() {
    const video = document.getElementById('video');
    const canvas = document.getElementById('canvas');
    const context = canvas.getContext('2d');
    
    // ضبط أبعاد الكانفاس
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    
    // رسم الصورة على الكانفاس
    context.drawImage(video, 0, 0, canvas.width, canvas.height);
    
    // تحويل الصورة إلى Base64
    photoData = canvas.toDataURL('image/jpeg');
    
    // إظهار الصورة الملتقطة
    video.style.display = 'none';
    canvas.style.display = 'block';
}

// تحديد الموقع
function initializeLocationTracking() {
    if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(
            updateLocation,
            handleLocationError
        );
    } else {
        showError(MESSAGES.LOCATION_ERROR);
    }
}

function updateLocation(position) {
    latitude = position.coords.latitude;
    longitude = position.coords.longitude;
    document.getElementById('locationInfo').textContent = 
        `خط العرض: ${latitude}, خط الطول: ${longitude}`;
}

function handleLocationError(error) {
    console.error(MESSAGES.LOCATION_ERROR, error);
    document.getElementById('locationInfo').textContent = MESSAGES.LOCATION_ERROR;
}

// معالجة تقديم النموذج
function initializeFormSubmission() {
    document.getElementById('attendanceForm')
        .addEventListener('submit', handleFormSubmit);
}

async function handleFormSubmit(e) {
    e.preventDefault();
    
    // جمع البيانات
    const data = {
        employeeId: document.getElementById('employeeId').value,
        employeeName: document.getElementById('employeeName').value,
        latitude: latitude,
        longitude: longitude,
        photo: photoData,
        timestamp: new Date().toLocaleString('ar-SA', CONFIG.DATE_FORMAT)
    };

    try {
        // إرسال البيانات
        const response = await submitData(data);
        if (response.status === 'success') {
            showSuccess(MESSAGES.SUBMIT_SUCCESS);
            resetForm();
        } else {
            throw new Error(response.message);
        }
    } catch (error) {
        console.error('خطأ في الإرسال:', error);
        showError(MESSAGES.SUBMIT_ERROR);
    }
}

// إرسال البيانات إلى Google Sheets
async function submitData(data) {
    const response = await fetch(CONFIG.SHEETS_API_URL, {
        method: 'POST',
        body: JSON.stringify(data),
        headers: {
            'Content-Type': 'application/json'
        }
    });
    return await response.json();
}

// إعادة تعيين النموذج
function resetForm() {
    document.getElementById('attendanceForm').reset();
    document.getElementById('video').style.display = 'block';
    document.getElementById('canvas').style.display = 'none';
    photoData = '';
}

// عرض الرسائل
function showSuccess(message) {
    alert(message); // يمكن تحسين هذا باستخدام مكتبة إشعارات أفضل
}

function showError(message) {
    alert(message); // يمكن تحسين هذا باستخدام مكتبة إشعارات أفضل
}

// تنظيف الموارد عند إغلاق الصفحة
window.addEventListener('beforeunload', () => {
    if (stream) {
        stream.getTracks().forEach(track => track.stop());
    }
});