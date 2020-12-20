console.log("connected");

const mainCont = document.querySelector(".main-container");
const retrieveBtn = document.querySelector("#retrieve-btn");

retrieveBtn.addEventListener("click", function () {
  retrieveRecipe();
});

async function retrieveRecipe() {
  await axios
    .get("https://api.edamam.com/search", {
      params: {
        app_id: APP_ID,
        app_key: APP_KEY,
        q: "fish",
        yield: 2,
        from: 0,
        to: 10,
      },
    })
    .then(function (response) {
      // handle success
      const relevantRecipes = filterHighD(response.data.hits);
      console.log(relevantRecipes);
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
    //adjust per person
    (hit) => hit.recipe.totalDaily.VITD.quantity / hit.recipe.yield >= 20
  );
  return highDArr;
}

function makeRecipeSection(recipe) {
  const recipeDivMain = makeRecipeDiv();
  const recipeRowMain = makeRecipeRow();
  const imgColMain = makeImgCol(recipe);
  const ingredientsColMain = makeIngredientsCol(recipe);
  const vitaminColMain = makeVitaminCol(recipe);
  appendAll(
    recipeDivMain,
    recipeRowMain,
    imgColMain,
    ingredientsColMain,
    vitaminColMain
  );
}

function makeRecipeDiv() {
  const recipeDiv = document.createElement("div");
  recipeDiv.classList.add(
    "container",
    "recipe-container",
    "px-3",
    "py-3",
    "mt-5",
    "shadow"
  );
  return recipeDiv;
}

function makeRecipeRow() {
  const recipeRow = document.createElement("div");
  recipeRow.classList.add("row", "justify-content-around", "recipe-row");
  return recipeRow;
}

function makeImgCol(recipe) {
  const imageCol = document.createElement("div");
  addStandardClassesToCol(imageCol);
  imageCol.classList.add("image-col");
  const image = document.createElement("img");
  image.setAttribute("src", recipe.recipe.image);
  image.setAttribute("alt", "recipe image");
  image.classList.add("img-fluid");
  imageCol.append(image);
  makeYieldInfo(recipe.recipe.yield, imageCol);
  makeLink(recipe.recipe.url, imageCol);
  return imageCol;
}

function addStandardClassesToCol(col) {
  col.classList.add("col-md-3", "px-3", "py-3", "mx-3", "my-3", "shadow");
}

function makeLink(url, imageCol) {
  const a = document.createElement("a");
  a.innerText = "Full recipe";
  a.setAttribute("href", url);
  imageCol.append(a);
}

function makeYieldInfo(yield, imageCol) {
  const yieldP = document.createElement("p");
  yieldP.innerText = `Serves: ${yield}`;
  imageCol.append(yieldP);
}

function makeIngredientsCol(recipe) {
  const ingredientsCol = document.createElement("div");
  addStandardClassesToCol(ingredientsCol);
  ingredientsCol.classList.add("ingredients-col");
  const title = makeRecipeTitle(recipe.recipe.label);
  const ingredients = makeIngredientsHeader();
  const ingredientsList = makeIngredientsList(recipe.recipe.ingredientLines);
  ingredientsCol.append(title);
  ingredientsCol.append(ingredients);
  ingredientsCol.append(ingredientsList);
  return ingredientsCol;
}

function makeRecipeTitle(label) {
  const recipeTitle = document.createElement("h3");
  //if I use create element i and set inner text of h2 to label, it overwrites icon. so I'll use innerHTML although aware approach not ideal
  recipeTitle.innerHTML = `<i class='ph-fork-knife ph-xl'></i>${label}`;
  recipeTitle.classList.add("text-center");
  return recipeTitle;
}

function makeIngredientsHeader() {
  const ingrHeader = document.createElement("i");
  ingrHeader.innerText = "Ingredients";
  return ingrHeader;
}

function makeIngredientsList(ingredientsArr) {
  const ul = document.createElement("ul");
  ingredientsArr.forEach((ingr) => appendLi(ingr, ul));
  return ul;
}

function appendLi(ingr, ul) {
  let listItem = document.createElement("li");
  listItem.innerText = ingr;
  ul.append(listItem);
}

function makeVitaminCol(recipe) {
  const vitaminCol = document.createElement("div");
  addStandardClassesToCol(vitaminCol);
  vitaminCol.classList.add("vitamin-col");
  makeVitHeader(vitaminCol);
  makeVitaminDSection(
    recipe.recipe.totalDaily.VITD,
    recipe.recipe.yield,
    vitaminCol
  );
  makeCalciumSection(
    recipe.recipe.totalDaily.CA,
    recipe.recipe.yield,
    vitaminCol
  );
  return vitaminCol;
}

function makeVitHeader(vitaminCol) {
  //debugger;
  const vitHeader = document.createElement("h3");
  vitHeader.innerHTML = `<i class="ph-first-aid ph-xl"></i> Nutrient content`;
  vitHeader.classList.add("text-center");
  const perPersonI = document.createElement("i");
  perPersonI.innerText = "Per person";
  vitaminCol.append(vitHeader);
  vitaminCol.append(perPersonI);
}

function makeVitaminDSection(vitD, yield, vitaminCol) {
  let h5 = document.createElement("h5");
  h5.innerHTML = `<i class="ph-sun ph-xl"></i> ${vitD.label} Content`;
  let p = document.createElement("p");
  p.innerText = `% of daily recommended intake: ${(
    vitD.quantity / yield
  ).toFixed(2)}`;
  vitaminCol.append(h5);
  vitaminCol.append(p);
}

function makeCalciumSection(calcium, yield, vitaminCol) {
  let h5 = document.createElement("h5");
  h5.innerHTML = `<i class="fas fa-bone"></i> ${calcium.label} Content`;
  let p = document.createElement("p");
  p.innerText = `% of daily recommended intake: ${(
    calcium.quantity / yield
  ).toFixed(2)}`;
  vitaminCol.append(h5);
  vitaminCol.append(p);
}

//always has to select the LAST of these classes to pick the current section
function appendAll(
  recipeDivMain,
  recipeRowMain,
  imgColMain,
  ingredientsColMain,
  vitaminColMain
) {
  //append to current sections
  mainCont.append(recipeDivMain);
  recipeDivMain.append(recipeRowMain);
  recipeRowMain.append(imgColMain);
  recipeRowMain.append(ingredientsColMain);
  recipeRowMain.append(vitaminColMain);
}
