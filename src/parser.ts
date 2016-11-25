const jscodeshift: any = require('jscodeshift');

class ASTNode {
    _node: any;

    constructor(node: any) {
        this._node = node;
    }
}

namespace Parser {
    export function parse() {
        return jscodeshift;
    }
}
