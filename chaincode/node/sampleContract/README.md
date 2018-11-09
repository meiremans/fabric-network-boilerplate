## My nodejs chaincode

Vanilla Nodejs chaincode.
It uses fabric-shim so you can write tests.
It will save the Object "Entry" in the blockchain.

On initialization 3 objects will be saved.
You can run chaincode functions like this:

docker exec -e "CORE_PEER_LOCALMSPID=Org1MSP" -e "/opt/gopath/src/github.com/hyperledger/fabric/peer/crypto/peerOrganizations/org1.example.com/users/Admin@org1.example.com/msp" cli peer chaincode invoke -o orderer.example.com:7050 -C mychannel -n "samplechaincode" -c '{"function":"queryAllEntries","Args":[""]}'
