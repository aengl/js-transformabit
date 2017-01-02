import { GenericJsNode } from './JsNode';
import * as js from './JsCode';

export function inferPropType(root: GenericJsNode, name: string) {
  let assignments = root
    .findChildrenOfType(js.AssignmentExpression)
    .filter(node => node.left().findFirstChildOfType(js.MemberExpression) !== undefined)
    .map(node => node) as js.AssignmentExpression[];
  for (let assignment of assignments) {
    const type = inferPropTypeFromAssignment(assignment, name);
    if (type) {
      return type;
    }
  }
}

/**
 * Reduces an AST node to a single type, if possible.
 */
export function resolveNodeToPropType(node: GenericJsNode) {
  if (node.check(js.ArrayExpression)) {
    return 'array';
  } else if (node.check(js.Literal)) {
    return typeof node.value;
  } else if (node.check(js.ObjectExpression)) {
    return 'object';
  } else if (node.check(js.FunctionExpression)) {
    return 'func';
  } else if (node.check(js.NewExpression)) {
    return `instanceOf(${node.findFirstChildOfType(js.Identifier).name})`;
  }
}

export function inferPropTypeFromAssignment(assignment: js.AssignmentExpression, name: string) {
  const assignmentIdentifier = assignment.left()
    .findFirstChildOfType(js.Identifier, node => node.name === name);
  if (assignmentIdentifier) {
    const isArray = assignment.left()
      .findFirstChildOfType(js.MemberExpression, node => {
        const property = node.property();
        return property.check(js.Literal);
      }, true);
    if (isArray) {
      return 'array';
    } else {
      return resolveNodeToPropType(assignment.right());
    }
  }
}

export function inferPropTypeBinaryExpression(assignment: js.BinaryExpression, name: string) {
}
