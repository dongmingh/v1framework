/**
 * Copyright 2016 IBM All Rights Reserved.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *    http://www.apache.org/licenses/LICENSE-2.0
 *
 *  Unless required by applicable law or agreed to in writing, software
 *  distributed under the License is distributed on an "AS IS" BASIS,
 *  WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 *  See the License for the specific language governing permissions and
 *  limitations under the License.
 */

/*
 *  usage:
 *     node perf.js <transaction> <number>
 *       - transdaction: the transction type: deploy, invoke, or query
 *       - number: the number of transaction to be executed, the number is 1 if transaction is deploy
 *
 */
// This is an end-to-end test that focuses on exercising all parts of the fabric APIs
// in a happy-path scenario
'use strict';

var tape = require('tape');
var _test = require('tape-promise');
var test = _test(tape);

var path = require('path');

var hfc = require('../..');
var util = require('util');
var grpc = require('grpc');
var testUtil = require('./util.js');
var utils = require('../../lib/utils.js');

var chain = hfc.newChain('testChain-e2e');
var webUser;
var t_start;
var i = 0;
var chaincode_id = 'mycc1';

testUtil.setupChaincodeDeploy();

// need to override the default key size 384 to match the member service backend
// otherwise the client will not be able to decrypt the enrollment challenge
utils.setConfigSetting('crypto-keysize', 256);

// need to override the default hash algorithm (SHA3) to SHA2 (aka SHA256 when combined
// with the key size 256 above), in order to match what the peer and COP use
utils.setConfigSetting('crypto-hash-algo', 'SHA2');

chain.setKeyValueStore(hfc.newKeyValueStore({
	path: testUtil.KVS
}));

chain.setMemberServicesUrl('http://10.120.223.35:8888');
chain.setOrderer('grpc://10.120.223.35:5151');
var g = ['grpc://10.120.223.35:7051', 'grpc://10.120.223.35:7052', 'grpc://10.120.223.35:7053'];
var grpcArgs = [];
for (i=0; i<3; i++) {
    grpcArgs.push(hfc.getPeer(g[i]));
}

var transType = process.argv[2];
var nTrans;
if ( transType.toUpperCase() == 'DEPLOY' ) {
    nTrans = 1;
} else {
    nTrans = parseInt(process.argv[3]);
}
console.log('transType: %s, nTrans: %d', transType, nTrans);


var request_deploy = {
    targets: grpcArgs,
    chaincodePath: testUtil.CHAINCODE_PATH,
    chaincodeId: chaincode_id,
    fcn: 'init',
    args: ['a', '0', 'b', '0'],
    'dockerfile-contents' :
    'from hyperledger/fabric-ccenv\n' +
    'COPY . $GOPATH/src/build-chaincode/\n' +
    'WORKDIR $GOPATH\n\n' +
    'RUN go install build-chaincode && mv $GOPATH/bin/build-chaincode $GOPATH/bin/%s'
};

var request_invoke = {
    targets: grpcArgs,
    chaincodeId : chaincode_id,
    fcn: 'invoke',
    args: ['move', 'a', 'b','1']
};

var request_query = {
    targets: grpcArgs,
    chaincodeId : chaincode_id,
    fcn: 'invoke',
    args: ['query','b']
};


// test begins ....
simple_test();

//deploy test
function deploy_test() {

    webUser.sendDeploymentProposal(request_deploy)
    .then(
        function(results) {
            var proposalResponses = results[0];
            //console.log('proposalResponses:'+JSON.stringify(proposalResponses));
            var proposal = results[1];
            if (proposalResponses && proposalResponses[0].response && proposalResponses[0].response.status === 200) {
                console.log(util.format('Successfully sent Proposal and received ProposalResponse: Status - %s, message - "%s", metadata - "%s", endorsement signature: %s', proposalResponses[0].response.status, proposalResponses[0].response.message, proposalResponses[0].response.payload, proposalResponses[0].endorsement.signature));
                return webUser.sendTransaction(proposalResponses, proposal);
            } else {
                console.log('Failed to send Proposal or receive valid response. Response null or status is not 200. exiting...' );
            }
        },
        function(err) {
            console.log('Failed to send deployment proposal due to error: ', err.stack ? err.stack : err);
        })
    .then(
        function(response) {
            if (response.Status === 'SUCCESS') {
                console.log('Successfully ordered deployment endorsement.' );
                console.log('need to wait now for the committer to catch up' );
                return sleep(20000);
            } else {
                console.log('Failed to order the deployment endorsement. Error code: ', response.status);
            }

        },
        function(err) {
            console.log('Failed to send deployment e due to error: ', err.stack ? err.stack : err);
        }
    );
}

// invoke_test
function invoke_test() {
    i++;
    t_start = new Date().getTime();
    console.log('invoke_test: ', i, t_start);

    webUser.sendTransactionProposal(request_invoke)
    .then(
        function(results) {
        var proposalResponses = results[0];
        var proposal = results[1];
            if (proposalResponses[0].response.status === 200) {
                webUser.sendTransaction(proposalResponses, proposal);
                //console.log('Successfully obtained transaction endorsement.' + JSON.stringify(proposalResponses));
                if ( i < nTrans ) {
                    setTimeout(function(){
                        invoke_test();
                    },20000);
                } else {
                    console.log('invoke_test completed');
                    return
                }
            } else {
                console.log('Failed to obtain transaction endorsement. Error code: ' + status);
                process.exit();
            }
        },
        function(err) {
            console.log('Failed to send transaction proposal due to error: ' + err.stack ? err.stack : err);
            process.exit();
        }
    );
}


// query_test
function query_test() {
    i++;
    t_start = new Date().getTime();
    console.log('query_test: ', t_start);

    webUser.queryByChaincode(request_query)
    .then(
        function(response_payloads) {
            if ( i < nTrans ) {
                query_test();
            } else {
                for(let i = 0; i < response_payloads.length; i++) {
                    console.log('query result:', response_payloads[i].toString('utf8'));
                }
                console.log('query_test completed' );
            }
        },
        function(err) {
            console.log('Failed to send query due to error: ' + err.stack ? err.stack : err);
            process.exit();
        }
    ).catch(
        function(err) {
        console.log('Failed to end to end test with error:' + err.stack ? err.stack : err);
        process.exit();
        }
    );

}

function simple_test() {
    i = 0;
    chain.enroll('sdk', 'sdkpw')
    .then(
        function(admin) {
            console.log('Successfully enrolled user \'admin\'');
            webUser = admin;

            // send proposal to endorser
            if ( transType.toUpperCase() == 'DEPLOY' ) {
                deploy_test();
            } else if ( transType.toUpperCase() == 'INVOKE' ) {
                invoke_test();
            } else if ( transType.toUpperCase() == 'QUERY') {
                query_test();
            }
        },
        function(err) {
            console.log('Failed to wait due to error: ' + err.stack ? err.stack : err);
            process.exit();
        }
    );
}

function sleep(ms) {
	return new Promise(resolve => setTimeout(resolve, ms));
}

