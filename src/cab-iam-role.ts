import * as iam from '@aws-cdk/aws-iam';
import * as core from '@aws-cdk/core';
//import * as ssm from '@aws-cdk/aws-ssm';
//import * as s3 from '@aws-cdk/aws-s3';
import { statics } from './statics';

export class CabIamRole extends core.Stack {
  constructor(scope: core.Construct, id: string) {
    super(scope, id);

    new iam.Role(this, 'Role', {
      assumedBy: new iam.ServicePrincipal('backup.amazonaws.com'),
      managedPolicies: [
        iam.ManagedPolicy.fromAwsManagedPolicyName('service-role/AWSBackupServiceRolePolicyForBackup'),
        iam.ManagedPolicy.fromAwsManagedPolicyName('service-role/AWSBackupServiceRolePolicyForRestores'),
      ],
      path: '/',
      roleName: statics.iamRoleName_cab_member,
    });

    // new ssm.StringParameter(this,'cab-member-role-ssmparameter',{
    //   description: 'Role name of AWS Backup role deployed to all member accounts',
    //   parameterName: '/gemeentenijmegen/aws-backup/cab-member-role',
    //   stringValue: cabMemberRole.roleName,
    // });

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
