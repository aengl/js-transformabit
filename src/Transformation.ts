import { GenericJsNode } from './JsNode';

export interface Transformation {
  configure?(...args: any[]): void;
  edit(root: GenericJsNode): GenericJsNode;
}

export type TransformationClass<T extends Transformation> = {
  new(): T
  name: string;
};
