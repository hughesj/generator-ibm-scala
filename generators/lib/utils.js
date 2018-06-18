/*
 Copyright 2017 IBM Corp.
 Licensed under the Apache License, Version 2.0 (the "License");
 you may not use this file except in compliance with the License.
 You may obtain a copy of the License at
 http://www.apache.org/licenses/LICENSE-2.0
 Unless required by applicable law or agreed to in writing, software
 distributed under the License is distributed on an "AS IS" BASIS,
 WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 See the License for the specific language governing permissions and
 limitations under the License.
 */

// module for utils

'use strict';

const Handlebars = require('../lib/handlebars');
const Log4js = require('log4js');
const logger = Log4js.getLogger('generator-ibm-scala:utils');
const Glob = require('glob');
const _ = require('lodash');
const fs = require('fs');
const shell = require('shelljs');

const REGEX_LEADING_ALPHA = /^[^a-zA-Z]*/;
const REGEX_ALPHA_NUM = /[^a-zA-Z0-9]/g;

function sanitizeAlphaNumLowerCase(name) {
  return sanitizeAlphaNum(name).toLowerCase();
}

function sanitizeAlphaNum(name) {
  let cleanName = '';
  if (name !== undefined) {
    cleanName = name.replace(REGEX_LEADING_ALPHA, '').replace(REGEX_ALPHA_NUM, '');
  }
  return cleanName || 'APP';
}

function _copyFiles(_this, srcPath, dstPath, templateContext) {
  logger.debug('Copying files recursively from', srcPath, 'to', dstPath);
  let files = Glob.sync(srcPath + '/**/*', {
    dot: true
  });
  console.log(files);

  _.each(files, function(srcFilePath) {
    let dstFilePath = srcFilePath.replace(srcPath, dstPath);

    if (fs.lstatSync(srcFilePath).isDirectory()) {
      // Fs.mkdirSync(dstFilePath);
      return;
    }

    // Do not process files that end in .partial, they're processed separately
    if (srcFilePath.indexOf('.partial') > 0 || srcFilePath.indexOf('.replacement') > 0)
      return;

    if (srcFilePath.includes('{')) {
      // Console.log('Was using dstFilePath: ' + dstFilePath);
      dstFilePath = _handlebarsPath(_this, dstFilePath, templateContext);
      // Console.log('Now using dstFilePath: ' + dstFilePath);
    }
    // Console.log('Copying file', srcFilePath, 'to', dstFilePath);
    _writeHandlebarsFile(_this, srcFilePath, dstFilePath, templateContext);
  });
}

function _handlebarsPath(_this, path, data) {
  let compiledTemplate = Handlebars.compile(path);
  return compiledTemplate(data);
}

function _writeHandlebarsFile(_this, templateFile, destinationFile, data) {
  let template = _this.fs.read(_this.templatePath(templateFile));
  let compiledTemplate = Handlebars.compile(template);
  let output = compiledTemplate(data);
  _this.fs.write(_this.destinationPath(destinationFile), output);

  // Make sh files executable using Shell Commands
  if (destinationFile.indexOf('.sh') > 0) {
    shell.chmod('+x', _this.destinationPath(destinationFile));
  }
}

module.exports = {
  sanitizeAlphaNum: sanitizeAlphaNum,
  sanitizeAlphaNumLowerCase: sanitizeAlphaNumLowerCase,
  copyFiles: _copyFiles,
  writeHandlebarsFile: _writeHandlebarsFile
};
