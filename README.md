# Task Tracker API

Готовая кодовая база на **Nest.js**, настроенная специально для изучения и построения **DevOps CI/CD пайплайнов** с использованием **Mocha** и **mocha-junit-reporter**.

---

## 📌 Особенности проекта для DevOps

1. **Тестирование на Mocha + Chai + Supertest**:
   - Полноценные Unit-тесты (`*.spec.ts`) контроллеров и сервисов.
   - End-to-End (E2E) тесты (`*.e2e-spec.ts`) с тестированием реальных HTTP-запросов и валидации.
2. **Интеграция с `mocha-junit-reporter`**:
   - Генерация стандартных XML-отчётов (`test-results/junit.xml`), которые распознаются любыми CI/CD системами: **GitHub Actions**, **GitLab CI**, **Jenkins**, **Azure DevOps**, **TeamCity**, **Bitbucket Pipelines**.
   - Одновременный вывод результатов в консоль и сохранение в файл благодаря `mocha-multi-reporters`.
3. **Cloud-Native & Kubernetes Ready**:
   - Эндпоинты мониторинга:
     - `/health` — базовый healthcheck (uptime, timestamp, service).
     - `/health/live` — Liveness Probe для Kubernetes/Docker.
     - `/health/ready` — Readiness Probe для Kubernetes/Docker.
   - Поддержка Graceful Shutdown (`enableShutdownHooks`).
   - Конфигурация через переменные окружения (`@nestjs/config` / `.env`).
4. **Оптимизированный Dockerfile (Multi-stage build)**:
   - Сборка TypeScript в отдельном слое `builder`.
   - Минимальный production-образ на базе `node:20-alpine`.
   - Запуск от непривилегированного пользователя `node` (безопасность).
   - Встроенный `HEALTHCHECK`.
5. **Готовый CI/CD Workflow**:
   - Пример `.github/workflows/ci.yml` с автоматическим запуском тестов, парсингом JUnit XML и сборкой Docker-образа.

---

## 📁 Структура проекта

```text
task-tracker-api/
├── .github/
│   └── workflows/
│       └── ci.yml               # Пайплайн GitHub Actions
├── src/
│   ├── common/                  # Общие утилиты и фильтры
│   ├── health/                  # Healthcheck эндпоинты (k8s probes)
│   │   ├── health.controller.ts
│   │   ├── health.controller.spec.ts  # Unit-тесты healthcheck
│   │   └── health.module.ts
│   ├── tasks/                   # Пример REST API модуля (CRUD)
│   │   ├── dto/
│   │   │   ├── create-task.dto.ts
│   │   │   └── update-task.dto.ts
│   │   ├── task.entity.ts
│   │   ├── tasks.controller.ts
│   │   ├── tasks.controller.spec.ts   # Unit-тесты контроллера
│   │   ├── tasks.service.ts
│   │   ├── tasks.service.spec.ts      # Unit-тесты сервиса
│   │   └── tasks.module.ts
│   ├── app.module.ts
│   └── main.ts                  # Точка входа приложения
├── test/
│   └── app.e2e-spec.ts          # E2E-тесты API
├── .dockerignore
├── .env.example
├── .gitignore
├── .mocharc.json                # Конфигурация Mocha для локальной разработки
├── .mocharc.ci.json             # Конфигурация Mocha + JUnit reporter для CI/CD
├── Dockerfile                   # Многоэтапный production Dockerfile
├── docker-compose.yml           # Локальный запуск в контейнере
├── Makefile                     # Удобные команды для терминала
├── package.json
├── tsconfig.json
└── tsconfig.build.json
```

---

## 🚀 Быстрый старт

### 1. Установка зависимостей

```bash
cd task-tracker-api
npm install
```

### 2. Запуск локально в режиме разработки

```bash
npm run start:dev
```
Приложение запустится на: `http://localhost:3000`

### 3. Сборка и запуск в production-режиме

```bash
npm run build
npm start
```

---

## 🧪 Запуск тестов и JUnit XML Reporter

### Локальный запуск (красивый консольный вывод)
```bash
# Все тесты (unit + e2e)
npm test

# Только unit тесты
npm run test:unit

# Только e2e тесты
npm run test:e2e
```

### Запуск для CI/CD с генерацией JUnit XML
```bash
npm run test:ci
```
При выполнении команды:
1. Тесты выводятся в консоль.
2. Автоматически создаётся файл отчёта: **`test-results/junit.xml`**.

### Запуск с отчётом покрытия кода (Coverage)
```bash
npm run test:coverage
```

---

## 🛠 Использование в CI/CD пайплайнах

### 1. GitHub Actions (уже настроен в `.github/workflows/ci.yml`)

В пайплайне шаг `npm run test:ci` генерирует `test-results/junit.xml`, а экшен `dorny/test-reporter` публикует интерактивный отчёт в интерфейсе GitHub PR/Commit.

### 2. Пример для GitLab CI (`.gitlab-ci.yml`)

```yaml
stages:
  - test
  - build

test:
  stage: test
  image: node:20-alpine
  script:
    - npm ci
    - npm run test:ci
  artifacts:
    when: always
    reports:
      junit: test-results/junit.xml

docker_build:
  stage: build
  image: docker:24
  services:
    - docker:dind
  script:
    - docker build -t $CI_REGISTRY_IMAGE:$CI_COMMIT_SHA .
```

### 3. Пример для Jenkins (`Jenkinsfile`)

```groovy
pipeline {
    agent { docker { image 'node:20-alpine' } }
    stages {
        stage('Install') {
            steps { sh 'npm ci' }
        }
        stage('Test') {
            steps { sh 'npm run test:ci' }
            post {
                always {
                    junit 'test-results/junit.xml'
                }
            }
        }
    }
}
```

---

## 🐳 Docker & Docker Compose

### Сборка Docker-образа
```bash
make docker-build
# или напрямую:
docker build -t task-tracker-api:latest .
```

### Запуск контейнера
```bash
make docker-run
# Проверка healthcheck:
curl http://localhost:3000/health
```

### Остановка
```bash
make docker-stop
```

### Запуск через Docker Compose
```bash
make docker-compose-up
make docker-compose-down
```

---

## 📋 API Эндпоинты

| Метод | URL | Описание |
| :--- | :--- | :--- |
| `GET` | `/health` | Общий статус сервиса, uptime и timestamp |
| `GET` | `/health/live` | Liveness Probe для k8s/Docker |
| `GET` | `/health/ready` | Readiness Probe для k8s/Docker |
| `GET` | `/tasks` | Список всех задач |
| `GET` | `/tasks/:id` | Получение задачи по ID |
| `POST` | `/tasks` | Создание новой задачи |
| `PATCH` | `/tasks/:id` | Обновление задачи |
| `DELETE` | `/tasks/:id` | Удаление задачи |
