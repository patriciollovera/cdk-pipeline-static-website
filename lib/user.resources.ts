import * as cdk from 'aws-cdk-lib';
import { Construct } from 'constructs';
import * as iam from 'aws-cdk-lib/aws-iam';
import { CodeCommitGitCredentials, CodeCommitGitCredentialsProps } from './gitcredential-service';



export class userstack extends Construct {

  constructor(scope: Construct, id: string)
    {
      super(scope, id);

      // 👇 Create group
      const group = new iam.Group(this, 'example-group', {
        managedPolicies: [
          iam.ManagedPolicy.fromAwsManagedPolicyName('AWSCodePipeline_FullAccess'),
        ],
      });

      // 👇 Create Managed Policy
      const FullAccessPolicy = iam.ManagedPolicy.fromAwsManagedPolicyName('AWSCodePipeline_FullAccess');
      const PowerUserPolicy = iam.ManagedPolicy.fromAwsManagedPolicyName('AWSCodeCommitPowerUser');
      const ReadOnlyPolicy = iam.ManagedPolicy.fromAwsManagedPolicyName('AWSCodeCommitReadOnly');

      // 👇 Create Permissions Boundary
      const permissionsBoundary = new iam.ManagedPolicy(
        this,
        'example-permissions-boundary',
        {
          statements: [
            new iam.PolicyStatement({
              effect: iam.Effect.ALLOW,
              actions: ['codecommit:*'],
              resources: ['*'],
            }),
          ],
        },
      );
    

      // 👇 Create User
      const user = new iam.User(this, 'example-user-2', {
        userName: 'example-user-2',
        managedPolicies: [FullAccessPolicy,PowerUserPolicy,ReadOnlyPolicy],
        groups: [group],
        permissionsBoundary,
      
      });
    
      const credentials = new CodeCommitGitCredentials (this, 'credentials', {userName: user.userName});
      
      new cdk.CfnOutput(this, 'serviceName', {value: credentials.serviceName});
      new cdk.CfnOutput(this, 'username', {value: credentials.serviceUserName});
      new cdk.CfnOutput(this, 'password', {value: credentials.servicePassword});
      new cdk.CfnOutput(this, 'credentialId', {value: credentials.serviceSpecificCredentialId});

      
      
    }
}