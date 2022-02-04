import * as codecommit from '@aws-cdk/aws-codecommit';
import * as core from '@aws-cdk/core';
import * as pipelines from '@aws-cdk/pipelines';
import { CabCentralStack } from './cab-central-stack';
import { CabIamRole } from './cab-iam-role';
import { CabMasterStack } from './cab-master-stack';
import { CabMemberStack } from './cab-member-stack';
import { statics } from './statics';

class MemberAccountStage extends core.Stage {
  constructor(scope: core.Construct, id: string, props: core.StackProps) {
    super(scope, id, props);

    const cabIamRole = new CabIamRole(this, 'CabIamRole');
    const cabMemberStack = new CabMemberStack(this, 'CabMemberStack');
    cabMemberStack.addDependency(cabIamRole);
  }
}

class CentralAccountStage extends core.Stage {
  constructor(scope: core.Construct, id: string, props: core.StackProps) {
    super(scope, id, props);

    const cabIamRole = new CabIamRole(this, 'CabIamRole');
    const cabMCentralStack = new CabCentralStack(this, 'CabCentralStack');
    cabMCentralStack.addDependency(cabIamRole);
  }
}

class OrgAccountStage extends core.Stage {
  constructor(scope: core.Construct, id: string, props: core.StackProps) {
    super(scope, id, props);

    new CabMasterStack(this, 'CabMasterStack');
  }
}

export class PipelineStack extends core.Stack {
  constructor(scope: core.Construct, id: string, props: core.StackProps) {
    super(scope, id, props);

    const repository = new codecommit.Repository(this, 'repository', {
      repositoryName: 'awscabackup-repository',
    });

    const pipeline = new pipelines.CodePipeline(this, 'pipeline', {
      pipelineName: 'awscabackup-pipeline',
      crossAccountKeys: true,
      synth: new pipelines.ShellStep('Synth', {
        input: pipelines.CodePipelineSource.codeCommit(repository, 'main'),
        commands: [
          'yarn install --frozen-lockfile',
          'npx projen build',
          'npx projen synth',
        ],
      }),
    });

    for (var _i = 0; _i < statics.cab_memberAccount.length; _i+=2) {
      pipeline.addStage(new MemberAccountStage(this, statics.cab_memberAccount[_i], {
        env: {
          account: statics.cab_memberAccount[_i+1], // AWSBackup member account
          region: 'eu-west-1',
        },
      }));
    }

    pipeline.addStage(new CentralAccountStage(this, 'Backup', {
      env: {
        account: statics.cab_backupAccount, // AWSBackup central account
        region: 'eu-west-1',
      },
    }));

    pipeline.addStage(new OrgAccountStage(this, 'Master', {
      env: {
        account: statics.cab_orgsAccount, // oblcc organizations account
        region: 'eu-west-1',
      },
    }));
  }
}