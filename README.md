# Welcome to your CDK TypeScript project

This is a blank project for CDK development with TypeScript.

The `cdk.json` file tells the CDK Toolkit how to execute your app.

## Useful commands

* `npm run build`   compile typescript to js
* `npm run watch`   watch for changes and compile
* `npm run test`    perform the jest unit tests
* `cdk deploy`      deploy this stack to your default AWS account/region
* `cdk diff`        compare deployed stack with current state
* `cdk synth`       emits the synthesized CloudFormation template


Pre-requisites:

You need a domain under your control


This project includes a main pipeline stack which creates the pipeline itself, the repository and user resources so you do not need to login into the AWS console and create any user or credentials.

Run "cdk deploy" the first time and after the deployment the username and password and the Repo URL will be displayed in the console.

As a second step, use those credentials and URL to push the code to the repository just created.

This will trigger the deployment of the static website infrastruture containing:

- S3 Bucket
- Route53 Hosted Zone
- Certificate
- Cloud Front Distribution
- Required policies and permissions.

After Route 53 hosted zone creation you need to configure AWS provided records in your Domain provided.

As we are validating the certificate using DNS, the deployment won`t finalize until the DNS records are properly propagated.

Finaly, there is one manual step, after the certificate is validated you need to crated the records in Route 53 for that certificate.



