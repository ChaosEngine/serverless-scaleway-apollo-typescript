import {
  listDogs, getDog, getOwner, getDogsForOwner, listOwners, createDog, deleteDog, createOwner, deleteOwner
} from './db';
import { Owner, Dog, NoOwnerError } from './typedefs';

type ID = {
  id: number
};
type InpDog = {
  name: string
  ownerId: number
};
type InpOwner = {
  firstname: string
  lastname: string
};

export const resolvers = {
  Query: {
    dogs: () => listDogs(),
    dog: async (_: any, { id }: ID) => {
      let res;
      try {
        res = await getDog(id);
      } catch (err) {
        console.error(err);
        throw new Error('Something went wrong');
      }
      if (!res) {
        throw new Error('Dog does not exist');
      }
      return res;
    },
    owners: () => listOwners(),
    owner: async (_: any, { id }: ID) => {
      let res;
      try {
        res = await getOwner(id);
      } catch (err) {
        console.error(err);
        throw new Error('Something went wrong');
      }
      if (!res) {
        throw new Error('Owner does not exist');
      }
      return res;
    }
  },

  Mutation: {
    createDog: async (_: any, { name, ownerId }: InpDog) => {
      try {
        const newDog = await createDog(name, ownerId);
        return newDog;
      } catch (err) {
        console.error(err);
        if (err instanceof NoOwnerError)
          throw new Error('Owner does not exist');
        else
          throw new Error('Something went wrong');
      }
    },

    deleteDog: async (_: any, { id }: ID) => {
      let dog;
      try {
        dog = await getDog(id);
      } catch (err) {
        console.error(err);
        throw new Error('Something went wrong');
      }
      if (!dog) {
        throw new Error('Dog does not exist');
      }
      try {
        await deleteDog(dog.id);
      } catch (error) {
        console.error(error);
        throw new Error('Something went wrong');
      }
      return dog;
    },

    createOwner: async (_: any, { firstname, lastname }: InpOwner) => {
      // get Owner
      try {
        const owner = await createOwner(firstname, lastname);
        return owner;
      } catch (err) {
        console.error(err);
        throw new Error('Something went wrong');
      }
    },

    deleteOwner: async (_: any, { id }: ID) => {
      let owner;
      try {
        owner = await getOwner(id);
      } catch (err) {
        console.error(err);
        throw new Error('Something went wrong');
      }
      if (!owner) {
        throw new Error('Owner does not exist');
      }
      try {
        await deleteOwner(owner.id);
      } catch (error) {
        console.error(error);
        throw new Error('Something went wrong');
      }
      return owner;
    },
  },

  Dog: {
    owner: (dog: Dog) => getOwner(dog.owner_id)
  },

  Owner: {
    dogs: (owner: Owner) => getDogsForOwner(owner.id)
  }
}