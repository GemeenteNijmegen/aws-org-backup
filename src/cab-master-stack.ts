//import * as custom from '@aws-cdk/custom-resources';
import * as iam from '@aws-cdk/aws-iam';
import * as lambda from '@aws-cdk/aws-lambda';
import * as ssm from '@aws-cdk/aws-ssm';
import * as core from '@aws-cdk/core';
//import * as logs from '@aws-cdk/aws-logs';
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

    var memberAccounts= '';

    for (var _i = 0; _i < statics.cab_memberAccount.length; _i+=2) {
      memberAccounts += `${statics.cab_memberAccount[_i+1]},`;
    }

    // const customResourceProvider = new custom.Provider(this, 'provider', {
    //   onEventHandler: lambdaFunction,
    //   logRetention: logs.RetentionDays.ONE_MONTH,
    // });

    new core.CustomResource(this, 'BackupPolicy', {
      serviceToken: lambdaFunction.functionArn,
      resourceType: 'Custom::OrgPolicy',
      properties: {
        PolicyPrefix: 'cdk-backup-policy',
        PolicyType: 'BACKUP_POLICY',
        PolicyTargets: memberAccounts,
        PolicyDescription: 'BackupPolicy for Daily Backup as per the resource selection criteria',
        Variables: [
          `BACKUP_ROLE: ${statics.cab_iamRoleName}`,
          `VAULT_NAME: ${statics.cab_memberVaultName}`,
          'TAG_KEY : BackupPlan',
          'TAG_VALUE_1 : VSS Backup',
          'TAG_VALUE_2 : STD Backup',
          'SCHEDULE_EXPRESSION_1 : cron(0 0/6 * * ? *)',
          'SCHEDULE_EXPRESSION_2 : cron(0 19 * * ? *)',
          `CENTRAL_VAULT_ARN : arn:aws:backup:${core.Aws.REGION}:${statics.cab_backupAccount}:backup-vault:${statics.cab_centralVaultName}`,
        ],
        PolicyContents: [` 
                          {
                            "plans": {
                                "VSS-Daily": {
                                    "regions": {
                                      "@@append":[ "us-east-1", "eu-central-1", "us-east-2", "us-west-2", "eu-west-1", "ap-southeast-1", "ap-southeast-2", "ca-central-1", "eu-north-1" ] },
                                    "rules": {
                                        "VSS-DailyRule": {
                                            "schedule_expression": {
                                                "@@assign": "SCHEDULE_EXPRESSION_1"
                                            },
                                            "start_backup_window_minutes": {
                                                "@@assign": "480"
                                            },
                                            "complete_backup_window_minutes": {
                                                "@@assign": "720"
                                            },
                                            "lifecycle": {
                                                "delete_after_days": {
                                                    "@@assign": "5"
                                                }
                                            },
                                            "target_backup_vault_name": {
                                                "@@assign": "VAULT_NAME"
                                            },
                                            "copy_actions": {
                                              "CENTRAL_VAULT_ARN": {
                                                "target_backup_vault_arn": {
                                                  "@@assign": "CENTRAL_VAULT_ARN"
                                                },
                                                "lifecycle": {
                                                  "move_to_cold_storage_after_days": {
                                                    "@@assign": "30"
                                                  },
                                                  "delete_after_days": {
                                                    "@@assign": "365"
                                                  }
                                                }
                                            }
                                        }
                                      }                            
                                    },
                                    "selections": {
                                        "tags": {
                                            "VSS-DailySelection": {
                                                "iam_role_arn": {
                                                    "@@assign": "arn:aws:iam::$account:role/BACKUP_ROLE"
                                                },
                                                "tag_key": {
                                                    "@@assign": "TAG_KEY"
                                                },
                                                "tag_value": {
                                                    "@@assign": [
                                                        "TAG_VALUE_1"
                                                    ]
                                                }
                                            }
                                        }
                                    },
                                    "advanced_backup_settings": {
                                        "ec2": {
                                            "windows_vss": {
                                                "@@assign": "enabled"
                                            }
                                        }
                                    }
                                }
                            }
                          }`,
                          `{
                            "plans": {
                                "GEN-Daily": {
                                    "regions": {
                                      "@@append":[ "us-east-1", "eu-central-1", "us-east-2", "us-west-2", "eu-west-1", "ap-southeast-1", "ap-southeast-2", "ca-central-1", "eu-north-1" ] },
                                    "rules": {
                                        "GEN-DailyRule": {
                                            "schedule_expression": {
                                                "@@assign": "SCHEDULE_EXPRESSION_2"
                                            },
                                            "start_backup_window_minutes": {
                                                "@@assign": "480"
                                            },
                                            "complete_backup_window_minutes": {
                                                "@@assign": "720"
                                            },
                                            "lifecycle": {
                                                "delete_after_days": {
                                                    "@@assign": "5"
                                                }
                                            },
                                            "target_backup_vault_name": {
                                                "@@assign": "VAULT_NAME"
                                            },
                                            "copy_actions": {
                                              "CENTRAL_VAULT_ARN": {
                                                "target_backup_vault_arn": {
                                                  "@@assign": "CENTRAL_VAULT_ARN"
                                                },
                                                "lifecycle": {
                                                  "move_to_cold_storage_after_days": {
                                                    "@@assign": "30"
                                                  },
                                                  "delete_after_days": {
                                                    "@@assign": "365"
                                                  }
                                                }
                                            }
                                        }
                                      }                            
                                    },
                                    "selections": {
                                        "tags": {
                                            "GEN-DailySelection": {
                                                "iam_role_arn": {
                                                    "@@assign": "arn:aws:iam::$account:role/BACKUP_ROLE"
                                                },
                                                "tag_key": {
                                                    "@@assign": "TAG_KEY"
                                                },
                                                "tag_value": {
                                                    "@@assign": [
                                                        "TAG_VALUE_2"
                                                    ]
                                                }
                                            }
                                        }
                                    }
                                }
                            }
                          }`
                        ],


        // SecretId: this.cluster.secret?.secretArn,
        // ParameterName: '/gemeentenijmegen/formio/database/endpoint-with-secret',
        // ParameterDescription: 'FormIO Database Endpoint Url',
        // ClusterEndpoint: this.cluster.clusterEndpoint.socketAddress,
      },
    });

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
