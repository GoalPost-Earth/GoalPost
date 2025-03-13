# GoalPost Scripts

This directory contains utility scripts for the GoalPost project. These scripts should be run as npm commands from the project root directory.

## Available Scripts

### Development Scripts

- `npm run dev` - Start the Next.js development server
- `npm run start` - Start the development environment using the start-dev.js script
- `npm run start:dev` - Start the Next.js server directly
- `npm run codegen` - Run GraphQL code generation in watch mode
- `npm run themegen` - Generate Chakra UI theme types

### Database Scripts

- `npm run init:db` - Initialize the Neo4j database with seed data from the seed-dev.cypher file

### Testing Scripts

- `npm run test` - Run Jest tests with environment variables from .env.local
- `npm run test:watch` - Run Jest tests in watch mode with environment variables from .env.local

### Release Scripts

- `npm run release:patch` - Update changelog, bump patch version, and push changes
- `npm run release:minor` - Update changelog, bump minor version, and push changes
- `npm run release:major` - Update changelog, bump major version, and push changes

## Script Descriptions

- `start-dev.js` - Starts the Next.js development server and GraphQL code generation concurrently
- `init-db.js` - Connects to Neo4j database and executes seed queries from the seed-dev.cypher file
- `build.js` - Builds the API and frontend projects
- `release.js` - Handles version bumping and changelog generation for releases
- `common.js` - Contains shared utility functions and constants used by other scripts

## Example Usage

Run the development environment:
```
npm run start
```

Initialize the database with seed data:
```
npm run init:db
```

Generate a new release:
```
npm run release:patch
```
