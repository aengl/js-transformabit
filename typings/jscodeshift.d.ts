/**
 * Type declarations for jscodeshift.
 *
 * https://github.com/facebook/jscodeshift
 */

/// <reference path="jscodeshift-collection.d.ts" />

declare module 'jscodeshift' {
  import { Collection, ConvertibleToCollection } from 'jscodeshift-collection';

  interface Core {
    (obj: ConvertibleToCollection, options?: Object): Collection;
  }

  var core: Core;

  export = core;
}
