// Client-side Gmail REST API v1 utilities

export interface GmailHeader {
  name: string;
  value: string;
}

export interface GmailMessagePart {
  partId?: string;
  mimeType?: string;
  filename?: string;
  headers?: GmailHeader[];
  body?: {
    attachmentId?: string;
    size?: number;
    data?: string;
  };
  parts?: GmailMessagePart[];
}

export interface GmailMessage {
  id: string;
  threadId: string;
  labelIds?: string[];
  snippet?: string;
  internalDate?: string;
  sizeEstimate?: number;
  payload?: GmailMessagePart;
}

export interface GmailLabel {
  id: string;
  name: string;
  type?: 'system' | 'user';
  messagesTotal?: number;
  messagesUnread?: number;
}

export interface ParsedEmail {
  id: string;
  threadId: string;
  labelIds: string[];
  snippet: string;
  from: string;
  to: string;
  subject: string;
  date: string;
  internalDate: number;
  isUnread: boolean;
  isStarred: boolean;
  htmlBody: string;
  textBody: string;
  attachments: Array<{ filename: string; mimeType: string; size: number; attachmentId?: string }>;
}

const GMAIL_BASE = 'https://gmail.googleapis.com/gmail/v1/users/me';

const decodeBase64Url = (data?: string): string => {
  if (!data) return '';
  try {
    const base64 = data.replace(/-/g, '+').replace(/_/g, '/');
    const padLength = (4 - (base64.length % 4)) % 4;
    const padded = base64 + '='.repeat(padLength);
    const binaryString = atob(padded);
    const bytes = new Uint8Array(binaryString.length);
    for (let i = 0; i < binaryString.length; i++) {
      bytes[i] = binaryString.charCodeAt(i);
    }
    return new TextDecoder('utf-8').decode(bytes);
  } catch (e) {
    return '';
  }
};

const encodeBase64Url = (text: string): string => {
  const bytes = new TextEncoder().encode(text);
  let binary = '';
  for (let i = 0; i < bytes.length; i++) {
    binary += String.fromCharCode(bytes[i]);
  }
  return btoa(binary).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
};

const getHeaderValue = (headers: GmailHeader[] | undefined, name: string): string => {
  if (!headers) return '';
  const match = headers.find((h) => h.name.toLowerCase() === name.toLowerCase());
  return match?.value || '';
};

const extractParts = (
  part: GmailMessagePart | undefined,
  acc: { html: string; text: string; attachments: ParsedEmail['attachments'] }
) => {
  if (!part) return;
  const mime = (part.mimeType || '').toLowerCase();

  if (part.filename && part.filename.length > 0 && part.body) {
    acc.attachments.push({
      filename: part.filename,
      mimeType: part.mimeType || 'application/octet-stream',
      size: part.body.size || 0,
      attachmentId: part.body.attachmentId,
    });
  } else if (mime === 'text/html' && part.body?.data) {
    acc.html += decodeBase64Url(part.body.data);
  } else if (mime === 'text/plain' && part.body?.data) {
    acc.text += decodeBase64Url(part.body.data);
  }

  if (Array.isArray(part.parts)) {
    for (const child of part.parts) {
      extractParts(child, acc);
    }
  }
};

export const parseGmailMessage = (msg: GmailMessage): ParsedEmail => {
  const headers = msg.payload?.headers;
  const labelIds = msg.labelIds || [];
  const extracted = { html: '', text: '', attachments: [] as ParsedEmail['attachments'] };
  extractParts(msg.payload, extracted);

  if (!extracted.html && !extracted.text && msg.payload?.body?.data) {
    const raw = decodeBase64Url(msg.payload.body.data);
    if ((msg.payload.mimeType || '').includes('html')) {
      extracted.html = raw;
    } else {
      extracted.text = raw;
    }
  }

  return {
    id: msg.id,
    threadId: msg.threadId,
    labelIds,
    snippet: msg.snippet || '',
    from: getHeaderValue(headers, 'From') || 'Unknown Sender',
    to: getHeaderValue(headers, 'To') || '',
    subject: getHeaderValue(headers, 'Subject') || '(No Subject)',
    date: getHeaderValue(headers, 'Date') || '',
    internalDate: msg.internalDate ? parseInt(msg.internalDate, 10) : Date.now(),
    isUnread: labelIds.includes('UNREAD'),
    isStarred: labelIds.includes('STARRED'),
    htmlBody: extracted.html,
    textBody: extracted.text,
    attachments: extracted.attachments,
  };
};

async function gmailFetch<T>(token: string, path: string, options: RequestInit = {}): Promise<T> {
  const res = await fetch(`${GMAIL_BASE}${path}`, {
    ...options,
    headers: {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json',
      ...(options.headers || {}),
    },
  });

  if (res.status === 204) {
    return {} as T;
  }

  if (!res.ok) {
    const errBody = await res.text();
    const error: any = new Error(`Gmail API error (${res.status}): ${errBody}`);
    error.status = res.status;
    throw error;
  }

  return res.json();
}

export const getGmailProfile = async (token: string): Promise<{ emailAddress: string; messagesTotal: number; threadsTotal: number }> => {
  return gmailFetch(token, '/profile');
};

export const listGmailLabels = async (token: string): Promise<GmailLabel[]> => {
  const data = await gmailFetch<{ labels?: GmailLabel[] }>(token, '/labels');
  const labels = data.labels || [];
  // Enrich top labels with unread count
  const importantIds = ['INBOX', 'SENT', 'DRAFT', 'STARRED', 'TRASH', 'SPAM'];
  const enriched = await Promise.all(
    labels.map(async (lbl) => {
      if (importantIds.includes(lbl.id) || lbl.type === 'user') {
        try {
          const detail = await gmailFetch<GmailLabel>(token, `/labels/${encodeURIComponent(lbl.id)}`);
          return detail;
        } catch {
          return lbl;
        }
      }
      return lbl;
    })
  );
  return enriched;
};

export const listGmailMessages = async (
  token: string,
  options: { labelIds?: string[]; q?: string; maxResults?: number; pageToken?: string } = {}
): Promise<{ messages: ParsedEmail[]; nextPageToken?: string; resultSizeEstimate?: number }> => {
  const params = new URLSearchParams();
  params.set('maxResults', String(options.maxResults || 20));
  if (options.q) params.set('q', options.q);
  if (options.pageToken) params.set('pageToken', options.pageToken);
  if (options.labelIds && options.labelIds.length > 0) {
    for (const lbl of options.labelIds) {
      params.append('labelIds', lbl);
    }
  }

  const listData = await gmailFetch<{
    messages?: Array<{ id: string; threadId: string }>;
    nextPageToken?: string;
    resultSizeEstimate?: number;
  }>(token, `/messages?${params.toString()}`);

  const ids = listData.messages || [];
  if (ids.length === 0) {
    return { messages: [], nextPageToken: undefined, resultSizeEstimate: 0 };
  }

  const details = await Promise.all(
    ids.map((m) => gmailFetch<GmailMessage>(token, `/messages/${encodeURIComponent(m.id)}?format=full`))
  );

  return {
    messages: details.map(parseGmailMessage),
    nextPageToken: listData.nextPageToken,
    resultSizeEstimate: listData.resultSizeEstimate,
  };
};

const buildRawMimeMessage = (params: { to: string; subject: string; body: string; threadId?: string; inReplyTo?: string }) => {
  const lines = [
    `To: ${params.to.trim()}`,
    `Subject: =?UTF-8?B?${btoa(unescape(encodeURIComponent(params.subject)))}?=`,
    'MIME-Version: 1.0',
    'Content-Type: text/plain; charset="UTF-8"',
    'Content-Transfer-Encoding: 8bit',
  ];
  if (params.inReplyTo) {
    lines.push(`In-Reply-To: ${params.inReplyTo}`);
    lines.push(`References: ${params.inReplyTo}`);
  }
  lines.push('', params.body);
  return encodeBase64Url(lines.join('\r\n'));
};

export const sendGmailMessage = async (
  token: string,
  params: { to: string; subject: string; body: string; threadId?: string }
): Promise<GmailMessage> => {
  const raw = buildRawMimeMessage(params);
  return gmailFetch<GmailMessage>(token, '/messages/send', {
    method: 'POST',
    body: JSON.stringify({
      raw,
      ...(params.threadId ? { threadId: params.threadId } : {}),
    }),
  });
};

export const createGmailDraft = async (
  token: string,
  params: { to: string; subject: string; body: string; threadId?: string }
): Promise<any> => {
  const raw = buildRawMimeMessage(params);
  return gmailFetch(token, '/drafts', {
    method: 'POST',
    body: JSON.stringify({
      message: {
        raw,
        ...(params.threadId ? { threadId: params.threadId } : {}),
      },
    }),
  });
};

export const modifyGmailLabels = async (
  token: string,
  messageId: string,
  addLabelIds: string[] = [],
  removeLabelIds: string[] = []
): Promise<GmailMessage> => {
  return gmailFetch<GmailMessage>(token, `/messages/${encodeURIComponent(messageId)}/modify`, {
    method: 'POST',
    body: JSON.stringify({ addLabelIds, removeLabelIds }),
  });
};

export const trashGmailMessage = async (token: string, messageId: string): Promise<GmailMessage> => {
  return gmailFetch<GmailMessage>(token, `/messages/${encodeURIComponent(messageId)}/trash`, {
    method: 'POST',
  });
};

export const untrashGmailMessage = async (token: string, messageId: string): Promise<GmailMessage> => {
  return gmailFetch<GmailMessage>(token, `/messages/${encodeURIComponent(messageId)}/untrash`, {
    method: 'POST',
  });
};

export const deleteGmailMessage = async (token: string, messageId: string): Promise<void> => {
  await gmailFetch(token, `/messages/${encodeURIComponent(messageId)}`, {
    method: 'DELETE',
  });
};
