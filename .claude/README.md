# RideLink Agent System

This directory contains the configuration and prompts for the multi-agent development system used to build RideLink.

## Overview

The RideLink project uses a **multi-agent architecture** where specialized AI agents handle different aspects of development. This approach enables:

- **Separation of Concerns**: Each agent focuses on their expertise area
- **Parallel Development**: Multiple agents can work simultaneously
- **Quality Assurance**: Specialized testing and review agents
- **Consistent Documentation**: Dedicated documentation agent maintains all docs

## Agent Registry

See [agents.json](./agents.json) for the complete agent configuration including:
- Agent roles and capabilities
- Current status of each agent
- Output directories
- Task assignments

## Available Agents

### Phase 1: Planning (Completed)
1. **Business Analyst** - Requirements and user stories
2. **Technical Architect** - System architecture and design
3. **Project Manager** - Project planning and task management

### Phase 2: Development (Active)
4. **Backend Developer** - Node.js, Express, MongoDB, Socket.io
5. **Frontend Developer** - React, TailwindCSS, state management
6. **QA Engineer** - Testing and quality assurance
7. **Documentation Specialist** - Technical documentation

### Phase 3: Infrastructure (Ready)
8. **DevOps Engineer** - Deployment and CI/CD
9. **Security Specialist** - Security audits
10. **Research Agent** - Technical research (on-demand)

## Agent Prompts

Detailed instructions for each agent are stored in the `prompts/` directory:

- [backend-developer.md](./prompts/backend-developer.md)
- [frontend-developer.md](./prompts/frontend-developer.md)
- More to be added as needed

## How It Works

1. **User Request**: You make a request (e.g., "Start backend development")
2. **Agent Selection**: The coordination agent selects appropriate specialist
3. **Agent Execution**: Specialist agent performs the task using their prompt
4. **Coordination**: Agents communicate through shared documentation
5. **Status Updates**: Progress tracked in `PROJECT_STATUS.md`

## Coordination

Agents coordinate through:
- **Shared Docs**: `AGENT_OUTPUTS/` directory
- **Status File**: `PROJECT_STATUS.md`
- **API Specs**: Shared API documentation
- **Implementation Log**: `AGENT_OUTPUTS/04_DEVELOPER/implementation-log.md`

## Current Status

See [PROJECT_STATUS.md](../PROJECT_STATUS.md) for real-time project status and agent activity.

## Usage

To invoke an agent, use natural language:
- "Start backend development"
- "Initialize frontend"
- "Run tests on authentication"
- "Update documentation"
- "Deploy to production"

The coordination agent will automatically select and invoke the appropriate specialist agent.

---

**Last Updated**: November 15, 2025
**Project**: RideLink University Carpooling Platform
