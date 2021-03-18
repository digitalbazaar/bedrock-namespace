/*!
 * Copyright (c) 2020-2021 Digital Bazaar, Inc. All rights reserved.
 */
import bedrock from 'bedrock';
const {config} = bedrock;

// bedrock-namespace translates to namespace for the bedrock config
const namespace = 'namespace';
const cfg = config[namespace] = {};

const basePath = '/ns';
cfg.routes = {
  basePath,
  application: `${basePath}/:namespaceId/:application`,
};

cfg.applications = {};
