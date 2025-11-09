async function izbrisi(event) {
  if (event) event.preventDefault(); 
  try {
    const response = await fetch(`${window.location.origin}/xss/delete`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
    });

    if (!response.ok) {
      const text = await response.text();
      throw new Error(`Server error (${response.status}): ${text}`);
    }

    const result = await response.json();
    console.log(result.message);
    alert(result.message);
  } catch (error) {
    console.log('Error calling delete endpoint:', error);
  }
}