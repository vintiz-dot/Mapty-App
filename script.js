'use strict';

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
  _description() {
    // prettier-ignore
    this.description =`<li class="workout workout--${this.type === `Running` ? `running` : `cycling`}" data-id=${this.id}>
        <h2 class="workout__title">${this.type} on ${
      this.date.toDateString().split(' ')[1]
    } ${this.date.toDateString().split(' ')[2]}</h2>
        <div class="workout__details">
          <span class="workout__icon">${
            this.type === 'Running' ? '🏃' : '🚴‍♀️'
          }</span>
          <span class="workout__value">${this.distance}</span>
          <span class="workout__unit">km</span>
        </div>
        <div class="workout__details">
          <span class="workout__icon">⏱</span>
          <span class="workout__value">${this.duration}</span>
          <span class="workout__unit">min</span>
        </div>
        <div class="workout__details">
          <span class="workout__icon">⚡️</span>
          <span class="workout__value">${
            this.type === 'Running' ? `${this.pace}` : `${this.speed}`
          }</span>
          <span class="workout__unit">min/km</span>
        </div>
        <div class="workout__details">
          <span class="workout__icon">${
            this.type === 'Running' ? '🦶🏼' : '⛰'
          }</span>
          <span class="workout__value">${
            this.type === 'Running' ? `${this.cadence}` : `${this.elevation}`
          } </span>
          <span class="workout__unit">${
            this.type === 'Running' ? `spm` : `m`
          }</span>
        </div>
      </li>`;
  }
}

class Running extends Workout {
  type = 'Running';
  constructor(cords, duration, distance, cadence) {
    super(cords, duration, distance);
    this.cadence = cadence;
    this._pace();
    this._description();
  }

  _pace() {
    this.pace = (this.distance / this.duration).toFixed(2);
  }
}

class Cycling extends Workout {
  type = 'Cycling';
  constructor(cords, duration, distance, elevation) {
    super(cords, duration, distance);
    this.elevation = elevation;
    this._speed();
    this._description();
  }
  _speed() {
    this.speed = (this.distance / this.duration).toFixed(2);
  }
}

class App {
  #map;
  #mapEvent;
  #workouts = [];
  #zoomlevel = 18;
  #locationOptions = {
    enableHighAccuracy: true,
    timeout: 5000,
    maximumAge: 0,
  };

  constructor() {
    this._getCurrentLocation();
    this._getfromBrowser();
    inputType.addEventListener('change', this._toggleElevation.bind(this));
    form.addEventListener('submit', this._submitForm.bind(this));
    containerWorkouts.addEventListener('click', this._moveToPopUp.bind(this));
  }
  _storeInBrowser() {
    localStorage.setItem('workout', JSON.stringify(this.#workouts));
  }

  _getfromBrowser() {
    const data = JSON.parse(localStorage.getItem('workout'));
    if (!data) return;
    this.#workouts = data;
    data.forEach(workout => {
      form.insertAdjacentHTML('afterend', workout.description);
    });
  }

  _moveToPopUp(x) {
    const targ = x.target.closest('.workout');

    if (!targ) return;
    const view = this.#workouts.find(work => work.id == targ.dataset.id);

    this.#map.setView(view.cords, this.#zoomlevel, {
      animate: true,
      pan: { duration: 1 },
    });
  }

  _displayText(workout) {
    if (!workout.date.toDateString) {
      workout.date = new Date(workout.date);
    }
    const day = `${workout.type} on ${
      workout.date.toDateString().split(' ')[1]
    } ${workout.date.toDateString().split(' ')[2]}`;
    return day;
  }

  _hideForm() {
    form.classList.add('hidden');
  }

  _toggleElevation() {
    inputElevation.closest('.form__row').classList.toggle('form__row--hidden');
    inputCadence.closest('.form__row').classList.toggle('form__row--hidden');
  }

  _submitForm(x) {
    let distance = parseFloat(inputDistance.value);
    let duration = parseFloat(inputDuration.value);
    let type = inputType.value;
    let workout;

    x.preventDefault();
    const { lat: lat, lng: lang } = this.#mapEvent.latlng;
    function checkState(...inputs) {
      return inputs.every(num => isFinite(num));
    }

    function allPositive(...inputs) {
      return inputs.every(input => isFinite(parseFloat(input)) > 0);
    }

    if (type === 'running') {
      let cadence = +inputCadence.value;
      if (
        !checkState(distance, duration, cadence) &&
        !allPositive(distance, duration, cadence)
      ) {
        alert(`invalid input`);
        return;
      }
      workout = new Running([lat, lang], duration, distance, cadence);
      this.#workouts.push(workout);
      this._storeInBrowser();
      this._displayOnMap(workout);
    }

    if (type === 'cycling') {
      let elevation = +inputElevation.value;
      if (
        !checkState(distance, duration, elevation) &&
        !allPositive(distance, duration)
      ) {
        alert(`invalid input`);
        return;
      }
      workout = new Cycling([lat, lang], duration, distance, elevation);
      this.#workouts.push(workout);
      this._storeInBrowser();
      this._displayOnMap(workout);
    }
    form.insertAdjacentHTML('afterend', workout.description);
  }

  _displayOnMap(workout) {
    // displays the information on the form on the map
    L.marker(workout.cords)
      .addTo(this.#map)
      .bindPopup(
        L.popup({
          maxWidth: 200,
          minWidth: 100,
          autoClose: false,
          closeOnClick: false,
          className:
            workout.type === 'Running' ? 'running-popup' : 'cycling-popup',
          // className:`${workout.type}-popup`
        })
      )
      .setPopupContent(this._displayText(workout))
      .openPopup();
    this._hideForm();
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
    this.#map = L.map('map').setView([latitude, longitude], this.#zoomlevel);

    // updates the map interface to google map
    L.tileLayer('http://{s}.google.com/vt/lyrs=m&x={x}&y={y}&z={z}', {
      maxZoom: 20,
      subdomains: ['mt0', 'mt1', 'mt2', 'mt3'],
    }).addTo(this.#map);

    //drops a marker on the users location
    L.marker([latitude, longitude])
      .addTo(this.#map)
      .bindPopup('Your Current Location')
      .openPopup();

    this.#workouts.forEach(workout => {
      this._displayOnMap(workout);
    });
    // handling click on the map
    this.#map.on('click', this._showForm.bind(this));
  }

  _getCurrentLocation() {
    navigator.geolocation.getCurrentPosition(
      this._loadMap.bind(this),
      function () {
        alert(`Could not determine your location`);
      },
      this.#locationOptions
    );
  }
}
let app = new App();
