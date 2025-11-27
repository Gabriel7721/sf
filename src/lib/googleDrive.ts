// src/lib/googleDrive.ts
import { google } from 'googleapis';
import { Readable } from 'stream';

const clientId = process.env.GOOGLE_CLIENT_ID;
const clientSecret = process.env.GOOGLE_CLIENT_SECRET;
const refreshToken = process.env.GOOGLE_REFRESH_TOKEN;
const driveFolderId = process.env.GOOGLE_DRIVE_FOLDER_ID;

if (!clientId || !clientSecret || !refreshToken || !driveFolderId) {
  // eslint-disable-next-line no-console
  console.warn(
    '⚠️ GOOGLE_CLIENT_ID / GOOGLE_CLIENT_SECRET / GOOGLE_REFRESH_TOKEN / GOOGLE_DRIVE_FOLDER_ID chưa cấu hình đầy đủ trong .env',
  );
}

const oAuth2Client = new google.auth.OAuth2(clientId, clientSecret);
oAuth2Client.setCredentials({ refresh_token: refreshToken });

const drive = google.drive({ version: 'v3', auth: oAuth2Client });

export type DriveUploadResult = {
  fileId: string;
  fileName: string;
  webViewLink?: string;
};

function bufferToStream(binary: Buffer): Readable {
  const readable = new Readable();
  readable.push(binary);
  readable.push(null);
  return readable;
}

/**
 * Upload file bất kỳ (PDF/DOCX/...) lên Drive.
 */
export async function uploadFileToDrive(
  fileBuffer: Buffer,
  fileName: string,
  mimeType: string,
): Promise<DriveUploadResult> {
  const res = await drive.files.create({
    requestBody: {
      name: fileName,
      parents: [driveFolderId!],
      mimeType,
    },
    media: {
      mimeType,
      body: bufferToStream(fileBuffer),
    },
    fields: 'id, name, webViewLink',
  });

  const data = res.data;

  return {
    fileId: data.id!,
    fileName: data.name!,
    webViewLink: data.webViewLink ?? undefined,
  };
}


