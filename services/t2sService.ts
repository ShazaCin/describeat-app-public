import { getCurrentUser, fetchAuthSession } from 'aws-amplify/auth';

const T2S_URL_TEMPLATE = `${import.meta.env.VITE_T2S_URL || 'https://your-t2s-endpoint.com/t2s/sync'}?filename={userId}_{recordingTimestamp}.mp3`;

export interface T2SMatchResult {
  status: 'SUCCESS' | 'FAILED';
  message: {
    text?: string;
    match?: {
      song_id: number;
      song_name: string;
      input_total_hashes: number;
      fingerprinted_hashes_in_db: number;
      hashes_matched_in_input: number;
      input_confidence: number;
      fingerprinted_confidence: number;
      offset: number;
      offset_seconds: number;
      file_sha1: string | null;
    };
    closest_matches?: Array<{
      song_id: number;
      song_name: string;
      input_total_hashes: number;
      fingerprinted_hashes_in_db: number;
      hashes_matched_in_input: number;
      input_confidence: number;
      fingerprinted_confidence: number;
      offset: number;
      offset_seconds: number;
      file_sha1: string | null;
    }>;
    confidence_check_value?: number;
  } | string;
}

export const findMatch = async (audioBlob: Blob): Promise<T2SMatchResult> => {
  try {
    const user = await getCurrentUser();
    const userId = user.signInDetails?.loginId || user.username || 'unknown_user';

    // Sanitize userId as per old app logic: userKey.replace("@", "_at_").replace(/\./g, "_");
    const sanitizedUserId = userId.replace(/@/g, "_at_").replace(/\./g, "_");
    const timestamp = Date.now();

    const url = T2S_URL_TEMPLATE
      .replace('{userId}', sanitizedUserId)
      .replace('{recordingTimestamp}', timestamp.toString());

    // The old app used a POST with the file as binary data (or form data?)
    // Based on "doUploadFileToT2S" and the curl command in comments:
    // curl -X POST "..." -H "Content-Type: audio/m4a" --data-binary @"..."

    // We need to send the blob directly or as FormData?
    // The old logic `doUploadFileToT2S` isn't fully visible but the curl says --data-binary.
    // So we send the blob as the body.

    const session = await fetchAuthSession();
    const token = session.tokens?.idToken?.toString();

    if (!token) {
      console.error("T2S Match failed: No auth token available (session expired)");
      return { status: 'FAILED', message: "Authentication required. Please log in again." };
    }

    // CRITICAL: The T2S/Dejavu backend expects 'audio/mpeg' Content-Type
    // and requires Content-Length to be explicit. The old v2 app (Vue)
    // sent these exact headers. mp3-mediarecorder produces type='audio/mpeg'.
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'audio/mpeg',
        'Content-Length': audioBlob.size.toString(),
        'Authorization': `Bearer ${token}`
      },
      body: audioBlob
    });

    if (!response.ok) {
      throw new Error(`T2S API error: ${response.statusText}`);
    }

    const result = await response.json();
    return result;

  } catch (error) {
    console.error("T2S Match failed:", error);
    return { status: 'FAILED', message: "Network or Server Error" };
  }
};