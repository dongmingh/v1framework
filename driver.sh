#!/bin/bash

#sanity check input args
InvaildArgs=0
if [ $# -gt 3 ] || [ $# -lt 2 ]; then
   echo "invalid arg #: $#"
   InvaildArgs=1
elif [ $1 != "create" ] && [ $1 != "add" ]; then
   echo "invalid arg: $1"
   InvaildArgs=1
fi

if [ $InvaildArgs == "1" ]; then
   echo ""
   echo "Usage: ./driver [create|add] [number of peer] [option: cdb]"
   echo "   environment with couchDB"
   echo "      ./driver.sh create n cdb: create a network with 1 cop, 1 orderer, n peers (vp0, ..., vp(n-1)), and n couchDB (couchdb0, ..., couchdb(n-1))"
   echo "       ex. ./driver.sh create 2 cdb: create a network of 1 cop, 1 orderer, 2 peers (vp0, vp1) and 2 couchDB (couchdb0, couchdb1)"
   echo "      ./driver.sh add m cdb: add peers vpn, ..., vp(m-1) and couchdbn, ..., couchdb(m-1) to the above network"
   echo "       ex. ./driver.sh add 2 cdb: add 2 peers and 2 couchdb to the network"
   echo "   environment without couchDB"
   echo "      ./driver.sh create n: create a network with 1 cop, 1 orderer, n peers (vp0, ..., vp(n-1))"
   echo "       ex. ./driver.sh create 2: create a network of 1 cop, 1 orderer, 2 peers (vp0, vp1)"
   echo "      ./driver.sh add n: add n peers to the network"
   echo "      ex. ./driver.sh add 4: add 4 peers to the network"
   echo ""
   exit
fi

VP=`docker ps -a | grep 'peer node start' | wc -l`
echo "VP $VP"


req=$1
nVP=$2

echo "remove old docker-composer.yml"
rm -f docker-compose.yml

# input option CDB
   if [ $# == 3 ]; then
       CDB=$3
   else
       CDB="nocdb"
   fi

   if [ $CDB == "cdb" ]; then
       jsonFILE="network_with_cdb.json"
   else
       jsonFILE="network_no_cdb.json"
   fi

  N=$[nVP+VP-1]
#echo "N $N"
# create yml
#echo "jsonFile $jsonFILE"
node json2yml.js $jsonFILE $N
VPN="vp"$N

# create/add network
if [ $req == "create" ]; then
       docker-compose -f docker-compose.yml up -d --force-recreate $VPN 
elif [ $req == "add" ]; then
       docker-compose -f docker-compose.yml up -d $VPN
fi

exit
