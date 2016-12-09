#Code Base

    fabric commit level: b0e902ea482a5dd4f5a82b8051052c2915811e59
    fabric-sdk-node: a7f57baca0ece7111f74f7b9174c2083df7cda86

#Create Network:

###Without CouchDB: 

####usage

    ./driver.sh <action>
       -action: create or add

#####create one orderer and two endorsors with cop

    ./driver.sh create

#####add an endorsor with cop

    ./driver.sh add

###with CouchDB:

####usage

    ./driver.sh <action> cdb
       -action: create or add

#####create one orderer and two endorsors with cop

    ./driver.sh create cdb

#####add an endorsor with cop

    ./driver.sh add cdb

#Transactions Execution

###setup
1. git clone https://github.com/hyperledger/fabric-sdk-node.git
2. follow the setup instructions in the fabric-sd-node
3. Download perf.js to $GOPATH/src/github.com/hyperledger/fabric-sdk-node/test/unit.

###usage

    node perf.js <transaction> <number>
       - transaction: the transaction type (deploy, invoke or query)
       - number: the number of the specified transaction to be executed, this number is 1 if transaction is deploy

#####deploy

    node perf.js deploy 1

The above command will deploy chaincode with initial value a=0 and b=0.

#####invoke

    node perf.js invoke 3

The above command will move 1 unit from a to b three (3) times.

#####query

    node perf.js query 3

The above command will query b three (3) times.  The query result is printed for the last query only.