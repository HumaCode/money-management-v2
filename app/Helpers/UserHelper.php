<?php

use Illuminate\Support\Facades\Auth;

if (!function_exists('user')) {
    /**
     * Get authenticated user data
     *
     * @param string|null $key
     * @return mixed
     */
    function user($key = null)
    {
        $user = Auth::user();

        if (!$user) {
            return null;
        }

        if ($key === null) {
            return $user;
        }

        return $user->$key ?? null;
    }
}

if (!function_exists('user_initials')) {
    /**
     * Get user initials from name
     *
     * @param string|null $name
     * @return string
     */
    function user_initials($name = null)
    {
        // Jika name tidak diberikan, ambil dari user yang login
        if ($name === null) {
            $name = user('name');
        }

        if (!$name) {
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

        return strtoupper($firstInitial . $lastInitial);
    }
}

if (!function_exists('user_avatar')) {
    /**
     * Get user avatar URL or initials as fallback
     *
     * @param bool $returnInitials
     * @return string
     */
    function user_avatar($returnInitials = false)
    {
        $avatar = user('avatar');

        if ($avatar) {
            return asset('storage/' . $avatar);
        }

        if ($returnInitials) {
            return user_initials();
        }

        return asset('images/default-avatar.png');
    }
}

if (!function_exists('user_full_name')) {
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

if (!function_exists('user_is_active')) {
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

if (!function_exists('user_gender')) {
    /**
     * Get user gender
     *
     * @param bool $translate
     * @return string|null
     */
    function user_gender($translate = false)
    {
        $gender = user('gender');

        if (!$translate) {
            return $gender;
        }

        $translations = [
            'male' => 'Laki-laki',
            'female' => 'Perempuan',
        ];

        return $translations[$gender] ?? $gender;
    }
}

if (!function_exists('user_last_login')) {
    /**
     * Get user last login timestamp
     *
     * @param string $format
     * @return string|null
     */
    function user_last_login($format = 'Y-m-d H:i:s')
    {
        $lastLogin = user('last_login_at');

        if (!$lastLogin) {
            return null;
        }

        return \Carbon\Carbon::parse($lastLogin)->format($format);
    }
}

if (!function_exists('is_logged_in')) {
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

if (!function_exists('user_greeting')) {
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