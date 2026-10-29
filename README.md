# MikuGames

Android-приложение включает «Три в ряд», «Слияние звёзд» и го. В «Три в ряд» собирай комбинации из трёх и более фишек; квадрат из четырёх одинаковых запускает отдельный мощный эффект, а если ходов не осталось, поле перемешивается. В merge-игре можно объединять персонажей, а их вращающиеся силуэты имеют составные хитбоксы.

## Веб-версия

- `web/index.html` — настольная версия игры, рассчитанная в первую очередь на десктоп.
- `web/merge.html` — merge-игра «Слияние звёзд» с круглыми фишками, переключением стилей «Реалистичные», «Чиби» и открытой летней коллекции; редкий режим вращения даёт до 500 бонусных очков за игру.
- `web/go.html` — го на стандартной доске 19 × 19: вдвоём или против Тето-компьютера с тремя уровнями сложности. Два паса завершают партию, счёт включает территорию и камни.
- `web/go-miku.png` и `web/go-teto.png` — новые пиксельные спрайты для камней в го.
- `web/miku.png` — пиксельная Мику.
- `index.html` — входная страница GitHub Pages, перенаправляет к игре.
- GitHub Pages публикует ветку `web` из корня репозитория. Корневой `index.html` этой ветки перенаправляет в `/web/`.

## Android-проект

`TriVryad-android-project.zip` — проект Android Studio. Внутри находятся исходный код приложения, игровые ресурсы и настройки Gradle.

- `app/src/main/assets/index.html` — игра «Три в ряд» и вход в остальные игры Android-версии.
- `app/src/main/assets/merge.html` и `merge-sprites/` — merge-игра с пиксельными спрайтами и фигурными хитбоксами.
- `app/src/main/assets/go.html`, `go-miku.png`, `go-teto.png` — игра го, доступная из библиотеки игр.
- `app/src/main/java/ru/kotik/trivryad/MainActivity.java` — Android-экран с WebView.
- `app/src/main/AndroidManifest.xml` — настройки запуска приложения.
- `app/build.gradle`, `build.gradle`, `settings.gradle` и `gradle.properties` — конфигурация сборки.

## Сборка APK

GitHub Actions собирает debug APK, когда в `main` меняется архив `TriVryad-android-project.zip` или workflow `.github/workflows/build-apk.yml`. Веб-файлы не запускают пересборку APK. Workflow также можно запустить вручную через **Actions → Build Android APK → Run workflow**. Готовый артефакт `TriVryad-debug-apk` хранится 14 дней; сам APK в Git не добавляется.
