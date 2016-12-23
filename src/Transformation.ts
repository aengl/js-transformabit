import { GenericJsNode } from './JsNode';

export interface Transformation {
  configure(...args: any[]): void;
  check?(root: GenericJsNode): boolean;
  apply(root: GenericJsNode): GenericJsNode;
}

export type TransformationClass<T extends Transformation> = {
  new(): T
  name: string;
};
