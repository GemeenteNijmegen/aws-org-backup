import * as core from '@aws-cdk/core';
import { PipelineStack } from './pipeline-stack';
import { statics } from './statics';

// Please refer to statics page and updates all static variables depending on requirements

const deploymentAccount = {
  account: statics.cab_deploymentAccount,
  region: 'eu-west-1',
};

const app = new core.App();

new PipelineStack(app, 'awscabackup-pipeline', {
  env: deploymentAccount,
});

app.synth();