.PHONY: help install dev build clean

help:
	@echo "Available commands:"
	@echo "  make install       - Install all dependencies"
	@echo "  make dev           - Start development servers"
	@echo "  make build         - Build both frontend and backend"
	@echo "  make clean         - Clean build artifacts"
	@echo ""
	@echo "Frontend commands:"
	@echo "  make frontend-install  - Install frontend dependencies"
	@echo "  make frontend-dev      - Start frontend dev server"
	@echo "  make frontend-build    - Build frontend"
	@echo ""
	@echo "Backend commands:"
	@echo "  make backend-install   - Install backend dependencies"
	@echo "  make backend-dev       - Start backend dev server"
	@echo "  make backend-docker    - Run backend in Docker"

install: frontend-install backend-install

frontend-install:
	cd frontend && npm install

backend-install:
	cd backend && pip install -r requirements.txt

frontend-dev:
	cd frontend && npm run dev

backend-dev:
	cd backend && uvicorn app.main:app --reload

backend-docker:
	docker-compose up --build

dev:
	@echo "Starting backend with Docker..."
	@docker-compose up -d
	@echo "Starting frontend..."
	@cd frontend && npm run dev

frontend-build:
	cd frontend && npm run build

backend-build:
	cd backend && docker build -t survey-mvp-backend .

build: frontend-build backend-build

clean:
	rm -rf frontend/out frontend/.next frontend/node_modules
	rm -rf backend/__pycache__ backend/**/__pycache__
	docker-compose down
