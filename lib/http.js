/*!
 * Copyright (c) 2020-2021 Digital Bazaar, Inc. All rights reserved.
 */
import {asyncHandler} from 'bedrock-express';
import bedrock from 'bedrock';
import namespace from './namespace.js';
import {generateId} from 'bnid';
import {getNamespaceId} from './helpers.js';
import {ZcapClient} from 'ezcap';
import {keys} from 'bedrock-app-key';
import {agent} from 'bedrock-https-agent';

const {util: {BedrockError}} = bedrock;

const {config} = bedrock;

bedrock.events.on('bedrock-express.configure.routes', app => {
  const {routes} = config.namespace;
  app.post(
    routes.basePath,
    // TODO: add validation
    asyncHandler(async (req, res) => {
      const random = await generateId({multibase: false});
      const id = getNamespaceId({localId: random});

      const {capabilityDelegationKey, capabilityInvocationKey} = keys;

      const invocationSigner = capabilityInvocationKey.signer();
      const delegationSigner = capabilityDelegationKey.signer();

      // FIXME: manually adding id here because of
      // https://github.com/digitalbazaar/http-signature-zcap-invoke/issues/17
      invocationSigner.id = capabilityInvocationKey.id;
      delegationSigner.id = capabilityDelegationKey.id;

      const {body: {zcap}} = req;
      const {invocationTarget} = zcap;

      const zcapClient = new ZcapClient({
        agent,
        baseUrl: invocationTarget,
        // didDocument,
        // keyPairs
        delegationSigner,
        invocationSigner,
      });

      // FIXME: determine what the payload is here
      const response = await zcapClient.write({
        url: '/',
        capability: zcap,
        json: {},
      });

      // FIXME: work on getting zcapClient to return response.data as with
      // http-client. This has to do with how zcapClient is using http-client
      // internally.
      const {success} = await response.json();
      if(!success) {
        // FIXME: make a good error
        throw new Error('Unable to invoke the provided zcap.');
      }

      // create a namespace for the controller
      const {config} = await namespace.insert({config: {id, ...req.body}});
      res.status(201).location(id).json(config);
    }));

  app.use(routes.application, asyncHandler(async (req, res, next) => {
    const {params: {namespaceId, application}} = req;
    const id = getNamespaceId({localId: namespaceId});

    const {config: namespaceConfig, meta} = await namespace.get({id});

    if(meta.status !== 'active') {
      throw new BedrockError(
        'The namespace is not active.', 'NotAllowedError', {
          httpStatusCode: 403,
          public: true,
          namespaceId: id,
        });
    }

    req.namespace = {
      config: namespaceConfig,
      id,
    };

    const app = config.namespace.applications[application];
    if(!app) {
      // let default error handlers take over
      return next();
    }

    return app(req, res, next);
  }));
});
