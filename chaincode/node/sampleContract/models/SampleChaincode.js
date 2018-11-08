'use strict';
const shim = require('fabric-shim');
const Entry = require('./Entry');

let Chaincode = class {

    // The Init method is called when the Smart Contract 'SampleChaincode' is instantiated by the blockchain network
    // Best practice is to have any Ledger initialization in separate function -- see initLedger()
    async Init(stub) {
        console.info('=========== Instantiated Sample chaincode ===========');
        return shim.success();
    }

    // The Invoke method is called as a result of an application request to run the Smart Contract
    // 'entryStore'. The calling application program has also specified the particular smart contract
    // function to be called, with arguments
    async Invoke(stub) {
        let ret = stub.getFunctionAndParameters();
        console.info(ret);

        let method = this[ret.fcn];
        if (!method) {
            console.error('no function of name:' + ret.fcn + ' found');
            throw new Error('Received unknown function ' + ret.fcn + ' invocation');
        }
        try {
            let payload = await method(stub, ret.params);
            return shim.success(payload);
        } catch (err) {
            console.log(err);
            return shim.error(err);
        }
    }

    async checkIfEntryExists(stub,args){
        if (args.length !== 1) {
            throw new Error('Incorrect number of arguments. Expecting EntryIdentifier ex: ENTRY1');
        }
        let entryNumber = args[0];
        let entryAsBytes = await stub.getState(entryNumber); //get the entry from chaincode state
        if (!entryAsBytes || entryAsBytes.toString().length <= 0) {
            return 0;//boolean as byte
        }else{
            return 1; //boolean as byte
        }
    }

    async queryEntry(stub, args) {
        if (args.length !== 1) {
            throw new Error('Incorrect number of arguments. Expecting EntryNumber ex: ENTRY1');
        }
        let entryNumber = args[0];

        let entryAsBytes = await stub.getState(entryNumber); //get the entry from chaincode state
        if (!entryAsBytes || entryAsBytes.toString().length <= 0) {
            let buffer = Buffer.from('EONT');
            return buffer;
        }
        console.log(entryAsBytes.toString());
        return entryAsBytes;
    }

    async initLedger(stub, args) {
        console.info('============= START : Initialize Ledger ===========');
        let entries = [];

        entries.push(new Entry('First DATA!','Inserted first on Initialization'));
        entries.push(new Entry('Second DATA!','Inserted second on Initialization'));
        entries.push(new Entry('Third DATA!','Inserted third on Initialization'));

        for (let i = 0; i < entries.length; i++) {
            await stub.putState(Entry.generateKeyByNumber(i), Buffer.from(JSON.stringify(entries[i].propsToValue())));
            console.info('Added <--> ', entries[i]);
        }
        console.info('============= END : Initialize Ledger ===========');
    }

    async createEntry(stub, args) {
        console.info('============= START : Create Entry ===========');
        if (args.length != 3) {
            throw new Error('Incorrect number of arguments. Expecting 3');
        }

        var entry = {
            docType: 'entry',
            data: args[1],
            metadata: args[2]
        };
        await stub.putState(Entry.generateKeyByNumber(args[0]), Buffer.from(JSON.stringify(entry)));
        console.info('============= END : Create Entry ===========');
    }

    async queryAllEntries(stub, args) {

        let startKey = 'ENTRY0';
        let endKey = 'ENTRY999';

        let iterator = await stub.getStateByRange(startKey, endKey);

        let allResults = [];
        while (true) {
            let res = await iterator.next();

            if (res.value && res.value.value.toString()) {
                let jsonRes = {};
                console.log(res.value.value.toString('utf8'));

                jsonRes.Key = res.value.key;
                try {
                    jsonRes.Record = JSON.parse(res.value.value.toString('utf8'));
                } catch (err) {
                    console.log(err);
                    jsonRes.Record = res.value.value.toString('utf8');
                }
                allResults.push(jsonRes);
            }
            if (res.done) {
                console.log('end of data');
                await iterator.close();
                console.info(allResults);
                return Buffer.from(JSON.stringify(allResults));
            }
        }
    }

    async changeEntryMetadata(stub, args) {
        console.info('============= START : changeEntryMetadata ===========');
        if (args.length != 2) {
            throw new Error('Incorrect number of arguments. Expecting 2');
        }

        let entryAsBytes = await stub.getState(args[0]);
        let entry = JSON.parse(entryAsBytes);
        entry.metadata = args[1];

        await stub.putState(args[0], Buffer.from(JSON.stringify(entry)));
        console.info('============= END : changeEntryMetadata ===========');
    }
};

function convertStringToByte(input){
    let myBuffer = [];
    let str = input;
    let buffer = new Buffer(str, 'utf16le');
    for (let i = 0; i < buffer.length; i++) {
        myBuffer.push(buffer[i]);
    }
    return myBuffer;
}

module.exports = Chaincode;