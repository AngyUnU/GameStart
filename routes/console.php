<?php

use App\Http\Controllers\GameController;
use Illuminate\Foundation\Inspiring;
use Illuminate\Support\Facades\Artisan;
use Illuminate\Support\Facades\File;

Artisan::command('inspire', function () {
    $this->comment(Inspiring::quote());
})->purpose('Display an inspiring quote');

Artisan::command('pwa:build', function () {
    $distPath = base_path('dist');
    File::deleteDirectory($distPath);
    File::makeDirectory($distPath, 0755, true);

    $html = app(GameController::class)->index()->render();
    File::put($distPath . DIRECTORY_SEPARATOR . 'index.html', $html);

    $filesToCopy = ['manifest.json', 'sw.js', 'favicon.ico', 'robots.txt'];
    foreach ($filesToCopy as $file) {
        $src = public_path($file);
        if (File::exists($src)) {
            File::copy($src, $distPath . DIRECTORY_SEPARATOR . $file);
        }
    }

    $dirsToCopy = ['css', 'js', 'data', 'icons', 'images', 'screenshots'];
    foreach ($dirsToCopy as $dir) {
        $srcDir = public_path($dir);
        if (File::isDirectory($srcDir)) {
            File::copyDirectory($srcDir, $distPath . DIRECTORY_SEPARATOR . $dir);
        }
    }

    $this->info('PWA exportada correctamente en /dist para Firebase Hosting.');
})->purpose('Exporta la vista SSR de Laravel y los recursos PWA a /dist');
