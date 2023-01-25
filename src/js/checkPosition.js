import { Notify } from 'notiflix/build/notiflix-notify-aio';
import SimpleLightbox from 'simplelightbox';
import articleTpl from '../templates/image.hbs';

import NewsApiService from './fetchData';

const newsApiService = new NewsApiService();

const galleryEl = document.querySelector('.gallery');
const loadMoreBtn = document.querySelector('.load-more');

let lightbox = new SimpleLightbox('.gallery a', {
  /* options */
  captionDelay: 300,
});

export default async function checkPosition() {
  // Нам потребуется знать высоту документа и высоту экрана:
  const height = document.body.offsetHeight;
  const screenHeight = window.innerHeight;

  // Они могут отличаться: если на странице много контента,
  // высота документа будет больше высоты экрана (отсюда и скролл).

  // Записываем, сколько пикселей пользователь уже проскроллил:
  const scrolled = window.scrollY;

  // Обозначим порог, по приближении к которому
  // будем вызывать какое-то действие.
  // В нашем случае — четверть экрана до конца страницы:
  const threshold = height - screenHeight / 4;

  // Отслеживаем, где находится низ экрана относительно страницы:
  const position = scrolled + screenHeight;

  if (position >= threshold) {
    // Если мы пересекли полосу-порог, вызываем нужное действие.
    await newsApiService
      .fetchArticles()
      .then(data => {
        const { hits: articles, totalHits } = data;
        if (totalHits === 1) {
          Notify.warning(
            'Sorry, there are no images matching your search query. Please try again.'
          );
          loadMoreBtn.classList.add('is-hidden');
          return;
        }
        Notify.success(`Horray! We found ${totalHits} images.`);
        return articles;
      })
      .then(articles => {
        appendArticlesMarkup(articles);
        lightbox.refresh();
      });
  }
}

function appendArticlesMarkup(articles) {
  galleryEl.insertAdjacentHTML('beforeend', articleTpl(articles));
}
