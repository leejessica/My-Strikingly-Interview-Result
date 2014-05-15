#!/bin/bash
for i in $(seq 1 100)
do
  echo "No." $i
  node ./app.js
  echo "======================="
  echo 3 > /proc/sys/vm/drop_caches
done
