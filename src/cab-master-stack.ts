import { readFileSync } from 'fs';
import * as iam from '@aws-cdk/aws-iam';
import * as lambda from '@aws-cdk/aws-lambda';
import * as core from '@aws-cdk/core';
import { statics } from './statics';

export class CabMasterStack extends core.Stack {
  constructor(scope: core.Construct, id: string) {
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

    //const backupPolicy = require('./src/json/backupPolicy.json');
    const backupPolicy = readFileSync('./src/json/backupPolicy.json', 'utf8');

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
          { TAG_VALUE_1: 'Vss-Central' },
          { TAG_VALUE_2: 'Vss-Local' },
          { TAG_VALUE_3: 'Std-Central' },
          { TAG_VALUE_4: 'Std-Local' },
          { SCHEDULE_EXPRESSION_DAILY: 'cron(0 3 * * *)' },
          { SCHEDULE_EXPRESSION_MONTHLY: 'cron(0 3 1 * *)' },
          { CENTRAL_VAULT_ARN: `arn:aws:backup:${core.Aws.REGION}:${statics.cab_backupAccount}:backup-vault:${statics.cab_centralVaultName}` },
        ],
      },
    });

  }
}
