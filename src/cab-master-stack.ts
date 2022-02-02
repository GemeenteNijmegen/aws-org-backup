
import * as ssm from '@aws-cdk/aws-ssm';
import * as core from '@aws-cdk/core';
import { statics } from './statics';

export class CabMasterStack extends core.Stack {
  constructor(scope: core.Construct, id: string) {
    super(scope, id);

    new ssm.StringParameter(this, 'cab-member-role-ssmparameter', {
      description: 'Role name of AWS Backup role deployed to all member accounts',
      parameterName: 'ARNTest',
      stringValue: `arn:aws:backup:${core.Aws.REGION}:${statics.cab_backupAccount}:backup-vault:${statics.cab_centralVaultName}`,
    });

  }
}
