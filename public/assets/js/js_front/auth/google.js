const GOOGLE_CLIENT_ID = '748491841488-u4vboqoa5cqi43klpa5686n5fdo1qnj6.apps.googleusercontent.com';

const renderGoogleButton = () => {
  const root = document.getElementById('google-signin-root');

  if (!root || !globalThis.google?.accounts?.id) {
    return;
  }

  root.innerHTML = '';

  globalThis.google.accounts.id.initialize({
    client_id: GOOGLE_CLIENT_ID,
    callback: handleCredentialResponse
  });

  globalThis.google.accounts.id.renderButton(root, {
    theme: 'outline',
    size: 'large'
  });
};

const ensureGoogleIdentityScript = () => {
  if (!document.getElementById('google-signin-root')) {
    return;
  }

  if (document.querySelector('script[data-google-identity="true"]')) {
    renderGoogleButton();
    return;
  }

  const script = document.createElement('script');
  script.src = 'https://accounts.google.com/gsi/client';
  script.async = true;
  script.defer = true;
  script.dataset.googleIdentity = 'true';
  script.onload = renderGoogleButton;
  document.head.appendChild(script);
};

function handleCredentialResponse(response) {
  fetch('http://localhost:3000/api/auth/google', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      credential: response.credential
    })
  })
  .then(async res => {
    const data = await res.json();

    if (!res.ok) throw new Error(data.error);

    return data;
  })
  .then(data => {
    setSession(data.token, 'customer');
    return redirectToDashboard();
  })
  .catch(err => alert(err.message));
}

ensureGoogleIdentityScript();