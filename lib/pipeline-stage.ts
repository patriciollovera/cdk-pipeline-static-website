import { CFAppStack } from './cfapp-stack';
import { Stage, StageProps } from 'aws-cdk-lib';
import { Construct } from 'constructs';
import * as path from 'path';

export class CfStackStage extends Stage {
    constructor(scope: Construct, id: string, props?: StageProps) {
        super(scope, id, props);

        new CFAppStack(this, 'WebService',{
            stage: 'dev',
            path: 'WebService',
            domainName: 'aws-training.com',
        });
    }
}