import { listDogs, getDog, getOwner, getDogsForOwner, listOwners, createDog, deleteDog, createOwner, deleteOwner } from './db';
import { Owner, Dog } from './typedefs';

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
    dog: (_: any, { id }: ID) => getDog(id),
    owners: () => listOwners(),
    owner: (_: any, { id }: ID) => getOwner(id)
  },

  Mutation: {
    createDog: async (_: any, { name, ownerId }: InpDog) => {
      // get Owner
      let owner;
      try {
        owner = await getOwner(ownerId);
      } catch (err) {
        console.error(err);
        throw new Error('Something went wrong');
      }
      if (!owner) {
        throw new Error('Owner does not exist');
      }
      try {
        const newDog = await createDog(name, ownerId)
        return newDog;
      } catch (err) {
        console.error(err);
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