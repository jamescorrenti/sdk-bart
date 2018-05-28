export function WmataAPI(apiKey) {
  if (apiKey !== undefined) {
    this.apiKey = apiKey;
  }
  else {
    // Default key for open public access.
    this.apiKey = "50572c1bb64a496dabdc37f911dbe04e";
  }
};

WmataAPI.prototype.realTimeDepartures = function(origin, direction) {
  let self = this;
  return new Promise(function(resolve, reject) {
    let url = "https://api.wmata.com/StationPrediction.svc/json/GetPrediction/"
    url += "C07" // origin
    // url += direction?
    // let url = "https://api.bart.gov/api/etd.aspx?json=y";
    url += "?api_key=" + self.apiKey;
    // url += "&cmd=etd";
    // url += "&orig=" + origin;
    //if (direction !== undefined) {
    ///  url += "&dir=" + direction;
    //}
    fetch(url).then(function(response) {
      return response.json();
    }).then(function(json) {
      console.log("Got JSON response from server:" + JSON.stringify(json));

      let data = json["root"]["station"][0];
      let departures = [];

      data["etd"].forEach( (destination) => {
        destination["estimate"].forEach( (train) => {
          let d = {
            "to": destination["abbreviation"],
            "minutes": Number.parseInt(train["minutes"]),
            "platform": train["platform"],
            "bike": (train["bikeflag"] === "1" ? true : false)
          };
          if (!Number.isInteger(d["minutes"])) {
            d["minutes"] = 0;
          }
          departures.push(d);
        });
      });

      // Sort departures
      departures.sort( (a,b) => { return (a["minutes"] - b["minutes"]) } );

      resolve(departures);
    }).catch(function (error) {
      reject(error);
    });
  });
}
