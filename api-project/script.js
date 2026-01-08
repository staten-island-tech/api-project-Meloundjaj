const URL = "https://theofficeapi.dev/api/character/62";

async function getData(URL) {
  try {
    const response = await fetch(URL);
    if (response.status != 200) {
      throw new Error(response);
    } else {
      const data = await response.json(); //makes the data into JSON object we can use
      console.log(data);
      document.getElementById("api-response").textContent = data.name;
    }
  } catch (error) {
    console.log(error);
    console.log("BIG STUPID ERROR");
  }
}
getData(URL);
  