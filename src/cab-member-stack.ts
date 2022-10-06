import {
  Stack,
  RemovalPolicy,
  Duration,
  Aws,
  aws_backup as backup,
  aws_iam as iam,
  aws_kms as kms,
} from 'aws-cdk-lib';
import { Construct } from 'constructs';
import { statics } from './statics';

export class CabMemberStack extends Stack {
  constructor(scope: Construct, id: string) {
    super(scope, id);

    const cabMemberKey = new kms.Key(this, 'cabackup-member-kms', {
      removalPolicy: RemovalPolicy.DESTROY,
      pendingWindow: Duration.days(7),
      alias: 'cabackup-member-kms',
      description: 'Symmetric AWS CMK for Member Account Backup Vault Encryption',
      enableKeyRotation: true,
    });

    cabMemberKey.addToResourcePolicy(new iam.PolicyStatement({
      sid: 'Allow use of the key by authorized Backup principal',
      effect: iam.Effect.ALLOW,
      principals: [new iam.ArnPrincipal(`arn:aws:iam::${Aws.ACCOUNT_ID}:role/${statics.cab_iamRoleName}`)],
      actions: [
        'kms:Decrypt',
        'kms:Encrypt',
        'kms:ReEncrypt*',
        'kms:GenerateDataKey',
        'kms:GenerateDataKeyWithoutPlaintext',
        'kms:DescribeKey',
      ],
      resources: ['*'],
      conditions: {
        StringEquals: {
          'kms:ViaService': 'backup.amazonaws.com',
        },
      },
    }));

    cabMemberKey.addToResourcePolicy(new iam.PolicyStatement({
      sid: 'Allow alias creation during setup',
      effect: iam.Effect.ALLOW,
      principals: [new iam.AnyPrincipal],
      actions: [
        'kms:CreateAlias',
      ],
      resources: ['*'],
      conditions: {
        StringEquals: {
          'kms:CallerAccount': Aws.ACCOUNT_ID,
          'kms:ViaService': `cloudformation.${Aws.REGION}.amazonaws.com`,
        },
      },
    }));

    new backup.BackupVault(this, statics.cab_memberVaultName, {
      backupVaultName: statics.cab_memberVaultName,
      encryptionKey: cabMemberKey,
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
