#!/bin/sh

mkdir node_modules/@types
mkdir node_modules/@types/ast-types
cp typings/ast-types.d.ts node_modules/@types/ast-types/index.d.ts
mkdir node_modules/@types/jscodeshift
cp typings/jscodeshift.d.ts node_modules/@types/jscodeshift/index.d.ts
