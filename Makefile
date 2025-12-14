.PHONY: help install dev build clean db-start db-stop db-logs db-verify db-shell db-reset

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
	@echo ""
	@echo "Database commands:"
	@echo "  make db-start      - Start PostgreSQL database"
	@echo "  make db-stop       - Stop database"
	@echo "  make db-logs       - Show database logs"
	@echo "  make db-verify     - Verify database connection"
	@echo "  make db-shell      - Open psql shell"
	@echo "  make db-reset      - Reset database (deletes all data)"

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

# Database commands
db-start:
	@echo "Starting PostgreSQL database..."
	docker-compose up db -d
	@echo "Waiting for database to be healthy..."
	@sleep 3
	@docker-compose ps db

db-stop:
	@echo "Stopping database..."
	docker-compose stop db

db-logs:
	docker-compose logs -f db

db-verify:
	@echo "Verifying database connection..."
	docker-compose exec db psql -U survey -d survey_mvp -c "SELECT 1;"

db-shell:
	@echo "Opening psql shell..."
	docker-compose exec db psql -U survey -d survey_mvp

db-reset:
	@echo "WARNING: This will delete all database data!"
	@echo "Press Ctrl+C to cancel, or Enter to continue..."
	@read confirm
	docker-compose down -v
	@echo "Database reset complete. Run 'make db-start' to start fresh."
