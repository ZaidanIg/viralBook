const test = async () => {
    try {
      const res = await fetch('https://text.pollinations.ai/', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          messages: [
            { role: 'system', content: 'Output JSON exactly' },
            { role: 'user', content: 'Output {"test": "ok"}' }
          ],
          jsonMode: true
        })
      });
      console.log(await res.text());
    } catch (e) {
      console.log(e);
    }
  }
  
  test();
