<?php


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