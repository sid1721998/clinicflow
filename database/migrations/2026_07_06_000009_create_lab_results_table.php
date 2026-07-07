<?php
use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    public function up(): void {
        Schema::create('lab_results', function (Blueprint $table) {
            $table->id();
            $table->foreignId('clinic_id')->constrained('clinics')->cascadeOnDelete();
            $table->foreignId('patient_id')->constrained('patients')->cascadeOnDelete();
            $table->foreignId('doctor_id')->constrained('doctors')->cascadeOnDelete();
            $table->string('order_number')->unique();
            $table->string('test_name');
            $table->string('lab_name')->nullable();
            $table->timestamp('ordered_at')->nullable();
            $table->timestamp('collected_at')->nullable();
            $table->timestamp('resulted_at')->nullable();
            $table->enum('status', ['ordered','collected','processing','completed','cancelled'])->default('ordered');
            $table->text('notes')->nullable();
            $table->timestamps();
        });
        Schema::create('lab_result_items', function (Blueprint $table) {
            $table->id();
            $table->foreignId('lab_result_id')->constrained('lab_results')->cascadeOnDelete();
            $table->string('test_name');
            $table->string('value')->nullable();
            $table->string('unit')->nullable();
            $table->string('reference_range')->nullable();
            $table->enum('flag', ['normal','low','high','critical'])->default('normal');
            $table->timestamps();
        });
    }
    public function down(): void {
        Schema::dropIfExists('lab_result_items');
        Schema::dropIfExists('lab_results');
    }
};
