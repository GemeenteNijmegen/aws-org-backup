import * as core from '@aws-cdk/core';
import { PipelineStack } from './pipeline-stack';

// Please refer to statics page and updates all static variables depending on requirements

const deploymentAccount = {
  account: '352485002162', // sandbox-sander-202100 deployment account
  region: 'eu-west-1',
};

const app = new core.App();

new PipelineStack(app, 'awscabackup-pipeline', {
  env: deploymentAccount,
});

app.synth();