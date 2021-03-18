/*!
 * Copyright (c) 2020-2021 Digital Bazaar, Inc. All rights reserved.
 */
import {asyncHandler} from 'bedrock-express';
import bedrock from 'bedrock';
import namespace from './namespace.js';
import {generateId} from 'bnid';
import {getNamespaceId} from './helpers.js';

const {config} = bedrock;

bedrock.events.on('bedrock-express.configure.routes', app => {
  const {routes} = config.namespace;
  app.post(
    routes.basePath,
    // TODO: add validation
    asyncHandler(async (req, res) => {
      const random = await generateId({multibase: false});
      const id = getNamespaceId({req, localId: random, routes});

      // create a namespace for the controller
      const {config} = await namespace.insert({config: {id, ...req.body}});
      res.status(201).location(id).json(config);
    }));
});
