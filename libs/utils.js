const fs = require('fs');

const execSync = require('child_process').execSync;

const rm = (filename) => execSync(`rm -rf ${filename}`);

const read = (filename) => fs.readFileSync(filename, 'utf8');

const mkdir = (filename) => execSync(`mkdir -p ${filename}`);

const write = (filename, data) => {
  fs.writeFileSync(filename, data);
};

module.exports = {
  write: write,
  mkdir: mkdir,
  read: read,
  rm: rm,
  cli: execSync,
};