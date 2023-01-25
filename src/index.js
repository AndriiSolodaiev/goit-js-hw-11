import { Notify } from 'notiflix';
import { fetchImg } from './js/fetchImg';

import { smoothScroll } from './js/helpers/smoothScroll';
import { createMarkup } from './js/renderFunctions';
import { refs } from './js/refs';
import { lightbox } from './js/helpers/simpleLightBox';
// const loadBtn = document.querySelector(".load-more")



let page = 1;
let inputValue = '';
const state = {
  page: 1,
  inputValue: ""}
const options = {
  root: null,
  rootMargin: '150px',
  thresholder: 1.0,
};
const guard = document.querySelector('.js-guard');
const observer = new IntersectionObserver(onInfinityLoad, options);



refs.form.addEventListener('submit', onFormSubmit);
// loadBtn.addEventListener("click", onloadBtnClick)

async function onFormSubmit(evt) {
  evt.preventDefault();
  console.log("jdlkfjgdj")
  refs.gallery.innerHTML = null;
  //  loadBtn.hidden = true;
  inputValue = evt.target.elements.searchQuery.value.trim();
  page = 1;

  if (inputValue) {
    try {
      const {totalHits, hits} = await fetchImg(inputValue);
      if (!totalHits) {
        Notify.failure(
          'Sorry, there are no images matching your search query. Please try again'
        );
        observer.unobserve(guard);
        return;
      }
      Notify.success(`Hooray! We found ${totalHits} images.`);
      // loadBtn.hidden = false;

      createMarkup(hits);
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
        const {totalHits, hits} = await fetchImg(inputValue, page);
        createMarkup(hits);
        if (Math.ceil(totalHits / 40) === page) {
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






