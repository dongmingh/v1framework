#!/bin/bash

#sanity check input args
InvaildArgs=0
if [ $# -gt 2 ] || [ $# -lt 1 ]; then
   echo "invalid arg #: $#"
   InvaildArgs=1
elif [ $1 != "create" ] && [ $1 != "add" ]; then
   echo "invalid arg: $1"
   InvaildArgs=1
fi

if [ $InvaildArgs == 1 ]; then
   echo ""
   echo "Usage: ./driver [create|add] [option: cdb]"
   echo "   environment with couchDB"
   echo "      ./driver.sh create cdb: create a network with 1 cop, 1 orderer, 2 peers, and 2 couchDB"
   echo "      ./driver.sh add cdb: add 1 peer and 1 couchDB to above network"
   echo "   environment without couchDB"
   echo "      ./driver.sh create cdb: create a network with 1 cop, 1 orderer, and 2 peers"
   echo "      ./driver.sh add cdb: add 1 peer to above network"
   echo ""
   exit
fi

#execute request
req=$1
if [ $# == 2 ]; then
    CDB=$2
else
    CDB="nocdb"
fi

if [ $CDB == "cdb" ]; then
   #with CouchDB
   jsonFILE="network-2peers_with_cdb.json"
   node json2yml.js $jsonFILE
   if [ $req == "create" ]; then
       echo "create network: cop, orderer, 2 peers with CouchDB"
       docker-compose -f docker-compose.yml up -d --force-recreate orderer couchdb0 couchdb1 vp0 vp1
   elif [ $req == "add" ]; then
       echo "add a peer to the network with CouchDB"
       docker-compose -f docker-compose.yml up -d couchdb2 vp2
   fi

elif [ $CDB == "nocdb" ]; then
   #without CouchDB
   jsonFILE="network-2peers_no_cdb.json"
   node json2yml.js $jsonFILE
   if [ $req == "create" ]; then
       echo "create network: cop, orderer, 2 peers"
       docker-compose -f docker-compose.yml up -d --force-recreate orderer vp0 vp1
   elif [ $req == "add" ]; then
       echo "add a peer to the network"
       docker-compose -f docker-compose.yml up -d vp2
   fi

fi

exit

