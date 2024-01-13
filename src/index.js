import * as yup from 'yup';
import axios from 'axios';
import init from './init.js';
import view from './view.js';

const { initState, i18nextInstance } = init();
const state = view(initState, i18nextInstance);
const updateTimeout = 5000;

const rssURLValidate = (url) => yup
  .string()
  .url('invalidUrl')
  .notOneOf(
    state.feeds.map(({ link }) => link),
    'urlAlreadyExist',
  ).validate(url);

const parsRSS = (
  content,
  parse = (str) => new DOMParser().parseFromString(str, 'application/xml'),
) => {
  const rssDocument = parse(content);
  if (!rssDocument.querySelector('rss')) throw new Error('invalidRSS');
  return rssDocument;
};

const extractChannel = (rssDocument) => ({
  title: rssDocument.querySelector('channel>title').textContent,
  description: rssDocument.querySelector('channel>description').textContent,
});

const extractPosts = (rssDocument, channelId) => Array
  .from(rssDocument.querySelectorAll('item')).map((item) => ({
    title: item.querySelector('title').textContent,
    link: item.querySelector('link').textContent,
    description: item.querySelector('description').textContent,
    channelId,
  }));

const getRSS = (rssUrl) => axios({
  baseURL: 'https://allorigins.hexlet.app/get',
  params: {
    // url: encodeURIComponent(rssUrl),
    url: rssUrl,
    disableCache: true,
  },
}).catch(() => {
  throw new Error('networkError');
});

const updateFeeds = () => {
  setTimeout(() => {
    state.getFeeds().forEach((feed) => {
      getRSS(feed.link)
        .then(({ data: { contents } }) => {
          const rssDocument = parsRSS(contents);
          state.addPosts(extractPosts(rssDocument, feed.id));
        })
        .catch((err) => {
          console.log(err);
        });
    });
    // console.log(JSON.stringify(state));
    updateFeeds();
  }, updateTimeout);
};

const form = document.querySelector('form');
form.addEventListener('submit', (e) => {
  e.preventDefault();
  state.rssSubscribeForm.state = 'checking';
  rssURLValidate(form.elements.url.value)
    .then(() => {
      state.rssSubscribeForm.error = '';
      return getRSS(form.elements.url.value);
    })
    .then(({ data: { contents } }) => {
      const rssDocument = parsRSS(contents);
      console.log(rssDocument);
      const currentChannel = { ...extractChannel(rssDocument), link: form.elements.url.value };
      const currentCannelId = state.addFeed(currentChannel);
      state.addPosts(extractPosts(rssDocument, currentCannelId));
    })
    .then(() => {
      state.rssSubscribeForm.state = 'added';
      updateFeeds();
      state.rssSubscribeForm.state = 'filling';
    })
    .catch((err) => {
      console.log(err);
      state.rssSubscribeForm.error = err.message;
      state.rssSubscribeForm.state = 'invalid';
    });
});

const modal = document.querySelector('#modal');
modal.addEventListener('show.bs.modal', (e) => {
  const { relatedTarget: { dataset: { postId: targetPostId } } } = e;
  state.uiState.modal.currentPostId = targetPostId;
  state.addViewedPostId(targetPostId);
});
