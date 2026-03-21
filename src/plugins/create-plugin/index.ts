import inquirer from 'inquirer';
import fs from 'node:fs';
import path from 'node:path';

export async function scaffoldPlugin() {
  const answers = await inquirer.prompt([
    {
      type: 'list',
      name: 'type',
      message: 'Plugin type?',
      choices: ['playbook', 'provider', 'renderer', 'storage', 'hook']
    },
    {
      name: 'name',
      message: 'Plugin name?',
      default: 'my-opengoat-plugin'
    },
    {
      name: 'author',
      message: 'Author name?'
    }
  ]);

  const dest = path.join(process.cwd(), answers.name);
  if (fs.existsSync(dest)) {
    console.error(`Directory ${answers.name} already exists.`);
    return;
  }

  fs.mkdirSync(dest, { recursive: true });
  
  const manifest = {
    name: answers.name,
    version: '1.0.0',
    description: `A custom ${answers.type} plugin for OpenGOAT.`,
    type: answers.type,
    register: './dist/index.js',
    author: answers.author,
    permissions: []
  };

  fs.writeFileSync(path.join(dest, 'opengoat.plugin.json'), JSON.stringify(manifest, null, 2));
  
  const srcDir = path.join(dest, 'src');
  fs.mkdirSync(srcDir);
  fs.writeFileSync(path.join(srcDir, 'index.ts'), `// OpenGOAT ${answers.type} plugin template\nexport default {\n  name: '${answers.name}'\n};\n`);
  
  console.log(`Plugin '${answers.name}' scaffolded at ${dest}`);
}
