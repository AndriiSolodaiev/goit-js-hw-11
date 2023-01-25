import axios from 'axios';

const API_KEY = '32825730-a8ef2845eee46c8d864ef66d9';
axios.defaults.baseURL = 'https://pixabay.com/api/';

export async function fetchImg(name, page = 1) {
    const options = new URLSearchParams({
      key: API_KEY,
      q:name,
      image_type: "photo",
      orientation: "horizontal",
      safesearch: true,
      page,
      per_page: 40
    }) 
  const {data} =  await axios(
    `?${options}`
  );
  return data;
}