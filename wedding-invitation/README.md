# Wedding invitation — одностраничный сайт

Светлая тема, адаптивная вёрстка (десктоп и мобильные), анимация конверта, гирлянда, программа дня со «сердечком» на нити, обратный отсчёт и Google Maps.

## Структура

```
wedding-invitation/
├── index.html
├── css/styles.css
├── js/
│   ├── main.js
│   ├── i18n.js
│   ├── envelope.js
│   ├── lights.js
│   ├── program-timeline.js
│   └── countdown.js
├── locales/
│   ├── ua.json    ← основной текст (заполнен)
│   ├── en.json    ← черновик, можно заменить
│   └── ro.json    ← черновик, можно заменить
└── images/
    ├── photo1.jpg
    ├── photo2.jpg
    └── photo1.svg / photo2.svg  ← запасні заглушки, якщо jpg ще немає
```

Все тексты — ключи в JSON. Пути к фото: `images.photo1`, `images.photo2` в каждом файле локали.

## Запуск локально

Нужен локальный сервер (модули и `fetch` локалей не работают с `file://`):

```bash
cd ~/Projects/wedding-invitation
python3 -m http.server 8080
```

Откройте http://localhost:8080

Переключение языка: кнопки UA / EN / RO или `?lang=en` в URL.

## Ваши правки

1. Отредактируйте `locales/ua.json` — заголовок и тело приглашения, при необходимости программу.
2. Положите фото в `images/` как `photo1.jpg` и `photo2.jpg` (пути уже в локалях).
3. В `js/countdown.js` дата уже `2026-08-08T12:00:00+03:00` (Київ).
4. Замените iframe в `index.html` на embed вашей локации из Google Maps.

## Git

Репозиторий можно инициализировать после установки Xcode Command Line Tools: `git init`.
