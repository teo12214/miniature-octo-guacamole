#! /bin/bash
NUMBER=$(($RANDOM % 1000))
PSQL="psql --username=freecodecamp --dbname=number_guessing_game -t --no-align -c"
echo -e "\nNumber guessing game\n"

ENTER_NAME() {
  echo Enter your username:
  read USERNAME
}

ENTER_NAME

if [[ -z $USERNAME ]]
then
  ENTER_NAME
fi

USER_ID=$($PSQL "SELECT user_id FROM users WHERE username = '$USERNAME'")
if [[ -z $USER_ID ]]
then
  #create user
  echo Welcome, $USERNAME! It looks like this is your first time here.
  INSERT_USER_RESULT=$($PSQL "INSERT INTO users(username) VALUES('$USERNAME')")
  USER_ID=$($PSQL "SELECT user_id FROM users WHERE username = '$USERNAME'")
else
  GAMES_PLAYED=$($PSQL "SELECT COUNT(game_id) FROM games WHERE user_id = $USER_ID")
  BEST_GAME=$($PSQL "SELECT MIN(guesses) FROM games WHERE user_id = $USER_ID")
  echo Welcome back, $USERNAME! You have played $GAMES_PLAYED games, and your best game took $BEST_GAME guesses.
fi

echo -e "Guess the secret number between 1 and 1000:"
echo $NUMBER
WON=FALSE
GUESSES=0
while [[ $WON = FALSE ]]
do
  read GUESS
  if [[ ! $GUESS =~ ^[0-9]+$ ]]
  then
    echo That is not an integer, guess again:
  elif [[ $GUESS = $NUMBER ]]
  then
    ((GUESSES++))
    echo You guessed it in $GUESSES tries. The secret number was $NUMBER. Nice job!
    WON=TRUE
    #insert game results
    INSERT_GAME_RESULT=$($PSQL "INSERT INTO games(user_id, guesses) VALUES($USER_ID, $GUESSES)")
  elif [[ $GUESS > $NUMBER ]]
  then
    echo "It's lower than that, guess again:"
    ((GUESSES++))
  elif [[ $GUESS < $NUMBER ]]
  then
    echo "It's higher than that, guess again:"
    ((GUESSES++))
  fi
done