
import * as iam from '@aws-cdk/aws-iam';
import * as lambda from '@aws-cdk/aws-lambda';
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

    const lambdaFunction = new lambda.Function(this, 'OrgPolicyCustomResourceManager', {
      code: lambda.Code.fromAsset('./src/lambda'),
      handler: 'OrgPolicyCustomResourceManager.lambda_handler',
      runtime: lambda.Runtime.PYTHON_3_8,
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
      ],
      resources: ['*'],
    }));

    // lambdaFunction.role?.attachInlinePolicy(new iam.PolicyStatement(this,'AssumeOrgRole',{
    //   actions: [
    //     'sts:AssumeRole',
    //   ],
    //   resources: ['*'],
    // }),
    // );

    // const OrgPolicyCustomResourceManagerRole = new iam.Role(this, 'OrgPolicyCustomResourceManager', {
    //   assumedBy: new iam.ServicePrincipal('lambda.amazonaws.com'),
    //   managedPolicies: [
    //     iam.ManagedPolicy.fromAwsManagedPolicyName('service-role/AWSLambdaBasicExecutionRole'),
    //   ],
    //   path: '/',
    //   roleName: 'OrgPolicyCustomResourceManager',
    // });


    //     OrgPolicyCustomResourceManagerRole.addToPolicy

    //     lambdaFunction.role.
    //     lambdaFunction.addToRolePolicy(new iam.PolicyStatement({
    //       actions: [
    //         'securityhub:CreateMembers',
    //         'securityhub:InviteMembers',
    //       ],
    //       resources: ['*'],
    //     }));

    //     lambdaFunction.addToRolePolicy(new iam.PolicyStatement({
    //       actions: [
    //         'sts:AssumeRole',
    //       ],
    //       resources: ['arn:aws:iam::*:role/securityhub-automation-role'],
    //     }));


  }
}
