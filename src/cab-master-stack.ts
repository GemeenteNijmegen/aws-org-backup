
import * as ssm from '@aws-cdk/aws-ssm';
import * as core from '@aws-cdk/core';

export class CabMasterStack extends core.Stack {
  constructor(scope: core.Construct, id: string) {
    super(scope, id);

    const importedCentralVaultArn = core.Fn.importValue('centralVaultArn');

    new ssm.StringParameter(this, 'cab-member-role-ssmparameter', {
      description: 'Role name of AWS Backup role deployed to all member accounts',
      parameterName: 'ARNTest',
      stringValue: importedCentralVaultArn.toString(),
    });

  }
}
