<?php

namespace App\Http\Controllers\Api\V1;

use App\Helpers\ResponseHelper;
use App\Http\Controllers\Controller;
use App\Services\WhatsAppService;
use Carbon\Carbon;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Validator;

class TwoFactorController extends Controller
{
    /**
     * Get 2FA Status & User Phone Number
     */
    public function status(Request $request)
    {
        $user = $request->user();

        $maskedPhone = '';
        if ($user->phone) {
            $len = strlen($user->phone);
            if ($len > 6) {
                $maskedPhone = substr($user->phone, 0, 4) . '****' . substr($user->phone, -4);
            } else {
                $maskedPhone = $user->phone;
            }
        }

        return ResponseHelper::success([
            'is_2fa_enabled' => (bool) $user->is_2fa_enabled,
            'phone'          => $user->phone ?? '',
            'masked_phone'   => $maskedPhone,
        ], 'Status 2FA pengguna');
    }

    /**
     * Send 6-Digit OTP Code via WhatsApp Gateway
     */
    public function sendOtp(Request $request, WhatsAppService $waService)
    {
        $user = $request->user();

        $validator = Validator::make($request->all(), [
            'phone' => 'nullable|string|min:9|max:15',
        ]);

        if ($validator->fails()) {
            return ResponseHelper::jsonResponse(false, $validator->errors()->first(), null, 422);
        }

        if ($request->filled('phone')) {
            $user->phone = $request->input('phone');
        }

        if (empty($user->phone)) {
            return ResponseHelper::jsonResponse(false, 'Nomor WhatsApp belum terdaftar. Silakan masukkan nomor WhatsApp Anda.', null, 400);
        }

        // Generate 6-Digit Random OTP Code
        $otpCode = (string) mt_rand(100000, 999999);
        $user->two_factor_code = $otpCode;
        $user->two_factor_expires_at = Carbon::now()->addMinutes(5);
        $user->save();

        // Send OTP message via WA Service
        $msg = "🔒 *KODE OTP MONEY MANAGEMENT*\n\n"
             . "Kode OTP 2FA Anda: *{$otpCode}*\n"
             . "Berlaku selama 5 menit.\n\n"
             . "⚠️ Jangan berikan kode ini kepada siapapun demi keamanan akun Anda.";

        $isSent = $waService->sendMessage($user->phone, $msg);

        if (!$isSent) {
            return ResponseHelper::jsonResponse(
                false,
                'Gagal mengirim kode OTP ke WhatsApp. Pastikan server WA Gateway aktif dan nomor WhatsApp Anda valid.',
                null,
                500
            );
        }

        $len = strlen($user->phone);
        $maskedPhone = $len > 6 ? substr($user->phone, 0, 4) . '****' . substr($user->phone, -4) : $user->phone;

        return ResponseHelper::success([
            'masked_phone'       => $maskedPhone,
            'expires_in_seconds' => 300,
            // For testing convenience: returns otp_code in dev mode
            'debug_otp'          => env('APP_DEBUG') ? $otpCode : null,
        ], "Kode OTP berhasil dikirim via WhatsApp ke {$maskedPhone}");
    }

    /**
     * Verify 6-Digit OTP Code & Activate 2FA
     */
    public function verifyOtp(Request $request)
    {
        $user = $request->user();

        $validator = Validator::make($request->all(), [
            'otp_code' => 'required|string|size:6',
        ], [
            'otp_code.required' => 'Kode OTP wajib diisi.',
            'otp_code.size'     => 'Kode OTP harus 6 digit angka.',
        ]);

        if ($validator->fails()) {
            return ResponseHelper::jsonResponse(false, $validator->errors()->first(), null, 422);
        }

        if (!$user->two_factor_code || !$user->two_factor_expires_at) {
            return ResponseHelper::jsonResponse(false, 'Belum ada kode OTP yang dikirim. Silakan minta OTP baru.', null, 400);
        }

        if (Carbon::now()->gt($user->two_factor_expires_at)) {
            return ResponseHelper::jsonResponse(false, 'Kode OTP telah kadaluarsa (lebih dari 5 menit). Silakan minta OTP baru.', null, 400);
        }

        if ($user->two_factor_code !== $request->input('otp_code')) {
            return ResponseHelper::jsonResponse(false, 'Kode OTP yang Anda masukkan salah.', null, 400);
        }

        // OTP Verified successfully -> Activate 2FA
        $user->is_2fa_enabled = true;
        $user->two_factor_code = null;
        $user->two_factor_expires_at = null;
        $user->save();

        return ResponseHelper::success([
            'is_2fa_enabled' => true,
        ], 'Verifikasi OTP berhasil! Fitur Keamanan 2FA telah aktif.');
    }

    /**
     * Disable 2FA
     */
    public function disable2fa(Request $request)
    {
        $user = $request->user();
        $user->is_2fa_enabled = false;
        $user->two_factor_code = null;
        $user->two_factor_expires_at = null;
        $user->save();

        return ResponseHelper::success([
            'is_2fa_enabled' => false,
        ], 'Fitur Keamanan 2FA telah dinonaktifkan.');
    }

    /**
     * Verify 2FA Login OTP Code & Issue Sanctum Bearer Token
     */
    public function verifyLogin2fa(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'user_id'  => 'required|string',
            'otp_code' => 'required|string|size:6',
        ]);

        if ($validator->fails()) {
            return ResponseHelper::jsonResponse(false, $validator->errors()->first(), null, 422);
        }

        $user = \App\Models\User::find($request->input('user_id'));

        if (!$user) {
            return ResponseHelper::error('Pengguna tidak ditemukan', 404);
        }

        if (!$user->two_factor_code || !$user->two_factor_expires_at) {
            return ResponseHelper::error('Belum ada kode OTP yang dikirim. Silakan coba login kembali.', 400);
        }

        if (Carbon::now()->gt($user->two_factor_expires_at)) {
            return ResponseHelper::error('Kode OTP telah kadaluarsa. Silakan minta OTP baru.', 400);
        }

        if ($user->two_factor_code !== $request->input('otp_code')) {
            return ResponseHelper::error('Kode OTP yang Anda masukkan salah', 400);
        }

        // OTP Validated! Clear OTP fields and update login stats
        $user->two_factor_code = null;
        $user->two_factor_expires_at = null;
        $user->update([
            'last_login_at' => now(),
            'last_login_ip' => $request->ip(),
        ]);

        // Issue Sanctum Token
        $deviceName = $request->input('device_name', 'money_manajemen_mobile');
        $token = $user->createToken($deviceName)->plainTextToken;

        return ResponseHelper::success([
            'token'      => $token,
            'token_type' => 'Bearer',
            'user'       => [
                'id'        => $user->id,
                'name'      => $user->name,
                'username'  => $user->username,
                'email'     => $user->email,
                'phone'     => $user->phone,
                'avatar'    => $user->avatar ? asset('storage/' . $user->avatar) : null,
                'gender'    => $user->gender,
            ],
        ], 'Verifikasi 2FA Login Berhasil');
    }

    /**
     * Resend 2FA Login OTP Code via WhatsApp
     */
    public function resendLogin2fa(Request $request, WhatsAppService $waService)
    {
        $validator = Validator::make($request->all(), [
            'user_id' => 'required|string',
        ]);

        if ($validator->fails()) {
            return ResponseHelper::jsonResponse(false, $validator->errors()->first(), null, 422);
        }

        $user = \App\Models\User::find($request->input('user_id'));

        if (!$user) {
            return ResponseHelper::error('Pengguna tidak ditemukan', 404);
        }

        if (empty($user->phone)) {
            return ResponseHelper::error('Nomor WhatsApp tidak ditemukan pada akun ini.', 400);
        }

        // Generate new OTP
        $otpCode = (string) mt_rand(100000, 999999);
        $user->two_factor_code = $otpCode;
        $user->two_factor_expires_at = Carbon::now()->addMinutes(5);
        $user->save();

        // Send WhatsApp OTP
        $msg = "🔒 *KODE OTP MONEY MANAGEMENT*\n\n"
             . "Kode OTP 2FA Anda: *{$otpCode}*\n"
             . "Berlaku selama 5 menit.\n\n"
             . "⚠️ Jangan berikan kode ini kepada siapapun demi keamanan akun Anda.";

        $isSent = $waService->sendMessage($user->phone, $msg);

        if (!$isSent) {
            return ResponseHelper::jsonResponse(
                false,
                'Gagal mengirim ulang kode OTP ke WhatsApp. Pastikan server WA Gateway aktif dan nomor Anda valid.',
                null,
                500
            );
        }

        $len = strlen($user->phone);
        $maskedPhone = $len > 6 ? substr($user->phone, 0, 4) . '****' . substr($user->phone, -4) : $user->phone;

        return ResponseHelper::success([
            'masked_phone'       => $maskedPhone,
            'expires_in_seconds' => 300,
        ], "Kode OTP baru telah berhasil dikirim ulang ke {$maskedPhone}");
    }
}
