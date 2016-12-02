import * as fs from "fs";
import * as path from "path";
import { JsNode, GenericJsNode } from './jsnode';
import {Transformation} from './Transformation';
import {RenameVariable} from './RenameVariable';
import * as yaml from "js-yaml";

const inputRoot = path.join(__dirname, "../tests/inputs");

export class TestSuiteRunner {

  constructor() {

  }

  run(): void {
    let transformations = this.getTransformations();
    let transformationNames = transformations.map((t: Transformation) => t.constructor.name);
    for (let transformation of transformations) {
      this.testTransformation(transformation);
    }
  }


  getTransformations(): Transformation[] {
    return [new RenameVariable()];
  }


  testTransformation(transformation: Transformation): void {
    const config = yaml.safeLoad(fs.readFileSync(`./tests/${transformation.constructor.name}/test.yml`).toString());
    const inputs = fs.readdirSync(inputRoot);
    inputs.forEach(inputFile => this.testInput(transformation, inputFile, config));

  }

  testInput(transformation: Transformation, inputFile: string, config: any): void {
    const node = JsNode.fromModuleCode(fs.readFileSync(path.join(inputRoot, inputFile)).toString());

    transformation.configure(config[inputFile].config);
    const checkWasTrue = transformation.check(node, null);

    if (!config[inputFile].expect && checkWasTrue) {
      throw new Error(`Transformation should not have approved of ${inputFile}`);
    }

    if (!checkWasTrue) {
      return;
    }

    const output: string = fs.readFileSync(`./tests/${transformation.constructor.name}/${config[inputFile].expect}`).toString();
    const result = transformation.apply(node, null).format();
    if (result !== output) {
      throw new Error(`Output did not match, expecting:\n${output}\nreceived:\n${result}\n`);
    }
  }

}
