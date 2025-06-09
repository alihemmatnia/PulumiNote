# Serverless Notes API with Pulumi and TypeScript

This project demonstrates how to build a simple, serverless note-taking application using Pulumi to define and deploy infrastructure on AWS. The application consists of a RESTful API built with API Gateway and a Lambda function that saves and retrieves notes from a DynamoDB table. The entire project, including infrastructure and application code, is written in TypeScript.

## Architecture

The architecture is straightforward and efficient, leveraging managed AWS services for a scalable, low-maintenance solution.

```mermaid
graph TD
    A[User / Client] -->|HTTPS Request| B(AWS API Gateway);
    B -->|POST /notes| C{Notes Lambda Function};
    B -->|GET /notes/{id}| C;
    C -->|Save/Get Data| D[(AWS DynamoDB Table)];
```

---

## Features

- **Infrastructure as Code**: All AWS resources are defined declaratively using Pulumi and TypeScript.
- **Serverless**: No servers to manage. The application scales automatically with demand.
- **REST API**:
  - `POST /notes`: Create a new note.
  - `GET /notes/{id}`: Retrieve a specific note by its ID.
- **Type-Safe**: End-to-end TypeScript for both infrastructure and application logic.
- **Fast Deployments**: Pulumi's engine quickly and reliably deploys changes to the cloud.

## Tech Stack

- **Cloud Provider**: [Amazon Web Services (AWS)](https://aws.amazon.com/)
- **Infrastructure as Code**: [Pulumi](https://www.pulumi.com/)
- **Language**: [TypeScript](https://www.typescriptlang.org/)
- **Runtime**: [Node.js](https://nodejs.org/)
- **Core Services**:
  - [AWS Lambda](https://aws.amazon.com/lambda/): For running the application code.
  - [AWS API Gateway (HTTP API)](https://aws.amazon.com/api-gateway/): To create the public HTTP endpoints.
  - [AWS DynamoDB](https://aws.amazon.com/dynamodb/): For the NoSQL database.
  - [AWS IAM](https://aws.amazon.com/iam/): For managing permissions.

---

## Prerequisites

Before you begin, ensure you have the following installed and configured:

1.  **Node.js and npm**: [Download Node.js](https://nodejs.org/en/download/) (v18 or later recommended).
2.  **Pulumi CLI**: [Install Pulumi](https://www.pulumi.com/docs/install/).
3.  **AWS Account**: An active AWS account.
4.  **AWS CLI**: [Install and configure the AWS CLI](https://docs.aws.amazon.com/cli/latest/userguide/cli-chap-configure.html) with your credentials.

```bash
aws configure
# AWS Access Key ID [None]: YOUR_ACCESS_KEY
# AWS Secret Access Key [None]: YOUR_SECRET_KEY
# Default region name [None]: us-east-1
# Default output format [None]: json
```

## Setup and Deployment

Follow these steps to get the project running in your own AWS account.

**1. Clone the Repository**

```bash
git clone https://github.com/alihemmatnia/PulumiNote
cd pulumi-notes-app
```

**2. Install Dependencies**

This will install dependencies for both the Pulumi program and the Lambda function.

```bash
npm install
```

**3. Log in to Pulumi**

You can use the free Pulumi Service backend to store your state.

```bash
pulumi login
```

**4. Configure the AWS Region**

Set the AWS region where you want to deploy your resources.

```bash
pulumi config set aws:region us-east-2 # Or your preferred region
```

**5. Deploy the Stack**

Run the `pulumi up` command to deploy your infrastructure. This will first compile the TypeScript Lambda code (due to the `preup` script in `package.json`) and then preview and deploy the AWS resources.

```bash
pulumi up
```

Pulumi will display a preview of the resources to be created. Review the plan and select `yes` to proceed with the deployment.

Upon completion, Pulumi will output the public URL of your API.

```
Outputs:
  + apiUrl: "https://abcdef123.execute-api.us-east-1.amazonaws.com"
```

---

## Testing Your API

Use a tool like `curl` or Postman to interact with your newly deployed API. Replace `YOUR_API_URL` with the URL from the `pulumi up` output.

#### Create a Note (`POST /notes`)

Send a POST request with a JSON body containing the note's content.

```bash
curl -X POST \
  YOUR_API_URL/notes \
  -H "Content-Type: application/json" \
  -d '{"content": "My first serverless note!"}'
```

The API will respond with the full note object, including its unique ID and creation timestamp.

```json
{
  "id": "e7b1c3e1-8a9d-4f2c-b5f6-3d4a5e6b7c8d",
  "content": "My first serverless note!",
  "createdAt": "2024-02-23T10:00:00.123Z"
}
```

#### Get a Note (`GET /notes/{id}`)

Use the `id` from the previous response to fetch the specific note.

```bash
curl YOUR_API_URL/notes/e7b1c3e1-8a9d-4f2c-b5f6-3d4a5e6b7c8d
```

You will receive the note's data in the response.

```json
{
  "id": "e7b1c3e1-8a9d-4f2c-b5f6-3d4a5e6b7c8d",
  "content": "My first serverless note!",
  "createdAt": "2024-02-23T10:00:00.123Z"
}
```

---

## Cleaning Up

To avoid ongoing AWS charges, you can destroy all the resources created by this project when you are finished.

Run the following command and confirm the action when prompted:

```bash
pulumi destroy
```

This will permanently delete the API Gateway, Lambda function, IAM role, and DynamoDB table.
