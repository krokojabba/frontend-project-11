import onChange from 'on-change';

export default (initState, i18nextInstance) => {
  const form = document.querySelector('form');
  const postsUl = document.querySelector('#posts');
  const feedsUl = document.querySelector('#feeds');
  const contentSection = document.querySelector('#content-section');
  const modalForm = document.querySelector('#modal');

  const clearFeedback = (targetForm) => {
    const existFeedback = targetForm.querySelector('#feedback');
    if (existFeedback) existFeedback.remove();
  };

  const renderFeeds = (feeds) => {
    contentSection.classList.remove('invisible');
    feedsUl.innerHTML = '';
    feeds.forEach((feed) => {
      const feedLi = document.createElement('li');
      feedLi.classList.add('list-group-item');
      const feedTitle = document.createElement('h3');
      feedTitle.classList.add('h6', 'm0');
      feedTitle.textContent = feed.title;
      const feedDescription = document.createElement('p');
      feedDescription.classList.add('m-0', 'small', 'text-black-50');
      feedDescription.textContent = feed.description;
      feedLi.prepend(feedTitle, feedDescription);
      feedsUl.prepend(feedLi);
    });
  };

  const renderViewedPosts = (viewedPosts) => {
    postsUl.querySelectorAll('li').forEach((post) => {
      const postModalBtn = post.querySelector('.btn');
      const { dataset: { postId } } = postModalBtn;
      if (viewedPosts.includes(postId)) {
        const postTitle = post.querySelector('a');
        postTitle.classList.remove('fw-bold');
        postTitle.classList.add('fw-normal');
      }
    });
  };

  const renderPosts = (posts, viewedIds) => {
    contentSection.classList.remove('invisible');
    postsUl.innerHTML = '';
    posts.forEach((post) => {
      const postLi = document.createElement('li');
      postLi.classList.add('list-group-item', 'd-flex', 'justify-content-between', 'align-item-start');
      const postLink = document.createElement('a');
      postLink.textContent = post.title;
      postLink.classList.add('fw-bold');
      postLink.href = post.link;
      const postModalBtn = document.createElement('button');
      postModalBtn.classList.add('btn', 'btn-primary');
      postModalBtn.type = 'button';
      postModalBtn.dataset.bsTarget = '#modal';
      postModalBtn.dataset.bsToggle = 'modal';
      postModalBtn.dataset.postId = post.id;
      postModalBtn.textContent = i18nextInstance.t('viewBtnLable');
      postLi.prepend(postLink, postModalBtn);
      postsUl.prepend(postLi);
    });
    renderViewedPosts(viewedIds);
  };

  const renderForm = (state) => {
    switch (state.rssSubscribeForm.state) {
      case 'filling': {
        form.elements.submit.disabled = false;
        form.elements.url.classList.remove('is-invalid');
        form.elements.url.value = '';
        form.elements.url.focus();
        break;
      }
      case 'invalid': {
        clearFeedback(form);
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
        clearFeedback(form);
        form.elements.url.classList.remove('is-invalid');
        form.elements.url.classList.add('is-valid');
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
  };

  const renderModal = ({ title, description, link }) => {
    const modalLabel = modalForm.querySelector('#modalLabel');
    modalLabel.textContent = title;
    const modalBodyText = modalForm.querySelector('.modal-body p');
    modalBodyText.textContent = description;
    const modalBtn = modalForm.querySelector('.btn-primary');
    modalBtn.href = link;
  };

  const state = onChange(initState, (path/* , current, previous */) => {
    console.log(path);
    switch (path) {
      case 'rssSubscribeForm.state': {
        renderForm(state);
        break;
      }
      case 'uiState.modal.currentPostId':
        /* console.log(state.uiState.modal.currentPostId);
        console.log(state.getPostById(state.uiState.modal.currentPostId));
        console.log(JSON.stringify(state)); */
        renderModal(state.getPostById(state.uiState.modal.currentPostId));
        break;
      case 'posts':
        renderPosts(state.posts, state.uiState.posts.viewedIds);
        break;
      case 'feeds':
        renderFeeds(state.feeds);
        break;
      case 'uiState.posts.viewedIds':
        console.log(state.uiState.posts.viewedIds);
        renderViewedPosts(state.uiState.posts.viewedIds);
        break;
      default:
        break;
    }
  }, /* { details: ['addFeed', 'addPosts', 'addViewedPostId'] }*/);
  return state;
};
