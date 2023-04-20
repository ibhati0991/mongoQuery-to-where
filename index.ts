// Import stylesheets
import './style.css';

function mongoToSqlWhere(mongoQuery): string {
  const sqlClauses: string[] = [];

  for (const [key, value] of Object.entries(mongoQuery)) {
    switch (key) {
      case '$and':
        const andConditions = value.map((val) => mongoToSqlWhere(val));
        sqlClauses.push(`(${andConditions.join(' AND ')})`);
        break;
      case '$or':
        const orConditions = value.map((val) => mongoToSqlWhere(val));
        sqlClauses.push(`(${orConditions.join(' OR ')})`);
        break;
      default:
        if (typeof value === 'object') {
          for (const [op, val] of Object.entries(value)) {
            switch (op) {
              case '$eq':
                sqlClauses.push(`data @> '{"${key}": ${JSON.stringify(val)}}'`);
                break;
              case '$ne':
                sqlClauses.push(
                  `NOT (data @> '{"${key}": ${JSON.stringify(val)}}')`
                );
                break;
              case '$gt':
                sqlClauses.push(`(data->>'${key}')::numeric > ${val}`);
                break;
              case '$gte':
                sqlClauses.push(`(data->>'${key}')::numeric >= ${val}`);
                break;
              case '$lt':
                sqlClauses.push(`(data->>'${key}')::numeric < ${val}`);
                break;
              case '$lte':
                sqlClauses.push(`(data->>'${key}')::numeric <= ${val}`);
                break;
              default:
                throw new Error(`Invalid operator: ${op}`);
            }
          }
        } else {
          sqlClauses.push(`data @> '{"${key}": "${value}"}'`);
        }
        break;
    }
  }

  return sqlClauses.length > 0 ? `WHERE ${sqlClauses.join(' AND ')}` : '';
}

// Write TypeScript code!
const condition = {
  $or: [
    {
      date_occurred: {
        $gte: 10,
        $lte: 20,
      },
    },
    {
      date_occurred: {
        $gte: 30,
        $lte: 40,
      },
    },
    { name: 'tarun' },
  ],
  age: {
    $gte: 15,
    $lte: 18,
  },
};
const appDiv: HTMLElement = document.getElementById('app');
appDiv.innerHTML = mongoToSqlWhere(condition);
