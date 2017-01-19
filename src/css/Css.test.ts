import {StyleSheet} from './Css';

describe('Css', () => {

  it('selectors', () => {
    const stylesheet = new StyleSheet(`
      body { font-size: 12px; }
    `);
    const rules = stylesheet.getRules();
    expect(rules[0].getSelectors().length).toBe(1);
    expect(rules[0].getSelectors()[0].toString()).toBe("body");
  });
});
