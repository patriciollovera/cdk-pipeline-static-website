import * as cdk from 'aws-cdk-lib';
import { Construct } from 'constructs';
import * as timestream from 'aws-cdk-lib/aws-timestream';
import * as grafana from 'aws-cdk-lib/aws-grafana';

import { BlockPublicAccess } from 'aws-cdk-lib/aws-s3';


export interface CFAppProps extends cdk.StackProps {
    stage: string;
    path: string;
    domainName: string;
}

export class CFAppStack extends cdk.Stack {
    
    constructor(scope: Construct, id: string, props: CFAppProps) {
        super(scope, id, props);

        const { stage, path, domainName } = props;

        const staticWebsiteBucket = new cdk.aws_s3.Bucket(
            this,
            `react-app-bucket-v2-${stage}`,
            {
              bucketName: `react-app-v2-${stage}`,
              websiteIndexDocument: 'index.html',
              websiteErrorDocument: 'index.html',
              removalPolicy: cdk.RemovalPolicy.DESTROY,
              publicReadAccess: false,
              blockPublicAccess: BlockPublicAccess.BLOCK_ALL,
            }
        );

        


        

    }
}