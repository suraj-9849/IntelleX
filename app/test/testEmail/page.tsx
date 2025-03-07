'use client';

import { useState } from 'react';

export default function TestEmailPage() {
  const [sending, setSending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const handleSendEmail = async () => {
    try {
      setError(null);
      setSuccess(false);
      setSending(true);
      console.log('Sending test email...');

      const emailPayload = {
        title: 'Test Dangerous Activity',
        description:
          'This is a test dangerous activity alert from the test page.',
      };

      console.log('Email payload:', emailPayload);

      const response = await fetch('/api/send-email', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Accept: 'application/json',
        },
        body: JSON.stringify(emailPayload),
      });

      console.log('Response status:', response.status);
      const result = await response.json();

      if (result.error) {
        console.error('API returned error:', result.error);
        throw new Error(result.error.message || 'Failed to send email');
      }

      console.log('Email sent successfully:', result);
      setSuccess(true);
    } catch (error) {
      console.error('Error sending email:', error);
      setError(error instanceof Error ? error.message : 'Failed to send email');
    } finally {
      setSending(false);
    }
  };

  return (
    <div className='mx-auto max-w-md space-y-4 p-4'>
      <h1 className='mb-4 text-2xl font-bold'>Test Email Notifications</h1>

      <div className='space-y-2'>
        <button
          onClick={handleSendEmail}
          disabled={sending}
          className='w-full rounded bg-blue-500 px-4 py-2 text-white hover:bg-blue-600 disabled:cursor-not-allowed disabled:opacity-50'
        >
          {sending ? 'Sending...' : 'Send Test Email'}
        </button>

        {error && (
          <div className='rounded border border-red-200 bg-red-100 p-3 text-red-700'>
            {error}
          </div>
        )}

        {success && (
          <div className='rounded border border-green-200 bg-green-100 p-3 text-green-700'>
            Email sent successfully! Check your inbox.
          </div>
        )}

        <div className='mt-4 text-sm text-gray-600'>
          <p>
            This page tests the email notification system. When you click the
            button:
          </p>
          <ol className='ml-5 mt-2 list-decimal space-y-1'>
            <li>It will attempt to send a test email to your account</li>
            <li>You must be signed in to receive the email</li>
            <li>Check the browser console for detailed logs</li>
          </ol>
        </div>
      </div>
    </div>
  );
}
