import * as yup from 'yup';
import init from './init.js';
import view from './view.js';

const { initState, i18nextInstance } = init();
const state = view(initState, i18nextInstance);

const checkNewUrl = (url, currentUrls, schema) => schema
  .isValid(url).then((isValidUrl) => {
    const result = {
      isValid: false,
      error: '',
    };
    if (isValidUrl) {
      if (!currentUrls.includes(url)) {
        result.isValid = true;
      } else {
        result.error = 'urlAlreadyExist';
      }
    } else {
      result.error = 'invalidUrl';
    }
    return result;
  });
const schema = yup.string().url();
const form = document.querySelector('form');
form.addEventListener('submit', (e) => {
  e.preventDefault();
  state.rssSubscribeForm.state = 'checking';
  checkNewUrl(form.elements.url.value, state.fids, schema).then(({ isValid, error }) => {
    if (isValid) {
      state.rssSubscribeForm.error = '';
      state.rssSubscribeForm.state = 'adding';
      state.fids.push(form.elements.url.value);
      state.rssSubscribeForm.state = 'added';
      state.rssSubscribeForm.state = 'filling';
    } else {
      state.rssSubscribeForm.error = error;
      state.rssSubscribeForm.state = 'invalid';
    }
  });
});
