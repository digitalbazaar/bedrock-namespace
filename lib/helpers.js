/*!
 * Copyright (c) 2020-2021 Digital Bazaar, Inc. All rights reserved.
 */
import bedrock from 'bedrock';

const {config} = bedrock;
const {namespace: {routes}} = config;

export function getNamespaceId({localId}) {
  return `${config.server.baseUri}${routes.basePath}/${localId}`;
}
