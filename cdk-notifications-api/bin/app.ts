#!/usr/bin/env node
import 'source-map-support/register';
import * as cdk from 'aws-cdk-lib';
import { NotificationsApiStack } from '../lib/NotificationsApiStack';

const app = new cdk.App();
new NotificationsApiStack(app, 'NotificationsApiStack', {
  env: { account: process.env.CDK_DEFAULT_ACCOUNT || '400650000765', region: 'eu-west-1' },
});
