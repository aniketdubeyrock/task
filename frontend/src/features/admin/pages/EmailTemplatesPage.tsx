import React, { useState, useEffect } from 'react';
import { api } from '../../../services/api';
import { EmailTemplate, EmailLog } from '../../../types';
import { Button } from '../../../components/ui/Button';
import { Input } from '../../../components/ui/Input';
import { Modal } from '../../../components/ui/Modal';
import { Badge } from '../../../components/ui/Badge';
import { useToast } from '../../../components/ui/Toast';
import { PulseGlowLoader } from '../../../components/ui/AnimatedLoader';
import { Skeleton } from '../../../components/ui/Skeleton';
import {
  MailCheck,
  Edit3,
  Eye,
  Send,
  CheckCircle2,
  AlertCircle,
  Server,
  RefreshCw,
  Clock,
} from 'lucide-react';

export const EmailTemplatesPage: React.FC = () => {
  const { success: toastSuccess, error: toastError } = useToast();

  const [templates, setTemplates] = useState<EmailTemplate[]>([]);
  const [logs, setLogs] = useState<EmailLog[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [smtpStatus, setSmtpStatus] = useState<{ connected: boolean; message: string } | null>(null);
  const [isVerifyingSmtp, setIsVerifyingSmtp] = useState(false);

  // Edit Modal State
  const [editingTemplate, setEditingTemplate] = useState<EmailTemplate | null>(null);
  const [editSubject, setEditSubject] = useState('');
  const [editBodyHtml, setEditBodyHtml] = useState('');
  const [editBodyText, setEditBodyText] = useState('');
  const [isSaving, setIsSaving] = useState(false);

  // Preview Modal State
  const [previewData, setPreviewData] = useState<{
    subject: string;
    html: string;
    variables: Record<string, string>;
  } | null>(null);
  const [isPreviewLoading, setIsPreviewLoading] = useState(false);

  // Send Test Email State
  const [testModalTemplate, setTestModalTemplate] = useState<EmailTemplate | null>(null);
  const [testRecipient, setTestRecipient] = useState('');
  const [isSendingTest, setIsSendingTest] = useState(false);

  const fetchTemplates = async () => {
    try {
      const res = await api.get('/admin/email-templates');
      if (res.data?.success) {
        setTemplates(res.data.data);
      }
    } catch (err: any) {
      toastError(err.message || 'Failed to fetch email templates');
    }
  };

  const fetchLogs = async () => {
    try {
      const res = await api.get('/admin/email-logs?limit=10');
      if (res.data?.success) {
        setLogs(res.data.data);
      }
    } catch {
      // Non-blocking log fetch
    }
  };

  const verifySmtpConnection = async () => {
    setIsVerifyingSmtp(true);
    try {
      const res = await api.get('/admin/smtp/verify');
      if (res.data?.success) {
        setSmtpStatus(res.data.data);
        if (res.data.data.connected) {
          toastSuccess('SMTP server verified and operational!');
        } else {
          toastError(res.data.data.message || 'SMTP connection failed');
        }
      }
    } catch (err: any) {
      toastError(err.message || 'SMTP verification error');
    } finally {
      setIsVerifyingSmtp(false);
    }
  };

  useEffect(() => {
    const loadAll = async () => {
      setIsLoading(true);
      await Promise.all([fetchTemplates(), fetchLogs(), verifySmtpConnection()]);
      setIsLoading(false);
    };
    loadAll();
  }, []);

  const openEditModal = (template: EmailTemplate) => {
    setEditingTemplate(template);
    setEditSubject(template.subject);
    setEditBodyHtml(template.bodyHtml);
    setEditBodyText(template.bodyText || '');
  };

  const insertVariable = (variableToken: string) => {
    const placeholder = `{{${variableToken}}}`;
    setEditBodyHtml((prev) => prev + placeholder);
  };

  const handleSaveTemplate = async () => {
    if (!editingTemplate) return;
    setIsSaving(true);
    try {
      const res = await api.put(`/admin/email-templates/${editingTemplate.key}`, {
        subject: editSubject,
        bodyHtml: editBodyHtml,
        bodyText: editBodyText,
      });

      if (res.data?.success) {
        toastSuccess(`Template '${editingTemplate.name}' updated successfully!`);
        setTemplates((prev) =>
          prev.map((t) => (t.key === editingTemplate.key ? res.data.data : t))
        );
        setEditingTemplate(null);
      }
    } catch (err: any) {
      toastError(err.message || 'Failed to update template');
    } finally {
      setIsSaving(false);
    }
  };

  const openPreviewModal = async (key: string) => {
    setIsPreviewLoading(true);
    try {
      const res = await api.post(`/admin/email-templates/${key}/preview`, {});
      if (res.data?.success) {
        setPreviewData({
          subject: res.data.data.renderedSubject,
          html: res.data.data.renderedHtml,
          variables: res.data.data.variables,
        });
      }
    } catch (err: any) {
      toastError(err.message || 'Failed to render preview');
    } finally {
      setIsPreviewLoading(false);
    }
  };

  const handleSendTestEmail = async () => {
    if (!testModalTemplate || !testRecipient) return;
    setIsSendingTest(true);
    try {
      const res = await api.post(`/admin/email-templates/${testModalTemplate.key}/test`, {
        to: testRecipient,
      });
      if (res.data?.success) {
        toastSuccess(`Test email dispatched to ${testRecipient}`);
        setTestModalTemplate(null);
        fetchLogs();
      }
    } catch (err: any) {
      toastError(err.message || 'Failed to dispatch test email');
    } finally {
      setIsSendingTest(false);
    }
  };

  return (
    <div className="flex flex-col gap-8">
      {/* Top Banner: SMTP Status & Diagnostics */}
      <div className="bg-white border border-slate-200/90 rounded-2xl p-6 shadow-crisp flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-slate-900 text-white flex items-center justify-center flex-shrink-0 shadow-xs">
            <Server className="w-6 h-6 text-brand-400" />
          </div>
          <div>
            <div className="flex items-center gap-2.5">
              <h2 className="text-base font-bold text-slate-900">Gmail SMTP Transport Server</h2>
              {smtpStatus?.connected ? (
                <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  Active
                </span>
              ) : (
                <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-rose-50 text-rose-700 border border-rose-200">
                  <AlertCircle className="w-3.5 h-3.5" />
                  Disconnected
                </span>
              )}
            </div>
            <p className="text-xs text-slate-500 mt-1">
              Host: <span className="font-mono text-slate-700">smtp.gmail.com:465</span> &bull; Security:{' '}
              <span className="font-mono text-slate-700">SSL/TLS</span> &bull; Sender:{' '}
              <span className="font-mono text-slate-700">TaskFlow System</span>
            </p>
          </div>
        </div>

        <Button
          variant="outline"
          size="sm"
          onClick={verifySmtpConnection}
          isLoading={isVerifyingSmtp}
          leftIcon={<RefreshCw className="w-3.5 h-3.5" />}
        >
          Verify Connection
        </Button>
      </div>

      {/* Templates Section */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="text-base font-bold text-slate-900">Dynamic System Email Templates</h3>
            <p className="text-xs text-slate-500">
              Customize HTML markup, subject lines, and placeholder variables for automated triggers
            </p>
          </div>
          <span className="text-xs font-medium text-slate-500 bg-slate-100 px-3 py-1 rounded-full">
            {templates.length} Templates Registered
          </span>
        </div>

        {isLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3].map((i) => (
              <div key={i} className="bg-white border border-slate-200/90 rounded-2xl p-6 shadow-crisp flex flex-col gap-4">
                <Skeleton className="w-32 h-5" />
                <Skeleton className="w-full h-4" />
                <Skeleton className="w-3/4 h-4" />
                <div className="flex gap-2 pt-4 border-t border-slate-100">
                  <Skeleton className="w-20 h-8 rounded-lg" />
                  <Skeleton className="w-20 h-8 rounded-lg" />
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {templates.map((tmpl) => (
              <div
                key={tmpl.id}
                className="bg-white border border-slate-200/90 rounded-2xl p-6 shadow-crisp hover:shadow-crisp-md transition-shadow flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-start justify-between gap-2 mb-3">
                    <span className="font-mono text-[11px] font-bold text-brand-600 bg-brand-50 px-2 py-0.5 rounded border border-brand-200">
                      {tmpl.key}
                    </span>
                    <Badge variant="purple" size="sm">
                      Automated
                    </Badge>
                  </div>

                  <h4 className="text-base font-bold text-slate-900 mb-1">{tmpl.name}</h4>
                  <p className="text-xs text-slate-500 mb-4 line-clamp-2">{tmpl.description}</p>

                  <div className="bg-slate-50 rounded-xl p-3 border border-slate-100 mb-4">
                    <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider block mb-1">
                      Subject Line:
                    </span>
                    <p className="text-xs font-medium text-slate-800 line-clamp-1">{tmpl.subject}</p>
                  </div>

                  <div className="mb-6">
                    <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider block mb-2">
                      Available Tokens:
                    </span>
                    <div className="flex flex-wrap gap-1.5">
                      {Array.isArray(tmpl.availableVariables) &&
                        tmpl.availableVariables.map((v) => (
                          <span
                            key={v}
                            className="font-mono text-[10px] bg-slate-100 text-slate-600 px-2 py-0.5 rounded border border-slate-200"
                          >
                            &#123;&#123;{v}&#125;&#125;
                          </span>
                        ))}
                    </div>
                  </div>
                </div>

                <div className="pt-4 border-t border-slate-100 flex items-center justify-between gap-2">
                  <div className="flex items-center gap-1.5">
                    <Button
                      variant="primary"
                      size="sm"
                      onClick={() => openEditModal(tmpl)}
                      leftIcon={<Edit3 className="w-3.5 h-3.5" />}
                    >
                      Edit
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => openPreviewModal(tmpl.key)}
                      leftIcon={<Eye className="w-3.5 h-3.5" />}
                    >
                      Preview
                    </Button>
                  </div>

                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => {
                      setTestModalTemplate(tmpl);
                      setTestRecipient('aniket.logicnexus@gmail.com');
                    }}
                    leftIcon={<Send className="w-3.5 h-3.5" />}
                  >
                    Test
                  </Button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Recent Email Logs Table */}
      <div className="bg-white border border-slate-200/90 rounded-2xl p-6 shadow-crisp">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="text-base font-bold text-slate-900">Email Delivery Activity Log</h3>
            <p className="text-xs text-slate-500">Audit trail of automated notifications sent through SMTP</p>
          </div>
          <Button variant="ghost" size="sm" onClick={fetchLogs} leftIcon={<RefreshCw className="w-3 h-3" />}>
            Refresh Logs
          </Button>
        </div>

        {logs.length === 0 ? (
          <div className="py-8 text-center text-xs text-slate-400">
            No emails have been dispatched yet. Send a test email above to see live log records.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-slate-100 text-slate-400 font-semibold uppercase tracking-wider">
                  <th className="py-2.5 px-3">Recipient</th>
                  <th className="py-2.5 px-3">Template</th>
                  <th className="py-2.5 px-3">Subject</th>
                  <th className="py-2.5 px-3">Status</th>
                  <th className="py-2.5 px-3 text-right">Sent Time</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-slate-700">
                {logs.map((log) => (
                  <tr key={log.id} className="hover:bg-slate-50/80 transition-colors">
                    <td className="py-3 px-3 font-medium text-slate-900">{log.recipientEmail}</td>
                    <td className="py-3 px-3">
                      <span className="font-mono text-[11px] bg-slate-100 px-2 py-0.5 rounded text-slate-600">
                        {log.templateKey}
                      </span>
                    </td>
                    <td className="py-3 px-3 max-w-xs truncate">{log.subject}</td>
                    <td className="py-3 px-3">
                      {log.status === 'SENT' ? (
                        <span className="inline-flex items-center gap-1 text-emerald-700 font-semibold">
                          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                          Sent
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 text-rose-700 font-semibold" title={log.errorMessage || ''}>
                          <AlertCircle className="w-3.5 h-3.5 text-rose-600" />
                          Failed
                        </span>
                      )}
                    </td>
                    <td className="py-3 px-3 text-right text-slate-400 whitespace-nowrap">
                      {new Date(log.sentAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Edit Template Modal */}
      {editingTemplate && (
        <Modal
          isOpen={true}
          onClose={() => setEditingTemplate(null)}
          title={`Edit Email Template: ${editingTemplate.name}`}
          description={`Key: ${editingTemplate.key}`}
          maxWidth="4xl"
        >
          <div className="flex flex-col gap-5 max-h-[75vh] overflow-y-auto pr-1">
            <Input
              label="Email Subject"
              value={editSubject}
              onChange={(e) => setEditSubject(e.target.value)}
              placeholder="e.g. Welcome to TaskFlow, {{userName}}!"
            />

            {/* Variable Pills Inserter */}
            <div>
              <span className="text-xs font-semibold text-slate-700 tracking-wide block mb-1.5">
                Click to Insert Placeholder Token:
              </span>
              <div className="flex flex-wrap gap-2">
                {Array.isArray(editingTemplate.availableVariables) &&
                  editingTemplate.availableVariables.map((v) => (
                    <button
                      key={v}
                      type="button"
                      onClick={() => insertVariable(v)}
                      className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-brand-50 hover:bg-brand-100 text-brand-700 font-mono text-xs border border-brand-200 transition-colors"
                    >
                      <span>&#43;</span> &#123;&#123;{v}&#125;&#125;
                    </button>
                  ))}
              </div>
            </div>

            {/* HTML Body Editor */}
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-semibold text-slate-700 tracking-wide">
                HTML Email Markup
              </label>
              <textarea
                rows={12}
                value={editBodyHtml}
                onChange={(e) => setEditBodyHtml(e.target.value)}
                className="w-full font-mono text-xs p-3.5 bg-slate-900 text-slate-100 rounded-xl border border-slate-700 focus:outline-none focus:ring-2 focus:ring-brand-500 selection:bg-brand-500"
              />
            </div>

            {/* Plain Text Fallback */}
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-semibold text-slate-700 tracking-wide">
                Plain Text Fallback
              </label>
              <textarea
                rows={3}
                value={editBodyText}
                onChange={(e) => setEditBodyText(e.target.value)}
                placeholder="Plain text fallback version of email..."
                className="w-full text-xs p-3 bg-white rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-brand-500"
              />
            </div>

            <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-100">
              <Button variant="outline" onClick={() => setEditingTemplate(null)}>
                Cancel
              </Button>
              <Button variant="primary" onClick={handleSaveTemplate} isLoading={isSaving}>
                Save Changes
              </Button>
            </div>
          </div>
        </Modal>
      )}

      {/* Live Preview Modal */}
      {previewData && (
        <Modal
          isOpen={true}
          onClose={() => setPreviewData(null)}
          title="Rendered Email Preview"
          description={`Subject: ${previewData.subject}`}
          maxWidth="2xl"
        >
          <div className="flex flex-col gap-4">
            <div className="bg-slate-50 border border-slate-200 rounded-xl p-3 text-xs">
              <span className="font-semibold text-slate-700 block mb-1">Interpolated Sample Data:</span>
              <div className="grid grid-cols-2 gap-x-4 gap-y-1 text-slate-600 font-mono text-[11px]">
                {Object.entries(previewData.variables).map(([k, v]) => (
                  <div key={k} className="truncate">
                    <span className="text-slate-400">{k}:</span> {v}
                  </div>
                ))}
              </div>
            </div>

            {/* HTML Iframe Preview */}
            <div className="border border-slate-200 rounded-xl overflow-hidden bg-white shadow-inner">
              <iframe
                title="Email Preview"
                srcDoc={previewData.html}
                className="w-full h-96 border-none"
              />
            </div>

            <div className="flex justify-end pt-2">
              <Button variant="outline" onClick={() => setPreviewData(null)}>
                Close Preview
              </Button>
            </div>
          </div>
        </Modal>
      )}

      {/* Send Test Email Modal */}
      {testModalTemplate && (
        <Modal
          isOpen={true}
          onClose={() => setTestModalTemplate(null)}
          title={`Send Test Email: ${testModalTemplate.name}`}
          description="Dispatch a sample message through Gmail SMTP to check deliverability"
          maxWidth="md"
        >
          <div className="flex flex-col gap-4">
            <Input
              label="Recipient Email Address"
              type="email"
              value={testRecipient}
              onChange={(e) => setTestRecipient(e.target.value)}
              placeholder="e.g. your-email@gmail.com"
            />

            <p className="text-xs text-slate-500">
              This will send a live preview with test sample tokens to verify styling in your actual mail client.
            </p>

            <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-100">
              <Button variant="outline" onClick={() => setTestModalTemplate(null)} disabled={isSendingTest}>
                Cancel
              </Button>
              <Button
                variant="primary"
                onClick={handleSendTestEmail}
                isLoading={isSendingTest}
                leftIcon={<Send className="w-3.5 h-3.5" />}
              >
                Send Test Email
              </Button>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
};

