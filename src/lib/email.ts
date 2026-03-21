import { Resend } from 'resend'

export async function sendMatchEmail(
  to: string,
  subject: string,
  htmlContent: string
) {
  console.log("====== EMAIL ======")
  console.log("TO:", to)
  console.log("SUBJECT:", subject)
  console.log("===================")

  const apiKey = process.env.RESEND_API_KEY
  if (!apiKey || apiKey === 'placeholder' || apiKey === '') {
    console.log("No Resend key - email logged only")
    return
  }

  try {
    const resend = new Resend(apiKey)
    const result = await resend.emails.send({
      from: 'GRAVITAS <onboarding@resend.dev>',
      to,
      subject,
      html: `
        <div style="font-family:Inter,sans-serif;
          background:#F7F6F3;padding:40px;
          max-width:600px;margin:0 auto">
          <div style="background:#FF6B3D;padding:20px;
            border-radius:12px 12px 0 0;
            text-align:center">
            <h1 style="color:white;margin:0;
              font-size:24px">⚡ GRAVITAS</h1>
          </div>
          <div style="background:white;padding:32px;
            border-radius:0 0 12px 12px;
            border:1px solid #EAEAEA">
            ${htmlContent}
            <hr style="border:none;
              border-top:1px solid #EAEAEA;
              margin:24px 0">
            <p style="color:#999;font-size:12px;
              text-align:center">
              GRAVITAS — AI Powered Recruitment
            </p>
          </div>
        </div>
      `
    })
    console.log("EMAIL SENT SUCCESS:", result)
  } catch (err) {
    console.error("EMAIL FAILED:", err)
  }
}
