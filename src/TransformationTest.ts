import * as fs from 'fs';
import * as path from 'path';
import { JsNode } from './JsNode';
import { Transformation, TransformationClass } from './Transformation';
import * as yaml from 'js-yaml';

export class TransformationTest {
  private transformation: TransformationClass<any>;
  private root: string;
  private inputRoot: string;

  constructor(transformation: TransformationClass<any>, testRoot: string, inputRoot?: string) {
    this.transformation = transformation;
    this.root = path.resolve(testRoot);
    this.inputRoot = inputRoot ?
      path.resolve(inputRoot) :
      path.resolve(path.join(this.root, 'inputs'));
  }

  run(): void {
    const transformation = new this.transformation();
    const config = yaml.safeLoad(fs.readFileSync(path.join(
      this.root, transformation.constructor.name, 'test.yml')).toString());
    for (let testCase in config) {
      this.testInput(transformation, testCase, config[testCase]);
    }
  }

  testInput(transformation: Transformation, testCaseName: string, config: any): void {
    const node = JsNode.fromModuleCode(fs.readFileSync(
      path.join(this.inputRoot, config.input)).toString());
    const name = transformation.constructor.name;

    transformation.configure(config.params);
    // const checkWasTrue = transformation.check(node);

    // if (config.output !== false && !checkWasTrue) {
    //   throw new Error(`Transformation '${name}' is not applicable to test case ` +
    //     `'${testCaseName}', but is expected to be`);
    // } else if (config.output === false && checkWasTrue) {
    //   throw new Error(`Transformation '${name}' applied to '${testCaseName}', ` +
    //     `but is not expected to be`);
    // }

    // if (checkWasTrue) {
      const output: string = fs.readFileSync(
        `./tests/${name}/${config.output}`).toString();
      const result = transformation.edit(node).format();
      if (result !== output) {
        throw new Error(`Test case '${testCaseName}' failed for transformation ` +
          `'${name}', expecting:\n${output}\nreceived:\n${result}\n`);
      }
    // }
  }
}
