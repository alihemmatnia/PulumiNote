import * as pulumi from "@pulumi/pulumi";
import * as aws from "@pulumi/aws";

const notesTable = new aws.dynamodb.Table("notes-table", {
  attributes: [{ name: "id", type: "S" }],
  hashKey: "id",
  billingMode: "PAY_PER_REQUEST",
});

const lambdaRole = new aws.iam.Role("lambda-role", {
  assumeRolePolicy: aws.iam.assumeRolePolicyForPrincipal({
    Service: "lambda.amazonaws.com",
  }),
});

const lambdaPolicy = new aws.iam.Policy("lambda-policy", {
  policy: pulumi.jsonStringify({
    Version: "2012-10-17",
    Statement: [
      {
        Action: ["dynamodb:PutItem", "dynamodb:GetItem"],
        Effect: "Allow",
        Resource: notesTable.arn,
      },
      {
        Action: [
          "logs:CreateLogGroup",
          "logs:CreateLogStream",
          "logs:PutLogEvents",
        ],
        Effect: "Allow",
        Resource: "arn:aws:logs:*:*:*",
      },
    ],
  }),
});

new aws.iam.RolePolicyAttachment("lambda-policy-attachment", {
  role: lambdaRole.name,
  policyArn: lambdaPolicy.arn,
});

const notesLambda = new aws.lambda.Function("notes-lambda", {
  runtime: aws.lambda.Runtime.NodeJS22dX,
  role: lambdaRole.arn,
  handler: "handler.handler",
  code: new pulumi.asset.FileArchive("./dist"),
  environment: {
    variables: {
      TABLE_NAME: notesTable.name,
    },
  },
});

const api = new aws.apigatewayv2.Api("http-api", {
  protocolType: "HTTP",
  target: notesLambda.arn,
});

new aws.lambda.Permission("api-lambda-permission", {
  action: "lambda:InvokeFunction",
  principal: "apigateway.amazonaws.com",
  function: notesLambda.name,
  sourceArn: pulumi.interpolate`${api.executionArn}/*/*`,
});

export const apiUrl = api.apiEndpoint;
