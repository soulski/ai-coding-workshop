#!/bin/bash

# Add NuGet Package to .NET Project
# Supports adding individual packages or common package presets
#
# Usage:
#   ./add_package.sh <project_path> <package_name|preset>
#
# Presets:
#   ef-postgres    - Entity Framework Core with PostgreSQL
#   ef-sqlserver   - Entity Framework Core with SQL Server
#   swagger        - Swagger/OpenAPI documentation
#   auth           - JWT Authentication
#   validation     - FluentValidation
#
# Examples:
#   ./add_package.sh ./MyApi Newtonsoft.Json
#   ./add_package.sh ./MyApi ef-postgres
#   ./add_package.sh ./MyApi auth

set -e

# Color output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

PROJECT_PATH="$1"
PACKAGE_OR_PRESET="$2"

# Validate arguments
if [ -z "$PROJECT_PATH" ] || [ -z "$PACKAGE_OR_PRESET" ]; then
    echo -e "${RED}Error: Missing required arguments${NC}"
    echo "Usage: $0 <project_path> <package_name|preset>"
    echo ""
    echo "Presets:"
    echo "  ef-postgres    - Entity Framework Core with PostgreSQL"
    echo "  ef-sqlserver   - Entity Framework Core with SQL Server"
    echo "  swagger        - Swagger/OpenAPI documentation"
    echo "  auth           - JWT Authentication"
    echo "  validation     - FluentValidation"
    echo ""
    echo "Examples:"
    echo "  $0 ./MyApi Newtonsoft.Json"
    echo "  $0 ./MyApi ef-postgres"
    exit 1
fi

# Find the API project file
API_PROJECT=$(find "$PROJECT_PATH" -name "*.Api.csproj" | head -1)
if [ -z "$API_PROJECT" ]; then
    API_PROJECT=$(find "$PROJECT_PATH" -name "*.csproj" | head -1)
fi

if [ -z "$API_PROJECT" ]; then
    echo -e "${RED}Error: Could not find .csproj file in $PROJECT_PATH${NC}"
    exit 1
fi

API_DIR=$(dirname "$API_PROJECT")

add_package() {
    local package=$1
    echo -e "${BLUE}Adding package: $package${NC}"
    cd "$API_DIR" && dotnet add package "$package"
}

# Handle presets
case "$PACKAGE_OR_PRESET" in
    ef-postgres)
        echo -e "${BLUE}Installing Entity Framework Core with PostgreSQL...${NC}"
        add_package "Microsoft.EntityFrameworkCore"
        add_package "Microsoft.EntityFrameworkCore.Design"
        add_package "Npgsql.EntityFrameworkCore.PostgreSQL"
        echo -e "${GREEN}✓ EF Core PostgreSQL packages installed${NC}"
        ;;
    ef-sqlserver)
        echo -e "${BLUE}Installing Entity Framework Core with SQL Server...${NC}"
        add_package "Microsoft.EntityFrameworkCore"
        add_package "Microsoft.EntityFrameworkCore.Design"
        add_package "Microsoft.EntityFrameworkCore.SqlServer"
        echo -e "${GREEN}✓ EF Core SQL Server packages installed${NC}"
        ;;
    swagger)
        echo -e "${BLUE}Installing Swagger/OpenAPI...${NC}"
        add_package "Swashbuckle.AspNetCore"
        echo -e "${GREEN}✓ Swagger installed${NC}"
        echo -e "${YELLOW}Note: In .NET 10, OpenAPI support is built-in. Configure in Program.cs${NC}"
        ;;
    auth)
        echo -e "${BLUE}Installing JWT Authentication...${NC}"
        add_package "Microsoft.AspNetCore.Authentication.JwtBearer"
        add_package "System.IdentityModel.Tokens.Jwt"
        echo -e "${GREEN}✓ JWT Authentication packages installed${NC}"
        ;;
    validation)
        echo -e "${BLUE}Installing FluentValidation...${NC}"
        add_package "FluentValidation"
        add_package "FluentValidation.AspNetCore"
        echo -e "${GREEN}✓ FluentValidation installed${NC}"
        ;;
    *)
        # Assume it's a direct package name
        add_package "$PACKAGE_OR_PRESET"
        echo -e "${GREEN}✓ Package $PACKAGE_OR_PRESET installed${NC}"
        ;;
esac

echo ""
echo -e "${GREEN}Package installation completed!${NC}"
