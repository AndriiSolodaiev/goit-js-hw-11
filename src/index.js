import { Notify } from 'notiflix';
import axios from 'axios';
import SimpleLightbox from 'simplelightbox';
import 'simplelightbox/dist/simple-lightbox.min.css';

const KEY = '32825730-a8ef2845eee46c8d864ef66d9';
const API_URL = 'https://pixabay.com/api/';
// const loadBtn = document.querySelector(".load-more")

const options = {
  root: null,
  rootMargin: '150px',
  thresholder: 1.0,
};
const guard = document.querySelector('.js-guard');
const observer = new IntersectionObserver(onInfinityLoad, options);
let page = 1;
let inputValue = '';
const form = document.querySelector('#search-form');
const gallery = document.querySelector('.gallery');
let lightbox = new SimpleLightbox('.gallery a', {
  captionsData: 'alt',
  captionDelay: 250,
});

form.addEventListener('submit', onFormSubmit);
// loadBtn.addEventListener("click", onloadBtnClick)

async function onFormSubmit(evt) {
  evt.preventDefault();
  gallery.innerHTML = null;
  //  loadBtn.hidden = true;
  inputValue = form.elements.searchQuery.value.trim();
  page = 1;

  if (inputValue) {
    try {
      const resp = await fetchImg(inputValue);
      if (!resp.data.totalHits) {
        Notify.failure(
          'Sorry, there are no images matching your search query. Please try again'
        );
        observer.unobserve(guard);
        return;
      }
      Notify.success(`Hooray! We found ${resp.data.totalHits} images.`);
      // loadBtn.hidden = false;

      createMarkup(resp.data.hits);
      lightbox.refresh();
      observer.observe(guard);
    } catch (err) {
      err => console.log(err);
    }
  } else {
    Notify.info('The input is empty.');
  }
}

function onInfinityLoad(entries, observer) {
  entries.forEach(async entry => {
    try {
      if (entry.isIntersecting) {
        page += 1;
        const resp = await fetchImg(inputValue, page);
        createMarkup(resp.data.hits);
        if (Math.ceil(resp.data.totalHits / 40) === page) {
          Notify.failure(
            "We're sorry, but you've reached the end of search results."
          );
          observer.unobserve(guard);
        }
        smoothScroll();
        lightbox.refresh();
      }
    } catch (err) {
      console.log(err);
    }
  });
}

// function onloadBtnClick() {
//   page += 1;
//   fetchImg(inputValue, page).then(({ data }) => {
//     if (!data.hits[0]) {
//       loadBtn.hidden = true;
//       Notify.failure("We're sorry, but you've reached the end of search results.");
//       return;
//     }
//     return createMarkup(data.hits)
//   })
// }
function fetchImg(name, page = 1) {
  return axios.get(
    `${API_URL}?key=${KEY}&q=${name}&image_type=photo&orientation=horizontal&safesearch=true&page=${page}&per_page=40`
  );
}

// async function fetchImg(name) {
//   const response = await fetch(
//     `${API_URL}?key=${KEY}&q=${name}&image_type=photo&orientation=horizontal&safesearch=true`
//   );
// console.log(response)
//   if (!response.ok) {
//     throw new Error(response.statusText);
//   }

//   const data = await response.json();

//   return data;
// }

function createMarkup(arr) {
  const markupGallery = arr
    .map(
      ({
        webformatURL,
        largeImageURL,
        tags,
        likes,
        views,
        comments,
        downloads,
      }) => {
        return `
  <a href="${largeImageURL}">
  <div class="photo-card">
  <img class="photo-card__photo" src="${webformatURL}" alt="${tags}" loading="lazy"/>
  <div class="info">
    <p class="info-item">
      <b>Likes</b>
      ${likes}
    </p>
    <p class="info-item">
      <b>Views</b>
      ${views}
    </p>
    <p class="info-item">
      <b>Comments</b>
      ${comments}
    </p>
    <p class="info-item">
      <b>Downloads</b>
      ${downloads}
    </p>
  </div>
  </div>
  </a>
`;
      }
    )
    .join('');
  gallery.insertAdjacentHTML('beforeend', markupGallery);
}



function smoothScroll() {
  const { height: cardHeight } = document
    .querySelector('.gallery')
    .firstElementChild.getBoundingClientRect();

  window.scrollBy({
    top: cardHeight * 2,
    behavior: 'smooth',
  });
}
