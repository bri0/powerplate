require('./injectGlobal');

const { invokeActions, rebindActions } = require('./actions');

require('./actions/user');

const mdcInit = () => {
  mdc.autoInit();

  const drawerEl = document.querySelector('.mdc-persistent-drawer');
  const MDCPersistentDrawer = mdc.drawer.MDCPersistentDrawer;
  const drawer = new MDCPersistentDrawer(drawerEl);
  document.querySelector('.main-menu').addEventListener('click', () => {
    drawer.open = !drawer.open;
  });
  drawerEl.addEventListener('MDCPersistentDrawer:open', () => {
    console.log('Received MDCPersistentDrawer:open');
  });
  drawerEl.addEventListener('MDCPersistentDrawer:close', () => {
    console.log('Received MDCPersistentDrawer:close');
  });

  const tfs = document.querySelectorAll(
    '.mdc-textfield:not([data-demo-no-auto-js])'
  );
  for (let i = 0; i < tfs.length; i++) {
    mdc.textfield.MDCTextfield.attachTo(tfs[i]);
  }

  const MDCFormField = mdc.formField.MDCFormField;
  const MDCRadio = mdc.radio.MDCRadio;
  const formFields = document.querySelectorAll('.mdc-form-field');
  for (let i = 0; i < formFields.length; i++) {
    const formField = formFields[i];
    const formFieldInstance = new MDCFormField(formField);

    const radio = formField.querySelector('.mdc-radio:not([data-demo-no-js])');
    if (radio) {
      const radioInstance = new MDCRadio(radio);
      formFieldInstance.input = radioInstance;
    }
  }

  let pollId = 0;
  pollId = setInterval(() => {
    const button = document.querySelector('.mdc-button');
    if (button) {
      const pos = getComputedStyle(button).position;
      if (pos === 'relative') {
        init();
        clearInterval(pollId);
      }
    }
  }, 250);
  function init() {
    const btns = document.querySelectorAll('.mdc-button:not([data-demo-no-js])');
    for (let i = 0; i < btns.length; i++) {
      mdc.ripple.MDCRipple.attachTo(btns[i]);
    }
  }
};

$(() => {
  rebindActions();
  mdcInit();
  invokeActions('onReady');
});

