import * as backup from '@aws-cdk/aws-backup';
import * as iam from '@aws-cdk/aws-iam';
import * as kms from '@aws-cdk/aws-kms';
import * as core from '@aws-cdk/core';
import { statics } from './statics';

export class CabCentralStack extends core.Stack {
  constructor(scope: core.Construct, id: string) {
    super(scope, id);

    const cabCentralKey = new kms.Key(this, 'cabackup-central-kms', {
      removalPolicy: core.RemovalPolicy.DESTROY,
      pendingWindow: core.Duration.days(7),
      alias: 'cabackup-central-kms',
      description: 'Symmetric AWS CMK for Member Account Backup Vault Encryption',
      enableKeyRotation: true,
    });

    cabCentralKey.addToResourcePolicy(new iam.PolicyStatement({
      sid: 'Allow use of the key by authorized Organizations member accounts',
      effect: iam.Effect.ALLOW,
      principals: [new iam.ArnPrincipal(`arn:aws:iam::${core.Aws.ACCOUNT_ID}:role/${statics.cab_iamRoleName}`)],
      actions: [
        'kms:Decrypt',
        'kms:Encrypt',
        'kms:ReEncrypt*',
        'kms:GenerateDataKey*',
        'kms:CreateGrant',
        'kms:ListGrants',
        'kms:DescribeKey',
      ],
      resources: ['*'],
      conditions: {
        StringEquals: {
          'aws:PrincipalOrgID': statics.cab_orgId,
        },
      },
    }));

    cabCentralKey.addToResourcePolicy(new iam.PolicyStatement({
      sid: 'Allow alias creation during setup',
      effect: iam.Effect.ALLOW,
      principals: [new iam.AnyPrincipal],
      actions: [
        'kms:CreateAlias',
      ],
      resources: ['*'],
      conditions: {
        StringEquals: {
          'kms:CallerAccount': core.Aws.ACCOUNT_ID,
          'kms:ViaService': `cloudformation.${core.Aws.REGION}.amazonaws.com`,
        },
      },
    }));

    new backup.BackupVault(this, statics.cab_centralVaultName, {
      backupVaultName: statics.cab_centralVaultName,
      encryptionKey: cabCentralKey,
      accessPolicy: new iam.PolicyDocument({
        statements: [
          new iam.PolicyStatement({
            effect: iam.Effect.ALLOW,
            principals: [new iam.AnyPrincipal],
            actions: [
              'backup:CopyIntoBackupVault',
            ],
            resources: ['*'],
            conditions: {
              StringEquals: {
                'aws:PrincipalOrgID': statics.cab_orgId,
              },
            },
          }),
        ],
      }),

    });

  }
}
