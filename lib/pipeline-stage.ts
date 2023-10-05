import { CFAppStack } from './cfapp-stack';
import { Stage, StageProps } from 'aws-cdk-lib';
import { Construct } from 'constructs';
import * as path from 'path';

export class CfStackStage extends Stage {
    constructor(scope: Construct, id: string, props?: StageProps) {
        super(scope, id, props);

        new CFAppStack(this, 'WebService',{
            stage: 'dev',
            path: path.join(__dirname, '..', 'react-app'),
            domainName: 'ceocom.com.ar',
            account: '206251961235',
            region: 'us-east-1',
        });
    }
}