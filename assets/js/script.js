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
    `https://api.openweathermap.org/data/2.5/onecall?lat=${dataObj.lat}&lon=${dataObj.lon}&appid=f67de90c072b4163b9f81aab537254be&units=metric`
  )
    .then((response) => {
      if (response.ok) {
        response.json().then((data) => {
          //create the current date and format it
          var dateObj = new Date();
          var month = dateObj.getUTCMonth() + 1; //months from 1-12
          var day = dateObj.getUTCDate();
          var year = dateObj.getUTCFullYear();
          newDate = year + "/" + month + "/" + day;

          console.log(dateObj);
          console.log(data);

          //store the necessary currentForcast data to display
          var currentForcast = {
            city: dataObj.city,
            date: newDate,
            emoji: data.current.weather[0].icon,
            temp: data.current.temp + " \u00B0C",
            humidity: data.current.humidity + " %",
            UV: data.current.uvi,
          };
          console.log(currentForcast);
        });
      }
    })
    .catch((error) => {
      alert("Error, something went wrong");
    });
}
