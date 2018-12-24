const fs = require('fs');

const cli = require('child_process').execSync;

const rm = (filename) => cli(`rm -rf ${filename}`);

const read = (filename) => fs.readFileSync(filename, 'utf8');

const mkdir = (filename) => cli(`mkdir -p ${filename}`);

const write = (filename, data) => {
  fs.writeFileSync(filename, data);
};

const exists = (filename) => fs.existsSync(filename);

module.exports = {
  mkdir,
  rm,
  read, 
  write,
  exists,
  cli,
};