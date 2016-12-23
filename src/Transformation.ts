import { GenericJsNode } from './JsNode';

export interface Transformation {
  configure(...args: any[]): void;
  check?(root: GenericJsNode, project: any): boolean;
  apply(root: GenericJsNode, project: any): GenericJsNode;
}

export type TransformationClass<T extends Transformation> = {
  new(): T
  name: string;
};
