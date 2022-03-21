/**
 * Class with only static strings for re-use in stacks and constructs
 */

export class statics {
  //IAM role name for role created in member / backup accountsstatic variables for role name
  static readonly cab_iamRoleName: string = 'cabackup-role';

  //static variables for organization id
  static readonly cab_orgId: string = 'o-lk7av3vrsd';

  /*--------------------------------------------------------------------------------------------------
    cab_centralVaultName: local vault name for central backup account
    cab_memberVaultName: local vault name for all member accounts
  --------------------------------------------------------------------------------------------------*/
  static readonly cab_centralVaultName: string = 'cabackup-central-vault';
  static readonly cab_memberVaultName: string = 'cabackup-member-vault';

  /*--------------------------------------------------------------------------------------------------
    cab_deploymentAccount: deployment / build account where pipeline will be deployed
    cab_orgsAccount: organizations account
    cab_backupAccount: central backup account, for storing backup copies
  --------------------------------------------------------------------------------------------------*/
  static readonly cab_deploymentAccount: string = '352485002162';
  static readonly cab_orgsAccount: string = '267098846992';
  static readonly cab_backupAccount: string = '138114602286';

  //static variable (array) for member accounts. Note!! no spaces in name
  static readonly cab_memberAccount = [
    'Production', '678826754533', 'eu-west-1',
    'Development', '039676969010', 'eu-west-1',
    'DevelopmentUS', '039676969010', 'us-east-1',
  ];
}