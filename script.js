console.log("connected");

const mainCont = document.querySelector(".main-container");
const retrieveBtn = document.querySelector("#retrieve-btn");
const formP = document.querySelector("#form-p");
const MIN_CONTENT = 10;

retrieveBtn.addEventListener("click", function (evt) {
  evt.preventDefault();
  const queryString = document.querySelector("#query-string").value;
  if (queryString) {
    retrieveRecipe(queryString);
  } // prevent request from sending if input is empty
  else {
    makeErrorMessage();
  }
});

function makeErrorMessage() {
  const inputRequired = document.createElement("div");
  inputRequired.innerHTML = `<i class="ph-warning-octagon ph-xl"></i> Please enter a search-term first.`;
  inputRequired.classList.add("error-input-required", "alert", "alert-danger");
  formP.append(inputRequired);
  setTimeout(removeErrorMessage, 5000);
}

function removeErrorMessage() {
  document.querySelector(".alert").remove();
}

async function retrieveRecipe(queryString) {
  await axios
    .get("https://api.edamam.com/search", {
      params: {
        app_id: APP_ID,
        app_key: APP_KEY,
        q: queryString,
        yield: 2,
        from: 0,
        to: 10,
      },
    })
    .then(function (response) {
      // handle success
      //if user enters search term that has no matches:
      if (response.data.hits.length === 0) {
        makeErrorSection(true);
      } else {
        const relevantRecipes = filterHighD(response.data.hits);
        console.log(relevantRecipes);
        if (relevantRecipes.length >= 1) {
          //empty potential error messages or other recipes
          mainCont.innerText = "";
          relevantRecipes.forEach((recipe) => makeRecipeSection(recipe));
        } else {
          //no high vit D matches for given search-term
          makeErrorSection(false);
        }
      }
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

//true if search term is misspelled and there re no matches in whole DB. false if no matches with high vit D content.
function makeErrorSection(searchTermIsWrong) {
  mainCont.innerText = "";
  const errorDivMain = makeRecipeDiv();
  const errorRowMain = makeRecipeRow();
  if (searchTermIsWrong) {
    makeErrorCol(
      "Oops! The term you have entered has no matches in our database. Please try again.",
      errorRowMain
    );
  } else {
    makeErrorCol(
      "Oops! We don't have any recipes that match your search term and are high in vitamin D content. Try something else! Perhaps enter some of <a href='https://www.webmd.com/food-recipes/guide/calcium-vitamin-d-foods'>these?</a>",
      errorRowMain
    );
  }
  errorDivMain.append(errorRowMain);
  mainCont.append(errorDivMain);
}

function makeErrorCol(msg, errorRow) {
  const errorCol = document.createElement("div");
  addStandardClassesToCol(errorCol);
  errorCol.classList.add("error-col");
  errorCol.innerHTML = `<i class="ph-warning-octagon ph-xl"></i> ${msg}`;
  errorRow.append(errorCol);
}

function filterHighD(hits) {
  const highDArr = hits.filter(
    //adjust per person
    (hit) =>
      hit.recipe.totalDaily.VITD.quantity / hit.recipe.yield >= MIN_CONTENT
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
