import * as cdk from 'aws-cdk-lib';
import { Construct } from 'constructs';
import * as timestream from 'aws-cdk-lib/aws-timestream';



export class GrafanaStack extends cdk.Stack {
    
    constructor(scope: Construct, id: string, props?: cdk.StackProps) {
        super(scope, id, props);

        const timestreamdb = new timestream.CfnDatabase(this, 'SimpleTimeStreamDatabase', {
            databaseName: 'SimpleTimeStreamDatabase',
        });
        

    }
}