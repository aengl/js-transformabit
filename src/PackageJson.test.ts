import { PackageJson } from './PackageJson';

const testPackage = `{
  "name": "test",
  "version": "0.1.0",
  "description": "Test.",
  "dependencies": {
    "js-transformabit": "^0.5.0"
  },
  "devDependencies": {
    "@types/node": "^7.0.0",
    "typescript": "^2.1.5"
  }
}`;

describe('PackageJson', () => {
  it('parse', () => {
    const pkg = PackageJson.fromString(testPackage);
    expect(pkg.name).toBe('test');
  });

  it('format', () => {
    expect(PackageJson.fromString(testPackage).format()).toBe(testPackage);
  });

  it('read and write basic fields', () => {
    const pkg = PackageJson.fromString(testPackage);
    pkg.name = 'foo';
    expect(pkg.name).toBe('foo');
  });

  it('has dependency', () => {
    const pkg = PackageJson.fromString(testPackage);
    expect(pkg.hasDependency('typescript')).toBe(true);
    expect(pkg.hasDependency('typescript', false)).toBe(false);
    expect(pkg.hasDependency('js-transformabit')).toBe(true);
  });

  it('get dependency version', () => {
    const pkg = PackageJson.fromString(testPackage);
    expect(pkg.getDependencyVersion('typescript')).toBe('^2.1.5');
    expect(pkg.getDependencyVersion('js-transformabit')).toBe('^0.5.0');
  });

  it('add dependency', () => {
    const pkg = PackageJson.fromString(testPackage);
    pkg.addDependency('foo', '1.0.0');
    pkg.addDependency('bar', '1.0.0', true);
    expect(pkg.hasDependency('foo')).toBe(true);
    expect(pkg.hasDependency('bar')).toBe(true);
    expect(pkg.hasDependency('bar', false)).toBe(false);
    expect(pkg.getDependencyVersion('foo')).toBe('1.0.0');
  });
});
