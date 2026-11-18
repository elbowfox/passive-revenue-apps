document.getElementById('summarize').addEventListener('click', async () => {
  const apiKey = document.getElementById('apiKey').value.trim();
  if (!apiKey) return alert('Enter API key');

  chrome.storage.local.set({ apiKey });

  const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
  
  chrome.scripting.executeScript({
    target: { tabId: tab.id },
    func: () => document.body.innerText.slice(0, 8000)
  }, async (results) => {
    const text = results[0].result;
    const summaryDiv = document.getElementById('summary');
    summaryDiv.textContent = 'Summarizing...';

    try {
      const res = await fetch('https://api.openai.com/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${apiKey}`
        },
        body: JSON.stringify({
          model: 'gpt-4o-mini',
          messages: [{
            role: 'user',
            content: `Summarize the following webpage text in 5 concise bullet points:\n\n${text}`
          }],
          max_tokens: 300
        })
      });
      const data = await res.json();
      summaryDiv.textContent = data.choices[0].message.content;
    } catch (e) {
      summaryDiv.textContent = 'Error: ' + e.message;
    }
  });
});

// Load saved key
chrome.storage.local.get(['apiKey'], (result) => {
  if (result.apiKey) document.getElementById('apiKey').value = result.apiKey;
});