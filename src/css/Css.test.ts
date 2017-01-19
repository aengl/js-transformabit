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
});
