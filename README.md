# Три в ряд

Бесконечная match-3 игра для Android и браузера. Собирай комбинации из трёх и более фишек; когда ходов нет, поле перемешивается.

## Играть в браузере

Сайт: https://rwppp.github.io/MikuGames/

Веб-версия рассчитана в первую очередь на десктоп. Исходники сайта находятся в папке web/ ветки web-games. Сайт публикуется через GitHub Pages.

## Android-проект

TriVryad-android-project.zip содержит полный проект Android Studio: исходный код игры, WebView-экран и настройки Gradle.

## Скачать APK

GitHub Actions собирает debug APK при изменении Android-архива TriVryad-android-project.zip или workflow .github/workflows/build-apk.yml в ветке main. Изменения README и сайта Android-сборку не запускают. Её также можно запустить вручную через Actions → Build Android APK → Run workflow. Готовый артефакт TriVryad-debug-apk хранится 14 дней.
