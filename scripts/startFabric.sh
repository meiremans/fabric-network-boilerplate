#!/bin/bash

# Exit on first error
set -e

LANGUAGE=NODE
CHAINCODE_NAME=samplechaincode
CHAINCODE_VERSION=1.0
SLEEPTIME=10
COREPEERMSPCONIGPATH=CORE_PEER_MSPCONFIGPATH=/opt/gopath/src/github.com/hyperledger/fabric/peer/crypto/peerOrganizations/org1.example.com/users/Admin@org1.example.com/msp
DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" && pwd )"


# don't rewrite paths for Windows Git Bash users
export MSYS_NO_PATHCONV=1
starttime=$(date +%s)

CC_SRC_PATH=/opt/gopath/src/github.com/chaincode/node/sampleContract
cd $DIR
cd ../chaincode/node/sampleContract/
npm install


# clean the keystore
rm -rf ./hfc-key-store

cd $DIR

# launch network; create channel and join peer to channel
cd ../basic-network
./start.sh

# Now launch the CLI container in order to install, instantiate chaincode
# and prime the ledger with our 10 cars
docker-compose -f ./docker-compose.yml up -d cli

docker exec -e "CORE_PEER_LOCALMSPID=Org1MSP" -e "${COREPEERMSPCONIGPATH}" cli peer chaincode install -n "${CHAINCODE_NAME}" -v "${CHAINCODE_VERSION}" -p "${CC_SRC_PATH}" -l "${LANGUAGE}"
docker exec -e "CORE_PEER_LOCALMSPID=Org1MSP" -e "${COREPEERMSPCONIGPATH}" cli peer chaincode instantiate -o orderer.example.com:7050 -C mychannel -n "${CHAINCODE_NAME}" -l "${LANGUAGE}" -v "${CHAINCODE_VERSION}" -c '{"function":"init","Args":["'${CHAINCODE_VERSION}'"]}' -P "OR ('Org1MSP.member','Org2MSP.member')" --collections-config ${CC_SRC_PATH}/collectionsConfig.json

CONTAINER_NAME="dev-peer0.org1.example.com-${CHAINCODE_NAME}"

CID=$(docker ps -q -f status=running -f name=^/${CONTAINER_NAME})

while [ ! "${CID}" ]; do
    CID=$(docker ps -q -f status=running -f name=^/${CONTAINER_NAME})
    echo "$CONTAINER_NAME not found";
    sleep ${SLEEPTIME};
done;

sleep ${SLEEPTIME};

docker exec -e "CORE_PEER_LOCALMSPID=Org1MSP" -e "${COREPEERMSPCONIGPATH}" cli peer chaincode invoke -o orderer.example.com:7050 -C mychannel -n "${CHAINCODE_NAME}" -c '{"function":"initLedger","Args":[""]}'

sleep ${SLEEPTIME};

#We query all entries. If this returns a result we are sure everything is working fine
docker exec -e "CORE_PEER_LOCALMSPID=Org1MSP" -e "${COREPEERMSPCONIGPATH}" cli peer chaincode invoke -o orderer.example.com:7050 -C mychannel -n "${CHAINCODE_NAME}" -c '{"function":"queryAllEntries","Args":[""]}'

printf "\nTotal setup execution time : $(($(date +%s) - starttime)) secs ...\n\n\n"