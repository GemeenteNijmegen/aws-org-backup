/**
 * Class with only static strings for re-use in stacks and constructs
 */

export class statics {
  //IAM role name for role created in member / backup accountsstatic variables for role name
  static readonly cab_iamRoleName: string = 'cabackup-role';

  //static variables for organization id
  static readonly cab_orgId: string = 'o-q39c35cgfr'; // gemeentenijmegen-master org ID

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
  static readonly cab_deploymentAccount: string = '418648875085'; // gemeentenijmegen-deployment
  static readonly cab_orgsAccount: string = '449657715968'; // gemeentenijmegen-master
  static readonly cab_backupAccount: string = '943060227071'; // gemeentenijmegen-backup


  static readonly codeStarConnectionArn: string = 'arn:aws:codestar-connections:eu-west-1:418648875085:connection/4f647929-c982-4f30-94f4-24ff7dbf9766';

  //static variable (array) for member accounts. Note!! no spaces in name
  static readonly cab_memberAccount = [
    'gemeentenijmegen-auth-accp', '315037222840', 'eu-west-1',
    'gemeentenijmegen-auth-accp-us', '315037222840', 'us-east-1',
    'gemeentenijmegen-auth-prod', '196212984627', 'eu-west-1',
    'gemeentenijmegen-auth-prod-us', '196212984627', 'us-east-1',
  ];
}