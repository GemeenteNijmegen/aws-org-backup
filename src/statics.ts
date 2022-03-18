/**
 * Class with only static strings for re-use in stacks and constructs
 */

export class statics {
  //static variables for role names
  static readonly cab_iamRoleName: string = 'cabackup-role';

  //static variables for organization id
  static readonly cab_orgId: string = 'o-lk7av3vrsd';

  //static variables for vault names
  static readonly cab_centralVaultName: string = 'cabackup-central-vault';
  static readonly cab_memberVaultName: string = 'cabackup-member-vault';

  //static variables for account id's
  static readonly cab_orgsAccount: string = '267098846992';
  static readonly cab_backupAccount: string = '138114602286';

  //static variables for member account id's. Note!! no spaces in name
  static readonly cab_memberAccount = [
    'Production', '678826754533', 'eu-west-1',
    'Development', '039676969010', 'us-east-1',
    'DevelopmentUS', '039676969010', 'eu-west-1',
  ];

}