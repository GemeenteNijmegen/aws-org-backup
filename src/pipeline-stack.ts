import * as codecommit from '@aws-cdk/aws-codecommit';
import * as core from '@aws-cdk/core';
import * as pipelines from '@aws-cdk/pipelines';
import { CabCentralStack } from './cab-central-stack';
import { CabIamRole } from './cab-iam-role';
import { CabMasterStack } from './cab-master-stack';
import { CabMemberStack } from './cab-member-stack';
import { statics } from './statics';

export interface MemberAccountStageProps extends core.StageProps {
  activeRegions: number;
}

class MemberAccountStage extends core.Stage {
  constructor(scope: core.Construct, id: string, props: MemberAccountStageProps) {
    super(scope, id, props);

    if (props.activeRegions > 1) {
      //dont create IAM role if the role already exists for an account in another region
      new CabMemberStack(this, 'CabMemberStack');
    }
    else {
      const cabIamRole = new CabIamRole(this, 'CabIamRole');
      const cabMemberStack = new CabMemberStack(this, 'CabMemberStack');
      cabMemberStack.addDependency(cabIamRole);
    }
  }
}

class CentralAccountStage extends core.Stage {
  constructor(scope: core.Construct, id: string, props: core.StageProps) {
    super(scope, id, props);

    const cabIamRole = new CabIamRole(this, 'CabIamRole');
    const cabMCentralStack = new CabCentralStack(this, 'CabCentralStack');
    cabMCentralStack.addDependency(cabIamRole);
  }
}

class OrgAccountStage extends core.Stage {
  constructor(scope: core.Construct, id: string, props: core.StageProps) {
    super(scope, id, props);

    new CabMasterStack(this, 'CabMasterStack');
  }
}

export class PipelineStack extends core.Stack {
  constructor(scope: core.Construct, id: string, props: core.StageProps) {
    super(scope, id, props);

    const repository = new codecommit.Repository(this, 'repository', {
      repositoryName: 'aws-org-backup',
    });

    const pipeline = new pipelines.CodePipeline(this, 'pipeline', {
      pipelineName: 'aws-org-backup-pipeline',
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

    /*--------------------------------------------------------------------------------------------------
      - Create Vault and IAM Role in all member accounts
      - Prevent creating IAM role in other regions if the role already exists within an account by
        checking if account ID exists more than once
    --------------------------------------------------------------------------------------------------*/

    var iteratedAccounts =[];

    function detectRepeatedAccount(array: any[], what: string) {
      return array.filter(item => item == what).length;
    }

    for (var _i = 0; _i < statics.cab_memberAccount.length; _i+=3) {
      
      iteratedAccounts.push(statics.cab_memberAccount[_i+1]);
            
      pipeline.addStage(new MemberAccountStage(this, statics.cab_memberAccount[_i], {
        env: {
          account: statics.cab_memberAccount[_i+1], // AWSBackup Member Accounts
          region: statics.cab_memberAccount[_i+2], // Region for Local Vault
        },
        activeRegions: detectRepeatedAccount(iteratedAccounts,statics.cab_memberAccount[_i+1]),
        
      }));
      console.log('Account ID, Region: '+ statics.cab_memberAccount[_i+1] + ', ' + statics.cab_memberAccount[_i+2] +'\tGets IAM Role: ' + detectRepeatedAccount(iteratedAccounts,statics.cab_memberAccount[_i+1]));
      }

    /*--------------------------------------------------------------------------------------------------
      - Create Vault and IAM Role in all central backup account
    --------------------------------------------------------------------------------------------------*/

    pipeline.addStage(new CentralAccountStage(this, 'CentralBackup', {
      env: {
        account: statics.cab_backupAccount, // AWSBackup Central Backup Account
        region: 'eu-west-1',
      },
    }));

    /*--------------------------------------------------------------------------------------------------
      - Deploy Backup Policy to organizations account, using lambda to push policy to member accounts
    --------------------------------------------------------------------------------------------------*/

    pipeline.addStage(new OrgAccountStage(this, 'Organizations', {
      env: {
        account: statics.cab_orgsAccount, // Organizations Account
        region: 'eu-west-1',
      },
    }));
  }
}