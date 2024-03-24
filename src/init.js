import './styles.scss';
import 'bootstrap';
import i18n from 'i18next';
import resources from './locales/index.js';

class State {
  constructor() {
    this.rssSubscribeForm = {
      state: 'filling', // filling, invalid, checking, adding
      error: '',
    };
    this.feeds = [];
    this.posts = [];
    this.lng = 'ru';
    this.uiState = {
      modal: {
        currentPostId: null,
      },
      posts: {
        viewedIds: [],
      },
    };
  }

  getURLList() {
    return this.feeds.map(({ link }) => link);
  }

  getFeeds() {
    return this.feeds;
  }

  getPostById(id) {
    return this.posts.find((post) => post.id === id);
  }
}

export default () => {
  const initState = new State();

  const i18nextInstance = i18n.createInstance();
  i18nextInstance.init({
    lng: initState.lng,
    debug: false,
    resources,
  });

  return { initState, i18nextInstance };
};
