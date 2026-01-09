const URL = "https://theofficeapi.dev/api/characters";




async function fetchData(URL) {
    
   

  try {
    const response = await fetch(URL);
    if (response.status != 200) {
      throw new Error(response);
    } 
      const data = await response.json(); //makes the data into JSON object we can use
      console.log(data);
    
    const output = document.getElementById("api-response");
    output.textContent = "";

    data.forEach(character => {
      const p = document.createElement("p");
      p.textContent = `${character.firstname} ${character.lastname}`;
      output.appendChild(p);
    });
 } catch (error) {
    console.log(error);
    console.log("BIG STUPID ERROR");
    

  }
}

fetchData(URL);



