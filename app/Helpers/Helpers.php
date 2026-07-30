<?php

use Carbon\Carbon;

if (! function_exists('active_route')) {
    function active_route($patterns, $class = 'active')
    {
        foreach ((array) $patterns as $pattern) {
            if (request()->routeIs($pattern)) {
                return $class;
            }
        }

        return '';
    }
}

if (! function_exists('tgl_indo')) {
    function tgl_indo($tgl, $tampil_hari = false, $tampil_jam = false)
    {
        if (! $tgl) {
            return null;
        }

        // 🔹 Kalau input adalah Carbon instance, ubah ke string Y-m-d H:i:s
        if ($tgl instanceof Carbon) {
            $tgl = $tgl->format('Y-m-d H:i:s');
        }

        $nama_hari = ['Minggu', 'Senin', 'Selasa', 'Rabu', 'Kamis', 'Jum\'at', 'Sabtu'];
        $nama_bulan = [
            1 => 'Januari',
            'Februari',
            'Maret',
            'April',
            'Mei',
            'Juni',
            'Juli',
            'Agustus',
            'September',
            'Oktober',
            'November',
            'Desember',
        ];

        $tahun = substr($tgl, 0, 4);
        $bulan = $nama_bulan[(int) substr($tgl, 5, 2)];
        $tanggal = substr($tgl, 8, 2);
        $text = '';

        if ($tampil_hari) {
            $urutan_hari = date('w', strtotime($tgl));
            $hari = $nama_hari[$urutan_hari];
            $text = "$hari, $tanggal $bulan $tahun";
        } else {
            $text = "$tanggal $bulan $tahun";
        }

        if ($tampil_jam) {
            $jam = substr($tgl, 11, 5);
            $text .= " - $jam";
        }

        return $text;
    }
}
