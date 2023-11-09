import './styles.scss';
import 'bootstrap';
import i18n from 'i18next';
import resources from './locales/index.js';

export default () => {
  const initState = {
    rssSubscribeForm: {
      state: 'filling', // filling, invalid, checking, adding
      error: '',
    },
    fids: [],
    posts: [],
    lng: 'en',
  };

  const i18nextInstance = i18n.createInstance();
  i18nextInstance.init({
    lng: initState.lng,
    debug: false,
    resources,
  });

  return { initState, i18nextInstance };
};
