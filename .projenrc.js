const { awscdk } = require('projen');
const project = new awscdk.AwsCdkTypeScriptApp({
  cdkVersion: '2.0.0',
  defaultReleaseBranch: 'main',
  name: 'oblcc-ca-backup',
  context: {
    '@aws-cdk/core:newStyleStackSynthesis': true,
  },
  // deps: [],                    /* Runtime dependencies of this module. */
  // description: undefined,      /* The description is just a string that helps people understand the purpose of the package. */
  // devDeps: [],                 /* Build dependencies for this module. */
});
project.synth();