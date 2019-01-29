import { IUser, IpastMatchObj } from './matching-algo';
import { deepClone } from '../utils/clone';
import {
  filterForUniqueMatches,
  filterForPrevMatches,
  sortByOldestMatch,
  findAndRemoveUserFromPool
} from './matchingHelperFn';

// interface IUserMatchedObj extends IUser {
//   hasBeenMatched:boolean
//   // ==== Proposed Data Structure ===
//   // potentialMatches, can be segmeneted pools with priority (first see if they're in the first batch, oh no? then the next pool? etc. etc. )
//   // potentialMatches: {
//   // newMatch: IUser[]
//   // prevMatch: IUser[] // sorted by date
//   // }
// }
// INPUT: IUser
// OUTPUT: user name and email, to easily pass off to zulip API sendMessage
// NOTE: for database, need primary keys for users, new table for matches (foreign key),
// interface IUser: is the result of search our new db, and not zulip stream API shit

export function makeMatches(
  usersToMatch: IUser[],
  fallBackUser: IUser
): Array<[IUser, IUser]> {
  const matchedPairs = [];
  let poolAvailableUsers = deepClone(usersToMatch);
  // TODO: sort pool of Available users by user with the most # of prev matches

  while (poolAvailableUsers.length > 1) {
    let otherMatch: IUser;
    const currUnMatchedUser = poolAvailableUsers.shift(); // filter this out && return clone
    const { email, prevMatches } = currUnMatchedUser;

    // get all potential users they can match with (All the users )
    const possibleNewMatches = filterForUniqueMatches(
      prevMatches,
      poolAvailableUsers
    );

    // Ideal Case: Try to first match with a new person
    if (possibleNewMatches.length !== 0) {
      const i = Math.floor(Math.random() * possibleNewMatches.length);
      otherMatch = possibleNewMatches[i];
    } else {
      // 2nd Case: No available new matches for this user, so find the least recent match they had:
      const possiblePrevMatches = filterForPrevMatches(
        prevMatches,
        poolAvailableUsers
      );
      const sortedPrevMatches = sortByOldestMatch(possiblePrevMatches, email);

      if (sortedPrevMatches.length === 0) {
        throw new Error(
          `Cannot match a user if they do not have any prevMatches`
        );
      }

      otherMatch = sortedPrevMatches[0];
    }

    // filter otherMatch out of poolAvailableUsers
    poolAvailableUsers = findAndRemoveUserFromPool(
      otherMatch.email,
      poolAvailableUsers
    );
    matchedPairs.push([currUnMatchedUser, otherMatch]);
  }
  // Special Case: Odd number of people in pool, then match last user
  // with fallback person:
  if (poolAvailableUsers.length === 1) {
    const lastUnMatchedUser = poolAvailableUsers[0];
    matchedPairs.push([lastUnMatchedUser, fallBackUser]);

    return matchedPairs;
  }

  return matchedPairs;
}

export function _prevMatchingAlgo(
  emails: string[],
  pastMatches: IpastMatchObj[],
  oddNumberBackupEmails = ['oddEmail@rc.com']
): Array<[string, string]> {
  // Note: having the shuffling outside of matching algorithm will allow us to test
  // const unmatchedEmails = shuffle(emails);
  const unmatchedEmails = emails; //
  const newMatches = [];

  while (unmatchedEmails.length > 0) {
    const currentEmail = unmatchedEmails.shift();
    const pastMatchedEmails = pastMatches
      .filter(
        match => match.email1 === currentEmail || match.email2 === currentEmail
      ) // filter to current email's matches
      .sort((a, b) => Number(new Date(a.date)) - Number(new Date(b.date))) // sort oldest to newest, so if there is a conflict we can rematch with oldest first
      .map(match =>
        match.email1 === currentEmail ? match.email2 : match.email1
      ) // extract only the other person's email out of the results (drop currentEmail and date)
      // tslint:disable-next-line
      .filter(email => unmatchedEmails.includes(email)) // remove past matches who are not looking for a match today or who already got matched
      .filter((value, index, self) => self.indexOf(value) === index); // uniq emails // TODO: this should be a reduce that adds a match count to every email so we can factor that into matches

    // console.log("------- pastMatchedEmails: ");
    // console.log(pastMatchedEmails);
    // console.log("-----------------------");

    const availableEmails = unmatchedEmails.filter(
      // tslint:disable-next-line
      email => !pastMatchedEmails.includes(email)
    );

    if (availableEmails.length > 0) {
      // TODO: potentialy prioritize matching people from different batches
      newMatches.push([currentEmail, availableEmails[0]]);
      unmatchedEmails.splice(unmatchedEmails.indexOf(availableEmails[0]), 1);
    } else if (pastMatchedEmails.length > 0 && unmatchedEmails.length > 0) {
      newMatches.push([currentEmail, pastMatchedEmails[0]]);
      unmatchedEmails.splice(unmatchedEmails.indexOf(pastMatchedEmails[0]), 1);
    } else {
      // this should only happen on an odd number of emails
      // TODO: how to handle the odd person
      newMatches.push([
        currentEmail,
        oddNumberBackupEmails[
          Math.floor(Math.random() * oddNumberBackupEmails.length)
        ]
      ]);
    }
    // logger.info("<<<<<<", newMatches);
  }
  return newMatches;
}
