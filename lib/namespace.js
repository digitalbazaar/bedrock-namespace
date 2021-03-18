/*
 * Copyright (c) 2021 Digital Bazaar, Inc. All rights reserved.
 */
import assert from 'assert-plus';
import bedrock from 'bedrock';
import database from 'bedrock-mongodb';

const {util: {BedrockError}} = bedrock;

bedrock.events.on('bedrock-mongodb.ready', async () => {
  await database.openCollections(['namespace']);

  await database.createIndexes([{
    // cover queries by ID
    collection: 'namespace',
    fields: {'config.id': 1},
    options: {unique: true}
  }, {
    // cover config queries by controller
    collection: 'namespace',
    fields: {'config.controller': 1},
    options: {unique: false}
  }]);
});

/**
 * Establishes a new namespace by inserting its configuration into storage.
 *
 * @param {Object} config the namespace configuration.
 *
 * @return {Promise<Object>} resolves to the database record.
 */
export async function insert({config} = {}) {
  assert.object(config, 'config');
  assert.string(config.id, 'config.id');
  assert.string(config.controller, 'config.controller');

  // require starting sequence to be 0
  if(config.sequence !== 0) {
    throw new BedrockError(
      'Config sequence must be "0".',
      'DataError', {
        public: true,
        httpStatusCode: 400
      });
  }

  // insert the configuration and get the updated record
  const now = Date.now();
  const meta = {created: now, updated: now};
  const record = {
    config,
    meta,
  };
  try {
    const result = await database.collections.namespace.insertOne(record);
    return result.ops[0];
  } catch(e) {
    if(!database.isDuplicateError(e)) {
      throw e;
    }
    throw new BedrockError(
      'Duplicate namespace configuration.',
      'DuplicateError', {
        public: true,
        httpStatusCode: 409
      }, e);
  }
}

export default {
  insert,
};
