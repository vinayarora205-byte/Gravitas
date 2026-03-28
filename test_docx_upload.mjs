import fs from 'fs';

async function testUpload() {
  const filePath = "C:/Users/PC/Downloads/AI_Engineer_Resume.docx";
  const fileBuffer = fs.readFileSync(filePath);
  const base64 = fileBuffer.toString('base64');
  const fileData = `data:application/vnd.openxmlformats-officedocument.wordprocessingml.document;base64,${base64}`;

  console.log("Sending request to /api/claura...");

  try {
    const res = await fetch("http://localhost:3005/api/claura", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        message: "Please analyze my resume.",
        conversationId: "test-conversation-123", // Even if it fails validation, it might log first
        profileId: "test-profile-123",
        role: "CANDIDATE",
        fileData,
        fileName: "AI_Engineer_Resume.docx",
        fileType: "application/vnd.openxmlformats-officedocument.wordprocessingml.document"
      })
    });

    console.log("Response Status:", res.status);
    const text = await res.text();
    console.log("Response Body:", text.substring(0, 200));
  } catch(e) {
    console.error(e);
  }
}

testUpload();
