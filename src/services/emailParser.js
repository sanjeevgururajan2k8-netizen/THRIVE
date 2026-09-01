const URL_REGEX = /(https?:\/\/[^\s<>'")]+|www\.[^\s<>'")]+)/gi;
const HTML_LINK_REGEX = /<a\s+[^>]*href=(?:"([^"]+)"|'([^']+)'|([^\s>]+))[^>]*>([\s\S]*?)<\/a>/gi;
const EMAIL_REGEX = /[A-Z0-9._%+\-]+@[A-Z0-9.\-]+\.[A-Z]{2,}/gi;
const DANGEROUS_EXTENSIONS = new Set([
  '.exe', '.bat', '.cmd', '.com', '.scr', '.js', '.vbs', '.ps1', '.msi', '.dll', '.jar', '.hta', '.lnk', '.pif', '.sh', '.apk', '.app'
]);

const normalizeWhitespace = (value = '') => String(value).replace(/\s+/g, ' ').trim();

const decodeMimeHeader = (value = '') => {
  if (!value) return '';
  return value
    .replace(/=\?([^?]+)\?([bBqQ])\?([^?]*)\?=/g, (_, charset, encoding, encoded) => {
      const text = encoding.toLowerCase() === 'b'
        ? atob(encoded.replace(/\s+/g, ''))
        : decodeQuotedPrintable(encoded);
      return text;
    })
    .replace(/\r?\n/g, ' ')
    .trim();
};

const decodeQuotedPrintable = (value = '') => {
  if (!value) return '';
  const normalized = value.replace(/=\r?\n/g, '').replace(/=([0-9A-Fa-f]{2})/g, (_, hex) => String.fromCharCode(parseInt(hex, 16)));
  return normalized;
};

const safeTextFromHtml = (html = '') => {
  if (!html) return '';
  return html
    .replace(/<style[\s\S]*?<\/style>/gi, ' ')
    .replace(/<script[\s\S]*?<\/script>/gi, ' ')
    .replace(/<iframe[\s\S]*?<\/iframe>/gi, ' ')
    .replace(/<object[\s\S]*?<\/object>/gi, ' ')
    .replace(/<embed[\s\S]*?>/gi, ' ')
    .replace(/<[^>]+>/g, ' ')
    .replace(/&nbsp;/gi, ' ')
    .replace(/&amp;/gi, '&')
    .replace(/&lt;/gi, '<')
    .replace(/&gt;/gi, '>')
    .replace(/&quot;/gi, '"')
    .replace(/&#39;/gi, "'")
    .replace(/\s+/g, ' ')
    .trim();
};

export const sanitizeHtmlForPreview = (html = '') => {
  if (!html) return '';
  return html
    .replace(/<script[\s\S]*?<\/script>/gi, '')
    .replace(/<iframe[\s\S]*?<\/iframe>/gi, '')
    .replace(/<object[\s\S]*?<\/object>/gi, '')
    .replace(/<embed[\s\S]*?>/gi, '')
    .replace(/<svg[\s\S]*?<\/svg>/gi, '')
    .replace(/on\w+\s*=\s*["'][^"']*["']/gi, '')
    .replace(/href\s*=\s*(?:["'])?\s*(?:javascript:|data:)/gi, 'href="#"')
    .replace(/src\s*=\s*(?:["'])?\s*(?:javascript:|data:)/gi, 'src="#"');
};

const parseHeaderValue = (value = '') => {
  if (!value) return '';
  const normalized = value.replace(/\s+/g, ' ').trim();
  return decodeMimeHeader(normalized);
};

const extractHeaders = (rawText) => {
  const separatorIndex = rawText.indexOf('\n\n');
  const headersText = separatorIndex >= 0 ? rawText.slice(0, separatorIndex) : rawText;
  const headers = {};
  let currentKey = null;

  for (const line of headersText.split('\n')) {
    if (!line.trim()) continue;
    if (/^\s/.test(line) && currentKey) {
      headers[currentKey] = `${headers[currentKey] || ''} ${line.trim()}`.trim();
      continue;
    }
    const match = line.match(/^([^:]+):\s*(.*)$/);
    if (match) {
      currentKey = match[1].trim();
      headers[currentKey] = parseHeaderValue(match[2]);
    }
  }

  return headers;
};

const extractBody = (rawText) => {
  const separatorIndex = rawText.indexOf('\n\n');
  return separatorIndex >= 0 ? rawText.slice(separatorIndex + 2) : '';
};

const extractMimeBoundary = (contentType = '') => {
  const match = contentType.match(/boundary\s*=\s*["']?([^"';\s]+)["']?/i);
  return match ? match[1] : null;
};

const parseAddressValue = (value = '') => {
  if (!value) return [];
  return value.split(',').map((entry) => {
    const cleaned = entry.trim();
    if (!cleaned) return null;
    const match = cleaned.match(/^(.*?)\s*<([^>]+)>$/);
    if (match) {
      return {
        name: decodeMimeHeader(match[1]).replace(/"/g, '').trim(),
        email: match[2].trim(),
      };
    }
    return {
      name: '',
      email: decodeMimeHeader(cleaned).trim(),
    };
  }).filter(Boolean);
};

const parseAuthHeader = (value = '') => {
  const auth = { spf: 'UNKNOWN', dkim: 'UNKNOWN', dmarc: 'UNKNOWN' };
  if (!value) return auth;
  const lower = value.toLowerCase();
  const spfMatch = lower.match(/spf=([a-z]+)|spf\s*=\s*([a-z]+)/i);
  const dkimMatch = lower.match(/dkim=([a-z]+)|dkim\s*=\s*([a-z]+)/i);
  const dmarcMatch = lower.match(/dmarc=([a-z]+)|dmarc\s*=\s*([a-z]+)/i);

  auth.spf = (spfMatch ? (spfMatch[1] || spfMatch[2] || 'UNKNOWN') : 'UNKNOWN').toUpperCase();
  auth.dkim = (dkimMatch ? (dkimMatch[1] || dkimMatch[2] || 'UNKNOWN') : 'UNKNOWN').toUpperCase();
  auth.dmarc = (dmarcMatch ? (dmarcMatch[1] || dmarcMatch[2] || 'UNKNOWN') : 'UNKNOWN').toUpperCase();

  return auth;
};

const extractUrlsFromText = (input = '') => {
  const matches = [...new Set((input.match(URL_REGEX) || []).map((url) => url.trim()).filter(Boolean))];
  return matches;
};

const parseHtmlLinks = (html = '') => {
  const links = [];
  const pattern = /<a\s+[^>]*href=(?:"([^"]+)"|'([^']+)'|([^\s>]+))[^>]*>([\s\S]*?)<\/a>/gi;
  let match;
  while ((match = pattern.exec(html)) !== null) {
    const href = match[1] || match[2] || match[3] || '';
    const visibleText = safeTextFromHtml(match[4] || '').trim();
    links.push({ href, visibleText });
  }
  return links;
};

const normalizeUrl = (url = '') => {
  if (!url) return '';
  let normalized = url.trim();
  normalized = normalized.replace(/^mailto:/i, '');
  normalized = normalized.replace(/\s+/g, '');
  if (!/^https?:\/\//i.test(normalized)) {
    normalized = `https://${normalized}`;
  }
  try {
    const parsed = new URL(normalized);
    let hostname = parsed.hostname.toLowerCase();
    if (hostname.startsWith('www.')) hostname = hostname.slice(4);
    let pathname = parsed.pathname || '/';
    if (pathname.length > 1 && pathname.endsWith('/')) pathname = pathname.replace(/\/+$/, '');
    return `${parsed.protocol}//${hostname}${pathname}${parsed.search || ''}${parsed.hash || ''}`;
  } catch {
    return normalized.replace(/\/+$/, '').replace(/^www\./i, '');
  }
};

const extractDomain = (value = '') => {
  if (!value) return '';
  const cleaned = value.replace(/^https?:\/\//i, '').replace(/^www\./i, '').split('/')[0].split(':')[0].toLowerCase();
  return cleaned.replace(/\.$/, '');
};

const getFilenameFromContentDisposition = (contentDisposition = '') => {
  const match = contentDisposition.match(/filename\s*=\s*["']?([^"';]+)["']?/i);
  return match ? decodeMimeHeader(match[1]).trim() : '';
};

const sanitizeDomainList = (domains = []) => {
  const seen = new Set();
  return domains.filter((item) => {
    if (!item?.domain) return false;
    const key = `${item.domain}|${item.source}`;
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  });
};

const buildAttachmentEvidence = (attachment) => {
  const indicators = [];
  const fileName = attachment.filename || 'unknown';
  const lower = fileName.toLowerCase();
  const extension = attachment.extension || '';

  if (/\.[^./\\]+\.[^./\\]+$/.test(lower)) {
    indicators.push({ type: 'DOUBLE_EXTENSION', severity: 'HIGH', evidence: { filename: fileName }, explanation: 'The filename contains multiple extensions, a common malicious packaging pattern.' });
  }
  if (DANGEROUS_EXTENSIONS.has(extension.toLowerCase())) {
    indicators.push({ type: 'EXECUTABLE_ATTACHMENT', severity: 'HIGH', evidence: { filename: fileName, mime_type: attachment.mime_type }, explanation: 'The attachment uses an executable or script extension that should be treated as untrusted.' });
  }
  if (attachment.mime_type && attachment.mime_type.includes('application') && !extension) {
    indicators.push({ type: 'SUSPICIOUS_ATTACHMENT', severity: 'MEDIUM', evidence: { filename: fileName, mime_type: attachment.mime_type }, explanation: 'The file has a generic or suspicious content type with no trusted extension.' });
  }
  return indicators;
};

const extractAttachmentIndicators = (attachments = []) => {
  return attachments.flatMap(buildAttachmentEvidence);
};

const parseMultipartEmail = (rawText, headers) => {
  const contentType = headers['Content-Type'] || '';
  const boundary = extractMimeBoundary(contentType);
  if (!boundary) return { plainText: '', htmlText: '', attachments: [], topLevelBody: '' };

  const delimiter = `--${boundary}`;
  const parts = rawText.split(delimiter).filter((part) => part.trim() && !/^--\s*$/.test(part.trim()));

  const normalizedParts = [];
  for (const partText of parts) {
    const splitIndex = partText.indexOf('\n\n');
    const headersText = splitIndex >= 0 ? partText.slice(0, splitIndex) : '';
    const body = splitIndex >= 0 ? partText.slice(splitIndex + 2).replace(/\n--.*$/s, '').trim() : partText.trim();
    const partHeaders = {};
    for (const line of headersText.split('\n')) {
      if (!line.trim()) continue;
      const match = line.match(/^([^:]+):\s*(.*)$/);
      if (match) {
        const key = match[1].trim();
        partHeaders[key] = parseHeaderValue(match[2]);
      }
    }
    normalizedParts.push({ headers: partHeaders, body });
  }

  let plainText = '';
  let htmlText = '';
  const attachments = [];
  const bodyCandidates = [];

  for (const part of normalizedParts) {
    const partType = (part.headers['Content-Type'] || '').split(';')[0].trim().toLowerCase();
    const disposition = (part.headers['Content-Disposition'] || '').toLowerCase();
    const filename = getFilenameFromContentDisposition(part.headers['Content-Disposition'] || '') || part.headers['Filename'] || '';
    const contentId = part.headers['Content-ID'] || '';

    if (partType === 'text/plain' || (!partType && !filename)) {
      bodyCandidates.push(part.body);
      plainText = part.body;
    }
    if (partType === 'text/html') {
      htmlText = part.body;
    }
    if (filename || disposition.includes('attachment') || disposition.includes('inline')) {
      const mimeType = partType || 'application/octet-stream';
      const content = part.body || '';
      const sanitizedName = filename || 'attachment';
      const extension = sanitizedName.includes('.') ? sanitizedName.slice(sanitizedName.lastIndexOf('.')).toLowerCase() : '';
      attachments.push({
        filename: sanitizedName,
        mime_type: mimeType,
        size: new TextEncoder().encode(content).length,
        content_disposition: part.headers['Content-Disposition'] || 'attachment',
        extension,
        content_id: contentId,
        hash: content ? `sha256:${btoa(unescape(encodeURIComponent(content))).slice(0, 32)}` : null,
      });
    }
  }

  return {
    plainText: plainText || bodyCandidates.join('\n\n'),
    htmlText,
    attachments,
    topLevelBody: plainText || bodyCandidates.join('\n\n'),
  };
};

export function parseEmailText(rawEmailText, fileName = 'email.eml') {
  if (!rawEmailText || !String(rawEmailText).trim()) {
    throw new Error('Email content is empty.');
  }

  const rawText = String(rawEmailText).replace(/\r\n/g, '\n');
  const headers = extractHeaders(rawText);
  const bodyText = extractBody(rawText);
  const contentType = headers['Content-Type'] || 'text/plain';
  const authHeaderValue = headers['Authentication-Results'] || headers['Received-SPF'] || '';

  let plainText = bodyText;
  let htmlText = '';
  let attachments = [];

  if (contentType.toLowerCase().includes('multipart/')) {
    const multipartResult = parseMultipartEmail(rawText, headers);
    plainText = multipartResult.plainText || bodyText;
    htmlText = multipartResult.htmlText || '';
    attachments = multipartResult.attachments || [];
  } else {
    plainText = bodyText;
    const lowerBody = bodyText.toLowerCase();
    if (lowerBody.includes('<html') || lowerBody.includes('<body')) {
      htmlText = bodyText;
    }
  }

  const subject = decodeMimeHeader(headers.Subject || '');
  const fromHeader = parseAddressValue(headers.From || '');
  const replyToHeader = parseAddressValue(headers['Reply-To'] || '');
  const returnPathHeader = parseAddressValue(headers['Return-Path'] || '');
  const toRecipients = parseAddressValue(headers.To || '');
  const ccRecipients = parseAddressValue(headers.CC || '');
  const bccRecipients = parseAddressValue(headers.BCC || '');

  const sender = fromHeader[0] || { name: '', email: '' };
  const replyTo = replyToHeader[0] || { name: '', email: '' };
  const returnPath = returnPathHeader[0] || { name: '', email: '' };

  const senderEmail = sender.email || '';
  const senderDomain = extractDomain(senderEmail);
  const replyToDomain = extractDomain(replyTo.email);
  const returnPathDomain = extractDomain(returnPath.email);

  const urls = [];
  const urlSet = new Set();
  const htmlLinks = parseHtmlLinks(htmlText);
  const linkUrls = [...extractUrlsFromText(plainText), ...extractUrlsFromText(htmlText), ...htmlLinks.map((link) => link.href)];

  for (const rawUrl of linkUrls) {
    const url = String(rawUrl).trim();
    if (!url || urlSet.has(url)) continue;
    urlSet.add(url);
    const normalizedUrl = normalizeUrl(url);
    urls.push({
      original_url: url,
      normalized_url: normalizedUrl,
      domain: extractDomain(normalizedUrl),
      source: htmlLinks.some((link) => link.href === url) ? 'html' : 'text',
      visible_text: htmlLinks.find((link) => link.href === url)?.visibleText || '',
      destination: url,
      scheme: (() => { try { return new URL(normalizedUrl).protocol.replace(':', ''); } catch { return ''; } })(),
      hostname: (() => { try { return new URL(normalizedUrl).hostname; } catch { return ''; } })(),
      path: (() => { try { return new URL(normalizedUrl).pathname; } catch { return ''; } })(),
      query: (() => { try { return new URL(normalizedUrl).search; } catch { return ''; } })(),
      fragment: (() => { try { return new URL(normalizedUrl).hash; } catch { return ''; } })(),
      port: (() => { try { return new URL(normalizedUrl).port; } catch { return ''; } })(),
    });
  }

  const domains = [];
  const domainSet = new Set();
  const sourceDomains = [
    { domain: senderDomain, source: 'sender' },
    { domain: replyToDomain, source: 'reply_to' },
    { domain: returnPathDomain, source: 'return_path' },
    ...urls.map((entry) => ({ domain: entry.domain, source: 'url' })),
  ];

  for (const item of sourceDomains) {
    if (!item.domain) continue;
    const key = `${item.domain}|${item.source}`;
    if (domainSet.has(key)) continue;
    domainSet.add(key);
    domains.push(item);
  }

  const indicators = [];

  if (replyTo.email && senderEmail && replyTo.email.toLowerCase() !== senderEmail.toLowerCase()) {
    indicators.push({
      indicator: 'REPLY_TO_MISMATCH',
      severity: 'MEDIUM',
      evidence: { from: senderEmail, reply_to: replyTo.email },
      explanation: 'The Reply-To address differs from the sender address, which is a common spoofing pattern.'
    });
  }

  if (!authHeaderValue) {
    indicators.push({
      indicator: 'MISSING_AUTHENTICATION_RESULTS',
      severity: 'LOW',
      evidence: { headers: ['Authentication-Results', 'Received-SPF', 'DKIM-Signature', 'ARC'] },
      explanation: 'No authentication results were present in the message headers.'
    });
  }

  for (const item of htmlLinks) {
    const actualUrl = item.href || '';
    const visibleText = item.visibleText || '';
    const visibleDomain = extractDomain(visibleText);
    const destinationDomain = extractDomain(actualUrl);
    if (visibleText && actualUrl && visibleDomain && destinationDomain && visibleDomain !== destinationDomain) {
      indicators.push({
        indicator: 'VISIBLE_DESTINATION_MISMATCH',
        severity: 'HIGH',
        evidence: { visible_url: visibleText, actual_url: actualUrl },
        explanation: 'The visible hyperlink target does not match the actual destination URL.'
      });
      break;
    }
  }

  for (const attachment of attachments) {
    const attachmentIndicators = buildAttachmentEvidence(attachment);
    indicators.push(...attachmentIndicators);
  }

  for (const item of urls) {
    const host = item.hostname || '';
    if (host && senderDomain && host !== senderDomain && !host.endsWith('.' + senderDomain)) {
      indicators.push({
        indicator: 'EXTERNAL_LINK',
        severity: 'LOW',
        evidence: { sender_domain: senderDomain, url: item.normalized_url },
        explanation: 'The email contains a link outside the sender’s apparent domain.'
      });
      break;
    }
    if (item.normalized_url && /(?:paypa1|paypal|login|verify|secure|update|confirm|account|microsoft|office|cloud)/i.test(item.normalized_url)) {
      indicators.push({
        indicator: 'SUSPICIOUS_URL_STRUCTURE',
        severity: 'MEDIUM',
        evidence: { url: item.normalized_url },
        explanation: 'The URL structure contains suspicious phishing-like keywords and lookalike patterns.'
      });
      break;
    }
  }

  const normalizedText = normalizeWhitespace(safeTextFromHtml(htmlText) || plainText || '');
  const previewHtml = sanitizeHtmlForPreview(htmlText || '');

  return {
    email_id: `EML-${Date.now()}`,
    source_file: fileName,
    metadata: {
      message_id: headers['Message-ID'] || '',
      date: headers.Date || '',
      subject,
      from: senderEmail,
      to: toRecipients.map((entry) => entry.email),
      cc: ccRecipients.map((entry) => entry.email),
      bcc: bccRecipients.map((entry) => entry.email),
      reply_to: replyTo.email || '',
      return_path: returnPath.email || '',
      content_type: contentType,
      mime_version: headers['MIME-Version'] || '',
      in_reply_to: headers['In-Reply-To'] || '',
      references: headers.References || '',
      received: headers.Received || '',
    },
    sender: {
      display_name: sender.name || '',
      email: senderEmail,
      domain: senderDomain,
      reply_to: replyTo.email || '',
      return_path: returnPath.email || '',
      sender_domain_match: !replyTo.email || senderDomain === replyToDomain,
    },
    recipients: {
      to: toRecipients,
      cc: ccRecipients,
      bcc: bccRecipients,
    },
    authentication: {
      spf: parseAuthHeader(authHeaderValue).spf,
      dkim: parseAuthHeader(authHeaderValue).dkim,
      dmarc: parseAuthHeader(authHeaderValue).dmarc,
      authentication_results: authHeaderValue,
    },
    body: {
      original_content: plainText || '',
      normalized_content: normalizedText,
      plain_text: plainText || '',
      html: htmlText || '',
      preview_html: previewHtml,
    },
    urls,
    domains: sanitizeDomainList(domains),
    attachments: attachments.map((attachment) => ({
      filename: attachment.filename,
      mime_type: attachment.mime_type,
      size: attachment.size,
      content_disposition: attachment.content_disposition,
      extension: attachment.extension,
      content_id: attachment.content_id,
      hash: attachment.hash,
    })),
    indicators,
    analysis_status: 'parsed',
    parsed_at: new Date().toISOString(),
    ai_consumption: {
      subject,
      sender: { email: senderEmail, domain: senderDomain },
      body: { plain_text: plainText || normalizedText },
      urls: urls.map((entry) => ({ original_url: entry.original_url, domain: entry.domain })),
      attachments: attachments.map((item) => ({ filename: item.filename, mime_type: item.mime_type, hash: item.hash })),
      headers: {
        reply_to: replyTo.email || '',
        authentication_results: authHeaderValue,
      },
    },
    evidence: {
      header_count: Object.keys(headers).length,
      url_count: urls.length,
      attachment_count: attachments.length,
      domain_count: domains.length,
    },
  };
}

export function getMockEmailAnalysis() {
  return parseEmailText(`From: "PayPal Security" <security@paypa1-login.com>
To: finance@company.com
Reply-To: account-security@paypa1-login.com
Subject: Urgent: Your account will be suspended!
Date: Tue, 24 Oct 2023 09:02:00 +0000
Message-ID: <1234@mailer>
Content-Type: multipart/alternative; boundary="B_123"

--B_123
Content-Type: text/plain; charset="utf-8"

Your account has been suspended. Please verify immediately.

https://paypa1-login.com/verify

--B_123
Content-Type: text/html; charset="utf-8"

<html><body><p>Urgent action required.</p><a href="https://paypa1-login.com/verify">https://paypal.com</a></body></html>

--B_123
Content-Disposition: attachment; filename="invoice.pdf.exe"
Content-Type: application/octet-stream

This is not actually executable. This is a safe mock example.
--B_123--`);
}
