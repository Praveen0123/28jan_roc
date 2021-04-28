// tslint:disable: no-unused-expression
import * as cdk from '@aws-cdk/core';

import { IHostedZone } from '@aws-cdk/aws-route53';
import { Certificate, DnsValidatedCertificate, ICertificate } from '@aws-cdk/aws-certificatemanager';

export interface CertConfigureProps
{
  hostedZone: IHostedZone;
  certificateArn?: string;
}

export class CertConfigure extends cdk.Construct
{
  private _cert: ICertificate;
  get cert(): ICertificate
  {
    return this._cert;
  }

  constructor(scope: cdk.Construct, id: string, props: CertConfigureProps)
  {
    super(scope, id);

    if (props.certificateArn)
    {
      this._cert = Certificate.fromCertificateArn(
        this,
        'Certificate',
        props.certificateArn,
      );
    } else
    {
      this._cert = new DnsValidatedCertificate(this, 'Certificate', {
        hostedZone: props.hostedZone,
        domainName: `*.${props.hostedZone.zoneName}`,
        region: 'us-east-1',
      });
    }
    new cdk.CfnOutput(this, 'CertificateArn', { value: this._cert.certificateArn });
  }
}
