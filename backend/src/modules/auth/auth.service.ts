import { Resend } from 'resend'
import nodemailer from 'nodemailer'

const resend = process.env.RESEND_API_KEY
  ? new Resend(process.env.RESEND_API_KEY)
  : null

const smtpTransporter =
  process.env.SMTP_HOST && process.env.SMTP_USER && process.env.SMTP_PASS
    ? nodemailer.createTransport({
        host: process.env.SMTP_HOST,
        port: Number.parseInt(process.env.SMTP_PORT || '587', 10),
        secure: false,
        auth: {
          user: process.env.SMTP_USER,
          pass: process.env.SMTP_PASS,
        },
      })
    : null

export async function sendOTPEmail(to: string, otp: string): Promise<void> {
  const from = process.env.EMAIL_FROM || 'noreply@bagly.com.br'
  const subject = 'Bagly - Código de Verificação'
  const html = `
    <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto;">
      <h1 style="color: #6B8DD6;">Bagly</h1>
      <p>Seu código de verificação é:</p>
      <h2 style="font-size: 32px; letter-spacing: 4px; color: #1A1A1A; background: #F5F5F5; padding: 20px; text-align: center; border-radius: 8px;">
        ${otp}
      </h2>
      <p style="color: #666666;">Este código expira em 10 minutos.</p>
      <p style="color: #666666;">Se você não solicitou este código, ignore este e-mail.</p>
    </div>
  `

  if (resend) {
    await resend.emails.send({
      from,
      to,
      subject,
      html,
    })
  } else if (smtpTransporter) {
    await smtpTransporter.sendMail({
      from,
      to,
      subject,
      html,
    })
  } else {
    console.log('=== OTP EMAIL (DEV MODE) ===')
    console.log(`To: ${to}`)
    console.log(`OTP: ${otp}`)
    console.log('============================')
  }
}
