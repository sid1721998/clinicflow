<?php
use App\Http\Controllers\Api\AuthController;
use App\Http\Controllers\Api\PatientController;
use App\Http\Controllers\Api\DoctorController;
use App\Http\Controllers\Api\AppointmentController;
use App\Http\Controllers\Api\MedicalRecordController;
use App\Http\Controllers\Api\PrescriptionController;
use App\Http\Controllers\Api\LabResultController;
use App\Http\Controllers\Api\InvoiceController;
use App\Http\Controllers\Api\DashboardController;
use App\Http\Controllers\Api\ReportController;
use App\Http\Controllers\Api\NotificationController;
use App\Http\Controllers\Api\UserController;
use Illuminate\Support\Facades\Route;

// Javne rute
Route::post('/register', [AuthController::class, 'register']);
Route::post('/login',    [AuthController::class, 'login']);

// Zaštićene rute
Route::middleware(['auth:sanctum'])->group(function () {
    // Autentifikacija
    Route::post('/logout',       [AuthController::class, 'logout']);
    Route::get('/me',            [AuthController::class, 'me']);
    Route::post('/2fa/setup',    [AuthController::class, 'setup2fa']);
    Route::post('/2fa/verify',   [AuthController::class, 'verify2fa']);
    Route::post('/2fa/disable',  [AuthController::class, 'disable2fa']);

    // Dashboard
    Route::get('/dashboard', [DashboardController::class, 'stats']);

    // Pacijenti
    Route::get('/patients/{patient}/timeline', [PatientController::class, 'timeline']);
    Route::apiResource('/patients', PatientController::class);

    // Doktori
    Route::get('/doctors/{doctor}/availability', [DoctorController::class, 'availability']);
    Route::apiResource('/doctors', DoctorController::class);

    // Termini
    Route::get('/appointments/today',    [AppointmentController::class, 'today']);
    Route::get('/appointments/calendar', [AppointmentController::class, 'calendar']);
    Route::apiResource('/appointments', AppointmentController::class);

    // Medicinski kartoni
    Route::post('/medical-records/{medicalRecord}/sign', [MedicalRecordController::class, 'sign']);
    Route::apiResource('/medical-records', MedicalRecordController::class)->except(['destroy']);

    // Recepti
    Route::get('/prescriptions/{prescription}/pdf', [PrescriptionController::class, 'pdf']);
    Route::apiResource('/prescriptions', PrescriptionController::class)->except(['destroy']);

    // Lab nalazi
    Route::apiResource('/lab-results', LabResultController::class)->except(['destroy']);

    // Fakture
    Route::post('/invoices/{invoice}/mark-paid', [InvoiceController::class, 'markPaid']);
    Route::get('/invoices/{invoice}/pdf',        [InvoiceController::class, 'pdf']);
    Route::get('/invoices/summary',              [InvoiceController::class, 'summary']);
    Route::apiResource('/invoices', InvoiceController::class)->except(['destroy']);

    // Izvještaji
    Route::prefix('/reports')->group(function () {
        Route::get('/revenue',     [ReportController::class, 'revenue']);
        Route::get('/doctors',     [ReportController::class, 'doctors']);
        Route::get('/export',      [ReportController::class, 'export']);
    });

    // Obavijesti
    Route::prefix('/notifications')->group(function () {
        Route::get('/',              [NotificationController::class, 'index']);
        Route::get('/unread-count',  [NotificationController::class, 'unreadCount']);
        Route::post('/mark-all-read',[NotificationController::class, 'markAllRead']);
        Route::post('/{id}/mark-read', [NotificationController::class, 'markRead']);
    });

    // Korisnici
    Route::apiResource('/users', UserController::class);

    // Specijalizacije
    Route::apiResource('/specializations', \App\Http\Controllers\Api\SpecializationController::class);
});
