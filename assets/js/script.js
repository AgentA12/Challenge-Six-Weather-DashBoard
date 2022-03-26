//when document is ready start program
$(document).ready(() => {
  //for animation purposes
  setTimeout(() => {
    $("body").css({ "overflow-x": "auto", "overflow-y": "auto" });
  }, 2000);

  //on submit of the element with id of form container, pass the event as an argument
  $("#form-container").on("submit", (event) => {
    //stop form from resetting
    event.preventDefault();
    // get the value of the input element inside the form
    var cityInputValue = $(event.target).find("input").val();
    //check if input if empty
    if (cityInputValue) {
      //reset the input value
      $(event.target).find("input").val("");
      //remove the error message if it is appended
      $("#error-div").remove();
      //get the city data and pass the city name in
      getCityData(cityInputValue);
    } else displayErrorMessage();
  });
});

function displayErrorMessage() {
  //check if the error message exist, if so remove it
  if ($("#error-div").length) {
    $("#error-div").remove();
  }
  // create the error message div with styles and attributes
  var errorMessageEl = $("<div></div>")
    .text("Error, please enter a valid city")
    .addClass("border-top border-danger text-danger mt-3")
    .attr("id", "error-div");

  //append it under the button
  $("#form-container").append(errorMessageEl);
}

function getCityData(cityName) {
  //get the lon and lat for the inputed city. note: i counldn't get the geocoding to work
  fetch(
    `http://api.openweathermap.org/geo/1.0/direct?q=${cityName}&limit=1&appid=f67de90c072b4163b9f81aab537254be`
  )
    .then((response) => {
      if (response.ok) {
        response.json().then((data) => {
          //if the correct data isnt recieved it means the city name is not vaild, so display the error message
          if (data[0] === undefined) {
            displayErrorMessage();
            return;
          }
          //get the city name, lon and lat and round them to the nearest two decimal places. note: if i lefted the entire cords as is i would get an error
          var cityDataShort = {
            city: data[0].name,
            lon: Math.round(data[0].lon * 100) / 100,
            lat: Math.round(data[0].lat * 100) / 100,
          };
          //pass the city data to get the current weather data
          getCurrentWeatherData(cityDataShort);
        });
      }
    })
    .catch((error) => {
      alert("Error, something went wrong.");
    });
}

function getCurrentWeatherData(dataObj) {
  //use the lon and lat to get the full list of weather data
  fetch(
    `https://api.openweathermap.org/data/2.5/onecall?lat=${dataObj.lat}&lon=${dataObj.lon}&appid=f67de90c072b4163b9f81aab537254be&units=imperial`
  )
    .then((response) => {
      if (response.ok) {
        response.json().then((data) => {
          //store the necessary currentForcast data to display
          var currentForcast = {
            city: dataObj.city,
            date:
              "(" +
              new Date(data.current.dt * 1000).toLocaleString("fr-CA", {
                year: "numeric",
                month: "2-digit",
                day: "2-digit",
              }) +
              ")",
            emoji: data.current.weather[0].icon,
            temp: data.current.temp + " \u00B0F",
            humidity: data.current.humidity + " %",
            UV: data.current.uvi,
            wind: data.current.wind_speed + " MPH",
          };
          //validate UV as int
          currentForcast.UV = parseFloat(currentForcast.UV);
          //get 5 day forcast
          var fiveDayForcast = [];
          //loop through the daily data array and get necessary data then push each object into the five day forcast array
          for (i = 1; i <= 5; i++) {
            var day = {
              city: dataObj.city,
              date: new Date(data.daily[i].dt * 1000).toLocaleString("fr-CA", {
                year: "numeric",
                month: "2-digit",
                day: "2-digit",
              }),
              emoji: data.daily[i].weather[0].icon,
              temp: data.daily[i].temp.day + " \u00B0F",
              wind: data.daily[i].wind_speed + " MPH",
              humidity: data.daily[i].humidity + " %",
            };
            //add the day to the array
            fiveDayForcast.push(day);
          }
          //pass the two bits of data to get appended to the page
          displayWeatherData(currentForcast, fiveDayForcast);
          //save current city to local storage
          saveCityToLocalStorage(currentForcast);
        });
      }
    })
    .catch((error) => {
      alert("Error, something went wrong");
    });
}

function displayWeatherData(currentData, fiveDayData) {
  //append current date data to html
  $("#current-city").text(currentData.city);
  $("#current-date").text(currentData.date);
  $("#current-emoji").attr(
    "src",
    `http://openweathermap.org/img/w/${currentData.emoji}.png`
  );
  $("#current-temp").text(currentData.temp);
  $("#current-wind").text(currentData.wind);
  $("#current-humidity").text(currentData.humidity);
  $("#current-UV").text(currentData.UV);

  //apply bg color for UV index
  if (currentData.UV <= 2) {
    $("#current-UV").addClass("badge bg-success");
  } else if (currentData.UV <= 6) {
    $("#current-UV").addClass("badge bg-warning");
  } else $("#current-UV").addClass("badge bg-danger");

  //update five day forcast
  for (x = 0; x < fiveDayData.length; x++) {
    //after selecting the contianer div, find the element inside the div that matches the .find() selector, then look at the only children that are spans and set the text content
    $(`[data-id=${x}]`).find("h4").text(fiveDayData[x].date);
    $(`[data-id=${x}]`)
      .find("[id=five-day-emoji]")
      .children()
      .attr(
        "src",
        `http://openweathermap.org/img/w/${fiveDayData[x].emoji}.png`
      );
    $(`[data-id=${x}]`)
      .find("[id=five-day-temp]")
      .children()
      .text(fiveDayData[x].temp);
    $(`[data-id=${x}]`)
      .find("[id=five-day-wind]")
      .children()
      .text(fiveDayData[x].wind);
    $(`[data-id=${x}]`)
      .find("[id=five-day-humidity]")
      .children()
      .text(fiveDayData[x].humidity);
  }
}

function saveCityToLocalStorage(cityObject) {
  var existingCitys = JSON.parse(localStorage.getItem("cities"));
  if (!existingCitys) existingCitys = [];

  //loop through the array
  for (i = 0; i < existingCitys.length; i++) {
    //check if the existingCitys.city already exists
    //if it does, remove the object
    if (existingCitys[i].city === cityObject.city) {
      existingCitys.splice(i, 1);
    }
  }
  //else just push the city
  existingCitys.push(cityObject);

  localStorage.setItem("cities", JSON.stringify(existingCitys));
}