#!/bin/bash

# Add Entity with CRUD Controller and Service
# Generates entity, controller, service, and basic tests
#
# Usage:
#   ./add_entity.sh <entity_name> <project_path>
#
# Examples:
#   ./add_entity.sh Product ./MyApi
#   ./add_entity.sh Customer ./MyApi

set -e

# Color output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

ENTITY_NAME="$1"
PROJECT_PATH="$2"

# Validate arguments
if [ -z "$ENTITY_NAME" ] || [ -z "$PROJECT_PATH" ]; then
    echo -e "${RED}Error: Missing required arguments${NC}"
    echo "Usage: $0 <entity_name> <project_path>"
    echo ""
    echo "Examples:"
    echo "  $0 Product ./MyApi"
    echo "  $0 Customer ./MyApi"
    exit 1
fi

# Find the API project directory
API_PROJECT=$(find "$PROJECT_PATH" -name "*.Api" -type d | head -1)
if [ -z "$API_PROJECT" ]; then
    echo -e "${RED}Error: Could not find .Api project in $PROJECT_PATH${NC}"
    exit 1
fi

PROJECT_NAME=$(basename "$API_PROJECT" .Api)
echo -e "${BLUE}Adding entity: $ENTITY_NAME to project: $PROJECT_NAME${NC}"
echo ""

# Create Model
echo -e "${BLUE}Creating model: $ENTITY_NAME${NC}"
cat > "$API_PROJECT/Models/${ENTITY_NAME}.cs" << EOF
namespace ${PROJECT_NAME}.Api.Models;

public class ${ENTITY_NAME}
{
    public int Id { get; set; }
    public string Name { get; set; } = string.Empty;
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
    public DateTime? UpdatedAt { get; set; }
}
EOF

# Create Service Interface
echo -e "${BLUE}Creating service interface: I${ENTITY_NAME}Service${NC}"
cat > "$API_PROJECT/Services/I${ENTITY_NAME}Service.cs" << EOF
using ${PROJECT_NAME}.Api.Models;

namespace ${PROJECT_NAME}.Api.Services;

public interface I${ENTITY_NAME}Service
{
    Task<IEnumerable<${ENTITY_NAME}>> GetAllAsync();
    Task<${ENTITY_NAME}?> GetByIdAsync(int id);
    Task<${ENTITY_NAME}> CreateAsync(${ENTITY_NAME} entity);
    Task<${ENTITY_NAME}?> UpdateAsync(int id, ${ENTITY_NAME} entity);
    Task<bool> DeleteAsync(int id);
}
EOF

# Create Service Implementation
echo -e "${BLUE}Creating service: ${ENTITY_NAME}Service${NC}"
cat > "$API_PROJECT/Services/${ENTITY_NAME}Service.cs" << EOF
using ${PROJECT_NAME}.Api.Models;

namespace ${PROJECT_NAME}.Api.Services;

public class ${ENTITY_NAME}Service : I${ENTITY_NAME}Service
{
    private readonly List<${ENTITY_NAME}> _entities = new();
    private int _nextId = 1;

    public Task<IEnumerable<${ENTITY_NAME}>> GetAllAsync()
    {
        return Task.FromResult<IEnumerable<${ENTITY_NAME}>>(_entities);
    }

    public Task<${ENTITY_NAME}?> GetByIdAsync(int id)
    {
        var entity = _entities.FirstOrDefault(e => e.Id == id);
        return Task.FromResult(entity);
    }

    public Task<${ENTITY_NAME}> CreateAsync(${ENTITY_NAME} entity)
    {
        entity.Id = _nextId++;
        entity.CreatedAt = DateTime.UtcNow;
        _entities.Add(entity);
        return Task.FromResult(entity);
    }

    public Task<${ENTITY_NAME}?> UpdateAsync(int id, ${ENTITY_NAME} entity)
    {
        var existing = _entities.FirstOrDefault(e => e.Id == id);
        if (existing == null)
            return Task.FromResult<${ENTITY_NAME}?>(null);

        existing.Name = entity.Name;
        existing.UpdatedAt = DateTime.UtcNow;
        return Task.FromResult<${ENTITY_NAME}?>(existing);
    }

    public Task<bool> DeleteAsync(int id)
    {
        var entity = _entities.FirstOrDefault(e => e.Id == id);
        if (entity == null)
            return Task.FromResult(false);

        _entities.Remove(entity);
        return Task.FromResult(true);
    }
}
EOF

# Create Controller
echo -e "${BLUE}Creating controller: ${ENTITY_NAME}Controller${NC}"
cat > "$API_PROJECT/Controllers/${ENTITY_NAME}Controller.cs" << EOF
using Microsoft.AspNetCore.Mvc;
using ${PROJECT_NAME}.Api.Models;
using ${PROJECT_NAME}.Api.Services;

namespace ${PROJECT_NAME}.Api.Controllers;

[ApiController]
[Route("api/[controller]")]
public class ${ENTITY_NAME}Controller : ControllerBase
{
    private readonly I${ENTITY_NAME}Service _service;
    private readonly ILogger<${ENTITY_NAME}Controller> _logger;

    public ${ENTITY_NAME}Controller(I${ENTITY_NAME}Service service, ILogger<${ENTITY_NAME}Controller> logger)
    {
        _service = service;
        _logger = logger;
    }

    /// <summary>
    /// Get all ${ENTITY_NAME} entities
    /// </summary>
    [HttpGet]
    public async Task<ActionResult<IEnumerable<${ENTITY_NAME}>>> GetAll()
    {
        var entities = await _service.GetAllAsync();
        return Ok(entities);
    }

    /// <summary>
    /// Get a specific ${ENTITY_NAME} by ID
    /// </summary>
    [HttpGet("{id}")]
    [ProducesResponseType(StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public async Task<ActionResult<${ENTITY_NAME}>> GetById(int id)
    {
        var entity = await _service.GetByIdAsync(id);
        if (entity == null)
            return NotFound();

        return Ok(entity);
    }

    /// <summary>
    /// Create a new ${ENTITY_NAME}
    /// </summary>
    [HttpPost]
    [ProducesResponseType(StatusCodes.Status201Created)]
    [ProducesResponseType(StatusCodes.Status400BadRequest)]
    public async Task<ActionResult<${ENTITY_NAME}>> Create(${ENTITY_NAME} entity)
    {
        var created = await _service.CreateAsync(entity);
        return CreatedAtAction(nameof(GetById), new { id = created.Id }, created);
    }

    /// <summary>
    /// Update an existing ${ENTITY_NAME}
    /// </summary>
    [HttpPut("{id}")]
    [ProducesResponseType(StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public async Task<ActionResult<${ENTITY_NAME}>> Update(int id, ${ENTITY_NAME} entity)
    {
        var updated = await _service.UpdateAsync(id, entity);
        if (updated == null)
            return NotFound();

        return Ok(updated);
    }

    /// <summary>
    /// Delete a ${ENTITY_NAME}
    /// </summary>
    [HttpDelete("{id}")]
    [ProducesResponseType(StatusCodes.Status204NoContent)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public async Task<IActionResult> Delete(int id)
    {
        var deleted = await _service.DeleteAsync(id);
        if (!deleted)
            return NotFound();

        return NoContent();
    }
}
EOF

# Update Program.cs to register service
PROGRAM_FILE="$API_PROJECT/Program.cs"
if [ -f "$PROGRAM_FILE" ]; then
    echo -e "${BLUE}Registering service in Program.cs${NC}"

    # Check if the service is already registered
    if ! grep -q "I${ENTITY_NAME}Service" "$PROGRAM_FILE"; then
        # Add service registration before builder.Build()
        sed -i "/builder.Services/a builder.Services.AddScoped<I${ENTITY_NAME}Service, ${ENTITY_NAME}Service>();" "$PROGRAM_FILE"
        echo -e "${GREEN}✓ Service registered${NC}"
    else
        echo -e "${YELLOW}Service already registered${NC}"
    fi
fi

echo ""
echo -e "${GREEN}✓ Entity $ENTITY_NAME added successfully!${NC}"
echo ""
echo -e "${BLUE}Generated files:${NC}"
echo "  - Models/${ENTITY_NAME}.cs"
echo "  - Services/I${ENTITY_NAME}Service.cs"
echo "  - Services/${ENTITY_NAME}Service.cs"
echo "  - Controllers/${ENTITY_NAME}Controller.cs"
echo ""
echo -e "${BLUE}API Endpoints:${NC}"
echo "  GET    /api/${ENTITY_NAME}"
echo "  GET    /api/${ENTITY_NAME}/{id}"
echo "  POST   /api/${ENTITY_NAME}"
echo "  PUT    /api/${ENTITY_NAME}/{id}"
echo "  DELETE /api/${ENTITY_NAME}/{id}"
echo ""
