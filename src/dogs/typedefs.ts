import { gql } from "apollo-server-lambda";

export const typeDefs = gql`
  type Dog {
    id: Int!
    name: String!
    owner: Owner!
  }

  type Owner {
    id: Int!
    firstname: String!
    lastname: String!
    dogs: [Dog]!
  }

  type Query {
    dogs: [Dog]!
    dog(id: Int!): Dog!
    owners: [Owner]!
    owner(id: Int!): Owner!
  }

  type Mutation {
    createDog(
      name: String!
      ownerId: Int!
    ): Dog
    deleteDog(
      id: Int!
    ): Dog
    
    createOwner(
      firstname: String!
      lastname: String!
    ): Owner
    deleteOwner(
      id: Int!
    ): Owner
  }
`;


export type Owner = {
  id: number
  firstname: string
  lastname: string
};

export type Dog = {
  id: number
  name: string
  owner_id: number
};

export class NoOwnerError extends Error {
  constructor(...params:any[]) {
    // Pass remaining arguments (including vendor specific ones) to parent constructor
    super(...params)

    // Maintains proper stack trace for where our error was thrown (only available on V8)
    if (Error.captureStackTrace) {
      Error.captureStackTrace(this, NoOwnerError);
    }

    this.name = 'NoOwnerError';
  }
}