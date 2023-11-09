import onChange from 'on-change';

export default (initState, i18nextInstance) => {
  const form = document.querySelector('form');
  const clearFeedback = () => {
    const existFeedback = form.querySelector('#feedback');
    if (existFeedback) existFeedback.remove();
  };

  const state = onChange(initState, (path, current, previous) => {
    console.log(`${path}: ${previous} -> ${current}`);
    switch (state.rssSubscribeForm.state) {
      case 'filling': {
        form.elements.submit.disabled = false;
        form.elements.url.classList.remove('is-invalid');
        form.elements.url.value = '';
        form.elements.url.focus();
        break;
      }
      case 'invalid': {
        clearFeedback();
        form.elements.submit.disabled = false;
        form.elements.url.classList.add('is-invalid');
        const invalidMessage = document.createElement('div');
        invalidMessage.textContent = i18nextInstance.t(`error.${state.rssSubscribeForm.error}`);
        invalidMessage.classList.add('invalid-feedback');
        invalidMessage.id = 'feedback';
        form.querySelector('#rssInput').after(invalidMessage);
        break;
      }
      case 'adding': {
        form.elements.url.classList.remove('is-invalid');
        form.elements.url.classList.add('is-valid');
        form.elements.submit.disabled = true;
        break;
      }
      case 'checking': {
        form.elements.submit.disabled = true;
        break;
      }
      case 'added': {
        clearFeedback();
        const validMessage = document.createElement('div');
        validMessage.textContent = i18nextInstance.t('validFeedBack');
        validMessage.classList.add('valid-feedback');
        validMessage.id = 'feedback';
        form.querySelector('#rssInput').after(validMessage);
        break;
      }
      default:
        throw new Error('Undefined state!');
    }
  });
  return state;
};
