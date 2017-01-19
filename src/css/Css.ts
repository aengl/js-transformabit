import { css } from '../../deps/bundle';

export class StyleSheet {


  private css: any;
  constructor(cssContent: string) {
    this.css = css.parse(cssContent);
  }

  getRules(): Rule[] {
    let rules = new Array<Rule>();
    for (const rule of this.css.stylesheet.rules) {
      rules.push(new Rule(rule));
    }
    return rules;
  }

  addRule(rule: Rule) {
    this.css.stylesheet.rules.push(rule.object);
  }

  toString(): string {
    return css.stringify(this.css);
  }

  toSlimString(): string {
    return this.toString().replace(/\n([\s]*)/g, "");
  }
}


export class Rule {

  private ruleObj: any;
  constructor(obj: any) {
    this.ruleObj = obj;
  }

  get object() {
    return this.ruleObj;
  }

  static build(selectors: Selector[], declarations: Declaration[]): Rule {
    return new Rule({
      "type": "rule",
      "selectors": selectors.map(selector => selector.toString()),
      "declarations": declarations.map(dec => dec.object)
    });
  }

  getSelectors(): Selector[] {
    return this.ruleObj.selectors.map(selector => new Selector(selector));
  }

  getDeclarations(): Declaration[] {
    return this.ruleObj.declarations.map(dec => new Declaration(dec));
  }

  getDelcaration(property: string): Declaration {
    return this.getDeclarations().filter(dec => dec.getProperty() === property)[0];
  }

  hasDeclaration(property: string): boolean {
    return this.getDeclarations().filter(dec => dec.getProperty() === property).length !== 0;
  }

  addDeclaration(declaration: Declaration) {
    this.ruleObj.declarations.push(declaration.object);
  }

  addCustomDeclaration(property: string, value: string) {
    this.ruleObj.declarations.push(Declaration.custom(property, value).object);
  }
}

export class Declaration {
  private declarationObj: any;
  constructor(obj: any) {
    this.declarationObj = obj;
  }

  static custom(property: string, value: string): Declaration {
    return new Declaration({
      "type": "declaration",
      "property": property,
      "value": value
    });
  }

  get object() {
    return this.declarationObj;
  }

  getProperty(): string {
    return this.declarationObj.property;
  }

  getValue(): string {
    return this.declarationObj.value;
  }
}

export class Selector {
  private value: string;
  constructor(value: string) {
    this.value = value;
  }

  toString(): string {
    return this.value;
  }

  isHtmlElement(): boolean {
    return htmlElements.filter(element => element === this.value).length !== 0;
  }

  isClassSelector(): boolean {
    return this.value.indexOf(".") === 0;
  }

  isIdSelector(): boolean {
    return this.value.indexOf("#") === 0;
  }

  getSubject(): string {
    if (this.isHtmlElement()) {
      return this.value;
    }
    return this.value.substr(1);
  }
}

const htmlElements = [
      'a',
'abbr',
'acronym',
'address',
'applet',
'area',
'article',
'aside',
'audio',
'b',
'base',
'basefont',
'bdi',
'bdo',
'big',
'blockquote',
'body',
'br',
'button',
'canvas',
'caption',
'center',
'cite',
'code',
'col',
'colgroup',
'data',
'datalist',
'dd',
'del',
'details',
'dialog',
'dir',
'div',
'dl',
'dt',
'em',
'embed',
'fieldset',
'figcaption',
'figure',
'font',
'footer',
'form',
'frame',
'frameset',
'head',
'header',,
'hr',
'html',
'i',
'iframe',
'img',
'input',
'ins',
'kbd',
'keygen',
'label',
'legend',
'li',
'link',
'main',
'map',
'mark',
'menu',
'menuitem',
'meta',
'meter',
'nav',
'noframes',
'noscript',
'object',
'ol',
'optgroup',
'option',
'output',
'p',
'param',
'picture',
'pre',
'progress',
'q',
'rp',
'rt',
'ruby',
's',
'samp',
'script',
'section',
'select',
'small',
'source',
'span',
'strike',
'strong',
'style',
'sub',
'summary',
'sup',
'table',
'tbody',
'td',
'textarea',
'tfoot',
'th',
'thead',
'time',
'title',
'tr',
'track',
'tt',
'u',
'ul',
'var',
'video',
'wbr',
'h1',
'h2',
'h3',
'h4',
'h5',
'h6'
    ];
