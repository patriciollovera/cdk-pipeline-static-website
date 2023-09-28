import { GrafanaStack } from './grafana-stack';
import { Stage, StageProps } from 'aws-cdk-lib';
import { Construct } from 'constructs';

export class GrafanaStackStage extends Stage {
    constructor(scope: Construct, id: string, props?: StageProps) {
        super(scope, id, props);

        new GrafanaStack(this, 'WebService',{
            databaseName: 'SimpleTimeStreamDatabase_2',
            tableName: 'Device_table_2',
        });
    }
}