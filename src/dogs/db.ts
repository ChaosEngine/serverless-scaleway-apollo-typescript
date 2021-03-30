import oracledb from 'oracledb';
import { Owner, Dog, NoOwnerError } from './typedefs';

// ---- MySQL Setup ---- //
const createConnection = () => {
  console.info("new conn");
  return oracledb.getConnection({
    user: process.env.NODE_ORACLEDB_USER,
    password: process.env.NODE_ORACLEDB_PASSWORD,
    connectString: process.env.NODE_ORACLEDB_CONNECTIONSTRING,
    externalAuth: false
  });
}

async function executeQuery<T>(query: string): Promise<T[] | undefined> {
  const connection = await createConnection();
  try {
    console.info(`new query => ${query}`);
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
    return results.rows;
  }
  finally {
    await connection.close();
  }
}

async function executeQueryWithParams<T>(query: string, binds: Array<any>, bindDefs: Array<any>): Promise<oracledb.Result<T> | undefined> {
  const connection = await createConnection();
  try {
    console.info(`new query with params ${query}`);
    const options = {
      outFormat: oracledb.OUT_FORMAT_OBJECT,
      autoCommit: true,
      // batchErrors: true,  // continue processing even if there are data errors
      bindDefs
    };
    const results = await connection.execute<T>(query, binds, options);
    // console.log(results.rows);
    return results;
  }
  finally {
    await connection.close();
  }
}

async function executeQueryReturningDml<T>(query: string, parameters: any): Promise<oracledb.Result<T> | undefined> {
  const connection = await createConnection();
  try {
    console.info(`new query with params ${query}`);
    const result = await connection.execute<T>(query, parameters,
      {
        autoCommit: true,
      });
    // console.log(results.rows);
    return result;
  }
  finally {
    await connection.close();
  }
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
    if (!results || !results.rows || results.rows?.length <= 0) {
      return undefined;
    }
    // console.log(results);
    return results.rows[0];
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
  const result = await executeQueryWithParams<Dog>(query, binds, bindDefs);
  return result?.rows;
}

export const createDog = async (name: string, ownerId: number): Promise<Dog | undefined> => {
  // const createQuery = `INSERT INTO dogs (name, owner_id) VALUES(:name, :owner_id) RETURNING id INTO :id`;
  const createQuery = `
      DECLARE
				oid NUMBER;
			BEGIN
        BEGIN
          SELECT o.id
          INTO oid
          FROM owners o
          WHERE o.id = :owner_id;
        EXCEPTION
          When no_data_found then
          oid := -1;
        END;
			
				IF ( oid > -1 ) THEN
          INSERT INTO dogs (name, owner_id) VALUES(:name, oid) RETURNING id INTO :new_id;
				END IF;
			END;
  `;
  const result = await executeQueryReturningDml<any>(createQuery,
    {
      owner_id: { type: oracledb.NUMBER, val: ownerId },
      name: { type: oracledb.STRING, val: name },
      new_id: { type: oracledb.NUMBER, dir: oracledb.BIND_OUT },
    });
  //console.log(result?.outBinds);
  const new_id = result && result.outBinds ? result.outBinds.new_id : undefined;
  if (!new_id || new_id <= -1)
    throw new NoOwnerError();
  const dog = {
    name,
    owner_id: ownerId,
    id: new_id
  };
  return dog;
}

export const deleteDog = async (id: number) => {
  const binds = [id];
  const bindDefs = [
    { type: oracledb.NUMBER },
  ];
  const query = `DELETE FROM dogs WHERE id = :1`;
  const result = await executeQueryWithParams<any>(query, binds, bindDefs);
  return result?.rows;
}

// -- Owners -- //

export const createOwner = async (firstname: string, lastname: string): Promise<Owner | undefined> => {
  const createQuery = `INSERT INTO owners (firstname, lastname) VALUES(:firstname, :lastname) RETURNING id INTO :id`;
  const result = await executeQueryReturningDml<any>(createQuery,
    {
      firstname: { type: oracledb.STRING, val: firstname },
      lastname: { type: oracledb.STRING, val: lastname },
      id: { type: oracledb.NUMBER, dir: oracledb.BIND_OUT },
    });
  const owner = {
    firstname, lastname,
    id: result && result.outBinds ? result.outBinds.id[0] : 0
  };
  return owner;
}

export const deleteOwner = async (id: number) => {
  const binds = [id];
  const bindDefs = [
    { type: oracledb.NUMBER },
  ];
  const query = `DELETE FROM owners WHERE id = :1`;
  const result = await executeQueryWithParams<any>(query, binds, bindDefs);
  return result?.rows;
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
  if (!results || !results.rows || results.rows.length <= 0) {
    return undefined;
  }
  return results.rows[0];
}