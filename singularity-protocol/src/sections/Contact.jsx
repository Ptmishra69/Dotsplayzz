import { useState } from 'react'
import '../styles/contact.css'

const INITIAL = { name: '', email: '', message: '' }
const INITIAL_ERRORS = { name: '', email: '', message: '' }

/* ── Simple email regex ── */
const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

export default function Contact() {
  const [fields,  setFields]  = useState(INITIAL)
  const [errors,  setErrors]  = useState(INITIAL_ERRORS)
  const [status,  setStatus]  = useState('idle') /* idle | sending | success | error */

  /* ── Field change ── */
  function handleChange(e) {
    const { name, value } = e.target
    setFields(prev => ({ ...prev, [name]: value }))
    /* Clear error on change */
    if (errors[name]) setErrors(prev => ({ ...prev, [name]: '' }))
  }

  /* ── Validate ── */
  function validate() {
    const e = { ...INITIAL_ERRORS }
    let valid = true

    if (!fields.name.trim()) {
      e.name = 'Name is required.'
      valid = false
    }

    if (!fields.email.trim()) {
      e.email = 'Email is required.'
      valid = false
    } else if (!EMAIL_RE.test(fields.email)) {
      e.email = 'Enter a valid email address.'
      valid = false
    }

    if (!fields.message.trim()) {
      e.message = 'Message is required.'
      valid = false
    } else if (fields.message.trim().length < 10) {
      e.message = 'Message must be at least 10 characters.'
      valid = false
    }

    setErrors(e)
    return valid
  }

  /* ── Submit ── */
  async function handleSubmit(e) {
    e.preventDefault()
    if (!validate()) return

    setStatus('sending')

    try {
      /* 
        Replace this fetch with your actual endpoint:
        - Formspree:  https://formspree.io/f/YOUR_FORM_ID
        - EmailJS:    emailjs.sendForm(...)
        - Custom API: your backend endpoint
      */
      await new Promise(res => setTimeout(res, 1500)) /* mock 1.5s delay */

      setStatus('success')
      setFields(INITIAL)

      /* Reset to idle after 4 seconds */
      setTimeout(() => setStatus('idle'), 4000)

    } catch {
      setStatus('error')
      setTimeout(() => setStatus('idle'), 3000)
    }
  }

  const isSending = status === 'sending'
  const isSuccess = status === 'success'
  const isError   = status === 'error'

  return (
    <section
      id="contact"
      className="contact"
      aria-label="Contact — get in touch"
    >
      <div className="contact__inner">

        {/* ── Header ── */}
        <div className="contact__header">
          <span className="contact__label" aria-hidden="true">
            Contact
          </span>
          <h2 className="contact__headline">Get in Touch</h2>
          <p className="contact__subtext">
            Have questions, ideas, or partnership opportunities?
            We'd love to hear from you.
          </p>
        </div>

        {/* ── Form Card ── */}
        <div className="contact__card">
          <form
            className="contact__form"
            onSubmit={handleSubmit}
            noValidate
            aria-label="Contact form"
          >
            {/* Name + Email row */}
            <div className="contact__row">

              {/* Name */}
              <div className="contact__field">
                <label
                  htmlFor="contact-name"
                  className="contact__label-text"
                >
                  Name
                  <span className="contact__required" aria-hidden="true">*</span>
                </label>
                <input
                  id="contact-name"
                  name="name"
                  type="text"
                  className={`contact__input${errors.name ? ' error' : ''}`}
                  placeholder="Your name"
                  value={fields.name}
                  onChange={handleChange}
                  disabled={isSending || isSuccess}
                  autoComplete="name"
                  aria-required="true"
                  aria-describedby="contact-name-error"
                  aria-invalid={!!errors.name}
                />
                <span
                  id="contact-name-error"
                  className="contact__error-msg"
                  role="alert"
                  aria-live="polite"
                >
                  {errors.name}
                </span>
              </div>

              {/* Email */}
              <div className="contact__field">
                <label
                  htmlFor="contact-email"
                  className="contact__label-text"
                >
                  Email
                  <span className="contact__required" aria-hidden="true">*</span>
                </label>
                <input
                  id="contact-email"
                  name="email"
                  type="email"
                  className={`contact__input${errors.email ? ' error' : ''}`}
                  placeholder="your@email.com"
                  value={fields.email}
                  onChange={handleChange}
                  disabled={isSending || isSuccess}
                  autoComplete="email"
                  aria-required="true"
                  aria-describedby="contact-email-error"
                  aria-invalid={!!errors.email}
                />
                <span
                  id="contact-email-error"
                  className="contact__error-msg"
                  role="alert"
                  aria-live="polite"
                >
                  {errors.email}
                </span>
              </div>

            </div>

            {/* Message */}
            <div className="contact__field">
              <label
                htmlFor="contact-message"
                className="contact__label-text"
              >
                Message
                <span className="contact__required" aria-hidden="true">*</span>
              </label>
              <textarea
                id="contact-message"
                name="message"
                className={`contact__textarea${errors.message ? ' error' : ''}`}
                placeholder="Tell us what's on your mind..."
                value={fields.message}
                onChange={handleChange}
                disabled={isSending || isSuccess}
                aria-required="true"
                aria-describedby="contact-message-error"
                aria-invalid={!!errors.message}
              />
              <span
                id="contact-message-error"
                className="contact__error-msg"
                role="alert"
                aria-live="polite"
              >
                {errors.message}
              </span>
            </div>

            {/* Submit */}
            <button
              type="submit"
              className={`contact__submit${
                isSending ? ' contact__submit--sending' :
                isSuccess  ? ' contact__submit--success' : ''
              }`}
              disabled={isSending || isSuccess}
              aria-label={
                isSending ? 'Sending message...' :
                isSuccess  ? 'Message sent successfully' :
                'Send message'
              }
            >
              {isSending && (
                <span className="contact__spinner" aria-hidden="true" />
              )}
              {isSending  ? 'Sending...'         :
               isSuccess  ? '✓ Message Sent'     :
               isError    ? 'Failed — Try Again' :
               'Send Message'}
            </button>

          </form>
        </div>

        {/* Support text */}
        <p className="contact__support">
          Business inquiries:&nbsp;
          <a href="mailto:contact@dotsplayzz.com">
            contact@dotsplayzz.com
          </a>
        </p>

      </div>
    </section>
  )
}