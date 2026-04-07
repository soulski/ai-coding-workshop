#!/bin/bash

# Generate Dockerfile for .NET 10 Web API
# Creates optimized multi-stage Dockerfile and docker-compose
#
# Usage:
#   ./generate_dockerfile.sh <project_path>
#
# Examples:
#   ./generate_dockerfile.sh ./MyApi

set -e

# Color output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

PROJECT_PATH="$1"

# Validate arguments
if [ -z "$PROJECT_PATH" ]; then
    echo -e "${RED}Error: Project path is required${NC}"
    echo "Usage: $0 <project_path>"
    echo ""
    echo "Example:"
    echo "  $0 ./MyApi"
    exit 1
fi

# Find project name
SOLUTION_FILE=$(find "$PROJECT_PATH" -name "*.sln" | head -1)
if [ -z "$SOLUTION_FILE" ]; then
    echo -e "${RED}Error: Could not find .sln file in $PROJECT_PATH${NC}"
    exit 1
fi

PROJECT_NAME=$(basename "$SOLUTION_FILE" .sln)
API_PROJECT="${PROJECT_NAME}.Api"

echo -e "${BLUE}Generating Dockerfile for: $PROJECT_NAME${NC}"
echo ""

# Create Dockerfile
cat > "$PROJECT_PATH/Dockerfile" << EOF
# Build stage
FROM mcr.microsoft.com/dotnet/sdk:10.0 AS build
WORKDIR /src

# Copy solution and project files
COPY *.sln .
COPY ${API_PROJECT}/*.csproj ${API_PROJECT}/
COPY ${PROJECT_NAME}.Tests/*.csproj ${PROJECT_NAME}.Tests/

# Restore dependencies
RUN dotnet restore

# Copy all source files
COPY . .

# Build the application
WORKDIR /src/${API_PROJECT}
RUN dotnet build -c Release -o /app/build

# Publish stage
FROM build AS publish
RUN dotnet publish -c Release -o /app/publish /p:UseAppHost=false

# Runtime stage
FROM mcr.microsoft.com/dotnet/aspnet:10.0 AS final
WORKDIR /app

# Create non-root user
RUN addgroup --system --gid 1000 appuser && \\
    adduser --system --uid 1000 --gid 1000 appuser

# Copy published application
COPY --from=publish /app/publish .

# Set ownership
RUN chown -R appuser:appuser /app

# Switch to non-root user
USER appuser

# Expose port
EXPOSE 8080

# Health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \\
    CMD curl -f http://localhost:8080/health || exit 1

# Set entry point
ENTRYPOINT ["dotnet", "${API_PROJECT}.dll"]
EOF

# Create .dockerignore
cat > "$PROJECT_PATH/.dockerignore" << 'EOF'
**/.classpath
**/.dockerignore
**/.env
**/.git
**/.gitignore
**/.project
**/.settings
**/.toolstarget
**/.vs
**/.vscode
**/*.*proj.user
**/*.dbmdl
**/*.jfm
**/azds.yaml
**/bin
**/charts
**/docker-compose*
**/Dockerfile*
**/node_modules
**/npm-debug.log
**/obj
**/secrets.dev.yaml
**/values.dev.yaml
LICENSE
README.md
EOF

# Create docker-compose.yml
cat > "$PROJECT_PATH/docker-compose.yml" << EOF
services:
  api:
    build:
      context: .
      dockerfile: Dockerfile
    ports:
      - "5000:8080"
    environment:
      - ASPNETCORE_ENVIRONMENT=Development
      - ASPNETCORE_HTTP_PORTS=8080
    depends_on:
      - postgres
    networks:
      - app-network

  postgres:
    image: postgres:16
    environment:
      - POSTGRES_USER=postgres
      - POSTGRES_PASSWORD=postgres
      - POSTGRES_DB=${PROJECT_NAME,,}_db
    ports:
      - "5432:5432"
    volumes:
      - postgres_data:/var/lib/postgresql/data
    networks:
      - app-network
    healthcheck:
      test: ["CMD-SHELL", "pg_isready -U postgres"]
      interval: 10s
      timeout: 5s
      retries: 5

networks:
  app-network:
    driver: bridge

volumes:
  postgres_data:
EOF

echo -e "${GREEN}✓ Docker files generated successfully!${NC}"
echo ""
echo -e "${BLUE}Generated files:${NC}"
echo "  - Dockerfile"
echo "  - .dockerignore"
echo "  - docker-compose.yml"
echo ""
echo -e "${BLUE}Build and run with Docker:${NC}"
echo "  cd $PROJECT_PATH"
echo "  docker build -t ${PROJECT_NAME,,}:latest ."
echo "  docker run -p 5000:8080 ${PROJECT_NAME,,}:latest"
echo ""
echo -e "${BLUE}Or use Docker Compose:${NC}"
echo "  docker-compose up -d"
echo "  docker-compose logs -f api"
echo "  docker-compose down"
echo ""
