<?php

use App\Models\Menu;
use Carbon\Carbon;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Cache;

if (! function_exists('user')) {
    /**
     * Get authenticated user data
     *
     * @param  string|null  $key
     * @return mixed
     */
    function user($key = null)
    {
        $user = Auth::user();

        if (! $user) {
            return null;
        }

        if ($key === null) {
            return $user;
        }

        return $user->$key ?? null;
    }
}

if (! function_exists('user_initials')) {
    /**
     * Get user initials from name
     *
     * @param  string|null  $name
     * @return string
     */
    function user_initials($name = null)
    {
        // Jika name tidak diberikan, ambil dari user yang login
        if ($name === null) {
            $name = user('name');
        }

        if (! $name) {
            return '';
        }

        // Split nama berdasarkan spasi
        $words = explode(' ', trim($name));

        // Jika hanya satu kata
        if (count($words) === 1) {
            return strtoupper(substr($words[0], 0, 2));
        }

        // Ambil huruf pertama dari kata pertama dan terakhir
        $firstInitial = substr($words[0], 0, 1);
        $lastInitial = substr($words[count($words) - 1], 0, 1);

        return strtoupper($firstInitial.$lastInitial);
    }
}

if (! function_exists('user_avatar')) {
    /**
     * Get user avatar URL or initials as fallback
     *
     * @param  bool  $returnInitials
     * @return string
     */
    function user_avatar($returnInitials = false)
    {
        $avatar = user('avatar');

        if ($avatar) {
            return asset('storage/'.$avatar);
        }

        if ($returnInitials) {
            return user_initials();
        }

        return asset('images/default-avatar.png');
    }
}

if (! function_exists('user_full_name')) {
    /**
     * Get user full name
     *
     * @return string
     */
    function user_full_name()
    {
        return user('name') ?? 'Guest';
    }
}

if (! function_exists('user_is_active')) {
    /**
     * Check if user is active
     *
     * @return bool
     */
    function user_is_active()
    {
        return user('is_active') == 1;
    }
}

if (! function_exists('user_gender')) {
    /**
     * Get user gender
     *
     * @param  bool  $translate
     * @return string|null
     */
    function user_gender($translate = false)
    {
        $gender = user('gender');

        if (! $translate) {
            return $gender;
        }

        $translations = [
            'male' => 'Laki-laki',
            'female' => 'Perempuan',
        ];

        return $translations[$gender] ?? $gender;
    }
}

if (! function_exists('user_last_login')) {
    /**
     * Get user last login timestamp
     *
     * @param  string  $format
     * @return string|null
     */
    function user_last_login($format = 'Y-m-d H:i:s')
    {
        $lastLogin = user('last_login_at');

        if (! $lastLogin) {
            return null;
        }

        return Carbon::parse($lastLogin)->format($format);
    }
}

if (! function_exists('is_logged_in')) {
    /**
     * Check if user is logged in
     *
     * @return bool
     */
    function is_logged_in()
    {
        return Auth::check();
    }
}

if (! function_exists('user_greeting')) {
    /**
     * Get greeting message based on time
     *
     * @return string
     */
    function user_greeting()
    {
        $hour = date('H');
        $name = user('name') ?? 'Guest';

        if ($hour >= 5 && $hour < 11) {
            return "Selamat Pagi, {$name}";
        } elseif ($hour >= 11 && $hour < 15) {
            return "Selamat Siang, {$name}";
        } elseif ($hour >= 15 && $hour < 18) {
            return "Selamat Sore, {$name}";
        } else {
            return "Selamat Malam, {$name}";
        }
    }
}

if (! function_exists('tgl_indo')) {
    /**
     * Format tanggal ke format Indonesia.
     *
     * @param  mixed  $tanggal  — string tanggal, Carbon, atau timestamp
     * @param  bool  $hari  — true  → "Rabu, 2 September 2026"
     *                      false → "2 September 2026"
     * @param  string|null  $default  — nilai kembalian jika $tanggal kosong
     * @return string
     *
     * Contoh:
     *   tgl_indo('2026-09-02', true)  → "Rabu, 2 September 2026"
     *   tgl_indo('2026-09-02', false) → "2 September 2026"
     */
    function tgl_indo($tanggal, bool $hari = false, ?string $default = '—'): string
    {
        if (empty($tanggal)) {
            return $default ?? '—';
        }

        $bulan = [
            1 => 'Januari',   2 => 'Februari', 3 => 'Maret',
            4 => 'April',     5 => 'Mei',       6 => 'Juni',
            7 => 'Juli',      8 => 'Agustus',   9 => 'September',
            10 => 'Oktober',  11 => 'November', 12 => 'Desember',
        ];

        $namaHari = [
            0 => 'Minggu', 1 => 'Senin', 2 => 'Selasa',  3 => 'Rabu',
            4 => 'Kamis',  5 => 'Jumat', 6 => 'Sabtu',
        ];

        try {
            $date = Carbon::parse($tanggal);
        } catch (Throwable $e) {
            return $default ?? '—';
        }

        $tgl = (int) $date->format('j');
        $bln = $bulan[(int) $date->format('n')];
        $tahun = $date->format('Y');

        if ($hari) {
            $dayIndex = (int) $date->format('w');   // 0 (Minggu) – 6 (Sabtu)

            return "{$namaHari[$dayIndex]}, {$tgl} {$bln} {$tahun}";
        }

        return "{$tgl} {$bln} {$tahun}";
    }
}

if (! function_exists('tgl_indo_time')) {
    /**
     * Format tanggal + jam ke format Indonesia.
     *
     * @param  mixed  $tanggal  — string tanggal, Carbon, atau timestamp
     * @param  bool  $hari  — sertakan nama hari?
     * @param  string|null  $default  — nilai kembalian jika $tanggal kosong
     * @return string
     *
     * Contoh:
     *   tgl_indo_time('2026-09-02 14:30:00', true)
     *     → "Rabu, 2 September 2026 14:30"
     *   tgl_indo_time('2026-09-02 14:30:00', false)
     *     → "2 September 2026 14:30"
     */
    function tgl_indo_time($tanggal, bool $hari = false, ?string $default = '—'): string
    {
        if (empty($tanggal)) {
            return $default ?? '—';
        }

        try {
            $date = Carbon::parse($tanggal);
        } catch (Throwable $e) {
            return $default ?? '—';
        }

        $jam = $date->format('H:i');

        return tgl_indo($tanggal, $hari).' '.$jam;
    }
}

if (! function_exists('menus')) {
    function menus($grouped = true)
    {
        // 1. Ambil data asli (flat) dari cache agar query hanya 1x (simpan sebagai array mentah)
        $allMenus = Cache::rememberForever('menus_data', function () {
            return Menu::active()
                ->orderBy('orders')
                ->get()
                ->toArray();
        });

        // 2. Rekonstruksi array kembali menjadi Collection of Menu models
        $allMenusCollection = collect($allMenus)->map(function ($item) {
            $menu = new Menu;
            $menu->forceFill($item);
            $menu->exists = true;

            return $menu;
        });

        // 3. Jika minta grouped (untuk Sidebar), lakukan grouping di memori PHP
        if ($grouped) {
            return $allMenusCollection->groupBy('category');
        }

        // 4. Jika tidak, kembalikan data flat (untuk urlMenu)
        return $allMenusCollection;
    }
}

if (! function_exists('urlMenu')) {
    function urlMenu()
    {
        // Cache hasil akhir array URL agar tidak perlu pluck() di setiap request
        return Cache::rememberForever('menus_url_list', function () {
            return menus(false)->whereNotNull('url')->pluck('url')->toArray();
        });
    }
}
