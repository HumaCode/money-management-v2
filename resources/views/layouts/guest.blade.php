<!doctype html>
<html lang="{{ str_replace('_', '-', app()->getLocale()) }}">
  <head>
    <meta charset="UTF-8" />
    <meta name="csrf-token" content="{{ csrf_token() }}">
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>Login — MoneyFlow</title>
    <link
      href="https://fonts.googleapis.com/css2?family=Cormorant+Garamond:wght@300;400;500;600&family=Inter:wght@300;400;500&display=swap"
      rel="stylesheet"
    />

    <link rel="stylesheet" href="{{ asset('/') }}assets/auth/css/styles.css" />

    @stack('auth-css')

  </head>
  <body>
    <div class="ambient"></div>
    <div class="grid-overlay"></div>

    {{ $slot }}

    <script src="{{ asset('/') }}assets/auth/js/login-script.js"></script>
  </body>

  @stack('auth-js')
</html>
