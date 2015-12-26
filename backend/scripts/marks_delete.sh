#!/bin/bash -e
# This script deletes files marked as so in marks.txt by photo_mark.php

marks_compact.sh

IFS=$'\n'
for line in `grep ' delete$' marks.txt`; do
  file=${line% delete}
  real_file=${file/%.CR2.jpg/.CR2}
  real_file=${real_file/%.cr2.jpg/.cr2}

  if [ -e $real_file ]; then
    eog "$real_file"
  else
    echo "$real_file already deleted, removing"
    sed -i "/${real_file//\//\\/}/d" marks.txt
  fi
done
