import './styles.scss';
import 'bootstrap';
import i18n from 'i18next';
import _ from 'lodash';
import resources from './locales/index.js';

const isEqualPost = (post, anotherPost) => [
  'title',
  'link',
  'channelId',
  'description',
].reduce((acc, key) => acc && post[key] === anotherPost[key], true);

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

  addPosts(newPosts) {
    const uniqPosts = _.uniqWith([...this.posts, ...newPosts], isEqualPost);
    this.posts = uniqPosts.map((post) => (post.id ? post : { ...post, id: _.uniqueId() }));
  }

  addFeed(newFeed) {
    const id = _.uniqueId();
    this.feeds.push({ id, ...newFeed });
    return id;
  }

  getFeeds() {
    return this.feeds;
  }

  getPostById(id) {
    return this.posts.find((post) => post.id === id);
  }

  addViewedPostId(id) {
    if (!this.uiState.posts.viewedIds.includes(id)) {
      this.uiState.posts.viewedIds = [...this.uiState.posts.viewedIds, id];
    }
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
