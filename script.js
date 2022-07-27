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
let msg, map, mapEvent;

// navigator.geolocation.getCurrentPosition(
//   function (position) {
//     const { latitude, longitude } = position.coords;

//     map = L.map('map').setView([latitude, longitude], 13);

//     L.tileLayer('http://{s}.google.com/vt/lyrs=m&x={x}&y={y}&z={z}', {
//       maxZoom: 20,
//       subdomains: ['mt0', 'mt1', 'mt2', 'mt3'],
//     }).addTo(map);

//     L.marker([latitude, longitude])
//       .addTo(map)
//       .bindPopup('A pretty CSS3 popup.<br> Easily customizable.')
//       .openPopup();
//     map.on('click', function (mapE) {
//       mapEvent = mapE;

//       form.classList.remove('hidden');
//       inputDistance.focus();
//       btnOK.style.display = 'block';

//       inputDistance.value = inputDuration.value = inputCadence.value = '';
//     });
//   },
//   function () {
//     alert(`Could not determine your location`);
//   }
// );

// form.addEventListener('submit', function (x) {
//   x.preventDefault();
//   const { lat: lat, lng: lang } = mapEvent.latlng;
//   msg = `Type: ${
//     inputType.value[0].toUpperCase() + inputType.value.slice(1)
//   } <br>Distance: ${inputDistance.value}km <br>Duration: ${
//     inputDuration.value
//   }mins<br>  ${
//     inputType.value === 'running'
//       ? `Cadence: ${inputCadence.value}`
//       : `Elevation: ${inputElevation.value}`
//   } steps/min`;
//
//   L.marker([lat, lang])
//     .addTo(map)
//     .bindPopup(
//       L.popup({
//         maxWidth: 200,
//         minWidth: 100,
//         autoClose: false,
//         closeOnClick: false,
//         className:
//           inputType.value === 'running' ? 'running-popup' : 'cycling-popup',
//       })
//     )
//     .setPopupContent(msg)
//     .openPopup();
//   form.classList.add('hidden');
// });
// inputType.addEventListener('change', function (x) {
//   x.preventDefault();
//   inputElevation.closest('.form__row').classList.toggle('form__row--hidden');
//   inputCadence.closest('.form__row').classList.toggle('form__row--hidden');
// });

class App {
  #map;
  #mapEvent;
  constructor() {
    this._getCurrentLocation();
  }

  _toggleElevation() {
    inputElevation.closest('.form__row').classList.toggle('form__row--hidden');
    inputCadence.closest('.form__row').classList.toggle('form__row--hidden');
  }

  _submitForm(x) {
    {
      x.preventDefault();
      const { lat: lat, lng: lang } = this.#mapEvent.latlng;
      msg = `Type: ${
        inputType.value[0].toUpperCase() + inputType.value.slice(1)
      } <br>Distance: ${inputDistance.value}km <br>Duration: ${
        inputDuration.value
      }mins<br>  ${
        inputType.value === 'running'
          ? `Cadence: ${inputCadence.value}`
          : `Elevation: ${inputElevation.value}`
      } steps/min`;

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
        .setPopupContent(msg)
        .openPopup();

      // hides the input form

      form.classList.add('hidden');
      // form.style.display = 'none';
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
    // console.log('mapf', this.#map);

    // handling click on the map
    this.#map.on('click', this._showForm.bind(this));
    form.addEventListener('submit', this._submitForm.bind(this));
    inputType.addEventListener('change', this._toggleElevation.bind(this));
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
