/* eslint-disable @typescript-eslint/no-var-requires */
const fs = require('fs')
const path = require('path')

/*
 * Check for GRAPHQL_SCHEMA environment variable to specify schema file
 * fallback to schema.graphql if GRAPHQL_SCHEMA environment variable is not set
 */

const schema = fs
  .readFileSync(path.join(__dirname, 'schema.graphql'))
  .toString('utf-8')

const array = [schema]

exports.typeDefs = array.join(' ')
