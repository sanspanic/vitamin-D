console.log("connected");

const mainCont = document.querySelector(".main-container");

retrieveBtn.addEventListener("click", function () {
  retrieveRecipe();
});

async function retrieveRecipe() {
  await axios
    .get("https://api.edamam.com/search", {
      params: {
        app_id: APP_ID,
        app_key: APP_KEY,
        q: "chicken",
        yield: 2,
        from: 0,
        to: 10,
      },
    })
    .then(function (response) {
      // handle success
      const relevantRecipes = filterHighD(response.data.hits);
      relevantRecipes.forEach((recipe) => makeRecipeSection(recipe));
    })
    .catch(function (error) {
      if (error.response) {
        // The request was made and the server responded with a status code
        // that falls out of the range of 2xx
        console.log(error.response.data);
        console.log(error.response.status);
        console.log(error.response.headers);
      } else if (error.request) {
        // The request was made but no response was received
        // `error.request` is an instance of XMLHttpRequest in the browser and an instance of
        // http.ClientRequest in node.js
        console.log(error.request);
      } else {
        // Something happened in setting up the request that triggered an Error
        console.log("Error", error.message);
      }
      console.log(error.config);
    });
}

function filterHighD(hits) {
  const highDArr = hits.filter(
    (hit) => hit.recipe.totalDaily.VITD.quantity >= 20
  );
  console.log(highDArr);
  return highDArr;
}

function makeRecipeSection(recipe) {
  makeRecipeDiv();
}

function makeRecipeDiv() {
  const recipeDiv = document.createElement.div;
  recipeDiv.classList.add(
    "container",
    "recipe-container",
    "px-3",
    "py-3",
    "mt-5",
    "shadow"
  );
}
