/* eslint-disable */
// @ts-nocheck
import { Resend } from 'resend';

const resend = new Resend(process.env.RESEND_API_KEY!);

const baseEmailStyles = `
  font-family: monospace;
  background-color: #04050d;
  color: #e2e8f0;
  padding: 40px;
`;

const containerStyles = `
  max-width: 600px;
  margin: 0 auto;
  border: 1px solid #1e293b;
  border-radius: 8px;
  background-color: #0f172a;
  padding: 30px;
`;

const headerStyles = `
  color: #00f5d4;
  margin-top: 0;
  font-size: 24px;
`;

const scoreStyles = `
  display: inline-block;
  padding: 5px 10px;
  background-color: rgba(0, 245, 212, 0.1);
  color: #00f5d4;
  border: 1px solid #00f5d4;
  border-radius: 4px;
  font-weight: bold;
`;

const detailsCardStyles = `
  margin: 20px 0;
  padding: 20px;
  border: 1px solid #334155;
  background-color: #1e293b;
  border-radius: 6px;
`;

const buttonStyles = `
  display: inline-block;
  padding: 12px 24px;
  background-color: #00f5d4;
  color: #04050d;
  text-decoration: none;
  font-weight: bold;
  border-radius: 4px;
  margin-right: 15px;
`;

const secondaryButtonStyles = `
  display: inline-block;
  padding: 12px 24px;
  background-color: transparent;
  color: #00f5d4;
  text-decoration: none;
  font-weight: bold;
  border: 1px solid #00f5d4;
  border-radius: 4px;
`;

export async function sendCandidateMatchEmail({
  candidateEmail, candidateName, jobTitle, companyName, companyWebsite, 
  salary, workType, location, recruiterName, recruiterEmail, 
  recruiterWhatsapp, recruiterLinkedin, matchScore
}: any) {
  try {
    await resend.emails.send({
      from: 'GRAVITAS <onboarding@resend.dev>',
      to: candidateEmail,
      subject: `⚡ GRAVITAS: New Match — ${jobTitle} at ${companyName}`,
      html: `
        <div style="${baseEmailStyles}">
          <div style="${containerStyles}">
            <h1 style="${headerStyles}">New Match Available!</h1>
            <p>Hi ${candidateName},</p>
            <p>GAIA has successfully matched you with a new opportunity based on your profile.</p>
            
            <div style="${scoreStyles}">Match Score: ${Math.round(matchScore * 100)}%</div>
            
            <div style="${detailsCardStyles}">
              <h2 style="${headerStyles}">Job Details:</h2>
              <ul style="list-style-type: none; padding-left: 0;">
                <li><strong>Role:</strong> ${jobTitle}</li>
                <li><strong>Company:</strong> ${companyName}</li>
                <li><strong>Salary:</strong> ₹${salary}/month</li>
                <li><strong>Type:</strong> ${workType} (${location})</li>
              </ul>
              
              <h2 style="${headerStyles} margin-top: 20px;">Recruiter Contact Info:</h2>
              <ul style="list-style-type: none; padding-left: 0;">
                <li><strong>Name:</strong> ${recruiterName}</li>
                <li><strong>Email:</strong> ${recruiterEmail}</li>
                <li><strong>WhatsApp:</strong> ${recruiterWhatsapp || 'N/A'}</li>
                <li><strong>LinkedIn:</strong> ${recruiterLinkedin ? `<a href="${recruiterLinkedin}" style="color: #00f5d4;">View Profile</a>` : 'N/A'}</li>
                <li><strong>Website:</strong> ${companyWebsite ? `<a href="${companyWebsite}" style="color: #00f5d4;">${companyWebsite}</a>` : 'N/A'}</li>
              </ul>
            </div>
            
            <p>If you're interested, you can reach out directly using the contact details provided.</p>
            
            <div style="margin-top: 30px;">
              <a href="http://localhost:3000/dashboard/candidate" style="${buttonStyles}">View in GRAVITAS</a>
              <a href="mailto:${recruiterEmail}" style="${secondaryButtonStyles}">Contact Directly</a>
            </div>
          </div>
        </div>
      `,
    });
  } catch (error) {
    console.error('Failed to send candidate email', error);
  }
}

export async function sendRecruiterMatchEmail({
  recruiterEmail, recruiterName, candidateName, jobTitle, salary, 
  workType, location, candidateEmail, candidateWhatsapp, 
  candidateLinkedin, portfolioUrl, matchScore
}: any) {
  try {
    await resend.emails.send({
      from: 'GRAVITAS <onboarding@resend.dev>',
      to: recruiterEmail,
      subject: `⚡ GRAVITAS: New Candidate — ${candidateName} for ${jobTitle}`,
      html: `
        <div style="${baseEmailStyles}">
          <div style="${containerStyles}">
            <h1 style="${headerStyles}">New Candidate Match!</h1>
            <p>Hi ${recruiterName},</p>
            <p>GAIA has successfully matched a candidate for your open position.</p>
            
            <div style="${scoreStyles}">Match Score: ${Math.round(matchScore * 100)}%</div>
            
            <div style="${detailsCardStyles}">
              <h2 style="${headerStyles}">Role Details:</h2>
              <ul style="list-style-type: none; padding-left: 0;">
                <li><strong>Role:</strong> ${jobTitle}</li>
                <li><strong>Expected Salary:</strong> ₹${salary}/month</li>
                <li><strong>Preference:</strong> ${workType} (${location})</li>
              </ul>
              
              <h2 style="${headerStyles} margin-top: 20px;">Candidate Contact Info:</h2>
              <ul style="list-style-type: none; padding-left: 0;">
                <li><strong>Name:</strong> ${candidateName}</li>
                <li><strong>Email:</strong> ${candidateEmail}</li>
                <li><strong>WhatsApp:</strong> ${candidateWhatsapp || 'N/A'}</li>
                <li><strong>LinkedIn:</strong> ${candidateLinkedin ? `<a href="${candidateLinkedin}" style="color: #00f5d4;">View Profile</a>` : 'N/A'}</li>
                <li><strong>Portfolio/GitHub:</strong> ${portfolioUrl ? `<a href="${portfolioUrl}" style="color: #00f5d4;">View Work</a>` : 'N/A'}</li>
              </ul>
            </div>
            
            <p>If you're interested, you can reach out directly to the candidate.</p>
            
            <div style="margin-top: 30px;">
              <a href="http://localhost:3000/dashboard/recruiter" style="${buttonStyles}">View in GRAVITAS</a>
              <a href="mailto:${candidateEmail}" style="${secondaryButtonStyles}">Contact Directly</a>
            </div>
          </div>
        </div>
      `,
    });
  } catch (error) {
    console.error('Failed to send recruiter email', error);
  }
}
