#!/bin/bash
# mongo2 is the primary node but the other 2 nodes are secondary
mongosh <<EOF
rs.initiate({
  _id: "rs0",
  members: [
    { _id: 0, host: "mongo1:27017", priority: 1 },
    { _id: 1, host: "mongo2:27017", priority: 2 },
    { _id: 2, host: "mongo3:27017", priority: 1 }
  ]
});
EOF