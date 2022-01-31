import * as codecommit from '@aws-cdk/aws-codecommit';
import * as core from '@aws-cdk/core';
import * as pipelines from '@aws-cdk/pipelines';
import { CabIamRole } from './cab-iam-role';
import { CabMemberStack } from './cab-member-stack';
//import { CabCentralStack } from './cab-central-stack';

class MemberAccountStage extends core.Stage {
  constructor(scope: core.Construct, id: string, props: core.StackProps) {
    super(scope, id, props);

    new CabIamRole(this, 'CabIamRole');
    new CabMemberStack(this, 'CabMemberStack');
  }
}

class BackupAccountStage extends core.Stage {
  constructor(scope: core.Construct, id: string, props: core.StackProps) {
    super(scope, id, props);

    new CabIamRole(this, 'CabIamRole');
  }
}

// class OrgAccountStage extends core.Stage {
//   constructor(scope: core.Construct, id: string, props: core.StackProps) {
//     super(scope, id, props);

//     new CabIamRole(this, 'CabIamRole',{});
//   }
// }

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

    pipeline.addStage(new MemberAccountStage(this, 'Prod', {
      env: {
        account: '678826754533', // AWSBackup member account
        region: 'eu-west-1',
      },
    }));

    pipeline.addStage(new MemberAccountStage(this, 'Dev', {
      env: {
        account: '039676969010', // AWSBackup member account
        region: 'eu-west-1',
      },
    }));

    pipeline.addStage(new BackupAccountStage(this, 'Backup', {
      env: {
        account: '138114602286', // AWSBackup central account
        region: 'eu-west-1',
      },
    }));

    // pipeline.addStage(new OrgAccountStage(this, 'Master', {
    //   env: {
    //     account: '267098846992', // oblcc organizations account
    //     region: 'eu-west-1',
    //   },
    // }));
  }
}