import { DynamoDBClient } from "@aws-sdk/client-dynamodb";
import {
  DynamoDBDocumentClient,
  PutCommand,
  GetCommand,
} from "@aws-sdk/lib-dynamodb";
import type {
  APIGatewayProxyEventV2,
  APIGatewayProxyResultV2,
  Context,
} from "aws-lambda";
import { randomUUID } from "crypto";

const client = new DynamoDBClient({
  region: process.env.AWS_REGION || "us-east-2",
});
const docClient = DynamoDBDocumentClient.from(client);

export const handler = async (
  event: APIGatewayProxyEventV2,
  context: Context
): Promise<APIGatewayProxyResultV2> => {
  try {
    const method = event.requestContext.http.method;
    const routeKey = event.routeKey;

    if (routeKey === "POST /notes") {
      const body = JSON.parse(event.body || "{}");
      if (!body.content) {
        return {
          statusCode: 400,
          body: JSON.stringify({
            message: "Missing 'content' in request body.",
          }),
        };
      }

      const newNote = {
        id: randomUUID(),
        content: body.content,
        createdAt: new Date().toISOString(),
      };

      const command = new PutCommand({
        TableName: process.env.TABLE_NAME,
        Item: newNote,
      });

      await docClient.send(command);

      return {
        statusCode: 201, // Created
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(newNote),
      };
    }

    if (routeKey === "GET /notes/{id}") {
      const id = event.pathParameters?.id;
      if (!id) {
        return {
          statusCode: 400,
          body: JSON.stringify({ message: "Note ID is missing in the path." }),
        };
      }

      const command = new GetCommand({
        TableName: process.env.TABLE_NAME!,
        Key: { id },
      });

      const { Item } = await docClient.send(command);

      if (!Item) {
        return {
          statusCode: 404,
          body: JSON.stringify({ message: "Note not found." }),
        };
      }

      return {
        statusCode: 200,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(Item),
      };
    }

    return {
      statusCode: 404,
      body: JSON.stringify({ message: "Route not found." }),
    };
  } catch (error) {
    console.error(error);
    const message =
      error instanceof Error ? error.message : "Internal Server Error";
    return {
      statusCode: 500,
      body: JSON.stringify({ message }),
    };
  }
};
