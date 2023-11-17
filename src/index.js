import * as yup from 'yup';
import axios from 'axios';
import _ from 'lodash';
import init from './init.js';
import view from './view.js';

const { initState, i18nextInstance } = init();
const state = view(initState, i18nextInstance);

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
  id: _.uniqueId(),
  title: rssDocument.querySelector('channel>title').textContent,
  description: rssDocument.querySelector('channel>description').textContent,
});

const extractPosts = (rssDocument, channelId) => Array
  .from(rssDocument.querySelectorAll('item')).map((item) => ({
    id: _.uniqueId(),
    title: item.querySelector('title').textContent,
    link: item.querySelector('link').textContent,
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

const form = document.querySelector('form');
form.addEventListener('submit', (e) => {
  e.preventDefault();
  state.rssSubscribeForm.state = 'checking';
  // console.log(state.fids.map(({ link }) => link));
  rssURLValidate(form.elements.url.value)
    .then(() => {
      state.rssSubscribeForm.error = '';
      // state.rssSubscribeForm.state = 'adding';
      return getRSS(form.elements.url.value);
    })
    .then(({ data: { contents } }) => {
      // console.log(contents);
      // console.log(parsRSS(contents));
      const rssDocument = parsRSS(contents);
      const currentChannel = { ...extractChannel(rssDocument), link: form.elements.url.value };
      state.feeds.push(currentChannel);
      state.posts.push(...extractPosts(rssDocument, currentChannel.id));
    })
    .then(() => {
      state.rssSubscribeForm.state = 'added';
      state.rssSubscribeForm.state = 'filling';
    })
    .catch((err) => {
      console.log(err);
      state.rssSubscribeForm.error = err.message;
      state.rssSubscribeForm.state = 'invalid';
    });
});
