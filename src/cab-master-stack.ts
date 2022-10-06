import { readFileSync } from 'fs';
import {
  aws_lambda as lambda,
  aws_iam as iam,
} from 'aws-cdk-lib';
import * as core from 'aws-cdk-lib';
import { Construct } from 'constructs';
import { statics } from './statics';


export class CabMasterStack extends core.Stack {
  constructor(scope: Construct, id: string) {
    super(scope, id);

    const lambdaFunction = new lambda.Function(this, 'OrgPolicyCustomResourceManager', {
      code: lambda.Code.fromAsset('./src/lambda'),
      handler: 'OrgPolicyCustomResourceManager.lambda_handler',
      runtime: lambda.Runtime.PYTHON_3_8,
      timeout: core.Duration.seconds(300),
    });

    lambdaFunction.addToRolePolicy(new iam.PolicyStatement({
      actions: ['sts:AssumeRole'],
      resources: ['*'],
    }));

    lambdaFunction.addToRolePolicy(new iam.PolicyStatement({
      actions: [
        'organizations:CreatePolicy',
        'organizations:DeletePolicy',
        'organizations:AttachPolicy',
        'organizations:DetachPolicy',
        'organizations:ListPolicies',
        'organizations:UpdatePolicy',
        'organizations:DescribePolicy',
        'organizations:ListTargetsForPolicy',
        'organizations:ListAccounts',
      ],
      resources: ['*'],
    }));

    var memberAccounts = [];
    for (var _i = 0; _i < statics.cab_memberAccount.length; _i+=2) {
      memberAccounts.push(statics.cab_memberAccount[_i+1]);
    }

    const backupPolicy = readFileSync('./src/json/backupPolicy.json', 'utf8');

    /*--------------------------------------------------------------------------------------------------
      LOCAL VAULT BACKUPS (no cross account copy)
        Local Daily retention:           35 days
        Local Monthly Retention:         365 days

      CENTRAL VAULT BACKUPS
        Local Daily retention:           5 days
        Central Daily retention:         30 days
        Central Cold Storage Retention:  365 days
    --------------------------------------------------------------------------------------------------*/

    new core.CustomResource(this, 'AWSBackupPolicy', {
      serviceToken: lambdaFunction.functionArn,
      resourceType: 'Custom::OrgBackupPolicy',
      properties: {
        PolicyPrefix: 'oblcc-backup-policy',
        PolicyType: 'BACKUP_POLICY',
        PolicyTargets: memberAccounts,
        PolicyDescription: 'BackupPolicy for Daily Backup as per the resource selection criteria',
        PolicyContents: backupPolicy,
        Variables: [
          { BACKUP_ROLE: `${statics.cab_iamRoleName}` },
          { VAULT_NAME: `${statics.cab_memberVaultName}` },
          { TAG_KEY: 'BackupPlan' },
          { TAG_VALUE_1: 'Vss-Local-24h' },
          { TAG_VALUE_2: 'Vss-Central-24h' },
          { TAG_VALUE_3: 'Std-Local-24h' },
          { TAG_VALUE_4: 'Std-Central-24h' },
          { SCHEDULE_EXPRESSION_DAILY: 'cron(0 3 * * ? *)' },
          { SCHEDULE_EXPRESSION_MONTHLY: 'cron(0 3 1 * ? *)' },
          { CENTRAL_VAULT_ARN: `arn:aws:backup:${core.Aws.REGION}:${statics.cab_backupAccount}:backup-vault:${statics.cab_centralVaultName}` },
        ],
      },
    });

  }
}
