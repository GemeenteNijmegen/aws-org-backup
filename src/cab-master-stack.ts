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

    var backupPolicy = `[
      {
          "plans": {
              "Vss-Daily": {
                  "regions": {
                    "@@append":[ "us-east-1", "eu-central-1", "us-east-2", "us-west-2", "eu-west-1", "ap-southeast-1", "ap-southeast-2", "ca-central-1", "eu-north-1" ] },
                  "rules": {
                      "Vss-DailyRule": {
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
                          "Vss-DailySelection": {
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
      },
      {
          "plans": {
              "Std-Daily": {
                  "regions": {
                    "@@append":[ "us-east-1", "eu-central-1", "us-east-2", "us-west-2", "eu-west-1", "ap-southeast-1", "ap-southeast-2", "ca-central-1", "eu-north-1" ] },
                  "rules": {
                      "Std-DailyRule": {
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
                          "Std-DailySelection": {
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
      }
    ]`;

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
          { TAG_VALUE_1: 'Vss-24h' },
          { TAG_VALUE_2: 'Std-24h' },
          { SCHEDULE_EXPRESSION_1: 'cron(15 12 * * ? *)' },
          { SCHEDULE_EXPRESSION_2: 'cron(15 12 * * ? *)' },
          { CENTRAL_VAULT_ARN: `arn:aws:backup:${core.Aws.REGION}:${statics.cab_backupAccount}:backup-vault:${statics.cab_centralVaultName}` },
        ],
      },
    });

  }
}
