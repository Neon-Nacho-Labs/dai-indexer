/*

    ___  ___   _____________
   / _ )/ _ | / __/  _/ ___/
  / _  / __ |_\ \_/ // /__
 /____/_/ |_/___/___/\___/


*/

/****************************************************************************************************************
 * A) Please write a function that sorts 11 small numbers (<100) as fast as possible.
 * Once written, provide an estimate for how long it would take to execute that function 10 Billion (10^10) times on a normal machine.
 ****************************************************************************************************************/

/*
Insertion sort is generally thought to be a very fast algorithm for sorting small arrays of integers,
even though it isn't the fastest general purpose sorting algorithm (on average O(n^2)).

In my tests on a normal machine, executing the function 10 billion times took around 30 minutes.
This is based on multiple tests of shorter runs where it generally scaled linearly the more times it was exectuted
and so could be predictable when executed more times – as well as one full run of 10 billion exectutions.
*/

/**
 * A basic insertion sort algorithm.
 * This works in-place on the original object/array.
 *
 * @param {Array} inputArray The input array to sort.
 */
 function insertionSort(inputArray) {
    for(let i = 1; i < inputArray.length; i++) {
        let current = inputArray[i];
        let j = i - 1;

        while(j >= 0 && inputArray[j] > current) {
            inputArray[j + 1] = inputArray[j];
            j--;
        }
        inputArray[j+1] = current;
    }
}

/*
let myArray = Array(11).fill(0).map(() => Math.floor(Math.random() * 100));
console.log(myArray);
insertionSort(myArray);
console.log(myArray);

output:
[
    38, 86, 98, 69, 14,
    11, 55, 98, 52,  1,
    63
]
[
    1, 11, 14, 38, 52,
    55, 63, 69, 86, 98,
    98
]
*/

/****************************************************************************************************************
 * B) Please make improvements to the code below, using Javascript.
 * If you are making any assumptions about how the code functions please make note of them.
 ****************************************************************************************************************/

/*
Changes made:
- Use async/await instead of nested then() calls for better readablility and simplicity.
- Wrap in an async function.
- Get rid of the call to getUserSettings() - settings isn't being used anywhere.
- Call notifyAdmins without it being dependent on notifyUser - that seems unnecessary. notifyAdmins() should probably always be called on role change.
- Pass user.id and newRole to notifyAdmins – we should probably include those in the notification to the admins (requires refactor of notifyAdmins()).
- Pass newRole to notifyUser – we should probably include that in the notifcation to the user (requires refactor of notifyUser()).
- Return early on failure.
- Consistent use of quote style.
- Add missing semicolons;
- Use constants for ADMIN_ROLE and USER_ROLE_UPDATED (requires them being defined somewhere).
- Add error handling with try/catch.

Assumptions:
- getUserSettings() doesn't have some side effect that makes the call necessary, and it purely does just get user settings.
- notifyAdmins() doesn't need to rely on notifyUser() being called first.
*/

async function updateUserRole(email, newRole) {
    try {
        const database = await connectToDatabase();
        const user = await getUser(database, email);
        const success = await setRole(database, user?.id, newRole);
        if (!success) {
            return false;
        }

        notifyUser(user.id, newRole, USER_ROLE_UPDATED);
        notifyAdmins(user.id, newRole, USER_ROLE_UPDATED);
    } catch (error) {
        // do something on error if needed
    }

	return true;
}

updateUserRole("email@email.com", ADMIN_ROLE).then(() => {
	// do something else when complete if needed
});