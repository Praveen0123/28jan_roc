// tslint:disable: no-unused-expression
import cdk = require('@aws-cdk/core');
import
{
  HostedZone,
  ARecord,
  AaaaRecord,
  RecordTarget,
} from '@aws-cdk/aws-route53';

export interface RouteConfigureProps
{
  domainName: string;
  siteUrl: string;
  aliasSiteUrls: string[];
  recordTarget: RecordTarget;
}

export class RouteConfigure extends cdk.Construct
{
  constructor(scope: cdk.Construct, id: string, props: RouteConfigureProps)
  {
    super(scope, id);

    const zone = HostedZone.fromLookup(this, 'HostedZone', {
      domainName: props.domainName,
    });

    new ARecord(this, 'AAlias', {
      zone,
      recordName: props.siteUrl,
      target: props.recordTarget,
    });

    new AaaaRecord(this, 'AaaaAlias', {
      zone,
      recordName: props.siteUrl,
      target: props.recordTarget,
    });

    props.aliasSiteUrls.forEach((aliasSiteUrl, index) =>
    {
      new ARecord(this, `AAlias aliasSiteUrl ${index + 1}`, {
        zone,
        recordName: aliasSiteUrl,
        target: props.recordTarget,
      });

      new AaaaRecord(this, `AaaaAlias aliasSiteUrl ${index + 1}`, {
        zone,
        recordName: aliasSiteUrl,
        target: props.recordTarget,
      });
    });
  }
}
