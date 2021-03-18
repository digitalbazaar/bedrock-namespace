/*
 * Copyright (c) 2020-2021 Digital Bazaar, Inc. All rights reserved.
 */
'use strict';

const bedrock = require('bedrock');
const {httpClient} = require('@digitalbazaar/http-client');
const {agent} = require('bedrock-https-agent');

const nsBaseUrl = `${bedrock.config.server.baseUri}/ns`;

describe('namespace HTTP insert API', () => {
  it('should create a namespace', async () => {
    const controller = 'urn:uuid:a2a530e9-788b-4e7d-ad5e-865bc4078ef8';

    const zcap = {
      id: 'urn:uuid:011d784b-19ba-4a80-9cb3-bb1c2749148c',
    };

    const config = {
      controller,
      sequence: 0,
      zcap,
    };

    let err;
    let result;
    try {
      result = await httpClient.post(nsBaseUrl, {
        agent,
        json: config,
      });

    } catch(e) {
      err = e;
    }
    assertNoError(err);
    should.exist(result);
    result.data.should.have.keys(['controller', 'id', 'sequence', 'zcap']);
    result.data.controller.should.equal(controller);
    result.data.sequence.should.equal(0);
    result.data.id.should.be.a('string');
    result.data.zcap.should.eql(zcap);
  });
});
