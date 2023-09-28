import * as cdk from 'aws-cdk-lib';
import { Construct } from 'constructs';
import { userstack } from './user.resources';
import * as codecommit from 'aws-cdk-lib/aws-codecommit';
import {CodeBuildStep, CodePipeline, CodePipelineSource} from "aws-cdk-lib/pipelines";

export class CdkPipelineGrafanaStack extends cdk.Stack {
  
  userResources: userstack;

  constructor(scope: Construct, id: string, props?: cdk.StackProps) {
    super(scope, id, props);

    this.userResources = new userstack(this, 'userResources');
    // Creates a CodeCommit repository called 'BasicStack'
    const repo = new codecommit.Repository(this, 'GrafanaPipelineStack', {
        repositoryName: "GrafanaPipelineStack"
    });

    new cdk.CfnOutput(this, 'repoHttpUrl', {value: repo.repositoryCloneUrlHttp});

    // // The basic pipeline declaration. This sets the initial structure
    // of our pipeline
    const pipeline = new CodePipeline(this, 'Pipeline', {
      pipelineName: 'TrainingPipeline',
      synth: new CodeBuildStep('SynthStep', {
              input: CodePipelineSource.codeCommit(repo, 'master'),
              installCommands: [
                  'npm install -g aws-cdk',
                  'npm install typescript@latest -g',
                  'tsc --init'
              ],
              commands: [
                  'npm install --omit=dev',
                  'npm run build',
                  'npx cdk synth'
              ]
          }
      )
    });

  }
}
