const BASIC_URL = 'https://pixabay.com/api/';
const API_KEY = '17678291-8f52cafe3b96aa295b9f12444';

export default class NewsApiService {
  constructor() {
    this.searchQuery = '';
    this.imageType = 'photo';
    this.orientation = 'horizontal';
    this.safesearch = true;
    this.page = 1;
    this.perPage = 40;
  }

  async fetchArticles() {
    const url = `${BASIC_URL}?key=${API_KEY}&q=${this.searchQuery}&image_type=${this.imageType}&orientaion=${this.orientation}&safesearch=${this.safesearch}&page=${this.page}&per_page=${this.perPage}`;

    // return fetch(url)
    //   .then(responce => responce.json())
    //   .then(({ hits, totalHits }) => {
    //     this.incrementPage();
    //     return { hits, totalHits };
    //   });

    try {
      const response = await fetch(url);
      const photoCollection = await response.json();
      this.incrementPage();
      return photoCollection;
    } catch (error) {
      console.log(error.message);
    }
  }

  incrementPage() {
    this.page += 1;
  }

  resetPage() {
    this.page = 1;
  }

  get getQuery() {
    return this.searchQuery;
  }

  set setQuery(newQuery) {
    this.searchQuery = newQuery;
  }
}
