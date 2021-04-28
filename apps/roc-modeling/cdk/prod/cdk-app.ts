#!/usr/bin/env node
// tslint:disable: no-unused-expression
import 'source-map-support/register';
import * as cdk from '@aws-cdk/core';
import { RocModelingProdStack } from './roc-modeling-prod-stack';


const app = new cdk.App();
new RocModelingProdStack(app, 'RocModelingProdStack', {
  description: 'Roc Modeling Prod Client Hosting. S3 + CloudFront + CertificateManager + Route53',
  env: {
    account: process.env.CDK_DEFAULT_ACCOUNT,
    region: process.env.CDK_DEFAULT_REGION
  }
});
