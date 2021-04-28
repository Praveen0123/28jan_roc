// tslint:disable: no-unused-expression
import * as cdk from '@aws-cdk/core';
import * as s3 from '@aws-cdk/aws-s3';
import * as s3deploy from '@aws-cdk/aws-s3-deployment';

import
{
  CloudFrontWebDistribution,
  OriginAccessIdentity,
  Behavior,
  CloudFrontWebDistributionProps,
  ViewerCertificate,
} from '@aws-cdk/aws-cloudfront';
import { HostedZone, ARecord, AaaaRecord, RecordTarget } from '@aws-cdk/aws-route53';
import { Certificate, DnsValidatedCertificate, ICertificate } from '@aws-cdk/aws-certificatemanager';
import { CloudFrontTarget } from '@aws-cdk/aws-route53-targets';

export interface SpaDeployProps
{
  domainName: string;
  subdomainName: string;
  websiteFolder: string;
  indexDoc?: string;
  errorDoc?: string;
  environmentName?: 'dev' | 'staging' | 'prod';
  certificateArn?: string;
  subdomainAliases?: string[];
  cfBehaviors?: Behavior[];
}

/**
  * S3 Deployment, cloudfront distribution, ssl cert and error forwarding auto
  * configured by using the details in the hosted zone provided.
  */
export class SpaDeploy extends cdk.Construct
{
  constructor(scope: cdk.Construct, id: string, props: SpaDeployProps)
  {
    super(scope, id);
    props = this.setDefaultProps(props);

    let siteUrl = (props.subdomainName ? props.subdomainName + '.' : '') + props.domainName;
    const bucketName = `${siteUrl.replace(/\./g, '-')}-${props.environmentName}-client-bucket`;
    const aliasSiteUrls: string[] = [];
    siteUrl = (props.environmentName && props.environmentName !== 'prod' ? props.environmentName + '-' : '') + siteUrl;
    new cdk.CfnOutput(this, 'SiteUrl', { value: 'https://' + siteUrl });

    if (props.subdomainAliases?.length)
    {
      props.subdomainAliases.forEach(subdomainAlias =>
      {
        const aliasSiteUrl = (props.environmentName && props.environmentName !== 'prod' ? props.environmentName + '-' : '') + subdomainAlias + '.' + props.domainName;
        aliasSiteUrls.push(aliasSiteUrl);
        new cdk.CfnOutput(this, `AliasSiteUrl ${aliasSiteUrls.length}`, { value: 'https://' + aliasSiteUrl });
      });
    }

    const websiteBucket = new s3.Bucket(this, 'WebsiteBucket', {
      removalPolicy: cdk.RemovalPolicy.DESTROY,
      websiteIndexDocument: props.indexDoc,
      websiteErrorDocument: props.errorDoc,
      publicReadAccess: false,
      blockPublicAccess: s3.BlockPublicAccess.BLOCK_ALL,
      bucketName
    });
    new cdk.CfnOutput(this, 'BucketName', { value: websiteBucket.bucketName });

    const zone = HostedZone.fromLookup(this, 'HostedZone', { domainName: props.domainName });

    let cert: ICertificate;
    if (props.certificateArn)
    {
      cert = Certificate.fromCertificateArn(this, 'Certificate', props.certificateArn);
    } else
    {
      cert = new DnsValidatedCertificate(this, 'Certificate', {
        hostedZone: zone,
        domainName: `*.${props.domainName}`,
        region: 'us-east-1',
      });
    }

    new cdk.CfnOutput(this, 'CertificateArn', { value: cert.certificateArn });

    const accessIdentity = new OriginAccessIdentity(this, 'OriginAccessIdentity', { comment: `${websiteBucket.bucketName}-access-identity` });
    const distribution = new CloudFrontWebDistribution(this, 'cloudfrontDistribution', this.getCfWebDistributionProps(websiteBucket, props, accessIdentity, cert, [siteUrl, ...aliasSiteUrls]));
    new cdk.CfnOutput(this, 'DistributionId', { value: distribution.distributionId });

    new s3deploy.BucketDeployment(this, 'BucketDeployment', {
      sources: [s3deploy.Source.asset(props.websiteFolder)],
      destinationBucket: websiteBucket,
      // Invalidate the cache for / and index.html when we deploy so that cloudfront serves latest site
      distribution,
      distributionPaths: ['/*'],
    });

    new ARecord(this, 'AAlias', {
      zone,
      recordName: siteUrl,
      target: RecordTarget.fromAlias(new CloudFrontTarget(distribution)),
    });

    new AaaaRecord(this, 'AaaaAlias', {
      zone,
      recordName: siteUrl,
      target: RecordTarget.fromAlias(new CloudFrontTarget(distribution)),
    });

    aliasSiteUrls.forEach((aliasSiteUrl, index) =>
    {
      new ARecord(this, `AAlias aliasSiteUrl ${index + 1}`, {
        zone,
        recordName: aliasSiteUrl,
        target: RecordTarget.fromAlias(new CloudFrontTarget(distribution)),
      });

      new AaaaRecord(this, `AaaaAlias aliasSiteUrl ${index + 1}`, {
        zone,
        recordName: aliasSiteUrl,
        target: RecordTarget.fromAlias(new CloudFrontTarget(distribution)),
      });
    });

    new cdk.CfnOutput(this, "URL", {
      description: "The URL of the site",
      value: distribution.distributionDomainName,
    });
  }

  private setDefaultProps(props: SpaDeployProps): SpaDeployProps
  {
    const defaults: Partial<SpaDeployProps> = {
      indexDoc: 'index.html',
      errorDoc: 'index.html',
      environmentName: 'dev',
    };

    return { ...defaults, ...props };
  }

  /**
   * Helper method to provide configuration for cloudfront
   */
  private getCfWebDistributionProps(websiteBucket: s3.Bucket, spaDeployProps: SpaDeployProps, accessIdentity: OriginAccessIdentity, cert: ICertificate, siteUrls: string[]): CloudFrontWebDistributionProps
  {
    websiteBucket.grantRead(accessIdentity);
    const cfConfig: CloudFrontWebDistributionProps = {
      originConfigs: [
        {
          s3OriginSource: {
            s3BucketSource: websiteBucket,
            originAccessIdentity: accessIdentity,
          },
          behaviors: spaDeployProps.cfBehaviors ? spaDeployProps.cfBehaviors : [{ isDefaultBehavior: true }],
        },
      ],
      // We need to redirect all unknown routes back to index.html for angular routing to work
      errorConfigurations: [{
        errorCode: 403,
        responsePagePath: `/${spaDeployProps.errorDoc}`,
        responseCode: 200,
      },
      {
        errorCode: 404,
        responsePagePath: `/${spaDeployProps.errorDoc}`,
        responseCode: 200,
      }],
      viewerCertificate: ViewerCertificate.fromAcmCertificate(cert, {
        aliases: siteUrls,
      })
    };

    return cfConfig;
  }
}
