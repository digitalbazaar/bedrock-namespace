/*!
 * Copyright (c) 2020-2021 Digital Bazaar, Inc. All rights reserved.
 */

// FIXME: is this right? Why is the host coming from the request instead
// of the bedrock config?
export function getNamespaceId({host, req, localId, routes}) {
  if(!host) {
    host = req.get('host');
  }
  return `https://${host}${routes.basePath}/${localId}`;
}
