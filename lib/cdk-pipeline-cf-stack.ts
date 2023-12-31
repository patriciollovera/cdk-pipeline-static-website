import * as cdk from 'aws-cdk-lib';
import { Construct } from 'constructs';
import { userstack } from './user.resources';
import * as codecommit from 'aws-cdk-lib/aws-codecommit';
import {CodeBuildStep, CodePipeline, CodePipelineSource} from "aws-cdk-lib/pipelines";
import {CfStackStage} from './pipeline-stage';

export class CdkPipelineCfStack extends cdk.Stack {
  
  userResources: userstack;

  constructor(scope: Construct, id: string, props?: cdk.StackProps) {
    super(scope, id, props);

    this.userResources = new userstack(this, 'userResources');
    // Creates a CodeCommit repository called 'BasicStack'
    const repo = new codecommit.Repository(this, 'CfPipelineStack', {
        repositoryName: "CfPipelineStack"
    });

    new cdk.CfnOutput(this, 'repoHttpUrl', {value: repo.repositoryCloneUrlHttp});

    // // The basic pipeline declaration. This sets the initial structure
    // of our pipeline
    const pipeline = new CodePipeline(this, 'Pipeline', {
      pipelineName: 'CfPipeline',
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

    const deploy = new CfStackStage(this, 'Deploy');
    const deployStage = pipeline.addStage(deploy);

  }
}
