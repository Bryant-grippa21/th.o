if (!requireCustomerSession()) {
  throw new Error('Sesión requerida');
}

const customerProfileReminderModal = globalThis.document.getElementById('customer-profile-reminder-modal');
const customerProfileReminderMessage = globalThis.document.getElementById('customer-profile-reminder-message');
const customerProfileReminderGoButton = globalThis.document.getElementById('customer-profile-reminder-go');
const customerProfileReminderLaterButton = globalThis.document.getElementById('customer-profile-reminder-later');

const isMissingContactData = (customer) => {
  const phone = String(customer?.cell_phone || '').trim();
  const address = String(customer?.mail_address || '').trim();

  return !phone || !address;
};

const buildReminderMessage = (customer) => {
  const missingFields = [];

  if (!String(customer?.cell_phone || '').trim()) {
    missingFields.push('telefono');
  }

  if (!String(customer?.mail_address || '').trim()) {
    missingFields.push('direccion');
  }

  if (!missingFields.length) {
    return 'Hay datos pendientes por registrar.';
  }

  return `Tienes datos pendientes por registrar: ${missingFields.join(' y ')}. Puedes completarlos ahora o hacerlo luego.`;
};

const showProfileReminderModal = (customer) => {
  if (!customerProfileReminderModal || !customerProfileReminderMessage) {
    return;
  }

  customerProfileReminderMessage.innerText = buildReminderMessage(customer);
  customerProfileReminderModal.showModal();
};

const closeProfileReminderModal = () => {
  if (!customerProfileReminderModal?.open) {
    return;
  }

  customerProfileReminderModal.close();
};

if (customerProfileReminderGoButton) {
  customerProfileReminderGoButton.addEventListener('click', () => {
    globalThis.location.href = '/modules/customer/profile.html';
  });
}

if (customerProfileReminderLaterButton) {
  customerProfileReminderLaterButton.addEventListener('click', closeProfileReminderModal);
}

fetchCurrentSession()
  .then((session) => {
    if (session.entity !== 'customer') {
      throw new Error('Sesión no válida para customer');
    }

    const customer = session.data.user;

    globalThis.document.title = customer.name || customer.email || 'Customer';
    globalThis.document.getElementById('welcome').innerText =
      'Bienvenido ' + (customer.name || customer.email);
    globalThis.refreshCustomerLayout?.(customer);

    if (isMissingContactData(customer)) {
      showProfileReminderModal(customer);
    }
  })
  .catch(() => {
    clearSession();
    redirectToLogin();
  });