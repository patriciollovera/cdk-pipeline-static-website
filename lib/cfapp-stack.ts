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
import { HttpsRedirect } from 'aws-cdk-lib/aws-route53-patterns';

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

        const SubDomainBucket = new cdk.aws_s3.Bucket(this, `sub-domain-bucket-${stage}`,
            {
              bucketName: `www.ceocom.com.ar`,
              websiteIndexDocument: 'index.html',
              websiteErrorDocument: 'index.html',
              removalPolicy: cdk.RemovalPolicy.DESTROY,
              publicReadAccess: false,
              blockPublicAccess: BlockPublicAccess.BLOCK_ALL,
            }
        );

        const RootDoaminBucket = new cdk.aws_s3.Bucket(this, `root-domain-bucket-${stage}`,
            {
              bucketName: `ceocom.com.ar`,
              removalPolicy: cdk.RemovalPolicy.DESTROY,
              publicReadAccess: false,
              blockPublicAccess: BlockPublicAccess.BLOCK_ALL,
              websiteRedirect: { 
                hostName: 'www.ceocom.com.ar',
                protocol: cdk.aws_s3.RedirectProtocol.HTTPS,

              },
              websiteIndexDocument: 'index.html',
              websiteErrorDocument: 'index.html',

            }
        );

        const myHostedZone = new route53.HostedZone(this, 'HostedZone', {
            zoneName: domainName,
        });

        const cert = new cdk.aws_certificatemanager.Certificate(this, 'Certificate',
            {
              domainName: domainName,
              validation: cdk.aws_certificatemanager.CertificateValidation.fromDns(myHostedZone),
              subjectAlternativeNames: ['*.ceocom.com.ar'],
            }
        );

        const cloudfrontOAI = new OriginAccessIdentity(this, 'CloudfrontOAI', {
            comment: `Cloudfront OAI for ${domainName}`,
        });

        SubDomainBucket.addToResourcePolicy(
            new cdk.aws_iam.PolicyStatement({
              sid: 's3BucketPublicRead',
              effect: cdk.aws_iam.Effect.ALLOW,
              actions: ['s3:GetObject'],
              principals: [
                new CanonicalUserPrincipal(
                  cloudfrontOAI.cloudFrontOriginAccessIdentityS3CanonicalUserId
                ),
              ],
              resources: [`${SubDomainBucket.bucketArn}/*`],
            })
        );

        RootDoaminBucket.addToResourcePolicy(
          new cdk.aws_iam.PolicyStatement({
            sid: 's3BucketPublicRead',
            effect: cdk.aws_iam.Effect.ALLOW,
            actions: ['s3:GetObject'],
            principals: [
              new CanonicalUserPrincipal(
                cloudfrontOAI.cloudFrontOriginAccessIdentityS3CanonicalUserId
              ),
            ],
            resources: [`${RootDoaminBucket.bucketArn}/*`],
          })
        );


        const viewerCert = ViewerCertificate.fromAcmCertificate(
            {
              certificateArn: cert.certificateArn,
              env: {
                region: props.region,
                account: props.account,
              },
              applyRemovalPolicy: cert.applyRemovalPolicy,
              node: this.node,
              stack: this,
              metricDaysToExpiry: () =>
                new Metric({
                  namespace: 'TLS viewer certificate validity',
                  metricName: 'TLS Viewer Certificate expired',
                }),
            },
            {
              sslMethod: SSLMethod.SNI,
              securityPolicy: SecurityPolicyProtocol.TLS_V1_2_2021,
              aliases: [domainName],
            }
        );

        const distribution = new CloudFrontWebDistribution(this, 'sub-domain-distro',
            {
              viewerCertificate: viewerCert,
              originConfigs: [
                {
                  s3OriginSource: {
                    s3BucketSource: SubDomainBucket,
                    originAccessIdentity: cloudfrontOAI,
                  },
                  behaviors: [
                    {
                      isDefaultBehavior: true,
                      compress: true,
                      allowedMethods: CloudFrontAllowedMethods.GET_HEAD_OPTIONS,
                      viewerProtocolPolicy: cdk.aws_cloudfront.ViewerProtocolPolicy.REDIRECT_TO_HTTPS,
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