import Handlebars from 'handlebars';
import templateString from '../templates/CarRender.hbs?raw';
import DOMPurify from 'dompurify';

const key = import.meta.env.VITE_API_KEY;
const options = {
  method: 'GET',
  headers: {
    Accept: 'application/json',
    'X-Api-Key': key,
  },
};

export default class SearchForm {
  constructor({
    FormSelector,
    InputSelector,
    ResultSelector,
    ErrorSelector,
    ResultBlockSelector,
    Loader,
    CarContainer,
    Apiurl,
  }) {
    this.formElement = document.querySelector(FormSelector);
    this.InputElement = document.querySelector(InputSelector);
    this.errorElement = document.querySelector(ErrorSelector);
    this.resultElement = document.querySelector(ResultSelector);
    this.resultBlockElement = document.querySelector(ResultBlockSelector);
    this.errorCloseButton = this.errorElement.querySelector(
      '.search-result__error-close'
    );
    this.loader = document.querySelector(Loader);
    this.BASE_URL = Apiurl;
    this.template = Handlebars.compile(this.getTemplate());
    this.submitButton = this.formElement.querySelector(
      '.search__button--submit'
    );
    this.carContainer = document.querySelector(CarContainer);
    this.textError = this.errorElement.querySelector(
      '.search-result__error-text'
    );

    this.init();
  }

  init() {
    this.formElement.addEventListener('submit', (e) => this.handleSubmit(e));

    const updateButtonState = () => {
      const plate = this.getPlateNumber();
      this.submitButton.disabled = plate.length > 0 && plate.length < 8;
    };

    this.InputElement.addEventListener('keyup', updateButtonState);
    this.InputElement.addEventListener('keydown', () => {
      setTimeout(updateButtonState, 0);
    });

    this.submitButton.disabled = false;
  }

  getTemplate() {
    return templateString;
  }

  getPlateNumber() {
    const typed = this.InputElement?.dataset?.typed;
    if (typeof typed === 'string') return typed;
    return (this.InputElement?.value || '')
      .replace(/[^A-Za-z0-9]/g, '')
      .toUpperCase();
  }

  showLoader() {
    if (this.loader) this.loader.classList.add('visible');
  }

  hideLoader() {
    if (this.loader) this.loader.classList.remove('visible');
  }

  async handleSubmit(e) {
    e.preventDefault();
    this.removeErrorBlock();

    const plateNumber = this.getPlateNumber();

    this.showLoader();
    try {
      const response = await fetch(this.BASE_URL + plateNumber, options);
      if (!response.ok) {
        this.createErrorBlock();
        return;
      }

      const data = await response.json();
      this.dataRender(data);
    } catch (err) {
      this.createErrorBlock();
    }
  }

  dataRender(data) {
    const dirty = this.template(data);
    const clean = DOMPurify.sanitize(dirty);
    this.resultBlockElement.classList.add('hidden');
    this.carContainer.classList.remove('hidden');
    this.carContainer.innerHTML = clean;
    this.hideLoader();
  }

  createErrorBlock() {
    this.errorElement.classList.add('is-open');
    this.carContainer.classList.add('hidden');
    if (this.resultBlockElement) {
      this.resultBlockElement.classList.add('hidden');
    }
    const typed =
      this.InputElement?.dataset?.typed ?? this.InputElement?.value ?? '';
    this.textError.textContent = `Транспортное средство с номером "${typed}" не найдено в базе данных ГАИ. Проверьте правильность введенных данных.`;

    if (this.errorCloseButton) {
      this.errorCloseButton.addEventListener('click', () => {
        this.removeErrorBlock();
      });
    }
    this.hideLoader();
  }

  removeErrorBlock() {
    this.errorElement.classList.remove('is-open');
    if (this.resultBlockElement) {
      this.resultBlockElement.classList.remove('hidden');
    }
  }
}
