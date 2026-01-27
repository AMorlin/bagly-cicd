.PHONY: dev prod down logs clean rebuild

# Development (local)
dev:
	docker compose up -d
	@echo "PostgreSQL: localhost:5432"
	@echo "Redis: localhost:6379"
	@echo "Run 'cd frontend && npm run dev' for frontend"
	@echo "Run 'cd backend && npm run dev' for backend"

# Production (full stack)
prod:
	docker compose -f docker-compose.prod.yml up -d --build
	@echo ""
	@echo "=== Bagly is starting ==="
	@echo "Frontend: http://localhost:3000"
	@echo "Backend:  http://localhost:3333"
	@echo "PostgreSQL: localhost:5433"
	@echo "Redis: localhost:6380"
	@echo ""
	@echo "Check logs: make logs"

# Stop all containers
down:
	docker compose -f docker-compose.prod.yml down
	docker compose down

# View logs
logs:
	docker compose -f docker-compose.prod.yml logs -f

logs-backend:
	docker logs -f bagly-backend

logs-frontend:
	docker logs -f bagly-frontend

# Clean everything (including volumes)
clean:
	docker compose -f docker-compose.prod.yml down -v
	docker compose down -v
	docker system prune -f

# Rebuild containers
rebuild:
	docker compose -f docker-compose.prod.yml up -d --build --force-recreate

# Run migrations manually
migrate:
	docker compose -f docker-compose.prod.yml exec backend npx prisma migrate deploy

# Access database
db:
	docker exec -it bagly-postgres psql -U bagly -d bagly

# Access backend shell
shell:
	docker exec -it bagly-backend sh

# Status
status:
	@echo "=== Bagly Containers ==="
	@docker ps --filter "name=bagly" --format "table {{.Names}}\t{{.Status}}\t{{.Ports}}"
