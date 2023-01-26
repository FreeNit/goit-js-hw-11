import getImages from './js/fetchData.js';
import NewsApiService from './js/fetchData';

import { Notify } from 'notiflix/build/notiflix-notify-aio';
import SimpleLightbox from 'simplelightbox';
var throttle = require('lodash.throttle');
// Додатковий імпорт стилів
import 'simplelightbox/dist/simple-lightbox.min.css';

// Handelbars templates
import articleTpl from './templates/image.hbs';

const form = document.querySelector('#search-form');
const galleryEl = document.querySelector('.gallery');
const loadMoreBtn = document.querySelector('.load-more');
const newsApiService = new NewsApiService();

// Prevent default behavior of the form
form.addEventListener('submit', onSearch);
loadMoreBtn.addEventListener('click', onLoadMore);

let lightbox = new SimpleLightbox('.gallery a', {
  /* options */
  captionDelay: 300,
});

function onSearch(e) {
  e.preventDefault();

  newsApiService.resetPage();
  clearArticlesContainer();
  let userRequest = e.currentTarget.elements.searchQuery.value;
  if (!userRequest.trim()) {
    Notify.failure('Please provide search data!');
    return;
  }

  newsApiService.searchQuery = userRequest;

  newsApiService
    .fetchArticles()
    .then(data => {
      const { hits: articles, totalHits } = data;
      // check if collection has data
      if (articles.length === 0) {
        Notify.failure(
          'Sorry, there are no images matching your search query. Please try again.'
        );
        return;
      }
      Notify.success(`Horray! We found ${totalHits} images.`);
      return articles;
    })
    .then(articles => {
      appendArticlesMarkup(articles);
      lightbox.refresh();
      loadMoreBtn.classList.remove('is-hidden');
    });
}

function onLoadMore() {
  newsApiService.fetchArticles().then(data => {
    const { hits: articles, totalHits } = data;
    if (newsApiService.displayAmount >= totalHits) {
      Notify.warning(
        'Sorry, there are no images matching your search query. Please try again.'
      );
      loadMoreBtn.classList.add('is-hidden');
      return;
    }
    newsApiService.displayAmount += newsApiService.perPage;
    appendArticlesMarkup(articles);
    lightbox.refresh();

    // Smooth scrolling
    const { height: cardHeight } = document
      .querySelector('.gallery')
      .firstElementChild.getBoundingClientRect();

    window.scrollBy({
      top: cardHeight * 2,
      behavior: 'smooth',
    });
  });
}

function appendArticlesMarkup(articles) {
  galleryEl.insertAdjacentHTML('beforeend', articleTpl(articles));
}

function clearArticlesContainer() {
  galleryEl.innerHTML = '';
}
