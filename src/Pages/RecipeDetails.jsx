import React, { useEffect, useState } from 'react';
import { useHistory, useParams } from 'react-router';
import ButtonBack from '../components/ButtonBack';
import FavoriteButton from '../components/FavoriteButton';
import MealCarousel from '../components/MealCarousel';
import ShareButton from '../components/ShareButton';
import { getStorage } from '../helpers/Storage';
import { fetchDrinksDetails, fetchFoodsDetails } from '../services/Api';
import '../styles/RecipeDetails.css';

const INGREDIENTS_MAX_NUM = 20;

function RecipeDetails() {
  const { id } = useParams();
  const history = useHistory();
  const {
    location: { pathname },
  } = history;
  const [detail, setDetails] = useState({});
  const [video, setVideo] = useState({});
  const [img, setImg] = useState({});
  const [title, setTitle] = useState('');
  const [category, setCategory] = useState('');
  const [ingredients, setIngredients] = useState([]);
  const [measures, setMeasures] = useState([]);
  const [notDoneRecipe, setNotDoneRecipe] = useState(true);
  const [continueRecipe, setContinueRecipe] = useState(false);

  const food = pathname.includes('meals');
  const drink = pathname.includes('drinks');

  useEffect(() => {
    const ingredientsTobe = [];
    const measuresTobe = [];
    for (let index = 1; index <= INGREDIENTS_MAX_NUM; index += 1) {
      if (detail[`strIngredient${index}`]?.length > 0) {
        ingredientsTobe.push(detail[`strIngredient${index}`]);
        measuresTobe.push(detail[`strMeasure${index}`]);
      }
    }
    setIngredients(ingredientsTobe);
    setMeasures(measuresTobe);
  }, [detail]);

  useEffect(() => {
    const doneRecipes = getStorage('doneRecipes');
    if (doneRecipes.some((recipe) => recipe.id === id)) setNotDoneRecipe(false);
  }, [id, pathname]);

  useEffect(() => {
    const getInProgressRecipes = JSON.parse(localStorage
      .getItem('inProgressRecipes'));
    if (getInProgressRecipes?.drinks?.[id]) {
      setContinueRecipe(true);
    }
    if (getInProgressRecipes?.meals?.[id]) {
      setContinueRecipe(true);
    }
  }, [id]);

  useEffect(() => {
    (async () => {
      if (drink) {
        setCategory(detail?.strAlcoholic);
        setTitle(detail?.strDrink);
        setImg(detail?.strDrinkThumb);
        setVideo(detail?.strVideo?.replace('watch?v=', 'embed/'));
        const drinkDetails = await fetchDrinksDetails(id);
        setDetails(drinkDetails);
      }
      if (food) {
        setCategory(detail?.strCategory);
        setTitle(detail?.strMeal);
        setImg(detail?.strMealThumb);
        setVideo(detail?.strYoutube?.replace('watch?v=', 'embed/'));
        const foodDetails = await fetchFoodsDetails(id);
        setDetails(foodDetails);
      }
    })();
  }, [
    id,
    drink,
    food,
    detail,
  ]);

  return (
    <div className="recipe-page">
      <div>
        <div className="sobreporIMG">
          <ButtonBack />
          <h1 data-testid="recipe-title">{title}</h1>
          <h2 data-testid="recipe-category">{category}</h2>
          <div className="containerBtnFavorite">
            <ShareButton />
            <FavoriteButton />
          </div>
        </div>
        <img
          className="img-recipe"
          data-testid="recipe-photo"
          src={ img }
          alt="meal img"
        />
        <div className="mealInformation">
          <div>
            <h3>Ingredients</h3>
            <ul className="text-list">
              {
                ingredients.map((ingredient, index) => (
                  <li
                    key={ index }
                    data-testid={ `${index}-ingredient-name-and-measure` }
                  >
                    {ingredient}
                    {' '}
                    {measures[index]}
                  </li>
                ))
              }
            </ul>
          </div>
        </div>
        <div>
          <h3>Instructions</h3>
          <div className="text-desciption">
            <p data-testid="instructions">{detail?.strInstructions}</p>
          </div>
        </div>

        {video && (
          <iframe
            title="Food Video"
            width="100%"
            height="300px"
            data-testid="video"
            src={ video }
          />
        )}
      </div>
      <MealCarousel />

      {notDoneRecipe && (
        <button
          className="initiate-recipe-butt"
          type="button"
          data-testid="start-recipe-btn"
          onClick={ () => history.push(`${pathname}/in-progress`) }
        >
          {
            continueRecipe
              ? 'Continue Recipe'
              : 'Start Recipe'
          }
        </button>
      )}
    </div>
  );
}

export default RecipeDetails;
