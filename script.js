'use strict';

// prettier-ignore
const months = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
let pp;
const form = document.querySelector('.form');
const containerWorkouts = document.querySelector('.workouts');
const inputType = document.querySelector('.form__input--type');
const inputDistance = document.querySelector('.form__input--distance');
const inputDuration = document.querySelector('.form__input--duration');
const inputCadence = document.querySelector('.form__input--cadence');
const inputElevation = document.querySelector('.form__input--elevation');
const btnOK = document.querySelector('.form__btn');

class Workout {
  date = new Date();
  id = parseInt(Date.now().toString().slice(-9));
  constructor(cords, duration, distance) {
    this.cords = cords;
    this.duration = duration;
    this.distance = distance;
  }
}

class Running extends Workout {
  constructor(cords, duration, distance, cadence) {
    super(cords, duration, distance);
    this.cadence = cadence;
    this._pace();
  }
  _pace() {
    this.pace = this.distance / this.duration;
  }
}

class Cycling extends Workout {
  constructor(cords, duration, distance, elevation) {
    super(cords, duration, distance);
    this.elevation = elevation;
    this._speed();
  }
  _speed() {
    this.speed = this.distance / this.duration;
  }
}

class App {
  #map;
  #mapEvent;

  constructor() {
    this._getCurrentLocation();
    inputType.addEventListener('change', this._toggleElevation.bind(this));
    form.addEventListener('submit', this._submitForm.bind(this));
  }

  _displayText() {
    return `Type: ${
      inputType.value[0].toUpperCase() + inputType.value.slice(1)
    } <br>Distance: ${inputDistance.value}km <br>Duration: ${
      inputDuration.value
    }mins<br>  ${
      inputType.value === 'running'
        ? `Cadence: ${inputCadence.value}`
        : `Elevation: ${inputElevation.value}`
    } steps/min`;
  }

  _hideForm() {
    form.classList.add('hidden');
  }

  _toggleElevation() {
    inputElevation.closest('.form__row').classList.toggle('form__row--hidden');
    inputCadence.closest('.form__row').classList.toggle('form__row--hidden');
  }

  _submitForm(x) {
    {
      x.preventDefault();
      const { lat: lat, lng: lang } = this.#mapEvent.latlng;

      // displays the information on the form on the map
      L.marker([lat, lang])
        .addTo(this.#map)
        .bindPopup(
          L.popup({
            maxWidth: 200,
            minWidth: 100,
            autoClose: false,
            closeOnClick: false,
            className:
              inputType.value === 'running' ? 'running-popup' : 'cycling-popup',
          })
        )
        .setPopupContent(this._displayText)
        .openPopup();
      this._hideForm();
    }
  }

  _showForm(mapE) {
    this.#mapEvent = mapE;
    form.classList.remove('hidden');
    inputDistance.focus();
    btnOK.style.display = 'none';
    inputDistance.value =
      inputDuration.value =
      inputCadence.value =
      inputElevation.value =
        '';
  }

  _loadMap(position) {
    // collects the users location//
    const { latitude, longitude } = position.coords;

    //loads the map and sets the users location on the center of the viewport
    this.#map = L.map('map').setView([latitude, longitude], 27);

    // updates the map interface to google map
    L.tileLayer('http://{s}.google.com/vt/lyrs=m&x={x}&y={y}&z={z}', {
      maxZoom: 20,
      subdomains: ['mt0', 'mt1', 'mt2', 'mt3'],
    }).addTo(this.#map);

    //drops a marker on the users location
    L.marker([latitude, longitude])
      .addTo(this.#map)
      .bindPopup('A pretty CSS3 popup.<br> Easily customizable.')
      .openPopup();

    // handling click on the map
    this.#map.on('click', this._showForm.bind(this));
  }

  _getCurrentLocation() {
    navigator.geolocation.getCurrentPosition(
      this._loadMap.bind(this),
      function () {
        alert(`Could not determine your location`);
      }
    );
  }
}
let app = new App();
app;
