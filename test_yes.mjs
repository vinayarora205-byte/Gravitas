// test_yes.mjs
const payload = {
  message: "YES",
  conversationId: "d3817ea9-5ea4-409e-9738-d97e0d72ea30",
  profileId: "bfaa3dc5-2697-4db9-8359-d167ec5008c3",
  role: "CANDIDATE"
};

async function testYes() {
  try {
    const response = await fetch("http://localhost:3005/api/gaia", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload)
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

testYes();
