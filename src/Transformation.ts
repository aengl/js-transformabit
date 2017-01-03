import { File } from './JsCode';

export interface TransformationParams {
  [param: string]: string;
}

export interface Transformation {
  editModule(file: File, params: TransformationParams): File;
}

export type TransformationClass<T extends Transformation> = {
  new(): T
  name: string;
};
