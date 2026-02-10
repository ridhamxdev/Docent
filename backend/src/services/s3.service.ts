import { PutObjectCommand } from '@aws-sdk/client-s3';
import { s3Client, BUCKET_NAME } from '../config/aws';
import { v4 as uuidv4 } from 'uuid';

export const uploadFile = async (fileBuffer: Buffer, mimeType: string, folder: string = 'misc'): Promise<string> => {
    const key = `${folder}/${uuidv4()}-${Date.now()}`;
    const ext = mimeType.split('/')[1] || 'bin';
    const fileName = `${key}.${ext}`;

    try {
        const command = new PutObjectCommand({
            Bucket: BUCKET_NAME,
            Key: fileName,
            Body: fileBuffer,
            ContentType: mimeType,
        });

        await s3Client.send(command);

        const region = process.env.AWS_REGION || 'ap-south-1';
        return `https://${BUCKET_NAME}.s3.${region}.amazonaws.com/${fileName}`;
    } catch (error) {
        console.error('Error uploading file to S3:', error);
        throw new Error('Upload failed');
    }
};
