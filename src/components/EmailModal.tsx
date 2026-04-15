import React, { useState } from 'react';

interface EmailModalProps {
  isOpen: boolean;
  onClose: () => void;
  recipientEmail: string;
}

const EmailModal: React.FC<EmailModalProps> = ({ isOpen, onClose, recipientEmail }) => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    subject: '',
    message: ''
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitStatus, setSubmitStatus] = useState<'idle' | 'success' | 'error'>('idle');
  const [showCopyOption, setShowCopyOption] = useState(false);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setSubmitStatus('idle');

    try {
      // Create mailto link with form data
      const subject = encodeURIComponent(formData.subject || 'Contact from GRABO Website');
      const body = encodeURIComponent(
        `Name: ${formData.name}\n` +
        `Email: ${formData.email}\n\n` +
        `Message:\n${formData.message}`
      );
      
      const mailtoLink = `mailto:${recipientEmail}?subject=${subject}&body=${body}`;
      
      // Open default email client
      window.location.href = mailtoLink;
      
      setSubmitStatus('success');
      
      // Close modal after a short delay
      setTimeout(() => {
        onClose();
        setFormData({ name: '', email: '', subject: '', message: '' });
        setSubmitStatus('idle');
      }, 2000);
      
    } catch (error) {
      console.error('Error sending email:', error);
      setSubmitStatus('error');
      setShowCopyOption(true);
    } finally {
      setIsSubmitting(false);
    }
  };

  const copyToClipboard = async () => {
    const emailContent = `To: ${recipientEmail}\n` +
      `Subject: ${formData.subject || 'Contact from GRABO Website'}\n\n` +
      `Name: ${formData.name}\n` +
      `Email: ${formData.email}\n\n` +
      `Message:\n${formData.message}`;
    
    try {
      await navigator.clipboard.writeText(emailContent);
      setSubmitStatus('success');
      setTimeout(() => {
        onClose();
        setFormData({ name: '', email: '', subject: '', message: '' });
        setSubmitStatus('idle');
        setShowCopyOption(false);
      }, 2000);
    } catch (error) {
      console.error('Failed to copy to clipboard:', error);
    }
  };

  if (!isOpen) return null;

  const modalStyle: React.CSSProperties = {
    position: 'fixed',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 10000,
    padding: '20px'
  };

  const modalContentStyle: React.CSSProperties = {
    backgroundColor: 'white',
    borderRadius: '12px',
    padding: '30px',
    maxWidth: '500px',
    width: '100%',
    maxHeight: '90vh',
    overflow: 'auto',
    boxShadow: '0 20px 40px rgba(0, 0, 0, 0.15)',
    position: 'relative',
    textAlign: 'left'
  };

  const closeButtonStyle: React.CSSProperties = {
    position: 'absolute',
    top: '15px',
    right: '20px',
    background: 'none',
    border: 'none',
    fontSize: '24px',
    cursor: 'pointer',
    color: '#666',
    lineHeight: 1
  };

  const formGroupStyle: React.CSSProperties = {
    marginBottom: '20px'
  };

  const labelStyle: React.CSSProperties = {
    display: 'block',
    marginBottom: '8px',
    fontWeight: '600',
    color: '#333',
    fontSize: '14px'
  };

  const inputStyle: React.CSSProperties = {
    width: '100%',
    padding: '12px',
    border: '2px solid #e1e5e9',
    borderRadius: '6px',
    fontSize: '14px',
    transition: 'border-color 0.3s ease',
    fontFamily: 'inherit'
  };

  const textareaStyle: React.CSSProperties = {
    ...inputStyle,
    minHeight: '120px',
    resize: 'vertical'
  };

  const buttonStyle: React.CSSProperties = {
    backgroundColor: '#8B4513',
    color: 'white',
    border: 'none',
    padding: '10px 20px',
    borderRadius: '6px',
    fontSize: '14px',
    fontWeight: '600',
    cursor: 'pointer',
    transition: 'background-color 0.3s ease',
    minWidth: '100px'
  };

  const cancelButtonStyle: React.CSSProperties = {
    ...buttonStyle,
    backgroundColor: '#6c757d'
  };

  return (
    <div style={modalStyle} onClick={onClose}>
      <div style={modalContentStyle} onClick={e => e.stopPropagation()}>
        <button style={closeButtonStyle} onClick={onClose}>×</button>
        
        <h2 style={{ marginBottom: '20px', color: '#6F4E37', fontSize: '24px', textAlign: 'left' }}>
          Contact GRABO
        </h2>
        
        <p style={{ marginBottom: '25px', color: '#666', lineHeight: 1.5, textAlign: 'left' }}>
          Send us a message and we'll get back to you as soon as possible.
        </p>

        {submitStatus === 'success' && (
          <div style={{
            backgroundColor: '#d4edda',
            color: '#155724',
            padding: '12px',
            borderRadius: '6px',
            marginBottom: '20px',
            border: '1px solid #c3e6cb'
          }}>
            ✅ Email client opened! Your message has been prepared.
          </div>
        )}

        {submitStatus === 'error' && (
          <div style={{
            backgroundColor: '#f8d7da',
            color: '#721c24',
            padding: '12px',
            borderRadius: '6px',
            marginBottom: '20px',
            border: '1px solid #f5c6cb'
          }}>
            ❌ Error opening email client. 
            {showCopyOption && (
              <div style={{ marginTop: '10px' }}>
                <button
                  onClick={copyToClipboard}
                  style={{
                    backgroundColor: '#721c24',
                    color: 'white',
                    border: 'none',
                    padding: '8px 16px',
                    borderRadius: '6px',
                    cursor: 'pointer',
                    fontSize: '13px',
                    fontWeight: '600'
                  }}
                >
                  📋 Copy Email Content
                </button>
                <span style={{ marginLeft: '10px', fontSize: '14px' }}>
                  or contact us directly at {recipientEmail}
                </span>
              </div>
            )}
          </div>
        )}

        {submitStatus === 'success' && showCopyOption && (
          <div style={{
            backgroundColor: '#d4edda',
            color: '#155724',
            padding: '12px',
            borderRadius: '6px',
            marginBottom: '20px',
            border: '1px solid #c3e6cb'
          }}>
            ✅ Email content copied to clipboard! You can now paste it into your email client.
          </div>
        )}
        
        <form onSubmit={handleSubmit}>
          <div style={formGroupStyle}>
            <label style={labelStyle} htmlFor="name">Your Name *</label>
            <input
              style={inputStyle}
              type="text"
              id="name"
              name="name"
              value={formData.name}
              onChange={handleInputChange}
              required
              placeholder="Enter your full name"
            />
          </div>

          <div style={formGroupStyle}>
            <label style={labelStyle} htmlFor="email">Your Email *</label>
            <input
              style={inputStyle}
              type="email"
              id="email"
              name="email"
              value={formData.email}
              onChange={handleInputChange}
              required
              placeholder="Enter your email address"
            />
          </div>

          <div style={formGroupStyle}>
            <label style={labelStyle} htmlFor="subject">Subject</label>
            <input
              style={inputStyle}
              type="text"
              id="subject"
              name="subject"
              value={formData.subject}
              onChange={handleInputChange}
              placeholder="What's this about?"
            />
          </div>

          <div style={formGroupStyle}>
            <label style={labelStyle} htmlFor="message">Message *</label>
            <textarea
              style={textareaStyle}
              id="message"
              name="message"
              value={formData.message}
              onChange={handleInputChange}
              required
              placeholder="Tell us how we can help you..."
            />
          </div>

          <div style={{ 
            marginTop: '30px', 
            display: 'flex', 
            justifyContent: 'space-between',
            alignItems: 'center',
            gap: '15px'
          }}>
            <button
              type="button"
              style={cancelButtonStyle}
              onClick={onClose}
              disabled={isSubmitting}
            >
              Cancel
            </button>
            <button
              type="submit"
              style={{
                ...buttonStyle,
                backgroundColor: isSubmitting ? '#ccc' : '#8B4513',
                cursor: isSubmitting ? 'not-allowed' : 'pointer'
              }}
              disabled={isSubmitting}
            >
              {isSubmitting ? 'Opening Email...' : 'Send Email'}
            </button>
          </div>
        </form>

        <div style={{
          marginTop: '20px',
          padding: '15px',
          backgroundColor: '#f8f9fa',
          borderRadius: '6px',
          fontSize: '12px',
          color: '#666',
          textAlign: 'left'
        }}>
          <strong>Note:</strong> This will open your default email client with the message pre-filled. 
          You can then send it directly from your email application.
        </div>
      </div>
    </div>
  );
};

export default EmailModal;
