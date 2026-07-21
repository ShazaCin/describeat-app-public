/* eslint-disable */
// This is a TEMPLATE file. Copy it to `aws-exports.ts` and fill in your own AWS values.
// See the README for instructions on setting up your AWS Cognito and AppSync resources.

const awsmobile = {
    "aws_project_region": "eu-west-1", // Your AWS region
    "aws_cognito_identity_pool_id": "YOUR_COGNITO_IDENTITY_POOL_ID",
    "aws_cognito_region": "eu-west-1",
    "aws_user_pools_id": "YOUR_COGNITO_USER_POOL_ID",
    "aws_user_pools_web_client_id": "YOUR_COGNITO_WEB_CLIENT_ID",
    "oauth": {
        "domain": "your-auth-domain.auth.region.amazoncognito.com",
        "scope": [
            "phone",
            "email",
            "openid",
            "profile",
            "aws.cognito.signin.user.admin"
        ],
        "redirectSignIn": "http://localhost:8080/,https://your-app-domain.com/",
        "redirectSignOut": "http://localhost:8080/,https://your-app-domain.com/",
        "responseType": "code"
    },
    "federationTarget": "COGNITO_USER_POOLS",
    "aws_appsync_graphqlEndpoint": "https://YOUR_APPSYNC_ENDPOINT.appsync-api.REGION.amazonaws.com/graphql",
    "aws_appsync_region": "eu-west-1",
    "aws_appsync_authenticationType": "API_KEY",
    "aws_appsync_apiKey": "YOUR_APPSYNC_API_KEY"
};

export default awsmobile;
