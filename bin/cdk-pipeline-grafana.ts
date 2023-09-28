#!/usr/bin/env node
import 'source-map-support/register';
import * as cdk from 'aws-cdk-lib';
import { CdkPipelineGrafanaStack } from '../lib/cdk-pipeline-grafana-stack';
//import { GrafanaPipelineStack } from '../lib/pipeline-stack';

const app = new cdk.App();
new CdkPipelineGrafanaStack(app, 'CdkPipelineGrafanaStack', {});