# Три в ряд

Простая бесконечная игра «три в ряд» для Android. Собирай комбинации из трёх и более фишек, набирай очки и продолжай игру без ограничения по времени. Если возможных ходов не осталось, поле автоматически перемешивается.

## Что лежит в репозитории

- `TriVryad-android-project.zip` — архив с полным проектом Android Studio. Внутри находятся исходный код приложения, игровая страница и файлы сборки Gradle.
- `.github/workflows/build-apk.yml` — GitHub Actions workflow для автоматической сборки APK.
- `README.md` — описание игры и файлов проекта.

## Как устроен проект внутри архива

- `app/src/main/assets/index.html` — интерфейс и логика игры: поле, фишки, комбинации, счёт и перемешивание.
- `app/src/main/java/ru/kotik/trivryad/MainActivity.java` — Android-экран, который открывает игру во встроенном WebView.
- `app/src/main/AndroidManifest.xml` — настройки запуска приложения.
- `app/build.gradle`, `build.gradle` и `settings.gradle` — конфигурация Android и Gradle.
- `gradle.properties` — параметры Gradle.

## Сборка APK

Workflow запускается при каждом push в ветку `main`. Он распаковывает проект, собирает debug APK и сохраняет его в артефакт `TriVryad-debug-apk` на 14 дней. APK можно скачать на странице запуска во вкладке **Actions**. Сам APK в репозитории не хранится.
