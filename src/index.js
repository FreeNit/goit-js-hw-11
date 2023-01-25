import getImages from './js/fetchData.js';
import NewsApiService from './js/fetchData';
import checkPosition from './js/checkPosition';

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

  newsApiService.searchQuery = e.currentTarget.elements.searchQuery.value;

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
      loadMoreBtn.classList.remove('is-hidden');
      return articles;
    })
    .then(articles => {
      appendArticlesMarkup(articles);
      lightbox.refresh();
    });
}

function onLoadMore() {
  newsApiService.fetchArticles().then(data => {
    const { hits: articles, totalHits } = data;
    if (totalHits === 1) {
      Notify.warning(
        'Sorry, there are no images matching your search query. Please try again.'
      );
      loadMoreBtn.classList.add('is-hidden');
      return;
    }
    appendArticlesMarkup(articles);
    lightbox.refresh();
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

(() => {
  window.addEventListener('scroll', throttle(checkPosition, 250));
  window.addEventListener('resize', throttle(checkPosition, 250));
})();
