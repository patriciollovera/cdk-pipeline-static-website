import * as cdk from 'aws-cdk-lib';
import { Construct } from 'constructs';
import * as iam from 'aws-cdk-lib/aws-iam';
import { AwsCustomResource, AwsCustomResourcePolicy, PhysicalResourceId, PhysicalResourceIdReference } from 'aws-cdk-lib/custom-resources';


    export class CodeCommitGitCredentialsProps {
    userName: string
    }
  
    export class CodeCommitGitCredentials extends Construct {
    readonly serviceSpecificCredentialId: string;
    readonly serviceName: string;
    readonly serviceUserName: string;
    readonly servicePassword: string;
    readonly status: string;
  
    constructor(scope: Construct, id: string, props: CodeCommitGitCredentialsProps) {
      super(scope, id);
  
      // Create the Git Credentials required
      const gitCredResp = new AwsCustomResource(this, "gitCredentials", {
        // https://docs.aws.amazon.com/AWSJavaScriptSDK/latest/AWS/IAM.html#createServiceSpecificCredential-property
        onCreate: {
          service: "IAM",
          action: "createServiceSpecificCredential",
          parameters: {
            ServiceName: "codecommit.amazonaws.com",
            UserName: props.userName
          },
          physicalResourceId: PhysicalResourceId.fromResponse("ServiceSpecificCredential.ServiceSpecificCredentialId")
        },
        // https://docs.aws.amazon.com/AWSJavaScriptSDK/latest/AWS/IAM.html#deleteServiceSpecificCredential-property
        onDelete: {
          service: "IAM",
          action: "deleteServiceSpecificCredential",
          parameters: {
            ServiceSpecificCredentialId: new PhysicalResourceIdReference(),
            UserName: props.userName
          }
        },
        policy: AwsCustomResourcePolicy.fromSdkCalls({
          resources: AwsCustomResourcePolicy.ANY_RESOURCE,
        }),
      });
  
      this.serviceSpecificCredentialId = gitCredResp.getResponseField("ServiceSpecificCredential.ServiceSpecificCredentialId");
      this.serviceName = gitCredResp.getResponseField("ServiceSpecificCredential.ServiceName");
      this.serviceUserName = gitCredResp.getResponseField("ServiceSpecificCredential.ServiceUserName");
      this.servicePassword = gitCredResp.getResponseField("ServiceSpecificCredential.ServicePassword");
      this.status = gitCredResp.getResponseField("ServiceSpecificCredential.Status");
    }
  }