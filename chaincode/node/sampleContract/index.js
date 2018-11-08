'use strict';
const shim = require('fabric-shim');
const ChainCode = require('./models/SampleChaincode');

shim.start(new ChainCode());
