import * as cdk from 'aws-cdk-lib';
import { Construct } from 'constructs';
import * as timestream from 'aws-cdk-lib/aws-timestream';

export interface TimestreamConstructProps {
    databaseName: string;
    tableName:string;
}

export class GrafanaStack extends cdk.Stack {
    
    constructor(scope: Construct, id: string, props: TimestreamConstructProps) {
        super(scope, id);

        const timestreamdb = new timestream.CfnDatabase(this, 'SimpleTimeStreamDatabase', {
            databaseName: props.databaseName,
        });

        const timestreamtable = new timestream.CfnTable(this, 'SimpleTimeStreamTable', {
            tableName: props.tableName,
            databaseName: props.databaseName,
        });
          
        timestreamtable.node.addDependency(timestreamdb);
        

    }
}