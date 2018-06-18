'use strict';
require('time-require');
const Generator = require('yeoman-generator');
const chalk = require('chalk');
const yosay = require('yosay');
const Utils = require('../lib/utils');
const logId = 'generator-ibm-scala';
const path = require('path');

module.exports = class extends Generator {
  constructor(args, opts) {
    // Maybe choose to use java-codegen-common's defaults.js
    super(args, opts);
    this.bluemix = JSON.parse(opts.bluemix || '{}'); // You can also use this.options.bluemix;
    this.log(`${logId}:constructor - Options`, JSON.stringify(this.options));
    this.miscellaneousOptions = JSON.parse(opts.miscellaneousOptions || '{}'); // You can also use this.options.miscellaenousOptions
    this.context = opts;
  }

  // Underscore prefix makes this function private, it will not be called by Yo CLI
  _processAnswers(answers) {
    this.log('Answers: ' + JSON.stringify(answers));
    this.bluemix = this.bluemix || JSON.parse(answers.bluemix || '{}');
    this.miscellaneousOptions = this.miscellaneousOptions || answers.miscellaneousOptions;
  }

  prompting() {
    // Have Yeoman greet the user.
    this.log(
      yosay(`Welcome to the astounding ${chalk.red('generator-ibm-scala')} generator!`)
    );

    const prompts = [
      {
        type: 'input',
        name: 'Name',
        message: 'Name of the application',
        default: 'hello'
      },
      {
        type: 'input',
        name: 'Organization',
        message: 'Reverse domain name for this application',
        default: 'com.example'
      },
      {
        type: 'input',
        name: 'Version',
        message: 'Initial version number for this application',
        default: '1.0-SNAPSHOT'
      },
      {
        type: 'input',
        name: 'Lagom Version',
        message: 'The version number of Lagom',
        default: '1.4.6'
      }
    ];

    this.log('Running prompt');

    return this.prompt(prompts).then(props => {
      // To access props later use this.props.someAnswer;
      this.props = props;
    });
  }

  writing() {
    //    Console.log("config is: " + this);
    this.log(`${logId}:constructor - Options`, JSON.stringify(this.props));
    // This.log("Args", JSON.stringify(this.args));
    Utils.copyFiles(this, this.templatePath('lagom'), this.destinationPath(), {
      name: this.bluemix.name === undefined ? this.props.Name : this.bluemix.name,
      package: (this.miscellaneousOptions.organization === undefined
        ? this.props.Organization
        : this.miscellaneousOptions.organization
      ).replace('.', path.sep)
    });
  }

  install() {
    this.installDependencies();
  }
};
