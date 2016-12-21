import * as fs from 'fs';
import * as path from 'path';
import { JsNode } from './JsNode';
import { Transformation, TransformationClass } from './Transformation';
import * as yaml from 'js-yaml';

export class TestSuiteRunner {
  private root: string;
  private inputRoot: string;
  private transformations: TransformationClass<any>[];

  constructor(testRoot: string, inputRoot: string, transformations: TransformationClass<any>[]) {
    this.root = path.resolve(testRoot);
    this.inputRoot = path.resolve(inputRoot);
    this.transformations = transformations;
  }

  run(): void {
    for (const t of this.transformations) {
      this.testTransformation(new t());
    }
  }

  testTransformation(transformation: Transformation): void {
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
    const checkWasTrue = transformation.check(node, null);

    if (config.output !== false && !checkWasTrue) {
      throw new Error(`Transformation '${name}' is not applicable to test case ` +
        `'${testCaseName}', but is expected to be`);
    } else if (config.output === false && checkWasTrue) {
      throw new Error(`Transformation '${name}' applied to '${testCaseName}', ` +
        `but is not expected to be`);
    }

    if (checkWasTrue) {
      const output: string = fs.readFileSync(
        `./tests/${name}/${config.output}`).toString();
      const result = transformation.apply(node, null).format();
      if (result !== output) {
        throw new Error(`Test case '${testCaseName}' failed for transformation ` +
          `'${name}', expecting:\n${output}\nreceived:\n${result}\n`);
      }
    }
  }
}
