import {StyleSheet, Declaration, Rule, Selector, Media, KeyFrames,
			KeyFrame} from './Css';

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

    expect(rule.hasDeclaration("font-size")).toBeTruthy();
    expect(rule.getDelcaration("font-size").getValue()).toBe("12px");
    expect(rule.hasDeclaration("color")).toBeTruthy();
    expect(rule.getDelcaration("color").getValue()).toBe("blue");
    expect(rule.hasDeclaration("background-color")).toBeTruthy();
    expect(rule.getDelcaration("background-color").getValue()).toBe("red");

    expect(rule.hasDeclaration("foo-bar")).toBeFalsy();

  });

  it('create declarations', () => {
    const float = Declaration.custom("float", "left");
    expect(float.getProperty()).toBe("float");
    expect(float.getValue()).toBe("left");

    const stylesheet = new StyleSheet(`
      body {
        font-size: 12px;
        color: blue;
        background-color: red;
      }
    `);
    const rule = stylesheet.getRules()[0];
    rule.addDeclaration(float);
    expect(stylesheet.toSlimString()).toBe("body {font-size: 12px;color: blue;background-color: red;float: left;}");

    rule.addCustomDeclaration("position", "relative");
    expect(stylesheet.toSlimString()).toBe("body {font-size: 12px;color: blue;background-color: red;float: left;position: relative;}");
  });

  it('create rules', () => {
      const rule = Rule.build([new Selector("body")], [
        Declaration.custom("color", "red"),
        Declaration.custom("padding", "10px")
      ]);

    expect(rule.getSelectors().length).toBe(1);
    const selector = rule.getSelectors()[0];
    expect(selector.toString()).toBe("body");
    expect(rule.getDeclarations().length).toBe(2);
    expect(rule.getDeclarations()[0].getProperty()).toBe("color");
    expect(rule.getDeclarations()[0].getValue()).toBe("red");
    expect(rule.getDeclarations()[1].getProperty()).toBe("padding");
    expect(rule.getDeclarations()[1].getValue()).toBe("10px");

    const stylesheet = new StyleSheet("");
    stylesheet.addRule(rule);
    expect(stylesheet.toSlimString()).toBe("body {color: red;padding: 10px;}");
  });

  it('media rule', () => {
    const stylesheet = new StyleSheet(`
      @media screen and (min-width: 480px) {
      }
    `);

     expect(stylesheet.getRuleSets().length).toBe(1);
     const rule: Media = <Media>stylesheet.getRuleSets()[0];
     expect(rule.getMediaQuery()).toBe("screen and (min-width: 480px)");
  });

  it('keyframes name', () => {
	 const stylesheet = new StyleSheet(`
		@keyframes foobar {
		}
	 `);
	  expect(stylesheet.getRuleSets().length).toBe(1);
	  const rule: KeyFrames = <KeyFrames>stylesheet.getRuleSets()[0];
	  expect(rule.getName()).toBe("foobar");
  });

  it('keyframes values', () => {
	 const stylesheet = new StyleSheet(`
		@keyframes foobar {
			from {top: 1px;}
		}
	 `);
	  expect(stylesheet.getRuleSets().length).toBe(1);
	  const rule: KeyFrames = <KeyFrames>stylesheet.getRuleSets()[0];
	  expect(rule.getKeyFrames().length).toBe(1);
	  const keyframe = rule.getKeyFrames()[0];
	  expect(keyframe.getValues().length).toBe(1);
	  expect(keyframe.getValues()[0]).toBe("from");
  });

  it('keyframe multiple values', () => {
	 const stylesheet = new StyleSheet(`
		@keyframes foobar {
			from, foo bar {top: 1px;}
		}
	 `);
	  expect(stylesheet.getRuleSets().length).toBe(1);
	  const rule: KeyFrames = <KeyFrames>stylesheet.getRuleSets()[0];
	  expect(rule.getKeyFrames().length).toBe(1);
	  const keyframe = rule.getKeyFrames()[0];
	  expect(keyframe.getValues().length).toBe(3);
	  expect(keyframe.getValues()[0]).toBe("from");
	  expect(keyframe.getValues()[1]).toBe("foo");
	  expect(keyframe.getValues()[2]).toBe("bar");
  });

  it('keyframe declarations', () => {
  const stylesheet = new StyleSheet(`
	 @keyframes foobar {
		 from {top: 1px;}
		 to {top: 200px; bottom: 210px;}
	 }
  `);
	expect(stylesheet.getRuleSets().length).toBe(1);
	const rule: KeyFrames = <KeyFrames>stylesheet.getRuleSets()[0];
	expect(rule.getKeyFrames().length).toBe(2);
	let keyframe = rule.getKeyFrames()[0];
	expect(keyframe.getDeclarations().length).toBe(1);
	expect(keyframe.getDeclarations()[0].getProperty()).toBe("top");
	expect(keyframe.getDeclarations()[0].getValue()).toBe("1px");

	keyframe = rule.getKeyFrames()[1];
	expect(keyframe.getDeclarations().length).toBe(2);
	expect(keyframe.getDeclarations()[0].getProperty()).toBe("top");
	expect(keyframe.getDeclarations()[0].getValue()).toBe("200px");
	expect(keyframe.getDeclarations()[1].getProperty()).toBe("bottom");
	expect(keyframe.getDeclarations()[1].getValue()).toBe("210px");
  });

  it('keyframe declaration', () => {
	  const stylesheet = new StyleSheet(`
		  @keyframes foobar {
			  to {top: 200px; bottom: 210px;}
		  }
	  `);
	  const rule: KeyFrames = <KeyFrames>stylesheet.getRuleSets()[0];
	  const keyframe = rule.getKeyFrames()[0];
	  expect(keyframe.getDeclaration(0).getProperty()).toBe("top");
	  expect(keyframe.getDeclaration("top").getValue()).toBe("200px");

  });

  it('keyframes keyframe', () => {
	const stylesheet = new StyleSheet(`
		@keyframes foobar {
			to {top: 200px; bottom: 210px;}
		}
	`);
	const rule: KeyFrames = <KeyFrames>stylesheet.getRuleSets()[0];
	const keyframe = rule.getKeyFrame(0);
	expect(keyframe.getValues()[0]).toBe("to");
  });

});


