import { Resend } from 'resend'

export async function sendMatchEmail(
  to: string,
  subject: string,
  html: string
) {
  try {
    console.log("SENDING EMAIL TO:", to)
    const apiKey = process.env.RESEND_API_KEY
    if (!apiKey) {
      console.log("NO RESEND KEY FOUND")
      return
    }
    const resend = new Resend(apiKey)
    const result = await resend.emails.send({
      from: 'onboarding@resend.dev',
      to: [to],
      subject: subject,
      html: html
    })
    console.log("EMAIL SUCCESS:", result)
    return result
  } catch (err) {
    console.error("EMAIL ERROR:", err)
  }
}
