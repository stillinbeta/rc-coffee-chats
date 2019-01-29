import {
  filterForUniqueMatches,
  filterForPrevMatches
} from './matchingHelperFn';
import { IUser, IpastMatchObj, prevMatch } from './matching-algo';

// const currUser: IUser = Object.freeze({
//   email: 'test@rc.com',
//   full_name: 'test email',
//   prevMatches: []
// });
describe('match-algo-helper-fn: filterForUniqueMatches', () => {
  it('should return not return any users if no available users', () => {
    const prevMatches: prevMatch[] = [];
    const poolOfAvailableUsers: IUser[] = [];

    const received = filterForUniqueMatches(prevMatches, poolOfAvailableUsers);
    expect(received).toEqual([]);
  });
  it('should not return any user, if only available user was a prev match', () => {
    const dateOfMatch = new Date(1);
    const userA: IUser = {
      email: 'a@rc.com',
      full_name: 'a test',
      prevMatches: [
        {
          matchDate: dateOfMatch,
          email: 'b@rc.com'
        }
      ]
    };
    const userB: IUser = {
      email: 'b@rc.com',
      full_name: 'b test',
      prevMatches: [
        {
          matchDate: dateOfMatch,
          email: 'a@rc.com'
        }
      ]
    };
    const prevMatches: prevMatch[] = userB.prevMatches; // Looking for B's unique matches
    const poolOfAvailableUsers: IUser[] = [userA];

    const received = filterForUniqueMatches(prevMatches, poolOfAvailableUsers);
    expect(received).toEqual([]);
  });

  it('should return the only available user if they were not a previous match', () => {
    const dateOfMatch = new Date(1);
    const userA: IUser = {
      email: 'a@rc.com',
      full_name: 'a test',
      prevMatches: []
    };
    const userB: IUser = {
      email: 'b@rc.com',
      full_name: 'b test',
      prevMatches: []
    };
    const prevMatches: prevMatch[] = userB.prevMatches; // prevMatches of userB
    const poolOfAvailableUsers: IUser[] = [userA];

    const received = filterForUniqueMatches(prevMatches, poolOfAvailableUsers);
    expect(received).toEqual([userA]);
  });
});

describe('match-algo-helper-fn: filterForPrevMatches', () => {
  it('should not return any users if no available users', () => {
    const prevMatches: prevMatch[] = [];
    const poolOfAvailableUsers: IUser[] = [];

    const received = filterForPrevMatches(prevMatches, poolOfAvailableUsers);
    expect(received).toEqual([]);
  });

  it('should not return any users, if the only availabe user was not a prev match', () => {
    const dateOfMatch = new Date(1);
    const userA: IUser = {
      email: 'a@rc.com',
      full_name: 'a test',
      prevMatches: []
    };
    const userB: IUser = {
      email: 'b@rc.com',
      full_name: 'b test',
      prevMatches: []
    };
    const prevMatches: prevMatch[] = userB.prevMatches; // Looking for B's unique matches
    const poolOfAvailableUsers: IUser[] = [userA];

    const received = filterForPrevMatches(prevMatches, poolOfAvailableUsers);
    expect(received).toEqual([]);
  });
  it('should return the available user if that user was a prev match', () => {
    const dateOfMatch = new Date(1);
    const userA: IUser = {
      email: 'a@rc.com',
      full_name: 'a test',
      prevMatches: [
        {
          matchDate: dateOfMatch,
          email: 'b@rc.com'
        }
      ]
    };
    const userB: IUser = {
      email: 'b@rc.com',
      full_name: 'b test',
      prevMatches: [
        {
          matchDate: dateOfMatch,
          email: 'a@rc.com'
        }
      ]
    };
    const prevMatches: prevMatch[] = userB.prevMatches; // Looking for B's unique matches
    const poolOfAvailableUsers: IUser[] = [userA];

    const received = filterForPrevMatches(prevMatches, poolOfAvailableUsers);
    expect(received).toEqual([userA]);
  });
  // it('should not be able to return any one outside of the available users if that user was a prev match', () => {});
});
