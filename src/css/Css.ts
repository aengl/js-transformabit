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
}


export class Rule {

  private ruleObj: any;
  constructor(obj: any) {
    this.ruleObj = obj;
  }

  getSelectors(): Selector[] {
    return this.ruleObj.selectors.map(selector => new Selector(selector));
  }

  getDeclarations(): Declaration[] {
    return this.ruleObj.declarations.map(dec => new Declaration(dec));
  }
}

export class Declaration {
  private declarationObj: any;
  constructor(obj: any) {
    this.declarationObj = obj;
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
