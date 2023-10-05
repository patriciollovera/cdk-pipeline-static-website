import * as cdk from 'aws-cdk-lib';
import { Construct } from 'constructs';
import * as timestream from 'aws-cdk-lib/aws-timestream';
import * as grafana from 'aws-cdk-lib/aws-grafana';

import { BlockPublicAccess } from 'aws-cdk-lib/aws-s3';
import { CanonicalUserPrincipal } from 'aws-cdk-lib/aws-iam';

import {
    CloudFrontAllowedMethods,
    CloudFrontWebDistribution,
    OriginAccessIdentity,
    SecurityPolicyProtocol,
    SSLMethod,
    ViewerCertificate,
  } from 'aws-cdk-lib/aws-cloudfront';

import { Metric } from 'aws-cdk-lib/aws-cloudwatch';
import { PropagatedTagSource } from 'aws-cdk-lib/aws-ecs';

import * as route53 from 'aws-cdk-lib/aws-route53';

export interface CFAppProps extends cdk.StackProps {
    stage: string;
    path: string;
    domainName: string;
    account: string;
    region: string;
}

export class CFAppStack extends cdk.Stack {
    
    constructor(scope: Construct, id: string, props: CFAppProps) {
        super(scope, id, props);

        const { stage, path, domainName } = props;

        const staticWebsiteBucket = new cdk.aws_s3.Bucket(this, `react-app-bucket-v2-${stage}`,
            {
              bucketName: `react-app-v2-${stage}`,
              websiteIndexDocument: 'index.html',
              websiteErrorDocument: 'index.html',
              removalPolicy: cdk.RemovalPolicy.DESTROY,
              publicReadAccess: false,
              blockPublicAccess: BlockPublicAccess.BLOCK_ALL,
            }
        );


        const myHostedZone = new route53.HostedZone(this, 'HostedZone', {
            zoneName: 'ceocom.com.ar',
        });

        // const cert = new cdk.aws_certificatemanager.Certificate(this, 'Certificate',
        //     {
        //       domainName: domainName,
        //       validation: cdk.aws_certificatemanager.CertificateValidation.fromDns(myHostedZone),
        //     }
        // );

        const cloudfrontOAI = new OriginAccessIdentity(this, 'CloudfrontOAI', {
            comment: `Cloudfront OAI for ${domainName}`,
        });

        staticWebsiteBucket.addToResourcePolicy(
            new cdk.aws_iam.PolicyStatement({
              sid: 's3BucketPublicRead',
              effect: cdk.aws_iam.Effect.ALLOW,
              actions: ['s3:GetObject'],
              principals: [
                new CanonicalUserPrincipal(
                  cloudfrontOAI.cloudFrontOriginAccessIdentityS3CanonicalUserId
                ),
              ],
              resources: [`${staticWebsiteBucket.bucketArn}/*`],
            })
        );


        // const viewerCert = ViewerCertificate.fromAcmCertificate(
        //     {
        //       certificateArn: cert.certificateArn,
        //       env: {
        //         region: props.region,
        //         account: props.account,
        //       },
        //       applyRemovalPolicy: cert.applyRemovalPolicy,
        //       node: this.node,
        //       stack: this,
        //       metricDaysToExpiry: () =>
        //         new Metric({
        //           namespace: 'TLS viewer certificate validity',
        //           metricName: 'TLS Viewer Certificate expired',
        //         }),
        //     },
        //     {
        //       sslMethod: SSLMethod.SNI,
        //       securityPolicy: SecurityPolicyProtocol.TLS_V1_1_2016,
        //       aliases: [domainName],
        //     }
        // );

        const distribution = new CloudFrontWebDistribution(this, 'react-app-v2-distro',
            {
              // viewerCertificate: viewerCert,
              originConfigs: [
                {
                  s3OriginSource: {
                    s3BucketSource: staticWebsiteBucket,
                    originAccessIdentity: cloudfrontOAI,
                  },
                  behaviors: [
                    {
                      isDefaultBehavior: true,
                      compress: true,
                      allowedMethods: CloudFrontAllowedMethods.GET_HEAD_OPTIONS,
                    },
                  ],
                },
              ],
            }
        );



        new cdk.aws_s3_deployment.BucketDeployment(this, `react-app-deployment-v2-${stage}`,
            {
              destinationBucket: staticWebsiteBucket,
              sources: [cdk.aws_s3_deployment.Source.asset(path)],
              cacheControl: [
                cdk.aws_s3_deployment.CacheControl.maxAge(cdk.Duration.days(1)),
              ],
              distribution,
            }
        );

    }
}