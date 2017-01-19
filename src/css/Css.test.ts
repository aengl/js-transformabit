import {StyleSheet} from './Css';

describe('Css', () => {

  it('selectors', () => {
    const stylesheet = new StyleSheet(`
      body { font-size: 12px; }
      .foo {diplay: none;}
      #name {
          color: red;
      }
    `);
    expect(stylesheet.getRules().length).toBe(3);
  });

  it('selectors', () => {
    const stylesheet = new StyleSheet(`
      body { font-size: 12px; }
      .foo {diplay: none;}
      #name {
          color: red;
      }
    `);

    const rules = stylesheet.getRules();
    expect(rules[0].getSelectors().length).toBe(1);
    expect(rules[1].getSelectors().length).toBe(1);
    expect(rules[2].getSelectors().length).toBe(1);

    let selector = rules[0].getSelectors()[0];
    expect(selector.toString()).toBe("body");
    expect(selector.isHtmlElement()).toBeTruthy();
    expect(selector.isClassSelector()).toBeFalsy();
    expect(selector.isIdSelector()).toBeFalsy();
    expect(selector.getSubject()).toBe("body");

    selector = rules[1].getSelectors()[0];
    expect(selector.toString()).toBe(".foo");
    expect(selector.isHtmlElement()).toBeFalsy();
    expect(selector.isClassSelector()).toBeTruthy();
    expect(selector.isIdSelector()).toBeFalsy();
    expect(selector.getSubject()).toBe("foo");

    selector = rules[2].getSelectors()[0];
    expect(selector.toString()).toBe("#name");
    expect(selector.isHtmlElement()).toBeFalsy();
    expect(selector.isClassSelector()).toBeFalsy();
    expect(selector.isIdSelector()).toBeTruthy();
    expect(selector.getSubject()).toBe("name");

  });


  it('declarations', () => {
    const stylesheet = new StyleSheet(`
      body {
        font-size: 12px;
        color: blue;
        background-color: red;
      }
    `);

    const rule = stylesheet.getRules()[0];
    expect(rule.getDeclarations().length).toBe(3);
    expect(rule.getDeclarations()[0].getProperty()).toBe("font-size");
    expect(rule.getDeclarations()[0].getValue()).toBe("12px");
    expect(rule.getDeclarations()[1].getProperty()).toBe("color");
    expect(rule.getDeclarations()[1].getValue()).toBe("blue");
    expect(rule.getDeclarations()[2].getProperty()).toBe("background-color");
    expect(rule.getDeclarations()[2].getValue()).toBe("red");
  });

});
