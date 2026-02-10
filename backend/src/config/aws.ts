import { DynamoDBClient } from '@aws-sdk/client-dynamodb';
import { DynamoDBDocumentClient } from '@aws-sdk/lib-dynamodb';
import { S3Client } from '@aws-sdk/client-s3';
import dotenv from 'dotenv';

dotenv.config();

const REGION = process.env.AWS_REGION || 'ap-south-1';

// DynamoDB
const dbClient = new DynamoDBClient({
    region: REGION,
    credentials: {
        accessKeyId: process.env.AWS_ACCESS_KEY_ID!,
        secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY!,
    }
});
export const dynamoDB = DynamoDBDocumentClient.from(dbClient);

// S3
export const s3Client = new S3Client({
    region: REGION,
    credentials: {
        accessKeyId: process.env.AWS_ACCESS_KEY_ID!,
        secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY!,
    }
});

export const TABLE_NAME = process.env.DYNAMODB_TABLE || 'DocentPosts';
export const BUCKET_NAME = process.env.S3_BUCKET || 'docent-uploads';
