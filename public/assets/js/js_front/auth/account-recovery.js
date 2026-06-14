const accountRecoveryEmailInput = document.getElementById('account-recovery-email');
const accountRecoveryPhoneInput = document.getElementById('account-recovery-phone');
const accountRecoveryFeedback = document.getElementById('account-recovery-feedback');

const setAccountRecoveryFeedback = (message, isError = false) => {
  if (!accountRecoveryFeedback) {
    return;
  }

  accountRecoveryFeedback.textContent = message || '';
  accountRecoveryFeedback.style.color = isError ? '#b00020' : '';
};

async function submitAccountRecoveryRequest() {
  try {
    const email = accountRecoveryEmailInput?.value.trim();
    const phone = accountRecoveryPhoneInput?.value.trim();

    if (!email || !phone) {
      throw new Error('Debes indicar tu correo y número telefónico registrados');
    }

    setAccountRecoveryFeedback('Enviando solicitud...');

    const response = await fetch(`${API_BASE_URL}/api/auth/account-recovery-requests`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ email, phone })
    });
    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.error || 'No se pudo enviar la solicitud');
    }

    if (accountRecoveryEmailInput) {
      accountRecoveryEmailInput.value = '';
    }

    if (accountRecoveryPhoneInput) {
      accountRecoveryPhoneInput.value = '';
    }

    setAccountRecoveryFeedback(data.message || 'Solicitud enviada correctamente');
  } catch (error) {
    setAccountRecoveryFeedback(error.message, true);
  }
}

globalThis.submitAccountRecoveryRequest = submitAccountRecoveryRequest;