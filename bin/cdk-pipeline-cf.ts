#!/usr/bin/env node
import 'source-map-support/register';
import * as cdk from 'aws-cdk-lib';
import { CdkPipelineCfStack } from '../lib/cdk-pipeline-cf-stack';
//import { GrafanaPipelineStack } from '../lib/pipeline-stack';
import * as path from 'path';

const app = new cdk.App();
new CdkPipelineCfStack(app, 'CdkPipelineCfStack', {
    // env: {
    //     account: process.env.CDK_DEFAULT_ACCOUNT,
    //     region: process.env.CDK_DEFAULT_REGION,
    // },
});