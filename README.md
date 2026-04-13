# FastAPI URL Shortener

Веб-сервис для сокращения длинных URL-адресов с расширенной функциональностью: история ссылок, QR-коды, срок действия, лимит переходов, статистика и защита от вредоносных URL.

## Функционал

* **Сокращение URL.** Пользователь вводит длинный URL и получает короткую ссылку.
* **Перенаправление.** При переходе по короткой ссылке происходит автоматический редирект на исходный URL.
* **Пользовательский короткий код.** Возможность задать свой код вместо случайного.
* **Срок действия ссылки.** 10 минут/1 час/1 день/7 дней/30 дней/бессрочно.
* **Лимит переходов.** Ссылка автоматически перестаёт работать после достижения лимита кликов.
* **Статистика переходов.** Счётчик кликов с автоматическим обновлением.
* **QR-код.** Генерация градиентного QR-кода для каждой ссылки с возможностью скачивания в PNG.
* **История ссылок.** Сохранение созданных ссылок в браузере (localStorage) с возможностью отмены удаления.
* **Тёмная тема.** Три режима: системная, светлая, тёмная.
* **Интернационализация.** Русский и английский языки с автоопределением по языку браузера.
* **Защита от вредоносных URL.** Блокировка ссылок из базы URLhaus с автообновлением.
* **Rate limiting.** Ограничение количества запросов по IP.
* **Security headers.** Защита от XSS, clickjacking и других атак.
* **Offline-индикатор.** Уведомление пользователя при потере соединения.

## Технологический стек

* **Backend:** Python, FastAPI, SQLAlchemy 2.0 (async), PostgreSQL, Alembic, APScheduler, slowapi
* **Frontend:** React 19, Vite, Tailwind CSS 4, qrcode.react
* **Инфраструктура:** Docker, Docker Compose, Nginx, Gunicorn + Uvicorn

## Запуск через Docker

Требуется установленный Docker и Docker Compose.

```bash
git clone https://github.com/makel0ve/short-url-v2.git
cd short-url-v2

cp .env.example .env
cp backend/.env.example backend/.env

docker compose up -d --build
```

Приложение будет доступно на `http://localhost`.

## Запуск в режиме разработки

### Backend

```bash
cd backend
python -m venv venv
pip install -r requirements.txt

cp .env.example .env

alembic upgrade head
uvicorn app.main:app --reload
```

### Frontend

```bash
cd frontend
npm install
npm run dev
```

Фронтенд откроется на `http://localhost:5173`.

## API

| Метод | Путь | Описание |
|-------|------|----------|
| POST | `/api/links` | Создать короткую ссылку |
| GET | `/api/links/{code}/stats` | Получить статистику |
| DELETE | `/api/links/{code}` | Удалить ссылку |
| GET | `/{code}` | Редирект на оригинальную ссылку |
