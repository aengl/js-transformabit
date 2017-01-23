/**
 * Simplifies reading and editing of package.json files.
 */

export type Dependency = {
  [name: string]: string;
};

export type Package = {
  name: string;
  version: string;
  description: string;
  dependencies: Dependency[];
  devDependencies: Dependency[];
  [name: string]: any;
};

export class PackageJson {
  contents: Package;

  static fromString(s: string) {
    return new PackageJson(JSON.parse(s));
  }

  constructor(contents: Package) {
    this.contents = contents;
  }

  get name() {
    return this.contents.name;
  }

  set name(value: string) {
    this.contents.name = value;
  }

  format() {
    return JSON.stringify(this.contents, undefined, 2);
  }

  hasDependency(name: string, includeDevDependencies = true) {
    let found = Object.keys(this.contents.dependencies).indexOf(name) >= 0;
    if (!found && includeDevDependencies) {
      found = Object.keys(this.contents.devDependencies).indexOf(name) >= 0;
    }
    return found;
  }

  getDependencyVersion(name: string): string {
    return this.contents.dependencies[name] || this.contents.devDependencies[name];
  }

  addDependency(name: string, version: string, isDevDependency = false) {
    if (isDevDependency) {
      this.contents.devDependencies[name] = version;
    } else {
      this.contents.dependencies[name] = version;
    }
  }
}
