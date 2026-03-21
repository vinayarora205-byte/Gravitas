// test_match_email.mjs
const payload = {
  message: "I am a frontend developer looking for remote work. Skills: React, TypeScript. Expected salary: 50k. Experience: 3 years. Location: NY. Full Name: John Doe. Email: test@example.com",
  conversationId: "d3817ea9-5ea4-409e-9738-d97e0d72ea30",
  profileId: "bfaa3dc5-2697-4db9-8359-d167ec5008c3",
  role: "CANDIDATE"
};

const payload2 = {
  message: `Please save my profile.
<PROFILE_DATA>
{
  "job_title": "React Developer",
  "skills": ["React"],
  "experience_years": 3,
  "salary_min": 50000,
  "salary_max": 80000,
  "work_type": "REMOTE",
  "location": "NY",
  "availability": "Immediate",
  "full_name": "Test User",
  "email": "testemail@example.com",
  "whatsapp_number": "123",
  "linkedin_url": "",
  "portfolio_url": ""
}
</PROFILE_DATA>`,
  conversationId: "d3817ea9-5ea4-409e-9738-d97e0d72ea30",
  profileId: "bfaa3dc5-2697-4db9-8359-d167ec5008c3",
  role: "CANDIDATE"
};

async function testMatch() {
  try {
    const response = await fetch("http://localhost:3005/api/gaia", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload2)
    });

    const reader = response.body.getReader();
    const decoder = new TextDecoder();
    console.log("Response Stream:");
    
    while (true) {
      const { done, value } = await reader.read();
      if (done) break;
      console.log(decoder.decode(value, { stream: true }));
    }
  } catch (err) {
    console.error("Test failed:", err);
  }
}

testMatch();
