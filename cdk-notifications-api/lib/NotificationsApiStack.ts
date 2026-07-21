import * as cdk from 'aws-cdk-lib';
import * as apigateway from 'aws-cdk-lib/aws-apigateway';
import * as lambda from 'aws-cdk-lib/aws-lambda';
import * as cognito from 'aws-cdk-lib/aws-cognito';
import { Construct } from 'constructs';

export class NotificationsApiStack extends cdk.Stack {
  constructor(scope: Construct, id: string, props?: cdk.StackProps) {
    super(scope, id, props);

    const userPoolId = process.env.COGNITO_USER_POOL_ID || 'YOUR_USER_POOL_ID'; 
    const userPool = cognito.UserPool.fromUserPoolId(this, 'ExistingUserPool', userPoolId);

    const fcmLambda = lambda.Function.fromFunctionArn(
      this, 
      'FcmTokensApiLambda', 
      `arn:aws:lambda:${this.region}:${this.account}:function:fcmTokensAPI`
    );

    const api = new apigateway.RestApi(this, 'NotificationsApi', {
      restApiName: 'FCM Notifications API',
      description: 'API Gateway for handling FCM token registration securely',
      defaultCorsPreflightOptions: {
        allowOrigins: apigateway.Cors.ALL_ORIGINS,
        allowMethods: apigateway.Cors.ALL_METHODS,
        allowHeaders: [
          'Content-Type', 
          'Authorization', 
          'X-Amz-Date', 
          'X-Api-Key', 
          'X-Amz-Security-Token'
        ],
      },
    });

    const authorizer = new apigateway.CognitoUserPoolsAuthorizer(this, 'NotificationsCognitoAuthorizer', {
      cognitoUserPools: [userPool],
    });

    const register = api.root.addResource('register');
    
    register.addMethod(
      'POST', 
      new apigateway.LambdaIntegration(fcmLambda), 
      {
        authorizer: authorizer,
        authorizationType: apigateway.AuthorizationType.COGNITO,
      }
    );

    new cdk.CfnOutput(this, 'NotificationsApiUrl', {
      value: `${api.url}register`,
      description: 'The URL for token registration. Update firebaseMessaging.ts in the frontend to use this URL.',
    });
  }
}
