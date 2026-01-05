const key = import.meta.env.VITE_API_KEY;
const options = {
  method: 'GET',
  headers: {
    Accept: 'application/json',
    'X-Api-Key': key,
  },
};
export default class Modal {
  constructor({
    ModalSelector,
    CloseButtonSelector,
    OpenButtonSelector,
    Apiurl,
  }) {
    this.modalElement = document.querySelector(ModalSelector);
    this.closeButtonElement = document.querySelector(CloseButtonSelector);
    this.openButtonElement = document.querySelector(OpenButtonSelector);
    this.loader = this.openButtonElement.querySelector('.loader');
    this.BASE_URL = Apiurl;
    this.init();
  }
  init() {
    this.closeButtonElement.addEventListener('click', () => {
      this.closeModal();
    });
    this.openButtonElement.addEventListener('click', async () => {
      this.showLoader();
      const data = await this.loadData();
      const dataToRender = await this.collectData(data);
      this.render(dataToRender);
    });
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape') {
        this.closeModal();
      }
    });
  }
  showLoader() {
    this.loader.classList.add('visible');
  }

  hideLoader() {
    this.loader.classList.remove('visible');
  }
  async loadData() {
    const response = await fetch(this.BASE_URL, options);
    const data = await response.json();
    return data;
  }
  closeModal() {
    if (this.modalElement) {
      this.modalElement.classList.toggle('is-open');
    }
    document.body.classList.remove('is-open');
  }
  openModal() {
    if (this.modalElement) {
      this.modalElement.classList.toggle('is-open');
    }
    document.body.classList.add('is-open');
  }
  async collectData(data) {
    const { top_new_cars, top_new_vendors, top_secondary_vendors } = data;

    const newCarsData = [];
    const newVendorsData = [];
    const secondaryVendorsData = [];

    function collectNewCars(cars, limit = 3) {
      for (let i = 0; i < Math.min(cars.length, limit); i++) {
        const car = cars[i];
        newCarsData.push({
          model: car.model?.title || 'No model',
          vendor: car.vendor?.title || 'No vendor',
          registration: car.model?.first_registration_count ?? 'N/A',
        });
      }
    }

    function collectVendors(cars, limit = 3, targetArray) {
      if (!cars || cars.length === 0) return;
      for (let i = 0; i < Math.min(cars.length, limit); i++) {
        const vendorObj = cars[i];
        targetArray.push({
          title: vendorObj.title || 'No title',
          registration:
            vendorObj.first_registration_count ??
            vendorObj.all_registration_count ??
            'N/A',
        });
      }
    }

    collectNewCars(top_new_cars);
    collectVendors(top_new_vendors, 3, newVendorsData);
    collectVendors(top_secondary_vendors, 3, secondaryVendorsData);

    return {
      newCarsData,
      newVendorsData,
      secondaryVendorsData,
    };
  }
  async render({
    newCarsData = [],
    newVendorsData = [],
    secondaryVendorsData = [],
  }) {
    const newNames = document.querySelectorAll('.modal--new');
    const newRegs = document.querySelectorAll(
      '.modal__list-item--new .modal__list-count'
    );
    newNames.forEach((nameEl, index) => {
      const car = newCarsData[index];
      if (!car) return;
      nameEl.childNodes[0].textContent = car.vendor + ' ';
      const span = nameEl.querySelector('span');
      if (span) span.textContent = car.model;

      if (newRegs[index]) newRegs[index].textContent = car.registration;
    });

    const producerNames = document.querySelectorAll('.modal--producers');
    const producerRegs = document.querySelectorAll(
      '.modal__list-item--producers .modal__list-count'
    );

    producerNames.forEach((nameEl, index) => {
      const vendor = newVendorsData[index];
      if (!vendor) return;

      nameEl.textContent = vendor.title;
      producerRegs[index].textContent = vendor.registration;
    });

    const secondProdNames = document.querySelectorAll(
      '.modal--second-producers'
    );
    const secondProdRegs = document.querySelectorAll(
      '.modal__list-item--second-producers .modal__list-count'
    );

    secondProdNames.forEach((nameEl, index) => {
      const vendor = secondaryVendorsData[index];
      if (!vendor) return;

      nameEl.textContent = vendor.title;
      secondProdRegs[index].textContent = vendor.registration;
    });
    this.hideLoader();
    this.openModal();
  }
}
