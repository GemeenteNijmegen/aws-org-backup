import * as core from 'aws-cdk-lib';
import {
  aws_iam as iam,
} from 'aws-cdk-lib';
import { Construct } from 'constructs';
import { statics } from './statics';

export class CabIamRole extends core.Stack {
  constructor(scope: Construct, id: string) {
    super(scope, id);

    new iam.Role(this, 'cabackup-role', {
      assumedBy: new iam.ServicePrincipal('backup.amazonaws.com'),
      managedPolicies: [
        iam.ManagedPolicy.fromAwsManagedPolicyName('service-role/AWSBackupServiceRolePolicyForBackup'),
        iam.ManagedPolicy.fromAwsManagedPolicyName('service-role/AWSBackupServiceRolePolicyForRestores'),
      ],
      path: '/',
      roleName: statics.cab_iamRoleName,
    });

  }
}
