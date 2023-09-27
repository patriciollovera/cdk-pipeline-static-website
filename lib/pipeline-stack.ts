import * as cdk from 'aws-cdk-lib';
import { Construct } from 'constructs';
import { userstack } from './user.resources';
import * as codecommit from 'aws-cdk-lib/aws-codecommit';

export class GrafanaPipelineStack extends cdk.Stack {
    
    userResources: userstack;

    constructor(scope: Construct, id: string, props?: cdk.StackProps) {
        super(scope, id, props);

        this.userResources = new userstack(this, 'userResources');
        // Creates a CodeCommit repository called 'BasicStack'
        const repo = new codecommit.Repository(this, 'GrafanaPipelineStack', {
            repositoryName: "GrafanaPipelineStack"
        });

        new cdk.CfnOutput(this, 'repoHttpUrl', {value: repo.repositoryCloneUrlHttp});
        

    }
}