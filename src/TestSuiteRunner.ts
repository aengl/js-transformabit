import * as fs from "fs";
import * as path from "path";
import {JsNode} from './JsNode';
import {Transformation} from './Transformation';
import {RenameVariable} from './transformations/RenameVariable';
import {CreateClassToComponent} from './transformations/CreateClassToComponent';
import {BindWebSocket} from './transformations/BindWebSocket';
import * as yaml from "js-yaml";

const inputRoot = path.join(__dirname, "../tests/inputs");

export class TestSuiteRunner {
  run(): void {
    let transformations = this.getTransformations();
    for (let transformation of transformations) {
      this.testTransformation(transformation);
    }
  }

  getTransformations(): Transformation[] {
    return [new RenameVariable(), new CreateClassToComponent(), new BindWebSocket()];
    // return [new RenameVariable(), new CreateClassToComponent()];
  }


  testTransformation(transformation: Transformation): void {
    const config = yaml.safeLoad(fs.readFileSync(`./tests/${transformation.constructor.name}/test.yml`).toString());
    for (let testCase in config) {
      this.testInput(transformation, testCase, config[testCase]);
    }
  }

  testInput(transformation: Transformation, testCaseName: string, config: any): void {
    const node = JsNode.fromModuleCode(fs.readFileSync(path.join(inputRoot, config.input)).toString());
    const name = transformation.constructor.name;

    transformation.configure(config.params);
    const checkWasTrue = transformation.check(node, null);

    if (config.output !== false && !checkWasTrue) {
      throw new Error(`Transformation '${name}' is not applicable to test case '${testCaseName}', but is expected to be`);
    } else if (config.output === false && checkWasTrue) {
      throw new Error(`Transformation '${name}' applied to '${testCaseName}', but is not expected to be`);
    }

    if (!checkWasTrue) {
      return;
    }

    const output: string = fs.readFileSync(`./tests/${name}/${config.output}`).toString();
    const result = transformation.apply(node, null).format();
    if (result !== output) {
      throw new Error(`Test case '${testCaseName}' failed for transformation '${name}', expecting:\n${output}\nreceived:\n${result}\n`);
    }
  }

}
