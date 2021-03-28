import oracledb from 'oracledb';
import { Owner, Dog } from './typedefs';

// ---- MySQL Setup ---- //
const createConnection = () => {
  return oracledb.getConnection({
    user: process.env.NODE_ORACLEDB_USER,
    password: process.env.NODE_ORACLEDB_PASSWORD,
    connectString: process.env.NODE_ORACLEDB_CONNECTIONSTRING,
    externalAuth: false
  });
}

async function executeQuery<T>(query: string): Promise<T[] | undefined> {
  const connection = await createConnection();

  const binds = {};
  // For a complete list of options see the documentation.
  const options = {
    outFormat: oracledb.OUT_FORMAT_OBJECT,   // query result format
    // extendedMetaData: true,               // get extra metadata
    // prefetchRows:     100,                // internal buffer allocation size for tuning
    // fetchArraySize:   100                 // internal buffer allocation size for tuning
    autoCommit: true,
  };

  const results = await connection.execute<T>(query, binds, options);
  // console.log(results.rows);
  await connection.close();
  return results.rows;
}

async function executeQueryWithParams<T>(query: string, binds: Array<any>, bindDefs: Array<any>): Promise<T[] | undefined> {
  const connection = await createConnection();
  const options = {
    outFormat: oracledb.OUT_FORMAT_OBJECT,
    autoCommit: true,
    // batchErrors: true,  // continue processing even if there are data errors
    bindDefs
  };
  const results = await connection.execute<T>(query, binds, options);
  // console.log(results.rows);
  await connection.close();
  return results.rows;
}

// --- Repositories ---- //

// -- Dogs -- //
export const listDogs = async (): Promise<Dog[] | undefined> => {
  const query = 'SELECT ID "id", NAME "name", OWNER_ID "owner_id" from dogs';
  try {
    return await executeQuery<Dog>(query);
  } catch (error) {
    console.error(error);
    throw new Error('unable to access database');
  }
}

export const getDog = async (id: number): Promise<Dog | undefined> => {
  const binds = [id];
  const bindDefs = [
    { type: oracledb.NUMBER },
  ];
  const query = `SELECT ID "id", NAME "name", OWNER_ID "owner_id" FROM dogs WHERE id = :1`;
  try {
    const results = await executeQueryWithParams<Dog>(query, binds, bindDefs);
    if (!results || results.length <= 0) {
      return undefined;
    }
    console.log(results);
    return results[0];
  } catch (error) {
    console.error(error);
    throw new Error('unable to access database');
  }
}

export const getDogsForOwner = async (ownerId: number): Promise<Dog[] | undefined> => {
  const binds = [ownerId];
  const bindDefs = [
    { type: oracledb.NUMBER },
  ];
  const query = `SELECT ID "id", NAME "name", OWNER_ID "owner_id" FROM dogs WHERE owner_id = :1`;
  return await executeQueryWithParams<Dog>(query, binds, bindDefs);
}

export const createDog = async (name: string, ownerId: number): Promise<Dog | undefined> => {
  const createQuery = `INSERT INTO dogs (name, owner_id) VALUES(:1, :2)`;
  let binds = [name, ownerId];
  let bindDefs = [
    { type: oracledb.STRING, maxSize: 255 },
    { type: oracledb.NUMBER },
  ];

  await executeQueryWithParams<any>(createQuery, binds, bindDefs);

  // get last created id
  const insertedIdQuery = `SELECT ID "id" FROM dogs WHERE owner_id = :1 AND ROWNUM <= 1 ORDER BY id DESC`;
  binds = [ownerId];
  bindDefs = [
    { type: oracledb.NUMBER },
  ];
  const result = await executeQueryWithParams<Dog>(insertedIdQuery, binds, bindDefs);
  const dog = {
    name,
    owner_id: ownerId,
    id: result && result[0] !== undefined ? result[0].id : 0
  };
  return dog;
}

export const deleteDog = async (id: number) => {
  const binds = [id];
  const bindDefs = [
    { type: oracledb.NUMBER },
  ];
  const query = `DELETE FROM dogs WHERE id = :1`;
  await executeQueryWithParams<any>(query, binds, bindDefs);
}

// -- Owners -- //

export const createOwner = async (firstname: string, lastname: string): Promise<Owner | undefined> => {
  const createQuery = `INSERT INTO owners (firstname, lastname) VALUES(:1, :2)`;
  const binds = [firstname, lastname];
  const bindDefs = [
    { type: oracledb.STRING, maxSize: 255 },
    { type: oracledb.STRING, maxSize: 255 },
  ];

  await executeQueryWithParams<any>(createQuery, binds, bindDefs);

  // get last created id
  const insertedIdQuery = `SELECT ID "id" from owners WHERE ROWNUM <= 1 ORDER BY id DESC`;
  const result = await executeQuery<Owner>(insertedIdQuery);
  const owner = {
    firstname, lastname,
    id: result && result[0] !== undefined ? result[0].id : 0
  };
  return owner;
}

export const deleteOwner = async (id: number) => {
  const binds = [id];
  const bindDefs = [
    { type: oracledb.NUMBER },
  ];
  const query = `DELETE FROM owners WHERE id = :1`;
  await executeQueryWithParams<any>(query, binds, bindDefs);
}

export const listOwners = async (): Promise<Owner[] | undefined> => {
  const query = 'SELECT ID "id", FIRSTNAME "firstname", LASTNAME "lastname" FROM owners';
  return await executeQuery<Owner>(query);
}

export const getOwner = async (id: number): Promise<Owner | undefined> => {
  const binds = [id];
  const bindDefs = [
    { type: oracledb.NUMBER },
  ];
  const query = `SELECT ID "id", FIRSTNAME "firstname", LASTNAME "lastname" from owners where id = :1`;
  const results = await executeQueryWithParams<Owner>(query, binds, bindDefs);
  if (!results || results.length <= 0) {
    return undefined;
  }
  return results[0];
}