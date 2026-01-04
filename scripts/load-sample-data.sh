#!/bin/bash

# Script to load sample ontology data into Neo4j
# Usage: ./scripts/load-sample-data.sh

echo "Loading sample ontology data into Neo4j..."
echo ""

# Read the Cypher file and execute via MCP Neo4j connection
# Since we're using MCP, we'll need to use the Neo4j browser or execute via Node script

echo "To load the sample data, you have two options:"
echo ""
echo "Option 1: Use Neo4j Browser"
echo "  1. Open Neo4j Browser at http://localhost:7474"
echo "  2. Open the file: docs/cypher/sample-ontology-data.cypher"
echo "  3. Copy the contents and paste into Neo4j Browser"
echo "  4. Execute the script"
echo ""
echo "Option 2: Use the provided Node script (recommended)"
echo "  npm run load:sample-data"
echo ""
