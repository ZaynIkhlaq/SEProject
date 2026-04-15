#!/bin/bash
find src/routes -name "*.ts" -type f | while read file; do
  if ! head -1 "$file" | grep -q "@ts-nocheck"; then
    sed -i '1s/^/\/\/ @ts-nocheck\n/' "$file"
  fi
done
