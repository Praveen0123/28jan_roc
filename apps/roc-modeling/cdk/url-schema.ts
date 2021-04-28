// tslint:disable: no-unused-expression
import cdk = require('@aws-cdk/core');

export interface UrlSchemaProps
{
  domainName: string;
  subdomainName: string;
  environmentName?: 'dev' | 'staging' | 'prod';
  subdomainAliases?: string[];
}

export class UrlSchema extends cdk.Construct
{
  private _siteUrl: string;
  get siteUrl(): string
  {
    return this._siteUrl;
  }

  private _aliasSiteUrls: string[];
  get aliasSiteUrls(): string[]
  {
    return this._aliasSiteUrls;
  }

  private _bucketName: string;
  get bucketName(): string
  {
    return this._bucketName;
  }

  constructor(scope: cdk.Construct, id: string, props: UrlSchemaProps)
  {
    super(scope, id);

    let siteUrl = (props.subdomainName ? props.subdomainName + '.' : '') + props.domainName;
    this._bucketName = `${(props.subdomainName ? props.subdomainName + '.' : '') + props.domainName.replace(/\./g, '-')}-${props.environmentName}-client-bucket`;
    this._aliasSiteUrls = [];
    this._siteUrl = (props.environmentName && props.environmentName !== 'prod' ? props.environmentName + '-' : '') + siteUrl;
    new cdk.CfnOutput(this, 'SiteUrl', { value: 'https://' + siteUrl });

    if (props.subdomainAliases?.length)
    {
      props.subdomainAliases.forEach(subdomainAlias =>
      {
        const aliasSiteUrl = (props.environmentName && props.environmentName !== 'prod' ? props.environmentName + '-' : '') + subdomainAlias + '.' + props.domainName;
        this._aliasSiteUrls.push(aliasSiteUrl);
        new cdk.CfnOutput(this, `AliasSiteUrl ${this._aliasSiteUrls.length}`, { value: 'https://' + aliasSiteUrl });
      });
    }
  }
}
