#! /bin/bash
PSQL="psql --username=freecodecamp --dbname=periodic_table -t --no-align -c"
#check argument
if [[ -z $1 ]]
then
#if not found
  #error
  echo Please provide an element as an argument.
else
#if found
  #check atomic_number
  #check if argument is a number
  if [[ $1 =~ ^[0-9]+$ ]]
  then
    ATOMIC_NUMBER=$($PSQL "SELECT atomic_number FROM elements WHERE atomic_number = $1")
  fi
  if [[ -z $ATOMIC_NUMBER ]]
  then
  #if not found
    #check name
    ATOMIC_NUMBER=$($PSQL "SELECT atomic_number FROM elements WHERE name = '$1'")
    if [[ -z $ATOMIC_NUMBER ]]
    then
    #if not found
      #check symbol
      ATOMIC_NUMBER=$($PSQL "SELECT atomic_number FROM elements WHERE symbol = '$1'")
      if [[ -z $ATOMIC_NUMBER ]]
      then
      #if not found
        #error
        echo I could not find that element in the database.
      fi
    fi
  fi
  #get element data
  if [[ ! -z $ATOMIC_NUMBER ]]
  then
    ELEMENT_DATA=$($PSQL "SELECT atomic_number, name, symbol, type, atomic_mass, melting_point_celsius, boiling_point_celsius FROM properties INNER JOIN elements USING(atomic_number) INNER JOIN types USING(type_id) WHERE atomic_number = $ATOMIC_NUMBER")
    #display element data
    echo $ELEMENT_DATA | while IFS="|" read ATOMIC_NUMBER NAME SYMBOL TYPE ATOMIC_MASS MELTING_POINT BOILING_POINT
    do
      echo "The element with atomic number $ATOMIC_NUMBER is $NAME ($SYMBOL). It's a $TYPE, with a mass of $ATOMIC_MASS amu. $NAME has a melting point of $MELTING_POINT celsius and a boiling point of $BOILING_POINT celsius."
    done
  fi
fi