The utility can either create a network with 1 cop, 1 orderer and the specified number of peers or add the specified number of peers to the existing network.


#Code Base

    fabric commit level: b0e902ea482a5dd4f5a82b8051052c2915811e59
    fabric-sdk-node: a7f57baca0ece7111f74f7b9174c2083df7cda86


#Usage

    ./driver.sh [action] [n] [option]

- action: create or add
 - create: to create a new network with n peers
 - add: to add n peers to the existing network
- n: number of peers to be created or added
- option: CouchDB option
 - cdb if CouchDB is needed
 - blank if no CouchDB

 
##Examples

###Without CouchDB: 

####example 1: create one cop, one orderer, and 2 peers (vp0 and vp1)

    ./driver.sh create 2

####example 2: create one cop, one orderer, and 4 peers (vp0, vp1, vp2, and vp3)

    ./driver.sh create 4


####example 3: add 2 peers (vp2, vp3) to the existing network with vp0 and vp1

    ./driver.sh add 2

####example 4: add 8 peers (vp2, ..., vp9) to the existing network with vp0 and vp1

    ./driver.sh add 8

###with CouchDB:

####example 5: create one cop, one orderer, and three peers (vp0, vp1 and vp2) with CouchDB

    ./driver.sh create 3 cdb

####example 6: add 5 peers (vp3, .., vp7) to the existing network with three peers (vp0, vp1 and vp2) with CouchDB

    ./driver.sh add 5 cdb



#Transactions Execution

###setup
1. git clone https://github.com/hyperledger/fabric-sdk-node.git
2. follow the setup instructions in the fabric-sd-node
3. git reset --hard a7f57baca0ece7111f74f7b9174c2083df7cda86
4. Download perf.js to $GOPATH/src/github.com/hyperledger/fabric-sdk-node/test/unit.

###usage

    node perf.js <transaction> <number>
       - transaction: the transaction type (deploy, invoke or query)
       - number: the number of the specified transaction to be executed for invoke and query

#####deploy

    node perf.js deploy

The above command will deploy chaincode with initial value a=0 and b=0.

#####invoke

    node perf.js invoke 3

The above command will move 1 unit from a to b three (3) times.

#####query

    node perf.js query 3

The above command will query b three (3) times.  The last query result is printed.