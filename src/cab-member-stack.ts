import * as iam from '@aws-cdk/aws-iam';
import * as kms from '@aws-cdk/aws-kms';
import * as core from '@aws-cdk/core';
//import * as ssm from '@aws-cdk/aws-ssm';
import { statics } from './statics';

export class CabMemberStack extends core.Stack {
  constructor(scope: core.Construct, id: string) {
    super(scope, id);

    //const backupRoleName = ssm.StringParameter.valueForStringParameter(this,'/gemeentenijmegen/aws-backup/backup-role')

    const key = new kms.Key(this, 'cabackup-member-kms', {
      removalPolicy: core.RemovalPolicy.DESTROY,
      pendingWindow: core.Duration.days(7),
      alias: 'cabackup-member-kms',
      description: 'Symmetric AWS CMK for Member Account Backup Vault Encryption',
      enableKeyRotation: true,
    });

    key.addToResourcePolicy(new iam.PolicyStatement({
      sid: 'Enable IAM User Permissions',
      effect: iam.Effect.ALLOW,
      principals: [new iam.AccountRootPrincipal()],
      actions: [
        'kms:*',
      ],
      resources: ['*'],
    }));

    key.addToResourcePolicy(new iam.PolicyStatement({
      sid: 'Allow use of the key by authorized Backup principal',
      effect: iam.Effect.ALLOW,
      principals: [new iam.ArnPrincipal(`arn:aws:iam::${core.Aws.ACCOUNT_ID}:role/${statics.iamRoleName_cab_member}`)],
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

    key.addToResourcePolicy(new iam.PolicyStatement({
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

    // cabrole.addToPolicy(new iam.PolicyStatement({
    //   actions: ['sts:AssumeRole'],
    // }));

    // new s3.Bucket(this, 'Mybucket')

    // new core.CfnStackSet(this, 'StackSet', {
    //   stackSetName: 'Sander-test',
    //   permissionModel: 'SERVICE_MANAGED',
    //   autoDeployment: {
    //     enabled: true,
    //     retainStacksOnAccountRemoval: false,
    //   },
    //   stackInstancesGroup: [
    //     {
    //       regions: ['eu-west-1'],
    //       deploymentTargets: {
    //         organizationalUnitIds: ['ou-mbm8-xzrssyfm'],
    //       },
    //     },
    //   ],
    //   templateBody: `
    //     Resources:
    //       Topic:
    //         Type: AWS::SNS::Topic
    //         Properties:
    //           TopicName: Events
    //   `,
    // });


  }
}
