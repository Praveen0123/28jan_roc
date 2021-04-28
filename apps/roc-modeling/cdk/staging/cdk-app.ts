#!/usr/bin/env node
// tslint:disable: no-unused-expression
import 'source-map-support/register';
import * as cdk from '@aws-cdk/core';
import { RocModelingStagingStack } from './roc-modeling-staging';

const app = new cdk.App();
new RocModelingStagingStack(app, 'RocModelingStagingStack', {
  description: 'Roc Modeling Staging Client Hosting. S3 + CloudFront + CertificateManager + Route53',
  env: {
    account: process.env.CDK_DEFAULT_ACCOUNT,
    region: process.env.CDK_DEFAULT_REGION
  }
});
