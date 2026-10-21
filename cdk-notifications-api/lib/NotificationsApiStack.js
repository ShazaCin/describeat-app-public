"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
exports.NotificationsApiStack = void 0;
const cdk = __importStar(require("aws-cdk-lib"));
const apigateway = __importStar(require("aws-cdk-lib/aws-apigateway"));
const lambda = __importStar(require("aws-cdk-lib/aws-lambda"));
const cognito = __importStar(require("aws-cdk-lib/aws-cognito"));
class NotificationsApiStack extends cdk.Stack {
    constructor(scope, id, props) {
        super(scope, id, props);
        const userPoolId = process.env.COGNITO_USER_POOL_ID || 'YOUR_USER_POOL_ID';
        const userPool = cognito.UserPool.fromUserPoolId(this, 'ExistingUserPool', userPoolId);
        const fcmLambda = lambda.Function.fromFunctionArn(this, 'FcmTokensApiLambda', `arn:aws:lambda:${this.region}:${this.account}:function:fcmTokensAPI`);
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
        register.addMethod('POST', new apigateway.LambdaIntegration(fcmLambda), {
            authorizer: authorizer,
            authorizationType: apigateway.AuthorizationType.COGNITO,
        });
        new cdk.CfnOutput(this, 'NotificationsApiUrl', {
            value: `${api.url}register`,
            description: 'The URL for token registration. Update firebaseMessaging.ts in the frontend to use this URL.',
        });
    }
}
exports.NotificationsApiStack = NotificationsApiStack;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiTm90aWZpY2F0aW9uc0FwaVN0YWNrLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiTm90aWZpY2F0aW9uc0FwaVN0YWNrLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7OztBQUFBLE1BQVksR0FBRyx3Q0FBb0I7QUFDbkMsTUFBWSxVQUFVLHVEQUFtQztBQUN6RCxNQUFZLE1BQU0sbURBQStCO0FBQ2pELE1BQVksT0FBTyxvREFBZ0M7QUFHbkQsMkJBQW1DLFNBQVEsR0FBRyxDQUFDLEtBQUs7SUFDbEQsWUFBWSxLQUFnQixFQUFFLEVBQVUsRUFBRSxLQUFzQjtRQUM5RCxLQUFLLENBQUMsS0FBSyxFQUFFLEVBQUUsRUFBRSxLQUFLLENBQUMsQ0FBQztRQUV4QixNQUFNLFVBQVUsR0FBRyxPQUFPLENBQUMsR0FBRyxDQUFDLG9CQUFvQixJQUFJLG1CQUFtQixDQUFDO1FBQzNFLE1BQU0sUUFBUSxHQUFHLE9BQU8sQ0FBQyxRQUFRLENBQUMsY0FBYyxDQUFDLElBQUksRUFBRSxrQkFBa0IsRUFBRSxVQUFVLENBQUMsQ0FBQztRQUV2RixNQUFNLFNBQVMsR0FBRyxNQUFNLENBQUMsUUFBUSxDQUFDLGVBQWUsQ0FDL0MsSUFBSSxFQUNKLG9CQUFvQixFQUNwQixrQkFBa0IsSUFBSSxDQUFDLE1BQU0sSUFBSSxJQUFJLENBQUMsT0FBTyx3QkFBd0IsQ0FDdEUsQ0FBQztRQUVGLE1BQU0sR0FBRyxHQUFHLElBQUksVUFBVSxDQUFDLE9BQU8sQ0FBQyxJQUFJLEVBQUUsa0JBQWtCLEVBQUU7WUFDM0QsV0FBVyxFQUFFLHVCQUF1QjtZQUNwQyxXQUFXLEVBQUUsMERBQTBEO1lBQ3ZFLDJCQUEyQixFQUFFO2dCQUMzQixZQUFZLEVBQUUsVUFBVSxDQUFDLElBQUksQ0FBQyxXQUFXO2dCQUN6QyxZQUFZLEVBQUUsVUFBVSxDQUFDLElBQUksQ0FBQyxXQUFXO2dCQUN6QyxZQUFZLEVBQUU7b0JBQ1osY0FBYztvQkFDZCxlQUFlO29CQUNmLFlBQVk7b0JBQ1osV0FBVztvQkFDWCxzQkFBc0I7aUJBQ3ZCO2FBQ0Y7U0FDRixDQUFDLENBQUM7UUFFSCxNQUFNLFVBQVUsR0FBRyxJQUFJLFVBQVUsQ0FBQywwQkFBMEIsQ0FBQyxJQUFJLEVBQUUsZ0NBQWdDLEVBQUU7WUFDbkcsZ0JBQWdCLEVBQUUsQ0FBQyxRQUFRLENBQUM7U0FDN0IsQ0FBQyxDQUFDO1FBRUgsTUFBTSxRQUFRLEdBQUcsR0FBRyxDQUFDLElBQUksQ0FBQyxXQUFXLENBQUMsVUFBVSxDQUFDLENBQUM7UUFFbEQsUUFBUSxDQUFDLFNBQVMsQ0FDaEIsTUFBTSxFQUNOLElBQUksVUFBVSxDQUFDLGlCQUFpQixDQUFDLFNBQVMsQ0FBQyxFQUMzQztZQUNFLFVBQVUsRUFBRSxVQUFVO1lBQ3RCLGlCQUFpQixFQUFFLFVBQVUsQ0FBQyxpQkFBaUIsQ0FBQyxPQUFPO1NBQ3hELENBQ0YsQ0FBQztRQUVGLElBQUksR0FBRyxDQUFDLFNBQVMsQ0FBQyxJQUFJLEVBQUUscUJBQXFCLEVBQUU7WUFDN0MsS0FBSyxFQUFFLEdBQUcsR0FBRyxDQUFDLEdBQUcsVUFBVTtZQUMzQixXQUFXLEVBQUUsOEZBQThGO1NBQzVHLENBQUMsQ0FBQztJQUNMLENBQUM7Q0FDRiIsInNvdXJjZXNDb250ZW50IjpbImltcG9ydCAqIGFzIGNkayBmcm9tICdhd3MtY2RrLWxpYic7XG5pbXBvcnQgKiBhcyBhcGlnYXRld2F5IGZyb20gJ2F3cy1jZGstbGliL2F3cy1hcGlnYXRld2F5JztcbmltcG9ydCAqIGFzIGxhbWJkYSBmcm9tICdhd3MtY2RrLWxpYi9hd3MtbGFtYmRhJztcbmltcG9ydCAqIGFzIGNvZ25pdG8gZnJvbSAnYXdzLWNkay1saWIvYXdzLWNvZ25pdG8nO1xuaW1wb3J0IHsgQ29uc3RydWN0IH0gZnJvbSAnY29uc3RydWN0cyc7XG5cbmV4cG9ydCBjbGFzcyBOb3RpZmljYXRpb25zQXBpU3RhY2sgZXh0ZW5kcyBjZGsuU3RhY2sge1xuICBjb25zdHJ1Y3RvcihzY29wZTogQ29uc3RydWN0LCBpZDogc3RyaW5nLCBwcm9wcz86IGNkay5TdGFja1Byb3BzKSB7XG4gICAgc3VwZXIoc2NvcGUsIGlkLCBwcm9wcyk7XG5cbiAgICBjb25zdCB1c2VyUG9vbElkID0gcHJvY2Vzcy5lbnYuQ09HTklUT19VU0VSX1BPT0xfSUQgfHwgJ1lPVVJfVVNFUl9QT09MX0lEJzsgXG4gICAgY29uc3QgdXNlclBvb2wgPSBjb2duaXRvLlVzZXJQb29sLmZyb21Vc2VyUG9vbElkKHRoaXMsICdFeGlzdGluZ1VzZXJQb29sJywgdXNlclBvb2xJZCk7XG5cbiAgICBjb25zdCBmY21MYW1iZGEgPSBsYW1iZGEuRnVuY3Rpb24uZnJvbUZ1bmN0aW9uQXJuKFxuICAgICAgdGhpcywgXG4gICAgICAnRmNtVG9rZW5zQXBpTGFtYmRhJywgXG4gICAgICBgYXJuOmF3czpsYW1iZGE6JHt0aGlzLnJlZ2lvbn06JHt0aGlzLmFjY291bnR9OmZ1bmN0aW9uOmZjbVRva2Vuc0FQSWBcbiAgICApO1xuXG4gICAgY29uc3QgYXBpID0gbmV3IGFwaWdhdGV3YXkuUmVzdEFwaSh0aGlzLCAnTm90aWZpY2F0aW9uc0FwaScsIHtcbiAgICAgIHJlc3RBcGlOYW1lOiAnRkNNIE5vdGlmaWNhdGlvbnMgQVBJJyxcbiAgICAgIGRlc2NyaXB0aW9uOiAnQVBJIEdhdGV3YXkgZm9yIGhhbmRsaW5nIEZDTSB0b2tlbiByZWdpc3RyYXRpb24gc2VjdXJlbHknLFxuICAgICAgZGVmYXVsdENvcnNQcmVmbGlnaHRPcHRpb25zOiB7XG4gICAgICAgIGFsbG93T3JpZ2luczogYXBpZ2F0ZXdheS5Db3JzLkFMTF9PUklHSU5TLFxuICAgICAgICBhbGxvd01ldGhvZHM6IGFwaWdhdGV3YXkuQ29ycy5BTExfTUVUSE9EUyxcbiAgICAgICAgYWxsb3dIZWFkZXJzOiBbXG4gICAgICAgICAgJ0NvbnRlbnQtVHlwZScsIFxuICAgICAgICAgICdBdXRob3JpemF0aW9uJywgXG4gICAgICAgICAgJ1gtQW16LURhdGUnLCBcbiAgICAgICAgICAnWC1BcGktS2V5JywgXG4gICAgICAgICAgJ1gtQW16LVNlY3VyaXR5LVRva2VuJ1xuICAgICAgICBdLFxuICAgICAgfSxcbiAgICB9KTtcblxuICAgIGNvbnN0IGF1dGhvcml6ZXIgPSBuZXcgYXBpZ2F0ZXdheS5Db2duaXRvVXNlclBvb2xzQXV0aG9yaXplcih0aGlzLCAnTm90aWZpY2F0aW9uc0NvZ25pdG9BdXRob3JpemVyJywge1xuICAgICAgY29nbml0b1VzZXJQb29sczogW3VzZXJQb29sXSxcbiAgICB9KTtcblxuICAgIGNvbnN0IHJlZ2lzdGVyID0gYXBpLnJvb3QuYWRkUmVzb3VyY2UoJ3JlZ2lzdGVyJyk7XG4gICAgXG4gICAgcmVnaXN0ZXIuYWRkTWV0aG9kKFxuICAgICAgJ1BPU1QnLCBcbiAgICAgIG5ldyBhcGlnYXRld2F5LkxhbWJkYUludGVncmF0aW9uKGZjbUxhbWJkYSksIFxuICAgICAge1xuICAgICAgICBhdXRob3JpemVyOiBhdXRob3JpemVyLFxuICAgICAgICBhdXRob3JpemF0aW9uVHlwZTogYXBpZ2F0ZXdheS5BdXRob3JpemF0aW9uVHlwZS5DT0dOSVRPLFxuICAgICAgfVxuICAgICk7XG5cbiAgICBuZXcgY2RrLkNmbk91dHB1dCh0aGlzLCAnTm90aWZpY2F0aW9uc0FwaVVybCcsIHtcbiAgICAgIHZhbHVlOiBgJHthcGkudXJsfXJlZ2lzdGVyYCxcbiAgICAgIGRlc2NyaXB0aW9uOiAnVGhlIFVSTCBmb3IgdG9rZW4gcmVnaXN0cmF0aW9uLiBVcGRhdGUgZmlyZWJhc2VNZXNzYWdpbmcudHMgaW4gdGhlIGZyb250ZW5kIHRvIHVzZSB0aGlzIFVSTC4nLFxuICAgIH0pO1xuICB9XG59XG4iXX0=