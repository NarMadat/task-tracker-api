.PHONY: help install build test test-unit test-e2e test-ci test-coverage docker-build docker-run docker-stop docker-compose-up docker-compose-down

help: ## Show this help message
	@echo "Available commands:"
	@grep -E '^[a-zA-Z_-]+:.*?## .*$$' $(MAKEFILE_LIST) | awk 'BEGIN {FS = ":.*?## "}; {printf "  \033[36m%-20s\033[0m %s\n", $$1, $$2}'

install: ## Install npm dependencies
	npm install

build: ## Build TypeScript application
	npm run build

start: ## Start application in production mode
	npm start

start-dev: ## Start application in development mode with reload
	npm run start:dev

test: ## Run all tests with Mocha console reporter
	npm test

test-unit: ## Run only unit tests
	npm run test:unit

test-e2e: ## Run only end-to-end (e2e) tests
	npm run test:e2e

test-ci: ## Run all tests with Mocha JUnit reporter for CI/CD
	npm run test:ci

test-coverage: ## Run tests with code coverage report
	npm run test:coverage

docker-build: ## Build production Docker image
	docker build -t nestjs-devops-api:latest .

docker-run: ## Run Docker container locally
	docker run -d --name nestjs-devops-api -p 3000:3000 nestjs-devops-api:latest

docker-stop: ## Stop and remove local Docker container
	docker stop nestjs-devops-api || true
	docker rm nestjs-devops-api || true

docker-compose-up: ## Start service via docker-compose
	docker-compose up --build -d

docker-compose-down: ## Stop docker-compose services
	docker-compose down
