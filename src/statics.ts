/**
 * Class with only static strings for re-use in stacks and constructs
 */

export class statics {
  //static variables for role names
  static readonly cab_iamRoleName: string = 'cabackup-role';

  //static variables for organization id
  static readonly cab_orgId: string = 'o-lk7av3vrsd';

  //static variables for vault names
  static readonly cab_centralVaultName: string = 'cdk-cabackup-central-vault';
  static readonly cab_memberVaultName: string = 'cdk-cabackup-member-vault';

  //static variables for account id's
  static readonly cab_backupAccount: string = '138114602286';
  static readonly cab_memberAccount = [
    '678826754533',
    'b',
    'c'
  ];
  


}