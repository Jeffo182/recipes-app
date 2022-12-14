import PropTypes from 'prop-types';
import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { getStorageNoDefault, setStorage } from '../helpers/Storage';
import {
  fetchDrinks, fetchDrinksCategoryList, fetchFoods, fetchMealsCategoryList,
  filterDrinksByCategory, filterFoodsByCategory,
} from '../services/Api';
import Context from './Context';

const PASSWORD_MIN_SIZE = 6;

function Provider({ children }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [enableFormButt, setEnableFormButt] = useState(true);
  const [title, setTitle] = useState('');
  const [showIcon, setShowIcon] = useState(true);
  const [foodsAPI, setFoodsAPI] = useState([]);
  const [drinksAPI, setDrinksAPI] = useState([]);
  const [foods, setFoods] = useState([]);
  const [drinks, setDrinks] = useState([]);
  const [drinksCategoryList, setDrinksCategoryList] = useState([]);
  const [mealsCategoryList, setMealsCategoryList] = useState([]);
  const [mealCategorySelected, setMealCategorySelected] = useState('');
  const [drinkCategorySelected, setDrinkCategorySelected] = useState('');

  const clearInputs = useCallback(() => {
    setEmail('');
    setPassword('');
  }, [setEmail]);

  useEffect(() => {
    if (!getStorageNoDefault('doneRecipes')) {
      setStorage('doneRecipes', []);
    }
    if (!getStorageNoDefault('favoriteRecipes')) {
      setStorage('favoriteRecipes', []);
    }
    if (!getStorageNoDefault('inProgressRecipes')) {
      setStorage('inProgressRecipes', {
        drinks: {},
        meals: {},
      });
    }
  }, []);

  useEffect(() => {
    const requestApiDrinks = async () => {
      const drinksArr = await fetchDrinks();
      const foodsArr = await fetchFoods();
      setDrinksAPI(drinksArr);
      setFoodsAPI(foodsArr);
      setDrinks(drinksArr);
      setFoods(foodsArr);
    };
    requestApiDrinks();
  }, []);

  useEffect(() => {
    const requestCategoryApi = async () => {
      const categoryDrinksListApi = await fetchDrinksCategoryList();
      const categoryMealsListApi = await fetchMealsCategoryList();
      setDrinksCategoryList(categoryDrinksListApi);
      setMealsCategoryList(categoryMealsListApi);
    };
    requestCategoryApi();
  }, []);

  useEffect(() => {
    const regex = /\S+@\S+\.\S+/;
    const validEmail = regex.test(email);
    const validPassword = password.length > PASSWORD_MIN_SIZE;
    setEnableFormButt(!(validEmail && validPassword));
  }, [email, password]);

  useEffect(() => {
    const filterByCategory = async () => {
      if (mealCategorySelected) {
        const foodCategory = await filterFoodsByCategory(mealCategorySelected);
        setFoods(foodCategory);
      }
      if (drinkCategorySelected) {
        const drinkCategory = await filterDrinksByCategory(drinkCategorySelected);
        setDrinks(drinkCategory);
      }
    };
    filterByCategory();
  }, [mealCategorySelected, drinkCategorySelected]);

  const handleEmailChange = useCallback(
    ({ target }) => {
      setEmail(target.value);
    },
    [setEmail],
  );

  const handlePasswordChange = useCallback(
    ({ target }) => {
      setPassword(target.value);
    },
    [setPassword],
  );

  const handleClickMealCategory = useCallback(
    ({ target }) => {
      if (!mealCategorySelected || mealCategorySelected !== target.value) {
        setMealCategorySelected(target.value);
      }
      if (mealCategorySelected === target.value) {
        setMealCategorySelected('');
        setFoods(foodsAPI);
      }
    },
    [setMealCategorySelected, foodsAPI, mealCategorySelected],
  );

  const handleClickDrinkCategory = useCallback(
    ({ target }) => {
      if (!drinkCategorySelected || drinkCategorySelected !== target.value) {
        setDrinkCategorySelected(target.value);
      }
      if (drinkCategorySelected === target.value) {
        setDrinkCategorySelected('');
        setDrinks(drinksAPI);
      }
    },
    [setDrinkCategorySelected, drinksAPI, drinkCategorySelected],
  );

  const appContext = useMemo(
    () => ({
      email,
      handleEmailChange,
      password,
      handlePasswordChange,
      enableFormButt,
      title,
      setTitle,
      showIcon,
      setShowIcon,
      foods,
      setFoods,
      drinks,
      setDrinks,
      foodsAPI,
      drinksAPI,
      clearInputs,
      drinksCategoryList,
      mealsCategoryList,
      handleClickMealCategory,
      handleClickDrinkCategory,
    }),
    [
      email,
      handleEmailChange,
      password,
      handlePasswordChange,
      enableFormButt,
      title,
      setTitle,
      showIcon,
      setShowIcon,
      foods,
      drinks,
      setDrinks,
      foodsAPI,
      drinksAPI,
      clearInputs,
      drinksCategoryList,
      mealsCategoryList,
      handleClickMealCategory,
      handleClickDrinkCategory,
    ],
  );

  return <Context.Provider value={ appContext }>{children}</Context.Provider>;
}

Provider.propTypes = {
  children: PropTypes.node.isRequired,
};

export default Provider;
