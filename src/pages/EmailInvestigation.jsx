import React, { useMemo, useRef, useState } from 'react';
import { api } from '../services/api';
import { Card, CardContent, CardHeader, CardTitle } from '../components/common/Card';
import { ShieldAlert, Upload, Link2, FileText, Mail, AlertTriangle, CheckCircle2 } from 'lucide-react';

const emptyResult = {
  metadata: {},
  sender: {},
  recipients: { to: [], cc: [], bcc: [] },
  authentication: {},
  body: {},
  urls: [],
  domains: [],
  attachments: [],
  indicators: [],
  analysis_status: 'idle',
};

export default function EmailInvestigation() {
  const [result, setResult] = useState(emptyResult);
  const [status, setStatus] = useState('idle');
  const [error, setError] = useState('');
  const fileInputRef = useRef(null);

  const loadSample = async () => {
    try {
      setStatus('loading');
      setError('');
      const { data } = await api.getEmailInvestigation();
      setResult(data);
      setStatus('ready');
    } catch (err) {
      setError(err.message || 'Unable to load mock email sample.');
      setStatus('error');
    }
  };

  const handleUpload = async (event) => {
    const file = event.target.files?.[0];
    if (!file) return;

    try {
      setStatus('loading');
      setError('');
      const rawText = await file.text();
      const { data } = await api.analyzeEmail(rawText, file.name);
      setResult(data);
      setStatus('ready');
    } catch (err) {
      setError(err.message || 'Unable to parse the uploaded email.');
      setStatus('error');
    }
  };

  const summary = useMemo(() => {
    const severity = result.indicators?.some((item) => item.severity === 'HIGH') ? 'High' : 'Low';
    return {
      indicators: result.indicators?.length || 0,
      urls: result.urls?.length || 0,
      attachments: result.attachments?.length || 0,
      severity,
    };
  }, [result]);

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Email Investigation</h1>
          <p className="text-muted-foreground">Upload an .eml file or load a phishing sample to inspect sender, headers, URLs, attachments, and indicators.</p>
        </div>
        <div className="flex gap-3">
          <button
            onClick={() => fileInputRef.current?.click()}
            className="inline-flex items-center gap-2 rounded-md bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-500"
          >
            <Upload className="h-4 w-4" /> Upload Email
          </button>
          <button
            onClick={loadSample}
            className="inline-flex items-center gap-2 rounded-md border border-border px-4 py-2 text-sm font-medium hover:bg-secondary"
          >
            <Mail className="h-4 w-4" /> Load Sample
          </button>
          <input ref={fileInputRef} type="file" accept=".eml,.msg,text/plain" className="hidden" onChange={handleUpload} />
        </div>
      </div>

      {error && (
        <div className="rounded-md border border-red-500/40 bg-red-500/10 p-4 text-sm text-red-300">{error}</div>
      )}

      <div className="grid gap-4 md:grid-cols-4">
        <SummaryBox label="Severity" value={summary.severity} tone={summary.severity === 'High' ? 'danger' : 'good'} />
        <SummaryBox label="Indicators" value={summary.indicators} tone="neutral" />
        <SummaryBox label="URLs" value={summary.urls} tone="neutral" />
        <SummaryBox label="Attachments" value={summary.attachments} tone="neutral" />
      </div>

      {status === 'ready' && (
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2"><Mail className="h-5 w-5" /> Email Overview</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-4 md:grid-cols-2">
                <InfoRow label="Subject" value={result.metadata?.subject || '—'} />
                <InfoRow label="Message ID" value={result.metadata?.message_id || '—'} />
                <InfoRow label="Sender" value={result.sender?.email || '—'} />
                <InfoRow label="Date" value={result.metadata?.date || '—'} />
                <InfoRow label="To" value={(result.metadata?.to || []).join(', ') || '—'} />
                <InfoRow label="Reply-To" value={result.metadata?.reply_to || '—'} />
              </div>
            </CardContent>
          </Card>

          <div className="grid gap-6 xl:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2"><ShieldAlert className="h-5 w-5" /> Sender & Authentication</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <InfoRow label="Display Name" value={result.sender?.display_name || '—'} />
                <InfoRow label="Email" value={result.sender?.email || '—'} />
                <InfoRow label="Domain" value={result.sender?.domain || '—'} />
                <InfoRow label="Return Path" value={result.sender?.return_path || '—'} />
                <InfoRow label="SPF" value={result.authentication?.spf || 'UNKNOWN'} />
                <InfoRow label="DKIM" value={result.authentication?.dkim || 'UNKNOWN'} />
                <InfoRow label="DMARC" value={result.authentication?.dmarc || 'UNKNOWN'} />
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2"><Link2 className="h-5 w-5" /> URLs & Domains</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {result.urls?.length ? result.urls.map((url, index) => (
                  <div key={`${url.original_url}-${index}`} className="rounded-md border border-border bg-secondary/20 p-3 text-sm">
                    <div className="font-medium text-foreground break-all">{url.original_url}</div>
                    <div className="mt-2 text-xs text-muted-foreground">
                      <div>Domain: {url.domain || '—'}</div>
                      <div>Visible: {url.visible_text || '—'}</div>
                      <div>Normalized: {url.normalized_url || '—'}</div>
                    </div>
                  </div>
                )) : <p className="text-sm text-muted-foreground">No URLs detected.</p>}
                {result.domains?.length > 0 && (
                  <div className="pt-2">
                    <h4 className="mb-2 text-sm font-semibold">Extracted Domains</h4>
                    <div className="flex flex-wrap gap-2">
                      {result.domains.map((item, idx) => (
                        <span key={`${item.domain}-${idx}`} className="rounded-full border border-border bg-background px-2 py-1 text-xs">{item.domain}</span>
                      ))}
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          <div className="grid gap-6 xl:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2"><FileText className="h-5 w-5" /> Message Body</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div>
                  <div className="mb-2 text-xs uppercase tracking-[0.2em] text-muted-foreground">Plain Text</div>
                  <pre className="max-h-64 overflow-auto whitespace-pre-wrap rounded-md border border-border bg-secondary/20 p-3 text-sm text-foreground">{result.body?.plain_text || 'No plain text body available.'}</pre>
                </div>
                {result.body?.preview_html && (
                  <div>
                    <div className="mb-2 text-xs uppercase tracking-[0.2em] text-muted-foreground">HTML Preview</div>
                    <div className="max-h-64 overflow-auto rounded-md border border-border bg-secondary/20 p-3 text-sm text-foreground" dangerouslySetInnerHTML={{ __html: result.body.preview_html }} />
                  </div>
                )}
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2"><AlertTriangle className="h-5 w-5" /> Indicators & Evidence</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {result.indicators?.length ? result.indicators.map((indicator, index) => (
                  <div key={`${indicator.indicator}-${index}`} className="rounded-md border border-border bg-secondary/20 p-3">
                    <div className="flex items-center justify-between gap-2">
                      <span className="font-medium text-foreground">{indicator.indicator}</span>
                      <span className="rounded-full border border-orange-500/30 bg-orange-500/10 px-2 py-1 text-[10px] uppercase tracking-wide text-orange-300">{indicator.severity}</span>
                    </div>
                    <div className="mt-2 text-xs text-muted-foreground">{indicator.explanation}</div>
                    <pre className="mt-2 overflow-auto rounded bg-background p-2 text-[11px] text-foreground">{JSON.stringify(indicator.evidence, null, 2)}</pre>
                  </div>
                )) : <p className="text-sm text-muted-foreground">No structural indicators found.</p>}
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2"><CheckCircle2 className="h-5 w-5" /> Attachments</CardTitle>
            </CardHeader>
            <CardContent>
              {result.attachments?.length ? (
                <div className="space-y-3">
                  {result.attachments.map((attachment, index) => (
                    <div key={`${attachment.filename}-${index}`} className="rounded-md border border-border bg-secondary/20 p-3 text-sm">
                      <div className="font-medium">{attachment.filename}</div>
                      <div className="mt-2 text-muted-foreground">
                        <div>Type: {attachment.mime_type}</div>
                        <div>Size: {attachment.size} bytes</div>
                        <div>Extension: {attachment.extension || '—'}</div>
                        <div>Hash: {attachment.hash || '—'}</div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : <p className="text-sm text-muted-foreground">No attachments found.</p>}
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}

function SummaryBox({ label, value, tone }) {
  const toneMap = {
    danger: 'border-red-500/30 bg-red-500/10 text-red-300',
    good: 'border-emerald-500/30 bg-emerald-500/10 text-emerald-300',
    neutral: 'border-border bg-card text-foreground',
  };

  return (
    <div className={`rounded-lg border p-4 ${toneMap[tone] || toneMap.neutral}`}>
      <div className="text-xs uppercase tracking-[0.2em] text-muted-foreground">{label}</div>
      <div className="mt-2 text-2xl font-bold">{value}</div>
    </div>
  );
}

function InfoRow({ label, value }) {
  return (
    <div>
      <div className="text-xs uppercase tracking-[0.2em] text-muted-foreground">{label}</div>
      <div className="mt-1 break-words text-sm text-foreground">{value}</div>
    </div>
  );
}
