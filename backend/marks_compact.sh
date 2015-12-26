#!/bin/bash -e
# This script removes umarked lines from marks.txt (starting with -)

declare -A lines

IFS=$'\n'
for line in `cat marks.txt`; do
  if [ ${line:0:1} == '-' ]; then
    lines[${line:1}]=0
  else
    lines[$line]=1
  fi
done

mv marks.txt marks.txt~
touch marks.txt
chmod 777 marks.txt

for line in "${!lines[@]}"
do
  if [ ${lines[$line]} == 1 ]; then
    echo $line >> marks.txt
  fi
done

wc -l marks.txt marks.txt~

