import { GenericJsNode } from './JsNode';
import * as js from './JsCode';

export function inferPropType(root: GenericJsNode, name: string) {
  // Assignments
  const assignments = root
    .findChildrenOfType(js.AssignmentExpression)
    .filter(node => node.left().findFirstChildOfType(js.MemberExpression) !== undefined)
    .toList();
  for (const assignment of assignments) {
    const type = inferPropTypeFromAssignment(assignment, name);
    if (type) {
      return type;
    }
  }
  // Binary expressions
  const binaryExpressions = root
    .findChildrenOfType(js.BinaryExpression)
    .toList();
  for (const expression of binaryExpressions) {
    const type = inferPropTypeBinaryExpression(expression, name);
    if (type) {
      return type;
    }
  }
}

/**
 * Reduces an AST node to a single type, if possible.
 */
export function resolveNodeToPropType(node: GenericJsNode) {
  if (node instanceof js.ArrayExpression) {
    return 'array';
  } else if (node instanceof js.Literal) {
    return typeof node.value;
  } else if (node instanceof js.ObjectExpression) {
    return 'object';
  } else if (node instanceof js.FunctionExpression) {
    return 'func';
  } else if (node instanceof js.NewExpression) {
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
        return property instanceof js.Literal;
      }, true);
    if (isArray) {
      return 'array';
    } else {
      return resolveNodeToPropType(assignment.right());
    }
  }
}

export function inferPropTypeBinaryExpression(expression: js.BinaryExpression, name: string) {
  if (expression.left().findFirstChildOfType(js.Identifier, id => id.name === name)) {
    return resolveNodeToPropType(expression.right());
  }
  return resolveNodeToPropType(expression.left());
}
