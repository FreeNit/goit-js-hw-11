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
  let userRequest = e.currentTarget.elements.searchQuery.value.trim();
  if (!userRequest) {
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
      newsApiService.myTotalHits = totalHits;
      return articles;
    })
    .then(articles => {
      appendArticlesMarkup(articles);
      lightbox.refresh();
      loadMoreBtn.classList.remove('is-hidden');
    });
}

function onLoadMore() {
  if (newsApiService.displayAmount >= newsApiService.myTotalHits) {
    Notify.warning(
      "We're sorry, but you've reached the end of search results."
    );
    loadMoreBtn.classList.add('is-hidden');
    return;
  }
  console.log(newsApiService.myTotalHits);
  newsApiService.fetchArticles().then(data => {
    const { hits: articles, totalHits } = data;
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
