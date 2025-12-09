import './scripts/datetracker.js';
import './styles/main.scss';
import SearchForm from './scripts/SearchForm.js';
import Modal from './scripts/Modal.js';
import mask from './scripts/mask.js';

document.addEventListener('DOMContentLoaded', () => {
  let input = document.querySelector('.search__input');
  input.focus();
  let masked = mask(input);
  new SearchForm({
    FormSelector: '.search__form',
    InputSelector: '.search__input',
    ResultSelector: '.search-result',
    ErrorSelector: '.search-result__error',
    ResultBlockSelector: '.search-result__block',
    Loader: '.loader',
    CarContainer: '.search__result-car',
    Apiurl: 'https://baza-gai.com.ua/nomer/',
  });
  new Modal({
    ModalSelector: '.modal',
    CloseButtonSelector: '.modal__header-closebtn',
    OpenButtonSelector: '.search__button--top',
    Apiurl: 'https://baza-gai.com.ua/popular',
  });
});
