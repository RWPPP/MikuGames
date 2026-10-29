# MikuGames

В репозитории лежат Android-игра «Три в ряд» и её веб-версия. Игра бесконечная: собирай комбинации из трёх и более фишек, получай очки и продолжай играть; если ходов не осталось, поле перемешивается.

## Веб-версия

- `web/index.html` — настольная версия игры, рассчитанная в первую очередь на десктоп.
- `web/merge.html` — merge-игра «Слияние звёзд» с перекатывающимися и вращающимися фишками.
- `web/go.html` — го на классической доске 19 × 19: Мику играет чёрными, Тето — белыми; два паса завершают партию, счёт включает территорию и камни.
- `web/go-miku.svg` и `web/go-teto.svg` — новые пиксельные спрайты для камней в го.
- `web/miku.png` — пиксельная Мику.
- `index.html` — входная страница GitHub Pages, перенаправляет к игре.
- GitHub Pages публикует ветку `web-games` из корня репозитория.

## Android-проект

`TriVryad-android-project.zip` — проект Android Studio. Внутри находятся исходный код приложения, игровые ресурсы и настройки Gradle.

- `app/src/main/assets/index.html` — интерфейс и логика игры для Android.
- `app/src/main/java/ru/kotik/trivryad/MainActivity.java` — Android-экран с WebView.
- `app/src/main/AndroidManifest.xml` — настройки запуска приложения.
- `app/build.gradle`, `build.gradle`, `settings.gradle` и `gradle.properties` — конфигурация сборки.

## Сборка APK

GitHub Actions собирает debug APK, когда в `main` меняется архив `TriVryad-android-project.zip` или workflow `.github/workflows/build-apk.yml`. Веб-файлы не запускают пересборку APK. Workflow также можно запустить вручную через **Actions → Build Android APK → Run workflow**. Готовый артефакт `TriVryad-debug-apk` хранится 14 дней; сам APK в Git не добавляется.
