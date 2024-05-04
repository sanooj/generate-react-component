#!/usr/bin/env node
"use strict";
const prompts = require("prompts");
const path = require("path");
const fs = require("fs-extra");
prompts.override(require("yargs").argv);

(async () => {
  const response = await prompts([
    {
      type: "text",
      name: "ComponentName",
      message: `Component Name?`,
      initial: "MyComponent",
    },
    {
      type: "select",
      name: "ComponentType",
      message: "Component Type?",
      choices: [
        { title: "TypeScript", value: "tsx" },
        { title: "JavaScript", value: "jsx" },
      ],
      initial: 0,
      hint: "- Space to select.",
    },
    {
      type: "confirm",
      name: "Pure",
      message: "Pure Function Component?",
      initial: true,
    },
    {
      type: "toggle",
      name: "Test",
      message: "Include Test?",
      initial: true,
      active: "yes",
      inactive: "no",
    },
    {
      type: "select",
      name: "StylesheetType",
      message: "Select stylesheet Type?",
      choices: [
        { title: "CSS", value: "css" },
        { title: "SCSS", value: "scss" },
        { title: "SASS", value: "sass" },
        { title: "LESS", value: "less" },
        { title: "Stylus", value: "styl" },
        { title: "PostCSS", value: "postcss" },
      ],
      initial: 1,
      hint: "- Space to select.",
    },
    {
      type: "confirm",
      name: "StylesheetModule",
      message: (prev, response) => `${response.StylesheetType} Module?`,
      initial: true,
    },
  ]);

  createComponent(response);
})();

function createComponent(options) {
  const { ComponentName, ComponentType, StylesheetType, StylesheetModule, Pure, Test } = options;
  const root = path.resolve(ComponentName);
  if (!StylesheetModule) {
    return true;
  }
  if (!fs.existsSync(root)) {
    fs.mkdirSync(root);
  }
  const className = `${ComponentName[0].toLowerCase()}${ComponentName.slice(1)}`;

  const cssContent = `/* ${ComponentName} CSS Module */\n.${className} { }`;
  const importStyles = StylesheetModule
    ? `import styles from './${ComponentName}.module.${StylesheetType}';`
    : `import './${ComponentName}.${StylesheetType}';`;
  const componentContent = `/* ${ComponentName} Component */\n${importStyles}\n\nconst ${ComponentName} = () => {\n  return <div className={${
    StylesheetModule ? `styles.${className}` : `'${className}'`
  }}></div>;\n};\nexport default ${ComponentName};\n`;
  const classComponentContent = `/* ${ComponentName} Component */\nimport React from 'react';\n\n${importStyles}\n\n\class ${ComponentName} extends React.Component {\n  render() {\n    return <div className={${
    StylesheetModule ? `styles.${className}` : `'${className}'`
  }}></div>;\n  }\n}\nexport default ${ComponentName};\n`;

  const cssFilePath = path.join(
    root,
    `${ComponentName}${StylesheetModule ? ".module" : ""}.${StylesheetType}`,
  );
  fs.writeFileSync(cssFilePath, cssContent);

  if (Test) {
    const testContent = `import React from 'react';\nimport { render } from '@testing-library/react';\nimport ${ComponentName} from './${ComponentName}';\ntest('${ComponentName} Component', () => {
    render(<${ComponentName} />);\n});`;
    const testFilePath = path.join(root, `${ComponentName}.test.${ComponentType}`);
    fs.writeFileSync(testFilePath, testContent);
  }

  const componentFilePath = path.join(root, `${ComponentName}.${ComponentType}`);
  fs.writeFileSync(componentFilePath, Pure ? componentContent : classComponentContent);
}
